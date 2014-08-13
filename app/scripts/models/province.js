/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Province = Backbone.Model.extend({
        url: 'geo/custom.topojson',
        parse: function(province, options)  {
            var f,
            provinces = {type: "FeatureCollection", features: []}

            _.each(province.objects, function(x){
              f = topojson.feature(province, x)
              provinces.features = provinces.features.concat(f.features)
            });

            return provinces;
        }
    });

})();
