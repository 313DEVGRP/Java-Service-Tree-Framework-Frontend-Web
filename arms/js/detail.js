////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedJsTreeId; // 요구사항 아이디
var selectedJsTreeName; // 요구사항 이름
var tempDataTable;
var isChecked = [];   // 지라 프로젝트 연결 목록 체크
var jiraCheckId = []; // 여러 개의 c_id를 저장할 배열

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
            // //위젯 헤더 처리 및 사이드 메뉴 처리
            // $(".widget").widgster();
            // setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_regist");
            console.log("장지윤 ::::");
            setDetailAndEditViewTab();
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

function getFileNameFromURL(url) {
    var parts = url.split('/');
    return parts[parts.length - 1];
}

function isJavaScriptFile(filename) {
    return filename.endsWith('.js');
}

function loadPluginGroupSequentially(group) {
    return group.reduce(function(promise, url) {
        return promise.then(function() {
            return loadPlugin(url);
        });
    }, Promise.resolve());
}

function loadPluginGroupsParallelAndSequential(groups) {
    var promises = groups.map(function(group) {
        return loadPluginGroupSequentially(group);
    });
    return Promise.all(promises);
}
////////////////////////////////////////////////////////////////////////////////////////
//상세 보기 탭 & 편집 탭
////////////////////////////////////////////////////////////////////////////////////////
function setDetailAndEditViewTab() {
    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');
    var selectedPdServiceVersion = urlParams.get('pdServiceVersion');
    var selectedJsTreeId = urlParams.get('reqAdd');
    var selectedJiraServer = urlParams.get('jiraServer');
    var selectedJiraProject = urlParams.get('jiraProject');
    console.log("Detail Tab ::::");
    var tableName = "T_ARMS_REQADD_" + selectedPdService;
    alert(tableName)

    $.ajax({
        url: "/auth-anon/api/arms/reqAdd/" + tableName +
            "/getDetail.do?pdService=" + selectedPdService +
            "&pdServiceVersion=" + selectedPdServiceVersion +
            "&reqAdd=" + selectedJsTreeId +
            "&jiraServer=" + selectedJiraServer +
            "&jiraProject=" + selectedJiraProject,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                console.log("=== 장지윤 data");
                console.log(data);
                // ------------------ 상세보기 ------------------ //
                bindDataDetailTab(data);
                //////////////////////////////////////////////////////////
                jSuccess("요구사항 조회가 완료 되었습니다.");
            }
        },
        beforeSend: function () {
            //$("#regist_pdservice").hide(); 버튼 감추기
        },
        complete: function () {
            //$("#regist_pdservice").show(); 버튼 보이기
        },
        error: function (e) {
            jError("요구사항 조회 중 에러가 발생했습니다.");
        }
    });
}
// ------------------ 상세보기 ------------------ //
function bindDataDetailTab(ajaxData) {

    console.log(ajaxData);
    //제품(서비스) 데이터 바인딩
    var selectedPdServiceText = ajaxData.pdServiceEntity.c_title;

    if (isEmpty(selectedPdServiceText)) {
        $("#detailview_req_pdservice_name").text("");
    } else {
        $("#detailview_req_pdservice_name").text(selectedPdServiceText);
    }

    $("#detailview_req_id").text(ajaxData.c_id);
    $("#detailview_req_name").text(ajaxData.c_title);

    //우선순위 셋팅
    $("#detailview_req_priority").children(".btn.active").removeClass("active");
    var select_Req_Priority_ID = "detailView-req-priority-option" + ajaxData.c_priority;
    $("#" + select_Req_Priority_ID)
        .parent()
        .addClass("active");

    $("#detailview_req_status").text(ajaxData.c_req_status);
    $("#detailview_req_writer").text(ajaxData.c_req_writer);
    $("#detailview_req_write_date").text(new Date(ajaxData.c_req_create_date).toLocaleString());

    if (ajaxData.c_req_reviewer01 == null || ajaxData.c_req_reviewer01 == "none") {
        $("#detailview_req_reviewer01").text("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#detailview_req_reviewer01").text(ajaxData.c_req_reviewer01);
    }
    if (ajaxData.c_req_reviewer02 == null || ajaxData.c_req_reviewer02 == "none") {
        $("#detailview_req_reviewer02").text("2번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer02").text(ajaxData.c_req_reviewer02);
    }
    if (ajaxData.c_req_reviewer03 == null || ajaxData.c_req_reviewer03 == "none") {
        $("#detailview_req_reviewer03").text("3번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer03").text(ajaxData.c_req_reviewer03);
    }
    if (ajaxData.c_req_reviewer04 == null || ajaxData.c_req_reviewer04 == "none") {
        $("#detailview_req_reviewer04").text("4번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer04").text(ajaxData.c_req_reviewer04);
    }
    if (ajaxData.c_req_reviewer05 == null || ajaxData.c_req_reviewer05 == "none") {
        $("#detailview_req_reviewer05").text("5번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer05").text(ajaxData.c_req_reviewer05);
    }
    $("#detailview_req_contents").text(ajaxData.c_req_contents);

    $("#detailview_pdservice_name").val(ajaxData.pdServiceEntity.c_title);
    if (isEmpty(ajaxData.pdServiceEntity.c_pdservice_owner) || ajaxData.pdServiceEntity.c_pdservice_owner == "none") {
        $("#detailview_pdservice_owner").val("책임자가 존재하지 않습니다.");
    } else {
        $("#detailview_pdservice_owner").val(ajaxData.pdServiceEntity.c_pdservice_owner);
    }

    if (isEmpty(ajaxData.pdServiceEntity.c_pdservice_reviewer01) || ajaxData.pdServiceEntity.c_pdservice_reviewer01 == "none") {
        $("#detailview_pdservice_reviewer01").val("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#detailview_pdservice_reviewer01").val(ajaxData.pdServiceEntity.c_pdservice_reviewer01);
    }

    if (isEmpty(ajaxData.pdServiceEntity.c_pdservice_reviewer02) || ajaxData.pdServiceEntity.c_pdservice_reviewer02 == "none") {
        $("#detailview_pdservice_reviewer02").val("2번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_pdservice_reviewer02").val(ajaxData.pdServiceEntity.c_pdservice_reviewer02);
    }

    if (isEmpty(ajaxData.pdServiceEntity.c_pdservice_reviewer03) || ajaxData.pdServiceEntity.c_pdservice_reviewer03 == "none") {
        $("#detailview_pdservice_reviewer03").val("3번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_pdservice_reviewer03").val(ajaxData.pdServiceEntity.c_pdservice_reviewer03);
    }

    if (isEmpty(ajaxData.pdServiceEntity.c_pdservice_reviewer04) || ajaxData.pdServiceEntity.c_pdservice_reviewer04 == "none") {
        $("#detailview_pdservice_reviewer04").val("4번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_pdservice_reviewer04").val(ajaxData.pdServiceEntity.c_pdservice_reviewer04);
    }

    if (isEmpty(ajaxData.pdServiceEntity.c_pdservice_reviewer05) || ajaxData.pdServiceEntity.c_pdservice_reviewer05 == "none") {
        $("#detailview_pdservice_reviewer05").val("5번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_pdservice_reviewer05").val(ajaxData.pdServiceEntity.c_pdservice_reviewer05);
    }
    $("#detailview_pdservice_contents").html(ajaxData.pdServiceEntity.c_pdservice_contents);

    $("#editview_pdservice_name").val(ajaxData.pdServiceEntity.c_title);
}


