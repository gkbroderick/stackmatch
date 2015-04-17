Template.GameControl.helpers ({
  gamesWaiting: function() {
    var gameList = Games.find({players: {$size: 1}}).fetch();
    if (gameList.length > 0) {
      return gameList;
    }
  },

  gameInProgress: function() {
    return Session.get('gameId');
  }
});

Template.GameControl.events ({
  'click p.waiting-queue': function(evt) {
    var joinGameId = evt.target.id;

    Games.update(
      {_id: joinGameId},
      {$addToSet: {players: {device: Session.get('deviceId'), matches: [], totalScore: 0, deviceName: 'Green'}}},
      function(err, res) {
        Session.set('gameId', joinGameId);
        localStorage.setItem('sm_gameId', joinGameId);
      }
    );
  },

  'submit #new-game-form': function(evt) {
    evt.preventDefault();
    var gameSize = evt.target.gameSize.value;
    Meteor.call('newGame', Session.get('deviceId'), gameSize, function(err, res) {
      var newGameId = res;
      Session.set('gameId', newGameId);
      localStorage.setItem ('sm_gameId', Session.get('gameId'));
    });
  },
  
  'click #leaveGame': function(evt) {
    var conf = window.confirm('Really? End this game?');
    if (conf == true) {
      Meteor.call('removeMyGame', Session.get('gameId'), Session.get('deviceId'));
      Session.set('gameId', '');
      localStorage.setItem('sm_gameId', '');
    }
  },

  'click #restartGame': function(evt) {
    Meteor.call('newGame', Session.get('deviceId'), null, Session.get('gameId'), function(err, res) {
      console.log(res);
    });
  }
});
