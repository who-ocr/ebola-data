/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.District = Backbone.Model.extend({
        url: 'geo/ADM2.topojson',
        parse: function(district, options)  {

            return topojson.feature(district, district.objects.ADM2);

    });

})();
