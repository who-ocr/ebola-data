/*global WHO, Backbone*/

WHO.Routers = WHO.Routers || {};

(function () {
    'use strict';

    var defaultType = 'total';
    var defaultMap = 'cases',
        init = false,
        timeParams = [
            {
                display: 'Most recent',
                val: 'recent'
            },
            {
                display: 'All',
                val: 'all'
            }
        ],
        typeParams = [
            {
                display: 'All cases',
                val: 'total'
            },
            {
                display: 'Confirmed cases',
                val: 'confirmed'
            },
            {
                display: 'Suspected cases',
                val: 'suspected'
            },
            {
                display: 'Probable cases',
                val: 'probable'
            }
        ],
        state = {
            time: '',
            type: ''
        };

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

            // new WHO.Views.Dropdown({
                // id: 'toggle-case-type',
                // el: $('<div id="toggle-case-type" class="dropdown-container"></div>').appendTo($toggles),
                // options: typeParams,
                // className: 'type'
            // });

            // new WHO.Views.Dropdown({
                // id: 'toggle-time',
                // el: $('<div id="toggle-time" class="dropdown-container"></div>').appendTo($toggles),
                // options: timeParams,
                // className: 'time'
            // });

        });

        WHO.mapview.load();
        WHO.epiGraph.load();
        init = true;
    }

    WHO.defaultZoom = 3;
    WHO.map = L.mapbox.map('map','nate.j812554k')
              .setView([9.211, -2.527], WHO.defaultZoom);

    WHO.map.scrollWheelZoom.disable();

    WHO.$map = $('#map');

    WHO.Routers.App = Backbone.Router.extend({
        routes: {
            ''                              : 'newload',
            ':time/:type'                   : 'newload'
            // ':time/:type'                : 'newfilter',
        },

        newload: function() {
            bootstrap();

            WHO.markerview.setFilter({type: defaultType, time: 'recent'});
            WHO.markerview.load();

            //this.navigate('recent/' + defaultType, {trigger: false});
            state['time'] = 'recent';
            state['type'] = defaultType;
        },

        newfilter: function(time, type) {
            if (!init) bootstrap();
            if (_.map(timeParams, function(t) { return t.val }).indexOf(time) !== -1 &&
                _.map(typeParams, function(t) { return t.val }).indexOf(type) !== -1) {

                WHO.markerview.setFilter({type: type, time: time});
                this.navigate(time + '/' + type, {trigger: false});
                state['time'] = time;
                state['type'] = type;
            }

            else {
                WHO.markerview.setFilter({type: defaultType, time: 'recent'});
                this.navigate('recent/' + defaultType, {trigger: false});
                state['time'] = 'recent';
                state['type'] = defaultType;
            }

            WHO.markerview.load();

        },

        set: function(key, val) {
            state[key] = val;
            this.navigate(state['time'] + '/' + state['type'], {trigger: true});
        }
    });

})();
