/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Legend = Backbone.View.extend({

        initialize: function () {
            this.listenTo(this.model, 'zoom:end', this.render);
            this.$country = this.$('.country');
            this.$district = this.$('.district');

            this.onCountry = true;
        },

        render: function (zoom) {
            var level = zoom.level || WHO.defaultZoom;
            if (this.onCountry && level >= 5) {
                this.$country.hide();
                this.$district.show();
                this.onCountry = false;
            }
            else if (!this.onCountry && level < 5) {
                this.$country.show();
                this.$district.hide();
                this.onCountry = true;
            }
        }

    });

})();
