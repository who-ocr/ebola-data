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
            var level, maptype;
            if (zoom && zoom.level) {
                level = zoom.level;
            }
            else if (this.level) {
                level = this.level;
            }
            else {
                level = WHO.defaultZoom;
            }

            //if (this.level === level)   {   return;                 }
            if (level < 5)              {   maptype = 'country'     }
            else if (level < 7)         {   maptype = 'province'    }
            else                        {   maptype = 'district'    }

            this.level = level;
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

            _.each(cases, function(c) {
                c.total = c.confirmed + c.probable + c.suspected;
            });

            this.cases = cases;
            this.drawMarkers(cases);


        },

        drawMarkers: function(cases) {
            if (this.layers.length) {
                this.removeLayers();
            }

            var quantiles = this.maptype === 'country' ? 3 : 5,

                maptype = this.maptype,
                clicked = 0,

                colors = ['#fdbb84', '#e34a33'],

                popup = this.popup,

                category = this.filters.type,

                //max = _.max(_.map(cases, function(c) { return c.confirmed + c.probable + c.suspected; })),
                //max = _.max(_.map(cases, function(c) { return c[category] })),
                max = _.max(_.map(cases, function(c) { return c.total })),
                min = 0,

                scale = d3.scale.quantize().domain([0, max])
                    .range([50, 400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600]),

                centroids = {
                    type: 'Topology',
                    features: _.chain(this.model.get('features'))
                        .filter(function(feature) { return cases[feature.id]; })
                        .sortBy(function(feature) { return -cases[feature.id][category] })
                        .value()
                },

                target,
                closeTooltip;

            WHO.map.on('popupclose', function () {
               clicked = 0;
            });

            var layer = L.geoJson(centroids, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: Math.sqrt(scale(cases[feature.id][category]) / Math.PI)/1.6,
                        weight: 1.5,
                        color: '#fff',
                        opacity: 0.7,
                        fillColor: '#e34a33',
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
                        // layer.setStyle({
                          // weight: 3,
                          // opacity: 0.3,
                          // fillOpacity: 0.9
                        // });

                        // We draw larger markers first, so bringing markers to front on hover
                        // obscures the smaller markers around it.
                        //
                        // if (!L.Browser.ie && !L.Browser.opera) {
                          // layer.bringToFront();
                        // }
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

                      var layer = e.target,
                          d = cases[layer.feature.id];

                      popup.setLatLng(e.latlng);
                      popup.setContent('<div class="marker-title">' + maptype.charAt(0).toUpperCase() + maptype.slice(1) + ': ' + cases[layer.feature.id].name + '</div>'
                        + '<table class="popup-click"><tr><td align="center">Cases</td></tr>'
                        + '<tr><td>Confirmed</td><td>' + d.confirmed + '</td></tr>'
                        + '<tr><td>Probable</td><td>' + d.probable + '</td></tr>'
                        + '<tr><td>Suspected</td><td>' + d.suspected + '</td></tr><tr><td>---</td><td>---</td></tr>'
                        + '<tr><td>Total Deaths</td><td>' + d.deaths + '</td></tr>'
                        + '<tr><td>Health Care Workers Affected</td><td>' + d.hcw + '</td></tr></table>');

                      if (!popup._map) popup.openOn(WHO.map);
                      window.clearTimeout(closeTooltip);
                    }

                  });
                }

            }).addTo(WHO.map);

            layer.bringToFront();
            this.layers.push(layer);
        }

    });

})();
