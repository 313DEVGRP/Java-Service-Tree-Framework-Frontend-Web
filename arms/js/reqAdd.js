$(function () {
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_regist",
		"requirement-elements-collapse"
	);

	$(".chzn-select").each(function(){
		$(this).select2($(this).data());
	});

	//제품 서비스 셀렉트 박스
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

	$('.multiple-select').multipleSelect();

});

// --- 에디터 설정 --- //
//CKEDITOR.replace("editor");
//CKEDITOR.replace("modal-editor");

// --- 팝업 띄울때 사이즈 조정 -- //
$("#modalPopupId").click(function () {
	var height = $(document).height() - 400;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");
});

// --- jstree ( product ) 테이블 설정 --- //
function jsTreeClick(selectedNodeID) {
	console.log(selectedNodeID);
}

// --- select2 ( 제품(서비스) 검색 및 선택 ) --- //
$('#country').on('select2:select', function (e) {
	// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
	// 디폴트는 base version 을 선택하게 하고 ( select all )

	console.log("check -> " + $('#country').val());
	jsTreeBuild("#productTree", "reqAdd/T_ARMS_REQADD_" + $('#country').val());

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
$("#openall").click(function () {
	$('#productTree').jstree('open_all');
});