////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
let selectedJsTreeId; // 요구사항 아이디

$(function () {

	//좌측 메뉴
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_regist",
		"requirement-elements-collapse"
	);

	//신규 요구사항 등록 버튼 숨김
	$('#newReqDiv').hide();

	//제품(서비스) 셀렉트 박스 이니시에이터
	makePdServiceSelectBox();
	//버전 멀티 셀렉트 박스 이니시에이터
	makeVersionMultiSelectBox();

	// --- 에디터 설정 --- //
	CKEDITOR.replace("modalEditor");
	CKEDITOR.replace("editTabModalEditor");

});

////////////////////////////////////////////////////////////////////////////////////////
//제품 서비스 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makePdServiceSelectBox(){
	//제품 서비스 셀렉트 박스 이니시에이터
	$(".chzn-select").each(function(){
		$(this).select2($(this).data());
	});

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
			var newOption = new Option(obj.c_title, obj.c_id, false, false);
			$('#country').append(newOption).trigger('change');
		}
	}).fail(function(e) {
	}).always(function() {
	});
} // end makePdServiceSelectBox()

// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
$('#country').on('select2:select', function (e) {
	// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
	// 디폴트는 base version 을 선택하게 하고 ( select all )

	//~> 이벤트 연계 함수 :: 요구사항 표시 jsTree 빌드
	build_ReqData_By_PdService();

	//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
	bind_VersionData_By_PdService();
});

////////////////////////////////////////////////////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makeVersionMultiSelectBox(){
	//버전 선택 셀렉트 박스 이니시에이터
	$('.multiple-select').multipleSelect();
}

function bind_VersionData_By_PdService(){
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
			var $opt = $('<option />', {
				value: obj.c_id,
				text: obj.c_title,
			})

			//$('#multiVersion').append($opt);
			//$('#editMultiVersion').append($opt);
			$('.multiple-select').append($opt);
		}

		if(data.length > 0){
			console.log("display 재설정.");
		}
		//$('#multiVersion').multipleSelect('refresh');
		//$('#editMultiVersion').multipleSelect('refresh');
		$('.multiple-select').multipleSelect('refresh');

	}).fail(function(e) {
	}).always(function() {
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//요구사항 :: jsTree
////////////////////////////////////////////////////////////////////////////////////////
function build_ReqData_By_PdService(){
	jsTreeBuild("#productTree", "reqAdd/T_ARMS_REQADD_" + $('#country').val());
}

// --- 요구사항 (jstree) 선택 이벤트 --- //
function jsTreeClick(selectedNodeID) {
	selectedJsTreeId = selectedNodeID.attr("id").replace("node_", "").replace("copy_", "");
	var selectRel = selectedNodeID.attr("rel");
	
	//요구사항 타입에 따라서 탭의 설정을 변경
	if(selectRel == "default"){
		$('#defaultTab').get(0).click();
		$('#newReqDiv').hide();
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(1)').show(); //상세보기
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(2)').show(); //편집하기
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(3)').hide(); //리스트보기
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(4)').hide(); //문서로보기
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(5)').show(); //JIRA연결설정

		//상세보기 탭 셋팅
		setDetailViewTab();

	}else{
		$('#folderTab').get(0).click();
		$('#newReqDiv').show();
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(1)').show(); //상세보기
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(2)').show(); //편집하기
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(3)').show(); //리스트보기
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(4)').show(); //문서로보기
		$('.widget-tabs').children('header').children('ul').children('li:nth-child(5)').hide(); //JIRA연결설정

		// 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
		// 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
		dataTableLoad(selectedJsTreeId);

	}

	//파일 데이터셋팅
	get_FileList_By_Req();
}

////////////////////////////////////////////////////////////////////////////////////////
//리스트 :: DataTable
////////////////////////////////////////////////////////////////////////////////////////
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

	var dataTableRef;
	if(selectId == 2){
		dataTableRef = dataTableBuild("#reqTable", "reqAdd/" + tableName, "/getMonitor.do", columnList, rowsGroupList);
	}else{

		//select node 정보를 가져온다.
		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectId,
			type: "GET",
			contentType: "application/json;charset=UTF-8",
			dataType : "json",
			progress: true,
			success: function(data) {
				var paramUrl = "c_id=313&c_left=" + data.c_left + "&c_right=" + data.c_right;
				dataTableRef = dataTableBuild("#reqTable", "reqAdd/" + tableName, "/getChildNodeWithParent.do?"+paramUrl, columnList, rowsGroupList);

			}
		}).done(function(data) {


		}).fail(function(e) {

		}).always(function() {

		});

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

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(){
	setDocViewTab();
	//상세보기 탭 셋팅
	setDetailViewTab();
}
////////////////////////////////////////////////////////////////////////////////////////
//파일 관리 : fileupload
////////////////////////////////////////////////////////////////////////////////////////
/** file upload 이니시에이터 **/
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

function get_FileList_By_Req() {
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
		data: { fileIdLink: selectedJsTreeId, c_title: "T_ARMS_REQADD_" + $('#country').val() },
		dataType: 'json',
		context: $fileupload[0]
	}).done(function (result) {
		$(this).fileupload('option', 'done').call(this, null, { result: result });
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//상세 보기 탭 & 편집 탭
////////////////////////////////////////////////////////////////////////////////////////
function setDetailViewTab(){
	var tableName = "T_ARMS_REQADD_" + $('#country').val();
	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedJsTreeId,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType : "json",
		progress: true
	}).done(function(data) {

		// ------------------ 편집하기 ------------------ //
		bindDataEditlTab(data);
		// ------------------ 상세보기 ------------------ //
		bindDataDetailTab(data);

	}).fail(function(e) {
	}).always(function() {
	});
}

// ------------------ 편집하기 ------------------ //
function bindDataEditlTab(ajaxData){

	//제품(서비스) 데이터 바인딩
	var selectedPdServiceText = $('#country').select2('data')[0].text;
	if(isEmpty(selectedPdServiceText)){
		$('#editView-req-pdService-name').val("");
	}else{
		$('#editView-req-pdService-name').val(selectedPdServiceText);
	}

	// 버전 데이터 바인딩
	if(!isEmpty(ajaxData.c_version_Link)) {
		$('#editMultiVersion').multipleSelect('setSelects', ajaxData.c_version_Link.split(","));
	}else{
		$('#editMultiVersion').multipleSelect('uncheckAll')
	}

	$('#editView-req-id').val(ajaxData.c_id);
	$('#editView-req-name').val(ajaxData.c_title);

	$('#editView-req-priority').children('.btn.active').removeClass("active");
	var slectReqPriorityID = "editView-req-priority-option" + ajaxData.c_priority;
	$('#'+slectReqPriorityID).parent().addClass("active");

	// ------------------------- reviewer --------------------------------//
	//clear
	$('#editView-req-reviewers').val(null).trigger('change');

	var reviewer01Option = new Option(ajaxData.c_reviewer01, ajaxData.c_reviewer01, true, true);
	var reviewer02Option = new Option(ajaxData.c_reviewer02, ajaxData.c_reviewer02, true, true);
	var reviewer03Option = new Option(ajaxData.c_reviewer03, ajaxData.c_reviewer03, true, true);
	var reviewer04Option = new Option(ajaxData.c_reviewer04, ajaxData.c_reviewer04, true, true);
	var reviewer05Option = new Option(ajaxData.c_reviewer05, ajaxData.c_reviewer05, true, true);

	var multifyValue = 1;
	if (ajaxData.c_reviewer01 == null || ajaxData.c_reviewer01 == "none") {
		console.log("bindDataEditlTab :: ajaxData.c_reviewer01 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#editView-req-reviewers').append(reviewer01Option);
	}
	if (ajaxData.c_reviewer02 == null || ajaxData.c_reviewer02 == "none") {
		console.log("bindDataEditlTab :: ajaxData.c_reviewer02 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#editView-req-reviewers').append(reviewer02Option);
	}
	if (ajaxData.c_reviewer03 == null || ajaxData.c_reviewer03 == "none") {
		console.log("bindDataEditlTab :: ajaxData.c_reviewer03 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#editView-req-reviewers').append(reviewer03Option);
	}
	if (ajaxData.c_reviewer04 == null || ajaxData.c_reviewer04 == "none") {
		console.log("bindDataEditlTab :: ajaxData.c_reviewer04 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#editView-req-reviewers').append(reviewer04Option);
	}
	if (ajaxData.c_reviewer05 == null || ajaxData.c_reviewer05 == "none") {
		console.log("bindDataEditlTab :: json.c_reviewer05 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#editView-req-reviewers').append(reviewer05Option);
	}

	$('#editView-req-reviewers').trigger('change');

	// ------------------------- reviewer --------------------------------//
	$('#editView-req-status').val(ajaxData.c_req_status);
	$('#editView-req-writer').val(ajaxData.c_writer_cn);
	$('#editView-req-write-date').val(ajaxData.c_writer_date);
	CKEDITOR.instances.editTabModalEditor.setData(ajaxData.c_contents);
}

// ------------------ 상세보기 ------------------ //
function bindDataDetailTab(ajaxData){

	//제품(서비스) 데이터 바인딩
	var selectedPdServiceText = $('#country').select2('data')[0].text;
	if(isEmpty(selectedPdServiceText)){
		$('#detailView-req-pdService-name').text("");
	}else{
		$('#detailView-req-pdService-name').text(selectedPdServiceText);
	}

	//Version 데이터 바인딩
	var selectedVersionText = $('#editMultiVersion').multipleSelect('getSelects', 'text');
	if ( isEmpty(selectedVersionText)){
		$('#detailView-req-pdService-version').text("요구사항에 등록된 버전이 없습니다.");
	}else {
		$('#detailView-req-pdService-version').text(selectedVersionText);
	}
	$('#detailView-req-id').text(ajaxData.c_id);
	$('#detailView-req-name').text(ajaxData.c_title);

	//우선순위 셋팅
	$('#detailView-req-priority').children('.btn.active').removeClass("active");
	var slectReqPriorityID = "detailView-req-priority-option" + ajaxData.c_priority;
	$('#'+slectReqPriorityID).parent().addClass("active");

	$('#detailView-req-status').text(ajaxData.c_req_status);
	$('#detailView-req-writer').text(ajaxData.c_writer_cn);
	$('#detailView-req-write-date').text(ajaxData.c_writer_date);

	if (ajaxData.c_reviewer01 == null || ajaxData.c_reviewer01 == "none") {
		$("#detailView-req-reviewer01").text("리뷰어(연대책임자)가 존재하지 않습니다.");
	} else {
		$("#detailView-req-reviewer01").text(ajaxData.c_reviewer01);
	}
	if (ajaxData.c_reviewer02 == null || ajaxData.c_reviewer02 == "none") {
		$("#detailView-req-reviewer02").text("");
	} else {
		$("#detailView-req-reviewer02").text(ajaxData.c_reviewer02);
	}
	if (ajaxData.c_reviewer03 == null || ajaxData.c_reviewer03 == "none") {
		$("#detailView-req-reviewer03").text("");
	} else {
		$("#detailView-req-reviewer03").text(ajaxData.c_reviewer03);
	}
	if (ajaxData.c_reviewer04 == null || ajaxData.c_reviewer04 == "none") {
		$("#detailView-req-reviewer04").text("");
	} else {
		$("#detailView-req-reviewer04").text(ajaxData.c_reviewer04);
	}
	if (ajaxData.c_reviewer05 == null || ajaxData.c_reviewer05 == "none") {
		$("#detailView-req-reviewer05").text("");
	} else {
		$("#detailView-req-reviewer05").text(ajaxData.c_reviewer05);
	}
	$("#detailView-req-contents").html(ajaxData.c_contents);
}


///////////////////////////////////////////////////////////////////////////////
//문서로 보기 탭
///////////////////////////////////////////////////////////////////////////////
function setDocViewTab(){
	$('.dd-list').empty();
	var data = $('#reqTable').DataTable().rows().data().toArray();
	$.each( data, function( key, value ) {

		if(value.c_contents == null || value.c_contents == "null"){
			value.c_contents = "";
		}

		console.log(value.c_id + "=" + value.c_type + "=" + value.c_title + "//" + value.c_parentid);

		var iconHtml;
		if(value.c_type == "root" || value.c_type == "drive"){
			iconHtml = "<i class='fa fa-clipboard'></i>";
		}else if(value.c_type == "folder"){
			iconHtml = "<i class='fa fa-files-o'></i>";
		}else {
			iconHtml = "<i class='fa fa-file-text-o'></i>";
		}

		if(value.c_type == "root"){
			console.log("ROOT 노드는 처리하지 않습니다.");
		}else if(value.c_type == "drive"){
			$('.dd-list').append("<li class='dd-item' id='" + "T_ARMS_REQ_" + value.c_id + "' data-id='" + value.c_id + "'>" +
				"<div class='dd-handle'>" +
				iconHtml +
				" " + value.c_title +
				"<p>" + value.c_contents + "</p>" +
				"</div>" +
				"</li>");
		}else {
			$('#T_ARMS_REQ_'+value.c_parentid).append("<ol class='dd-list'>" +
				"<li class='dd-item' id='" + "T_ARMS_REQ_" + value.c_id +"' data-id='" + value.c_id + "'>" +
				"<div class='dd-handle'>" +
				iconHtml +
				" " + value.c_title +
				"<p>" + value.c_contents + "</p>" +
				"</div>" +
				"</li>" +
				"</ol>");
		}

	});
	//console.log(data);
}

///////////////////////////////////////////////////////////////////////////////
// --- select2 (사용자 자동완성 검색 ) 설정 --- //
///////////////////////////////////////////////////////////////////////////////
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
$('#editView-req-reviewers').on('select2:select', function (e) {
	console.log("select2:select");
});


///////////////////////////////////////////////////////////////////////////////
// 신규 요구사항 팝업 데이터 셋팅
///////////////////////////////////////////////////////////////////////////////
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

	});

}

///////////////////////////////////////////////////////////////////////////////
// 팝업에서 신규 요구사항 저장 버튼
///////////////////////////////////////////////////////////////////////////////
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
				$('#productTree').jstree('refresh');
				$('#close-req').trigger('click');
				jSuccess($("#popup-pdService-name").val() + "의 데이터가 변경되었습니다.");
			},
		},
	});
});



///////////////////////////////////////////////////////////////////////////////
// 요구사항 편집 탭 저장 버튼
///////////////////////////////////////////////////////////////////////////////
$("#editTab_Req_Update").click(function () {

	var tableName = "T_ARMS_REQADD_" + $('#country').val();
	var reqName = $('#editView-req-name').val();

	var reviewers01 = "none";
	var reviewers02 = "none";
	var reviewers03 = "none";
	var reviewers04 = "none";
	var reviewers05 = "none";
	if ($('#editView-req-reviewers').select2('data')[0] != undefined) {
		reviewers01 = $('#editView-req-reviewers').select2('data')[0].text;
	}
	if ($('#editView-req-reviewers').select2('data')[1] != undefined) {
		reviewers02 = $('#editView-req-reviewers').select2('data')[1].text;
	}
	if ($('#editView-req-reviewers').select2('data')[2] != undefined) {
		reviewers03 = $('#editView-req-reviewers').select2('data')[2].text;
	}
	if ($('#editView-req-reviewers').select2('data')[3] != undefined) {
		reviewers04 = $('#editView-req-reviewers').select2('data')[3].text;
	}
	if ($('#editView-req-reviewers').select2('data')[4] != undefined) {
		reviewers05 = $('#editView-req-reviewers').select2('data')[4].text;
	}

	//우선 순위 값 셋팅
	var priorityValue = $('#editView-req-priority').children('.btn.active').children('input').attr('id');
	priorityValue = priorityValue.replace("editView-req-priority-option","");

	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/updateNode.do",
		type: "POST",
		data: {
			c_id: $('#editView-req-id').val(),
			c_title: $('#editView-req-name').val(),
			c_version_Link: JSON.stringify($('#editMultiVersion').val()),
			c_writer_date: new Date(),
			c_priority: priorityValue,
			c_reviewer01: reviewers01,
			c_reviewer02: reviewers02,
			c_reviewer03: reviewers03,
			c_reviewer04: reviewers04,
			c_reviewer05: reviewers05,
			c_req_status: "ChangeReq",
			c_contents: CKEDITOR.instances["editTabModalEditor"].getData(),
		},
		statusCode: {
			200: function () {
				$('#productTree').jstree('refresh');
				jSuccess(reqName + "의 데이터가 변경되었습니다.");
			},
		},
	});
});