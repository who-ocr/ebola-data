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
            if (level < 7 && this.onCountry) {
                this.$country.hide();
                this.$district.show();
                this.onCountry = false;
            }
            else {
                this.$country.show();
                this.$district.hide();
                this.onCountry = true;
            }
        }

    });

})();
