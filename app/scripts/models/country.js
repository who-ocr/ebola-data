/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Country = Backbone.Model.extend({
        url: 'geo/world_ISO_A3.topojson',
        parse: function(country, options)  {
            return topojson.feature(country, country.objects.world);
        }
    });

})();
