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
                onzoom = $.proxy(this.onzoom, this);

            WHO.map.on('zoomstart', function() {
                zooming = true;
                window.clearTimeout(zoomTimer);
            });

            WHO.map.on('zoomend', function() {
                zooming = false;
                zoomTimer = window.setTimeout(function() {
                    if (!zooming) onzoom();
                }, 400);
            });

            // Show spinner until load
            this.spinner = new Spinner({
                color: '#888',
                length: 2,
                speed: 0.8
            }).spin(document.getElementById('loader'));
        },

        onzoom: function() {
            var level = WHO.map.getZoom();
            console.log(level);

            // Country level
            if (level < 7) {

            }
            // District level
            else if (level < 8) {

            }
            // Case level
            else if (level < 11) {

            }
        },

        removeLayers: function() {


        },

        load: function(mapType) {
          var collection = WHO.collections[mapType];
          this.stopListening();
          this.mapType = mapType;
          this.listenTo(collection, 'loaded', this.render);
          collection.query();
        },

        render: function (data) {
            this.spinner.stop();

            //this.$el.html(this.template(this.model.toJSON()));
            console.log(data)

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

            WHO.map.addLayer(markers);

        }
    });

})();
