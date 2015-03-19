Meteor.publish('gamesList', function(gameId) {
  //console.log(gameId);
  if (gameId) {
    return Games.find({_id: gameId});
    // return Games.find(
    //   {_id: gameId}, {
    //   transform: function(doc) {
    //     for (i = 0; i < doc.grid.length; i++) {
    //       if (doc.grid[i].class === 'turned-down') {
    //         doc.grid[i].val = '';
    //         doc.grid[i].score = '';
    //       }
    //     }
    //     return doc
    //   }
    // });
  } else {
    return Games.find({});
  }
});
