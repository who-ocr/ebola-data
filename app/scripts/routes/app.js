/*global WHO, Backbone*/

WHO.Routers = WHO.Routers || {};

(function () {
    'use strict';

    var init = false;

    //********************* Map Initialize the map *********************//
    WHO.defaultZoom = 5;
    WHO.map = L.mapbox.map('map','devseed.jcbd85k7')
        .setView([8.0, -5.7], WHO.defaultZoom);
    WHO.map.on('viewreset', function() {
        WHO.map.closePopup();
    });
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
            if (level < 6)              {   return 'country'     }
            else if (level < 7)         {   return 'province'    }
            else                        {   return 'province'    }
        }

        //*********** Init collections, models, and views ***********//

        WHO.models = {
            centroids: new WHO.Models.Centroids(),
            clinics: new WHO.Models.Clinics()
        };

        WHO.collections = {
            cases: new WHO.Collections.Cases(),
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

        var mapviews = ['casemarkers', 'risk', 'clinics', 'all'],

            combinations = {
                risk:
                    [0, 1, 0],

                cases:
                    [1, 0, 0],

                response:
                    [0, 1, 1],
                
                all:
                    [1, 0, 0]
            },
            $target;



        $('a.layer').on('click', function(e) {
            $target = $(this);

            e.preventDefault();

            var zoom = $target.data('zoom'),
                newMap = WHO.getMapType(zoom),
                combo = combinations[$target.data('layer')];

            _.each(combo, function(shouldBeOn, i) {

                var view = mapviews[i],
                    activeIndex = activeViews.indexOf(view);

                if (shouldBeOn && activeIndex === -1) {
                    activeViews.push(view);
                    WHO.views[view].addLayers(newMap);
                }

                else if (!shouldBeOn && activeIndex !== -1) {
                    activeViews.splice(activeIndex, 1);
                    WHO.views[view].removeLayers();
                }

            });



            WHO.map.closePopup();
            WHO.map.setView([8.44, -11.7], zoom);

        });





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

        $('#csv-download-cases').on('click', function() {
            // for cases
            if (WHO.collections.cases.length) {
                collectionToCSV(WHO.collections.cases);
            }
        });

        $('#csv-download-response').on('click', function() {
            // for risk
            if (WHO.collections.globalrisk.length) {
                collectionToCSV(WHO.collections.globalrisk);
            }
        });

        $('#csv-download-facilities').on('click', function() {
            // for clinics
            if (WHO.models.clinics.attributes.type === 'FeatureCollection') {
                var features = WHO.models.clinics.attributes.features,
                    clinics = _.map(features, function(feature) {
                        return feature.properties
                    });
                listToCSV(clinics);
            }
        });



        init = true;
    }

    //********************* Collection to CSV *********************//
    function collectionToCSV(models) {
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

    //********************* List of objects to CSV *********************//
    function listToCSV(list) {

        var i = 0, ii = list.length,
            keys = _.keys(list[0]),
            k = 0, kk = keys.length,
            csvList = [],
            csvString = 'data:text/csv;charset=utf-8,' + keys.join(',') + '\n',
            row = []

        for (; i < ii; k = 0, row = [], ++i) {
            for(; k < kk; row.push(list[i][keys[k]]), ++k) {}
            csvList.push(row.join(','));
        }

        var encodedUri = encodeURI(csvString + csvList.join('\n'));
        window.open(encodedUri);
    }


    //********************* Hide UI *********************//

     
     $('.graph-container').on('click', function() {
        if ($(this).hasClass('ui-open')) {
           $(this).animate({bottom: '-180px'});
           $(this).removeClass('ui-open');
           $('.legend-control span').removeClass('glyphicon-chevron-down');
           $('.legend-control span').addClass('glyphicon-chevron-up');
        } else {
           $(this).animate({bottom: '0px'});
           $(this).addClass('ui-open');
           $('.legend-control span').removeClass('glyphicon-chevron-up');
           $('.legend-control span').addClass('glyphicon-chevron-down');
        }     
     });
     
     $('.legend-control').tooltip();
     
   

    /*
     $('a.layer').on('click', function() {
        //var layer = $(this).data('layer');
        var zoom = $(this).data('zoom');
        WHO.map.setView([8.44, -11.7], zoom);
     });



    */
})();
