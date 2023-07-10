////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;
var dataTableRef;

function execDocReady() {

	$.when(
		$.getJavascript("../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js"),

		$.getJavascript("../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js"),

		$.getJavascript("../reference/light-blue/lib/bootstrap-datepicker.js"),
		$.getStylesheet("../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css"),
		$.getJavascript("../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js"),

		$.getStylesheet("../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css"),
		$.getJavascript("../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js"),
		$.getStylesheet("../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css"),
		$.getJavascript("../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js"),
		$.getJavascript("../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js"),
		$.getStylesheet("../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css"),
		$.getJavascript("../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"),

		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css"),
		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css"),
		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js")

	).done(function() {

		//좌측 메뉴
		setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_status");

		//제품(서비스) 셀렉트 박스 이니시에이터
		makePdServiceSelectBox();
		//버전 멀티 셀렉트 박스 이니시에이터
		makeVersionMultiSelectBox();
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
		progress: true
	})
		.done(function (data) {
			for (var k in data) {
				var obj = data[k];
				if ( isEmpty(obj)){
					console.log("obj is null");
				}else{
					var newOption = new Option(obj.c_title, obj.c_id, false, false);
					$("#country").append(newOption).trigger("change");
				}
			}
		})
		.fail(function (e) {})
		.always(function () {});
} // end makePdServiceSelectBox()

$("#country").on("select2:open", function () {
	//슬림스크롤
	makeSlimScroll(".select2-results__options");
});

// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
$("#country").on("select2:select", function (e) {
	// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
	// 디폴트는 base version 을 선택하게 하고 ( select all )
	//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
	bind_VersionData_By_PdService();

	var checked = $("#checkbox1").is(":checked");
	var endPointUrl = "";

	if (checked) {
		endPointUrl = "/T_ARMS_REQSTATUS_" + $("#country").val() + "/getStatusMonitor.do?disable=true";
	} else {
		endPointUrl = "/T_ARMS_REQSTATUS_" + $("#country").val() + "/getStatusMonitor.do?disable=false";
	}
	common_dataTableLoad($("#country").val(), endPointUrl);
});

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
					"/T_ARMS_REQSTATUS_" + $("#country").val() + "/getStatusMonitor.do?disable=true&versionTag=" + versionTag;
				common_dataTableLoad($("#country").val(), endPointUrl);
			} else {
				endPointUrl =
					"/T_ARMS_REQSTATUS_" + $("#country").val() + "/getStatusMonitor.do?disable=false&versionTag=" + versionTag;
				common_dataTableLoad($("#country").val(), endPointUrl);
			}
		}
	});
}

function bind_VersionData_By_PdService() {
	$(".multiple-select option").remove();
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/getVersionList.do?c_id=" + $("#country").val(),
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				//////////////////////////////////////////////////////////
				for (var k in data) {
					var obj = data[k];
					var $opt = $("<option />", {
						value: obj.c_id,
						text: " " + obj.c_title
					});

					//$('#multiversion').append($opt);
					//$('#edit_multi_version').append($opt);
					$(".multiple-select").append($opt);
				}

				if (data.length > 0) {
					console.log("display 재설정.");
				}
				//$('#multiversion').multipleSelect('refresh');
				//$('#edit_multi_version').multipleSelect('refresh');
				$(".multiple-select").multipleSelect("refresh");
				//////////////////////////////////////////////////////////
				jSuccess("버전 조회가 완료 되었습니다.");
			}
		},
		beforeSend: function () {
			//$("#regist_pdservice").hide(); 버튼 감추기
		},
		complete: function () {
			//$("#regist_pdservice").show(); 버튼 보이기
		},
		error: function (e) {
			jError("버전 조회 중 에러가 발생했습니다.");
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //
function common_dataTableLoad(selectId, endPointUrl) {
	var columnList = [
		{ name: "c_pdservice_link", title: "제품(서비스) 아이디", data: "c_pdservice_link", visible: false },
		{ name: "c_pdservice_name", title: "제품(서비스)", data: "c_pdservice_name", visible: true },
		{ name: "c_version_link", title: "제품(서비스) 버전 아이디", data: "c_version_link", visible: false },
		{ name: "c_version_name", title: "Version", data: "c_version_name", visible: true },
		{ name: "c_jira_project_link", title: "지라 프로젝트 아이디", data: "c_jira_project_link", visible: false },
		{
			name: "c_jira_project_name",
			title: "JIRA Project",
			data: "c_jira_project_name",
			render: function (data, type, row, meta) {
				if (type === "display") {
					var link = "http://www.313.co.kr/jira/browse/";
					return '<a href="' + link + row.c_jira_project_key + '" target="_blank">' + data + "</a>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{ name: "c_jira_version_link", title: "지라 프로젝트 버전 아이디", data: "c_jira_version_link", visible: false },
		{ name: "c_jira_version_name", title: "JIRA Version", data: "c_jira_version_name", visible: true },
		{
			name: "c_jira_version_name",
			title: "JIRA Version",
			data: "c_jira_version_name",
			render: function (data, type, row, meta) {
				if (type === "display") {
					if (isEmpty(data)) {
						return "";
					} else {
						return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
					}
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{ name: "c_req_link", title: "요구사항 아이디", data: "c_req_link", visible: false },
		{
			name: "c_req_name",
			title: "요구사항",
			data: "c_req_name",
			render: function (data, type, row, meta) {
				if (type === "display") {
					if (isEmpty(data)) {
						return "";
					} else {
						return '<div style="white-space: nowrap;">' + data + "</div>";
					}
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_jira_req_issue_key",
			title: "JIRA 이슈",
			data: "c_jira_req_issue_key",
			render: function (data, type, row, meta) {
				if (type === "display") {
					if (isEmpty(data)) {
						return "";
					} else {
						var link = "http://www.313.co.kr/jira/browse/";
						return '<a href="' + link + row.c_jira_req_issue_key + '" target="_blank">' + data + "</a>";
					}
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_jira_req_issue_id",
			title: "SubTask",
			data: "c_jira_req_issue_id",
			render: function (data, type, row, meta) {
				if (type === "display") {
					if (isEmpty(data) || data == "[]") {
						return "no data";
					} else {
						return '<label id="new_reqregist01" class="btn btn-success btn-sm" data-target="#my_modal1" data-toggle="modal">SubTask</label>';
					}
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "c_jira_req_linkingissue",
			title: "LinkIssue",
			data: "c_jira_req_linkingissue",
			render: function (data, type, row, meta) {
				if (type === "display") {
					if (isEmpty(data) || data == "[]") {
						return "no data";
					} else {
						return '<label id="new_reqregist01" class="btn btn-success btn-sm" data-target="#my_modal1" data-toggle="modal">LinkIssue</label>';
					}
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];
	var rowsGroupList = ["c_pdservice_name:name", "c_version_name:name"];
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
		isServerSide
	);
}
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
	console.log(selectedData);
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
			"/T_ARMS_REQSTATUS_" + $("#country").val() + "/getStatusMonitor.do?disable=true&versionTag=" + versionTag;
		common_dataTableLoad($("#country").val(), endPointUrl);
	} else {
		endPointUrl =
			"/T_ARMS_REQSTATUS_" + $("#country").val() + "/getStatusMonitor.do?disable=false&versionTag=" + versionTag;
		common_dataTableLoad($("#country").val(), endPointUrl);
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
