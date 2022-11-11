$(function () {
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_regist",
		"requirement-elements-collapse"
	);
	jsTreeBuild("#productTree", "pdservice");
});

// --- 에디터 설정 --- //
CKEDITOR.replace("editor");
CKEDITOR.replace("modal-editor");

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


// 신규 제품(서비스) 등록 버튼
$("#openall").click(function () {
	$('#productTree').jstree('open_all');
});