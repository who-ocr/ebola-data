/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Centroids = Backbone.Model.extend({

        url: 'geo/centroids.topojson',
        parse: function(centroids, options)  {
            return topojson.feature(centroids, centroids.objects.centroids);
        }
    });

})();
