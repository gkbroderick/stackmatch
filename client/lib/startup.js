Meteor.startup(function() {
  Session.set('message', 'test message');
  if (!(localStorage.getItem('sm_deviceId'))) {
    //if no sm_deviceId, then try to get it from sm_gameId
    localStorage.setItem('sm_deviceId', Devices.insert({nickname: ''}));
  }
  Session.set('deviceId', localStorage.sm_deviceId);
  Session.set('gameId', localStorage.sm_gameId);
});