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

            setDetailAndEditViewTab();
        })
        .catch(function (errorMessage) {
            console.error(errorMessage);
            console.error("플러그인 로드 중 오류 발생");
        });
}

////////////////////////////////////////////////////////////////////////////////////////
//상세 보기 탭 & 편집 탭
////////////////////////////////////////////////////////////////////////////////////////
function setDetailAndEditViewTab() {
    var urlParams = new URL(location.href).searchParams;
    var selectedJsTreeId = urlParams.get('reqAdd');
    var selectedPdService = urlParams.get('pdService');
    console.log("Detail Tab ::::")
    var tableName = "T_ARMS_REQADD_" + selectedPdService;
    $.ajax({
        url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedJsTreeId,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true
    })
        .done(function (data) {
            // ------------------ 상세보기 ------------------ //
            bindDataDetailTab(data);
        })
        .fail(function (e) {})
        .always(function () {});
}
// ------------------ 상세보기 ------------------ //
function bindDataDetailTab(ajaxData) {

    console.log(ajaxData)
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
