////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디

function execDocReady() {
	var pluginGroups = [
		["../reference/lightblue4/docs/lib/widgster/widgster.js"],
		[
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js"
		]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			setUrlParams();

			$(".widget").widgster();

			setSideMenu("sidebar_menu_product", "sidebar_menu_total_reqadd");

			build_ReqData_By_PdService();
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

function setUrlParams() {
	urlParams = new URL(location.href).searchParams;
	selectedPdService = urlParams.get("pdService");
	selectedPdServiceVersion = urlParams.get("pdServiceVersion");
	selectedJsTreeId = urlParams.get("reqAdd");
	selectedJiraServer = urlParams.get("jiraServer");
	selectedJiraProject = urlParams.get("jiraProject");
}

////////////////////////////////////////////////////////////////////////////////////////
//요구사항 :: jsTree
////////////////////////////////////////////////////////////////////////////////////////
function build_ReqData_By_PdService() {
	var jQueryElementID = "#req_tree";
	var serviceNameForURL = "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" + selectedPdService;

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

	setDetailAndEditViewTab();
}

function setDetailAndEditViewTab() {
	console.log("Detail Tab ::::");
	var tableName = "T_ARMS_REQADD_" + selectedPdService;
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

// ------------------ 상세보기 ------------------ //
function bindDataDetailTab(ajaxData) {
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
	$("#detailview_req_contents").html(ajaxData.c_req_contents);
}
