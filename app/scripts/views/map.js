/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Map = Backbone.View.extend({

        events: {},
        initialize: function () {
            WHO.map.on('zoomend', this.onZoom, this);
        },

        onZoom: function() {
            var level = WHO.map.getZoom();

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
