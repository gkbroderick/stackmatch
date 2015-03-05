Games = new Meteor.Collection('games');

if (Meteor.isClient) {
  Template.Grid.helpers ({
    shuffledCards: function() {
      var list = [];
      for (i=1; i<=20; i++) {
        list.push(i);
      }
      var listDbl = list.concat(list);

      return shuffle(listDbl);
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


