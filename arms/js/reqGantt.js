////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedId; // 요구사항 아이디
var selectedType;
var parentIdOfSelected;

var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId; // 선택된 버전 아이디
// 최상단 메뉴 변수
var req_state, resource_info, issue_info, period_info, total_days_progress;
/*var mailAddressList; // 투입 작업자 메일
var req_count, linkedIssue_subtask_count, resource_count, req_in_action, total_days_progress;*/
var dashboardColor;

var reqStatusDataTable;
var dataTableRef;

var selectedIssue; //선택한 이슈
var selectedIssueKey; //선택한 이슈 키

var gantt;
var ganttTasks;

var versionListData;
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
			"../reference/light-blue/lib/jquery.fileupload-ui.js"
		],

		[
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"
		],

		[
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js",
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
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
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"
		],
		[
			"../reference/jquery-plugins/gantt-0.6.1/dist/frappe-gantt.js",
			"../reference/jquery-plugins/gantt-0.6.1/dist/frappe-gantt.css",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
			//colors
			"./js/dashboard/chart/colorPalette.js",
			// Apache Echarts
			"../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js",
			// 최상단 메뉴
			"js/analysis/topmenu/topMenuApi.js",
			"js/analysis/topmenu/basicRadar.js"
		] // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {

			console.log("모든 플러그인 로드 완료");

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

			//사이드 메뉴 처리
			$(".widget").widgster();
			setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_gantt");

			// --- 에디터 설정 --- //
			var waitCKEDITOR = setInterval(function () {
				try {
					if (window.CKEDITOR) {
						if (window.CKEDITOR.status == "loaded") {
							// CKEDITOR.replace("detailview_req_contents", { skin: "office2013" });
							CKEDITOR.replace("edit_tabmodal_editor", { skin: "office2013" });
							CKEDITOR.replace("add_tabmodal_editor", { skin: "office2013" });
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);

			//제품(서비스) 셀렉트 박스 이니시에이터
			makePdServiceSelectBox();
			//버전 멀티 셀렉트 박스 이니시에이터
			makeVersionMultiSelectBox();

			dashboardColor = dashboardPalette.dashboardPalette01;

			// 높이 조정
			$('.top-menu-div').matchHeight({
				target: $('.top-menu-div-scope')
			});

			popup_size_setting();

			autoCompleteForUser();

			// 스크립트 실행 로직을 이곳에 추가합니다.

			click_btn_for_req_add();
			click_btn_for_req_update();
			click_btn_for_search_history();
			change_tab_action();
			click_btn_for_connect_req_jira();
//			change_input_for_req_date("editview_");
//			change_input_for_req_date("addview_");

			change_form_with_req_type();

			$("#progress_status").slimScroll({
				height: "195px",
				railVisible: true,
				railColor: "#222",
				railOpacity: 0.3,
				wheelStep: 10,
				allowPageScroll: false,
				disableFadeOut: false
			});

			var 라따적용_클래스이름_배열 = ['.ladda_shcedule_update'];
			laddaBtnSetting(라따적용_클래스이름_배열);
		})
		.catch(function (e) {
			console.error("플러그인 로드 중 오류 발생");
			console.error(e);
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
		selectedPdServiceId = $("#selected_pdService").val();
		// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
		// 디폴트는 base version 을 선택하게 하고 ( select all )
		// 선택된 제품(서비스) 데이터 바인딩
		var selectedService = $("#selected_pdService").select2("data")[0].text;

		$("#select_PdService").text(selectedService);
		$("#select_Service").text(selectedService); // 선택된 제품(서비스)

		//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
		bind_VersionData_By_PdService();
		resetProjectProgress();
	});
} // end makePdServiceSelectBox()


////////////////////////////////////////////////////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makeVersionMultiSelectBox() {
	//버전 선택 셀렉트 박스 이니시에이터
	$("#multiversion").multipleSelect({
		filter: true,
		onClose: function () {
			console.log("onOpen event fire!\n");

			var versionTag = $(".multiple-select").val();

			if (versionTag === null || versionTag == "") {
				alert("버전이 선택되지 않았습니다.");
				return;
			}
			console.log("[ reqGantt :: makeVersionMultiSelectBox ] :: versionTag");
			console.log(versionTag);
			selectedVersionId = versionTag.join(",");
			// 최상단 메뉴 세팅
			TopMenuApi.톱메뉴_초기화();
			TopMenuApi.톱메뉴_세팅();

			getMonitorData($("#selected_pdService").val(), selectedVersionId);
			resetProjectProgress();
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

				if (data.length > 0) {
					console.log("display 재설정.");
				}
				var versionTag = $(".multiple-select").val();
				console.log("[ reqGantt :: bind_VersionData_By_PdService ] :: versionTag");
				console.log(versionTag);
				console.log(pdServiceVersionIds);
				selectedVersionId = pdServiceVersionIds.join(",");
				console.log("bind_VersionData_By_PdService :: selectedVersionId");
				console.log(selectedVersionId);
				// 최상단 메뉴 세팅
				TopMenuApi.톱메뉴_초기화();
				TopMenuApi.톱메뉴_세팅();

				//$('#multiversion').multipleSelect('refresh');
				//$('#edit_multi_version').multipleSelect('refresh');
				$(".multiple-select").multipleSelect("refresh");
				//////////////////////////////////////////////////////////

				getMonitorData($("#selected_pdService").val(), selectedVersionId);
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//리스트 :: DataTable
////////////////////////////////////////////////////////////////////////////////////////
// --- Root, Drive, Folder 데이터 테이블 설정 --- //
function dataTableLoad() {
	console.log("dataTableLoad - selectRel:::" + selectedType);
	console.log("dataTableLoad - selectId:::" + selectedId);
	// 데이터 테이블 컬럼 및 열그룹 구성
	var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();

	var dataTableRef;

	if (selectedType !== "folder") {
		//select node 정보를 가져온다.
		console.log("tableName:: " + tableName);
		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedId,
			type: "GET",
			contentType: "application/json;charset=UTF-8",
			dataType: "json",
			progress: true,
			success: function (data) {
				// 데이터 테이블 컬럼 및 열그룹 구성
				var columnList = [
					{ data: "c_id", defaultContent: "-" },
					{ data: "c_left", defaultContent: "-" },
					{ data: "c_title", defaultContent: "-" }
				];
				var rowsGroupList = [];
				var columnDefList = [];
				var selectList = {};
				var orderList = [[1, "asc"]];
				var buttonList = [];

				var jquerySelector = "#req_table";
				var ajaxUrl = "/auth-user/api/arms/reqAdd/" + tableName + "/getChildNodeWithParent.do";
				var jsonRoot = "";
				var paramUrl = "?c_id=313&c_left=" + data.c_left + "&c_right=" + data.c_right;
				ajaxUrl = ajaxUrl + paramUrl;
				var isServerSide = false;

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
		})
			.done(function (data) {
				$("#my_modal").modal("show");
				$("#folder_tab").get(0).click();
				$(".newReqDiv").show();
				$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").show(); //상세보기
				$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").show(); //편집하기
				$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //리스트보기
				$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").show(); //문서로보기
			})
			.fail(function (e) {})
			.always(function () {});
	}
	else {
		console.log("folder clicked");
		var columnList = [
			{ data: "c_id", defaultContent: "-" },
			{ data: "c_left", defaultContent: "-" },
			{ data: "c_title", defaultContent: "-" }
		];
		var rowsGroupList = [];
		var columnDefList = [];
		var selectList = {};
		var orderList = [];
		var buttonList = [];

		var jquerySelector = "#req_table";
		var ajaxUrl = "/auth-user/api/arms/reqAdd/" + tableName + "/getChildNodeWithParent.do?c_id=" + selectedId;
		var jsonRoot = "";
		var isServerSide = false;

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
}

// --- 데이터 테이블 설정 --- // getConnectionInfo.do
function datatables_jira_project() {
	// jiraProjectConnectionInfo();
	// 데이터 테이블 컬럼 및 열그룹 구성
	var columnList = [
		{
			data: "c_id",

			render: function (data, type, row) {
				if (type === "display") {
					// 만약 데이터가 특정 조건을 만족한다면 체크박스를 체크한 상태로 렌더링합니다.
					// console.log("jira display" + jiraCheckId);
					// console.log("jira id" + data);
					// var test = [27, 10];
					var checkboxHtml = '<input type="checkbox" class="editor-active" name="jiraVerList" value="' + data + '"';
					// 배열에 현재 data가 포함되어 있는지 확인
					if (jiraCheckId.includes(data)) {
						checkboxHtml += " checked"; // 체크된 상태로 설정
						console.log("jira jiraCheckId" + jiraCheckId);
					}
					checkboxHtml += ">";
					return checkboxHtml;
				}
				console.log("jira type" + type);
				return data;
			},
			className: "dt-body-center",
			title: '<input type="checkbox" name="checkall" id="checkall">'
		},
		{
			name: "c_jira_key",
			title: "c_jira_key",
			data: "c_jira_key",
			className: "dt-body-left",
			visible: true,
			defaultContent: "-"
		},
		{
			name: "c_pdservice_version_name",
			title: "버전 이름",
			data: "c_pdservice_version_name",
			className: "dt-body-center",
			visible: true,
			defaultContent: "-"
		},
		{
			name: "c_jira_name",
			title: "JIRA Project",
			data: "c_jira_name",
			className: "dt-body-left",
			visible: true,
			defaultContent: "-"
		}
	];
	var rowsGroupList = null;
	var columnDefList = [
		{
			orderable: false,
			className: "select-checkbox",
			targets: 0
		}
	];
	var selectList = {
		style: "os",
		selector: "td:first-child"
	};
	var orderList = [[1, "asc"]];
	var buttonList = [];

	var jquerySelector = "#jira_project_table";
	var ajaxUrl = "/auth-user/api/arms/jiraProject/getNodesWithoutRoot.do";
	var jsonRoot = "result";
	var isServerSide = false;

	dataTable_build(
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
// -------------------- checkbox 가 들어가야 하는 데이터테이블 이므로 row code를 사용함 ------------------ //
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //
function defaultType_dataTableLoad() {
	console.log("defaultType_dataTableLoad:::");
	// 데이터 테이블 컬럼 및 열그룹 구성

	//여기는 데이터 가져와서 체크박스 처리 해야 하는 로직

	var columnList = [
		{
			data: "c_id",
			render: function (data, type, row) {
				if (type === "display") {
					return '<input type="checkbox" class="editor-active" name="jiraVerList" value="' + data + '">';
				}
				return data;
			},
			className: "dt-body-center",
			title: '<input type="checkbox" name="checkall" id="checkall">'
		},
		{
			name: "c_jira_key",
			title: "c_jira_key",
			data: "c_jira_key",
			className: "dt-body-left",
			visible: true,
			defaultContent: "-"
		},
		{
			name: "c_jira_name",
			title: "버전 이름",
			data: "c_jira_name",
			className: "dt-body-center",
			visible: true,
			defaultContent: "-"
		},
		{
			name: "c_pdservice_jira_name",
			title: "JIRA Project",
			data: "c_pdservice_jira_name",
			className: "dt-body-left",
			visible: true,
			defaultContent: "-"
		}
	];
	var rowsGroupList = null;
	var columnDefList = [
		{
			orderable: false,
			className: "select-checkbox",
			targets: 0
		}
	];
	var selectList = {
		style: "os",
		selector: "td:first-child"
	};
	var orderList = [[1, "asc"]];
	var buttonList = [];

	var jquerySelector = "#jira_ver_table";
	var ajaxUrl = "/auth-user/api/arms/jiraProject/getNodesWithoutRoot.do";
	var jsonRoot = "result";
	var isServerSide = false;

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

	return dataTableRef;
}
// -------- jira project connection info
function jiraProjectConnectionInfo() {
	console.log("selected_pdService" + $("#selected_pdService").val());
	$.ajax({
		url: "/auth-user/api/arms/jiraProject/getConnectionInfo.do",
		type: "GET",
		data: {
			pdservice_link: $("#selected_pdService").val()
		},
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				/////////////////// insert Card ///////////////////////

				// 데이터 배열을 순회하면서 모든 c_id를 배열에 추가
				var obj = data.response;
				console.log("testData::" + obj);

				for (var i = 0; i < obj.length; i++) {
					console.log("data[i]::" + obj[i].c_id);
					jiraCheckId.push(obj[i].c_id);
				}

				console.table(obj);
				console.log(obj.c_id);
				console.log(jiraCheckId);
			}
		}
	});
}

// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
	// 기존 클릭 이벤트 리스너 제거
	$('input[name="jiraVerList"]').off("click");

	// 새로운 클릭 이벤트 리스너 추가
	$('input[name="jiraVerList"]').on("click", function () {
		var isChecked = $(this).prop("checked");
		// var checkboxValue = $(this).val();
		var checkboxValue = parseInt($(this).val()); // 문자열을 정수로 변환

		if (isChecked) {
			// 체크 박스가 체크되면 배열에 정보를 추가
			jiraCheckId.push(checkboxValue);
			console.log("isChecked:::" + isChecked);
		} else {
			// 체크 박스가 해제되면 배열에서 정보를 제거
			var index = jiraCheckId.indexOf(checkboxValue);
			if (index !== -1) {
				jiraCheckId.splice(index, 1);
			}
			console.log("isChecked::delete:" + isChecked);
		}

		// 배열에 담긴 정보 확인
		console.log("jiraCheckId:", jiraCheckId);
	});
}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(settings, json) {
	console.log("데이터테이블콜백");
	setDocViewTab();
	//상세보기 탭 셋팅
	//setDetailAndEditViewTab();

	// $('input[name="jiraVerList"]').click(function () {
	// 	var allPages = tempDataTable.cells().nodes();
	// 	if ($("#checkall").val() == "on") {
	// 		$("#checkall").prop("checked", false);
	// 	}
	// });

	$('input[name="jiraVerList"]').on("click", function () {
		var isChecked = $(this).prop("checked");
		var checkboxValue = parseInt($(this).val()); // 문자열을 정수로 변환

		if (isChecked) {
			// 체크 박스가 체크되면 배열에 정보를 추가
			jiraCheckId.push(checkboxValue);
		} else {
			// 체크 박스가 해제되면 배열에서 정보를 제거
			var index = jiraCheckId.indexOf(checkboxValue);
			if (index !== -1) {
				jiraCheckId.splice(index, 1);
			}
		}

		// 배열에 담긴 정보 확인
		console.log("jiraCheckId:", jiraCheckId);
	});
}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();
}

////////////////////////////////////////////////////////////////////////////////////////
//상세 보기 탭 & 편집 탭
////////////////////////////////////////////////////////////////////////////////////////
function setDetailAndEditViewTab() {
	console.log("Detail Tab ::::");
	var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();
	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedId,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true
	})
		.done(function (data) {
			// ------------------ 편집하기 ------------------ //
			bindDataEditTab(data);
			// ------------------ 상세보기 ------------------ //
			// bindDataDetailTab(data);
		})
		.fail(function (e) {})
		.always(function () {});
}

// ------------------ 편집하기 ------------------ //
function bindDataEditTab(ajaxData) {

	//제품(서비스) 데이터 바인딩
	var selectedPdServiceText = $("#selected_pdService").select2("data")[0].text;
	var datepickerOption = {
		timepicker: false,
		format: "Y/m/d",
		formatDate: "Y/m/d",
		scrollInput: false,
		value: null
	};

	if (isEmpty(selectedPdServiceText)) {
		$("#editview_req_pdservice_name").val("");
	} else {
		$("#editview_req_pdservice_name").val(selectedPdServiceText);
	}

	$("#editview_req_type").val(ajaxData.c_type);

	// 버전 데이터 바인딩
	if (!isEmpty(ajaxData.c_req_pdservice_versionset_link)) {
		$("#edit_multi_version").multipleSelect("setSelects", JSON.parse(ajaxData.c_req_pdservice_versionset_link));
	} else {
		$("#edit_multi_version").multipleSelect("uncheckAll");
	}

	$("#editview_req_id").val(ajaxData.c_id);
	$("#editview_req_title").val(ajaxData.c_title);

	$("#editview_req_priority").children(".btn.active").removeClass("active");
	if (!isEmpty(ajaxData.reqPriorityEntity)) {
		var selectReqPriorityID = "editview_req_priority_options" + ajaxData.reqPriorityEntity.c_id;
		$("#" + selectReqPriorityID)
			.parent()
			.addClass("active");
	}

	$("#editview_req_difficulty").children(".btn.active").removeClass("active");
	if (!isEmpty(ajaxData.reqDifficultyEntity)) {
		var selectReqDifficultyID = "editview_req_difficulty_options" + ajaxData.reqDifficultyEntity.c_id;
		$("#" + selectReqDifficultyID)
			.parent()
			.addClass("active");
	}

	$("#editview_req_state").children(".btn.active").removeClass("active");
	if (!isEmpty(ajaxData.reqStateEntity)) {
		var selectReqStateID = "editview_req_state_options" + ajaxData.reqStateEntity.c_id;
		$("#" + selectReqStateID)
			.parent()
			.addClass("active");
	}

	// -------------------- reviewer setting -------------------- //
	//reviewer clear
	$("#editview_req_reviewers").val(null).trigger("change");

	var selectedReviewerArr = [];
	if (ajaxData.c_req_reviewer01 == null || ajaxData.c_req_reviewer01 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer01 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer01);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer01 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer01 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption01 = new Option(ajaxData.c_req_reviewer01, ajaxData.c_req_reviewer01, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption01).trigger("change");
		}
	}
	if (ajaxData.c_req_reviewer02 == null || ajaxData.c_req_reviewer02 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer02 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer02);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer02 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer02 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption02 = new Option(ajaxData.c_req_reviewer02, ajaxData.c_req_reviewer02, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption02).trigger("change");
		}
	}
	if (ajaxData.c_req_reviewer03 == null || ajaxData.c_req_reviewer03 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer03 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer03);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer03 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer03 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption03 = new Option(ajaxData.c_req_reviewer03, ajaxData.c_req_reviewer03, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption03).trigger("change");
		}
	}
	if (ajaxData.c_req_reviewer04 == null || ajaxData.c_req_reviewer04 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer04 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer04);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer04 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer04 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption04 = new Option(ajaxData.c_req_reviewer04, ajaxData.c_req_reviewer04, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption04).trigger("change");
		}
	}
	if (ajaxData.c_req_reviewer05 == null || ajaxData.c_req_reviewer05 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer05 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer05);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer05 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer05 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption05 = new Option(ajaxData.c_req_reviewer05, ajaxData.c_req_reviewer05, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption05).trigger("change");
		}
	}
	$("#editview_req_reviewers").val(selectedReviewerArr).trigger("change");

	// ------------------------- reviewer end --------------------------------//
	$("#editview_req_writer").val(ajaxData.c_req_writer); //ajaxData.c_req_reviewer01
	$("#editview_req_write_date").val(new Date(ajaxData.c_req_create_date).toLocaleString());

	if (ajaxData.c_req_start_date) {
		$("#editview_req_start_date").datetimepicker(
			$.extend({}, datepickerOption, { value: new Date(ajaxData.c_req_start_date) })
		);
	}
	else {
		$("#editview_req_start_date").val(null);
		$("#editview_req_start_date").datetimepicker(datepickerOption);
	}
	if (ajaxData.c_req_end_date) {
		$("#editview_req_end_date").datetimepicker(
			$.extend({}, datepickerOption, { value: new Date(ajaxData.c_req_end_date) })
		);
	}
	else {
		$("#editview_req_end_date").val(null);
		$("#editview_req_end_date").datetimepicker(datepickerOption);
	}

	CKEDITOR.instances.edit_tabmodal_editor.setData(ajaxData.c_req_contents);
}

///////////////////////////////////////////////////////////////////////////////
//문서로 보기 탭
///////////////////////////////////////////////////////////////////////////////
function setDocViewTab() {
	$(".dd-list").empty();
	var data = $("#req_table").DataTable().rows().data().toArray();

	let treeData = buildDocTree(data); // 데이터를 계층적 구조로 변환
	console.log("setDocViewTab :: doc data -> ");
	console.log(treeData);
	treeData.forEach(rootNode => {
		$(".dd-list").append(generateDocHTML(rootNode)); // HTML 생성 및 추가
	});
}

function buildDocTree(data) {
	let tree = {};
	let roots = [];

	// 먼저 모든 노드를 id를 키로 하는 객체로 변환
	data.forEach(item => {
		tree[item.c_id] = {...item, children: []};
	});

	// 각 노드의 자식 노드들을 찾아서 추가
	Object.keys(tree).forEach(id => {
		let item = tree[id];
		if (item.c_parentid && tree[item.c_parentid]) {
			tree[item.c_parentid].children.push(item);
		} else {
			roots.push(item);
		}
	});

	return roots; // 최상위 노드 반환
}

function generateDocHTML(node) {
	let iconHtml = getDocIconHtml(node.c_type);

	let html = "<li class='dd-item' id='T_ARMS_REQ_" + node.c_id + "' data-id='" + node.c_id + "'>" +
		"<div class='dd-handle'>" + iconHtml + " " + node.c_title +
		"<p>" + (node.c_contents || "") + "</p></div>";

	if (node.children.length > 0) {
		html += "<ol class='dd-list'>";
		node.children.forEach(child => {
			html += generateDocHTML(child);
		});
		html += "</ol>";
	}

	html += "</li>";
	return html;
}

function getDocIconHtml(type) {
	switch (type) {
		case "root":
		case "drive":
			return "<i class='fa fa-clipboard'></i>";
		case "folder":
			return "<i class='fa fa-folder'></i>";
		default:
			return "<i class='fa fa-file-text-o'></i>";
	}
}

///////////////////////////////////////////////////////////////////////////////
// --- select2 (사용자 자동완성 검색 ) 설정 --- //
///////////////////////////////////////////////////////////////////////////////
function autoCompleteForUser() {
	$(".js-data-example-ajax").select2({
		maximumSelectionLength: 5,
		width: "resolve",
		ajax: {
			url: function (params) {
				return "/auth-user/search-user/" + params.term;
			},
			dataType: "json",
			delay: 250,
			processResults: function (data, params) {
				params.page = params.page || 1;

				return {
					results: data,
					pagination: {
						more: params.page * 30 < data.total_count
					}
				};
			},
			cache: true
		},
		placeholder: "리뷰어 설정을 위한 계정명을 입력해 주세요",
		minimumInputLength: 1,
		templateResult: formatUser,
		templateSelection: formatUserSelection
	});
}

// --- select2 (사용자 자동완성 검색 ) templateResult 설정 --- //
function formatUser(jsonData) {
	var $container = $(
		"<div class='select2-result-jsonData clearfix'>" +
			"<div class='select2-result-jsonData__meta'>" +
			"<div class='select2-result-jsonData__username'><i class='fa fa-flash'></i></div>" +
			"<div class='select2-result-jsonData__id'><i class='fa fa-star'></i></div>" +
			"</div>" +
			"</div>"
	);

	$container.find(".select2-result-jsonData__username").text(jsonData.username);
	$container.find(".select2-result-jsonData__id").text(jsonData.id);

	return $container;
}

// --- select2 (사용자 자동완성 검색 ) templateSelection 설정 --- //
function formatUserSelection(jsonData) {
	if (jsonData.id == "") {
		jsonData.text = "placeholder";
	} else {
		if (jsonData.username == undefined) {
			jsonData.text = jsonData.id;
		} else {
			jsonData.text = "[" + jsonData.username + "] - " + jsonData.id;
		}
	}
	return jsonData.text;
}

function change_form_with_req_type() {
	$(".form-horizontal input[name=reqType]").on("change", function () {
		if ($("input[name=reqType]:checked").val() === "default") {
			$("#popup_reviewer_div").show();
			$("#popup_priority_div").show();

			$("#popup_req_priority_div").show();
			$("#popup_req_difficulty_div").show();
			$("#popup_req_state_div").show();
		}
		else {
			$("#popup_reviewer_div").hide();
			$("#popup_priority_div").hide();

			$("#popup_req_priority_div").hide();
			$("#popup_req_difficulty_div").hide();
			$("#popup_req_state_div").hide();
		}
	});
}

///////////////////////////////////////////////////////////////////////////////
// 신규 요구사항 등록 버튼
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_req_add() {
	$("#save_req").click(function () {
		let table_name = "T_ARMS_REQADD_" + $("#selected_pdService").val();
		let c_type_value;
		if (isEmpty($("input[name=reqType]:checked").val())) {
			c_type_value = "default";
		} else {
			c_type_value = $("input[name=reqType]:checked").val();
		}

		let req_title = $("#addview_req_title").val().trim();
		if(!req_title) {
			alert("요구사항 제목이 없습니다.");
			return false;
		}

		let versionset_link = $("#add_multi_version").val();
		if (versionset_link.length < 1) {
			alert("선택된 버전이 없습니다.");
			return false;
		}

		var reviewers01 = getReviewer(0, "addview_req_reviewers");
		var reviewers02 = getReviewer(1, "addview_req_reviewers");
		var reviewers03 = getReviewer(2, "addview_req_reviewers");
		var reviewers04 = getReviewer(3, "addview_req_reviewers");
		var reviewers05 = getReviewer(4, "addview_req_reviewers");

		let select_req_priority_link = $("#addview_req_priority .btn.active input").val() === undefined
					? "5" : $("#addview_req_priority .btn.active input").val();
		let	select_req_difficulty_link = $("#addview_req_difficulty .btn.active input").val() === undefined
					? "5" : $("#addview_req_difficulty .btn.active input").val();
		let	select_req_state_link = $("#addview_req_state .btn.active input").val() === undefined
					? "10" : $("#addview_req_state .btn.active input").val();

		let start_date_value = $("#addview_req_start_date").val();
		let c_req_start_date;
		if (start_date_value) {
			c_req_start_date = new Date(start_date_value);
		}

		let end_date_value = $("#addview_req_end_date").val();
		let c_req_end_date;
		if (end_date_value) {
			c_req_end_date = new Date(end_date_value);
		}

		let data_object_param = {
			ref: parentIdOfSelected,
			c_title: req_title,
			c_type: c_type_value,
			c_req_pdservice_link: $("#selected_pdService").val(),
			c_req_pdservice_versionset_link: JSON.stringify(versionset_link),
			c_req_start_date: c_req_start_date,
			c_req_end_date: c_req_end_date,
			c_req_writer: "[" + userName + "]" + " - " + userID,
			c_req_contents: CKEDITOR.instances["add_tabmodal_editor"].getData(),
		};

		if (c_type_value === "default") {
			Object.assign(data_object_param, {
				c_req_priority_link: select_req_priority_link,
				c_req_difficulty_link: select_req_difficulty_link,
				c_req_state_link: select_req_state_link,
				c_req_reviewer01: reviewers01,
				c_req_reviewer02: reviewers02,
				c_req_reviewer03: reviewers03,
				c_req_reviewer04: reviewers04,
				c_req_reviewer05: reviewers05,
				c_req_reviewer01_status: "Draft",
				c_req_reviewer02_status: "Draft",
				c_req_reviewer03_status: "Draft",
				c_req_reviewer04_status: "Draft",
				c_req_reviewer05_status: "Draft"
			});
		}

		console.log("save_req :: save data ->");
		console.log(data_object_param);

		let url_suffix = c_type_value === "default" ? "/addNode.do" : "/addFolderNode.do";
		let success_message = c_type_value === "default" ?
			"신규 요구사항 ( " + req_title + " )이 추가되었습니다." :
			" 요구사항 폴더 ( " + req_title + " )가 등록되었습니다.";

		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + table_name + url_suffix,
			type: "POST",
			data: data_object_param,
			statusCode: {
				200: function () {
					jSuccess(success_message);
					getMonitorData($("#selected_pdService").val(), selectedVersionId);
				}
			}
		});
	});
}

///////////////////////////////////////////////////////////////////////////////
// 요구사항 편집 탭 저장 버튼
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_req_update() {
	$("#edit_tab_req_update, #footer_edit_tab_req_update").click(function () {
		let table_name = "T_ARMS_REQADD_" + $("#selected_pdService").val();
		let edit_req_title = $("#editview_req_title").val().trim();
		if(!edit_req_title) {
			alert("변경할 요구사항 제목이 없습니다.");
			return false;
		}

		let edit_versionset_link = $("#edit_multi_version").val();
		if (edit_versionset_link.length < 1) {
			alert("선택된 버전이 없습니다.");
			return false;
		}

		var reviewers01 = getReviewer(0, "editview_req_reviewers");
		var reviewers02 = getReviewer(1, "editview_req_reviewers");
		var reviewers03 = getReviewer(2, "editview_req_reviewers");
		var reviewers04 = getReviewer(3, "editview_req_reviewers");
		var reviewers05 = getReviewer(4, "editview_req_reviewers");

		let edit_priority_value = $("#editview_req_priority input[name='editview_req_priority_options']:checked").val();
		let edit_difficulty_value = $("#editview_req_difficulty input[name='editview_req_difficulty_options']:checked").val();
		let edit_state_value = $("#editview_req_state input[name='editview_req_state_options']:checked").val();
		let edit_req_priority_link = edit_priority_value === undefined ? "5" : edit_priority_value;
		let	edit_req_difficulty_link = edit_difficulty_value === undefined ? "5" : edit_difficulty_value;
		let	edit_req_state_link = edit_state_value === undefined ? "10" : edit_state_value;
		let c_type_value = $("#editview_req_type").val();

		let edit_start_date_value = $("#editview_req_start_date").val();
		let c_req_start_date;
		if (edit_start_date_value) {
			c_req_start_date = new Date(edit_start_date_value);
		}

		let edit_ent_date_value = $("#editview_req_end_date").val();
		let c_req_end_date;
		if (edit_ent_date_value) {
			c_req_end_date = new Date(edit_ent_date_value);
		}

		let data_object_param = {
			c_id: $("#editview_req_id").val(),
			c_title: edit_req_title,
			c_req_pdservice_versionset_link: JSON.stringify(edit_versionset_link),
			c_req_start_date: c_req_start_date,
			c_req_end_date: c_req_end_date,
			c_req_contents: CKEDITOR.instances["edit_tabmodal_editor"].getData()
		};

		if (c_type_value === "default") {
			Object.assign(data_object_param, {
				c_req_priority_link: edit_req_priority_link,
				c_req_difficulty_link: edit_req_difficulty_link,
				c_req_state_link: edit_req_state_link,
				c_req_reviewer01: reviewers01,
				c_req_reviewer02: reviewers02,
				c_req_reviewer03: reviewers03,
				c_req_reviewer04: reviewers04,
				c_req_reviewer05: reviewers05,
			});
		}

		console.log("update_req :: update data ->");
		console.log(data_object_param);

		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + table_name + "/updateNode.do",
			type: "POST",
			data: data_object_param,
			statusCode: {
				200: function () {
					jSuccess(edit_req_title + "의 데이터가 변경되었습니다.");
					getMonitorData($("#selected_pdService").val(), selectedVersionId);
				}
			}
		});
	});
}

function getReviewer(index, req_reviewers_id) {
	let reviewer = "none";
	if ($("#"+req_reviewers_id).select2("data")[index] != undefined) {
		reviewer = $("#"+req_reviewers_id).select2("data")[0].text;
	}
	return reviewer;
}

///////////////////////////////////////////////////////////////////////////////
// History TAB 검색 버튼
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_search_history() {
	$("#logsearch").click(function () {
		$(".timeline-item-body").remove();
		var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();

		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/getHistory.do",
			type: "GET",
			data: {
				startDate: $("#input_req_start_date").val(),
				endDate: $("#input_req_end_date").val()
			},
			contentType: "application/json;charset=UTF-8",
			dataType: "json",
			progress: true,
			statusCode: {
				200: function () {
					console.log("성공!");
					jSuccess("데이터 조회가 완료되었습니다.");
				}
			}
		})
			.done(function (data) {
				for (var k in data) {
					var obj = data[k];

					console.log("jsonIndex[" + k + "]=" + "obj.fileIdlink => " + obj.fileIdlink); //t_arms_filerepository
					console.log("jsonIndex[" + k + "]=" + "obj.c_pdservice_jira_ids => " + obj.c_pdservice_jira_ids); //t_arms_pdserviceconnect
					console.log("jsonIndex[" + k + "]=" + "obj.c_jira_con_passmode => " + obj.c_jira_con_passmode); //t_arms_pdservicjira
					console.log("jsonIndex[" + k + "]=" + "obj.c_end_date => " + obj.c_end_date); //t_arms_pdservicversion
					console.log("jsonIndex[" + k + "]=" + "obj.c_fileid_link => " + obj.c_fileid_link); //t_arms_pdservice
					console.log("jsonIndex[" + k + "]=" + "obj.c_req_status => " + obj.c_req_status); //t_arms_reqadd

					if (
						!isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_filerepository
						if (obj.c_title == "pdService") {
						} else {
							var timestamp_t_arms_filerepository = new Date(obj.c_date);
							var datetime_t_arms_filerepository =
								timestamp_t_arms_filerepository.getFullYear() +
								"/" +
								(timestamp_t_arms_filerepository.getMonth() + 1) +
								"/" +
								timestamp_t_arms_filerepository.getDate() +
								" " +
								timestamp_t_arms_filerepository.getHours() +
								":" +
								timestamp_t_arms_filerepository.getMinutes();

							var add_t_arms_filerepository =
								'<li class="timeline-item-body">\n' +
								'	<i class="fa fa-check-square-o bg-maroon"></i>\n' +
								'	<div class="timeline-item">\n' +
								'		<span class="arrow"></span>\n' +
								'		<span class="time"><i class="fa fa-clock-o"></i>' +
								datetime_t_arms_filerepository +
								"</span>\n" +
								'		<h3 class="timeline-header"><a href="#">기획</a> <small class="font11">요구사항 파일 로그</small></h3>\n' +
								'		<div class="timeline-body col-md-4 font11">\n' +
								'			<a href="#" target="_blank" class="btn bg-maroon btn-xs" style="font-size: 11px;"><i class="fa fa-share"></i> 로그 자세히 보기</a>\n' +
								"		</div>\n" +
								' <div class="timeline-footer col-md-8 font12 fontw600">\n' +
								"  저장된 액션 : " +
								obj.c_state +
								"<br>\n" +
								"  저장된 액션 : " +
								obj.c_method +
								"<br>\n" +
								"  저장된 파일 이름 : " +
								obj.fileName +
								"<br>\n" +
								"  저장된 파일 타입 : " +
								obj.contentType +
								"\n" +
								"  </div>\n" +
								" </div>\n" +
								"</li>";
							$(".timeline.timeline-inverse").append(add_t_arms_filerepository);
						}
					} else if (
						isEmpty(obj.fileIdlink) &&
						!isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_pdserviceconnect
					} else if (
						isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						!isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_pdservicjira
					} else if (
						isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						!isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_pdservicversion
					} else if (
						isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						!isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_pdservice
					} else if (
						isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						!isEmpty(obj.c_req_status)
					) {
						//t_arms_reqadd
						var timestamp_t_arms_reqadd = new Date(obj.c_date);
						var datetime_t_arms_reqadd =
							timestamp_t_arms_reqadd.getFullYear() +
							"/" +
							(timestamp_t_arms_reqadd.getMonth() + 1) +
							"/" +
							timestamp_t_arms_reqadd.getDate() +
							" " +
							timestamp_t_arms_reqadd.getHours() +
							":" +
							timestamp_t_arms_reqadd.getMinutes();

						var add_t_arms_reqadd =
							'<li class="timeline-item-body">\n' +
							'	<i class="fa fa-check-square-o bg-maroon"></i>\n' +
							'	<div class="timeline-item">\n' +
							'		<span class="arrow"></span>\n' +
							'		<span class="time"><i class="fa fa-clock-o"></i>' +
							datetime_t_arms_reqadd +
							"</span>\n" +
							'		<h3 class="timeline-header"><a href="#">기획</a> <small class="font11">요구사항 등록,변경,삭제 로그</small></h3>\n' +
							'		<div class="timeline-body col-md-4 font11">\n' +
							'			<a href="#" target="_blank" class="btn bg-maroon btn-xs" style="font-size: 11px;"><i class="fa fa-share"></i> 로그 자세히 보기</a>\n' +
							"		</div>\n" +
							' <div class="timeline-footer col-md-8 font12 fontw600">\n' +
							"  저장된 액션 : " +
							obj.c_state +
							"<br>\n" +
							"  저장된 액션 : " +
							obj.c_method +
							"<br>\n" +
							"  저장된 요구사항 이름 : " +
							obj.c_title +
							"<br>\n" +
							"  저장된 제품(서비스) 아이디 : " +
							obj.c_pdservice_link +
							"<br>\n" +
							"  저장된 요구사항 상태 : " +
							obj.c_req_status +
							"\n" +
							"  </div>\n" +
							" </div>\n" +
							"</li>";
						$(".timeline.timeline-inverse").append(add_t_arms_reqadd);
					} else {
						console.log("정의되지 않은 타입의 객체 데이터 확인 :: " + obj);
					}
				} //for end

				var endPointHtmlStr =
					"<!-- END timeline item -->\n" +
					'                                    <li class="timeline-item-body">\n' +
					'                                        <i class="fa fa-clock-o bg-gray"></i>\n' +
					"                                    </li>";
				$(".timeline.timeline-inverse").append(endPointHtmlStr);
			})
			.fail(function (e) {})
			.always(function () {});
	});
}

///////////////////////////////////////////////////////////////////////////////
// 탭 클릭 이벤트
///////////////////////////////////////////////////////////////////////////////
function change_tab_action() {
	$('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
		var target = $(e.target).attr("href"); // activated tab

		$(".edit_btn_group, #footer_edit_tab_req_update").addClass("hidden");
		$(".jira_btn_group").addClass("hidden");
		$(".newReqDiv").hide();

		if (target == "#edit") {
			$(".edit_btn_group, #footer_edit_tab_req_update").removeClass("hidden");
		} else if (target == "#jira") {
			$(".jira_btn_group").removeClass("hidden");

			console.log("jira tab click event");
			//1-1. 제품(서비스) 아이디를 기준으로, -- $('#selected_pdService').val()
			console.log("selected_pdService::::" + $("#selected_pdService").val()); // service id
			console.log("selectedId::::" + selectedId); //  jsTree ID

			//1-2. 요구사항 jsTree ID 가져와서 -- selectedId
			//2. 요구사항 테이블 ( REQADD ) 을 검색하여
			//3. JIRA_VER 정보에 체크해 주기.
			//제품 서비스 셀렉트 박스 데이터 바인딩
			//요구사항 클릭하면 자세히보기 탭으로 가니까 이 로직은 유효하다.

			var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();
			console.log("jira selectedId" + selectedId);
			console.log("jira tableName" + tableName);
			console.log("jira datatables_jira_project 완료 ");
		} else if (target == "#report") {
			$(".newReqDiv").show();
		}
	});
}

///////////////////////////////////////////////////////////////////////////////
// 요구사항 - 지라 연결설정 변경 버튼 클릭 이벤트
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_connect_req_jira() {
	$("#req_jiraver_connect_change").click(function () {
		console.log("req_jiraver_connect_change");

		//JiraVersion 정보 셋팅
		// var jiraCheckId = [];
		// $("input:checkbox[name=jiraVerList]:checked").each(function (i, iVal) {
		// 	chk_Val.push(iVal.value);
		// });
		console.log(" jiraCheckId :: " + JSON.stringify(jiraCheckId));

		//반영할 테이블 네임 값 셋팅
		var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();
		// check box 값 = jiraCheckId
		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/updateNode.do",
			data: {
				c_id: selectedId, // reqAdd id
				c_req_pdservice_versionset_link: "[]", //c_req_pdservice_versionset_link
				c_jira_link: "independent",
				c_req_etc: JSON.stringify(jiraCheckId) //c_req_etc, c_jira_ver_link
			},
			type: "POST",
			progress: true
		})
			.done(function (data) {
				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);
				}

				var loopCount = 3;
				for (var i = 0; i < loopCount; i++) {
					console.log("loop check i = " + i);
				}
			})
			.fail(function (e) {})
			.always(function () {});
	});
}

function handle_change_date(start, end) {
	// 시작일, 종료일, 오늘 날짜를 Date 객체로 변환
	const startDate = new Date(start);
	const endDate = new Date(end);
	const today = new Date();

	// 시작일과 오늘 사이의 일수 차이 계산
	const dayDiff = Math.max(0, diff_day(start, end));
	const todayDiff = Math.max(0, diff_day(start, today));

	// 시작일이 오늘보다 미래인 경우
	if (startDate > today) {
		return {
			dayDiff: dayDiff,
			todayDiff: 0,
			plan_progress: 0
		};
	}

	// 시작일이 종료일보다 같거나 큰 경우
	if (startDate >= endDate) {
		return {
			dayDiff: 0,
			todayDiff: 0,
			plan_progress: 0
		};
	}

	if (endDate <= today) {
		return {
			dayDiff: dayDiff,
			todayDiff: dayDiff,
			plan_progress: 100
		};
	}

	// 진행률 계산
	const progress = dayDiff > 0 ? (todayDiff / dayDiff) * 100 : 0;

	return {
		dayDiff: dayDiff,
		todayDiff: todayDiff,
		plan_progress: Math.min(progress.toFixed(0), 100)
	};
}

function change_input_for_req_date(prefix) {
	var start = $("#" + prefix + "req_start_date");
	var end = $("#" + prefix + "req_end_date");

	function handle_change_req_date() {
		if (isEmpty(start.val()) || isEmpty(end.val())) return;

		if (Date.parse(start.val()) > Date.parse(end.val())) {
			end.val(start.val());
		}

		var dateDiff = handle_change_date(start.val(), end.val());

		$("#" + prefix + "req_total_resource").val(dateDiff.dayDiff);
		$("#" + prefix + "req_plan_resource").val(dateDiff.planDiff);

		// $("#" + prefix + "req_total_time").val(dateDiff.dayDiff);
		// $("#" + prefix + "req_plan_time").val(dateDiff.dayDiff);
	}

	start.change(handle_change_req_date);
	end.change(handle_change_req_date);
}

///////////////////////////////////////////////////////////////////////////////
// Gantt Chart
///////////////////////////////////////////////////////////////////////////////
function setGanttTasks(data) {
	ganttTasks = data
		.sort((a, b) => a.c_parentid - b.c_parentid)
		.reduce((acc, cur) => {
			if (cur.c_parentid < 2) return acc;

			let dependencies = "";

			if (cur.c_parentid !== 2) {
				function setDependencies(parentId, parents) {
					const node = data.find((task) => task.c_id === parentId);

					if (node.c_parentid <= 2) {
						return parents;
					}

					return setDependencies(node.c_parentid, parents.concat(`${node.c_parentid}`));
				}

				dependencies = setDependencies(cur.c_parentid, [`${cur.c_parentid}`]);
			}

			const common_object = {
				id: `${cur.c_id}`,
				wbs: Array.isArray(dependencies) ? `${dependencies.reverse().join("-")}-${cur.c_id}` : `${cur.c_id}`,
				assignee: cur.c_req_owner,
				reporter: cur.c_req_writer,
				name: cur.c_title,
				progress: cur.c_req_plan_progress || 1,
				dependencies: dependencies,
				priority: cur.state,
				custom_class: cur.status, // optional
				type: cur.c_type,
				etc: cur.c_req_etc,
				manager: cur.c_req_manager,
				result: cur.c_req_output,
				level: cur.c_level,
				parentId: cur.c_parentid,
				position: cur.c_position,
				groupPosition: []
			};

			if (cur.c_req_start_date) {
				common_object.start = getDate(cur.c_req_start_date);
			}

			if (cur.c_req_end_date) {
				common_object.end = getDate(cur.c_req_end_date);
			}

			if (cur.c_type === "folder") {
				common_object.etc = "폴더";
			}
			else {
				common_object.total_resource = cur.c_req_total_resource == null ? 0 : cur.c_req_total_resource;
				common_object.plan_resource =  cur.c_req_plan_resource == null ? 0 : cur.c_req_plan_resource;
				// 	common_object.total_resource = cur.c_req_total_time == null ? 0 : cur.c_req_total_time;
				// 	common_object.plan_resouce = cur.c_req_plan_time == null ? 0 : cur.c_req_plan_time;
				common_object.plan = cur.c_req_plan_progress == null ? 0 : cur.c_req_plan_progress;
				common_object.performance = cur.c_req_performance_progress == null ? 0 : cur.c_req_performance_progress;
			}

			acc.push(common_object);

			return acc;
		}, []);

	return ganttTasks;
}

async function draggableNode(data) {
	const endPoint = "T_ARMS_REQADD_" + $("#selected_pdService").val();
	await $.ajax({
		type: "POST",
		url: "/auth-user/api/arms/reqAdd/" + endPoint + "/moveNode.do",
		data: {
			c_id: data.c_id,
			ref: data.ref,
			c_position: data.c_position,
			copy: 0,
			multiCounter: 0
		},
		progress: true
	});
}

function getMonitorData(selectId, selecteVersionId) {

	let endPointUrl = "/T_ARMS_REQADD_" + selectId + "/reqProgress.do";

	if(selecteVersionId) {
		let versionInfo ="?c_req_pdservice_versionset_link="+selecteVersionId;
		endPointUrl += versionInfo;
	}

	$.ajax({
		url: "/auth-user/api/arms/reqAddPure" + endPointUrl,
		type: "GET",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				if (!isEmpty(data)) {
					initGantt(data);
				}
			}
		}
	});
}

function updateNode(data, task) {
	const endPoint = "T_ARMS_REQADD_" + $("#selected_pdService").val();
	$.ajax({
		type: "POST",
		url: "/auth-user/api/arms/reqAdd/" + endPoint + "/updateDate.do",
		data: data,
		progress: true,
		statusCode: {}
	}).done(function () {
//	    getMonitorData($("#selected_pdService").val(), selectedVersionId);

		var tasks = $.map(ganttTasks, function (ganttTask) {
			if (ganttTask.id === data.c_id) {
				return $.extend({}, ganttTask, task);
			}

			return ganttTask;
		});

		ganttTasks = tasks;
		gantt.refresh(tasks);
	});
}

function closeTooltip(e) {
	if (e.target.tagName === "BUTTON") {
		e.target.blur();
	} else {
		e.target.parentElement.blur();
	}
}

function initGantt(data) {
	$("#gantt-target").empty();

	var tasks = setGanttTasks(data);

	if (isEmpty(tasks)) return;

	gantt = new Gantt(
		"#gantt-target",
		tasks,
		{
			on_date_change: (task, start, end) => {
				console.log("Update Start Date :: ", start);
				console.log("Update End Date :: ", end);
				var dateDiff = handle_change_date(start, end);

				console.log ("[ reqGantt :: initGantt ]");
				console.table(task);

				updateNode(
					{
						c_id: task.id,
						c_req_start_date: start,
						c_req_end_date: end
					},
					{
						start: getDate(start),
						end: getDate(end),
						total_resource: dateDiff.dayDiff,
						plan_resource: dateDiff.todayDiff,
						plan: dateDiff.plan_progress,
					}
				);
			},
			on_progress_change: (task, progress) => {
				console.log("Update Progress :: ", progress);
				var tasks = $.map(ganttTasks, function (ganttTask) {
					if (ganttTask.id === task.id) {
						return $.extend({}, ganttTask, {plan: `${progress || 0}%`});
					}

					return ganttTask;
				});

				ganttTasks = tasks;
				gantt.refresh(tasks);
				// updateNode(
				// 	{ c_id: task.id, c_req_plan_progress: progress },
				// 	{
				// 		progress: progress,
				// 		plan: `${progress || 0}%`
				// 	}
				// );
			},
			on_drag_row: (node) => {
				console.log("Move Node :: ", node);
				draggableNode(node);
			},
			language: navigator.language?.split("-")[0] || navigator.userLanguage
		},
		[
			{
				data: "id",
				title: "",
				render: (data, row) => {
					const btnWrapper = $("<div />");
					const updateBtn = $("<button />")
						.addClass("btn btn-success btn-sm mr-xs")
						.append($("<i />").addClass("fa fa-pencil"))
						.css({
							"margin-top": 0,
							"padding-top": 0,
							"padding-bottom": 0,
							border: "none",
							outline: "none",
							background: "none"
						})
						.attr({ "data-placement": "left", "data-original-title": "상세정보 조회 및 수정" })
						.tooltip({
							container: 'body'
						})
						.on("click", (e) => {
							closeTooltip(e);
							updateNodeModalOpen(row);
						});
					const addBtn = $("<button />")
						.addClass("btn btn-primary btn-sm mr-xs")
						.append($("<i />").addClass("fa fa-plus-circle"))
						.css({
							"margin-top": 0,
							"padding-top": 0,
							"padding-bottom": 0,
							border: "none",
							outline: "none",
							background: "none"
						})
						.attr({ "data-placement": "left", "data-original-title": "동일 레벨에 요구사항 추가" })
						.tooltip({
							container: 'body'
						})
						.on("click", (e) => {
							closeTooltip(e);
							addNodeModalOpen(row.parentId);
						});

					btnWrapper.append(updateBtn);
					btnWrapper.append(addBtn);

					if (row.type !== "default") {
						const addLevelDownBtn = $("<button />")
							.addClass("btn btn-primary btn-sm mr-xs")
							.append($("<i />").addClass("fa fa-level-down"))
							.css({
								"margin-top": 0,
								"padding-top": 0,
								"padding-bottom": 0,
								border: "none",
								outline: "none",
								background: "none"
							})
							.attr({ "data-placement": "left", "data-original-title": "폴더 하위에 요구사항 추가" })
							.tooltip({
								container: 'body'
							})
							.on("click", (e) => {
								closeTooltip(e);
								addNodeModalOpen(row.id);
							});

						btnWrapper.append(addLevelDownBtn);
					}

					return btnWrapper[0];
				}
			},
			{ data: "drag", title: "" },
			{ data: "wbs", title: "WBS" },
			{ data: "name", title: "작업" },
			{
				data: "etc",
				title: "비고",
				render: (data, row) => {
					if (row.type !== "default") {
						return data;
					}

					if (row.performance === 100) {
						let text = "완료";
						let btnWrapper = $("<span />")
							.addClass("label label-success")
							.css({
								padding: ".2em .6em .3em",
								margin: 0
							});
						btnWrapper.text(text);

						return btnWrapper[0];
					}
					return '';
				}
			},
			{ data: "start", title: "시작일" },
			{ data: "end", title: "완료일" },
			{ data: "total_resource", title: "총 작업량" },
			{ data: "plan_resource", title: "계획 작업량" },
			/*{
				data: "total_time",
				title: "총 기간(일)",
				render: (data, row) => {
					if (data != null) {
						return data;
					}
					else {
						return '';
					}
				}
			},
			{
				data: "plan_time",
				title: "계획기간(일)",
				render: (data, row) => {
					if (data != null) {
						return data;
					}
					else {
						return '';
					}
				}
			},*/
			{ data: "manager", title: "담당자" },
			{ data: "result", title: "산출물" },
			{
				data: "plan",
				title: "계획%",
				render: (data, row) => {
					if (data != null) {
						return row.plan + '%';
					}
					else {
						return '';
					}
				}
			},
			{
				data: "performance",
				title: "실적%",
				render: (data, row) => {
					if (data != null) {
						return row.performance + '%';
					}
					else {
						return '';
					}
				}
			}
		]
	);
}

function getDate(stamp) {
	const time = !stamp || stamp < 0 ? new Date() : new Date(stamp);
	return `${time.getFullYear()}-${addZero(time.getMonth() + 1)}-${addZero(time.getDate())}`;
}

function addZero(n) {
	return n < 10 ? `0${n}` : n;
}

///////////////////////////////////////////////////////////////////////////////
// 모달
///////////////////////////////////////////////////////////////////////////////
function updateNodeModalOpen(item) {
	selectedId = item.id;
	selectedType = item.type;

	// $(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").hide(); //상세보기
	$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").hide(); //편집하기
	$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").hide(); //리스트보기
	$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").hide(); //문서로보기
	$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").hide(); //JIRA연결설정

	if (selectedType === "folder" || selectedType === "drive") {
		$("#my_modal2_title").text(" 요구사항 내용");
		$("#my_modal2_desc").text(" 요구사항 세부 내용 조회");

		$("#folder_tab").get(0).click();
		$(".newReqDiv").show();

		$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").show(); //리스트보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //문서로보기

		// 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
		// 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
		dataTableLoad();
	}
	else {
		$("#my_modal2_title").text(" 요구사항 수정 팝업");
		$("#my_modal2_desc").text(" ARMS에 요구사항을 수정합니다.");

		// $("#default_tab").get(0).click();
		$("#edit_tab").get(0).click();
		$(".newReqDiv").hide();
		// $(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").show(); //상세보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").show(); //편집하기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").show(); //JIRA연결설정

		//상세보기 탭 셋팅
		setDetailAndEditViewTab();
	}

	$("#my_modal").modal("show");
}

function addNodeModalOpen(parentId) {
	//제품(서비스) 데이터 바인딩
	parentIdOfSelected = parentId;
	var selectedPdServiceText = $("#selected_pdService").select2("data")[0].text;
	var datepickerOption = {
		timepicker: false,
		format: "Y/m/d",
		formatDate: "Y/m/d",
		value: null,
		scrollInput: false
	};

	if (isEmpty(selectedPdServiceText)) {
		$("#addview_req_pdservice_name").val("");
	} else {
		$("#addview_req_pdservice_name").val(selectedPdServiceText);
	}

	$("#add_multi_version").multipleSelect("uncheckAll");
	$("#addview_req_title").val("");
	$("#addview_req_writer").val("[" + userName + "]" + " - " + userID);
	$("#addview_req_reviewers").val(null).trigger("change");

	$("#addview_req_start_date").val(null);
	$("#addview_req_end_date").val(null);
	$("#addview_req_start_date").datetimepicker(datepickerOption);
	$("#addview_req_end_date").datetimepicker(datepickerOption);

	$("#addview_req_priority").children(".btn.active").removeClass("active");
	$("#addview_req_difficulty").children(".btn.active").removeClass("active");
	$("#addview_req_state").children(".btn.active").removeClass("active");

	CKEDITOR.instances.add_tabmodal_editor.setData($("<p />").text("요구사항 내용을 기록합니다."));

	$("#my_modal1").modal("show");
}

function popup_size_setting() {
	var height = $(document).height() - 600;

	$("#my_modal").on("hidden.bs.modal", function (e) {
		$(this).find("form")[0]?.reset();
	});

	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");
}

///////////////////////////////////////////////////////////////////////////////
// 프로젝트 진행율
///////////////////////////////////////////////////////////////////////////////
function scheduleUpdate() {
	console.log("::: scheduleUpdate :: ganttTaks ->");
	console.log(ganttTasks);
	if(ganttTasks == null) {
		alert("데이터가 존재하지 않습니다.");
		return false;
	}
	bindProjectProgress(ganttTasks);
}

function bindProjectProgress(data) {
	let pdservice_progress = data.reduce((acc, cur) => {

		// default의 경우에만 계산
		if (cur.type === "default") {
			// 계산식 추가 예정
			acc.total_work += cur.total_resource;
			acc.plan_work += cur.plan_resource;
			acc.plan_progress += cur.plan;

			const today = new Date();
			const todayFormatted = getDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

			if ((cur.start && cur.end) && (cur.start < todayFormatted)) {
				acc.total_performance_progress += cur.performance;
				acc.req_count += 1;
			}
		}

		return acc;
	}, {
		total_work: 0,
		plan_work: 0,
		plan_progress: 0,
		total_performance_progress: 0,
		req_count: 0
	});

	let project_progress= 0;
	let plan_progress_rate = 0;
	let performance_progress_rate = 0;
	let performance_capability = 0;

	if (pdservice_progress.req_count > 0) {
		performance_progress_rate = pdservice_progress.total_performance_progress / pdservice_progress.req_count;
	}

	if (pdservice_progress.total_work > 0) {
		plan_progress_rate = (pdservice_progress.plan_work / pdservice_progress.total_work) * 100.0;
	}

	project_progress = performance_progress_rate - plan_progress_rate;
	performance_capability = pdservice_progress.total_work * performance_progress_rate / 100.0;

	$("#total_work").val(pdservice_progress.total_work);
	$("#planed_work").val(pdservice_progress.plan_work);
	$("#performance_capability").val(performance_capability.toFixed(0));
	$("#plan_progress_rate").val(plan_progress_rate.toFixed(2));
	$("#performance_progress_rate").val(performance_progress_rate.toFixed(2));
	$("#project_progress").val(project_progress.toFixed(2));

	if (project_progress < 0) {
		$("#project_progress").css("color" ,"#DB2A34");
	}
	else {
		$("#project_progress").css("color", "#a4c6ff");
	}
}

function resetProjectProgress() {
	$("#total_work").val(null);
	$("#planed_work").val(null);
	$("#performance_capability").val(null);
	$("#actual_input").val(null);
	$("#plan_progress_rate").val(null);
	$("#performance_progress_rate").val(null);
	$("#project_progress").val(null);
}

function diff_day(startDate, endDate) {
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (start > end) {
		return 0;
	}

	let result = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

	return result;
}