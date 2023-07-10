////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;


function execDocReady() {

	$.when(
		// $.getJavascript("../reference/light-blue/lib/vendor/jquery.ui.widget.js"),
		// $.getJavascript("../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js"),
		// $.getJavascript("../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js"),
		// $.getJavascript("../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js"),
		// $.getJavascript("../reference/light-blue/lib/jquery.iframe-transport.js"),
		// $.getJavascript("../reference/light-blue/lib/jquery.fileupload.js"),
		// $.getJavascript("../reference/light-blue/lib/jquery.fileupload-fp.js"),
		// $.getJavascript("../reference/light-blue/lib/jquery.fileupload-ui.js"),

		// $.getJavascript("../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js"),

		// $.getJavascript("../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js"),
		// $.getJavascript("../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js"),
		// $.getJavascript("../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js"),
		// $.getJavascript("../reference/jquery-plugins/jnotify_v2.1/jquery/jNotify.jquery.min.js"),
		// $.getStylesheet("../reference/jquery-plugins/jnotify_v2.1/jquery/jNotify.jquery.css"),

		// $.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css"),
		// $.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css"),
		// $.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css"),
		// $.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js"),
		// $.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js"),
		// $.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js"),
		// $.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js"),
		// $.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js"),
		// $.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js"),
		// $.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js")
		//$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"),
		//$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"),
		//$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js")
	).done(function() {

		//좌측 메뉴
		setSideMenu("sidebar_menu_dashboard", "");
	});


}
var testData = testData(['Search', 'Referral', 'Direct', 'Organic'],
		25),// just 25 points, since there are lots of charts
	pieSelect = d3.select("#sources-chart-pie"),
	pieFooter = d3.select("#data-chart-footer"),
	stackedChart,
	lineChart,
	pieChart,
	barChart;

function pieChartUpdate(d){
	d.disabled = !d.disabled;
	d3.select(this)
		.classed("disabled", d.disabled);
	if (!pieChart.pie.values()(testData).filter(function(d) { return !d.disabled }).length) {
		pieChart.pie.values()(testData).map(function(d) {
			d.disabled = false;
			return d;
		});
		pieFooter.selectAll('.control').classed('disabled', false);
	}
	d3.select("#sources-chart-pie svg").transition().call(pieChart);
}

var lineResize;
function lineChartOperaHack(){
	//lineChart is somehow not rendered correctly after updates. Need to reupdate
	if (navigator.userAgent.indexOf("Opera")){
		clearTimeout(lineResize);
		lineResize = setTimeout(lineChart.update, 300);
	}
}

// test Data.
//use if needed
function sinAndCos() {
	var sin = [],
		cos = [];

	for (var i = 0; i < 100; i++) {
		sin.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) }); //the nulls are to show how defined works
		cos.push({x: i, y: .5 * Math.cos(i/10)});
	}

	return [
		{
			area: true,
			values: sin,
			key: "Sine Wave"
		},
		{
			values: cos,
			key: "Cosine Wave"
		}
	];
}

nv.addGraph(function() {

	/*
     * we need to display total amount of visits for some period
     * calculating it
     * pie chart uses y-property by default, so setting sum there.
     */
	for (var i = 0; i < testData.length; i++){
		testData[i].y = Math.floor(d3.sum(testData[i].values, function(d){
			return d.y;
		}))
	}

	var chart = nv.models.pieChartTotal()
		.x(function(d) {return d.key })
		.margin({top: 0, right: 20, bottom: 20, left: 20})
		.values(function(d) {return d })
		.color(COLOR_VALUES)
		.showLabels(false)
		.showLegend(false)
		.tooltipContent(function(key, y, e, graph) {
			return '<h4>' + key + '</h4>' +
				'<p>' +  y + '</p>'
		})
		.total(function(count){
			return "<div class='visits'>" + count + "<br/> visits </div>"
		})
		.donut(true);
	chart.pie.margin({top: 10, bottom: -20});

	var sum = d3.sum(testData, function(d){
		return d.y;
	});
	pieFooter
		.append("div")
		.classed("controls", true)
		.selectAll("div")
		.data(testData)
		.enter().append("div")
		.classed("control", true)
		.style("border-top", function(d, i){
			return "3px solid " + COLOR_VALUES[i];
		})
		.html(function(d) {
			return "<div class='key'>" + d.key + "</div>"
				+ "<div class='value'>" + Math.floor(100 * d.y / sum) + "%</div>";
		})
		.on('click', function(d) {
			pieChartUpdate.apply(this, [d]);
			setTimeout(function() {
				stackedChart.update();
				lineChart.update();
				barChart.update();

				lineChartOperaHack();
			}, 100);
		});

	d3.select("#sources-chart-pie svg")
		.datum([testData])
		.transition(500).call(chart);
	nv.utils.windowResize(chart.update);

	pieChart = chart;

	return chart;
});

nv.addGraph(function(){
	var chart = nv.models.multiBarChart()
		.margin({left: 30, bottom: 20, right: 0})
		.color(keyColor)
		.controlsColor([$white, $white, $white])
		.showLegend(false);

	chart.yAxis
		.showMaxMin(false)
		.ticks(0)
		.tickFormat(d3.format(',.f'));

	chart.xAxis
		.showMaxMin(false)
		.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });

	d3.select('#sources-chart-bar svg')
		.datum(testData)
		.transition().duration(500).call(chart);

	nv.utils.windowResize(chart.update);

	barChart = chart;

	return chart;
});

nv.addGraph(function() {
	var chart = nv.models.stackedAreaChart()
		.margin({left: 0})
		.color(keyColor)
		.showControls(false)
		.showLegend(false)
		.style("stream")
		.controlsColor([$textColor, $textColor, $textColor]);

	chart.yAxis
		.showMaxMin(false)
		.tickFormat(d3.format(',f'));

	chart.xAxis
		.showMaxMin(false)
		.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });

	d3.select("#sources-chart-stacked svg")
		.datum(testData)
		.transition().duration(500).call(chart);
	nv.utils.windowResize(chart.update);

	chart.stacked.dispatch.on('areaClick.updateExamples', function(e) {
		setTimeout(function() {
			lineChart.update();
			pieChart.update();
			barChart.update();

			pieSelect.selectAll('.control').classed("disabled", function(d){
				return d.disabled;
			});
		}, 100);
	});

	stackedChart = chart;

	return chart;
});

nv.addGraph(function() {
	var chart = nv.models.lineChart()
		.margin({top: 0, bottom: 25, left: 30, right: 0})
		.showLegend(false)
		.color(keyColor);

	chart.yAxis
		.showMaxMin(false)
		.tickFormat(d3.format(',.f'));

	chart.xAxis
		.showMaxMin(false)
		.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });

	//just to make it look different
	testData[0].area = true;
	testData[3].area = true;

	d3.select('#sources-chart-line svg')
		//.datum(sinAndCos())
		.datum(testData)
		.transition().duration(500)
		.call(chart);

	nv.utils.windowResize(chart.update);
	lineChart = chart;

	lineChartOperaHack();

	return chart;
});

function getData() {
	var arr = [],
		theDate = new Date(2012, 1, 1, 0, 0, 0, 0),
		previous = Math.floor(Math.random() * 100);
	for (var x = 0; x < 30; x++) {
		var newY = previous + Math.floor(Math.random() * 5 - 2);
		previous = newY;
		arr.push({x: new Date(theDate.getTime()), y: newY});
		theDate.setDate(theDate.getDate() + 1);
	}
	return arr;
}