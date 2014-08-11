/*global WHO, Backbone*/

WHO.Collections = WHO.Collections || {};

(function () {
    'use strict';

    WHO.Collections.Cases = Backbone.Collection.extend({

        model: WHO.Models.Cases,

        initialize: function () {
          this.ref = new Firebase('https://luminous-heat-4380.firebaseio.com/map_line');
        },

        query: function  (){
          var that = this;
          this.ref.once("value", function (snap) {
              that.trigger("loaded",snap.val());
          });
        }
    });

})();
