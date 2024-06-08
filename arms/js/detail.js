////////////////////////////////////////////////////////////////////////////////////////
// 요구사항 상세보기 페이지 Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디

function execDocReady() {
	var pluginGroups = [
		[
			"../reference/lightblue4/docs/lib/widgster/widgster.js",
			"../reference/light-blue/lib/vendor/jquery.ui.widget.js"
		],
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
		[ "css/jiraServerCustom.css"]
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			setUrlParams();
			$(".widget").widgster();
			setSideMenu("sidebar_menu_product", "sidebar_menu_detail");
			getDetailViewTab();

			// --- 에디터 설정 --- //
			var waitCKEDITOR = setInterval(function () {
				try {
					if (window.CKEDITOR) {
						if (window.CKEDITOR.status === "loaded") {
							CKEDITOR.replace("detailview_req_contents", { skin: "office2013" });
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);
		})
		.catch(function (errorMessage) {
			console.error(errorMessage);
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

function getDetailViewTab() {

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
	let contents = ajaxData.reqAdd_c_req_contents;

	if (isEmpty(selectedPdServiceText)) {
		$("#detailview_req_pdservice_name").val("");
	} else {
		$("#detailview_req_pdservice_name").val(selectedPdServiceText);
	}

	$("#detailview_req_id").val(selectedJsTreeId);
	$("#detailview_req_name").val(ajaxData.reqAdd_c_title);

//radio 버튼 - 선택 초기화
	$("#detailview_req_priority label").removeClass("active");
	$("#detailview_req_difficulty label").removeClass("active");
	$("#detailview_req_state label").removeClass("active");
	//radio 버튼 - 상태 초기화
	$("input[name='detailview_req_priority_options']:checked").prop("checked", false);
	$("input[name='detailview_req_difficulty_options']:checked").prop("checked", false);
	$("input[name='detailview_req_state_options']:checked").prop("checked", false);

	//상세보기 - 우선순위 버튼
	let priorityRadioButtons = $("#detailview_req_priority input[type='radio']");
	priorityRadioButtons.each(function () {
		if ( $(this).val() == ajaxData.reqAdd_c_req_priority_link) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});
	//상세보기 - 난이도 버튼
	let difficultRadioButtons = $("#detailview_req_difficulty input[type='radio']");
	difficultRadioButtons.each(function () {
		if ($(this).val() == ajaxData.reqAdd_c_req_difficulty_link) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});
	//상세보기 - 상태 버튼
	let stateRadioButtons = $("#detailview_req_state input[type='radio']");
	stateRadioButtons.each(function () {
		if ($(this).val() == ajaxData.reqAdd_c_req_state_link) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});

	if (ajaxData.reqAdd_c_req_start_date) {
		$("#detailview_req_start_date").val(formatDate(new Date(ajaxData.reqAdd_c_req_start_date)));
	}
	if (ajaxData.reqAdd_c_req_end_date) {
		$("#detailview_req_end_date").val(formatDate(new Date(ajaxData.reqAdd_c_req_end_date)));
	}

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

	CKEDITOR.instances.detailview_req_contents.setData(contents);
	CKEDITOR.instances.detailview_req_contents.setReadOnly(true);

}
function formatDate(date) {
	var year = date.getFullYear().toString(); // 연도의 마지막 두 자리를 얻습니다.
	var month = (date.getMonth() + 1).toString().padStart(2, "0");
	var day = date.getDate().toString().padStart(2, "0");
	return year + "-" + month + "-" + day;
}