/*global WHO, $*/


window.WHO = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';
        WHO.router = new WHO.Routers.App();
        Backbone.history.start();

    }
};

$(document).ready(function () {
    'use strict';
    WHO.init();
});
