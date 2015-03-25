Grids = new Meteor.Collection('grids');
Games = new Meteor.Collection('games');

Games.allow({
  update: function(userId, doc, fieldNames, modifier) {
    if (modifier.$addToSet.players) return true;
  },

  remove: function(userId, doc) {
    return true;
  }
});