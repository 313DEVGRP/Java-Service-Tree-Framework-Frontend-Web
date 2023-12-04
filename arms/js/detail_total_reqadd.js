////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedJsTreeId; // 요구사항 아이디
var selectedJsTreeName; // 요구사항 이름
var tempDataTable;
var isChecked = []; // 지라 프로젝트 연결 목록 체크
var jiraCheckId = []; // 여러 개의 c_id를 저장할 배열

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
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
		],

		[
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js",
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
			}, 3000); // 2초 후에 실행됩니다.

			//vfs_fonts 파일이 커서 defer 처리 함.
			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 3000); // 2초 후에 실행됩니다.
			console.log("모든 플러그인 로드 완료");

			// --- 에디터 설정 --- //
			var waitCKEDITOR = setInterval(function () {
				try {
					if (window.CKEDITOR) {
						if (window.CKEDITOR.status == "loaded") {
							CKEDITOR.replace("detailview_req_contents", { skin: "office2013" });
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);

			makeDatePicker($("#btn_start_calendar_popup"));
			makeDatePicker($("#btn_end_calendar_popup"));

			// jira 서버 정보 데이터 테이블 셋팅
			//datatables_jira_project();

			autoCompleteForUser();

			// 스크립트 실행 로직을 이곳에 추가합니다.
			build_ReqData_By_PdService();
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

////////////////////////////////////////////////////////////////////////////////////////
//요구사항 :: jsTree
////////////////////////////////////////////////////////////////////////////////////////
function build_ReqData_By_PdService() {
	console.log("!!!");
	var jQueryElementID = "#req_tree";
	var serviceNameForURL = "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" + 22;

	jsTreeBuild(jQueryElementID, serviceNameForURL);
}

// --- 요구사항 (jstree) 선택 이벤트 --- //
function jsTreeClick(selectedNode) {
	console.log("============= js click");
	console.log("[ reqAdd :: jsTreeClick ] :: selectedNode ");
	console.log(selectedNode);

	selectedJsTreeId = selectedNode.attr("id").replace("node_", "").replace("copy_", "");
	selectedJsTreeName = $("#req_tree").jstree("get_selected").text();

	var selectRel = selectedNode.attr("rel");

	if (selectedJsTreeId == 2) {
		$("#select_Req").text("루트 요구사항이 선택되었습니다.");
	} else if (selectRel == "folder") {
		$("#select_Req").text("(folder)" + $(".jstree-clicked").text());
	} else {
		$("#select_Req").text($("#req_tree").jstree("get_selected").text());
	}

	// //요구사항 타입에 따라서 탭의 설정을 변경
	// if (selectRel == "folder" || selectRel == "drive") {
	// 	$("#folder_tab").get(0).click();
	// 	$(".newReqDiv").show();
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").hide(); //상세보기
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").hide(); //편집하기
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //리스트보기
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").show(); //문서로보기
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(5)").hide(); //JIRA연결설정
	//
	// 	// 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
	// 	// 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
	// 	dataTableLoad(selectedJsTreeId, selectRel);
	// } else {
	// 	$("#default_tab").get(0).click();
	// 	$(".newReqDiv").hide();
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").show(); //상세보기
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").show(); //편집하기
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").hide(); //리스트보기
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").hide(); //문서로보기
	// 	$(".widget-tabs").children("header").children("ul").children("li:nth-child(5)").show(); //JIRA연결설정
	//
	// 	//이전에 화면에 렌더링된 데이터 초기화
	// 	// ------------------ 편집하기 ------------------ //
	// 	// bindDataEditlTab(data);
	// 	// // ------------------ 상세보기 ------------------ //
	// 	// bindDataDetailTab(data);
	// 	//상세보기 탭 셋팅
	setDetailAndEditViewTab();
	// 	// defaultType_dataTableLoad(selectedJsTreeId);
	// }
}

////////////////////////////////////////////////////////////////////////////////////////
//리스트 :: DataTable
////////////////////////////////////////////////////////////////////////////////////////
// --- Root, Drive, Folder 데이터 테이블 설정 --- //
function dataTableLoad(selectId, selectRel) {
	console.log("dataTableLoad - selectRel:::" + selectRel);
	console.log("dataTableLoad - selectId:::" + selectId);
	// 데이터 테이블 컬럼 및 열그룹 구성
	var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();

	var c_type = $("#req_tree").jstree("get_selected").attr("rel");
	console.log("dataTableLoad - c_type:::" + c_type);

	var dataTableRef;
	if (selectId == 2) {
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
		var ajaxUrl = "/auth-user/api/arms/reqAdd/" + tableName + "/getMonitor.do";
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
	} else if (selectRel !== "folder") {
		//select node 정보를 가져온다.
		console.log("tableName:: " + tableName);
		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectId,
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
			.done(function (data) {})
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
		var ajaxUrl = "/auth-user/api/arms/reqAdd/" + tableName + "/getChildNodeWithParent.do?c_id=" + selectId;
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
	var tableName = "T_ARMS_REQADD_" + 22;
	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedJsTreeId,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true
	})
		.done(function (data) {
			// ------------------ 상세보기 ------------------ //
			bindDataDetailTab(data);
		})
		.fail(function (e) {})
		.always(function () {});
}

// ------------------ 편집하기 ------------------ //
function bindDataEditlTab(ajaxData) {
	console.log("checl edit data" + ajaxData.c_req_reviewer01);
	console.table(ajaxData);

	// 버전 데이터 바인딩
	if (!isEmpty(ajaxData.c_req_pdservice_versionset_link)) {
		$("#edit_multi_version").multipleSelect("setSelects", JSON.parse(ajaxData.c_req_pdservice_versionset_link));
	} else {
		$("#edit_multi_version").multipleSelect("uncheckAll");
	}

	$("#editview_req_id").val(ajaxData.c_id);
	$("#editview_req_name").val(ajaxData.c_title);

	$("#editview_req_priority").children(".btn.active").removeClass("active");
	var slectReqPriorityID = "editview_req_priority-option" + ajaxData.c_priority;
	$("#" + slectReqPriorityID)
		.parent()
		.addClass("active");

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
	$("#editview_req_status").val(ajaxData.c_req_status);
	$("#editview_req_writer").val(ajaxData.c_req_writer); //ajaxData.c_req_reviewer01
	$("#editview_req_write_date").val(new Date(ajaxData.c_req_create_date).toLocaleString());
}

// ------------------ 상세보기 ------------------ //
function bindDataDetailTab(ajaxData) {
	console.log("###########################################");
	console.log("bindDataDetailTab :::::::::::");
	console.log(ajaxData);

	//Version 데이터 바인딩
	var selectedVersionText = "BaseVersion";
	if (isEmpty(selectedVersionText)) {
		$("#detailview_req_pdservice_version").val("요구사항에 등록된 버전이 없습니다.");
	} else {
		$("#detailview_req_pdservice_version").val(selectedVersionText);
	}
	$("#detailview_req_id").val(ajaxData.c_id);
	$("#detailview_req_name").val(ajaxData.c_title);

	//우선순위 셋팅
	$("#detailview_req_priority").children(".btn.active").removeClass("active");
	var select_Req_Priority_ID = "detailView-req-priority-option" + ajaxData.c_priority;
	$("#" + select_Req_Priority_ID)
		.parent()
		.addClass("active");

	$("#detailview_req_status").val(ajaxData.c_req_status);
	$("#detailview_req_writer").val(ajaxData.c_req_writer);
	$("#detailview_req_write_date").val(new Date(ajaxData.c_req_create_date).toLocaleString());

	if (ajaxData.c_req_reviewer01 == null || ajaxData.c_req_reviewer01 == "none") {
		$("#detailview_req_reviewer01").val("리뷰어(연대책임자)가 존재하지 않습니다.");
	} else {
		$("#detailview_req_reviewer01").val(ajaxData.c_req_reviewer01);
	}
	if (ajaxData.c_req_reviewer02 == null || ajaxData.c_req_reviewer02 == "none") {
		$("#detailview_req_reviewer02").val("2번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer02").val(ajaxData.c_req_reviewer02);
	}
	if (ajaxData.c_req_reviewer03 == null || ajaxData.c_req_reviewer03 == "none") {
		$("#detailview_req_reviewer03").val("3번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer03").val(ajaxData.c_req_reviewer03);
	}
	if (ajaxData.c_req_reviewer04 == null || ajaxData.c_req_reviewer04 == "none") {
		$("#detailview_req_reviewer04").val("4번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer04").val(ajaxData.c_req_reviewer04);
	}
	if (ajaxData.c_req_reviewer05 == null || ajaxData.c_req_reviewer05 == "none") {
		$("#detailview_req_reviewer05").val("5번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer05").val(ajaxData.c_req_reviewer05);
	}
	//$("#detailview_req_contents").html(ajaxData.c_req_contents);

	CKEDITOR.instances.detailview_req_contents.setData(ajaxData.c_req_contents);
}

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
				return "/auth-check/getUsers/" + params.term;
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

///////////////////////////////////////////////////////////////////////////////
// 달력
///////////////////////////////////////////////////////////////////////////////
function makeDatePicker(calender) {
	var Inputs = $(calender).parent().prev().val();
	$(calender).attr("data-date", Inputs);

	calender
		.datepicker({
			autoclose: true
		})
		.datepicker("update", Inputs)
		.on("changeDate", function (ev) {
			var Input = $(this).parent().next();
			Input.val(calender.data("date"));
			calender.datepicker("hide");
		});
}

$("#text").on("input", function () {
	var searchString = $(this).val();
	$("#req_tree").jstree("search", searchString);
});
