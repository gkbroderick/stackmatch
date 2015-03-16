Games = new Meteor.Collection('games');
Players = new Meteor.Collection('players');
Devices = new Meteor.Collection('devices');

if (Meteor.isClient) {
  
  Meteor.startup(function() {
    Session.set('message', 'test message');
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
      Games.update({_id: joinGameId}, {$addToSet: {players: {device: Session.get('deviceId'), matches: []}}});
      Session.set('gameId', joinGameId);
      localStorage.setItem('sm_gameId', joinGameId);
      Session.set('message', 'Game on! Challenger has first move.')
    },

    'click #newGame': function() {
      var cards = [];
      var score = 0
      for (i=1; i<=20; i++) {
        cards.push(i);
      }
      // make a random shuffle of all pairs
      var cardsDup = cards.concat(cards);
      var cardsShuffled = shuffle(cardsDup).map(function(value, index) {
        if (value < 3) {
          score = -30;
        } else if (value < 8) {
          score = 10;
        } else if (value < 13) {
          score = 15;
        } else if (value < 18) {
          score = 20;
        } else {
          score = 25;
        }
        return {'idx': index, 'val': value, 'score': score, 'class': 'turned-down'};
      });
      
      // initialize new game entry in db
      localStorage.setItem('sm_gameId', Games.insert({
        grid: cardsShuffled,
        moves: [],
        players: [{device: localStorage.sm_deviceId, matches: []}],
        timestamp: new Date().toISOString()
      }));
      Session.set('gameId', localStorage.sm_gameId);
      Session.set('message', 'Waiting for challenger to join.');
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
                doc.grid[i].score = '';
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
      var thisMove = {
        cardIdx: parseInt(event.target.id.split('-')[1]),
        turnIdx: 1,    // 1 or 2
        playerIdx: 1   // 0 or 1
      };
      var curGameData = Games.findOne({_id: Session.get('gameId')});
      //console.log(curGameData);
      var lastMove = curGameData.moves.pop();

      if (curGameData.grid[thisMove.cardIdx].class === 'turned-up') return false;

      if (typeof lastMove !== 'undefined') {
        if (lastMove.turnIdx === 2) {
          // Next player first pick
          thisMove.playerIdx = (lastMove.playerIdx) === 1 ? 0 : 1;
          thisMove.turnIdx = 1;
          Session.set('message', 'Choose a second card.')
        } else {
          // Same player second pick
          thisMove.playerIdx = lastMove.playerIdx;
          thisMove.turnIdx = 2;
        }
      }

      if (Session.get('deviceId') === curGameData.players[thisMove.playerIdx].device) {
        Session.set('message', Meteor.call('flipUpCard', Session.get('gameId'), thisMove, lastMove));
      }
    }
  });

  Template.Matches.helpers({
    yourMatches: function() {
      var me = Games.findOne({_id: Session.get('gameId')}, {
        transform: function(doc) {
          for (i = 0; i<=1; i++) {
            if (doc.players[i].device === Session.get('deviceId')) {
              return doc.players[i];
            }
          }
        }
      });
      if (me) return me.matches;
    }
  });

  Template.GameMessages.helpers({
    message: function() {
      return Session.get('message');
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
        'players.device': deviceId
      })
    },

    flipUpCard: function(gameId, thisMove, lastMove) {
      Games.update({_id: gameId, 'grid.idx': thisMove.cardIdx}, {$set: {'grid.$.class': 'turned-up player-' + thisMove.playerIdx}, $push: {moves: thisMove}});
      
      if (thisMove.turnIdx === 2) {
        curGameData = Games.findOne({_id: gameId});
        if (curGameData.grid[thisMove.cardIdx].val === curGameData.grid[lastMove.cardIdx].val) {
          var thisMatch = curGameData.grid[thisMove.cardIdx];
          if (thisMove.playerIdx === 0) {
            Games.update({_id: gameId}, {$push: {'players.0.matches': thisMatch}});
          } else {
            Games.update({_id: gameId}, {$push: {'players.1.matches': thisMatch}});
          }
          return 'Match Found'
        } else {
          Meteor.setTimeout(function() {
            Games.update({_id: gameId, 'grid.idx': thisMove.cardIdx}, {$set: {'grid.$.class': 'turned-down'}});
            Games.update({_id: gameId, 'grid.idx': lastMove.cardIdx}, {$set: {'grid.$.class': 'turned-down'}})
            return 'Not A Match';
          }, 3000)
        }
      } else {
        return 'Flip Another Card';
      }
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


