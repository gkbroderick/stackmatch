Games = new Meteor.Collection('games');
Players = new Meteor.Collection('players');
Devices = new Meteor.Collection('devices');

if (Meteor.isClient) {
  
  Meteor.startup(function() {
    if (!(localStorage.getItem('deviceId'))) {
      //if no deviceId, then try to get it from gameId
      localStorage.setItem('deviceId', Devices.insert({nickname: ''}));
    }
    Session.set('deviceId', localStorage.deviceId);
    Session.set('gameId', localStorage.gameId);
  });

  Template.GameControl.helpers ({
    gamesWaiting: function() {
      return Games.find({players: {$size: 1}});
    },

    gameInProgress: function() {
      return Session.get('gameId');
    }
  });
  
  Template.GameControl.events ({
    'dblclick p.waiting-queue': function(evt) {
      var joinGameId = event.target.id
      Games.update({_id: joinGameId}, {$addToSet: {players: Session.get('deviceId')}});
      Session.set('gameId', joinGameId);
      localStorage.setItem('gameId', joinGameId);
    },

    'click #newGame': function() {
      var cards = [];
      for (i=1; i<=20; i++) {
        cards.push(i);
      }
      // make a random shuffle of all pairs
      var cardsDbl = cards.concat(cards);
      var cardsObj = shuffle(cardsDbl).map(function(value, index) {
        return {'idx': index, 'val': value, 'class': 'turned-down'};
      });
      
      // initialize new game entry in db
      localStorage.setItem('gameId', Games.insert({
        grid: cardsObj,
        players: [localStorage.deviceId],
        timestamp: Date.now()
      }));
      Session.set('gameId', localStorage.gameId);
    },
    
    'click #leaveGame': function() {
      var conf = window.confirm('Really? End this game?');
      if (conf == true) {
        Meteor.call('removeMyGames', Session.get('gameId'), Session.get('deviceId'));
        Session.set('gameId', '');
        localStorage.setItem('gameId', '');
      }

    }
  });
  
  Template.Grid.helpers ({
    shuffledCards: function() {
      if (Session.get('gameId')) {
        var curGameId = Session.get('gameId');
        var game = Games.findOne({_id: curGameId});
        if (game) return game.grid;
        return false;
      }
    }
  });

  Template.Grid.events({
    'click li': function(evt) {
      var cardIdx = event.target.id;
      var cardVal = 
      //Games.update({_id: Session.get('gameId')}, {$set:{grid.cardIdx.class: 'turned-up'}})
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  
  Meteor.methods ({
    removeMyGames: function(gameId, deviceId) {
      //only remove games initiated by the user
      Games.remove({
        _id: gameId,
        'players.0': deviceId
      })
    }
  })
}


function shuffle(array) {
  //based on Fisher-Yates shuffle algorithm
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

 return array;
}


