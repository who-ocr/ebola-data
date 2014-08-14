/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Marker = Backbone.View.extend({

        initialize: function (options) {
            this.listenTo(options.zoom, 'zoom:end', this.getCentroids);
            console.log('in marker init');
        },

        load: function() {
            if (this.collection.length) {
                this.getCentroids();
            }
            else {
                this.listenToOnce(this.collection, 'loaded', this.getCentroids);
                this.collection.query();
            }
        },

        getCentroids: function() {
            // If topojson not loaded yet, load it before drawing
            if (this.model.get('type') !== 'FeatureCollection') {
                this.listenToOnce(this.model, 'change', this.render);
                this.model.fetch();
            }
            else {
                this.render();
            }
        },

        render: function () {
            console.log('in render');
        },

        setFilter: function(filters) {
            this.filters = filters;
        },


    });

})();
