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
		],
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
		[
			// Chart
			"../reference/light-blue/lib/nvd3/lib/d3.v2.js",
			"../reference/light-blue/lib/nvd3/nv.d3.custom.js",
			"../reference/light-blue/lib/nvd3/src/utils.js",
			"../reference/light-blue/lib/nvd3/src/models/legend.js",
			"../reference/light-blue/lib/nvd3/src/models/pie.js",
			"./html/armsDetailExceptTemplate/assets/js/pieChartTotal.js",
			"../reference/light-blue/lib/nvd3/stream_layers.js",
			"./html/armsDetailExceptTemplate/assets/js/stats.js",
			"./html/armsDetailExceptTemplate/assets/vendor/bootstrap/js/bootstrap.min.js"
		]
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			setUrlParams();

			setSideMenu("sidebar_menu_product", "sidebar_menu_product_manage");

			bindStatsTab();
		})
		.catch(function (errorMessage) {
			console.error(errorMessage);
			console.error("플러그인 로드 중 오류 발생");
		});
}

function setPdServiceName(pdServiceName) {
	$(".pdServiceName").text(pdServiceName);
}

function setRequirementName(requirementName) {
	$(".requirementName").text(requirementName);
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

// ------------------ 통계정보 ------------------ //
function bindStatsTab() {
	if (callAPI("statsAPI")) {
		return;
	}

	console.log("Stats Tab ::::");

	// api 호출 및 데이터 바인딩
	$(".spinner").html('<i class="fa fa-spinner fa-spin"></i> 데이터를 로드 중입니다...');
	$.ajax({
		url:
			"/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" +
			selectedPdService +
			"/getPdReqStats.do" +
			"?assigneeEmail=" +
			userEmail,
		type: "GET",
		async: false,
		statusCode: {
			200: function (json) {
				console.log("::제품 요구사항 통계::");
				console.log(json);

				$("#product-all-req").text(json.allReq);
				$("#product-my-req").text(json.myReq + " 개");
				$("#product-my-req-display").css("width", ((json.myReq / json.allReq) * 100).toFixed(2) + "%");

				var excludeKey = ["allReq", "myReq"];
				var newJson = Object.assign({}, json);
				for (var key in excludeKey) {
					delete newJson[excludeKey[key]];
				}

				console.log("newJson: " + JSON.stringify(newJson));
				loadChart("#product-chart-pie svg", "#product-chart-footer", newJson);

				jSuccess("통계 정보 조회가 완료 되었습니다.");
			}
		},
		beforeSend: function () {},
		complete: function () {},
		error: function (e) {
			jError("통계 자료를 불러오는 중 에러가 발생했습니다.");
		}
	});

	$.ajax({
		url:
			"/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" +
			selectedPdService +
			"/getPdRelatedReqStats.do" +
			"?assigneeEmail=" +
			userEmail,
		type: "GET",
		data: {
			c_jira_server_link: selectedJiraServer,
			c_req_link: selectedReq
		},
		async: false,
		statusCode: {
			200: function (json) {
				console.log("::해당 요구사항 통계::");
				console.log(json);

				$("#req-all-req").text(json.allReq);
				$("#req-my-req").text(json.myReq + " 개");
				$("#req-my-req-display").css("width", ((json.myReq / json.allReq) * 100).toFixed(2) + "%");

				var excludeKey = ["allReq", "myReq"];
				var newJson = Object.assign({}, json);
				for (var key in excludeKey) {
					delete newJson[excludeKey[key]];
				}
				console.log("newJson: " + JSON.stringify(newJson));
				loadChart("#requirement-chart-pie svg", "#requirement-chart-footer", newJson);

				jSuccess("통계 정보 조회가 완료 되었습니다.");
			}
		},
		beforeSend: function () {},
		complete: function () {},
		error: function (e) {
			jError("통계 자료를 불러오는 중 에러가 발생했습니다.");
		}
	});

	calledAPIs["statsAPI"] = true;
}
