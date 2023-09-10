////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////

function execDocReady() {

	var pluginGroups = [
		[	"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/lightblue4/docs/lib/d3/d3.min.js",
			"../reference/lightblue4/docs/lib/nvd3/build/nv.d3.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"]
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function() {

			console.log('모든 플러그인 로드 완료');
			//사이드 메뉴 처리
			$('.widget').widgster();
			setSideMenu("sidebar_menu_management", "sidebar_menu_management_devtools");

		})
		.catch(function() {
			console.error('플러그인 로드 중 오류 발생');
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
