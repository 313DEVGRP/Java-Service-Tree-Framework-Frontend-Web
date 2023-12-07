////////////////////////////////////////////////////////////////////////////////////////
// 요구사항 상세보기 페이지 Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디
var calledAPIs = {};
var totalReqCommentCount;
/* 요구사항 전체목록 전역변수 */
var reqTreeList;
var visibilityStatus = {
	"#stats": false,
	"#detail": false,
	"#version": false,
	"#allreq": false,
	"#files": false,
	"#question": false
};

var prefix = "./img/winTypeFileIcons/";

function execDocReady() {
	var pluginGroups = [
		[
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js",
			"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css"
		],

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
			setSideMenu("sidebar_menu_product", "sidebar_menu_detail");

			setUrlParams();
			getDetailViewTab();
		})
		.catch(function (errorMessage) {
			console.error(errorMessage);
			console.error("플러그인 로드 중 오류 발생");
		});
}

// ------------------ api 호출 여부 확인(여러번 발생시키지 않기 위하여) ------------------ //
function callAPI(apiName) {
	if (calledAPIs[apiName]) {
		console.log("This API has already been called: " + apiName);
		return true;
	}

	return false;
}

function setUrlParams() {
	urlParams = new URL(location.href).searchParams;
	selectedPdService = urlParams.get("pdService");
	selectedPdServiceVersion = urlParams.get("pdServiceVersion");
	selectedJsTreeId = urlParams.get("reqAdd");
	selectedJiraServer = urlParams.get("jiraServer");
	selectedJiraProject = urlParams.get("jiraProject");
}

function getDetailViewTab() {
	if (callAPI("detailAPI")) {
		return;
	}

	console.log("Detail Tab ::::");
	var tableName = "T_ARMS_REQADD_";

	$(".spinner").html('<i class="fa fa-spinner fa-spin"></i> 데이터를 로드 중입니다...');
	$.ajax({
		url:
			"/auth-user/api/arms/reqAdd/" +
			tableName +
			"/getDetail.do" +
			"?jiraProject=" +
			selectedJiraProject +
			"&jiraServer=" +
			selectedJiraServer +
			"&pdService=" +
			selectedPdService +
			"&pdServiceVersion=" +
			selectedPdServiceVersion +
			"&reqAdd=" +
			selectedJsTreeId,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				//////////////////////////////////////////////////////////
				console.log(data);
				console.table(data);

				// ------------------ 상세보기 ------------------ //
				bindDataDetailTab(data);
				//////////////////////////////////////////////////////////
				jSuccess("요구사항 조회가 완료 되었습니다.");
				calledAPIs["detailAPI"] = true;
			}
		},
		beforeSend: function () {},
		complete: function () {},
		error: function (e) {
			jError("요구사항 조회 중 에러가 발생했습니다.");
		}
	});
}

function bindDataDetailTab(ajaxData) {
	console.log(ajaxData);
	//제품(서비스) 데이터 바인딩
	var selectedPdServiceText = ajaxData.pdService_c_title;

	if (isEmpty(selectedPdServiceText)) {
		$("#detailview_req_pdservice_name").val("");
	} else {
		$("#detailview_req_pdservice_name").val(selectedPdServiceText);
	}

	$("#detailview_req_id").val(selectedJsTreeId);
	$("#detailview_req_name").val(ajaxData.reqAdd_c_title);

	//Version 데이터 바인딩
	if (isEmpty(ajaxData.pdServiceVersion_c_title)) {
		$("#detailview_req_pdservice_version").val("요구사항에 등록된 버전이 없습니다.");
	} else {
		$("#detailview_req_pdservice_version").val(ajaxData.pdServiceVersion_c_title);
	}

	$("#detailview_req_writer").val(ajaxData.reqAdd_c_req_writer);
	$("#detailview_req_write_date").val(new Date(ajaxData.reqAdd_c_req_create_date).toLocaleString());

	if (ajaxData.reqAdd_c_req_reviewer01 == null || ajaxData.reqAdd_c_req_reviewer01 == "none") {
		$("#detailview_req_reviewer01").val("리뷰어(연대책임자)가 존재하지 않습니다.");
	} else {
		$("#detailview_req_reviewer01").val(ajaxData.reqAdd_c_req_reviewer01);
	}
	if (ajaxData.reqAdd_c_req_reviewer02 == null || ajaxData.reqAdd_c_req_reviewer02 == "none") {
		$("#detailview_req_reviewer02").val("2번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer02").val(ajaxData.reqAdd_c_req_reviewer02);
	}
	if (ajaxData.reqAdd_c_req_reviewer03 == null || ajaxData.reqAdd_c_req_reviewer03 == "none") {
		$("#detailview_req_reviewer03").val("3번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer03").val(ajaxData.reqAdd_c_req_reviewer03);
	}
	if (ajaxData.reqAdd_c_req_reviewer04 == null || ajaxData.reqAdd_c_req_reviewer04 == "none") {
		$("#detailview_req_reviewer04").val("4번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer04").val(ajaxData.reqAdd_c_req_reviewer04);
	}
	if (ajaxData.reqAdd_c_req_reviewer05 == null || ajaxData.reqAdd_c_req_reviewer05 == "none") {
		$("#detailview_req_reviewer05").val("5번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer05").val(ajaxData.reqAdd_c_req_reviewer05);
	}

	$("#detailview_req_contents").html(ajaxData.reqAdd_c_req_contents);
	$("#req_detail_contents").html(ajaxData.reqAdd_c_req_contents);
}
