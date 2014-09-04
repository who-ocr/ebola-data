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
            var level = WHO.getMapType(WHO.map.getZoom()),
                risks = this.risks,
                values = _.values(risks),
                bounds = {
                    type: 'FeatureCollection',
                    features: _.filter(this.model.attributes.features, function(feature) {
                        if (level === 'country' ){
                            return risks[feature.id] > 3;
                        }
                        else {
                            return risks[feature.id];
                        }
                    })
                },

                target,
                cs,

                countryColors = ['#9d4e00',
                            '#ff8104',
                            '#623000'
                ],
                districtColors = ['#9d4e00',
                            '#623000',
                            '#ff8104'
                ],
                max = 3;

            // cs = d3.scale.ordinal()
            //     .range(colors).domain(d3.range(1,max));

            // country levels are 1-6. we only show levels 4-6. 
            var layer = L.geoJson(bounds, {
                    style: function(feature) {
                        return {
                            color: '#666',
                            fillColor: level === 'country' ? countryColors[risks[feature.id]-4] : districtColors[risks[feature.id]-4],
                            opacity: 0.5,
                            fillOpacity: 0.4,
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
