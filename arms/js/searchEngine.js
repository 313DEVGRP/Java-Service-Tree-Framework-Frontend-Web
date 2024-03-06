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
		[	// 하이라이트
			"../reference/jquery-plugins/highlight.js-11.9.0/highlight.js/highlight.min.js",
			"../reference/jquery-plugins/highlight.js-11.9.0/src/styles/arta.css",
			// 검색엔진
			"css/searchEngine.css",
			"js/searchEngine/searchApiModule.js",
			//날짜 검색
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",

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

			//highlight.js 설정.
			hljs.highlightAll();
			eventListenersActivator();
			//페이지 로드 시  - 상단 검색 확인
			checkQueryStringOnUrl();
		})
		.catch(function (e) {
			console.error("플러그인 로드 중 오류 발생");
		});
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
		$("#nav-search-input").val("");
		let searchTerm = $("#search-input").val();
		if(searchTerm && searchTerm.trim()) {
			let 검색어 = searchTerm.trim();
			console.log("[searchEngine :: search-button] :: 검색어 -> "+ 검색어.trim());
			setParameter("searchString",검색어);
			search_start(검색어);
		} else {
			console.log("[searchEngine :: search-button] :: 검색어가 없거나 빈값 입니다.");
		}
	});

	//검색 결과 리스트 클릭 이벤트
	$("#search_main_wrapper .search_result_group .search_result_items").on("click", function (event) {
		console.log($(event.target).closest(".search-result")[0]);
		var clicked_content_id = $(event.target).closest(".search-result").find(".search_head").attr("id");
		if (!clicked_content_id.includes("no_search_result")) {
			let section_and_order = getDataSectionAndOrder(clicked_content_id);
			SearchApiModule.mapDataToModal(section_and_order["search_section"], section_and_order["order"]);
		}
	});
}

/////////////////////////
// 페이지 누를때 동작 - 검색
/////////////////////////
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
			SearchApiModule.updateButtons(search_section, showPage, pageStart);
		}
	});
}

/////////////////////////
// 검색어 검색 시작
/////////////////////////
function search_start(search_string) {
	console.log("[searchEngine :: search_start] :: 검색어 => " + search_string);

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