/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Country = Backbone.Model.extend({
        url: 'geo/ADM0.topojson',
        parse: function(country, options)  {
            return topojson.feature(country, country.objects.ADM0);
        }
    });

})();
