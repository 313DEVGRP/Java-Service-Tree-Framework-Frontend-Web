////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;
var dataTableRef;

var selectedIssue;    //선택한 이슈
var selectedIssueKey; //선택한 이슈 키

var dashboardColor;
var labelType, useGradients, nativeTextSupport, animate; //투입 인력별 요구사항 관여 차트

function execDocReady() {

	var pluginGroups = [
		["../reference/light-blue/lib/vendor/jquery.ui.widget.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
			"../reference/light-blue/lib/jquery.iframe-transport.js",
			"../reference/light-blue/lib/jquery.fileupload.js",
			"../reference/light-blue/lib/jquery.fileupload-fp.js",
			"../reference/light-blue/lib/jquery.fileupload-ui.js",
			//"../reference/jquery-plugins/d3-7.8.2/dist/d3.js",
			"../reference/jquery-plugins/d3-v4.13.0/d3.v4.min.js", //d3 변경
			"../reference/c3/c3.min.css",
			"../reference/c3/c3-custom.css",
			"../reference/c3/c3.min.js",
			"./js/common/colorPalette.js",
			"./mock/versionGauge.json",
			"../reference/jquery-plugins/info-chart-v1/js/D.js",
			"./js/dashboard/chart/timeline_custom.js",
			"./js/dashboard/chart/infographic_custom.css"
		],

		["../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

		["../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js",
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			// 투입 인력별 요구사항 관여 차트
			"../reference/jquery-plugins/Jit-2.0.1/jit.js",
			"../reference/jquery-plugins/Jit-2.0.1/Examples/css/Treemap.css",
			// 제품-버전-투입인력 차트
			"../reference/jquery-plugins/d3-sankey-v0.12.3/d3-sankey.min.js"],

		["../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {

			//vfs_fonts 파일이 커서 defer 처리 함.
			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 3000); // 2초 후에 실행됩니다.
			console.log('모든 플러그인 로드 완료');

			// 사이드 메뉴 색상 설정
			$('.widget').widgster();
			setSideMenu("sidebar_menu_dashboard");

			dashboardColor = dashboardPalette.dashboardPalette04;
			console.log(dashboardColor);

			//제품(서비스) 셀렉트 박스 이니시에이터
			makePdServiceSelectBox();
			//버전 멀티 셀렉트 박스 이니시에이터
			makeVersionMultiSelectBox();

			$('button').on('click', function() {
				// Caching
				var self = $('.active');

				// Check if another element exists after the currently active one otherwise
				// find the parent and start again
				if (self.next().length) {
					self
						.removeClass('active')
						.next()
						.addClass('active');
				} else {
					self
						.removeClass('active')
						.parent()
						.find('span:first')
						.addClass('active');
				}
			});
		})
		.catch(function () {
			console.error('플러그인 로드 중 오류 발생');
		});
}

////////////////////////////////////////////////////////////////////////////////////////
//제품 서비스 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makePdServiceSelectBox() {
	//제품 서비스 셀렉트 박스 이니시에이터
	$(".chzn-select").each(function () {
		$(this).select2($(this).data());
	});

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/pdService/getPdServiceMonitor.do",
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				//////////////////////////////////////////////////////////
				for (var k in data.response) {
					var obj = data.response[k];
					var newOption = new Option(obj.c_title, obj.c_id, false, false);
					$("#selected_pdService").append(newOption).trigger("change");
				}
				//////////////////////////////////////////////////////////
			}
		}
	});


	$("#selected_pdService").on("select2:open", function () {
		//슬림스크롤
		makeSlimScroll(".select2-results__options");
	});

	// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
	$("#selected_pdService").on("select2:select", function (e) {
		// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
		// 디폴트는 base version 을 선택하게 하고 ( select all )
		//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
		bind_VersionData_By_PdService();

		var checked = $("#checkbox1").is(":checked");
		var endPointUrl = "";

		if (checked) {
			endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true";
		} else {
			endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false";
		}

		//이슈리스트 진행 상황
		//getIssueStatus($("#selected_pdService").val(), endPointUrl);
		//통계로드
		//statisticsLoad($("#selected_pdService").val(), null);
		console.log("선택된 제품(서비스) c_id = " + $("#selected_pdService").val());
		statisticsMonitor($("#selected_pdService").val());

		//타임라인
		$("#notifyNoVersion2").hide();
		Timeline.init($("#version-timeline-bar"), graphViewList);

		donutChart();
		combinationChart();

		// 투입 인력별 요구사항 관여 차트 mock 데이터 fetch
		d3.json("./mock/manRequirement.json", function (data) {
			drawManRequirementTreeMapChart(data);
		});

		// 제품-버전-투입인력 차트 mock 데이터 fetch
		d3.json("./mock/productToMan.json", function (data) {
			drawProductToManSankeyChart(data);
		});
	});
} // end makePdServiceSelectBox()

function statisticsLoad(pdservice_id, pdservice_version_id){

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + pdservice_id + "/getStatistics.do?version=" + pdservice_version_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {

				console.log("==== 장지윤 static data");
				console.log(data);

				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);
				}

				$('#req_count').text(data["req"]);
			}
		}
	});

}

////////////////////////////////////////////////////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makeVersionMultiSelectBox() {
	//버전 선택 셀렉트 박스 이니시에이터
	$(".multiple-select").multipleSelect({
		filter: true,
		bubbles: true,
		cancelable: true,
		onClose: function () {
			console.log("onOpen event fire!\n");
			var versionTag = $(".multiple-select").val();
		},
		onChange: function () {

		}
	});
}

function bind_VersionData_By_PdService() {
	$(".multiple-select option").remove();
	$.ajax({
		url: "/auth-user/api/arms/pdService/getVersionList.do?c_id=" + $("#selected_pdService").val(),
		type: "GET",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				//////////////////////////////////////////////////////////
				for (var k in data.response) {
					var obj = data.response[k];
					var newOption = new Option(obj.c_title, obj.c_id, true, false);
					$(".multiple-select").append(newOption);
				}

				if (data.length > 0) {
					console.log("display 재설정.");
				}

				$(".multiple-select").multipleSelect("refresh");
				//////////////////////////////////////////////////////////
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//이슈 리스트 진행 상황
////////////////////////////////////////////////////////////////////////////////////////
function getIssueStatus(selectId, endPointUrl) {
	$.ajax({
		url: "/auth-user/api/arms/reqStatus" + endPointUrl,
		type: "GET",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				//////////////////////////////////////////////////////////
				var resolvedCount = 0;
				var closedCount = 0;
				for (var k in data) {
					var obj = data[k];
					if (obj.state === "resolve") {
						resolvedCount++;
					} else if (obj.state === "closed") {
						closedCount++;
					}
				}
				$("#resolved_count").text(resolvedCount);
				$("#closed_count").text(closedCount);

				drawReqTimeSeries(data)
				//////////////////////////////////////////////////////////
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//프로덕트의 요구사항 해결 추이
////////////////////////////////////////////////////////////////////////////////////////
function drawReqTimeSeries(data) {
	console.log("===장지윤 drawReqTimeSeries");
	console.log(data);

	const data1 = [
		{ser1: 0.3, ser2: 4},
		{ser1: 2, ser2: 16},
		{ser1: 3, ser2: 8}
	];

	const data2 = [
		{ser1: 1, ser2: 7},
		{ser1: 4, ser2: 1},
		{ser1: 6, ser2: 8}
	];

	const margin = {top: 10, right: 10, bottom: 10, left: 10},
		width = 450 - margin.left - margin.right,
		height = 150 - margin.top - margin.bottom;

	const svg = d3.select("#chart_req_timeSeries")
		.append("svg")
		.attr("viewBox", [-10, 0, width + 30, height + 30])
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const x = d3.scaleLinear().range([0,width]);
	const xAxis = d3.axisBottom().scale(x);
	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.attr("class","myXaxis")
		.attr("stroke-width", 0.6)
		.style("font-size", "7px");

	const y = d3.scaleLinear().range([height, 0]);
	const yAxis = d3.axisLeft().scale(y);
	svg.append("g")
		.attr("class","myYaxis")
		.attr("stroke-width", 0.6)
		.style("font-size", "7px");

	function update(data) {

		x.domain([0, d3.max(data, function(d) { return d.ser1 }) ]);
		svg.selectAll(".myXaxis").transition()
			.duration(3000)
			.call(xAxis);

		y.domain([0, d3.max(data, function(d) { return d.ser2  }) ]);
		svg.selectAll(".myYaxis")
			.transition()
			.duration(3000)
			.call(yAxis);

		const u = svg.selectAll(".lineTest")
			.data([data], function(d){ return d.ser1 });

		u
			.join("path")
			.attr("class","lineTest")
			.transition()
			.duration(3000)
			.attr("d", d3.line()
				.x(function(d) { return x(d.ser1); })
				.y(function(d) { return y(d.ser2); }))
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-width", 1.1)
	}

	update(data1)
}
// 1. 제품서비스로만 볼 경우
// 2. 버전만 따로 선택해서 보고싶은 경우.
function statisticsMonitor(pdservice_id, pdservice_version_id) {
	//1. 좌상 게이지 차트.
	//2. Time ( 작업일정 ) - 버전 개수 삽입
	d3.json("/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + pdservice_id,function(json) {
		console.log("================= by YHS");
		console.log(json);

		let versionData = json.pdServiceVersionEntities;
		let version_count = versionData.length;
		console.log("등록된 버전 개수 = " + version_count);
		if(version_count !== undefined) {
			$('#version_count').text(version_count);

			if (version_count >= 0) {
				let today = new Date();
				console.log(today);

				$("#notifyNoVersion").hide();
				$("#project-start").show();
				$("#project-end").show();
				var versionGauge = [];
				versionData.forEach(function (versionElement, idx) {
					console.log(idx);
					console.log(versionElement);
					var gaugeElement = {
						"current_date": today.toString(),
						"version_name": versionElement.c_title,
						"version_id": versionElement.c_id,
						"start_date": (versionElement.c_pds_version_start_date == "start" ? today : versionElement.c_pds_version_start_date),
						"end_date": (versionElement.c_pds_version_end_date == "end" ? today : versionElement.c_pds_version_end_date)
					}
					versionGauge.push(gaugeElement);
				});
				console.log(versionGauge);
				drawVersionProgress(versionGauge);
			}
		}
	});

	//제품서비스 - status 기반
	$.ajax({
		url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + pdservice_id + "/getStatistics.do?version=" + pdservice_version_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				console.log(data);
				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);
				}
				//해당 제품의 총 요구사항 수 (by db, not es)
				$('#active_version_count').text(data["version"]);
				$('#req_count').text(data["req"]);
				$('#linkedIssue_subtask_count').text(+data["issue"]);
			}
		}
	});
}


//
function drawVersionProgress(data) {
	var Needle,
		arc,
		arcEndRad,
		arcStartRad,
		barWidth,   // 색션의 두께
		chart,
		chartInset, // 가운데로 들어간 정도
		el,
		endPadRad,
		height,
		i,
		margin,		// 차트가 그려지는 위치 마진
		needle,		// 침
		numSections,// 색션의 수
		padRad,
		percToDeg, percToRad, degToRad, // 고정
		percent,
		radius, 	// 반지름
		ref,
		sectionIndx, // 색션 인덱스
		sectionPerc, // 색션의 퍼센트
		startPadRad,
		svg,
		totalPercent,
		width,
		versionId,
		versionName,
		waveName;
	
	percent = 0.55;
	barWidth = 25;
	padRad = 0;
	chartInset = 11;
	totalPercent = 0.75;

	margin = {
		top: 20,
		right: 20,
		bottom: 30,
		left: 20
	};

	width = 200;
	height = width;
	radius = Math.min(width, height) / 2.5;

	// percToDeg percToRad degToRad 고정
	percToDeg = function (perc) {
		return perc * 360;
	};

	percToRad = function (perc) {
		return degToRad(percToDeg(perc));
	};

	degToRad = function (deg) {
		return (deg * Math.PI) / 180;
	};
	//
	svg = d3
		.select("#versionGaugeChart")
		.append("svg")
		.attr("viewBox", [29, 19, width - 40, height - 40])
		.append("g");

	chart = svg
		.append("g")
		.attr("transform", "translate(" + (width + margin.left) / 2 + ", " + (height + margin.top) / 2 + ")");

	var tooltip = d3
		.select("#versionGaugeChart")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("color", "black")
		.style("padding", "10px");

	var arc = d3
		.arc()
		.innerRadius(radius * 0.6)
		.outerRadius(radius);

	var outerArc = d3
		.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	var totalDate;
	var startDDay;
	var endDDay;

	numSections = data.length; // 전체 색션의 수(버전의 수)
	sectionPerc = 1 / numSections / 2; //  '/ 2' for Half-circle

	var fastestStartDate;
	var latestEndDate;
	// 가장 빠른날짜, 가장 느린날짜 세팅
	for (var idx = 0; idx < data.length; idx++) {
		if (idx === 0) {
			fastestStartDate = data[idx].start_date;
			latestEndDate = data[idx].end_date;
		} else {
			if (data[idx].start_date < fastestStartDate) {
				fastestStartDate = data[idx].start_date;
			}
			if (data[idx].end_date > latestEndDate) {
				latestEndDate = data[idx].end_date;
			}
		}
	}

	$("#fastestStartDate").text(new Date(fastestStartDate).toLocaleDateString());
	$("#latestEndDate").text(new Date(latestEndDate).toLocaleDateString());

	startDDay = Math.floor(
		Math.abs((new Date(data[0].current_date) - new Date(fastestStartDate)) / (1000 * 60 * 60 * 24))
	);
	endDDay = Math.floor(
		Math.abs((new Date(latestEndDate) - new Date(data[0].current_date)) / (1000 * 60 * 60 * 24)) + 1
	);
	$("#startDDay").text("+ " + startDDay);
	$("#endDDay").text("- " + endDDay);

	totalDate = startDDay + endDDay;

	var mouseover = function (d) {
		var subgroupId = d.version_id;
		var subgroupName = d.version_name;
		var subgroupValue = new Date(d.start_date).toLocaleDateString() + " ~ " + new Date(d.end_date).toLocaleDateString();
		tooltip.html("버전명: " + subgroupName + "<br>" + "기간: " + subgroupValue).style("opacity", 1);
		//var subgroupName = d.mig_wave_link;
		//var subgroupValue = new Date(d.start_date).toLocaleDateString() + " ~ " + new Date(d.end_date).toLocaleDateString();
		//tooltip.html("차수: " + subgroupName + "<br>" + "기간: " + subgroupValue).style("opacity", 1);

		d3.selectAll(".myWave").style("opacity", 0.2);
		d3.selectAll(".myStr").style("opacity", 0.2);
		d3.selectAll(".wave-" + subgroupId).style("opacity", 1);
		//d3.selectAll(".wave-" + subgroupName).style("opacity", 1);
	};

	var mousemove = function (d) {
		tooltip.style("left", d3.mouse(this)[0] + 120 + "px").style("top", d3.mouse(this)[1] + 150 + "px");
	};

	var mouseleave = function (d) {
		tooltip.style("opacity", 0);
		d3.selectAll(".myStr").style("opacity", 1);
		d3.selectAll(".myWave").style("opacity", 1);
	};

	for (sectionIndx = i = 1, ref = numSections; 1 <= ref ? i <= ref : i >= ref; sectionIndx = 1 <= ref ? ++i : --i) {
		arcStartRad = percToRad(totalPercent);
		arcEndRad = arcStartRad + percToRad(sectionPerc);
		totalPercent += sectionPerc;
		startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
		endPadRad = sectionIndx === numSections ? 0 : padRad / 2;
		versionId = data[sectionIndx - 1].version_id;
		versionName = data[sectionIndx - 1].version_name;
		//waveName = data[sectionIndx - 1].mig_wave_link;
		console.log(versionId);
		var sectionData = data[sectionIndx - 1];

		var arc = d3
			.arc()
			.outerRadius(radius - chartInset)
			.innerRadius(radius - chartInset - barWidth)
			.startAngle(arcStartRad + startPadRad)
			.endAngle(arcEndRad - endPadRad);

		var section = chart.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionId);
		//var section = chart.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionName);
		//var section = chart.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + waveName);

		section
			.data([sectionData])
			.enter()
			.append("g")
			.attr("class", "arc chart-color" + sectionIndx + " myWave wave-" + versionId)
			//.attr("class", "arc chart-color" + sectionIndx + " myWave wave-" + versionName)
			//.attr("class", "arc chart-color" + sectionIndx + " myWave wave-" + waveName)
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave)
			.append("path")
			.attr("fill", function (d) {
				return dashboardColor.projectProgressColor[(sectionIndx - 1) % data.length];
			})
			.attr("stroke", "white")
			.style("stroke-width", "0.4px")
			.attr("d", arc);

		chart
			.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionId)
			//.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionName)
			//.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + waveName)
			.append("text")
			.attr("class", "no-select")
			.text(function (d) {
				return getStrLimit(d.mig_wave_name, 5);
			})
			.attr("x", function (d) {
				return arc.centroid(d)[0];
			})
			.attr("y", function (d) {
				return arc.centroid(d)[1] + 2;
			})
			.style("font-size", "7px")
			.attr("text-anchor", "middle");
	}

	Needle = (function () {
		function Needle(len, radius1) {
			this.len = len;
			this.radius = radius1;
		}

		Needle.prototype.drawOn = function (el, perc) {
			el.append("circle")
				.attr("class", "needle-center")
				.attr("cx", 0)
				.attr("cy", -10)
				.attr("r", this.radius)
				.attr("stroke", "white")
				.style("stroke-width", "0.3px");
			return el
				.append("path")
				.attr("class", "needle")
				.attr("d", this.mkCmd(perc))
				.attr("stroke", "white")
				.style("stroke-width", "0.3px");
		};

		Needle.prototype.animateOn = function (el, perc) {
			var self;
			self = this;
			return el
				.selectAll(".needle")
				.transition()
				.delay(500)
				.ease(d3.easeElasticOut)
				.duration(3000)
				.attrTween("progress", function () {
					return function (percentOfPercent) {
						var progress;
						progress = percentOfPercent * perc;
						return d3.select(".needle").attr("d", self.mkCmd(progress));
					};
				});
		};

		Needle.prototype.mkCmd = function (perc) {
			var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
			thetaRad = percToRad(perc / 2);
			centerX = 0;
			centerY = -10;
			topX = centerX - this.len * Math.cos(thetaRad);
			topY = centerY - this.len * Math.sin(thetaRad);
			leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
			leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
			rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
			rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
			return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
		};

		return Needle;
	})();

	needle = new Needle(25, 7.5);

	needle.drawOn(chart, 0);

	needle.animateOn(chart, startDDay / totalDate);
}

////////////////////////////////////////////////////////////////////////////////////////
// 투입 인력별 요구사항 관여 차트 생성
////////////////////////////////////////////////////////////////////////////////////////
function drawManRequirementTreeMapChart(data) {
	if ($("#chart-manpower-requirement").children().length !== 0) {
		$("#chart-manpower-requirement").empty();
	}
	init(data);
}

(function () {
	var ua = navigator.userAgent,
		iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
		typeOfCanvas = typeof HTMLCanvasElement,
		nativeCanvasSupport = typeOfCanvas == "object" || typeOfCanvas == "function",
		textSupport =
			nativeCanvasSupport && typeof document.createElement("canvas").getContext("2d").fillText == "function";
	//I'm setting this based on the fact that ExCanvas provides text support for IE
	//and that as of today iPhone/iPad current text support is lame
	labelType = !nativeCanvasSupport || (textSupport && !iStuff) ? "Native" : "HTML";
	nativeTextSupport = labelType == "Native";
	useGradients = nativeCanvasSupport;
	animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
	elem: false,
	write: function (text) {
		if (!this.elem) this.elem = document.getElementById("log");
		this.elem.innerHTML = text;
		this.elem.style.left = 500 - this.elem.offsetWidth / 2 + "px";
	}
};

function init(treeMapInfos) {
	//init TreeMap
	var tm = new $jit.TM.Squarified({
		//where to inject the visualization
		injectInto: "chart-manpower-requirement",
		//parent box title heights
		titleHeight: 22,
		//enable animations
		animate: animate,
		//box offsets
		offset: 2.5,
		//Attach left and right click events
		Events: {
			enable: true,
			onClick: function (node) {
				if (node) tm.enter(node);
			},
			onRightClick: function () {
				tm.out();
			}
		},
		duration: 300,
		//Enable tips
		Tips: {
			enable: true,
			//add positioning offsets
			offsetX: 20,
			offsetY: 20,
			//implement the onShow method to
			//add content to the tooltip when a node
			//is hovered
			onShow: function (tip, node, isLeaf, domElement) {
				var html =
					'<div class="tip-title" style="font-size: 13px; font-weight: bolder">' +
					node.name +
					'</div><div class="tip-text">';
				var data = node.data;
				if (data.involvedCount) {
					html +=
						"<div style='white-space: pre-wrap; font-size: 11px;'>관여한 횟수 : <span style='color: lawngreen'>" +
						data.involvedCount +
						"<br/></span></div>";
				}
				if (data.totalInvolvedCount) {
					html +=
						"<div style='white-space: pre-wrap; font-size: 11px;'>작업자가 관여한 총 횟수 : <span style='color: orange'>" +
						data.totalInvolvedCount +
						"<br/></span></div>";
				}
				if (data.image) {
					html += '<img src="' + data.image + '" class="album" />';
				}
				html +=
					"<div style='white-space: pre-wrap; margin-top: 8px; color: #d0d0d0; font-size: 10px'>우클릭 시 뒤로 갑니다.<br/></div>";
				tip.innerHTML = html;
			}
		},
		//Add the name of the node in the correponding label
		//This method is called once, on label creation.
		onCreateLabel: function (domElement, node) {
			if (node.id === "root" || !node.id.includes("app")) {
				var html =
					'<div style="font-size: 13px; font-weight: bolder; text-align: center; margin: 2.5px 0 0 0">' +
					node.name +
					"</div>";
			} else {
				var html =
					'<div style="font-size: 15.5px; font-weight: 600; text-align: center; margin: 2.5px 0 0 0; color: #464649">' +
					// '<span style="color: whitesmoke; -webkit-text-stroke: 0.1px #1A2920;">' +
					node.name +
					// "</span>" +
					"</div>";
			}
			domElement.innerHTML = html;
			var style = domElement.style;
			style.display = "";
			style.border = "1.5px solid transparent";
			// style.borderRadius = "50%";
			domElement.onmouseover = function () {
				style.border = "1.5px solid #9FD4FF";
			};
			domElement.onmouseout = function () {
				style.border = "1.5px solid transparent";
			};
		}
	});
	tm.loadJSON(treeMapInfos);
	tm.refresh();
	//end
	//add events to radio buttons
	var sq = $jit.id("r-sq"),
		st = $jit.id("r-st"),
		sd = $jit.id("r-sd");
	var util = $jit.util;
	util.addEvent(sq, "change", function () {
		if (!sq.checked) return;
		util.extend(tm, new $jit.Layouts.TM.Squarified());
		tm.refresh();
	});
	util.addEvent(st, "change", function () {
		if (!st.checked) return;
		util.extend(tm, new $jit.Layouts.TM.Strip());
		tm.layout.orientation = "v";
		tm.refresh();
	});
	util.addEvent(sd, "change", function () {
		if (!sd.checked) return;
		util.extend(tm, new $jit.Layouts.TM.SliceAndDice());
		tm.layout.orientation = "v";
		tm.refresh();
	});
	//add event to the back button
	var back = $jit.id("back");
	$jit.util.addEvent(back, "click", function () {
		tm.out();
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// 제품-버전-투입인력 차트 생성
////////////////////////////////////////////////////////////////////////////////////////
function drawProductToManSankeyChart(data) {
	console.log("==== 장지윤 data");
	console.log(data);
	SankeyChart.loadChart(data);
}

var SankeyChart = (function ($) {
	"use strict";

	var initSvg = function () {
		var margin = { top: 10, right: 10, bottom: 10, left: 10 };
		var width = document.getElementById("chart-product-manpower").offsetWidth - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;

		var vx = width + margin.left + margin.right;
		var vy = height + margin.top + margin.bottom;

		return d3
			.select("#chart-product-manpower")
			.append("svg")
			.attr("viewBox", "0 0 " + vx + " " + vy)
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	};

	var drawEmptyChart = function () {
		var margin = { top: 10, right: 10, bottom: 10, left: 10 };
		var width = document.getElementById("chart-product-manpower").offsetWidth - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;

		initSvg()
			.append("text")
			.style("font-size", "12px")
			.style("fill", "white")
			.style("font-weight", 5)
			.text("선택된 어플리케이션이 없습니다.")
			.attr("x", width / 2)
			.attr("y", height / 2);
	};

	var loadChart = function (data) {
		var margin = { top: 10, right: 10, bottom: 10, left: 10 };
		var width = document.getElementById("chart-product-manpower").offsetWidth - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;

		var formatNumber = d3.format(",.0f");
		var format = function (d) {
			return formatNumber(d);
		};

		var iconXs = [10, 12, 11.5, 12];
		var nodeIcons = ['<i class="fa fa-cube"></i>', '<i class="fa fa-server"></i>', '<i class="fa fa-database"></i>'];
		var colors = ["#1f77b4", "#2ca02c", "#d62728"];

		var svg = initSvg();

		console.log("=== 장지윤 data");
		console.log(data);

		if (isEmpty(data.nodes)) {
			svg
				.append("text")
				.style("font-size", "12px")
				.style("fill", "white")
				.style("font-weight", 5)
				.text("해당 프로젝트에 매핑된 버전이 없습니다.")
				.attr("x", width / 2)
				.attr("y", height / 2);

			return;
		}

		var sankey = d3.sankey().nodeWidth(36).nodePadding(40).size([width, height]);

		var graph = {
			nodes: [],
			links: []
		};
		var nodeMap = { };

		var color = d3.scaleOrdinal(colors);
		var iconX = d3.scaleOrdinal(iconXs);
		var nodeIcon = d3.scaleOrdinal(nodeIcons);

		data.nodes.forEach(function (nodeInfos) {
			graph.nodes.push(nodeInfos);
		});

		data.links.forEach(function (nodeLinks) {
			graph.links.push(nodeLinks);
		});

		graph.nodes.forEach(function (node) {
			nodeMap[node.id] = node;
		});

		graph.links = graph.links.map(function (link) {
			return {
				source: nodeMap[link.source],
				target: nodeMap[link.target],
				value: 1
			};
		});

		graph = sankey(graph);

		var link = svg
			.append("g")
			.selectAll(".link")
			.data(graph.links)
			.enter()
			.append("path")
			.attr("class", "link")
			.attr("d", d3.sankeyLinkHorizontal())
			.attr("stroke-width", function (d) {
				return d.width;
			});

		link.append("title").text(function (d) {
			return d.source.name + " → " + d.target.name + "\n" + format(d.value);
		});

		var node = svg.append("g").selectAll(".node").data(graph.nodes).enter().append("g").attr("class", "node");

		node
			.append("rect")
			.attr("x", function (d) {
				return d.x0;
			})
			.attr("y", function (d) {
				return d.y0;
			})
			.attr("height", function (d) {
				return d.y1 - d.y0;
			})
			.attr("width", sankey.nodeWidth())
			.style("fill", function (d) {
				return (d.color = color(d.type));
			})
			.style("stroke", function (d) {
				return d3.rgb(d.color).darker(2);
			})
			.append("title")
			.text(function (d) {
				return d.name + "\n" + format(d.value);
			});

		node
			.append("svg:foreignObject")
			.attr("x", function (d) {
				return d.x0 + iconX(d.type);
			})
			.attr("y", function (d) {
				return (d.y1 + d.y0 - 16) / 2;
			})
			.attr("height", "16px")
			.attr("width", "16px")
			.html((d) => nodeIcon(d.type));

		node
			.append("text")
			.attr("x", function (d) {
				return d.x0 > 0 ? d.x0 - 6 : d.x1 - d.x0 + 6;
			})
			.attr("y", function (d) {
				return (d.y1 + d.y0 - 18) / 2;
			})
			.attr("dy", "0.35em")
			.style("fill", function (d) {
				return (d.color = color(d.type));
			})
			.style("text-shadow", function (d) {
				return `0 1px 0 ${(d.color = color(d.type))}`;
			})
			.attr("text-anchor", function (d) {
				return d.x0 > 0 ? "end" : "start";
			})
			.text(function (d) {
				return `[${d.type}]`;
			})
			.filter(function (d) {
				return d.x < width / 2;
			})
			.attr("x", 6 + sankey.nodeWidth())
			.attr("text-anchor", "start");

		node
			.append("text")
			.attr("x", function (d) {
				return d.x0 > 0 ? d.x0 - 6 : d.x1 - d.x0 + 6;
			})
			.attr("y", function (d) {
				return (d.y1 + d.y0 + 18) / 2;
			})
			.attr("dy", ".35em")
			.attr("text-anchor", function (d) {
				return d.x0 > 0 ? "end" : "start";
			})
			.attr("transform", null)
			.text(function (d) {
				return d.name;
			})
			.filter(function (d) {
				return d.x < width / 2;
			})
			.attr("x", 6 + sankey.nodeWidth())
			.attr("text-anchor", "start");
	};

	return { loadChart, drawEmptyChart };
})(jQuery);

function donutChart(pdServiceLink = "10", pdServiceVersionLinks = "10,11,12,13") {
	$.ajax({
		url: "/auth-user/api/arms/dashboard/jira-issue-statuses",
		type: "GET",
		data: {"pdServiceLink": pdServiceLink, "pdServiceVersionLinks": pdServiceVersionLinks},
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				const columnsData = [];

				data.forEach(status => {
					columnsData.push([status.key, status.docCount]);
				});

				let totalDocCount = columnsData.reduce((sum, [_, count]) => sum + count, 0);

				const chart = c3.generate({
					bindto: '#donut-chart',
					data: {
						columns: columnsData,
						type: 'donut',
					},
					donut: {
						title: "Total : " + totalDocCount
					},
					tooltip: {
						format: {
							value: function (value, ratio, id, index) {
								return value;
							}
						},
					},
				});

				$(document).on('click', '#donut-chart .c3-legend-item', function () {
					const id = $(this).text();
					const isHidden = $(this).hasClass('c3-legend-item-hidden');
					let docCount = 0;

					for (const status of data) {
						if (status.key === id) {
							docCount = status.docCount;
							break;
						}
					}
					if (docCount) {
						if (isHidden) {
							totalDocCount -= docCount;
						} else {
							totalDocCount += docCount;
						}
					}
					$('#donut-chart .c3-chart-arcs-title').text("Total : " + totalDocCount);
				});
			}
		}
	});
}

function combinationChart() {
	const monthlyData = {
		"2020-01": {
			"requirementCount": getRandomInt(0, 100),
			"issueStatus": {"Open": getRandomInt(0, 100), "In Progress": getRandomInt(0, 100), "완료됨": getRandomInt(0, 100), "Backlog": getRandomInt(0, 100), "진행 중": getRandomInt(0, 100), "Closed": 1, "Resolved": 1}
		},
		"2020-02": {
			"requirementCount": getRandomInt(0, 100),
			"issueStatus": {"Open": getRandomInt(0, 100), "In Progress": getRandomInt(0, 100), "완료됨": getRandomInt(0, 100), "Backlog": getRandomInt(0, 100), "진행 중": getRandomInt(0, 100), "Closed": 1, "Resolved": 1}
		},
		"2020-03": {
			"requirementCount": getRandomInt(0, 100),
			"issueStatus": {"Open": getRandomInt(0, 100), "In Progress": getRandomInt(0, 100), "완료됨": getRandomInt(0, 100), "Backlog": getRandomInt(0, 100), "진행 중": getRandomInt(0, 100), "Closed": 1, "Resolved": 1}
		},
		"2020-04": {
			"requirementCount": getRandomInt(0, 100),
			"issueStatus": {"Open": getRandomInt(0, 100), "In Progress": getRandomInt(0, 100), "완료됨": getRandomInt(0, 100), "Backlog": getRandomInt(0, 100), "진행 중": getRandomInt(0, 100), "Closed": 1, "Resolved": 1}
		},
	};

	const issueStatusTypes = ['Open', 'In Progress', '완료됨', 'Backlog', '진행 중', 'Closed', 'Resolved'];
	let columnsData = [];

	issueStatusTypes.forEach((status) => {
		const columnData = [status];
		Object.keys(monthlyData).forEach((month) => {
			columnData.push(monthlyData[month].issueStatus[status] || 0);
		});
		columnsData.push(columnData);
	});

	const requirementCounts = ['요구사항'];
	Object.keys(monthlyData).forEach((month) => {
		requirementCounts.push(monthlyData[month].requirementCount);
	});
	columnsData.push(requirementCounts);

	const chart = c3.generate({
		bindto: '#combination-chart',
		data: {
			x: 'x',
			columns: [
				['x', ...Object.keys(monthlyData)],
				...columnsData,
			],
			type: 'bar',
			types: {
				'요구사항': 'area',
			},
		},
		axis: {
			x: {
				type: 'category',
			},
		},
	});
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//mock
var graphViewList = [
	{
		title: '엔씨소프트 ( NCSOFT )',
		startDate: '2019.12.30',
		endDate: '2022.11.04',
	},
	{
		title: 'Daumsoft',
		startDate: '2010.12.01',
		endDate: '2011.12.01',
	},
	{
		title: '대성그룹 대성글로벌네트워크 1차',
		startDate: '2008.08.01',
		endDate: '2010.12.01',
	},
	{
		title: '고려대학교 컴퓨터정보통신대학원',
		startDate: '2013.02.01',
		endDate: '2016.07.01',
	},
	{
		title: '대성그룹 대성글로벌네트워크 2차',
		startDate: '2011.12.01',
		endDate: '2013.05.01',
	},
	{
		title: '안철수연구소 ( AHNLAB )',
		startDate: '2013.05.01',
		endDate: '2019.12.30',
	},
];