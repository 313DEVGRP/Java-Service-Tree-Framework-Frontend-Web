////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////

function execDocReady() {

	$.when(
		$.getJavascript("../reference/light-blue/lib/vendor/jquery.ui.widget.js"),
		$.getJavascript("../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js"),
		$.getJavascript("../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js"),
		$.getJavascript("../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js"),
		$.getJavascript("../reference/light-blue/lib/jquery.iframe-transport.js"),
		$.getJavascript("../reference/light-blue/lib/jquery.fileupload.js"),
		$.getJavascript("../reference/light-blue/lib/jquery.fileupload-fp.js"),
		$.getJavascript("../reference/light-blue/lib/jquery.fileupload-ui.js"),

		$.getJavascript("../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js"),

		// $.getJavascript("../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js"),
		// $.getJavascript("../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js"),
		// $.getJavascript("../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js"),
		$.getJavascript("../reference/jquery-plugins/jnotify_v2.1/jquery/jNotify.jquery.min.js"),
		$.getStylesheet("../reference/jquery-plugins/jnotify_v2.1/jquery/jNotify.jquery.css"),

		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css"),
		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css"),
		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js")
		//$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"),
		//$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"),
		//$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js")
	).done(function() {

		//좌측 메뉴
		setSideMenu("sidebar_menu_dashboard", "");
	});

}
