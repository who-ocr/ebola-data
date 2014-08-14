/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Province = Backbone.Model.extend({
        url: 'geo/ADM1.topojson',
        parse: function(province, options)  {

            return topojson.feature(provinces, provinces.objects.ADM1);
            
        }
    });

})();
