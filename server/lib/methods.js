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
          Games.update(
            {_id: gameId}, 
            {$set: {'players.0.totalScore': curGameData.players[0].totalScore + thisMatch.score}, $push: {'players.0.matches': thisMatch}}
          );
        } else {
          Games.update(
            {_id: gameId}, 
            {$set: {'players.1.totalScore': curGameData.players[1].totalScore + thisMatch.score}, $push: {'players.1.matches': thisMatch}}
          );
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
