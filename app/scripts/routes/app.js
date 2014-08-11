/*global WHO, Backbone*/

WHO.Routers = WHO.Routers || {};

(function () {
    'use strict';

    var defaultMap = 'cases',
        init = false;

    function bootstrap() {
        WHO.mapview = new WHO.Views.Map({
            el: '#map', id: 'map', map: WHO.map
        });
        WHO.collections = {
            cases: new WHO.Collections.Cases(),
            response: new WHO.Collections.Response()
        };
        init = true;
    }

    WHO.map = L.mapbox.map('map');
    WHO.Routers.App = Backbone.Router.extend({
        routes: {
            ''                              : 'newload',
            ':map'                          : 'newmap',
        },

        newload: function() {
            console.log("newload")
            bootstrap();
            WHO.mapview.load(defaultMap);
        },

        newmap: function(map) {
            if (!init) bootstrap();
            if (WHO.collections.hasOwnProperty(map)) {
                WHO.mapview.load(map)
            } else {
                WHO.mapview.load(defaultMap);
                WHO.router.navigate(defaultMap, {trigger: false});
            }
        }
    });

})();
