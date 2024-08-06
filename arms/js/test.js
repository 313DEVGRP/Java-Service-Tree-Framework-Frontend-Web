////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {

	var pluginGroups = [
		[

		]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function() {

			console.log('모든 플러그인 로드 완료');

			//사이드 메뉴 처리
			$('.widget').widgster();
			//setSideMenu("sidebar_menu_product", "sidebar_menu_version_manage");

			// 스크립트 실행 로직을 이곳에 추가합니다.


		})
		.catch(function() {
			console.error('플러그인 로드 중 오류 발생');
		});
}