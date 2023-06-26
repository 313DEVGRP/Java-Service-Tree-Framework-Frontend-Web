"use strict";

require.config({
    baseUrl: "",
    waitSeconds: 10,

    // Loading Text
    onNodeCreated: function (node, config, moduleName, url) {
        node.addEventListener("load", function () {
            var line = document.createElement("div");
            line.className = "requireLoadingText";
            line.innerHTML = ">> " + moduleName + " has been loaded ( 200 OK )";
            console.log(">> " + moduleName + " has been loaded ( 200 OK )");
        });

        node.addEventListener("error", function () {
            var line = document.createElement("div");
            line.className = "requireLoadingText";
            line.innerHTML = ">>" + "module " + moduleName + " could not be loaded";
        });
    },

    // requirejs config
    paths: {
        // jquery
        "jquery-org": "../reference/lightblue4/docs/lib/jquery/dist/jquery.min",
        "jquery-ui": "../reference/lightblue4/docs/lib/jquery-ui/jquery-ui.min",
        "jquery-pjax": "../reference/lightblue4/docs/lib/jquery-pjax/jquery.pjax",
        "jquery-cookie": "../reference/jquery-plugins/jquery-cookie-1.4.1/jquery.cookie",
        "jquery-maskedinput": "../reference/light-blue/lib/jquery-maskedinput/jquery.maskedinput",
        "jquery-autogrow-textarea": "../reference/light-blue/lib/jquery.autogrow-textarea",
        "jquery-ui.touch-punch": "../reference/light-blue/lib/jquery.ui.touch-punch",
        "jquery-nestable": "../reference/light-blue/lib/jquery.nestable",
        "jquery-icheck": "../reference/light-blue/lib/icheck.js/jquery.icheck",
        "jquery-ui.widget": "../reference/light-blue/lib/vendor/jquery.ui.widget",
        "jquery-iframe": "../reference/light-blue/lib/jquery.iframe-transport",
        "jquery-fileupload": "../reference/light-blue/lib/jquery.fileupload",
        "jquery-fileupload-fp": "../reference/light-blue/lib/jquery.fileupload-fp",
        "jquery-fileupload-ui": "../reference/light-blue/lib/jquery.fileupload-ui",
        "jquery-datetimepicker": "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full",
        "jquery-repeater": "../reference/jquery-plugins/jquery.repeater-1.2.1/jquery.repeater",

        "lightblue4-blueimp-Templates":
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl",
        "lightblue4-blueimp-LoadImage":
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image",
        "lightblue4-blueimp-CanvasBlob":
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob",
        "lightblue4-bootstrap": "../reference/lightblue4/docs/lib/bootstrap-sass/assets/javascripts/bootstrap.min",
        "lightblue4-widgster": "../reference/lightblue4/docs/lib/widgster/widgster",
        "lightblue4-underscore": "../reference/lightblue4/docs/lib/underscore/underscore",
        "lightblue4-slimscroll": "../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min",
        "lightblue4-sparkline": "../reference/lightblue4/docs/lib/jquery.sparkline/index",
        "lightblue4-backbone": "../reference/lightblue4/docs/lib/backbone/backbone",
        "lightblue4-localStorage": "../reference/lightblue4/docs/lib/backbone.localStorage/build/backbone.localStorage.min",
        "lightblue4-datepicker": "../reference/light-blue/lib/bootstrap-datepicker",
        "lightblue4-tooltip": "../reference/light-blue/lib/bootstrap/tooltip",

        "lightblue4-messenger": "../reference/lightblue4/docs/lib/messenger/build/js/messenger",
        "lightblue4-theme": "../reference/lightblue4/docs/lib/messenger/build/js/messenger-theme-flat",
        "lightblue4-notifications": "../reference/lightblue4/docs/js/ui-notifications",

        "datatables.net": "../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min",
        "datatables.net-buttons":
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min",
        "datatables.net-rowsGroup":
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowGroup.min",
        "datatables.net-responsive":
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min",
        "datatables.net-select":
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min",
        "datatables.net-html5": "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.min",
        "datatables.net-print": "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.min",
        "datatables.net-jszip": "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min",
        "datatables.net-pdfmake": "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min",

        "multi-select-quicksearch": "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch",
        "multi-select": "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select",
        "multi-select2": "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min",
        "multiple-select": "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select",

        "jstree-cookie": "../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie",
        "jstree-hotkeys": "../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys",
        "jstree-org": "../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree",
        "jstree-jNotify": "../reference/jquery-plugins/jnotify_v2.1/jquery/jNotify.jquery.min",

        "ckeditor-org": "../reference/jquery-plugins/ckeditor4-4.16.1/ckeditor",

        common: "./js/common"
    },

    // dependency config
    shim: {
        "jquery-ui": ["jquery-org"],
        "jquery-pjax": ["jquery-org"],
        "jquery-cookie": ["jquery-org"],
        "jquery-maskedinput": ["jquery-org"],
        "jquery-autogrow-textarea": ["jquery-org"],
        "jquery-ui.touch-punch": ["jquery-org"],
        "jquery-nestable": ["jquery-org"],
        "jquery-icheck": ["jquery-org"],
        "jquery-ui.widget": ["jquery-org"],
        "jquery-iframe": ["jquery-org"],
        "jquery-datetimepicker": ["jquery-org"],
        "jquery-repeater": ["jquery-org"],

        "lightblue4-blueimp-Templates": ["jquery-org"],
        "lightblue4-blueimp-LoadImage": ["jquery-org"],
        "lightblue4-blueimp-CanvasBlob": ["jquery-org"],
        "lightblue4-bootstrap": ["jquery-org"],
        "lightblue4-widgster": ["jquery-org"],
        "lightblue4-underscore": ["jquery-org"],

        "lightblue4-slimscroll": ["jquery-org"],
        "lightblue4-sparkline": ["jquery-org"],
        "lightblue4-backbone": ["jquery-org"],
        "lightblue4-localStorage": ["jquery-org"],
        "lightblue4-tooltip": ["jquery-org"],
        "lightblue4-datepicker": ["jquery-org"],

        "lightblue4-messenger": ["jquery-org"],
        "lightblue4-theme": ["jquery-org", "lightblue4-messenger"],
        "lightblue4-notifications": ["jquery-org", "lightblue4-messenger", "lightblue4-widgster", "jquery-pjax"],

        "datatables.net": ["jquery-org"],
        "datatables.net-buttons": ["jquery-org"],
        "datatables.net-rowsGroup": ["jquery-org"],
        "datatables.net-responsive": ["jquery-org"],
        "datatables.net-select": ["jquery-org"],
        "datatables.net-html5": ["jquery-org"],
        "datatables.net-print": ["jquery-org"],
        "datatables.net-jszip": ["jquery-org"],
        "datatables.net-pdfmake": ["jquery-org"],

        "multi-select-quicksearch": ["jquery-org"],
        "multi-select": ["jquery-org"],
        "multi-select2": ["jquery-org"],
        "multiple-select": ["jquery-org"],

        "jstree-cookie": ["jquery-org"],
        "jstree-hotkeys": ["jquery-org"],
        "jstree-org": ["jquery-org"],
        "jstree-jNotify": ["jquery-org"],

        "ckeditor-org": ["jquery-org"],

        common: [
            "datatables.net",
            "datatables.net-buttons",
            "datatables.net-rowsGroup",
            "datatables.net-responsive",
            "datatables.net-select",
            "datatables.net-html5",
            "datatables.net-print",
            "datatables.net-jszip",
            "datatables.net-pdfmake",

            "lightblue4-slimscroll",
            "lightblue4-sparkline",
            "lightblue4-tooltip",
            "lightblue4-datepicker",

            "lightblue4-messenger",
            "lightblue4-theme",
            //"lightblue4-notifications",

            "jstree-cookie",
            "jstree-hotkeys",
            "jstree-org",
            "jstree-jNotify",

            "multi-select-quicksearch",
            "multi-select",
            "multi-select2",
            "multiple-select",

            "ckeditor-org"
        ]
    }
});

require([
    "jquery-org",
    "jquery-ui",
    "jquery-pjax",
    "jquery-cookie",
    "jquery-maskedinput",
    "jquery-autogrow-textarea",
    "jquery-ui.touch-punch",
    "jquery-nestable",
    "jquery-icheck",
    "jquery-ui.widget",
    "jquery-iframe",
    "jquery-repeater"
    //"jquery-datetimepicker",

    //"lightblue4-backbone"
    //"lightblue4-localStorage"

    // 아래는 전역변수 사용으로 인하여
    // 각 contents.html 페이지에서 <script> 삽입으로 처리
    //"jquery-fileupload"
    // "jquery-fileupload-fp",
    // "jquery-fileupload-ui"

    // "lightblue4-blueimp-Templates",
    // "lightblue4-blueimp-LoadImage",
    // "lightblue4-blueimp-CanvasBlob",
    // "lightblue4-bootstrap",
    // "lightblue4-widgster",
    // "lightblue4-underscore"
], function ($) {
    require(["common"], function () {
        console.log("test");
    });
});
