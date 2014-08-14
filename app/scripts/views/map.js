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
            }).spin(document.getElementById('loader'));

            // Keep a list of layers we've added, since we'll have to remove them
            this.layers = [];
            this.popup = new L.Popup({ autoPan: false });
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

        getmap: function() {
            var level = WHO.map.getZoom(),
                maptype;

            if (this.level === level)   {   return;                                             }
            else if (level < 6)         {   this.getBounds(WHO.Models.Country, 'country');      }
            else if (level < 7)         {   this.getBounds(WHO.Models.Province, 'province');    }
            else if (level < 8)         {   this.getBounds(WHO.Models.District, 'district');    }
            else                        {   this.drawClusters();                                }
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
            var colors = ['#fc0','#ff2a33'],
            //var colors = ['c6dbef','#08519c'],
                cs = chroma.scale(colors).domain(_.values(risks)),

                popup = this.popup,

                mousemove = $.proxy(this.mousemove, this),
                mouseout = $.proxy(this.mouseout, this),
                //click = $.proxy(this.click, this)

                bounds = {
                    type: 'FeatureCollection',
                    features: this.model.attributes.features
                    //features: _.filter(this.model.attributes.features, function(feature) {
                    //    return cases[feature.id];
                    //})
                },

                target,
                //category = this.filters.type,

                layer = L.geoJson(bounds, {
                    style: function(feature) {

                        return {
                            color: '#c6dbef',
                            fillColor: cs(risks[feature.id]),
                            opacity: 0.7,
                            fillOpacity: 0.5,
                            weight: 1
                        };
                    },

                    onEachFeature: function(feature, layer) {
                        layer.on({
                            mousemove: function(e) {
                                target = e.target;
                                popup.setLatLng(e.latlng);
                                //popup.setContent('<div class="marker-title">' +
                                //                      target.feature.id + '</div>' + cases[target.feature.id] + ' ' + category + ' cases');

                                if (!popup._map) popup.openOn(WHO.map);
                            },
                            mouseout: function(e) {
                                window.setTimeout(function() {
                                    WHO.map.closePopup();
                                }, 100);
                            }
                        });
                    }

                }).addTo(WHO.map);

            this.spinner.stop();
            this.layers.push(layer);

            return;
        },

        render: function () {

            if (this.layers.length) {
                this.removeLayers();
            }

            var risks = {},
                geography = this.maptype === 'district' ?
                    'ADM_2' : 'ISO_3_CODE',
                risk_code = this.maptype === 'district' ?
                    'ADM2_LEVEL' : 'GLOBAL_LEVEL',
                model, geo;

            for(var i = 0, ii = this.collection.models.length; i < ii; ++i) {
                model = this.collection.models[i];
                geo = model.get(geography);
                risks[geo] = model.get(risk_code)
            }

            this.drawBounds(risks);
        },

        drawClusters: function() {

            /*
            var markers = L.markerClusterGroup({

                iconCreateFunction: function (cluster) {
                    var count = cluster.getChildCount();
                    var digits = (count+'').length;
                    return new L.DivIcon({
                        html: count,
                        className:'cluster digits-'+digits,
                        iconSize: null

                    });
                },
                //Disable all of the defaults:
                spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
            });

            for (var i in data ) {
                var a = data[i];
                var title = a["Case ID"];
                var marker = L.marker(new L.LatLng(a.Latitude, a.Longitude), {
                    icon: L.mapbox.marker.icon(),
                    title: title
                });
                marker.bindPopup(title);
                markers.addLayer(marker);
            }
            */
            //WHO.map.addLayer(markers);


        }
    });

})();
