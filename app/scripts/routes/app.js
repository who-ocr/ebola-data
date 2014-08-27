/*global WHO, Backbone*/

WHO.Routers = WHO.Routers || {};

(function () {
    'use strict';

    var init = false;

    //********************* Map Initialize the map *********************//
    WHO.defaultZoom = 3;
    WHO.map = L.mapbox.map('map','dmccarey.jb7mama4')
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
        },
    });

    function bootstrap() {

        //*********** Convenience method to get map type ***********//
        WHO.getMapType = function(level) {
            if (level < 5)              {   return 'country'     }
            else if (level < 7)         {   return 'province'    }
            else                        {   return 'district'    }
        }

        //*********** Init collections, models, and views ***********//

        WHO.models = {
            centroids: new WHO.Models.Centroids(),
            clinics: new WHO.Models.Clinics()
        };

        WHO.collections = {
            cases: new WHO.Collections.Cases(),
            response: new WHO.Collections.Response(),
            globalrisk: new WHO.Collections.GlobalRisk(),
        };

        WHO.views = {
            risk: new WHO.Views.Map({
                el: '#map', id: 'map', map: WHO.map, collection: WHO.collections.globalrisk
            }),

            casemarkers: new WHO.Views.Marker({
                el: '#map', id: 'map', map: WHO.map, collection: WHO.collections.cases,
                model: WHO.models.centroids
            }),

            epi: new WHO.Views.epiGraph({
                el: '#epi-graph', id: 'epi-graph', collection: WHO.collections.cases
            }),

            clinics: new WHO.Views.Clinic({
                el: '#map', id: 'map', map: WHO.map, model: WHO.models.clinics,
            }),

            legend: new WHO.Views.Legend({ el: '#map-legend', id: 'map-legend' })
        }

        var mapType = WHO.getMapType(WHO.map.getZoom());

        //********************* Set default views *********************//
        var activeViews = [];

        if (mapType === 'country') {

            activeViews = [
                'casemarkers', 'risk', 'epi', 'clinics', 'legend'
            ];

            WHO.collections.cases.query();
            WHO.collections.globalrisk.query();
            WHO.models.centroids.fetch();
            WHO.models.clinics.query();

        }


        //********************* Listen for switches to the data UI *********************//



        //********************* Listen for map zoom to re-draw views *********************//

        var zooming = false,
            zoomTimer;

        WHO.map.on('zoomstart', function() {
            zooming = true;
            window.clearTimeout(zoomTimer);
        });

        WHO.map.on('zoomend', function() {
            zooming = false;
            zoomTimer = window.setTimeout(function() {
                if (!zooming) {

                    // update only active views
                    mapType = WHO.getMapType(WHO.map.getZoom());
                    _.each(activeViews, function(view) {
                        if (WHO.views[view].featureChange) {
                            WHO.views[view].featureChange(mapType);
                        }
                    });
                }
            }, 400);
        });


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
