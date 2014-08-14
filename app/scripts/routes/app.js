/*global WHO, Backbone*/

WHO.Routers = WHO.Routers || {};

(function () {
    'use strict';

    var defaultMap = 'cases',
        init = false,
        timeParams = [
            {
                display: 'Most recent',
                val: 'recent'
            },
            {
                display: 'All cases',
                val: 'all'
            }
        ],
        typeParams = [
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
        WHO.collections = {
            cases: new WHO.Collections.Cases(),
            response: new WHO.Collections.Response(),
            globalrisk: new WHO.Collections.GlobalRisk()
        };
        WHO.mapview = new WHO.Views.Map({
            el: '#map', id: 'map', map: WHO.map, collection: WHO.collections.globalrisk
        });
        WHO.models = {};

        WHO.map.whenReady(function() {

            var $toggles = $('<div id="map-overlay-container"></div>').appendTo(
                WHO.$map);

            new WHO.Views.Dropdown({
                id: 'toggle-time',
                el: $('<div id="toggle-time"></div>').appendTo($toggles),
                options: timeParams,
                className: 'time'
            });

            new WHO.Views.Dropdown({
                id: 'toggle-case-type',
                el: $('<div id="toggle-case-type" class="dropdown-container"></div>').appendTo($toggles),
                options: typeParams,
                className: 'type'
            });
        });

        init = true;
    }

    WHO.map = L.mapbox.map('map','nate.map-szf211bp,nate.map-c3e3vgn8')
              .setView([6.0095537, -10.6059403], 5);;

    WHO.$map = $('#map');

    WHO.Routers.App = Backbone.Router.extend({
        routes: {
            ''                              : 'newload',
            ':time/:type'                   : 'newfilter',
        },

        newload: function() {
            bootstrap();
            //WHO.mapview.setFilter({type: 'confirmed', time: 'recent'});
            WHO.mapview.load();
            //this.navigate('recent/confirmed', {trigger: false});
            //state['time'] = 'recent';
            //state['type'] = 'confirmed'
        },

        newfilter: function(time, type) {
            if (!init) bootstrap();
            if (_.map(timeParams, function(t) { return t.val }).indexOf(time) !== -1 &&
                _.map(typeParams, function(t) { return t.val }).indexOf(type) !== -1) {
                WHO.mapview.setFilter({type: type, time: time});
                this.navigate(time + '/' + type, {trigger: false});
                state['time'] = time;
                state['type'] = type;
            }
            else {
                WHO.mapview.setFilter({type: 'confirmed', time: 'recent'});
                this.navigate('recent/confirmed', {trigger: false});
                state['time'] = 'recent';
                state['type'] = 'confirmed'
            }

            WHO.mapview.load();
        },

        set: function(key, val) {
            state[key] = val;
            this.navigate(state['time'] + '/' + state['type'], {trigger: true});
        }
    });

})();
