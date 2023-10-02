////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {
    var pluginGroups = [
        [
            // Vendor JS Files
            /*"../reference/jquery-plugins/MyResume/assets/vendor/purecounter/purecounter_vanilla.js",*/
            /*"../reference/jquery-plugins/MyResume/assets/vendor/glightbox/js/glightbox.min.js",*/
            /*"../reference/jquery-plugins/MyResume/assets/vendor/swiper/swiper-bundle.min.js",*/
            // Template Main JS File
            /*"../reference/jquery-plugins/MyResume/assets/js/main.js"*/
        ],

        [
            "../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js",
            "../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css"
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

        })
        .catch(function (errorMessage) {
            console.error(errorMessage);
            console.error("플러그인 로드 중 오류 발생");
        });
}

////////////////////////////////////////////////////////////////////////////////////////
// 플러그인 로드 모듈 ( 병렬 시퀀스 )
////////////////////////////////////////////////////////////////////////////////////////
function loadPlugin(url) {
    return new Promise(function(resolve, reject) {

        if( isJavaScriptFile(url) ){
            $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> " + getFileNameFromURL(url) + " 자바스크립트를 다운로드 중입니다...");
            $.ajax({
                url: url,
                dataType: "script",
                cache: true,
                success: function() {
                    // The request was successful

                    console.log( "[ common :: loadPlugin ] :: url = " + url + ' 자바 스크립트 플러그인 로드 성공');
                    resolve(); // Promise를 성공 상태로 변경
                },
                error: function() {
                    // The request failed
                    console.error( "[ common :: loadPlugin ] :: url = " + url + ' 플러그인 로드 실패');
                    reject(); // Promise를 실패 상태로 변경
                }
            });
        } else {
            $(".spinner").html("<i class=\"fa fa fa-circle-o-notch fa-spin\"></i> " + getFileNameFromURL(url) + " 스타일시트를 다운로드 중입니다...");
            $("<link/>", {
                rel: "stylesheet",
                type: "text/css",
                href: url
            }).appendTo("head");
            console.log( "[ common :: loadPlugin ] :: url = " + url + ' 스타일시트 플러그인 로드 성공');
            resolve();
        }
    });
}