/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    function convertIds(cases, start, end, increment, props) {
        var zeros = [],
            tail = '';

        for (var i = 0, ii = increment; i < increment; zeros.push('0'), ++i);
        tail = zeros.join('');

        var keys = _.keys(cases),
            newids = {},
            newid;

        for(i = 0, ii = keys.length; i < ii; ++i) {
            // ignore empty strings, they mean nothing
            if (keys[i]) {
                newid = keys[i].substring(start, end).concat(tail);

                if (!newids[newid]) {
                    newids[newid] = _.clone(cases[keys[i]]);
                } else {
                    _.each(props, function(prop) {
                        newids[newid][prop] += cases[keys[i]][prop]
                    });
                }
            }

        }

        return newids;
    }

    WHO.Views.Marker = Backbone.View.extend({

        initialize: function (options) {
            this.layers = [];
            this.popup = new L.Popup({ autoPan: false });
            this.maptype = WHO.getMapType(WHO.map.getZoom());

            this.listenToOnce(this.collection, 'loaded', this.getCases);
            this.listenToOnce(this.model, 'change', this.render);
        },

        featureChange: function(type) {
            if (type === this.maptype) {
                return;
            }
            this.maptype = type;
            this.getCases();
        },

        addLayers: function(type) {
            this.maptype = type;
            this.getCases();
        },

        removeLayers: function() {
            _.each(this.layers, function(layer) {
                WHO.map.removeLayer(layer);
            });
        },

        getCases: function () {

            //*********** Aggregating cases ***********//
            var cases = {}, category, tmpid,
                admin, adminCode,
                model, geo, geoid;

            switch(this.maptype) {
                case 'country':
                    admin = 'ADM0_NAME';
                    adminCode = 'ADM2_CODE';
                    break;
                case 'province':
                    admin = 'ADM1_NAME';
                    adminCode = 'ADM2_CODE';
                    break;
                case 'district':
                    admin = 'ADM2_NAME';
                    adminCode = 'ADM2_CODE';
            }

            for(var i = 0, ii = this.collection.models.length; i < ii; ++i) {
                model = this.collection.models[i];
                category = model.get('category');
                geo = model.get(admin);
                geoid = model.get(adminCode);

                if (!cases[geoid]) {
                    cases[geoid] = {
                        name: geo,
                        confirmed: 0,
                        probable: 0,
                        suspected: 0,
                        total: 0,
                        hcw: 0,
                        deaths: 0,
                        recent: 0,
                        country: model.get('ADM0_NAME')
                    };
                }

                cases[geoid][category] += 1;
				
                if (model.get('HCW') === 'TRUE') { cases[geoid].hcw += 1; }
                if (model.get('outcome') === 'Dead') { cases[geoid].deaths += 1; }
            }

            //*********** Past 7 days ***********//
            var recentCases = this.collection.lastWeek();
            for(i = 0, ii = recentCases.length; i < ii; ++i) {
                cases[recentCases[i][adminCode]].recent += 1;
            }

            //*********** Aggregating on IDS for larger geographies ***********//
            if (this.maptype === 'province' || this.maptype === 'country') {
                var end = this.maptype === 'province' ? 8 : 5;
                cases = convertIds(cases, 0, end, 20 - end,
                                   ['confirmed', 'probable', 'suspected', 'total', 'hcw', 'deaths', 'recent']);
            }
			
			var totalCases = 0;
			
            _.each(cases, function(c) {
                c.total = c.confirmed + c.probable + c.suspected;
                totalCases = totalCases + c.total;
            });
            
            $('body').find('button#case-count').empty();
			$('body').find('button#case-count').append(this.numberWithCommas(totalCases) + ' cases');
			
            this.cases = cases;
            this.render();
        },

        render: function() {

            if (!this.cases || this.model.get('type') !== 'FeatureCollection') {
                var render = $.proxy(this.render, this);
                window.setTimeout(render, 100);
                return;
            }

            if (this.layers.length) {
                this.removeLayers();
            }

            var cases = this.cases,
                maptype = this.maptype,
                clicked = 0,

                popup = this.popup,

                // this is hardcoded at the moment, since we don't have toggles for it atm
                category = 'total',

                max = _.max(_.map(cases, function(c) { return c.total })),
                min = 0,

                scale = d3.scale.linear().domain([0, max])
                    .range([0, 3600]),

                centroids = {
                    type: 'Topology',
                    features: _.chain(this.model.get('features'))
                        .filter(function(feature) { return cases[feature.id]; })
                        .sortBy(function(feature) { return -cases[feature.id][category] })
                        .value()
                },

                target,
                closeTooltip,

                sizeFactor = 0.77868852459,
                opacity = 0.5;

            if (maptype === 'country') {
                sizeFactor = 1.10655737705;
                opacity = 0.5;
            }

            WHO.map.on('popupclose', function () {
               clicked = 0;
            });

            var layer = L.geoJson(centroids, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: Math.sqrt(scale(cases[feature.id][category]) / Math.PI)/sizeFactor,
                        weight: 0,
                        color: '#000',
                        opacity: opacity,
                        fillColor: '#B20000',
                        fillOpacity: opacity,
                    });
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        dblclick: dblClickHandler,
                        mousemove: mouseMoveHandler,
                        mouseout: mouseOutHandler,
                        click: mouseClickHandler,

                    });
                }
            }).addTo(WHO.map);

            var recent = L.geoJson(centroids, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: Math.sqrt(scale(cases[feature.id].recent) / Math.PI)/sizeFactor,
                        weight: 1.5,
                        color: '#660000',
                        opacity: 1,
                        fillColor: '#660000',
                        fillOpacity: 1,
                    });
                },
                filter: function(feature) {
                    return cases[feature.id].recent;
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        dblclick: dblClickHandler,
                        mousemove: mouseMoveHandler,
                        mouseout: mouseOutHandler,
                        click: mouseClickHandler,

                    });
                }
            }).addTo(WHO.map);


            layer.bringToFront();
            recent.bringToFront();

            this.layers.push(layer);
            this.layers.push(recent);

            function dblClickHandler(e) {
                WHO.map.setView(e.latlng, WHO.map.getZoom() + 1);
            }

            function mouseMoveHandler(e) {
                if (clicked == 0){
                    var layer = e.target;
                    popup.setLatLng(e.latlng);
                    var geoType = maptype.charAt(0).toUpperCase() + maptype.slice(1);
                    if (geoType === 'Country') {
                       popup.setContent('<div class="marker-title">' + cases[layer.feature.id].name + '</div>'
                                                     + '<table class="table-striped">'
                                                     + '<tr><td class="cases-total-cell"><span class="cases-total">' +  cases[layer.feature.id].total + '</span>Cases</td></tr>'
                                                     + '</table>');
                    } else {
                       popup.setContent('<div class="marker-title">' + cases[layer.feature.id].name + '</div>'
                                                     + '<div class="location-type">' + geoType + '</div>'
                                                     + '<div class="country-title">' + cases[layer.feature.id].country + '</div>'
                                                     + '<table class="table-striped">'
                                                     + '<tr><td class="cases-total-cell"><span class="cases-total">' +  cases[layer.feature.id].total + '</span>Cases</td></tr>'
                                                     + '</table>');
                    }

                    if (!popup._map) popup.openOn(WHO.map);
                    window.clearTimeout(closeTooltip);
                }
            }


            function mouseOutHandler(e) {
                if (clicked == 0){
                    closeTooltip = window.setTimeout(function() {
                        WHO.map.closePopup();
                    }, 100);
                }
            }

            function mouseClickHandler(e) {
                clicked = 1;
                var layer = e.target,
                d = cases[layer.feature.id];

                popup.setLatLng(e.latlng);
                var geoType = maptype.charAt(0).toUpperCase() + maptype.slice(1);
                if (geoType === 'Country') {
                    popup.setContent('<div class="marker-title">' + cases[layer.feature.id].name + '</div>'
                                   + '<table class="table-striped popup-click">'
                                   + '<tr><td>Confirmed cases</td><td class="cell-value">' + d.confirmed + '</td></tr>'
                                   + '<tr><td>Probable cases</td><td class="cell-value">' + d.probable + '</td></tr>'
                                   + '<tr><td>Suspected cases</td><td class="cell-value">' + d.suspected + '</td></tr>'
                                   + '<tr><td>Health Care Workers Affected</td><td class="cell-value">' + d.hcw + '</td></tr>'
                                   + '<tr><td>Total Deaths</td><td class="cell-value">' + d.deaths + '</td></tr>'
                                   + '<tr><td>Cases in past 7 days</td><td class="cell-value">' + d.recent + '</td></tr></table>');
                } else {
                    popup.setContent('<div class="marker-title">' + cases[layer.feature.id].name + '</div>'
                                   + '<div class="location-type">' + geoType + '</div>'
                                               + '<div class="country-title">' + cases[layer.feature.id].country  + '</div>'
                                   + '<table class="table-striped popup-click">'
                                   + '<tr><td>Confirmed cases</td><td class="cell-value">' + d.confirmed + '</td></tr>'
                                   + '<tr><td>Probable cases</td><td class="cell-value">' + d.probable + '</td></tr>'
                                   + '<tr><td>Suspected cases</td><td class="cell-value">' + d.suspected + '</td></tr>'
                                   + '<tr><td>Health Care Workers Affected</td><td class="cell-value">' + d.hcw + '</td></tr>'
                                   + '<tr><td>Total Deaths</td><td class="cell-value">' + d.deaths + '</td></tr>'
                                   + '<tr><td>Cases in past 7 days</td><td class="cell-value">' + d.recent + '</td></tr></table>');
                }
                if (!popup._map) popup.openOn(WHO.map);
                window.clearTimeout(closeTooltip);
            }
        },


        
        numberWithCommas: function(x) {
        	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }


    });

})();
