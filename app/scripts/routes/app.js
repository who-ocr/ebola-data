/*global WHO, Backbone*/

WHO.Routers = WHO.Routers || {};

(function () {
    'use strict';

    var init = false;

    //********************* Map Initialize the map *********************//
    WHO.defaultZoom = 3;
    WHO.map = L.mapbox.map('map','nate.j8n0m4ld')
        .setView([-14.179, -11.426], WHO.defaultZoom);
    WHO.map.scrollWheelZoom.disable();
    WHO.$map = $('#map');

    //********************* Start the router *********************//
    WHO.Routers.App = Backbone.Router.extend({
        routes: {
            ''                              : 'newload'
        },
        newload: function() {
            bootstrap();
            WHO.markerview.load();
        },
    });

    function bootstrap() {
        // model to listen for zoom
        var mapzoom = new WHO.Models.Zoom();

        WHO.collections = {
            cases: new WHO.Collections.Cases(),
            response: new WHO.Collections.Response(),
            globalrisk: new WHO.Collections.GlobalRisk(),
            clinics: new WHO.Models.Clinics()
        };

        WHO.mapview = new WHO.Views.Map({
            el: '#map', id: 'map', map: WHO.map, collection: WHO.collections.globalrisk, zoom: mapzoom
        });

        WHO.markerview = new WHO.Views.Marker({
            el: '#map', id: 'map', map: WHO.map, collection: WHO.collections.cases, zoom: mapzoom,
            model: new WHO.Models.Centroids()
        });

        WHO.epiGraph = new WHO.Views.epiGraph({
            el: '#epi-graph', id: 'epi-graph', collection: WHO.collections.cases
        });

        new WHO.Views.Clinic({
            el: '#map', id: 'map', map: WHO.map, model: WHO.collections.clinics, zoom: mapzoom
        });

        new WHO.Views.Legend({
            el: '#legend', id: 'legend', model: mapzoom
        });


        WHO.models = {};

        WHO.models = {};
        WHO.map.whenReady(function() {

            var $toggles = $('<div id="map-overlay-container"></div>').appendTo(
                WHO.$map);

        });

        WHO.mapview.load();
        WHO.epiGraph.load();

        //********************* Listen and convert to CSVs *********************//

        $('#csv-download').on('click', function() {
            if (WHO.collections.cases.length) {
                convertCSV(WHO.collections.cases);
            }
        });

        init = true;
    }

    function convertCSV(models) {
        // Convert models to arrays
        var i = 0, ii = models.length,
            keys = _.keys(models.at(0).attributes),
            k = 0, kk = keys.length,
            csvList = [],
            csvString = 'data:text/csv;charset=utf-8,' + keys.join(',') + '\n',
            row = [];

        for (; i < ii; k = 0, row = [], ++i) {
            for(; k < kk; row.push(models.at(i).get(keys[k])), ++k) {}
            csvList.push(row.join(','));
        }

        var encodedUri = encodeURI(csvString + csvList.join('\n'));
        window.open(encodedUri);
    }

})();
