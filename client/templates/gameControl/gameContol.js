Template.GameControl.helpers ({
  gamesWaiting: function() {
    return Games.find({players: {$size: 1}});
  },

  gameInProgress: function() {
    return Session.get('gameId');
  }
});

Template.GameControl.events ({
  'click p.waiting-queue': function(evt) {
    var joinGameId = event.target.id
    Games.update({_id: joinGameId}, {$addToSet: {players: {device: Session.get('deviceId'), matches: [], totalScore: 0}}});
    Session.set('gameId', joinGameId);
    localStorage.setItem('sm_gameId', joinGameId);
    Session.set('message', 'Game on! Player 2 has the first move.')
  },

  'click #newGame': function() {
    var cards = [];
    var score = 0
    for (i=1; i<=20; i++) {
      cards.push(i);
    }
    // make a random shuffle of all pairs and assign score
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
      players: [{device: localStorage.sm_deviceId, matches: [], totalScore: 0}],
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
