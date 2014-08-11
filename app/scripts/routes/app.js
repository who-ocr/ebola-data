/*global WHO, Backbone*/

WHO.Routers = WHO.Routers || {};

(function () {
    'use strict';

    WHO.map = L.mapbox.map('map');
    WHO.Routers.App = Backbone.Router.extend({
        ''                              : 'newload',
        ':map'                          : 'newmap',
    });

    var defaultMap = 'cases';

    function newload() {
        console.log("newload")
        bootstrap();
        WHO.mapview.load(defaultMap);
    }

    var init = false;
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

    function newmap(map) {
        if (!init) bootstrap();
        if (WHO.collections.hasOwnProperty(map)) {
            WHO.mapview.load(map)
        } else {
            WHO.mapview.load(defaultMap);
            WHO.router.navigate(defaultMap, {trigger: false});
        }
    }

})();
