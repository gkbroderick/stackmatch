Template.Matches.helpers({
  gameMatches: function() {
    var gameMatches = {};
    var curGame = Games.findOne({_id: Session.get('gameId')}, {
      transform: function(doc) {
        for (i = 0; i<=1; i++) {
          if (doc.players[i]) {
            if (doc.players[i].device === Session.get('deviceId')) {
              gameMatches.mine = doc.players[i].matches;
            } else {
              gameMatches.yours = doc.players[i].matches;
            }
          }
        }
        return gameMatches;
      }
    });
    if (gameMatches.mine && gameMatches.yours) return gameMatches;
  },

  scoreBoard: function() {
    var curGame = Games.findOne({_id: Session.get('gameId')});
    if (curGame) return curGame;
  }
});
