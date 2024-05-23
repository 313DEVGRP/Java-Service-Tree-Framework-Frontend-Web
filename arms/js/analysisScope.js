var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId; // 선택된 버전 아이디
var dataTableRef;
// 최상단 메뉴 변수
var req_state, resource_info, issue_info, period_info, total_days_progress;

var dashboardColor;
var pdServiceData;

var pdServiceListData;
var versionListData;

////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {
	var pluginGroups = [
		[
			"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
			"../reference/light-blue/lib/jquery.iframe-transport.js",
			"../reference/light-blue/lib/jquery.fileupload.js",
			"../reference/light-blue/lib/jquery.fileupload-fp.js",
			"../reference/light-blue/lib/jquery.fileupload-ui.js",
			//chart Colors
			"./js/dashboard/chart/colorPalette.js",
			// Apache Echarts
			"../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js"
		],
		[
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
		],
		[
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js",
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			// 투입 인력별 요구사항 관여 차트
			"../reference/jquery-plugins/Jit-2.0.1/jit.js",
			"../reference/jquery-plugins/Jit-2.0.1/Examples/css/Treemap.css",
			// 제품-버전-투입인력 차트
			"../reference/jquery-plugins/d3-sankey-v0.12.3/d3-sankey.min.js"
		],
		[
			// d3-5.16.0 네트워크 차트
			"../reference/jquery-plugins/d3-5.16.0/d3.min.js",
			// 최상단 메뉴
			"js/analysis/topmenu/topMenuApi.js",
			"js/analysis/topmenu/basicRadar.js",

			// 버전 별 요구사항 현황 (RadialPolarBarChart)
			"js/analysis/resource/chart/nightingaleRosePieChart.js",
			"js/analysis/resource/chart/RadialPolarBarChart.js",

			//CirclePacking with d3 Chart
			"js/analysis/resource/chart/circularPackingChart.js"
		],
		[
			"../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
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
			"../arms/js/analysis/resource/sankey.js"
		]
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
			}, 5000); // 5초 후에 실행됩니다.

			//pdfmake 파일이 커서 defer 처리 함.
			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 5000); // 5초 후에 실행됩니다.

			// 사이드 메뉴 색상 설정
			$(".widget").widgster();
			setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_scope");

			//제품(서비스) 셀렉트 박스 이니시에이터
			makePdServiceSelectBox();

			//버전 멀티 셀렉트 박스 이니시에이터
			makeVersionMultiSelectBox();

			// 높이 조정
			$('.top-menu-div').matchHeight({
				target: $('.top-menu-div-scope')
			});

			dashboardColor = dashboardPalette.dashboardPalette01;

			//d3Chart 그리기
			$.getScript("./js/pdServiceVersion/initD3Chart.js").done(function (script, textStatus) {
				initD3Chart("/auth-user/api/arms/pdService/getD3ChartData.do");
			});
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

///////////////////////
//제품 서비스 셀렉트 박스
//////////////////////
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
				pdServiceListData = [];
				for (var k in data.response) {
					var obj = data.response[k];
					pdServiceListData.push({ "pdServiceId": obj.c_id, "pdServiceName": obj.c_title });
					var newOption = new Option(obj.c_title, obj.c_id, false, false);
					$("#selected_pdService").append(newOption).trigger("change");
				}
				//////////////////////////////////////////////////////////
				console.log("[analysisScope :: makePdServiceSelectBox] :: pdServiceListData => " );
				console.table(pdServiceListData);
			}
		}
	});

	$("#selected_pdService").on("select2:open", function () {
		//슬림스크롤
		makeSlimScroll(".select2-results__options");
	});

	// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
	$("#selected_pdService").on("select2:select", function (e) {
		selectedPdServiceId = $("#selected_pdService").val();
		//refreshDetailChart(); 변수값_초기화();
		// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
		// 디폴트는 base version 을 선택하게 하고 ( select all )
		//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
		bind_VersionData_By_PdService();
	});
} // end makePdServiceSelectBox()

////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////
function makeVersionMultiSelectBox() {
	//버전 선택시 셀렉트 박스 이니시에이터
	$(".multiple-select").multipleSelect({
		filter: true,
		onClose: function () {
			console.log("onOpen event fire!\n");

			var checked = $("#checkbox1").is(":checked");
			var endPointUrl = "";
			var versionTag = $(".multiple-select").val();
			console.log("[ analysisScope :: makeVersionMultiSelectBox ] :: versionTag");
			console.log(versionTag);
			selectedVersionId = versionTag.join(",");

			if (versionTag === null || versionTag == "") {
				alert("버전이 선택되지 않았습니다.");
				return;
			}

			// 최상단 메뉴 세팅
			TopMenuApi.톱메뉴_초기화();
			TopMenuApi.톱메뉴_세팅();

			// Circular Packing with D3 차트
			getReqStatusAndInvolvedAssignees(selectedPdServiceId, selectedVersionId);

			// 네트워크 차트
			statisticsMonitor($("#selected_pdService").val(), selectedVersionId);
			getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);

			// 나이팅게일로즈 차트(pie) - 버전별 요구사항
			getReqPerMappedVersions(selectedPdServiceId, selectedVersionId);

			treeBar();

			var 요구사항_호출_주소 = "/state-per-version/T_ARMS_REQADD_" + selectedPdServiceId + "/getReqAddListByFilter.do?" +
				"pdServiceId="+selectedPdServiceId+"&pdServiceVersionLinks="+selectedVersionId;
			요구사항_현황_데이터_테이블($("#selected_pdService").val(), 요구사항_호출_주소);
			$(".ms-parent").css("z-index", 1000);
		},
		onOpen: function() {
			console.log("open event");
			$(".ms-parent").css("z-index", 9999);
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
				var pdServiceVersionIds = [];
				versionListData = [];
				for (var k in data.response) {
					var obj = data.response[k];
					pdServiceVersionIds.push(obj.c_id);
					versionListData.push(obj);
					var newOption = new Option(obj.c_title, obj.c_id, true, false);
					$(".multiple-select").append(newOption);
				}
				var versionTag = $(".multiple-select").val();
				console.log("[ analysisScope :: bind_VersionData_By_PdService ] :: versionTag");

				console.log(pdServiceVersionIds);
				selectedVersionId = pdServiceVersionIds.join(",");
				console.log("bind_VersionData_By_PdService :: selectedVersionId");
				console.log(selectedVersionId);

				// 최상단 메뉴 세팅
				TopMenuApi.톱메뉴_초기화();
				TopMenuApi.톱메뉴_세팅();

				// Circular Packing with D3 차트
				getReqStatusAndInvolvedAssignees(selectedPdServiceId, selectedVersionId);
				// 네트워크 차트
				statisticsMonitor($("#selected_pdService").val(), selectedVersionId);
				getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);

				// 나이팅게일로즈 차트(pie) - 버전별 요구사항
				getReqPerMappedVersions(selectedPdServiceId, selectedVersionId);

				if (data.length > 0) {
					console.log("display 재설정.");
				}
				treeBar();
				$(".multiple-select").multipleSelect("refresh");

				//요구사항 현황 데이터 테이블 로드
				var 요구사항_호출_주소 = "/state-per-version/T_ARMS_REQADD_" + selectedPdServiceId + "/getReqAddListByFilter.do?" +
					"pdServiceId="+selectedPdServiceId+"&pdServiceVersionLinks="+selectedVersionId;
				요구사항_현황_데이터_테이블($("#selected_pdService").val(), 요구사항_호출_주소);
				//////////////////////////////////////////////////////////
			}
		}
	});
}

// 도넛차트
function donutChart(pdServiceLink, pdServiceVersionLinks) {
	console.log("pdServiceId : " + pdServiceLink);
	console.log("pdService Version : " + pdServiceVersionLinks);
	function donutChartNoData() {
		c3.generate({
			bindto: "#donut-chart",
			data: {
				columns: [],
				type: "donut"
			},
			donut: {
				title: "Total : 0"
			}
		});
	}

	if (pdServiceLink === "" || pdServiceVersionLinks === "") {
		donutChartNoData();
		return;
	}

	const url = new UrlBuilder()
		.setBaseUrl("/auth-user/api/arms/dashboard/aggregation/flat")
		.addQueryParam("pdServiceLink", pdServiceLink)
		.addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
		.addQueryParam("메인그룹필드", "status.status_name.keyword")
		.addQueryParam("하위그룹필드들", "")
		.addQueryParam("크기", 1000)
		.addQueryParam("하위크기", 1000)
		.addQueryParam("컨텐츠보기여부", true)
		.build();

	$.ajax({
		url: url,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (apiResponse) {
				const data = apiResponse.response;
				let 검색결과 = data["검색결과"]["group_by_status.status_name.keyword"];
				if (
					(Array.isArray(data) && data.length === 0) ||
					(typeof data === "object" && Object.keys(data).length === 0) ||
					(typeof data === "string" && data === "{}")
				) {
					donutChartNoData();
					return;
				}

				const columnsData = [];

				검색결과.forEach((status) => {
					columnsData.push([status.필드명, status.개수]);
				});

				let totalDocCount = data.전체합계;

				const chart = c3.generate({
					bindto: "#donut-chart",
					data: {
						columns: columnsData,
						type: "donut"
					},
					donut: {
						title: "Total : " + totalDocCount
					},
					color: {
						pattern: dashboardColor.issueStatusColor
					},
					tooltip: {
						format: {
							value: function (value, ratio, id, index) {
								return value;
							}
						}
					}
				});

				$(document).on("click", "#donut-chart .c3-legend-item", function () {
					const id = $(this).text();
					const isHidden = $(this).hasClass("c3-legend-item-hidden");
					let docCount = 0;

					for (const status of 검색결과) {
						if (status.필드명 === id) {
							docCount = status.개수;
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
					$("#donut-chart .c3-chart-arcs-title").text("Total : " + totalDocCount);
				});
			}
		}
	});
}

// 바차트
function combinationChart(pdServiceLink, pdServiceVersionLinks) {
	function combinationChartNoData() {
		c3.generate({
			bindto: "#combination-chart",
			data: {
				x: "x",
				columns: [],
				type: "bar",
				types: {}
			}
		});
	}

	if (pdServiceLink === "" || pdServiceVersionLinks === "") {
		combinationChartNoData();
		return;
	}

	const url = new UrlBuilder()
		.setBaseUrl("/auth-user/api/arms/dashboard/requirements-jira-issue-statuses")
		.addQueryParam("pdServiceLink", pdServiceLink)
		.addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
		.addQueryParam("메인그룹필드", "pdServiceVersion")
		.addQueryParam("하위그룹필드들", "assignee.assignee_accountId.keyword,assignee.assignee_displayName.keyword")
		.addQueryParam("크기", 1000)
		.addQueryParam("하위크기", 1000)
		.addQueryParam("컨텐츠보기여부", true)
		.build();

	$.ajax({
		url: url,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (apiResponse) {
				const data = apiResponse.response;
				if (
					(Array.isArray(data) && data.length === 0) ||
					(typeof data === "object" && Object.keys(data).length === 0) ||
					(typeof data === "string" && data === "{}")
				) {
					combinationChartNoData();
					return;
				}

				const issueStatusTypesSet = new Set();
				for (const month in data) {
					for (const status in data[month].statuses) {
						issueStatusTypesSet.add(status);
					}
				}
				const issueStatusTypes = [...issueStatusTypesSet];

				let columnsData = [];

				issueStatusTypes.forEach((status) => {
					const columnData = [status];
					for (const month in data) {
						const count = data[month].statuses[status] || 0;
						columnData.push(count);
					}
					columnsData.push(columnData);
				});

				const requirementCounts = ["요구사항"];
				for (const month in data) {
					requirementCounts.push(data[month].totalRequirements);
				}
				columnsData.push(requirementCounts);

				let monthlyTotals = {};

				for (const month in data) {
					monthlyTotals[month] = data[month].totalIssues + data[month].totalRequirements;
				}

				const chart = c3.generate({
					bindto: "#combination-chart",
					data: {
						x: "x",
						columns: [["x", ...Object.keys(data)], ...columnsData],
						type: "bar",
						types: {
							요구사항: "area"
						},
						groups: [issueStatusTypes]
					},
					color: {
						pattern: dashboardColor.accumulatedIssueStatusColor
					},
					onrendered: function () {
						d3.selectAll(".c3-line, .c3-bar, .c3-arc").style("stroke", "white").style("stroke-width", "0.3px");
					},
					axis: {
						x: {
							type: "category"
						}
					},
					tooltip: {
						format: {
							title: function (index) {
								const month = Object.keys(data)[index];
								const total = monthlyTotals[month];
								return `${month} | Total : ${total}`;
							}
						}
					}
				});

				$(document).on("click", "#combination-chart .c3-legend-item", function () {
					const id = $(this).text();
					const isHidden = $(this).hasClass("c3-legend-item-hidden");
					let docCount = 0;

					for (const month in data) {
						if (data[month].statuses.hasOwnProperty(id)) {
							docCount = data[month].statuses[id];
						} else if (id === "요구사항") {
							docCount = data[month].totalRequirements;
						}
					}

					// 월별 통계 값 업데이트
					for (const month in data) {
						if (isHidden) {
							monthlyTotals[month] -= docCount;
						} else {
							monthlyTotals[month] += docCount;
						}
					}
				});
			}
		}
	});
}

function statisticsMonitor(pdservice_id, pdservice_version_id) {
	console.log("[ analysisScope :: statisticsMonitor ] :: pdservice_id => " + pdservice_id);
	console.log("[ analysisScope :: statisticsMonitor ] :: pdservice_version_id => " + pdservice_version_id);

	//1. 좌상 게이지 차트 및 타임라인
	//2. Time ( 작업일정 ) - 버전 개수 삽입
	$.ajax({
		url: "/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + pdservice_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		async: false,
		statusCode: {
			200: function (json) {
				pdServiceData = json;
				console.log("[ analysisScope :: statisticsMonitor ] pdServiceData");
				console.log(json);
				let versionData = json.pdServiceVersionEntities;
			}
		}
	});
}

function getRelationJiraIssueByPdServiceAndVersions(pdServiceLink, pdServiceVersions) {
	$.ajax({
		url: "/auth-user/api/arms/analysis/time/pdService/pdServiceVersions",
		type: "GET",
		data: { pdServiceLink: pdServiceLink, pdServiceVersionLinks: pdServiceVersions },
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		async: false,
		statusCode: {
			200: function (data) {
				// 버전 선택 시 데이터 파싱

				setTimeout(function () {
					console.log("[ analysisScope :: getRelationJiraIssueByPdServiceAndVersions ] 네트워크차트 그리기")
					networkChart(pdServiceVersions, data);
				}, 1500);
			}
		}
	});
}

//네트워크차트
function networkChart(pdServiceVersions, jiraIssueData) {
	$('.network-graph').removeClass('show');
	d3.select("#NETWORK_GRAPH").remove();

	var NETWORK_DATA = {
		nodes: [],
		links: []
	};

	pdServiceData.id = "pdService-"+ pdServiceData.c_id;
	pdServiceData.type = "pdService";
	NETWORK_DATA.nodes.push(pdServiceData);

	var 선택한버전 = pdServiceVersions.split(",").map(Number);
	console.log(" networkChart :: 선택한버전 => " + 선택한버전);
	var versionList = pdServiceData.pdServiceVersionEntities;

	versionList.forEach((item) => {
		if (선택한버전.includes(item.c_id)) {
			item.id = "version-"+item.c_id;
			item.type = "version";
			NETWORK_DATA.nodes.push(item); // 버전 노드 삽입

			console.log(typeof item.id);
			var link = {
				source: item.id,
				target: pdServiceData.id
			};
			NETWORK_DATA.links.push(link);
		}
	});

	var index = {};

	// 지라이슈 노드추가
	jiraIssueData.forEach(function (item) {
		NETWORK_DATA.nodes.push(item);
		index[item.key] = item;
	});

	// 지라이슈 링크추가
	jiraIssueData.forEach(function (item) {
		if (item.isReq === true) { // 요구사항 이슈일 때
			var 버전수 = item.pdServiceVersions.length;
			if (버전수 && 버전수 > 0) {
				for (let i =0; i<버전수; i++) {
					if(선택한버전.includes(item.pdServiceVersions[i])) {
						var reqToVersionLink = {
							source: item.id,
							target: "version-" + item.pdServiceVersions[i]
						}
						NETWORK_DATA.links.push(reqToVersionLink);
					}
				}
			}
		}
		var parentItem = index[item.parentReqKey];
		if (parentItem) {
			var subtaskToReqLink = {
				source: item.id,
				target: parentItem.id
			}
			NETWORK_DATA.links.push(subtaskToReqLink);
		}
	});

	console.log("[ networkChart :: NETWORK_DATA ]");
	console.log(NETWORK_DATA);

	if (NETWORK_DATA.nodes.length === 0) {
		// 데이터가 없는 경우를 체크
		d3.select("#NETWORK_GRAPH").remove();
		d3.select(".network-graph").append("p").text("데이터가 없습니다.");
		return;
	}

	// $('#notifyNoVersion').show();
	d3.select(".network-graph").append("svg").attr("id", "NETWORK_GRAPH");

	/******** network graph config ********/
	var networkGraph = {
		createGraph: function () {
			let links = NETWORK_DATA.links.map(function (d) {
				return Object.create(d);
			});
			let nodes = NETWORK_DATA.nodes.map(function (d) {
				return Object.create(d);
			});

			// 확인
			var fillCircle = function (g) {
				if (g.type === "pdService") {
					return "#c67cff";
				} else if (g.type === "version") {
					return "rgb(255,127,14)";
				} else if (g.isReq === true) {
					return "rgb(214,39,40)";
				} else if (g.isReq === false) {
					return "rgb(31,119,180)";
				} else {
					return "rgb(44,160,44)";
				}
			};

			// 확인
			var typeBinding = function (g) {
				let name = "";

				if (g.type === "pdService") {
					name = "제품(서비스)";
				} else if (g.type === "version") {
					name = "버전";
				} else if (g.isReq === true) {
					name = "요구사항";
				} else if (g.isReq === false) {
					name = "연결된 이슈";
				}

				return "[" + name + "]";
			};

			var nameBinding = function (g) {
				let name = "";

				if (g.type === "pdService") {
					return g.c_title;
				} else if (g.type === "version") {
					return g.c_title;
				} else {
					return g.key;
				}
			};

			let baseWidth = 400;
			let baseHeight = 400;
			let nodeCount = nodes.length;

			let increaseFactor = Math.floor(nodeCount / 100);
			if (nodeCount % 100 !== 0) {
				increaseFactor++;
			}
			baseWidth += increaseFactor * 100;
			baseHeight += increaseFactor * 100;

			let width = baseWidth;
			let height = baseHeight;

			let simulation = d3
				.forceSimulation(nodes)
				.force(
					"link",
					d3
						.forceLink(links)
						.id(function (d) {
							return d.id;
						})
						.distance(30)
				)
				.force("charge", d3.forceManyBody().strength(-1000))
				.force("center", d3.forceCenter(width / 3, height / 3))
				.force("collide", d3.forceCollide().radius(30))
				.force(
					"radial",
					d3
						.forceRadial()
						.radius(10)
						.x(width / 3)
						.y(height / 3)
						.strength(0.5)
				);
			//.force("center", d3.forceCenter(width / 3, height / 3));
			// .force("collide", d3.forceCollide()
			// 	.radius(function(node) {
			// 		var linkCount = countLinks(node, links	);
			// 		return 5 * linkCount;
			// 	})
			// );
			// .force("collide",d3.forceCollide().radius( function(d){
			// 	console.log(d);
			// 	return 20;
			// }));

			// simulation.stop();

			let svg = d3.select("#NETWORK_GRAPH").attr("viewBox", [0, 0, width, height]);

			let gHolder = svg.append("g").attr("class", "g-holder");

			let link = gHolder
				.append("g")
				.attr("fill", "none")
				.attr("stroke", "gray")
				.attr("stroke-opacity", 1)
				.selectAll("path")
				.data(links)
				.join("path")
				.attr("stroke-width", 1.5);

			/*
            var node = svg.append("g")
                        .selectAll("circle")
                            .data(nodes)
                            .enter()
                            .append("circle")
                                .attr("r", 8)
                                .attr("fill", color)
                                .call(drag(simulation));  // text 라벨 추가를 위해 g로 그룹핑

            node.append("text")
              .text(function(d){ return d.id })
              .style("font-size", "12px") */

			let node = gHolder
				.append("g")
				.attr("class", "circle-node-holder")
				.attr("stroke", "white")
				.attr("stroke-width", 1)
				.selectAll("g")
				.data(nodes)
				.enter()
				.append("g")
				.each(function (d) {
					d3.select(this).append("circle").attr("r", 10).attr("fill", fillCircle(d));
					/*d3.select(this)
                        .append("text").text(d.id)
                        .attr("dy",6)
                        .style("text-anchor","middle")
                        .attr("class", "node-label");*/
				})
				.call(networkGraph.drag(simulation));

			node
				.append("text")
				.attr("x", 11)
				.attr("dy", ".31em")
				.style("font-size", "9px")
				.style("fill", (d) => fillCircle(d))
				.style("font-weight", "5")
				.attr("stroke", "white")
				.attr("stroke-width", "0.3")
				.text((d) => typeBinding(d));

			node
				.append("text")
				.attr("x", 12)
				.attr("dy", "1.5em")
				.style("font-family", "Arial")
				.style("font-size", "10px")
				.style("font-weight", "10")
				.text((d) => nameBinding(d));

			simulation.on("tick", function () {
				link
					.attr("x1", function (d) {
						return d.source.x;
					})
					.attr("y1", function (d) {
						return d.source.y;
					})
					.attr("x2", function (d) {
						return d.target.x;
					})
					.attr("y2", function (d) {
						return d.target.y;
					});

				/*node
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; });*/

				//circle 노드에서 g 노드로 변경
				node.attr("transform", function (d) {
					return "translate(" + d.x + "," + d.y + ")";
				});

				link.attr("d", function (d) {
					var dx = d.target.x - d.source.x,
						dy = d.target.y - d.source.y,
						dr = Math.sqrt(dx * dx + dy * dy);
					return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
				});

				simulation.on("end", () => {

					// 노드 위치의 최소값과 최대값을 구합니다.
					let xExtent = d3.extent(nodes, d => d.x);
					let yExtent = d3.extent(nodes, d => d.y);

					// 노드 위치에 따라 차트의 크기를 설정합니다.
					let chartWidth = xExtent[1] - xExtent[0] + 20;
					let chartHeight = yExtent[1] - yExtent[0] + 20;

					// 화면 크기에 따라 초기 줌 레벨을 설정합니다.
					let scaleX = width / chartWidth;
					let scaleY = height / chartHeight;
					let initScale = Math.min(scaleX, scaleY);
					console.log("initScale : " + initScale);
					let widthPoint = width /3;
					let heightPoint = height / 3;

					if(initScale > 1) {
						initScale = 1;
						widthPoint = width/5;
						heightPoint = height/5;
					}

					let initialTransform = d3.zoomIdentity
						.translate(widthPoint, heightPoint) // 초기 위치 설정
						.scale(initScale); // 초기 줌 레벨 설정

					let zoom = d3
						.zoom()
						.scaleExtent([0.1, 5]) // 줌 가능한 최소/최대 줌 레벨 설정
						.on("zoom", zoomed); // 줌 이벤트 핸들러 설정

					// SVG에 확대/축소 기능 적용
					svg.call(zoom);

					// 초기 줌 설정
					svg.transition().duration(500).call(zoom.transform, initialTransform);

					$('.network-graph').addClass('show');
				});
			});

			function zoomed() {
				// 현재 확대/축소 변환을 얻음
				let transform = d3.event.transform;

				// 모든 노드 및 링크를 현재 확대/축소 변환으로 이동/확대/축소
				gHolder.attr("transform", transform);
			}

			//invalidation.then(() => simulation.stop());
			// $('.network-graph').addClass('show');
			return svg.node();
		},
		drag: function (simulation) {
			function dragstarted(d) {
				if (!d3.event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			}

			function dragged(d) {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
			}

			function dragended(d) {
				if (!d3.event.active) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			}

			return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
		}
	};

	/******** network graph create ********/
	networkGraph.createGraph();
}

function versionUpdateIssueScatterChart(pdservice_id, pdservice_version_id, versionData) {
	console.log("[ analysisScope :: versionUpdateIssueScatterChart ] :: 버전별 요구사항 업데이트 상태 스캐터 차트 버전데이터 = ");
	console.log(versionData);

	var yVersionData = [];
	var xVesrionStartEndData = [];
	var yearData = new Set();
	versionData.forEach(version => {
		yVersionData.push(version.title);
		var arrayData = [version.title, +new Date(version.startDate), +new Date(version.endDate)];
		yearData.add(new Date(version.startDate).getFullYear());
		yearData.add(new Date(version.endDate).getFullYear());
		xVesrionStartEndData.push(arrayData);
	});

	var versionDataMap = versionData.reduce(function(map, obj) {
		map[obj.c_id] = obj;
		return map;
	}, {});

	var dom = document.getElementById('boxplot-scatter-chart-container');

	let myChart = echarts.init(dom, null, {
		renderer: 'canvas',
		useDirtyRect: false
	});

	let colorList = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'];
	let scatterData = [];

	const url = new UrlBuilder()
		.setBaseUrl("/auth-user/api/arms/analysis/time/standard-daily/jira-issue")
		.addQueryParam("pdServiceLink", pdservice_id)
		.addQueryParam("pdServiceVersionLinks", pdservice_version_id)
		.addQueryParam("일자기준", "updated")
		.addQueryParam("메인그룹필드", "isReq")
		.addQueryParam("하위그룹필드들", "pdServiceVersion")
		.addQueryParam("크기", 1000)
		.addQueryParam("하위크기", 1000)
		.addQueryParam("컨텐츠보기여부", true)
		.build();

	$.ajax({
		url: url,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				console.log("[ analysisScope :: versionUpdateIssueScatterChart ] :: 버전별 요구사항 업데이트 상태 스캐터 차트데이터 = ");
				console.log(data);

				let result = Object.keys(data).reduce(
					(acc, date) => {

						if (data[date].requirementStatuses !== null) {
							Object.keys(data[date].requirementStatuses).forEach((versionId) => {
								if (data[date].requirementStatuses[versionId] !== 0) {
									acc.versionScatterData.push([versionDataMap[versionId].title, new Date(date).getTime(), data[date].requirementStatuses[versionId]]);
								}
							});
						}

						return acc;
					},
					{
						versionScatterData: []
					}
				);
				scatterData = result.versionScatterData;

				var option = {
					legend: {
						data: ['요구사항'],
						textStyle: {
							color: '#fff'  // 범례의 텍스트 색상을 설정합니다.
						}
					},
					yAxis: {
						type: 'time',
						axisLabel: {
							interval: 0,
							textStyle: {
								color: "white"
							},
							fontSize: 9,
							rotate: 0,
							formatter: function(params) {
								return formatDate(new Date(params));
							}
						},
						axisTick: { show: false },
						splitLine: {
							show: true,
							lineStyle: {
								color: "rgba(255,255,255,0.2)",
								width: 1,
								type: "dashed"
							}
						},
						// splitNumber: 5, // 라벨의 간격을 조절합니다. 이 값은 원하는 간격에 따라 조절할 수 있습니다.
					},
					xAxis: {
						data: yVersionData.reverse(),
						inverse: true,
						axisLabel: {
							interval: 0,
							textStyle: {
								color: "white"
							}
						}
					},
					series: [
						{
							name: 'Versions',
							type: 'custom',
							itemStyle: {
								color: function(params) {
									return colorList[params.dataIndex % colorList.length];
								}
							},
							renderItem: function(params, api) {
								var categoryIndex = api.value(0);
								var start = api.coord([categoryIndex, api.value(1)]);
								var end = api.coord([categoryIndex, api.value(2)]);
								var gap = 40; // 간격의 크기를 설정
								var width  = (params.coordSys.width - gap * (yVersionData.length - 1)) / yVersionData.length; // 간격을 고려하여 사각형의 너비를 계산합니다.

								if (width > 90) {
									width = 90;
								}

								return {
									type: 'rect',
									shape: {
										x: start[0] - width / 2,
										y: start[1],
										width: width,
										height: end[1] - start[1]
									},
									style: api.style(params.dataIndex) // apply color here
								};
							},
							encode: {
								y: [1, 2],
								x: 0
							},
							data: xVesrionStartEndData
						},
						{
							name: '요구사항',
							type: 'scatter',
							encode: {
								y: 1,
								x: 0
							},
							itemStyle: {
								color: "rgba(255,106,0,0.82)",
								borderColor: '#fff',
								borderWidth: 1
							},
							label: {
								normal: {
									show: true,
									color: "#FFFFFF"
								},
							},
							symbolSize: function (data) {
								let sSize = Math.sqrt(data[2]) * 3;
								if (sSize < 5) {
									sSize = 5;
								}
								return sSize;
							},
							data: scatterData
						}
					],
					tooltip: {
						trigger: 'item',
						formatter: function (params) {
							if (params.seriesType === 'scatter') {
								return params.marker + params.name + '<br/>' + new Date(params.value[1]).toLocaleDateString() + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + params.value[2] + '개<br/>';
							} else {
								var tooltipText = '';
								tooltipText += params.marker + params.name + '<br/><span style="float: right;">' + new Date(params.value[1]).toLocaleDateString()+ " ~ " + new Date(params.value[2]).toLocaleDateString() + '</span>' + '<br/>';
								return tooltipText;
							}
						}
					},
					grid: {
						left: '15%',
						containLabel: false
					}
				};

				if (option && typeof option === 'object') {
					myChart.setOption(option, true);
				}

				window.addEventListener('resize', myChart.resize);
			}
		}
	});
}


function formatDate(date) {
	var year = date.getFullYear().toString().slice(-2); // 연도의 마지막 두 자리를 얻습니다.
	var month = (date.getMonth() + 1).toString().padStart(2, "0");
	var day = date.getDate().toString().padStart(2, "0");
	return year + "-" + month + "-" + day;
}

/////////////////////////////////////////////////////////
// Circular Packing Chart
/////////////////////////////////////////////////////////
function getReqStatusAndInvolvedAssignees(pdServiceId, pdServiceVersionLinks) {

	$.ajax({
		url: "/auth-user/api/arms/analysis/scope/"+pdServiceId+"/req-status-and-reqInvolved-unique-assignees-per-version",
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		data: {"pdServiceVersionLinks" : pdServiceVersionLinks},
		progress: true,
		async: false,
		statusCode: {
			200: function (result) {
				console.log("[ analysisScope :: getReqStatusAndInvolvedAssignees ] :: result");
				console.log(result);
				let pdServiceName;
				pdServiceListData.forEach(elements => {
					if (elements["pdServiceId"] === +pdServiceId) {
						pdServiceName = elements["pdServiceName"];
					}
				});
				let dataObject = {};
				let issueStatusSet = new Set(); // 여기까지 사용
				let issueStatusList = [];
				if (result.length > 0) {
					for (let i = 0; i < result.length; i++) {
						// 버전이름 가져오기
						let versionName =result[i]["버전_문자열"].replaceAll(".","_");

						let verSubObject = {};
						result[i]["요구사항_이슈_키_상태_작업자수_목록"].forEach((element) => {
							// 작업자수가 0이 아닌 요구 사항만 (담당자 배정된 요구사항만)
							verSubObject[element["issueKey"]] =
								{"$count" : element["numOfWorkers"], "$status" : element["statusName"]};
							issueStatusSet.add(element["statusName"]);
						});
						dataObject[versionName] = verSubObject;
					}
				}
				issueStatusSet.forEach(e=>issueStatusList.push(e));
				drawCircularPacking("circularPacking",pdServiceName,dataObject, issueStatusList);
			}
		}
	});

}


/////////////////////////////////////////////////////////
// Radial Polar Bar Chart - 제품(서비스)의 버전별 요구사항 수
/////////////////////////////////////////////////////////
function getReqPerMappedVersions(pdService_id, pdServiceVersionLinks) {
	let reqAddUrl = "/T_ARMS_REQADD_"+ pdService_id +"/getReqAddListByFilter.do?";

	$.ajax({
		url: "/auth-user/api/arms/analysis/scope/req-per-version" +reqAddUrl,
		type: "GET",
		data: {	pdServiceId: pdService_id, pdServiceVersionLinks: pdServiceVersionLinks },
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		async: false,
		statusCode: {
			200: function (result) {
				console.log("[ analysisScope :: getReqPerMappedVersions ] :: result");
				console.log(result);
				const versionNameCountMap = result;
				const outputArray = [];
				for(const key in versionNameCountMap) {
					const value = versionNameCountMap[key];
					outputArray.push({ "name": key, "value": value});
				}
				let colorArr = dashboardColor.nightingaleRose;
				drawRadialPolarBarChart("reqPerVersionRoseChart", outputArray, colorArr);
			}
		}
	});
}

function chord(data) {
	const $container = document.getElementById("circular_sankey");
	const $chart = makeChart(data);

	$container.append($chart);
}

function makeChart(data) {
	const width = 640;
	const height = width;
	const outerRadius = Math.min(width, height) * 0.5 - 30;
	const innerRadius = outerRadius - 20;
	const { names, colors } = data;
	const sum = d3.sum(data.flat());
	const tickStep = d3.tickStep(0, sum, 100);
	const tickStepMajor = d3.tickStep(0, sum, 20);
	const formatValue = d3.formatPrefix(",.0", tickStep);

	const chord = d3
		.chord()
		.padAngle(20 / innerRadius)
		.sortSubgroups(d3.descending);

	const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

	const ribbon = d3.ribbon().radius(innerRadius);

	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [-width / 2, -height / 2, width, height])
		.attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

	const chords = chord(data);

	const group = svg.append("g").selectAll().data(chords.groups).join("g");

	group
		.append("path")
		.attr("fill", (d) => colors[d.index])
		.attr("d", arc)
		.append("title")
		.text((d) => `${d.value.toLocaleString("en-US")} ${names[d.index]}`);

	const groupTick = group
		.append("g")
		.selectAll()
		.data((d) => groupTicks(d, tickStep))
		.join("g")
		.attr("transform", (d) => `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${outerRadius},0)`);

	groupTick.append("line").attr("stroke", "currentColor").attr("x2", 6);

	groupTick
		.filter((d) => d.value % tickStepMajor === 0)
		.append("text")
		.attr("x", 8)
		.attr("dy", ".35em")
		.attr("transform", (d) => (d.angle > Math.PI ? "rotate(180) translate(-16)" : null))
		.attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
		.text((d) => formatValue(d.value));

	svg
		.append("g")
		.attr("fill-opacity", 0.7)
		.selectAll()
		.data(chords)
		.join("path")
		.attr("d", ribbon)
		.attr("fill", (d) => colors[d.target.index])
		.attr("opacity", 0.6)
		.on("mouseenter", function (d) {
			d3.select(this).transition().attr("opacity", 1);
		})
		.on("mouseout", function () {
			d3.select(this).transition().attr("opacity", 0.6);
		})
		.attr("stroke", "white")
		.append("title")
		.text(
			(d) =>
				`${d.source.value.toLocaleString("en-US")} ${names[d.source.index]} → ${names[d.target.index]}${
					d.source.index !== d.target.index
						? `\n${d.target.value.toLocaleString("en-US")} ${names[d.target.index]} → ${names[d.source.index]}`
						: ``
				}`
		);

	return svg.node();
}

function groupTicks(d, step) {
	const k = (d.endAngle - d.startAngle) / d.value;
	return d3.range(0, d.value, step).map((value) => {
		return { value: value, angle: value * k + d.startAngle };
	});
}

function treeBar() {
	const url = new UrlBuilder()
		.setBaseUrl("/auth-user/api/arms/analysis/scope/tree-bar-top10")
		.addQueryParam("pdServiceLink", selectedPdServiceId)
		.addQueryParam("pdServiceVersionLinks", selectedVersionId)
		.addQueryParam('메인그룹필드', "cReqLink")
		.addQueryParam('하위그룹필드들', "assignee.assignee_displayName.keyword")
		.addQueryParam('컨텐츠보기여부', true)
		.addQueryParam("isReqType", "ISSUE")
		.build();

	$.ajax({
		url: url,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		async: false
	})
		.done(function (apiResponse) {
			const data = apiResponse.response;
			console.log("[ analysisScope :: treeBar ] data");
			console.log(data);
			d3.select("#tree_bar_container svg").selectAll("*").remove();

			let assigneeData = data.filter(item => item.type === 'assignee');

			if(assigneeData.length === 0) {
				return;
			}

			if (assigneeData.length === 1 && assigneeData[0].name === "No Data") {
				return;
			}

			let maxValue = Math.max(...assigneeData.map(item => item.value));

			renderTreeBar(data, assigneeData, maxValue);
		})
		.fail(function (e) {})
		.always(function () {});
}

function renderTreeBar(data, assigneeData, maxValue) {
	const charts = document.getElementById("tree_bar_container");
	const $container = document.getElementById("tree_bar_container"),
		width = $container.offsetWidth,
		height = $container.offsetHeight,
		svg = d3.select("#tree_bar_container svg"),
		g = svg.append("g").attr("transform", "translate(10,10)").attr('width', width)
			.attr('height', height)
			.call(responsiveTreeBar),
		experienceName = Array(maxValue).fill("").map((_, i) => (i+1 === maxValue ? maxValue.toString() : "")),
		formatSkillPoints = function (d) {
			return experienceName[d % maxValue];
		},
		xScale = d3.scaleLinear().domain([0, maxValue]).range([0, 100]),
		xAxis = d3.axisTop().scale(xScale).ticks(maxValue).tickFormat(formatSkillPoints),
		tree = d3.cluster().size([height, width - 145]),
		stratify = d3
			.stratify()
			.id((d) => d.id)
			.parentId((d) => d.parent),
		root = stratify(data);

	tree(root);

	const link = g
		.selectAll(".link")
		.data(root.descendants().slice(1))
		.enter()
		.append("path")
		.attr("class", "link")
		.attr("d", function (d) {
			return `M${d.y},${d.x}C${d.parent.y + 100},${d.x} ${d.parent.y + 100},${d.parent.x} ${d.parent.y},${d.parent.x}`;
		});

	const node = g
		.selectAll(".node")
		.data(root.descendants())
		.enter()
		.append("g")
		.attr("class", function (d) {
			return `node${d.children ? " node--internal" : " node--leaf"}`;
		})
		.attr("transform", function (d) {
			return `translate(${d.y}, ${d.x})`;
		});

	node.append("circle").attr("r", 4);

	const leafNodeG = g
		.selectAll(".node--leaf")
		.append("g")
		.attr("class", "node--leaf-g")
		.attr("transform", "translate(" + 8 + "," + -13 + ")");

	leafNodeG
		.append("rect")
		.style("fill", function (d) {
			return d.data.color;
		})
		.attr("width", 2)
		.attr("height", 20)
		.attr("rx", 2)
		.attr("ry", 2)
		.transition()
		.duration(800)
		.attr("width", function (d) {
			return xScale(d.data.value);
		});

	leafNodeG
		.append("text")
		.attr("dy", 14)
		.attr("x", 8)
		.style("text-anchor", "start")
		.text(function (d) {
			return d.data.name;
		});

	const internalNode = g.selectAll(".node--internal");
	internalNode
		.append("text")
		.attr("class", (d) => d.data.id === "1" && "root")
		.attr("y", -10)
		.style("text-anchor", "middle")
		.text(function (d) {
			return d.data.name;
		});

	const firstEndNode = g.select(".node--leaf");
	firstEndNode
		.insert("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(" + 7 + "," + -14 + ")")
		.call(xAxis);

	firstEndNode
		.insert("g")
		.attr("class", "grid")
		.attr("transform", "translate(7," + (height - 15) + ")")
		.call(d3.axisBottom().scale(xScale).ticks(5).tickSize(-height, 0, 0).tickFormat(""));

	svg.selectAll(".grid").select("line").style("stroke-dasharray", "1,1").style("stroke", "white");
	responsiveTreeBar(svg);
}
function responsiveTreeBar(svg) {
	const container = d3.select(svg.node().parentNode),
		width = parseInt(svg.style('width'), 10),
		height = parseInt(svg.style('height'), 10),
		aspect = width / height;

	svg.attr('viewBox', `0 0 ${width} ${height}`)
		.attr('preserveAspectRatio', 'xMinYMid')
		.call(resize);

	d3.select(window).on(
		'resize.' + container.attr('id'),
		resize
	);
	function resize() {
		const w = parseInt(container.style('width')) + 50;
		svg.attr('width', w);
		svg.attr('height', Math.round(w / aspect));
	}
}

////////////////////////////////////////////////////////////////////////////////////////
//요구사항 현황 데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
function 요구사항_현황_데이터_테이블(selectId, endPointUrl) {
	var columnList = [
		{ name: "reqAddEntity.pdServiceEntity.c_id", title: "제품(서비스) 아이디", data: "pdServiceEntity.c_id", visible: false, defaultContent: 'N/A' },
		{
			name: "version_name",
			title: "버전",
			data: "version_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else if (data.includes(",")) {
					let verNameArr = data.split(",");
					let verHtml = ``;
					verNameArr.forEach(verName => {
						verHtml += verName+`<br/>`;
					});
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + verHtml + "</div>";
				} else {
						return "<div style='white-space: nowrap; color: #a4c6ff'>" + getStrLimit(data, 25) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "reqAddEntity.c_title",
			title: "요구사항",
			data: "reqAddEntity.c_title",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + getStrLimit(data, 45) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "reqAddEntity.reqPriorityEntity.c_title",
			title: "우선순위",
			data: "reqAddEntity.reqPriorityEntity.c_title",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + getStrLimit(data, 10) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "reqAddEntity.reqDifficultyEntity.c_title",
			title: "난이도",
			data: "reqAddEntity.reqDifficultyEntity.c_title",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + getStrLimit(data, 10) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "reqAddEntity.reqStateEntity.c_title",
			title: "상태",
			data: "reqAddEntity.reqStateEntity.c_title",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + getStrLimit(data, 10) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];
	var rowsGroupList = [1,2];
	var columnDefList = [
		{
			orderable: false,
			className: "select-checkbox",
			targets: 0
		}
	];
	var orderList = [[1, "asc"]];
	var jquerySelector = "#reqstatustable";
	var ajaxUrl = "/auth-user/api/arms/analysis/scope" + endPointUrl;
	var jsonRoot = "";
	var buttonList = [
		"copy",
		"excel",
		"print",
		{
			extend: "csv",
			text: "Export csv",
			charset: "utf-8",
			extension: ".csv",
			fieldSeparator: ",",
			fieldBoundary: "",
			bom: true
		},
		{
			extend: "pdfHtml5",
			orientation: "landscape",
			pageSize: "LEGAL"
		}
	];
	var selectList = {};
	var isServerSide = false;

	reqStatusDataTable = dataTable_build(
		jquerySelector,
		ajaxUrl,
		jsonRoot,
		columnList,
		rowsGroupList,
		columnDefList,
		selectList,
		orderList,
		buttonList,
		isServerSide
	);
}


// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {

}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(settings, json) {
	console.log("check");
}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();

	$(window).scrollTop(scrollPos);
}

$("#copychecker").on("click", function () {
	reqStatusDataTable.button(".buttons-copy").trigger();
});
$("#printchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-print").trigger();
});
$("#csvchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-csv").trigger();
});
$("#excelchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-excel").trigger();
});
$("#pdfchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-pdf").trigger();
});