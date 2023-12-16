////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;
var dataTableRef;

var selectedIssue;    //선택한 이슈
var selectedIssueKey; //선택한 이슈 키

function execDocReady() {


	var pluginGroups = [ 
		[	"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
			"../reference/light-blue/lib/jquery.iframe-transport.js",
			"../reference/light-blue/lib/jquery.fileupload.js",
			"../reference/light-blue/lib/jquery.fileupload-fp.js",
			"../reference/light-blue/lib/jquery.fileupload-ui.js"],

		[	"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"],

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
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

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
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function() {

			//vfs_fonts 파일이 커서 defer 처리 함.
			setTimeout(function() {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 3000); // 2초 후에 실행됩니다.
			console.log('모든 플러그인 로드 완료');

			//사이드 메뉴 처리
			$('.widget').widgster();
			setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_status");

			//제품(서비스) 셀렉트 박스 이니시에이터
			makePdServiceSelectBox();
			//버전 멀티 셀렉트 박스 이니시에이터
			makeVersionMultiSelectBox();

			popup_size_setting();
			// 스크립트 실행 로직을 이곳에 추가합니다.

			$("#progress_status").slimScroll({
				height: "195px",
				railVisible: true,
				railColor: "#222",
				railOpacity: 0.3,
				wheelStep: 10,
				allowPageScroll: false,
				disableFadeOut: false
			});

			$("#assign_status").slimScroll({
				height: "195px",
				railVisible: true,
				railColor: "#222",
				railOpacity: 0.3,
				wheelStep: 10,
				allowPageScroll: false,
				disableFadeOut: false
			});

		})
		.catch(function() {
			console.error('플러그인 로드 중 오류 발생');
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
		// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
		// 디폴트는 base version 을 선택하게 하고 ( select all )
		//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
		bind_VersionData_By_PdService();

		var checked = $("#checkbox1").is(":checked");
		var endPointUrl = "";

		if (checked) {
			endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true";
		} else {
			endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false";
		}
		//이슈리스트 데이터테이블
		dataTableLoad($("#selected_pdService").val(), endPointUrl);
		//통계로드
		statisticsLoad($("#selected_pdService").val(), null);
		//진행상태 가져오기
		progressLoad($("#selected_pdService").val(), null);

		resourceLoad($("#selected_pdService").val(), null);

	});
} // end makePdServiceSelectBox()


function resourceLoad(pdservice_id, pdservice_version_id){

	$('#assign_status').empty(); // 모든 자식 요소 삭제

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/dashboard/jira-issue-assignee?pdServiceId=" + pdservice_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (apiResponse) {
				const data = apiResponse.response;

				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);

					var html_piece = 	"<div	class=\"controls form-group darkBack\"\n" +
						"		style=\"margin-bottom: 5px !important; padding-top: 5px !important;\">\n" +
						"<span>✡ " + key + " : <a id=\"alm_server_count\" style=\"font-weight: bold;\"> " + value + "</a> 개</span>\n" +
						"</div>";
					$('#assign_status').append(html_piece);
				}

			}
		}
	});
}

function progressLoad(pdservice_id, pdservice_version_id){

	$('#progress_status').empty(); // 모든 자식 요소 삭제

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + pdservice_id + "/getProgress.do?version=" + pdservice_version_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {

				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);

					var html_piece = 	"<div	class=\"controls form-group darkBack\"\n" +
										"		style=\"margin-bottom: 5px !important; padding-top: 5px !important;\">\n" +
										"<span>✡ " + key + " : <a id=\"alm_server_count\" style=\"font-weight: bold;\"> " + value + "</a> 개</span>\n" +
										"</div>";
					$('#progress_status').append(html_piece);
				}

			}
		}
	});
}

function statisticsLoad(pdservice_id, pdservice_version_id){

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + pdservice_id + "/getStatistics.do?version=" + pdservice_version_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {

				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);
				}

				$('#version_count').text(data["version"]);
				$('#req_count').text(data["req"]);
				$('#alm_server_count').text(data["jiraServer"]);
				$('#alm_project_count').text(data["jiraProject"]);
				$('#alm_issue_count').text(data["issue"]);
			}
		}
	});

}

////////////////////////////////////////////////////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makeVersionMultiSelectBox() {
	//버전 선택 셀렉트 박스 이니시에이터
	$(".multiple-select").multipleSelect({
		filter: true,
		onClose: function () {
			console.log("onOpen event fire!\n");

			var checked = $("#checkbox1").is(":checked");
			var endPointUrl = "";
			var versionTag = $(".multiple-select").val();

			if (checked) {
				endPointUrl =
					"/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true&versionTag=" + versionTag;
				dataTableLoad($("#selected_pdService").val(), endPointUrl);
			} else {
				endPointUrl =
					"/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false&versionTag=" + versionTag;
				dataTableLoad($("#selected_pdService").val(), endPointUrl);
			}
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
				for (var k in data.response) {
					var obj = data.response[k];
					var $opt = $("<option />", {
						value: obj.c_id,
						text: obj.c_title
					});
					$(".multiple-select").append($opt);
				}

				if (data.length > 0) {
					console.log("display 재설정.");
				}
				//$('#multiversion').multipleSelect('refresh');
				//$('#edit_multi_version').multipleSelect('refresh');
				$(".multiple-select").multipleSelect("refresh");
				//////////////////////////////////////////////////////////
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //
function dataTableLoad(selectId, endPointUrl) {
	var columnList = [
		{ name: "c_pdservice_link", title: "제품(서비스) 아이디", data: "c_pdservice_link", visible: false },
		{
			name: "c_pdservice_name",
			title: "제품(서비스)",
			data: "c_pdservice_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + getStrLimit(data, 25) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{ name: "c_pds_version_link", title: "제품(서비스) 버전 아이디", data: "c_pds_version_link", visible: false },
		{
			name: "c_pds_version_name",
			title: "제품(서비스) 버전",
			data: "c_pds_version_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{ name: "c_req_link", title: "요구사항 아이디", data: "c_req_link", visible: false },
		{ name: "c_issue_url", title: "요구사항 이슈 주소", data: "c_issue_url", visible: false },
		{
			name: "c_req_name",
			title: "요구사항",
			data: "c_req_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{ name: "c_jira_server_link", title: "지라 서버 아이디", data: "c_jira_server_link", visible: false },
		{ name: "c_jira_server_url", title: "지라 서버 주소", data: "c_jira_server_url", visible: false },
		{
			name: "c_jira_server_name",
			title: "JIRA 서버명",
			data: "c_jira_project_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{ name: "c_jira_project_link", title: "지라 프로젝트 아이디", data: "c_jira_project_link", visible: false },
		{ name: "c_jira_project_url", title: "지라 프로젝트 주소", data: "c_jira_project_url", visible: false },
		{
			name: "c_jira_project_name",
			title: "JIRA 프로젝트명",
			data: "c_jira_project_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_jira_project_key",
			title: "JIRA 프로젝트키",
			data: "c_jira_project_key",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_issue_key",
			title: "요구사항 이슈 키",
			data: "c_issue_key",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					var _render =
						'<div style=\'white-space: nowrap; color: #a4c6ff\'>' + data +
						'<button data-target="#my_modal2" data-toggle="modal" style="border:0; background:rgba(51,51,51,0.425); color:#fbeed5; vertical-align: middle" onclick="click_issue_key('
						+ '\'' + row.c_jira_server_link + '\','
						+ '\'' + row.c_issue_key + '\','
						+ '\'' + row.c_pds_version_link + '\')"><i class="fa fa-list-alt"></i></button>'+
						"</div>";
					return _render;
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{ name: "c_issue_priority_link", title: "요구사항 이슈 우선순위 아이디", data: "c_issue_priority_link", visible: false },
		{
			name: "c_issue_priority_name",
			title: "요구사항 이슈 우선순위",
			data: "c_issue_priority_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{ name: "c_issue_status_link", title: "요구사항 이슈 상태 아이디", data: "c_issue_status_link", visible: false },
		{
			name: "c_issue_status_name",
			title: "요구사항 이슈 상태",
			data: "c_issue_status_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_issue_reporter",
			title: "요구사항 이슈 보고자",
			data: "c_issue_reporter",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_issue_assignee",
			title: "요구사항 이슈 할당자",
			data: "c_issue_assignee",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_issue_create_date",
			title: "요구사항 이슈 생성일자",
			data: "c_issue_create_date",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_issue_update_date",
			title: "요구사항 이슈 최근 업데이트 일자",
			data: "c_issue_update_date",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];
	var rowsGroupList = [1,3,6];
	var columnDefList = [
		{
			orderable: false,
			className: "select-checkbox",
			targets: 0
		}
	];
	var orderList = [[1, "asc"]];
	var jquerySelector = "#reqstatustable";
	var ajaxUrl = "/auth-user/api/arms/reqStatus" + endPointUrl;
	var jsonRoot = "";
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
	var selectList = {};
	var isServerSide = false;

	reqStatusDataTable = dataTable_build(
		jquerySelector,
		ajaxUrl,
		jsonRoot,
		columnList,
		rowsGroupList,
		columnDefList,
		selectList,
		orderList,
		buttonList,
		isServerSide,
		700
	);
}
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
	selectedIssue = selectedData;
}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(settings, json) {
	console.log("check");
}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();
}

$("#checkbox1").click(function () {
	var checked = $("#checkbox1").is(":checked");
	var endPointUrl = "";
	var versionTag = $(".multiple-select").val();

	if (checked) {
		endPointUrl =
			"/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true&versionTag=" + versionTag;
		dataTableLoad($("#selected_pdService").val(), endPointUrl);
	} else {
		endPointUrl =
			"/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false&versionTag=" + versionTag;
		dataTableLoad($("#selected_pdService").val(), endPointUrl);
	}
});

$("#copychecker").on("click", function () {
	reqStatusDataTable.button(".buttons-copy").trigger();
});
$("#printchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-print").trigger();
});
$("#csvchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-csv").trigger();
});
$("#excelchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-excel").trigger();
});
$("#pdfchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-pdf").trigger();
});

function click_issue_key(c_jira_server_link, c_issue_key, c_pds_version_link) {
	selectedIssueKey = "";
	console.log("clicked_issue_name ==> " + name);
	if (name !== "" || name !== undefined) {
		selectedIssueKey = name;
	}

	var endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val()
		+ "/getIssueAndSubLinks.do?serverId=" + c_jira_server_link
		+ "&issueKey=" + c_issue_key
		+ "&versionId=" + c_pds_version_link;
	getLinkedIssueAndSubtask("not Use this parameter",endPointUrl); // 데이터테이블 그리기
}

function getLinkedIssueAndSubtask(notUse, endPointUrl) {
	var columnList = [
		{
			name: "issueID",
			title: "이슈아이디",
			data: "issueID",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "key",
			title: "요구사항 이슈 키",
			data: "key",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "summary",
			title: "요구사항",
			data: "summary",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "parentReqKey",
			title: "부모이슈 키",
			data: "parentReqKey",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "priority",
			title: "이슈 우선순위",
			data: "priority.priority_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "status.status_name",
			title: "이슈 상태",
			data: "status.status_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "reporter",
			title: "이슈 보고자",
			data: "reporter.reporter_accountId",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "assignee",
			title: "이슈 할당자",
			data: "assignee.assignee_accountId",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "created",
			title: "이슈 생성일자",
			data: "created",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "updated",
			title: "이슈 최근 업데이트 일자",
			data: "updated",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];

	var rowsGroupList = [];
	var columnDefList = [
		{
			orderable: false,
			className: "select-checkbox",
			targets: 0
		}
	];
	var orderList = [[1, "asc"]];
	var jquerySelector = "#linkedIssueAndSubtaskTable";
	var ajaxUrl = "/auth-user/api/arms/reqStatus" + endPointUrl;
	var jsonRoot = "";
	var buttonList = [];
	var selectList = {};
	var isServerSide = false;

	reqStatusDataTable = dataTable_build(
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

function popup_size_setting() {
	$("#modal_popup_id").click(function () {
		console.log("modal_popup_id clicked");
		var height = $(document).height() - 600;

		$("#my_modal2").on("hidden.bs.modal", function (e) {
			console.log("modal close");
			console.log($(this).find('form')[0]);
			$(this).find('form')[0].reset();
		});

		$(".modal-body")
			.find(".cke_contents:eq(0)")
			.css("height", height + "px");
	});
}