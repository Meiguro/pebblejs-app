// Welcome to PebbleJS!
//
// This is where you write your app.
 
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
 
 
 
var myfirstwebview = function(){
  Pebble.openURL('https://api.lockitron.com/oauth/authorize?client_id=58892dfb782b1e9afebae1b945772c23f323d257de2d1c977c120643d71cfc82&response_type=token&redirect_uri=pebblejs://close');
};
 
Pebble.addEventListener('showConfiguration', myfirstwebview); 
 
var accessToken = localStorage.accessToken;
 
Pebble.addEventListener("webviewclosed",
  function(e) {
    if (e.response === 'CANCELLED') { return; }
    console.log("Configuration window returned: " + e.response);
    accessToken = e.response.split("&")[0];
    console.log("hey look it's an accessToken: " + accessToken + "zero");
    localStorage.accessToken = accessToken;
  }
);
 
 
 
var lockitronUrl = 'https://api.lockitron.com/v2/locks';
var lockList = [];
var favouriteLock = 0;
 
// menu setup functions
 
var loadState = function() {
  console.log('Loading State!');              
  var savedLockList = localStorage.lockList;
  if (savedLockList !== null) {
    lockList = savedLockList;
    favouriteLock = localStorage.favouriteLock;
  }
};
 
var saveState = function() {
  localStorage.lockList = lockList;
  localStorage.favouriteLock = favouriteLock;
};  
 
var deleteState = function() {
  localStorage.locklist = null;
  lockList = [];
  favouriteLock = 0;
};
 
// get list of locks
var requestLocks = function() {
  console.log('requesting locks!');
  var url = lockitronUrl + "?" + accessToken;
  var statusCard = new UI.Card({title: 'Getting locks...'});
  statusCard.show();
  console.log("requesting locks url: " + url);
  
  ajax({ url: url, type: 'json', method: 'get'}, function(data) {
    lockList = [];
    console.log("data.length " + data.length);
    for (var i = 0, ii = data.length; i < ii; ++i) {
      lockList[i] = {
        name: data[i].name,
        id: data[i].id,
      };
    console.log("lock name: " + lockList[i].name + " lock id: " + lockList[i].id);
    }
    saveState();
    statusCard.hide();
  });
};
 
// Control locks
var controlLock = function(lock, action) {
  var url = lockitronUrl + '/' + lock.id + '?' + accessToken + '&state=' + action;
  var statusCard = new UI.Card({subtitle: 'Trying to ' + action + ' ' + lock.name });
  statusCard.show();
  console.log("control lock url: " + url);
  ajax({ url: url, type: 'json', method: 'put'}, function(data) {
    statusCard.hide();
    var card = new UI.Card( { subtitle: 'success' } );
    card.show();
  });
};
 
 
                
// starting pebble.js                
 
var menu = new UI.Menu();
menu.items(0, [ { title: 'Getting Locklist' }, { title: 'toggle favourite' }, {title: 'Delete locks'}, {title: 'print locklist'}, {title: 'select favourite'} ]);
menu.show();
 
 
console.log("accessToken = " + accessToken);
 
 
menu.on('select', function(e) {
  console.log("Menu item clicked: " + e.item);
  if (e.item == '0') {
    requestLocks();
  }
  if (e.item == '1') {
    console.log( "favourite lock: " + lockList[favouriteLock].name + ' id: ' + lockList[favouriteLock].id);
    controlLock( lockList[favouriteLock], 'toggle');
  }
  if (e.item == '2') {
    deleteState();
  }
  if (e.item == '3') {
    console.log('printing lockList from localStorage');
    for (var i = 0, ii = lockList.length; i < ii; ++i) {
      lockList[i] = {
        name: lockList[i].name,
        id: lockList[i].id,
      };
    console.log("lock name: " + lockList[i].name + " lock id: " + lockList[i].id);
    }
  }
  if (e.item == '4') {
    var statusCard = new UI.Card({title: 'Making list...'});
    statusCard.show();
    setTimeout(showFavourites,400);
  }
});
 
var showFavourites = function() {
  var favouritesMenu = new UI.Menu();
  for (var y = 0, yy = lockList.length; y < yy; ++y) {
    favouritesMenu.item(0, y, {title: lockList[y].name});
  }
  favouritesMenu.show();
  favouritesMenu.on('select', function(e) {
    favouriteLock = e.item;
  });
};
 
 
var Accel = require('ui/accel');
Accel.init();
 
Accel.on('tap', function(e) {
  console.log('Tap event on axis: ' + e.axis + ' and direction: ' + e.direction);
  if (e.axis === 'x'){
    controlLock( lockList[0], 'unlock');
  }
  if (e.axis === 'y'){
    controlLock( lockList[0], 'lock');
  }
  
  if (e.axis === 'z' && e.direction > 0 ){
    controlLock( lockList[0], 'unlock');
  }
  if (e.axis === 'z' && e.direction < 0 ){
    controlLock( lockList[0], 'lock');
  }
});
