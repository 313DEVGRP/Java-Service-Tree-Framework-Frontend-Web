////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;

function execDocReady() {

	$.when(

		$.getJavascript("../reference/light-blue/lib/nvd3/lib/d3.v2.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/nv.d3.custom.js"),

		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/scatter.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/axis.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/legend.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/stackedArea.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/stackedAreaChart.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/line.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/pie.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/pieChartTotal.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/stream_layers.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/lineChart.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/multiBar.js"),
		$.getJavascript("../reference/light-blue/lib/nvd3/src/models/multiBarChart.js"),

		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css"),
		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css"),
		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js"),

		$.getJavascript("./js/dashboard/initChart.js")
	).done(function() {
		//좌측 메뉴
		setSideMenu("sidebar_menu_dashboard", "");
	});


}