/*global WHO, Backbone*/

WHO.Collections = WHO.Collections || {};

(function () {
    'use strict';

    WHO.Collections.Cases = Backbone.Collection.extend({

        initialize: function () {
            this.ref = new Firebase('https://luminous-heat-4380.firebaseio.com/cases_admin');
        },

        query: function () {
            var onload = $.proxy(this.onload, this);
            this.ref.once("value", onload);
        },

        onload: function(snap) {

            var data = snap.val(),
                now = Date.parse(new Date());

            return;

            // parse each date as such
            var i = 0, ii = data.length,
                d;

            for(; i < ii; ++i) {
                d = data[i]['Date of notification to WHO'].split('/');
                data[i].datetime = Date.parse([d[1],d[0],d[2]].join('/'));
            }

            data = _.filter(data, function(d) {
                return !isNaN(d.datetime) && d.datetime < now;
            });
            data = _.sortBy(data, function(d) { return d.datetime });

            this.reset(data);
            this.trigger("loaded", data);
        }
    });

})();
