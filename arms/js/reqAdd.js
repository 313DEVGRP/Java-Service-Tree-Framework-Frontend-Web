let selectedJsTreeId; // 요구사항 아이디

$(function () {
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_regist",
		"requirement-elements-collapse"
	);

	$('#newReqDiv').hide();

	//제품 서비스 셀렉트 박스 이니시에이터
	$(".chzn-select").each(function(){
		$(this).select2($(this).data());
	});

	//버전 선택 셀렉트 박스 이니시에이터
	$('.multiple-select').multipleSelect();

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/pdservice/getPdServiceMonitor.do",
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType : "json",
		progress: true
	}).done(function(data) {

		for(var k in data){
			var obj = data[k];
			//var jira_name = obj.c_title;
			selectConnectID = obj.c_id;
			console.log(selectConnectID);
			var newOption = new Option(obj.c_title, obj.c_id, false, false);
			$('#country').append(newOption).trigger('change');
		}
	}).fail(function(e) {
		console.log("fail call");
	}).always(function() {
		console.log("always call");
	});

});

// --- 데이터 테이블 설정 --- //
function dataTableLoad(selectId) {
	// 데이터 테이블 컬럼 및 열그룹 구성
	var columnList = [
		{ data: "c_id" },
		{ data: "c_left" },
		{ data: "c_title" },
	];
	var rowsGroupList = [];
	var tableName = "T_ARMS_REQADD_" + $('#country').val();

	if(selectId == 2){
		dataTableBuild("#reqTable", "reqAdd/" + tableName, "/getMonitor.do", columnList, rowsGroupList);
	}else{
		dataTableBuild("#reqTable", "reqAdd/" + tableName, "/getChildNode.do?c_id="+selectId, columnList, rowsGroupList);
	}

	// ----- 데이터 테이블 빌드 이후 별도 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$("body").find("[aria-controls='pdserviceTable']").css("width", "100px");
	$("select[name=pdserviceTable_length]").css("width", "50px");
}
// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(selectedData) {
	console.log(selectedData);
}
///////////////////////////////////////////////////////////////////////////////

/** file upload **/
$(function () {
	'use strict';

	// Initialize the jQuery File Upload widget:
	var $fileupload = $('#fileupload');
	$fileupload.fileupload({
		// Uncomment the following to send cross-domain cookies:
		//xhrFields: {withCredentials: true},
		autoUpload: true,
		url: '/auth-user/api/arms/reqAdd/uploadFileToNode.do',
		dropZone: $('#dropzone')
	});

	// Enable iframe cross-domain access via redirect option:
	$fileupload.fileupload(
		'option',
		'redirect',
		window.location.href.replace(
			/\/[^\/]*$/,
			'/cors/result.html?%s'
		)
	);

	// Load existing files:
	$.ajax({
		// Uncomment the following to send cross-domain cookies:
		//xhrFields: {withCredentials: true},
		url: $fileupload.fileupload('option', 'url'),
		dataType: 'json',
		context: $fileupload[0]
	}).done(function (result) {
		$(this).fileupload('option', 'done').call(this, null, { result: result });
	});

});

$('#fileupload').bind('fileuploadsubmit', function (e, data) {
	// The example input, doesn't have to be part of the upload form:
	var input = $('#fileIdLink');
	var tableName = "T_ARMS_REQADD_" + $('#country').val();
	data.formData = { fileIdLink: input.val(), c_title: tableName };
	if (!data.formData.fileIdLink) {
		data.context.find('button').prop('disabled', false);
		input.focus();
		return false;
	}
});
///////////////////////////////////////////////////////////////////////////////

// --- 에디터 설정 --- //
//CKEDITOR.replace("editor");
CKEDITOR.replace("modalEditor");

// --- jstree ( 요구사항 ) 선택 이벤트 --- //
function jsTreeClick(selectedNodeID) {
	selectedJsTreeId = selectedNodeID.attr("id").replace("node_", "").replace("copy_", "");

	var selectRel = selectedNodeID.attr("rel");
	console.log("selectRel -===> " + selectRel);
	if(selectRel == "default"){
		$('#defaultTab').get(0).click();
		$('.widget-tabs ul li:nth-child(2)').hide();
		$('.widget-tabs ul li:nth-child(3)').hide();
		$('#newReqDiv').hide();
	}else{
		$('#folderTab').get(0).click();
		$('.widget-tabs ul li:nth-child(2)').show();
		$('.widget-tabs ul li:nth-child(3)').show();
		$('#newReqDiv').show();
		/////////////////////////////////////////   데이터 테이블 설정
		dataTableLoad(selectedJsTreeId);

	}


	var tableName = "T_ARMS_REQADD_" + $('#country').val();
	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedJsTreeId,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType : "json",
		progress: true
	}).done(function(data) {

		console.log(data);
		$('#detailView-req-pdService-name').text(data.c_pdService_Link);
		$('#detailView-req-pdService-version').text(data.c_version_Link);
		$('#detailView-req-id').text(data.c_id);
		$('#detailView-req-name').text(data.c_title);
		$('#detailView-req-status').text(data.c_req_status);
		$('#detailView-req-writer').text(data.c_writer_cn);
		$('#detailView-req-write-date').text(data.c_writer_date);
		if (data.c_reviewer01 == null || data.c_reviewer01 == "none") {
			$("#detailView-req-reviewer01").text("리뷰어(연대책임자)가 존재하지 않습니다.");
		} else {
			$("#detailView-req-reviewer01").text(data.c_reviewer01);
		}
		if (data.c_reviewer02 == null || data.c_reviewer02 == "none") {
		} else {
			$("#detailView-req-reviewer02").text(data.c_reviewer02);
		}

		if (data.c_reviewer03 == null || data.c_reviewer03 == "none") {
		} else {
			$("#detailView-req-reviewer03").text(data.c_reviewer03);
		}

		if (data.c_reviewer04 == null || data.c_reviewer04 == "none") {
		} else {
			$("#detailView-req-reviewer04").text(data.c_reviewer04);
		}

		if (data.c_reviewer05 == null || data.c_reviewer05 == "none") {
		} else {
			$("#detailView-req-reviewer05").text(data.c_reviewer05);
		}
		$("#detailView-req-contents").html(data.c_contents);


	}).fail(function(e) {
		console.log("fail call");
	}).always(function() {
		console.log("always call");
	});

	$('#fileIdLink').val(selectedJsTreeId);
	//jstree click 시 file 컨트롤
	//파일 리스트 초기화
	$("table tbody.files").empty();
	// Load existing files:
	var $fileupload = $('#fileupload');
	// Load existing files:
	$.ajax({
		// Uncomment the following to send cross-domain cookies:
		//xhrFields: {withCredentials: true},
		url: '/auth-user/api/arms/fileRepository/getFilesByNode.do',
		data: { fileIdLink: selectedJsTreeId, c_title: tableName },
		dataType: 'json',
		context: $fileupload[0]
	}).done(function (result) {
		$(this).fileupload('option', 'done').call(this, null, { result: result });
	});
}

// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
$('#country').on('select2:select', function (e) {
	// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
	// 디폴트는 base version 을 선택하게 하고 ( select all )

	console.log("check -> " + $('#country').val());
	jsTreeBuild("#productTree", "reqAdd/T_ARMS_REQADD_" + $('#country').val());

	//jstree 전부 펼치기
	setTimeout(function () {
		$('#productTree').jstree('open_all');
	}, 777);

	$(".multiple-select option").remove();
	$.ajax({
		url: "/auth-user/api/arms/pdversion/getVersion.do?c_id=" + $('#country').val(),
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType : "json",
		progress: true
	}).done(function(data) {

		for(var k in data){
			var obj = data[k];
			//var jira_name = obj.c_title;
			selectConnectID = obj.c_id;
			console.log("selectConnectID==" + selectConnectID);

			var $opt = $('<option />', {
				value: obj.c_id,
				text: obj.c_title,
			})

			$('.multiple-select').append($opt);
		}

		$('.multiple-select').multipleSelect('refresh');


	}).fail(function(e) {
		console.log("fail call");
	}).always(function() {
		console.log("always call");
	});
});

// 신규 제품(서비스) 등록 버튼
// --- 팝업 띄울때 사이즈 조정 -- //
$("#newReqRegist01").click(function () {
	registNewPopup();
});
$("#newReqRegist02").click(function () {
	registNewPopup();
});
$("#newReqRegist03").click(function () {
	registNewPopup();
});

function registNewPopup(){

	var height = $(document).height() - 700;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");

	//제품(서비스) 셋팅
	var selectPdService = $('#country').select2('data')[0].text;
	$('#disabled-input-pdservice').val(selectPdService);

	//version 셋팅
	var selectedVersion = $('#multiVersion').val();
	$('#popup-version').multipleSelect('setSelects', selectedVersion);

	//리뷰어 셋팅
	$.ajax({
		url: "/auth-user/api/arms/pdservice/getNode.do?c_id=" + $('#country').val(),
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType : "json",
		progress: true
	}).done(function(data) {

		////////////////////////////////////////////////////////////
		//var jira_name = obj.c_title;
		//selectConnectID = obj.c_id;
		console.log("c_reviewer01==" + data.c_reviewer01);
		console.log("c_reviewer02==" + data.c_reviewer02);
		console.log("c_reviewer03==" + data.c_reviewer03);
		console.log("c_reviewer04==" + data.c_reviewer04);
		console.log("c_reviewer05==" + data.c_reviewer05);

		//clear
		$('#popup-pdService-reviewers').val(null).trigger('change');

		var reviewer01Option = new Option(data.c_reviewer01, data.c_reviewer01, true, true);
		var reviewer02Option = new Option(data.c_reviewer02, data.c_reviewer02, true, true);
		var reviewer03Option = new Option(data.c_reviewer03, data.c_reviewer03, true, true);
		var reviewer04Option = new Option(data.c_reviewer04, data.c_reviewer04, true, true);
		var reviewer05Option = new Option(data.c_reviewer05, data.c_reviewer05, true, true);

		var multifyValue = 1;
		if (data.c_reviewer01 == null || data.c_reviewer01 == "none") {
			console.log("pdServiceDataTableClick :: json.c_reviewer01 empty");
		} else {
			multifyValue = multifyValue + 1;
			$('#popup-pdService-reviewers').append(reviewer01Option);
		}
		if (data.c_reviewer02 == null || data.c_reviewer02 == "none") {
			console.log("pdServiceDataTableClick :: json.c_reviewer02 empty");
		} else {
			multifyValue = multifyValue + 1;
			$('#popup-pdService-reviewers').append(reviewer02Option);
		}
		if (data.c_reviewer03 == null || data.c_reviewer03 == "none") {
			console.log("pdServiceDataTableClick :: json.c_reviewer03 empty");
		} else {
			multifyValue = multifyValue + 1;
			$('#popup-pdService-reviewers').append(reviewer03Option);
		}
		if (data.c_reviewer04 == null || data.c_reviewer04 == "none") {
			console.log("pdServiceDataTableClick :: json.c_reviewer04 empty");
		} else {
			multifyValue = multifyValue + 1;
			$('#popup-pdService-reviewers').append(reviewer04Option);
		}
		if (data.c_reviewer05 == null || data.c_reviewer05 == "none") {
			console.log("pdServiceDataTableClick :: json.c_reviewer05 empty");
		} else {
			multifyValue = multifyValue + 1;
			$('#popup-pdService-reviewers').append(reviewer05Option);
		}

		$('#popup-pdService-reviewers').trigger('change');

		$('#popup-pdService-reviewer').css('height', '20px');
		setTimeout(function () {
			var heightValue = $('#popup-pdService-reviewer').height();
			var resultValue = heightValue + (20 * multifyValue);
			$('#popup-pdService-reviewer').css('height', resultValue + 'px');
		}, 250);

		////////////////////////////////////////////////////////////////
	});

}

// --- select2 (사용자 자동완성 검색 ) 설정 --- //
$(".js-data-example-ajax").select2({
	maximumSelectionLength: 5,
	width: 'resolve',
	ajax: {
		url: function (params) {
			return '/auth-check/getUsers/' + params.term;
		},
		dataType: "json",
		delay: 250,
		//data: function (params) {
		//    return {
		//        q: params.term, // search term
		//        page: params.page,
		//    };
		//},
		processResults: function (data, params) {
			// parse the results into the format expected by Select2
			// since we are using custom formatting functions we do not need to
			// alter the remote JSON data, except to indicate that infinite
			// scrolling can be used
			params.page = params.page || 1;

			return {
				results: data,
				pagination: {
					more: params.page * 30 < data.total_count,
				},
			};
		},
		cache: true,
	},
	placeholder: "리뷰어 설정을 위한 계정명을 입력해 주세요",
	minimumInputLength: 1,
	templateResult: formatUser,
	templateSelection: formatUserSelection,
});

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
	$container
		.find(".select2-result-jsonData__id")
		.text(jsonData.id);

	return $container;
}

// --- select2 (사용자 자동완성 검색 ) templateSelection 설정 --- //
function formatUserSelection(jsonData) {

	if (jsonData.id == '') {
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

// --- select2 (사용자 자동완성 검색 ) 선택하고 나면 선택된 데이터 공간을 벌리기위한 설정 --- //
$('#popup-pdService-reviewer').on('select2:select', function (e) {
	var heightValue = $('#popupw-pdService-reviewer').height();
	var resultValue = heightValue + 20;
	$('#popup-pdService-reviewer').css('height', resultValue + 'px');
});



// 팝업에서 제품(서비스) 변경 저장 버튼
$("#save-req").click(function () {
	var reviewers01 = "none";
	var reviewers02 = "none";
	var reviewers03 = "none";
	var reviewers04 = "none";
	var reviewers05 = "none";
	if ($('#popup-pdService-reviewers').select2('data')[0] != undefined) {
		reviewers01 = $('#popup-pdService-reviewers').select2('data')[0].text;
	}
	if ($('#popup-pdService-reviewers').select2('data')[1] != undefined) {
		reviewers02 = $('#popup-pdService-reviewers').select2('data')[1].text;
	}
	if ($('#popup-pdService-reviewers').select2('data')[2] != undefined) {
		reviewers03 = $('#popup-pdService-reviewers').select2('data')[2].text;
	}
	if ($('#popup-pdService-reviewers').select2('data')[3] != undefined) {
		reviewers04 = $('#popup-pdService-reviewers').select2('data')[3].text;
	}
	if ($('#popup-pdService-reviewers').select2('data')[4] != undefined) {
		reviewers05 = $('#popup-pdService-reviewers').select2('data')[4].text;
	}

	var tableName = "T_ARMS_REQADD_" + $('#country').val();

	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/addNode.do",
		type: "POST",
		data: {
			ref: selectedJsTreeId,
			c_title: $("#req-title").val(),
			c_type: "default",
			c_pdService_Link: $('#country').val(),
			c_version_Link: JSON.stringify($('#popup-version').val()),
			c_writer_name: "ldm",
			c_writer_cn: "spear79",
			c_writer_date: new Date(),
			c_priority: 2,
			c_reviewer01: reviewers01,
			c_reviewer02: reviewers02,
			c_reviewer03: reviewers03,
			c_reviewer04: reviewers04,
			c_reviewer05: reviewers05,
			c_req_status: "Draft",
			c_contents: CKEDITOR.instances["modalEditor"].getData(),
		},
		statusCode: {
			200: function () {
				jSuccess($("#popup-pdService-name").val() + "의 데이터가 변경되었습니다.");
			},
		},
	});
});