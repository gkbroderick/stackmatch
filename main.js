Games = new Meteor.Collection('games');
Players = new Meteor.Collection('players');
Devices = new Meteor.Collection('devices');

if (Meteor.isClient) {
  
  Meteor.startup(function() {
    if (!(localStorage.getItem('sm_deviceId'))) {
      //if no sm_deviceId, then try to get it from sm_gameId
      localStorage.setItem('sm_deviceId', Devices.insert({nickname: ''}));
    }
    Session.set('deviceId', localStorage.sm_deviceId);
    Session.set('gameId', localStorage.sm_gameId);
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
      localStorage.setItem('sm_gameId', joinGameId);
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
      localStorage.setItem('sm_gameId', Games.insert({
        grid: cardsObj,
        moves: [],
        players: [localStorage.sm_deviceId],
        timestamp: new Date().toISOString()
      }));
      Session.set('gameId', localStorage.sm_gameId);
    },
    
    'click #leaveGame': function() {
      var conf = window.confirm('Really? End this game?');
      if (conf == true) {
        Meteor.call('removeMyGames', Session.get('gameId'), Session.get('deviceId'));
        Session.set('gameId', '');
        localStorage.setItem('sm_gameId', '');
      }

    }
  });
  
  Template.Grid.helpers ({
    shuffledCards: function() {
      if (Session.get('gameId')) {
        var curGameId = Session.get('gameId');
        var game = Games.findOne(curGameId, {
          transform: function(doc) {
            for (i = 0; i < doc.grid.length; i++) {
              if (doc.grid[i].class === 'turned-down') {
                doc.grid[i].val = '';
              }
            }
            return doc
          }
        });

        if (game) return game.grid;
        return false;
      }
    }
  });

  Template.Grid.events({
    'click li': function(evt) {
      var cardIdx = parseInt(event.target.id.split('-')[1]);
      Meteor.call('flipUpCard', Session.get('gameId'), cardIdx);
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
    },

    flipUpCard: function(gameId, cardIndex) {
      console.log(gameId, cardIndex);
      Games.update({_id: gameId, 'grid.idx': cardIndex}, {$set: {'grid.$.class': 'turned-up'}});
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


