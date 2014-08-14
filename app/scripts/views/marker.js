/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Marker = Backbone.View.extend({

        initialize: function (options) {
            this.listenTo(options.zoom, 'zoom:end', this.getmap);
            this.layers = [];
        },

        setFilter: function(filters) {
            this.filters = filters;
        },

        load: function() {
            if (this.collection.length) {
                this.getmap();
            }
            else {
                this.listenToOnce(this.collection, 'loaded', this.getmap);
                this.collection.query();
            }
        },

        getmap: function(zoom) {
            var level = zoom.level || WHO.defaultZoom,
                maptype = '';

            if (this.level === level)   {   return;                 }
            else if (level < 6)         {   maptype = 'country'     }
            else if (level < 7)         {   maptype = 'province'    }
            else if (level < 8)         {   maptype = 'district'    }

            this.maptype = maptype;
            this.getCentroids();
        },


        getCentroids: function() {
            // If topojson not loaded yet, load it before drawing
            if (this.model.get('type') !== 'FeatureCollection') {
                this.listenToOnce(this.model, 'change', this.render);
                this.model.fetch();
            }
            else {
                this.render();
            }
        },

        removeLayers: function() {
            _.each(this.layers, function(layer) {
                WHO.map.removeLayer(layer);
            });
        },


        render: function () {

            if (this.layers.length) {
                this.removeLayers();
            }

            var cases = {},
                category = this.filters.type,

                admin, adminCode,

                model, geo, geoid;

            var maxdate = this.collection.at(this.collection.models.length - 1).get('datetime'),
                //dateLimit = this.filters.type === 'recent' ? 1000 * 3600 * 24 * 2 : 0;
                dateLimit = 0;

            switch(this.maptype) {
                case 'country':
                    admin = 'ISO83';
                    adminCode = 'ADM0_CODE';
                    break;
                case 'province':
                    admin = 'ADM1_VIZ_N';
                    adminCode = 'ADM1_CODE';
                    break;
                case 'district':
                    admin = 'ADM2_VIZ_N';
                    adminCode = 'ADM2_CODE';
            }

            for(var i = 0, ii = this.collection.models.length; i < ii; ++i) {
                model = this.collection.models[i];

                geo = model.get(admin);
                geoid = model.get(adminCode);

                if (model.get('Category').toLowerCase() !== category ||
                    maxdate - model.get('datetime') <= dateLimit) {
                    continue;
                }
                else if (geoid in cases) {
                    cases[geoid].count += 1;
                }
                else {
                    cases[geoid] = {
                        name: geo,
                        count: 1
                    };
                }
            }

            this.drawMarkers(cases);


        },

        drawMarkers: function(cases) {
            var quantiles = this.maptype === 'country' ? 3 : 5,

                colors = ['#ff0', '#f00'],

                popup = this.popup,
                counts = _.map(cases, function(c) { return c.count; }),

                max = _.max(counts),
                min = 0,

                scale = function(n) {
                    return n / max * 75;
                },

                centroids = {
                    type: 'Topology',
                    features: _.filter(this.model.get('features'), function(feature) {
                        return cases[feature.id];
                    })
                },

                target,
                category = this.filters.type;

            var layer = L.geoJson(centroids, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: scale(cases[feature.id].count),
                        stroke: 0,
                        fillColor: '#ff0040',
                        fillOpacity: 0.7
                    })
                }
            }).addTo(WHO.map);

            layer.bringToFront();
            this.layers.push(layer);
        }

    });

})();
