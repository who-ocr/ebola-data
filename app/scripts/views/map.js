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
            //else if (level < 8)         {   this.getBounds(WHO.Models.District, 'district');    }
            //else                        {   this.drawClusters();                                }

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
                colors = ['#fff','rgb(255,252,224)','rgb(252,202,78)','rgb(250,175,78)','rgb(249,145,77)','rgb(247,117,77)'],
                //var colors = ['c6dbef','#08519c'],
                cs = chroma.scale(colors).domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]),
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
                            color: 'rgb(254,243,183)',
                            fillColor: getColor(risks[feature.id]),
                            opacity: 0.7,
                            fillOpacity: 0.7,
                            weight: 1
                        };
                        // get color depending on response level
                        function getColor(d) {
                            console.log(feature.id);
                            console.log(d);
                            if (feature.id.substr(7,1) == 0) {
                                // for admin0 geoids with different scale
                                return d == 1 ? '#fff' :
                                    d == 2 ? 'rgb(255,252,224)' :
                                    d == 3 ? 'rgb(252,202,78)' :
                                    d == 4 ? 'rgb(250,175,78)' :
                                    d == 5 ? 'rgb(249,145,77)' :
                                    d == 6 ? 'rgb(246,104,61)' :
                                    '#fff';
                            }
                            else {
                                return d == 1 ? '#fff' :
                                    d == 2 ? 'rgb(252,202,78)' :
                                    d == 3 ? 'rgb(250,175,78)' :
                                    d == 4 ? 'rgb(249,145,77)' :
                                    d == 5 ? 'rgb(246,104,61)' :
                                    '#fff';
                            }
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
