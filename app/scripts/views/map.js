/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Map = Backbone.View.extend({

        events: {},

        initialize: function (options) {
            this.listenToOnce(this.collection, 'loaded', function() {
                this.featureChange(WHO.getMapType(WHO.map.getZoom()));
            });

            // Show spinner until load
            this.spinner = new Spinner({
                color: '#888',
                length: 2,
                speed: 0.8
            }).spin(document.getElementById('map-loader'));

            // Keep a list of layers we've added, since we'll have to remove them
            this.layers = [];
        },

        featureChange: function(type) {
            if (type === this.mapType) {
                return;
            }

            this.mapType = type;
            var modelName = type.charAt(0).toUpperCase() + type.slice(1);
            this.getBounds(WHO.Models[modelName], type);
        },

        addLayers: function(type) {
            this.mapType = type;
            var modelName = type.charAt(0).toUpperCase() + type.slice(1);
            this.getBounds(WHO.Models[modelName], type);
        },

        removeLayers: function() {
            _.each(this.layers, function(layer) {
                WHO.map.removeLayer(layer);
            });
        },

        getBounds: function(model, mapType) {
            var model = WHO.models[mapType]  || new model(); ;
            this.model = model;
            this.mapType = mapType;

            // If topojson not loaded yet, load it before drawing
            if (model.get('type') !== 'FeatureCollection') {
                WHO.models[mapType] = model;
                this.listenToOnce(model, 'change', this.render);
                model.fetch();
            }
            else {
                this.render();
            }
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

            this.risks = risks;
            this.drawBounds();
        },


        drawBounds: function() {

            var risks = this.risks,
                values = _.values(risks),
                bounds = {
                    type: 'FeatureCollection',
                    features: _.filter(this.model.attributes.features, function(feature) {
                        return risks[feature.id] > 1;
                    })
                },

                target,
                cs,

                colors = ['ffffd4',
                            '#fec44f',
                            '#fe9929',
                            '#d95f0e',
                            '#993404'
                ],
                max = 5;


            cs = d3.scale.ordinal()
                .range(colors).domain(d3.range(1,max));

            var layer = L.geoJson(bounds, {
                    style: function(feature) {
                        return {
                            color: '#666',
                            fillColor: cs(risks[feature.id]),
                            opacity: 0.2,
                            fillOpacity: 0.2,
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

    });

})();
