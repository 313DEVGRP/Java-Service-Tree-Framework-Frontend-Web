////////////////////////////////////////////////////////////////////////////////////////
//Page 전역 변수
////////////////////////////////////////////////////////////////////////////////////////
var dataTableRef;
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
		[
			"css/searchEngine.css",
			"js/searchEngine/searchApiModule.js"
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
							CKEDITOR.replace("modal_detail_log_log",{ skin: "office2013" });
							// 추가로 에디터 설정이 필요한 경우 여기에 추가
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);


			eventListenersActivator();
			//페이지 로드 시  - 상단 검색 확인
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
		$("#nav-search-input").val("");
		setParameter("searchString",$("#search-input").val());
		search_start($("#search-input").val());
	});

	//검색 결과 리스트 클릭 이벤트
	$("#search_main_wrapper .search_result_group .search_result_items").on("click", function (event) {
		console.log($(event.target).closest(".search-result")[0]);
		var clicked_content_id = $(event.target).closest(".search-result").find(".search_head").attr("id");
		let section_and_order = getDataSectionAndOrder(clicked_content_id);

		SearchApiModule.mapDataToModal(section_and_order["search_section"], section_and_order["order"]);
	});
}

//////////////////////
// 페이지 누를때 동작
//////////////////////
function search(search_section, page) {
	var search_string = $("#search-input").val();
	var pageSize = 10;

	$.ajax({
		url: "/engine-search-api/engine/jira/dashboard/search/"+search_section,
		type: "GET",
		data: { "search_string": search_string, "page" : page, "size": pageSize },
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: search_start] :: jiraissue_search_results => ");
			console.log(result);
			let showPage = page+1; // 보여주는 페이지
			SearchApiModule.setSearchResult(search_section,result, showPage, pageSize);
			let pageStart = Math.floor(page / 10) * 10 + 1;
			SearchApiModule.updateButtons(search_section, pageStart);
		}
	});
}


function search_start(search_string) {
	console.log("[searchEngine :: search_start] :: search_string => " + search_string);

	$.ajax({
		url: "/engine-search-api/engine/jira/dashboard/search/jiraissue",
		type: "GET",
		data: { "search_string": search_string, "page" : 0, "size": 10 },
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: search_start] :: jiraissue_search_results => ");
			console.log(result);

			const current_page = 1; //현재 페이지 초기화
			const items_per_Page = 10; //페이지당 아이템 수
			SearchApiModule.setSearchResult("jiraissue",result, current_page, items_per_Page);

		}
	});

	$.ajax({
		url: "/engine-search-api/engine/jira/dashboard/search/log",
		type: "GET",
		data: { "search_string": search_string, "page" : 0, "size": 10 },
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: search_start] :: fluentd_search_results => ");
			console.log(result);
			const current_page = 1; //현재 페이지 초기화
			const items_per_Page = 10; //페이지당 아이템 수
			SearchApiModule.setSearchResult("log", result, current_page, items_per_Page);
		}
	});
}


/////////////////////////////////////
// 클릭한 아이디에서 section과 결과순서 가져오기
/////////////////////////////////////
function getDataSectionAndOrder(id) {
	const targetId = id;
	const matches = targetId.match(/hits_order_(jiraissue|log)_(\d+)/);
	let returnVal = {"search_section": null, "order": null};

	if (matches) {
		returnVal["search_section"] = matches[1];
		returnVal["order"] = matches[2];
		console.log("[searchEngine :: getDataSectionAndOrder] :: section -> " + matches[1] + ", order -> " + matches[2]);
		return returnVal;
	} else {
		console.log("[searchEngine :: getDataSectionAndOrder] No Match Found :: id -> " + targetId);
		return returnVal;
	}
}

////////////////////////////////////////
// 페이지 로드 시, 상단 검색어 기입 확인
////////////////////////////////////////
function checkQueryStringOnUrl() {
	var queryString = window.location.search;
	var urlParams = new URLSearchParams(queryString);
	var searchTerm = urlParams.get("searchString");
	if (searchTerm) {
		console.log("[searchEngine :: checkQueryStringOnUrl] :: 상단_검색 검색어 => " + searchTerm);
		$("#search-input").val(searchTerm);
		search_start(searchTerm);
	} else {
		console.log("[searchEngine :: checkQueryStringOnUrl] :: 상단_검색 검색어가 없습니다.");
	}
}


function changePage(search_section,page) {
	console.log("[searchEngine :: chagne] :: search_section -> " +search_section + ", page -> " +page);
	let requestPage = page-1 ;
	if(requestPage < 0) {
		requestPage = 0;
	}
	search(search_section, requestPage);
}