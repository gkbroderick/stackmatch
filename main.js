Games = new Meteor.Collection('games');

if (Meteor.isClient) {
  
  Template.NewGame.events ({
    'click #newGame': function() {
      var cards = [];
      for (i=1; i<=20; i++) {
        cards.push(i);
      }
      var cardsDbl = cards.concat(cards);
      var cardsObj = shuffle(cardsDbl).map(function(value, index) {
        return {'idx': index, 'val': value, 'class': 'turned-down'};
      });
      localStorage.setItem('gameId', Games.insert({grid: cardsObj}));
    }
  });
  
  Template.Grid.helpers ({
    shuffledCards: function() {
      var curGameId = localStorage.gameId;
      var game = Games.findOne({_id: curGameId});
      return game.grid;
    }
  });

  Template.Grid.events({
    
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
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


