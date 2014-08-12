/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Province = Backbone.Model.extend({
        url: 'geo/custom.topojson',
        parse: function(province, options)  {
            return topojson.feature(province, province.objects.custom);
        }
    });

})();
