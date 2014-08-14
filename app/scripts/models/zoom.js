/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Zoom = Backbone.Model.extend({

        initialize: function() {
            // Functions to restrict draw until after zoom complete
            var zooming = false,
                zoomTimer,
                that = this;

            WHO.map.on('zoomstart', function() {
                zooming = true;
                window.clearTimeout(zoomTimer);
            });

            WHO.map.on('zoomend', function() {
                zooming = false;
                zoomTimer = window.setTimeout(function() {
                    if (!zooming) that.trigger('zoom:end');
                }, 400);
            });

        },

    });
})();
