////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////



// 절대로 armsDetailExceptTemplate 폴더안에 있는 파일 사용하지 마세요
// armsDetailExceptTemplate 폴더를 삭제할 예정입니다.



function execDocReady() {

    var pluginGroups = [
        [	"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js"]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function() {

            console.log('모든 플러그인 로드 완료');

            //좌측 메뉴
            $('.widget').widgster();
            setSideMenu("sidebar_menu_dashboard", "");
            // 스크립트 실행 로직을 이곳에 추가합니다.

        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}
