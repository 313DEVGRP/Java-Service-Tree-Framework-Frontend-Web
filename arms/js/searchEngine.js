////////////////////////////////////////////////////////////////////////////////////////
//Page 전역 변수
////////////////////////////////////////////////////////////////////////////////////////
var dataTableRef;
var pieChart;
var windowCount = 0;
var linuxCount = 0;
var unixCount = 0;
var etcCount = 0;
var footerCheck = 0;
var activeTab;
var selectedStorData;
var datatableCallback_DuplicateDefence = 0;
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
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"
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
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"
		],
		[	"css/searchEngine.css"

		]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			console.log("모든 플러그인 로드 완료");
			//상단 메뉴
			//setSideMenu("sidebar_menu_searchEngine", "sidebar_menu_searchEngine");
			$(".widget").widgster();

			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 2000); // 2초 후에 실행됩니다.

			// --- 에디터 설정 --- //
			var waitCKEDITOR = setInterval(function () {
				try {
					if (window.CKEDITOR) {
						if(window.CKEDITOR.status == "loaded"){
							// 모달의 에디터를 각 모달 종류마다 해야하는지 검토.
							CKEDITOR.replace("modal_detail_log",{ skin: "office2013" });
							CKEDITOR.replace("modal_detail_log_jiraissue",{ skin: "office2013" });
							// 추가로 에디터 설정이 필요한 경우 여기에 추가
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);


			eventListenersActivator();
			
			//상단 검색 확인
			checkQueryStringOnUrl();
		})
		.catch(function (e) {
			console.error("플러그인 로드 중 오류 발생");
		});
}



////////////////////////////////////////////////////////////////////////////////////////
// --- 데이터 테이블 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function dataTableLoad() {
	// 데이터 테이블 컬럼 및 열그룹 구성
	var columnList = [
		{ name: "c_id", title: "제품(서비스) 아이디", data: "c_id", visible: false },
		{
			name: "c_title",
			title: "제품(서비스) 이름",
			data: "c_title",
			render: function (data, type, row, meta) {
				if (type === "display") { //// 렌더링 시 이름을 라벨로 감싸서 표시
					return '<label style="color: #a4c6ff">' + data + "</label>";
				}

				return data;
			},
			className: "dt-body-left",  // 좌측 정렬
			visible: true
		}
	];
	var rowsGroupList = [];
	var columnDefList = [];
	var selectList = {};
	var orderList = [[0, "asc"]];
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

	var jquerySelector = "#pdservice_table";
	var ajaxUrl = "/auth-user/api/arms/pdService/getPdServiceMonitor.do";
	var jsonRoot = "response";
	var isServerSide = false;
	console.log("jsonRoot:", jsonRoot);

	dataTableRef = dataTable_build(
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
	console.log(selectedData);
}

function dataTableDrawCallback(tableInfo) {
}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(settings, json) {
}

function dataTableDrawCallback(tableInfo) {
	console.log(tableInfo);
}

////////////////////////////////////////////////////////////////////////////////////////
// --- 데이터 테이블 유틸 기능 설정 ( export ) --- //
////////////////////////////////////////////////////////////////////////////////////////
function dataTableUtilBtn() {
	$("#copychecker").on("click", function () {
		dataTableRef.button(".buttons-copy").trigger();
	});
	$("#printchecker").on("click", function () {
		dataTableRef.button(".buttons-print").trigger();
	});
	$("#csvchecker").on("click", function () {
		dataTableRef.button(".buttons-csv").trigger();
	});
	$("#excelchecker").on("click", function () {
		console.log("excelchecker");
		dataTableRef.button(".buttons-excel").trigger();
	});
	$("#pdfchecker").on("click", function () {
		dataTableRef.button(".buttons-pdf").trigger();
	});
}



/////////////////////////
//이벤트 리스너 활성화
/////////////////////////
function eventListenersActivator() {

	$("#search-input").on("keyup", function (event) {
		if (event.keyCode === 13) { // 엔터의 keyCode 13
			console.log("[searchEngine :: search-input] :: 검색어 입력 값 => " + $("#search-input").val());
			$("#search-button").click(); //검색시작 트리거 역할
		}
	});

	$("#search-button").on("click", function (event) {
		console.log("[searchEngine :: search_start] :: search-button 동작 -> 검색을 실행");

		search_start($("#search-input").val());
		//getMockJsonData();
	});

	//검색 결과 리스트 클릭 이벤트
	$("#search_main_wrapper").on("click", function (event) {
		console.log($(event.target).closest(".search-result")[0]);
		var clicked_content_id = $(event.target).closest(".search-result").find(".search_head").attr("id");
		var order_of_data = 0;
		if (clicked_content_id && clicked_content_id.includes("jiraissue")) {
			order_of_data = getDataOrder(clicked_content_id);
			mapDataToModal(order_of_data);
		} else {
			console.log("[searchEngine :: eventListenersActivator] :: 클릭한 clicked_content_id 가 유효하지 않거나, id에 jiraissue가 있지 않습니다.");
		}
	});
}

function search_start(search_string) {
	$.ajax({
		url: "/engine-search-api/engine/jira/dashboard/search",
		type: "GET",
		data: { "search_string": search_string },
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: search_start] :: search_string => " + search_string);
			console.log("[searchEngine :: search_start] :: search_results => ");
			console.log(result);

			SearchApi.setSearchResult(result);
			SearchApi.appendSearchResultSections(result);
		}
	});
}


function mapDataToModal(order) {
	const targetData = SearchApi.getSearchResult(order);
	console.log("[searchEngine :: mapDataToModal] :: targetData =>");
	console.log(targetData);
	$("#search_detail_modal_jiraissue #detail_id_jiraissue").text(targetData["id"]);
	$("#search_detail_modal_jiraissue #detail_index_jiraissue").text(targetData["index"]);
	$("#search_detail_modal_jiraissue #detail_score_jiraissue").text(targetData["score"] === null ? "-" : targetData["score"]);
	$("#search_detail_modal_jiraissue #detail_type_jiraissue").text(targetData["type"] === undefined ? " - " : targetData["type"]);
	$("#search_detail_modal_jiraissue #detail_modal_summary_jiraissue").text(targetData["content"]["summary"]);
	$("#search_detail_modal_jiraissue #detail_modal_key_jiraissue").text(targetData["content"]["key"]);
	$("#search_detail_modal_jiraissue #detail_modal_key_jiraissue").text(targetData["content"]["created"]);
	if(targetData["content"]["assignee"]) {
		$("#search_detail_modal_jiraissue #detail_modal_assignee_name_jiraissue")
			.text(targetData["content"]["assignee"]["assignee_displayName"]);	
	} else {
		$("#search_detail_modal_jiraissue #detail_modal_assignee_name_jiraissue").text("담당자 정보 없음");
	}
	
		

	CKEDITOR.instances.modal_detail_log_jiraissue.setData(JSON.stringify(targetData));
}


function getDataOrder(id) {
	var order_of_data; //es 인덱스와 혼란 방지를 위해, order로 사용
	if (id) {
		console.log("[searchEngine :: getDataOrder] :: 파싱할 id =>" + id);
		order_of_data = parseInt(id.match(/\d+/)[0]); // 숫자만 뽑기
		console.log("[searchEngine :: getDataOrder] :: 파싱(숫자만 뽑은) 결과 =>" + order_of_data);
	} else {
		console.log("[searchEngine :: getDataOrder] :: 선택한 항목의 데이터 인덱스(순서)가 없습니다. id =>" + id);
		return null;
	}
	return order_of_data;
}



function getMockJsonData() {
	$.ajax({
		url: "./js/searchEngine/sample_issue_index.json",
		type: "GET",
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: getMockJsonData] :: issue_index.json");

			SearchApi.setSearchResult(result);
			SearchApi.appendSearchResultSections(result);
		}

	});
}

var SearchApi = (function() {
	var searchResult;
	var setSearchResult = function (result) {
		console.log("[SearchApi :: setSearchResult] :: result =>");
		console.log(result);
		searchResult = result;
	};

	var getSearchResult = function (order) {
		return searchResult[order]; // 자료구조 검토
	}

	//////////////////////////////////////////
	// 1. 검색 결과를 바탕으로 content 보여주기
	//////////////////////////////////////////
	var appendSearchResultSections = function (results) {
		const search_result_arr = results;
		var today = new Date();

		$("#jiraissue_section .search_result_group").html("");
		console.log("[searchEngine :: appendSearchResultSections] :: search_result_arr길이 =>" +search_result_arr.length);
		if(search_result_arr && search_result_arr.length !== 0) {
			//해당 search_result_group 내용 초기화
			search_result_arr.forEach(function (content, index) {
				$("#jiraissue_section .search_result_group").append(
					`<section class="search-result">
				<!-- 검색 결과 생성 시, append 하는 방식 -->
				<!-- search_detail_modal + _jiraissue -> 이것도 분기 넣어서 따로 동작하도록 해야함. -->
				<!-- jiraissue, fluentd 등의 분기 조건은 _index 으로 하면 될듯? 인덱스의 명칭에 contains 등을 통해서 분기처리? -->
				<div class="search_head" id="hits_order_jiraissue_${index}" data-toggle="modal" data-target="#search_detail_modal_jiraissue" data-backdrop="false">
					<div class="search_title">
						<span style="font-size: 13px; color:#a4c6ff;">
							<span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
								<img src="http://www.313.co.kr/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
							</span>
							<!-- 지라이슈 summary 나오도록 -->
							&nbsp;${content["content"]["summary"]}							
						</span>
					</div>
					<div class="search_category">
						<p class="text-muted" style="margin: 5px 0;">
							<!--<small>카테고리 fluentd-20240204</small>-->
							<small>${content["index"]}</small>
						</p>
						<p class="text-success" style="margin: 5px 0;">
							<small>${content["content"]["created"]}</small>
						</p>
					</div>
				</div>
				<div class="search_content" style="height: 4rem; line-height: 1.58;  overflow: hidden;">
					<span>
					이슈키: ${content["content"]["key"]} &nbsp;&nbsp; 지라프로젝트: ${content["content"]["project"]["project_name"]} </br>
					생성일: ${content["content"]["created"]} &nbsp;&nbsp;															
					타임스탬프: ${content["content"]["timestamp"]}
					</span>
				</div>
			</section>`
				);
			});
		} else {
			$("#jiraissue_section .search_result_group").append(
				`<section class="search-result">
				<!-- 검색 결과 생성 시, append 하는 방식으로? -->
				<div class="search_head search_none">
					<div class="search_title">
						<span style="font-size: 13px; color:#a4c6ff;">
							<span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
								<img src="http://www.313.co.kr/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
							</span>
							<!-- 지라이슈 summary 나오도록 -->
							&nbsp; 검색 결과가 없습니다. &nbsp;
						</span>
					</div>
					<div class="search_category">
						<p class="text-muted" style="margin: 5px 0;">
							<!--<small>카테고리 fluentd-20240204</small>-->
							<small> - </small>
						</p>
						<p class="text-success" style="margin: 5px 0;">
							<small>${today}</small>
						</p>
					</div>
				</div>
				<div class="search_content" style="height: 4rem; line-height: 1.58;  overflow: hidden;">
					<span>
					검색 결과가 없습니다. 현재시각 :: ${today}
					</span>
				</div>
			</section>`
			);
		}
	}

	return {
		setSearchResult,
		getSearchResult,
		appendSearchResultSections
	}
})(); //즉시실행 함수

function checkQueryStringOnUrl() {
	var queryString = window.location.search;
	var urlParams = new URLSearchParams(queryString);
	var searchTerm = urlParams.get("searchString");
	if (searchTerm) {
		console.log("[searchEngine :: checkQueryStringOnUrl] :: 상단_검색 검색어 => " + searchTerm);
		document.getElementById("search-input").value = searchTerm;
		search_start($("#search-input").val());
	} else {
		console.log("[searchEngine :: checkQueryStringOnUrl] :: 상단_검색 검색어가 없습니다.");
	}
}