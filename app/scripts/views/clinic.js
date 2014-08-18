/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Clinic = Backbone.View.extend({
        initialize: function (options) {
            this.layers = [];

            this.listenTo(options.zoom, 'zoom:end', this.getmap);

            this.listenToOnce(this.model, 'loaded', this.onLoad);
            this.model.query();

            this.on = false;
            this.popup = new L.Popup({ autoPan: false });
        },

        onLoad: function() {
            this.getmap({level: WHO.defaultZoom});
        },

        getmap: function(zoom) {
            var level = zoom.level || WHO.defaultZoom;

            if (level >= 7 && !this.on) {
                this.render();
                this.on = true;
            }

            if (level < 7 && this.on) {
                this.remove();
                this.on = false;
            }
        },

        remove: function() {
            _.each(this.layers, function(layer) {
                WHO.map.removeLayer(layer);
            });
        },

        render: function () {

            if (this.layers.length) this.remove();
            var popup = this.popup;

            var layer = L.geoJson(this.model.attributes, {
                pointToLayer: function(feature, latlng) {
                    return L.marker(latlng, {
                        icon: L.icon({
                            iconSize: [32, 32],
                            iconUrl: 'img/medical-64x64.png',
                        }),
                        opacity: 0.95

                    });
                },

                onEachFeature: function (feature, layer) {
                    layer.on({
                        dblclick: function(e) {
                            WHO.map.setView(e.latlng, WHO.map.getZoom() + 1);
                        },
                        click: function(e) {
                            var props = e.target.feature.properties;

                            popup.setLatLng(e.latlng);
                            popup.setContent('<div class="marker-title">' + props.CITY + ', ' + props.COUNTRY + '</div>'
                                + '<table class="popup-click">'
                                + '<tr><td>Facility</td><td>' + props.LOCATIONS + '</td></tr>'
                                + '<tr><td>Function</td><td>' + props.FUNCTION + '</td></tr>'
                                + '<tr><td>Partners</td><td>' + props.Partners + '</td></tr>'
                                + '<tr><td>Bed Capacity</td><td>' + props.Bed_capacity_current + '</td></tr>'
                                + '<tr><td>Laboratory</td><td>' + props.Serving_Lab_Location + '</td></tr>'
                                + '<tr><td>Status</td><td>' + props.Status_ECT + '</td></tr></table>'
                                );

                            if (!popup._map) popup.openOn(WHO.map);
                        }

                    })
                }
            }).addTo(WHO.map);


            this.layers.push(layer);
        }

    });

})();
