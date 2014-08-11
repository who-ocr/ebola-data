/*global WHO, Backbone*/

WHO.Collections = WHO.Collections || {};

(function () {
    'use strict';

    WHO.Collections.Cases = Backbone.Collection.extend({

        model: WHO.Models.Cases

    });

})();
