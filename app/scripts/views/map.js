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
            else if (level < 6)         {   this.getBounds(WHO.Models.Country, 'country');      }
            else if (level < 7)         {   this.getBounds(WHO.Models.Province, 'province');    }
            else                        {   this.drawClusters();                                }
        },

        getBounds: function(model, maptype) {
            var model = WHO.models[maptype]  || new model(); ;
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

        removeLayers: function() {

            _.each(this.layers, function(layer) {
                WHO.map.removeLayer(layer);
            });
        },

        drawBounds: function() {
            var timeFrame = 'recent';
            var affected = this.affected[timeFrame][this.maptype];
            var cases = this.cases[timeFrame][this.maptype];
            var mt = this.maptype;
            var showThis = 'probable';
            var colors = ['#ff0','#f00'];
            var that = this;
            console.log(cases);
            var layer = L.geoJson(this.model.attributes, {
                style: function(feature) {
                     if (mt == 'country')
                       var cs = chroma.scale(colors).domain(_.map(cases, function(x){return x[showThis]}), 3, 'quantiles');
                     else
                       var cs = chroma.scale(colors).domain(_.map(cases, function(x){return x[showThis]}), 5, 'quantiles');
                     if (cases[feature.id])
                       return {color: cs(cases[feature.id][showThis]),"opacity": 0.7,"weight":1}
                     else
                       return {color: '#555',"opacity": 0.7,"weight":1}
                },
                filter: function(feature) {
                    //if (affected.indexOf(feature.id) > -1)
                      return true;
                    //else
                      //return false;
                },
                onEachFeature: that.onEachFeature

            }).addTo(WHO.map);

            this.layers.push(layer);
        },

        onEachFeature: function(feature, layer){
          var that = this;
          layer.on({
            mousemove: this.mousemove,
            mouseout: this.mouseout,
            click: this.mousemove
          });
        },

        mousemove: function(e) {
          console.log(e)
          /*
          var layer = e.target;

          popup.setLatLng(e.latlng);
          popup.setContent('<div class="marker-title">' + layer.feature.properties.ADM2_NAME + '</div>' +
            layer.feature.properties.COUNT + ' totals cases');

          if (!popup._map) popup.openOn(WHO.map);
            window.clearTimeout(closeTooltip);

          // highlight feature
          layer.setStyle({
            weight: 3,
            opacity: 0.3,
            fillOpacity: 0.9
          });

          if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
          }
          */
        },

        mouseout: function(e) {
          /*
          statesLayer.resetStyle(e.target);
          closeTooltip = window.setTimeout(function() {
            WHO.map.closePopup();
          }, 100); */
        },


        render: function () {
            var casesByCountry = {},
                casesByProvince = {},
                casesByCountry_r = {},
                casesByProvince_r = {},
                model,
                category,
                d, date, maxdate,
                country, province;

                var now = new Date();

                maxdate = this.collection.models.map(function(x){
                  d = x.get('Date of notification to WHO').split('/');
                  date = new Date([d[1],d[0],d[2]].join('/'));
                  return date;
                })
                  .reduce(function(a,b){
                    if ( b > a && b < now)
                      return b;
                    else
                      return a;
                  });

            for(var i = 0, ii = this.collection.models.length; i < ii; ++i) {
                model = this.collection.models[i];

                country = model.get('Country reporting');
                province = model.get('Province Reporting');
                category = model.get('Category').toLowerCase();
                d = model.get('Date of notification to WHO').split('/');
                date = new Date([d[1],d[0],d[2]].join('/'));

                if (maxdate - date <= (1000*3600*24*2)) {
                  if (country in casesByCountry_r) {
                      casesByCountry_r[country]['total'] += 1;
                  } else {
                      casesByCountry_r[country] = {total: 1, suspected: 0, probable: 0, confirmed: 0};
                  }
                  casesByCountry_r[country][category] += 1;

                  if (province in casesByProvince_r) {
                      casesByProvince_r[province]['total'] += 1;
                  } else {
                      casesByProvince_r[province] = {total: 1, suspected: 0, probable: 0, confirmed: 0};
                    }
                  casesByProvince_r[province][category] += 1;
                }

                if (country in casesByCountry) {
                    casesByCountry[country]['total'] += 1;
                } else {
                    casesByCountry[country] = {total: 1, suspected: 0, probable: 0, confirmed: 0};
                }
                casesByCountry[country][category] += 1;

                if (province in casesByProvince) {
                    casesByProvince[province]['total'] += 1;
                } else {
                    casesByProvince[province] = {total: 1, suspected: 0, probable: 0, confirmed: 0};
                  }
                casesByProvince[province][category] += 1;

            }

            this.affected = { all: {
                country: _.keys(casesByCountry),
                province: _.keys(casesByProvince)
              },
              recent: {
                country: _.keys(casesByCountry_r),
                province: _.keys(casesByProvince_r)
              }
            };

            this.cases = { all: {
                country: casesByCountry,
                province: casesByProvince
              },
              recent: {
                country: casesByCountry_r,
                province: casesByProvince_r
              }
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
