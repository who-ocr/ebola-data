/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Legend = Backbone.View.extend({

        initialize: function () {
            this.$country = this.$('.country');
            this.$district = this.$('.district');
            this.$title = this.$('#geography-zoom-level');
            this.onLevel = 'country';
        },

        featureChange: function(type) {
            // changing out the legend
            if (type === 'country' && this.onLevel !== 'country') {
                this.$country.show();
                this.$district.hide();
                this.onCountry = true;
            }

            else if (type !== 'country' && this.onLevel === 'country') {
                this.$country.hide();
                this.$district.show();
                this.onCountry = false;
            }

            // changing out the text
            if (this.onLevel !== type) {
                this.$title.text(type + '-level response');
                this.onLevel = type;
            }

        }

    });

})();
