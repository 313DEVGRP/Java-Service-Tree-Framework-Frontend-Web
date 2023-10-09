////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;
var dataTableRef;

var selectedIssue;    //선택한 이슈
var selectedIssueKey; //선택한 이슈 키

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
			"../reference/jquery-plugins/d3-7.8.2/dist/d3.js"],

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
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js"],

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
		getIssueStatus($("#selected_pdService").val(), endPointUrl);
		//통계로드
		statisticsLoad($("#selected_pdService").val(), null);

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