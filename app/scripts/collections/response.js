/*global WHO, Backbone*/

WHO.Collections = WHO.Collections || {};

(function () {
    'use strict';
    WHO.Collections.Response = Backbone.Collection.extend({
        model: WHO.Models.Clinics
    });

})();
