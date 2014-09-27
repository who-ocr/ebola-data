/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Clinic = Backbone.View.extend({
        initialize: function (options) {
            this.listenToOnce(this.model, 'loaded', function() {
                this.featureChange(WHO.getMapType(WHO.map.getZoom()));
            });
            this.layers = [];

            this.on = false;
            this.popup = new L.Popup({ autoPan: false });
        },

        featureChange: function(type) {
            // if (type === 'district' && !this.on) {
            if (WHO.map.getZoom() >= 7 && !this.on) {
                this.render();
                this.on = true;
            }

            // if (type !== 'district' && this.on) {
            if (WHO.map.getZoom() < 7 && this.on) {
                this.removeLayers();
                this.on = false;
            }
        },

        addLayers: function(type) {
            this.featureChange(type);
        },

        removeLayers: function() {
            _.each(this.layers, function(layer) {
                WHO.map.removeLayer(layer);
            });
            this.on = false;
        },

        render: function () {

            if (this.layers.length) this.removeLayers();

            var popup = this.popup,
                template = this.template;

            var layer = L.geoJson(this.model.attributes, {
                pointToLayer: function(feature, latlng) {
                    if (feature.properties.FUNCTION === 'ETC + Triage') {
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconSize: [32, 32],
                                iconUrl: 'img/triage-64x64.png',
                            }),
                            opacity: 1
                        });
                    } else {
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconSize: [32, 32],
                                iconUrl: 'img/hub-64x64.png',
                            }),
                            opacity: 0
                        });
                    }
                },

                onEachFeature: function (feature, layer) {
                    layer.on({
                        dblclick: function(e) {
                            WHO.map.setView(e.latlng, WHO.map.getZoom() + 1);
                        },
                        click: function(e) {
                            var props = e.target.feature.properties;
                            _.each(['TOWN', 'classification', 'FUNCTION', 'Partners_to_ETC', 'Bed_capacity_current',
                                   'COUNTRY', 'Serving_Lab_Location', 'Status_HF', 'Structure_location'], function(p) {
                               if (props[p] === undefined) {
                                   props[p] = 'N/A';
                               }
                            });
                            popup.setLatLng(e.latlng);
                            popup.setContent(template(props));
                            if (!popup._map) popup.openOn(WHO.map);
                        }
                    })
                }
            }).addTo(WHO.map);
            this.layers.push(layer);
        },
        template: _.template($('#popup-clinic').html()),

    });

})();
