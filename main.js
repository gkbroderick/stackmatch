if (Meteor.isClient) {
  Template.Grid.helpers ({
    randomize: function() {
      var list = [];
      for (i=1; i<=20; i++) {
        list.push(i);
      }
      console.log(list);
      var listDbl = list.concat(list);
      console.log(listDbl);
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
 var currentIndex = array.length, temporaryValue, randomIndex ;

 // While there remain elements to shuffle...
 while (0 !== currentIndex) {

   // Pick a remaining element...
   randomIndex = Math.floor(Math.random() * currentIndex);
   currentIndex -= 1;

   // And swap it with the current element.
   temporaryValue = array[currentIndex];
   array[currentIndex] = array[randomIndex];
   array[randomIndex] = temporaryValue;
 }

 return array;
}
