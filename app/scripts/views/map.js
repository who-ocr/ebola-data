/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Map = Backbone.View.extend({

        events: {},
        initialize: function (options) {
            this.listenTo(options.zoom, 'zoom:end', this.getmap);

            // Show spinner until load
            this.spinner = new Spinner({
                color: '#888',
                length: 2,
                speed: 0.8
            }).spin(document.getElementById('map-loader'));

            // Keep a list of layers we've added, since we'll have to remove them
            this.layers = [];
        },

        load: function(mapType) {
            if (this.collection.length) {
                this.getmap();
            }
            else {
                this.listenToOnce(this.collection, 'loaded', this.getmap);
                this.collection.query();
            }
        },

        getmap: function(zoom) {
            var level = zoom.level || WHO.defaultZoom;

            if (this.level === level)   {   return;                                             }
            else if (level < 5)         {   this.getBounds(WHO.Models.Country, 'country');      }
            else if (level < 7)         {   this.getBounds(WHO.Models.Province, 'province');    }
            else                        {   this.getBounds(WHO.Models.District, 'district');    }
            this.level = level;
        },

        getBounds: function(model, maptype) {
            var model = WHO.models[maptype]  || new model(); ;
            this.model = model;
            this.maptype = maptype;

            // If topojson not loaded yet, load it before drawing
            if (model.get('type') !== 'FeatureCollection') {
                WHO.models[maptype] = model;
                this.listenToOnce(model, 'change', this.render);
                model.fetch();
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

        drawBounds: function(risks) {

            var values = _.values(risks),
                bounds = {
                    type: 'FeatureCollection',
                    features: _.filter(this.model.attributes.features, function(feature) {
                        return risks[feature.id] > 1;
                    })
                },

                target,
                colors, cs, max;

            if (this.maptype === 'country') {
                colors = [
                    '#ffffd4',
                    '#fee391',
                    '#fec44f',
                    '#fe9929',
                    '#d95f0e',
                    '#993404'
                ];
                /*

                    '#fff',
                        'rgb(255,252,224)',
                        'rgb(252,202,78)',
                        'rgb(250,175,78)',
                        'rgb(249,145,77)',
                        'rgb(246,104,61)'

                        */
                max = 6;

            } else {
                colors = ['#fff',
                        'rgb(252,202,78)',
                        'rgb(250,175,78)',
                        'rgb(249,145,77)',
                        'rgb(246,104,61)'
                ];
                max = 5;
            }

            cs = d3.scale.ordinal()
                .range(colors).domain(d3.range(1,max));

            var layer = L.geoJson(bounds, {
                    style: function(feature) {
                        return {
                            color: '#666',
                            fillColor: cs(risks[feature.id]),
                            opacity: 0.333,
                            fillOpacity: 0.333,
                            weight: 1
                        };
                    },

                    onEachFeature: function (feature, layer) {
                      layer.on({
                        dblclick: function(e) {
                          WHO.map.setView(e.latlng, WHO.map.getZoom() + 1);
                          }
                      });
                    }

                }).addTo(WHO.map);

            this.spinner.stop();
            layer.bringToBack();
            this.layers.push(layer);

            return;
        },

        render: function () {

            if (this.layers.length) {
                this.removeLayers();
            }

            var risks = {},
            model, geo;

            for(var i = 0, ii = this.collection.models.length; i < ii; ++i) {
                model = this.collection.models[i];
                geo = model.get("geoID");
                risks[geo] = model.get("level")
            }

            this.drawBounds(risks);
        },
    });

})();
