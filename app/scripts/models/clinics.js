/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Clinics = Backbone.Model.extend({
        initialize: function () {
            this.ref = new Firebase('https://luminous-heat-4380.firebaseio.com/ebolaClinics_aug17');
        },

        query: function () {
            var onload = $.proxy(this.onload, this);
            this.ref.once("value", onload);
        },

        onload: function(snap) {
            var clinics = snap.val()
            this.set(topojson.feature(clinics, clinics.objects.ebolaClinics));
            this.trigger('loaded');
        }

    });

})();
