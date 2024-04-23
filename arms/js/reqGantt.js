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
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js"
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

			/*TopMenuApi.setEqualHeight(".top-menu-div");
			TopMenuApi.resizeHeightEvent();*/


			popup_size_setting();

			autoCompleteForUser();

			// 스크립트 실행 로직을 이곳에 추가합니다.

			click_btn_for_req_add();
			click_btn_for_req_update();
			click_btn_for_search_history();
			change_tab_action();
			click_btn_for_connect_req_jira();
			change_input_for_req_date("editview_");
			change_input_for_req_date("addview_");

			switch_action_for_mode();

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
	});
} // end makePdServiceSelectBox()


////////////////////////////////////////////////////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makeVersionMultiSelectBox() {
	//버전 선택 셀렉트 박스 이니시에이터
	$(".multiple-select").multipleSelect({
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
	} else {
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
			bindDataEditlTab(data);
			// ------------------ 상세보기 ------------------ //
			// bindDataDetailTab(data);
		})
		.fail(function (e) {})
		.always(function () {});
}

// ------------------ 편집하기 ------------------ //
function bindDataEditlTab(ajaxData) {
	console.log("checl edit data" + ajaxData.c_req_reviewer01);

	//제품(서비스) 데이터 바인딩
	var selectedPdServiceText = $("#selected_pdService").select2("data")[0].text;
	var datepickerOption = {
		timepicker: false,
		format: "Y/m/d",
		formatDate: "Y/m/d",
		scrollInput: false
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
	$("#editview_req_name").val(ajaxData.c_title);

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
		console.log("bindDataEditlTab :: ajaxData.c_req_reviewer01 empty");
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
		console.log("bindDataEditlTab :: ajaxData.c_req_reviewer02 empty");
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
		console.log("bindDataEditlTab :: ajaxData.c_req_reviewer03 empty");
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
		console.log("bindDataEditlTab :: ajaxData.c_req_reviewer04 empty");
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
		console.log("bindDataEditlTab :: ajaxData.c_req_reviewer05 empty");
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

	$("#editview_req_plan_time").val(ajaxData.c_req_plan_time);

	CKEDITOR.instances.edit_tabmodal_editor.setData(ajaxData.c_req_contents);
}

// ------------------ 상세보기 ------------------ //
// function bindDataDetailTab(ajaxData) {
// 	//제품(서비스) 데이터 바인딩
// 	var selectedPdServiceText = $("#selected_pdService").select2("data")[0].text;
// 	if (isEmpty(selectedPdServiceText)) {
// 		$("#detailview_req_pdservice_name").val("");
// 	} else {
// 		$("#detailview_req_pdservice_name").val(selectedPdServiceText);
// 	}
//
// 	//Version 데이터 바인딩
// 	var selectedVersionText = $("#edit_multi_version").multipleSelect("getSelects", "text");
// 	if (isEmpty(selectedVersionText)) {
// 		$("#detailview_req_pdservice_version").val("요구사항에 등록된 버전이 없습니다.");
// 	} else {
// 		$("#detailview_req_pdservice_version").val(selectedVersionText);
// 	}
// 	$("#detailview_req_id").val(ajaxData.c_id);
// 	$("#detailview_req_name").val(ajaxData.c_title);
//
// 	//우선순위 셋팅
// 	$("#detailview_req_priority").children(".btn.active").removeClass("active");
// 	var select_Req_Priority_ID = "detailView-req-priority-option" + ajaxData.c_priority;
// 	$("#" + select_Req_Priority_ID)
// 		.parent()
// 		.addClass("active");
//
// 	$("#detailview_req_status").val(ajaxData.c_req_status);
// 	$("#detailview_req_writer").val(ajaxData.c_req_writer);
// 	$("#detailview_req_write_date").val(new Date(ajaxData.c_req_create_date).toLocaleString());
//
// 	if (ajaxData.c_req_reviewer01 == null || ajaxData.c_req_reviewer01 == "none") {
// 		$("#detailview_req_reviewer01").val("리뷰어(연대책임자)가 존재하지 않습니다.");
// 	} else {
// 		$("#detailview_req_reviewer01").val(ajaxData.c_req_reviewer01);
// 	}
// 	if (ajaxData.c_req_reviewer02 == null || ajaxData.c_req_reviewer02 == "none") {
// 		$("#detailview_req_reviewer02").val("2번째 리뷰어(연대책임자) 없음");
// 	} else {
// 		$("#detailview_req_reviewer02").val(ajaxData.c_req_reviewer02);
// 	}
// 	if (ajaxData.c_req_reviewer03 == null || ajaxData.c_req_reviewer03 == "none") {
// 		$("#detailview_req_reviewer03").val("3번째 리뷰어(연대책임자) 없음");
// 	} else {
// 		$("#detailview_req_reviewer03").val(ajaxData.c_req_reviewer03);
// 	}
// 	if (ajaxData.c_req_reviewer04 == null || ajaxData.c_req_reviewer04 == "none") {
// 		$("#detailview_req_reviewer04").val("4번째 리뷰어(연대책임자) 없음");
// 	} else {
// 		$("#detailview_req_reviewer04").val(ajaxData.c_req_reviewer04);
// 	}
// 	if (ajaxData.c_req_reviewer05 == null || ajaxData.c_req_reviewer05 == "none") {
// 		$("#detailview_req_reviewer05").val("5번째 리뷰어(연대책임자) 없음");
// 	} else {
// 		$("#detailview_req_reviewer05").val(ajaxData.c_req_reviewer05);
// 	}
// 	//$("#detailview_req_contents").html(ajaxData.c_req_contents);
//
// 	$("#detailview_req_start_date").val(getDate(new Date(ajaxData.c_req_start_date)));
// 	$("#detailview_req_end_date").val(getDate(new Date(ajaxData.c_req_end_date)));
//
// 	$("#detailview_req_total_resource").val(ajaxData.c_req_total_resource);
// 	$("#detailview_req_plan_resource").val(ajaxData.c_req_plan_resource);
//
// 	$("#detailview_req_total_time").val(ajaxData.c_req_total_time);
// 	$("#detailview_req_plan_time").val(ajaxData.c_req_plan_time);
//
// 	$("#detailview_req_manager").val(ajaxData.c_req_manager);
//
// 	CKEDITOR.instances.detailview_req_contents.setData(ajaxData.c_req_contents);
// }

///////////////////////////////////////////////////////////////////////////////
//문서로 보기 탭
///////////////////////////////////////////////////////////////////////////////
function setDocViewTab() {
	$(".dd-list").empty();
	var data = $("#req_table").DataTable().rows().data().toArray();

	var firstBranchChecker = true;
	$.each(data, function (key, value) {
		if (value.c_contents == null || value.c_contents == "null") {
			value.c_contents = "";
		}

		console.log(value.c_id + "=" + value.c_type + "=" + value.c_title + "//" + value.c_parentid);

		var iconHtml;
		if (value.c_type == "root" || value.c_type == "drive") {
			iconHtml = "<i class='fa fa-clipboard'></i>";
		} else if (value.c_type == "folder") {
			iconHtml = "<i class='fa fa-files-o'></i>";
		} else {
			iconHtml = "<i class='fa fa-file-text-o'></i>";
		}

		if (value.c_type == "root") {
			console.log("ROOT 노드는 처리하지 않습니다.");
		} else if (value.c_type == "drive" || value.c_type == "folder") {
			if (firstBranchChecker) {
				$(".dd-list").append(
					"<li class='dd-item' id='" +
						"T_ARMS_REQ_" +
						value.c_id +
						"' data-id='" +
						value.c_id +
						"'>" +
						"<div class='dd-handle'>" +
						iconHtml +
						" " +
						value.c_title +
						"<p>" +
						value.c_contents +
						"</p>" +
						"</div>" +
						"</li>"
				);
				firstBranchChecker = false;
			} else {
				$("#T_ARMS_REQ_" + value.c_parentid).append(
					"<ol class='dd-list'>" +
						"<li class='dd-item' id='" +
						"T_ARMS_REQ_" +
						value.c_id +
						"' data-id='" +
						value.c_id +
						"'>" +
						"<div class='dd-handle'>" +
						iconHtml +
						" " +
						value.c_title +
						"<p>" +
						value.c_contents +
						"</p>" +
						"</div>" +
						"</li>" +
						"</ol>"
				);
			}
		} else {
			$("#T_ARMS_REQ_" + value.c_parentid).append(
				"<ol class='dd-list'>" +
					"<li class='dd-item' id='" +
					"T_ARMS_REQ_" +
					value.c_id +
					"' data-id='" +
					value.c_id +
					"'>" +
					"<div class='dd-handle'>" +
					iconHtml +
					" " +
					value.c_title +
					"<p>" +
					value.c_contents +
					"</p>" +
					"</div>" +
					"</li>" +
					"</ol>"
			);
		}
	});
	//console.log(data);
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

function switch_action_for_mode() {
	$(".form-horizontal input[name=reqType]").on("change", function () {
		if ($("input[name=reqType]:checked").val() == "default") {
			$("#popup_version_div").show();
			$("#popup_reviewer_div").show();
			$("#popup_priority_div").show();

			$("#popup_req_priority_div").show();
			$("#popup_req_difficulty_div").show();
			$("#popup_req_state_div").show();

			$("#popup_req_plan_time_div").show();
		} else {
			$("#popup_version_div").hide();
			$("#popup_reviewer_div").hide();
			$("#popup_priority_div").hide();

			$("#popup_req_priority_div").hide();
			$("#popup_req_difficulty_div").hide();
			$("#popup_req_state_div").hide();

			$("#popup_req_plan_time_div").hide();
		}
	});
}

///////////////////////////////////////////////////////////////////////////////
// 신규 요구사항 등록 버튼
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_req_add() {
	$("#save_req").click(function () {
		var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();
		var c_type_value;
		if (isEmpty($("input[name=reqType]:checked").val())) {
			c_type_value = "default";
		} else {
			c_type_value = $("input[name=reqType]:checked").val();
		}

		var reqTitle = $("#addview_req_title").val().trim();
		if(!reqTitle) {
			alert("요구사항 제목이 없습니다.");
			return false;
		}

		if(!reqTitle) {
			alert("요구사항 제목이 없습니다.");
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
		let req_plan_time = $("#addview_req_plan_time").val();

		var versionset_link = JSON.stringify($("#add_multi_version").val());

		let dataObjectParam = {
			ref: parentIdOfSelected,
			c_title: reqTitle,
			c_type: c_type_value,
			c_req_pdservice_link: $("#selected_pdService").val(),
			c_req_writer: "[" + userName + "]" + " - " + userID,
			c_req_contents: CKEDITOR.instances["add_tabmodal_editor"].getData(),
			c_req_desc: "설명",
			c_req_etc: "비고"
		};

		if (c_type_value === "default") {
			if (!req_plan_time || req_plan_time === "") {
				alert("요구사항 예정 일정을 입력해주세요.");
				return false;
			}
			else if (isNaN(req_plan_time)) {
				alert("예상 일정에는 숫자를 입력해주세요.");
				return false;
			}

			Object.assign(dataObjectParam, {
				c_req_pdservice_versionset_link: versionset_link,
				c_req_priority_link: select_req_priority_link,
				c_req_difficulty_link: select_req_difficulty_link,
				c_req_state_link: select_req_state_link,
				c_req_plan_time: req_plan_time,
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

		let urlSuffix = c_type_value === "default" ? "/addNode.do" : "/addFolderNode.do";
		let successMessage = c_type_value === "default" ?
			"신규 요구사항 ( " + reqTitle + " )이 추가되었습니다." :
			" 요구사항 폴더 ( " + reqTitle + " )가 등록되었습니다.";

		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + urlSuffix,
			type: "POST",
			data: dataObjectParam,
			statusCode: {
				200: function () {
					jSuccess(successMessage);
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
// 요구사항 편집 탭 저장 버튼
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_req_update() {
	$("#edit_tab_req_update, #footer_edit_tab_req_update").click(function () {
		var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();
		var reqName = $("#editview_req_name").val();

		var reviewers01 = "none";
		var reviewers02 = "none";
		var reviewers03 = "none";
		var reviewers04 = "none";
		var reviewers05 = "none";
		if ($("#editview_req_reviewers").select2("data")[0] != undefined) {
			reviewers01 = $("#editview_req_reviewers").select2("data")[0].text;
		}
		if ($("#editview_req_reviewers").select2("data")[1] != undefined) {
			reviewers02 = $("#editview_req_reviewers").select2("data")[1].text;
		}
		if ($("#editview_req_reviewers").select2("data")[2] != undefined) {
			reviewers03 = $("#editview_req_reviewers").select2("data")[2].text;
		}
		if ($("#editview_req_reviewers").select2("data")[3] != undefined) {
			reviewers04 = $("#editview_req_reviewers").select2("data")[3].text;
		}
		if ($("#editview_req_reviewers").select2("data")[4] != undefined) {
			reviewers05 = $("#editview_req_reviewers").select2("data")[4].text;
		}

		let edit_req_plan_time = $("#editview_req_plan_time").val();
		let edit_req_type = $("#editview_req_type").val();

		if (edit_req_type === "default") {
			if (!edit_req_plan_time || edit_req_plan_time === "") {
				alert("변경하려는 요구사항 예정 일정을 입력해주세요.");
				return false;
			}
			else if (isNaN(edit_req_plan_time)) {
				alert("예상 일정에는 숫자를 입력해주세요.");
				return false;
			}
		}

		var versionset_link = JSON.stringify($("#edit_multi_version").val());

		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/updateNode.do",
			type: "POST",
			data: {
				c_id: $("#editview_req_id").val(),
				c_title: $("#editview_req_name").val(),
				c_req_pdservice_versionset_link: versionset_link,
				// c_req_writer: "[" + userName + "]" + " - " + userID, 요청자는 최초 요청자로 고정. 수정 시 요청자는 변경하지 않는 것으로 처리
				c_req_update_date: new Date(),
				c_req_priority_link: $("#editview_req_priority .btn.active input").val(),
				c_req_difficulty_link: $("#editview_req_difficulty .btn.active input").val(),
				c_req_state_link: $("#editview_req_state .btn.active input").val(),
				c_req_reviewer01: reviewers01,
				c_req_reviewer02: reviewers02,
				c_req_reviewer03: reviewers03,
				c_req_reviewer04: reviewers04,
				c_req_reviewer05: reviewers05,
				c_req_plan_time: edit_req_plan_time,
				c_req_contents: CKEDITOR.instances["edit_tabmodal_editor"].getData()
			},
			statusCode: {
				200: function () {
					jSuccess(reqName + "의 데이터가 변경되었습니다.");
					getMonitorData($("#selected_pdService").val(), selectedVersionId);
				}
			}
		});
	});
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
	var startDate = new Date(start);
	var endDate = new Date(end);

	var diffYear = endDate.getFullYear() - startDate.getFullYear();
	var diffMonth = endDate.getMonth() - startDate.getMonth();
	var timeDiff = endDate.getTime() - startDate.getTime();
	var dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

	return {
		dayDiff: dayDiff,
		diffMonth: diffYear * 12 + diffMonth,
		diffMM: Math.round(dayDiff / 22)
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

		$("#" + prefix + "req_total_resource").val(dateDiff.diffMonth);
		$("#" + prefix + "req_plan_resource").val(dateDiff.diffMonth);

		$("#" + prefix + "req_total_time").val(dateDiff.dayDiff);
		$("#" + prefix + "req_plan_time").val(dateDiff.dayDiff);
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

			if (cur.c_type === "folder") {
				cur.c_req_etc = "폴더";
				acc.push({
					id: `${cur.c_id}`,
					wbs: Array.isArray(dependencies) ? `${dependencies.reverse().join("-")}-${cur.c_id}` : `${cur.c_id}`,
					name: cur.c_title,
					dependencies: dependencies,
					custom_class: cur.status, // optional
					type: cur.c_type,
					etc: cur.c_req_etc,
					level: cur.c_level,
					parentId: cur.c_parentid,
					position: cur.c_position,
					groupPosition: []
				});
			}
			else {
				acc.push({
					id: `${cur.c_id}`,
					wbs: Array.isArray(dependencies) ? `${dependencies.reverse().join("-")}-${cur.c_id}` : `${cur.c_id}`,
					assignee: cur.c_req_owner,
					reporter: cur.c_req_writer,
					name: cur.c_title,
					start: getDate(cur.c_req_start_date),
					end: getDate(cur.c_req_end_date),
					progress: cur.c_req_plan_progress || 1,
					dependencies: dependencies,
					priority: cur.state,
					custom_class: cur.status, // optional
					type: cur.c_type,
					etc: cur.c_req_etc,
					tmm: `${cur.c_req_total_resource || 0} M/M`,
					p_work: `${cur.c_req_plan_resource || 0} M/M`,
					t_period: cur.c_req_total_time,
					tpp: cur.c_req_plan_time,
					manager: cur.c_req_manager,
					result: cur.c_req_output,
					plan: `${cur.c_req_plan_progress || 0}%`,
					performance: `${cur.c_req_performance_progress || 0}%`,
					level: cur.c_level,
					parentId: cur.c_parentid,
					position: cur.c_position,
					groupPosition: []
				});
			}

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
				let plan_progress = calculatePlanProgress(start, end);

				updateNode(
					{
						c_id: task.id,
						c_req_start_date: start,
						c_req_end_date: end
					},
					{
						start: getDate(start),
						end: getDate(end),
						tmm: `${dateDiff.diffMM} M/M`,
						t_period: dateDiff.dayDiff,
						plan: `${plan_progress}%`,
					}
				);
			},
			on_progress_change: (task, progress) => {
				console.log("Update Progress :: ", progress);
				updateNode(
					{ c_id: task.id, c_req_plan_progress: progress },
					{
						progress: progress,
						plan: `${progress || 0}%`,
						performance: `${progress || 0}%`
					}
				);
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
						.tooltip()
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
						.tooltip()
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
							.attr({ "data-placement": "left", "data-original-title": "하위에 요구사항 추가" })
							.tooltip()
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
			{ data: "etc", title: "비고" },
			{ data: "start", title: "시작일" },
			{ data: "end", title: "완료일" },
			{ data: "tmm", title: "총 작업량" },
			{ data: "p_work", title: "계획작업" },
			{ data: "t_period", title: "총 기간" },
			{ data: "tpp", title: "계획기간" },
			{ data: "manager", title: "담당자" },
			{ data: "result", title: "산출물" },
			{ data: "plan", title: "계획" },
			{ data: "performance", title: "실적" }
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

	$("#my_modal").modal("show");

	// $(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").hide(); //상세보기
	$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").hide(); //편집하기
	$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").hide(); //리스트보기
	$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").hide(); //문서로보기
	$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").hide(); //JIRA연결설정

	if (selectedType == "folder" || selectedType == "drive") {
		$("#my_modal2_title").text(" 요구사항 내용");
		$("#my_modal2_desc").text(" 요구사항 세부 내용 조회");

		$("#folder_tab").get(0).click();
		$(".newReqDiv").show();

		$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").show(); //리스트보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //문서로보기

		// 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
		// 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
		dataTableLoad();
	} else {
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
}

function addNodeModalOpen(parentId) {
	//제품(서비스) 데이터 바인딩
	parentIdOfSelected = parentId;
	var selectedPdServiceText = $("#selected_pdService").select2("data")[0].text;
	var datepickerOption = {
		timepicker: false,
		format: "Y/m/d",
		formatDate: "Y/m/d",
		value: new Date(),
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

	$("#addview_req_start_date").datetimepicker(datepickerOption);
	$("#addview_req_end_date").datetimepicker(datepickerOption);

	$("#addview_req_total_resource").val(null);
	$("#addview_req_plan_resource").val(null);
	$("#addview_req_total_time").val(null);
	$("#addview_req_plan_time").val(null);

	$("#addview_req_manager").val(null).trigger("change");

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
	console.log("::: scheduleUpdate :::");
	bindProjectProgress();
}

function bindProjectProgress(data) {
	$("#total_work").val(1234.56);
	$("#planed_work").val(7890.12);
	$("#performance_capability").val(3456.78);
	$("#actual_input").val(9012.34);
	$("#planned_progress").val(5678.9);
	$("#performance_progress").val(9876.54);
	$("#project_progress").val(3210.98);
}

function calculatePlanProgress(startDate, endDate) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const today = new Date();
	const todayFormatted = new Date(today.getFullYear(), today.getMonth(), today.getDate());

	// 시작일이 오늘보다 이후일 경우
	if (start > todayFormatted) {
		return 0;
	}

	const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
	const progressDays = Math.ceil((todayFormatted - start) / (1000 * 60 * 60 * 24));

	let progress = (progressDays / totalDays) * 100;

	if (progress > 100) {
		progress = 100;
	}

	return progress.toFixed(0);
}