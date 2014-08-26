/*global WHO, Backbone*/

WHO.Collections = WHO.Collections || {};

(function () {
    'use strict';

    WHO.Collections.GlobalRisk = Backbone.Collection.extend({

        initialize: function () {
          this.ref = new Firebase('https://luminous-heat-4380.firebaseio.com/response_aug22');
        },

        query: function () {
            var onload = $.proxy(this.onload, this);
            this.ref.once("value", onload);
        },

        onload: function(snap) {
            var data = snap.val()

            this.reset(data);
            this.trigger("loaded", data);
        }
    });

})();
