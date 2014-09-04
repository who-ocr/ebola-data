/*global WHO, Backbone*/

WHO.Collections = WHO.Collections || {};

(function () {
    'use strict';

    WHO.Collections.Cases = Backbone.Collection.extend({

        initialize: function () {
            this.ref = new Firebase('https://who-ocr-dev.firebaseio.com/cases_aug30');
        },

        query: function () {
            var onload = $.proxy(this.onload, this);
            this.ref.once("value", onload);
        },

        lastWeek: function() {

            var i = this.models.length - 1,
                // this doesn't work because our data isn't live yet, so nothing is as recent as last week from today
                //lastWeek = Date.parse(new Date()) - 1000 * 60 * 60 * 24 * 21,

                // instead we use the week ending with the latest case
                lastWeek = this.at(i).get('datetime') - 1000 * 60 * 60 * 24 * 21,
                cases = [],
                model;

            for(; i >= 0; i--) {
                model = this.at(i);
                if (model.get('datetime') < lastWeek) {
                    return cases;
                }
                cases.push(model.attributes);
            }

            return cases;
        },

        onload: function(snap) {

            var data = snap.val(),
                now = Date.parse(new Date()),
                start = Date.parse(new Date('2013', '11', '20'));

            // parse each date as such
            var i = 0, ii = data.length,
                d;

            for(; i < ii; ++i) {
                d = data[i]['Date of notification to WHO'].split('/');
                data[i].datetime = Date.parse([d[1],d[0],d[2]].join('/'));
                //d = data[i]['date'];
                //data[i].datetime = Date.parse(d);
                data[i].category = data[i]['Category'].toLowerCase();
            }

            data = _.filter(data, function(d) {
                return d.category !== 'for aggregates'
                    && !isNaN(d.datetime)
                    && d.datetime < now && d.datetime > start;
            });
            data = _.sortBy(data, function(d) { return d.datetime });

            this.reset(data);
            this.trigger("loaded", data);
        }
    });

})();
