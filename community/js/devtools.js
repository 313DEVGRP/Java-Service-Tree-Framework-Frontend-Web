////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////

function execDocReady() {

	$.when(
		$.getJavascript("../reference/light-blue/lib/vendor/jquery.ui.widget.js")
	).done(function() {

		//좌측 메뉴
		setSideMenu("sidebar_menu_dashboard", "");

	});

}

function middleProxy(){
	$.cookie('cookie', 'middle-proxy');
	location.href = '/swagger-ui/index.html';
}

function backendCore(){
	$.cookie('cookie', 'backend-core');
	location.href = '/swagger-ui.html';
}
