/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Marker = Backbone.View.extend({

        initialize: function (options) {
            this.listenTo(options.zoom, 'zoom:end', this.getCentroids);
        },

        load: function(mapType) {
            if (this.collection.length) {
                this.getCentroids();
            }
            else {
                this.listenToOnce(this.collection, 'loaded', this.getCentroids);
                this.collection.query();
            }
        },

        getCentroids: function() {
            console.log(this.collection);
        },

        render: function () {
        },

        setFilter: function(filters) {
            this.filters = filters;
        },


    });

})();
