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
			//setSideMenu("sidebar_menu_discovery", "sidebar_menu_inventory_targetinfo", "inventory-elements-collapse");
			$(".widget").widgster();

			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 2000); // 2초 후에 실행됩니다.

			//서비스 데이터 테이블 로드
			var waitDataTable = setInterval(function () {
				try {
					if (!$.fn.DataTable.isDataTable("#targetInfoTable")) {
						dataTableLoad();
						dataTableUtilBtn();
						clearInterval(waitDataTable);
					}
				} catch (err) {
					console.log("서비스 데이터 테이블 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);

			eventListenersActivator();
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

///////////////////////////////////////////
// 검색 결과 section 눌렀을 때, 사이즈 재조정 //
///////////////////////////////////////////
function click_search_result() {
	console.log("[searchEngine :: click_search_result] :: click_search_result");
	//풀사이즈 그리드이면 줄이고, 호스트 정보를 보여준다
	if ($("#search_main_wrapper")[0].classList.contains("col-lg-12")) {
		//호스트 테이블 줄이기
		$("#search_main_wrapper").removeClass("col-lg-12").addClass("col-lg-4");
		// $("#search_detail_wrapper").css("display")
		$("#search_detail_wrapper").show();
	} else {
		$("#search_main_wrapper").removeClass("col-lg-4").addClass("col-lg-12");
		$("#search_detail_wrapper").hide();
	}
	/*if ($("#hostTable_Wrapper")[0].classList.contains("col-lg-9")) {
		//호스트 테이블 줄이기
		$("#hostTable_Wrapper").removeClass("col-lg-9").addClass("col-lg-3");

		//호스트 테이블 유틸 버튼 그룹 hide
		$("#hostTable_Left_Util").hide();
		$("#hostTable_Right_Support_Util").hide();

		$("#returnList_Layer").show();

		$("#hostInfo_Wrapper").removeClass("fade-out-box");
		$("#hostInfo_Wrapper").addClass("fade-in-box");

		$("table.dataTable > tbody > tr.child").css("display", "none");
		$("#hostTable").removeClass("dtr-inline collapsed");

		var box = document.querySelector("#hostTable_Wrapper");
		box.ontransitionend = () => {
			$("#hostInfo_Wrapper").show();
			$("#hostTable").DataTable().columns.adjust().responsive.recalc();
		};
	}*/
}

/////////////////////////
//이벤트 리스너 활성화
/////////////////////////
function eventListenersActivator() {
	//검색 결과 리스트 클릭 이벤트
	$("#search_main_wrapper").on("click", function (event) {
		console.log("")
		console.log($(event.target).closest(".search-result")[0]);
		if ($(event.target).closest(".search-result")[0]) {
			//
			click_search_result();
		}
	});
}


//데이터 목록을 wide 상태로 보기
function display_set_wide_hostTable() {
	var box = document.querySelector("#hostTable_Wrapper");
	box.ontransitionend = () => {
		$("#hostTable").DataTable().columns.adjust().responsive.recalc();
	};

	// 테이블 원복
	$("table.dataTable > tbody > tr.child ul.dtr-details").css("display", "inline-block;");
	$("#hostTable").addClass("dtr-inline collapsed");

	// 감추기
	$("#returnList_Layer").hide();
	$("#hostInfo_Wrapper").removeClass("fade-in-box");
	//$("#hostInfo_Wrapper").addClass("fade-out-box");
	$("#hostInfo_Wrapper").hide();

	//호스트 테이블 늘이기
	$("#hostTable_Wrapper").removeClass("col-lg-3").addClass("col-lg-9");

	//호스트 테이블 유틸 버튼 그룹 show
	$("#hostTable_Left_Util").show();
	$("#hostTable_Right_Support_Util").show();
}

