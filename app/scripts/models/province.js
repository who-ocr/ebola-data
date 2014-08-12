/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Province = Backbone.Model.extend({

        url: '',

        initialize: function() {
        },

        defaults: {
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

})();
