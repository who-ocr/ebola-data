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
            }).spin(document.getElementById('map-loader'));

            // Keep a list of layers we've added, since we'll have to remove them
            this.layers = [];
        },

        setFilter: function(filters) {
            this.filters = filters;
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
            else if (level < 5)         {   this.getBounds(WHO.Models.Country, 'country');      }
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

            var values = _.values(risks),
                colors = ['#ccc', '#fc0','#ff2a33'],
            //var colors = ['c6dbef','#08519c'],
                cs = chroma.scale(colors).domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]),

                popup = this.popup,

                mousemove = $.proxy(this.mousemove, this),
                mouseout = $.proxy(this.mouseout, this),
                //click = $.proxy(this.click, this)

                bounds = {
                    type: 'FeatureCollection',
                    features: _.filter(this.model.attributes.features, function(feature) {
                        return risks[feature.id] > 1;
                    })
                },

                target,
                //category = this.filters.type,

                layer = L.geoJson(bounds, {
                    style: function(feature) {

                        return {
                            color: '#ccc',
                            fillColor: cs(risks[feature.id]),
                            opacity: 0.7,
                            fillOpacity: 0.6,
                            weight: 1
                        };
                    },

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
            model, geo;

            for(var i = 0, ii = this.collection.models.length; i < ii; ++i) {
                model = this.collection.models[i];
                geo = model.get("geoID");
                risks[geo] = model.get("level")
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
