/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.Dropdown = Backbone.View.extend({

        template: _.template($('#dropdown-template').html()),
        events: {'click a': 'select'},
        initialize: function (options) {
            this.options = options.options;
            this.selected = this.options[0].display;
            this.render();
        },

        render: function () {
            this.$el.html(this.template({
                options: this.options,
                selected: this.selected
            }));

            this.$selected = this.$('.selected');
            this.$dropdown = this.$('.dropdown');
        },

        select: function(e) {
            e.preventDefault();
            e = e.toElement;
            this.$selected.text(e.innerHTML);
            this.$dropdown.toggleClass('open');

            WHO.router.set(this.className, e.className);
            return false;
        }

    });

})();
