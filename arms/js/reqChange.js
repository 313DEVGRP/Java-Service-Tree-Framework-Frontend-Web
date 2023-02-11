////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {

	//메뉴 색상 처리.
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_change",
		"requirement-elements-collapse"
	);

	//제품(서비스) 셀렉트 박스 이니시에이터
	makePdServiceSelectBox();
	//버전 멀티 셀렉트 박스 이니시에이터
	makeVersionMultiSelectBox();

	// --- 에디터 설정 --- //
	CKEDITOR.replace("editor");
	CKEDITOR.replace("modal_editor");

// --- 팝업 띄울때 사이즈 조정 -- //
	$("#modal_popup_id").click(function () {
		var height = $(document).height() - 400;
		$(".modal-body")
			.find(".cke_contents:eq(0)")
			.css("height", height + "px");
	});

} //end $(function()

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
		console.log("fail call");
	}).always(function() {
		console.log("always call");
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
}
////////////////////////////////////////////////////////////////////////////////////////
//요구사항 :: jsTree
////////////////////////////////////////////////////////////////////////////////////////
// --- jstree ( product ) 테이블 설정 --- //
function jsTreeClick(selectedNodeID) {
	console.log(selectedNodeID);
}

function build_ReqData_By_PdService(){
	jsTreeBuild("#productTree", "reqAdd/T_ARMS_REQADD_" + $('#country').val());
}
