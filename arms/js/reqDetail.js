////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedJsTreeId; // 요구사항 아이디
var selectedJsTreeName; // 요구사항 이름

function execDocReady() {
	var pluginGroups = [
		[
			// Vendor JS Files
			"../reference/jquery-plugins/MyResume/assets/vendor/purecounter/purecounter_vanilla.js",
			"../reference/jquery-plugins/MyResume/assets/vendor/glightbox/js/glightbox.min.js",
			"../reference/jquery-plugins/MyResume/assets/vendor/swiper/swiper-bundle.min.js",
			// Template Main JS File
			"../reference/jquery-plugins/MyResume/assets/js/main.js"
		],

		[
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js",
			"../reference/light-blue/lib/vendor/jquery.ui.widget.js"
		],

		[
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js"
		],

		[
			// Template CSS File
			"../reference/jquery-plugins/MyResume/assets/vendor/boxicons/css/boxicons.css",
			"../reference/jquery-plugins/MyResume/assets/vendor/glightbox/css/glightbox.min.css",
			"../reference/jquery-plugins/MyResume/assets/vendor/swiper/swiper-bundle.min.css",
			// Template Main CSS File
			"../reference/jquery-plugins/MyResume/assets/css/style.css"
		]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			//위젯 헤더 처리 및 사이드 메뉴 처리
			$(".widget").widgster();
			setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_regist");
		})
		.catch(function (errorMessage) {
			console.error(errorMessage);
			console.error("플러그인 로드 중 오류 발생");
		});
}
