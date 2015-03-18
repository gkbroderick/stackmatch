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
  },

  scoreBoard: function() {
    var curGame = Games.findOne({_id: Session.get('gameId')});
    if (curGame) return curGame;
  }
});
