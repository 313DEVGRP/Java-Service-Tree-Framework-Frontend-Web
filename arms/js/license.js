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
            $('.widget').widgster();
            //좌측 메뉴
            setSideMenu("sidebar_menu_management", "sidebar_menu_management_license");
            // 스크립트 실행 로직을 이곳에 추가합니다.

        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}
