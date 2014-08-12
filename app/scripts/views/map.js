/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Map = Backbone.View.extend({

        events: {},
        initialize: function () {
            // Functions to restrict draw until after zoom complete
            var zooming = false,
                zoomTimer,
                getmap = $.proxy(this.getmap, this);

            WHO.map.on('zoomstart', function() {
                zooming = true;
                window.clearTimeout(zoomTimer);
            });

            WHO.map.on('zoomend', function() {
                zooming = false;
                zoomTimer = window.setTimeout(function() {
                    if (!zooming) getmap();
                }, 400);
            });

            // Show spinner until load
            this.spinner = new Spinner({
                color: '#888',
                length: 2,
                speed: 0.8
            }).spin(document.getElementById('loader'));

            // Keep a list of layers we've added, since we'll have to remove them
            this.layers = [];
        },

        load: function(mapType) {
            this.listenToOnce(this.collection, 'loaded', this.render);
            this.collection.query();
        },

        getmap: function() {
            var level = WHO.map.getZoom(),
                maptype;

            if (this.level === level)   {   return;                                             }
            else if (level < 7)         {   this.getBounds(WHO.Models.Country, 'country');      }
            else if (level < 8)         {   this.getBounds(WHO.Models.Province, 'province');    }
            else                        {   this.drawClusters();                                }
        },

        getBounds: function(model, maptype) {
            var model = WHO.models[maptype] || new model();
            this.model = model;
            this.maptype = maptype;

            // If topojson not loaded yet, load it before drawing
            if (model.get('type') !== 'FeatureCollection') {
                WHO.models[maptype] = model;
                this.listenToOnce(model, 'change', this.fitBounds);
                model.fetch();
            }
            else {
                this.fitBounds();
            }
        },

        fitBounds: function() {
            if (this.layers.length) {
                this.removeLayers();
            }
            this.drawBounds();
        },

        removeLayers: function(callback, args) {

            _.each(args.context.layers, function(layer) {
                WHO.map.removeLayer(layer);
            });
        },

        drawBounds: function(data) {
            var affected = this.affected[this.maptype];

            var layer = L.geoJson(this.model.attributes, {
                style: function(feature) {
                    return {color: 'fff'}
                },
                filter: function(feature) {
                    // filtering here if it's affected or not
                    return true;
                }
            }).addTo(WHO.map);
        },

        render: function () {
            var casesByCountry = {},
                casesByProvince = {},
                model,
                country, province;

            for(var i = 0, ii = this.collection.models.length; i < ii; ++i) {
                model = this.collection.models[i];
                country = model.get('Country reporting');

                if (country in casesByCountry) {
                    casesByCountry[country] += 1;
                } else {
                    casesByCountry[country] = 1;
                }

                province = model.get('Province Reporting');

                if (province in casesByProvince) {
                    casesByProvince[province] += 1;
                } else {
                    casesByProvince[province] = 1;
                }
            }

            this.affected = {
                country: _.keys(casesByCountry),
                province: _.keys(casesByProvince)
            };
            this.cases = {
                country: casesByCountry,
                province: casesByProvince
            };

            this.getmap();
            this.spinner.stop();
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
