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
            else if (level < 5)         {   maptype = 'country'     }
            else if (level < 7)         {   maptype = 'province'    }
            else                        {   maptype = 'district'    }

            this.maptype = maptype;
            this.popup = new L.Popup({ autoPan: false });
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

            var cases = {}, category,

                admin, adminCode,

                model, geo, geoid;

            var maxdate = this.collection.at(this.collection.models.length - 1).get('datetime'),
                //dateLimit = this.filters.type === 'recent' ? 1000 * 3600 * 24 * 2 : 0;
                dateLimit = 0;

            switch(this.maptype) {
                case 'country':
                    admin = 'Country reporting';
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
                category = model.get('Category').toLowerCase();
                geo = model.get(admin);
                geoid = model.get(adminCode);

                if (category === 'For Aggregates' ||
                    maxdate - model.get('datetime') <= dateLimit) {
                    continue;
                }
                else {
                  if (!(geoid in cases)) {
                    cases[geoid] = {
                        name: geo,
                        confirmed: 0,
                        probable: 0,
                        suspected: 0,
                        hcw: 0,
                        deaths: 0
                    };
                  }
                  cases[geoid][category] += 1;
                  if (model.get('HCW') == 'Yes')
                    cases[geoid].hcw += 1;
                  if (model.get('Outcome') == 'Deceased')
                    cases[geoid].deaths += 1;
                }
            }

            this.drawMarkers(cases);


        },

        drawMarkers: function(cases) {
            var quantiles = this.maptype === 'country' ? 3 : 5,

                maptype = this.maptype,
                clicked = 0,

                colors = ['#ff0', '#f00'],

                popup = this.popup,
                counts = _.map(cases, function(c) { return c.confirmed + c.probable + c.suspected; }),

                max = _.max(counts),
                min = 0,

                scale = function(n) {
                    return n / max * 60;
                },

                closeTooltip,

                centroids = {
                    type: 'Topology',
                    features: _.filter(this.model.get('features'), function(feature) {
                        return cases[feature.id];
                    })
                },

                target,
                category = this.filters.type;

            WHO.map.on('popupclose', function () {
               clicked = 0;
            });

            var layer = L.geoJson(centroids, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: scale(cases[feature.id][category]),
                        weight: 2,
                        color: '#fff',
                        fillColor: '#ff0040',
                        fillOpacity: 0.7
                    });

                },

                onEachFeature: function (feature, layer) {
                  layer.on({
                    dblclick: function(e) {
                      WHO.map.setView(e.latlng, WHO.map.getZoom() + 1);
                    },
                    mousemove: function(e) {
                      if (clicked == 0){
                        var layer = e.target;
                        popup.setLatLng(e.latlng);
                        popup.setContent('<div class="marker-title">' + maptype.charAt(0).toUpperCase() + maptype.slice(1) + ': ' + cases[layer.feature.id].name + '</div> Click for more information');

                        if (!popup._map) popup.openOn(WHO.map);
                        window.clearTimeout(closeTooltip);

                        // highlight feature
                        /*layer.setStyle({
                          weight: 3,
                          opacity: 0.3,
                          fillOpacity: 0.9
                        }); */

                        if (!L.Browser.ie && !L.Browser.opera) {
                          layer.bringToFront();
                        }
                      }
                    },
                    mouseout: function(e) {
                      //layer.resetStyle(e.target);
                      if (clicked == 0){
                        closeTooltip = window.setTimeout(function() {
                          WHO.map.closePopup();
                        }, 100);
                      }
                    },
                    click: function(e) {

                      clicked = 1;

                      var layer = e.target;
                      popup.setLatLng(e.latlng);
                      popup.setContent('<div class="marker-title">' + maptype.charAt(0).toUpperCase() + maptype.slice(1) + ': ' + cases[layer.feature.id].name + '</div>'
                        + '<table class="popup-click"><tr><td align="center">Cases</td></tr>'
                        + '<tr><td>Confirmed</td><td>' + cases[layer.feature.id].confirmed + '</td></tr>'
                        + '<tr><td>Probable</td><td>' + cases[layer.feature.id].probable + '</td></tr>'
                        + '<tr><td>Suspected</td><td>' + cases[layer.feature.id].suspected + '</td></tr><tr><td>---</td><td>---</td></tr>'
                        + '<tr><td>Total Deaths</td><td>' + cases[layer.feature.id].deaths + '</td></tr>'
                        + '<tr><td>Health Care Workers Affected</td><td>' + cases[layer.feature.id].hcw + '</td></tr></table>');

                      if (!popup._map) popup.openOn(WHO.map);
                      window.clearTimeout(closeTooltip);

                      // highlight feature
                      /*layer.setStyle({
                        weight: 3,
                        opacity: 0.3,
                        fillOpacity: 0.9
                      }); */

                      if (!L.Browser.ie && !L.Browser.opera) {
                        layer.bringToFront();
                      }
                    }

                  });
                }

            }).addTo(WHO.map);

            layer.bringToFront();
            this.layers.push(layer);
        }

    });

})();
