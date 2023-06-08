////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;


function execDocReady() {
	//좌측 메뉴
	setSideMenu("sidebar_menu_dashboard", "");

	var testData = testData(["Search", "Referral", "Direct", "Organic"], 25), // just 25 points, since there are lots of charts
		pieSelect = d3.select("#sources-chart-pie"),
		pieFooter = d3.select("#data-chart-footer"),
		stackedChart,
		lineChart,
		pieChart,
		barChart;

	function pieChartUpdate(d) {
		d.disabled = !d.disabled;
		d3.select(this).classed("disabled", d.disabled);
		if (
			!pieChart.pie
				.values()(testData)
				.filter(function (d) {
					return !d.disabled;
				}).length
		) {
			pieChart.pie
				.values()(testData)
				.map(function (d) {
					d.disabled = false;
					return d;
				});
			pieFooter.selectAll(".control").classed("disabled", false);
		}
		d3.select("#sources-chart-pie svg").transition().call(pieChart);
	}

	var lineResize;
	function lineChartOperaHack() {
		//lineChart is somehow not rendered correctly after updates. Need to reupdate
		if (navigator.userAgent.indexOf("Opera")) {
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
			sin.push({ x: i, y: i % 10 == 5 ? null : Math.sin(i / 10) }); //the nulls are to show how defined works
			cos.push({ x: i, y: 0.5 * Math.cos(i / 10) });
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

	nv.addGraph(function () {
		/*
		 * we need to display total amount of visits for some period
		 * calculating it
		 * pie chart uses y-property by default, so setting sum there.
		 */
		for (var i = 0; i < testData.length; i++) {
			testData[i].y = Math.floor(
				d3.sum(testData[i].values, function (d) {
					return d.y;
				})
			);
		}

		var chart = nv.models
			.pieChartTotal()
			.x(function (d) {
				return d.key;
			})
			.margin({ top: 0, right: 20, bottom: 20, left: 20 })
			.values(function (d) {
				return d;
			})
			.color(COLOR_VALUES)
			.showLabels(false)
			.showLegend(false)
			.tooltipContent(function (key, y, e, graph) {
				return "<h4>" + key + "</h4>" + "<p>" + y + "</p>";
			})
			.total(function (count) {
				return "<div class='visits'>" + count + "<br/> visits </div>";
			})
			.donut(true);
		chart.pie.margin({ top: 10, bottom: -20 });

		var sum = d3.sum(testData, function (d) {
			return d.y;
		});
		pieFooter
			.append("div")
			.classed("controls", true)
			.selectAll("div")
			.data(testData)
			.enter()
			.append("div")
			.classed("control", true)
			.style("border-top", function (d, i) {
				return "3px solid " + COLOR_VALUES[i];
			})
			.html(function (d) {
				return (
					"<div class='key'>" + d.key + "</div>" + "<div class='value'>" + Math.floor((100 * d.y) / sum) + "%</div>"
				);
			})
			.on("click", function (d) {
				pieChartUpdate.apply(this, [d]);
				setTimeout(function () {
					stackedChart.update();
					lineChart.update();
					barChart.update();

					lineChartOperaHack();
				}, 100);
			});

		d3.select("#sources-chart-pie svg").datum([testData]).transition(500).call(chart);
		nv.utils.windowResize(chart.update);

		pieChart = chart;

		return chart;
	});

	nv.addGraph(function () {
		var chart = nv.models
			.multiBarChart()
			.margin({ left: 30, bottom: 20, right: 0 })
			.color(keyColor)
			.controlsColor([$white, $white, $white])
			.showLegend(false);

		chart.yAxis.showMaxMin(false).ticks(0).tickFormat(d3.format(",.f"));

		chart.xAxis.showMaxMin(false).tickFormat(function (d) {
			return d3.time.format("%b %d")(new Date(d));
		});

		d3.select("#sources-chart-bar svg").datum(testData).transition().duration(500).call(chart);

		nv.utils.windowResize(chart.update);

		barChart = chart;

		return chart;
	});

	nv.addGraph(function () {
		var chart = nv.models
			.stackedAreaChart()
			.margin({ left: 0 })
			.color(keyColor)
			.showControls(false)
			.showLegend(false)
			.style("stream")
			.controlsColor([$textColor, $textColor, $textColor]);

		chart.yAxis.showMaxMin(false).tickFormat(d3.format(",f"));

		chart.xAxis.showMaxMin(false).tickFormat(function (d) {
			return d3.time.format("%b %d")(new Date(d));
		});

		d3.select("#sources-chart-stacked svg").datum(testData).transition().duration(500).call(chart);
		nv.utils.windowResize(chart.update);

		chart.stacked.dispatch.on("areaClick.updateExamples", function (e) {
			setTimeout(function () {
				lineChart.update();
				pieChart.update();
				barChart.update();

				pieSelect.selectAll(".control").classed("disabled", function (d) {
					return d.disabled;
				});
			}, 100);
		});

		stackedChart = chart;

		return chart;
	});

	nv.addGraph(function () {
		var chart = nv.models
			.lineChart()
			.margin({ top: 0, bottom: 25, left: 30, right: 0 })
			.showLegend(false)
			.color(keyColor);

		chart.yAxis.showMaxMin(false).tickFormat(d3.format(",.f"));

		chart.xAxis.showMaxMin(false).tickFormat(function (d) {
			return d3.time.format("%b %d")(new Date(d));
		});

		//just to make it look different
		testData[0].area = true;
		testData[3].area = true;

		d3.select("#sources-chart-line svg")
			//.datum(sinAndCos())
			.datum(testData)
			.transition()
			.duration(500)
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
			arr.push({ x: new Date(theDate.getTime()), y: newY });
			theDate.setDate(theDate.getDate() + 1);
		}
		return arr;
	}

	/**
	 * Util functions
	 */

	function testData(stream_names, points_count) {
		var now = new Date().getTime(),
			day = 1000 * 60 * 60 * 24, //milliseconds
			days_ago_count = 60,
			days_ago = days_ago_count * day,
			days_ago_date = now - days_ago,
			points_count = points_count || 45, //less for better performance
			day_per_point = days_ago_count / points_count;
		return stream_layers(stream_names.length, points_count, 0.1).map(function (data, i) {
			return {
				key: stream_names[i],
				values: data.map(function (d, j) {
					return {
						x: days_ago_date + d.x * day * day_per_point,
						y: Math.floor(d.y * 100) //just a coefficient
					};
				})
			};
		});
	}

	function tsExample(){
		// interface IPerson {
		// 	name: String
		// 	age: Number
		// 	marry: Boolean
		// 	family?: Object
		// 	hobby?: any
		// 	dead?: undefined
		// }


		// class PersonImp implements IPerson{
		// 	// IPerson 을 인용해서,
		// 	// interface에 쓴 값을 다시 constructor안에 선언하는 이유는 interface에 선언한 값은 ~한 속성이 있어야 한다는 규약일뿐 선언된건 없음,
		// 	// class 몸통엔 반드시 멤버속성이 등록되어 있어야 하므로 constructor안에 값을 써 줘야 사용 가능함.
		// 	constructor(public name: string, public age : number , public marry : Boolean, public family? : Object, public	hobby?: any,
		// 		public dead?: undefined ){}
		// }

		// let jeck: IPerson = {name: 'jeck', age:18, marry: false}
		// let {name , age} = jeck
		// console.log(name, age) // jeck, 18

		// // 타입변환
		// const num: number = 123;
		// const str: string = num as string; // num 변수를 string 타입으로 변환

	}

}
