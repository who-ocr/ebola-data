/*global WHO, Backbone*/

WHO.Models = WHO.Models || {};

(function () {
    'use strict';

    WHO.Models.Clinics = Backbone.Model.extend({
        initialize: function () {
            this.ref = new Firebase('https://who-ocr-dev.firebaseio.com/clinics_aug29');
        },

        query: function () {
            var onload = $.proxy(this.onload, this);
            this.ref.once("value", onload);
        },

        onload: function(snap) {
            var clinics = snap.val()
            this.set(topojson.feature(clinics, clinics.objects.clinics_aug29));
            this.trigger('loaded');
        }
    });
})();
