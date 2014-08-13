/*global WHO, Backbone*/

WHO.Routers = WHO.Routers || {};

(function () {
    'use strict';

    var defaultMap = 'cases',
        init = false;

    function bootstrap() {
        WHO.collections = {
            cases: new WHO.Collections.Cases(),
            response: new WHO.Collections.Response()
        };
        WHO.mapview = new WHO.Views.Map({
            el: '#map', id: 'map', map: WHO.map, collection: WHO.collections.cases
        });
        WHO.models = {};
        init = true;
    }

    WHO.map = L.mapbox.map('map','nate.map-szf211bp,nate.map-c3e3vgn8')
              .setView([6.0095537, -10.6059403], 5);;

    WHO.Routers.App = Backbone.Router.extend({
        routes: {
            ''                              : 'newload',
            ':map'                          : 'newmap',
        },

        newload: function() {
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
