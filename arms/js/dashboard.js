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

	$.getJavascript("./js/dashboard/initChart.js")
	).done(function() {
		//좌측 메뉴
		setSideMenu("sidebar_menu_dashboard", "");
	});


}