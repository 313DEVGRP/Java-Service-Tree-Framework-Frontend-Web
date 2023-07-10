////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////

function execDocReady() {

	// --- 에디터 설정 --- //
	window.CKEDITOR_BASEPATH = "/reference/jquery-plugins/ckeditor4-4.16.1/";
	$.when(
		//$.getStylesheet("test.css"),
		$.getScript( "../reference/jquery-plugins/ckeditor4-4.16.1/ckeditor.js" ),
		// $.getScript( "test.js" )
	).done(function(){
		//좌측 메뉴
		setSideMenu("sidebar_menu_dashboard", "");
	});

}
