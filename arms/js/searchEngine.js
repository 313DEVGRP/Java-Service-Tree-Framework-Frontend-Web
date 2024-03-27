////////////////////////////////////////////////////////////////////////////////////////
//Page 전역 변수
////////////////////////////////////////////////////////////////////////////////////////
var dataTableRef;
var searchString; // 검색어
var searchRangeType; //날짜 검색 기준. 모든날짜 / 1일 / 7일 / 1달 / 1년 등...
// 해당아이디로 all-time, previous-day, previous-week, previous-month, previous-year, custom-range
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
			//이벤트리스너 활성화
			eventListenersActivator();

			//날짜검색 이벤트리스너
			date_range_filter_event();
			datetTimePicker();
			//검색결과_집계
			result_aggs_event();


			//페이지 로드 시  - 상단 검색 확인
			checkQueryStringOnUrl();
		})
		.catch(function (e) {
			console.error("플러그인 로드 중 오류 발생");
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

		검색어_유효성_체크(searchTerm); // 여기서 전역변수인 검색어 세팅

		if(searchString) {
			console.log("[searchEngine :: search-button] :: 검색어 -> "+ searchString);
			setParameter("searchString",searchString);
			let rangeDate = SearchApiModule.getRangeDate();
			search_with_date(searchString, rangeDate);
		} else {
			setParameter("searchString",""); // 검색어 url 초기화
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

///////////////////////////////////////
// 검색_데이터 집계 이벤트리스너
///////////////////////////////////////
function result_aggs_event() {
	// 필터-드롭다운
	$("#data-result-group").on("click", function (event) {
		console.log("[searchEngine :: 모든 결과] :: 드롭다운 :: 로그집계 top5 보여주기");

		let rangeDate = SearchApiModule.getRangeDate();
		//검색어 체크 (없다면, 검색창 확인하여 세팅)
		if(searchString) {
			getTop5LogName(searchString, rangeDate);
		} else {
			$("#log-agg-top5").html("");
			var setting = `<a style="text-align: center;">집계 데이터 없음</a>`;
			$("#log-agg-top5").html(setting);
		}
	});
}

//////////////////////////////
// 검색_날짜필터 이벤트리스너
//////////////////////////////
function date_range_filter_event() {
	$("#date-range-group .dropdown-menu li:not(:last)").on("click", function (event) {
		// console.log($(event.target));
		var rangeTypeId = $(event.target).closest("a").attr("id");
		var rangeText = $("#"+rangeTypeId).text();
		$("#date-range").text(rangeText); // 드롭다운 타이틀 변경

		searchRangeType = rangeTypeId; // 검색 레인지 타입아이디
		SearchApiModule.setRangeDateAsync(rangeTypeId).then(() => {
			//날짜 구간 세팅
			let rangeDate = SearchApiModule.getRangeDate();
			let start = (rangeDate["start-date"] ? SearchApiModule.setMidnightToZero(rangeDate["start-date"]) : "" );
			let end = (rangeDate["end-date"] ? new Date(rangeDate["end-date"]).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'}) : "");
			let rangeText = start+ " ~ " + end;
			$("#filter_list").html("");
			$("#filter_list").append(
				`<li style="margin: 0 3px"><a>${rangeText}</a></li>`
			);

			if(searchString) {
				search_with_date(searchString, rangeDate);
			}
		}).catch((error) => {
			console.error("[searchEngine :: 날짜검색 이벤트리스너] :: 검색 오류 발생 =>", error);
		});
		console.log(rangeTypeId);

	});

	// 기간 설정 선택
	$("#date-range-group .dropdown-menu li:last").on("click", function (event) {
		var rangeTypeId = $(event.target).closest("a").attr("id");
		var rangeText = $("#"+rangeTypeId).text();
		$("#date-range").text(rangeText);

		$("#date_timepicker_start").val("");
		$("#date_timepicker_end").val("");
	});
}


/////////////////////////
// 페이지 날짜 포함 검색
/////////////////////////
function search_with_date(search_string, range_date) {
	let start_date = null;
	let end_date = null;
	if(range_date) {
		if(range_date["start-date"]) {
			start_date = range_date["start-date"];
		}
		if(range_date["end-date"]) {
			end_date = range_date["end-date"];
		}
	}

	$(".spinner").html(
		'<img src="./img/loading.gif" alt="로딩" style="width: 16px;"> ' +
		"검색 결과 로딩 중입니다..."
	);

	$.ajax({
		url: "/engine-search-api/engine/jira/dashboard/search/jiraissue/with-date",
		type: "GET",
		data: { "search_string": search_string, "page" : 0, "size": 10, "from": start_date, "to" : end_date },
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: search_with_date] :: jiraissue_search_results 실행");

			const current_page = 1; //현재 페이지 초기화
			const items_per_Page = 10; //페이지당 아이템 수
			SearchApiModule.setSearchResult("jiraissue",result, current_page, items_per_Page);

		}
	});

	$.ajax({
		url: "/engine-search-api/engine/jira/dashboard/search/log/with-date",
		type: "GET",
		data: { "search_string": search_string, "page" : 0, "size": 10,"from": start_date, "to" : end_date },
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: search_with_date] :: fluentd_search_results 실행");
			const current_page = 1; //현재 페이지 초기화
			const items_per_Page = 10; //페이지당 아이템 수
			SearchApiModule.setSearchResult("log", result, current_page, items_per_Page);
		}
	});
}

function getTop5LogName(search_string, range_date){
	console.log("[searchEngine :: getTop5LogName] 실행");
	$(".spinner").html(
		'<img src="./img/loading.gif" alt="로딩" style="width: 16px;"> ' +
		"집계 결과 로딩 중입니다..."
	);

	let start_date = null;
	let end_date = null;
	if(range_date) {
		if(range_date["start-date"]) {
			start_date = range_date["start-date"];
		}
		if(range_date["end-date"]) {
			end_date = range_date["end-date"];
		}
	}

	$.ajax({
		url: "/engine-search-api/engine/jira/dashboard/search/log-aggs-top5/with-date",
		type: "GET",
		data: { "search_string": search_string, "from": start_date, "to" : end_date },
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: search_with_date] :: log-aggs-top5 => 집계 실행");
			if(result) {
				var resultArr=result["검색결과"]["group_by_@log_name"];
				var appendHtml = ``;

				var total = 0;
				resultArr.forEach((element) => {
					total += parseInt(element["개수"]);
				});
				console.log("[searchEngine :: search_with_date] :: log-aggs-top5 :: total => ", total);
				var setting = `<ul>`;
				$("#log-agg-top5").html("");
				resultArr.forEach((element) => {
					var ratio = +((parseInt(element["개수"]) / total) *100 ).toFixed(1);
					setting += `<li>
												<div style="margin: 5px 10px; display: flex; justify-content: space-between" >
													<p style="color: #a4c6ff; margin-bottom: 0px">${element["필드명"]}</p>
													<p style="color: #2D8515; margin-bottom: 0px">${element["개수"]}(${ratio}%)</p>
												</div>
												<div class="progress progress-small" style="margin: 0 10px 5px 10px">
                        	<div class="progress-bar progress-bar-inverse" style="width: ${ratio}%;"></div>
                    		</div>												
				  </li>`;
				});
				setting +=`</ul>`;
				$("#log-agg-top5").html(setting);
			} else {
				$("#log-agg-top5").html(`<a style="text-align: center;">집계 데이터 없음</a>`);
			}
		}
	});
}

/////////////////////////////////////////////////////////////
// 페이지 누를때 동작 - 검색 (search_section 별 페이지 검색)
////////////////////////////////////////////////////////////
function section_search(search_section, page, range_date) {
	var search_string = $("#search-input").val();
	var pageSize = 10;

	let start_date = null;
	let end_date = null;
	if(range_date) {
		if(range_date["start-date"]) {
			start_date = range_date["start-date"];
		}
		if(range_date["end-date"]) {
			end_date = range_date["end-date"];
		}
	}

	$(".spinner").html(
		'<img src="./img/loading.gif" alt="로딩" style="width: 16px;"> ' +
		"검색 결과 로딩 중입니다..."
	);

	$.ajax({
		url: "/engine-search-api/engine/jira/dashboard/search/"+search_section+"/with-date", // 날짜포함이 있어야 하므로.
		type: "GET",
		data: { "search_string": search_string, "page" : page, "size": pageSize, "from": start_date, "to" : end_date },
		dataType: "json",
		success: function(result) {
			console.log("[searchEngine :: search] :: jiraissue_search_results => ");
			console.log(result);
			let showPage = page+1; // 보여주는 페이지
			SearchApiModule.setSearchResult(search_section,result, showPage, pageSize);
			let pageStart = Math.floor(page / 10) * 10 + 1;
			SearchApiModule.updateButtons(search_section, showPage, pageStart);
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
	console.log("[searchEngine :: checkQueryStringOnUrl] :: 상단_검색 검색어 => " + searchTerm);
	검색어_유효성_체크(searchTerm);
	if (searchString) {
		$("#search-input").val(searchString);
		search_with_date(searchString, null);
	} else {
		console.log("[searchEngine :: checkQueryStringOnUrl] :: 상단_검색 검색어가 없거나 유효하지 않습니다.");
	}
}


function changePage(search_section,page) {
	console.log("[searchEngine :: chagne] :: search_section -> " +search_section + ", page -> " +page);
	let requestPage = page-1 ;
	if(requestPage < 0) {
		requestPage = 0;
	}
	section_search(search_section, requestPage, SearchApiModule.getRangeDate());
}
////////////////////////////
// 검색날짜 기간 설정 세팅
////////////////////////////
function datetTimePicker() {
	$('#date_timepicker_start').datetimepicker({
		format: 'Y-m-d', // 날짜 및 시간 형식 지정
		formatDate:'Y/m/d',
		timepicker: false,
		theme:'dark',
		lang: "kr",
		onSelectTime: function (current_time, $input) {
			$('#date_timepicker_end').datetimepicker('setOptions', { minDate: current_time });
		},
		onShow: function(ct){
			this.setOptions({
				maxDate: $('#date_timepicker_end').val() ? $('#date_timepicker_end').val() : false
			});
		}
	});
	$('#date_timepicker_end').datetimepicker({
		format: 'Y-m-d', // 날짜 및 시간 형식 지정
		formatDate:'Y/m/d',
		timepicker: false,
		theme:'dark',
		lang: "kr",
		onSelectTime: function (current_time, $input) {
			$('#date_timepicker_start').datetimepicker('setOptions', { maxDate: current_time });
		},
		onShow: function(ct){
			this.setOptions({
				minDate: $('#date_timepicker_start').val() ? $('#date_timepicker_start').val() : false
			});
		}
	});
}

////////////////////////////
// 검색날짜 기간 설정 모달 -
////////////////////////////
function customRangeSetting() {
	console.log("[searchEngine :: customRangeSetting] :: 실행");
	searchRangeType = "custom-range";
	SearchApiModule.setRangeDateAsync("custom-range").then(() => {
		let rangeDate = SearchApiModule.getRangeDate();
		let start = (rangeDate["start-date"] ? new Date(rangeDate["start-date"]).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'}) : "");
		let end = (rangeDate["end-date"] ? new Date(rangeDate["end-date"]).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'}) : "");
		let rangeText = start+ " ~ " + end;
		$("#filter_list").html("");
		$("#filter_list").append(
			`<li style="margin: 0 3px"><a>${rangeText}</a></li>`
		);

		if(searchString) {
			console.log("[searchEngine :: customRangeSetting] :: searchString => " + searchString);
			search_with_date(searchString, rangeDate);
		}

	}).catch((error) => {
		console.error("[searchEngine :: 날짜검색 이벤트리스너] :: 검색 오류 발생 =>", error);
	});
}

function 검색어_유효성_체크(search_string) {
	if ($("#search-input").val() && $.trim($("#search-input").val()) !== "" && !/^[^\w\s]+$/.test($.trim($("#search-input").val()))) {

		let searchTerm = $.trim($("#search-input").val());
		searchString = checkAndAppendWildcard(searchTerm);
	} else {
		// url 검색어 param 초기화
		setParameter("searchString","");
		searchString=null;
		console.log("[searchEngine :: 검색어_유효성_체크 ] :: 검색어가 유효하지 않습니다.");
	}
}

function checkAndAppendWildcard(searchTerm) {
	// 검색어의 마지막 문자가 *인지 확인
	if (searchTerm.slice(-1) !== '*') {
		// *이 없다면 *을 추가하여 반환
		return searchTerm + '*';
	}
	// *이 이미 있으면 검색어를 그대로 반환
	return searchTerm;
}