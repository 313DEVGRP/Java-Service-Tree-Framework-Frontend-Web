////////////////////////////////////////////////////////////////////////////////////////
// 요구사항 상세보기 페이지 Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedJsTreeId; // 요구사항 아이디
var calledAPIs = {};
var totalReqCommentCount;
/* 요구사항 전체목록 전역변수 */
var reqTreeList;
var visibilityStatus = {
    '#stats': false,
    '#detail' : false,
    '#version': false,
    '#allreq': false,
    '#files': false,
    '#question': false
};


var prefix = "./img/winTypeFileIcons/";
var iconsMap = {
    'application/vnd.ms-htmlhelp': prefix + 'CHM.File.png',
    'application/vnd.ms-excel': prefix + 'XLS.File.png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': prefix + 'XLS.File.png',
    'application/vnd.ms-powerpoint': prefix + 'PPT.File.png',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': prefix + 'PPT.File.png',
    'application/msword': prefix + 'DOC.File.png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': prefix + 'DOC.File.png',
    'application/haansoftpptx': prefix + 'PPT.File.png',
    'application/haansoftdocx': prefix + 'DOC.File.png',
    'application/pdf': prefix + 'PDF.File.png',
    'application/x-rar-compressed': prefix + 'RAR.File.png',
    'application/zip': prefix + 'ZIP.File.png',
    'application/x-gzip': prefix + 'ZIP.File.png',
    'application/x-msdownload': prefix + 'DLL.File.png',
    'application/javascript':prefix +  'JS.File.png',
    'application/x-shockwave-flash': prefix + 'SWF.File.png',
    'application/xml': prefix + 'XML.File.png',
    'image/bmp': prefix + 'BMP.File.png',
    'image/gif': prefix + 'GIF.File.png',
    'image/jpeg': prefix + 'JPG1.File.png',
    'image/png': prefix + 'PNG.File.png',
    'image/tiff': prefix + 'TIFF.File.png',
    'text/html': prefix + 'HTML.File.png',
    'text/plain': prefix + 'TXT.File.png',
    'text/richtext': prefix + 'RTF.File.png',
    'text/xml': prefix + 'XML.File.png',
    'text/yaml': 'YAML.svg',
    'video/mp4': prefix + 'MP4.File.png',
    'audio/mpeg': prefix + 'MP3.File.png',
    'audio/x-wav': prefix + 'WAV.File.png',
    'application/java-archive': prefix + 'JAR.File.png',
    // 추가 타입 여기에 추가
};

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

        /*[
            // Template CSS File
            "../reference/jquery-plugins/MyResume/assets/vendor/boxicons/css/boxicons.css",
            "../reference/jquery-plugins/MyResume/assets/vendor/glightbox/css/glightbox.min.css",
            "../reference/jquery-plugins/MyResume/assets/vendor/swiper/swiper-bundle.min.css",
            // Template Main CSS File
            "../reference/jquery-plugins/MyResume/assets/css/style.css"
        ],*/
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
        [
            // Chart
            "../reference/light-blue/lib/nvd3/lib/d3.v2.js",
            "../reference/light-blue/lib/nvd3/nv.d3.custom.js",
            "../reference/light-blue/lib/nvd3/src/utils.js",
            "../reference/light-blue/lib/nvd3/src/models/legend.js",
            "../reference/light-blue/lib/nvd3/src/models/pie.js",
            "../reference/light-blue/lib/nvd3/src/models/pieChartTotal.js",
            "../reference/light-blue/lib/nvd3/stream_layers.js",
            "./html/armsDetailExceptTemplate/assets/js/stats.js",
            "./html/armsDetailExceptTemplate/assets/vendor/bootstrap/js/bootstrap.min.js"
        ]
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function () {

            // 스크롤 반응하여 API 호출 이벤트
            window.addEventListener('scroll', scrollApiFunc);

            // 계정 정보 바인딩
            bindAccountInfo();

            // 메뉴 클릭 이벤트
            menuClick();

            // 상세정보 제일 먼저 호출 후 pdService 제목과 req 제목 바인딩
            getDetailViewTab();
            // 통계정보 탭
            //bindStatsTab();
            statsViewTabClick();

            // 상세정보 탭 클릭 이벤트
            reqDetailViewTabClick();

            // 요구사항 상세 탭 생략된 문장 마우스 호버시 전체 문장 확인 이벤트
            //getFullTextFromTruncated();

            // 버전 상세정보 탭 클릭 이벤트
            versionDetailViewTabClick();

            // 요구사항 전체정보 탭 클릭 이벤트
            allReqListViewTabClick();

            // 요구사항 전체 목록 탭 제품(서비스)리뷰어 클릭시 아코디언 효과
            resize_reviewer();

            // 제품관련 파일 탭 클릭 이벤트
            filesViewTabClick();

            // QnA 채팅 게시판 탭 클릭 이벤트
            reqCommentListViewTabClick();

            // QnA 글 저장
            req_comment_save_btn_click();

            // QnA 글 작성 시 확장
            req_comment_message_size_change();

            // 요구사항 전체목록 호출 메소드
            // req_list_load();
        })
        .catch(function (errorMessage) {
            console.error(errorMessage);
            console.error("플러그인 로드 중 오류 발생");
        });
}

function setPdServiceName(pdServiceName) {
    $(".pdServiceName").text(pdServiceName);
}

function setRequirementName(requirementName) {
    $(".requirementName").text(requirementName);
}

// ------------------ api 호출 여부 확인(여러번 발생시키지 않기 위하여) ------------------ //
function callAPI(apiName) {
    if (calledAPIs[apiName]) {
        console.log("This API has already been called: " + apiName);
        return true;
    }

    return false;
}

// ------------------ 잘린 텍스트 전체 확인 ------------------ //
/*
function getFullTextFromTruncated(){
    var elements = document.querySelectorAll(".text-truncate, .text-truncate *");
    elements.forEach(element => {
        element.addEventListener("mouseenter", () => {
            element.classList.add("show-full");
            element.style.cursor = "help";
        });
        element.addEventListener("mouseleave", () => {
            element.classList.remove("show-full");
            element.style.cursor = "default";
        });
    });
}
*/

// ------------------ 스크롤 api 호출하기 ------------------ //
function checkVisible( element, check = 'visible' ) {
    const viewportHeight = $(window).height(); // Viewport Height
    const scrolltop = $(window).scrollTop(); // Scroll Top
    const y = $(element).offset().top;
    const elementHeight = $(element).height();

    // 반드시 요소가 화면에 보여야 할경우
    if (check == "visible")
        return ((y < (viewportHeight + scrolltop)) && (y > (scrolltop - elementHeight)));

    // 화면에 안보여도 요소가 위에만 있으면 (페이지를 로드할때 스크롤이 밑으로 내려가 요소를 지나쳐 버릴경우)
    if (check == "above")
        return ((y < (viewportHeight + scrolltop)));
}

function scrollApiFunc() {
    for (var element in visibilityStatus) {
        if (!visibilityStatus[element] && checkVisible(element)) {
            if(element === "#stats") {
                bindStatsTab();
            }

            if(element === "#detail") {
                getDetailViewTab();
            }
            else if(element === "#version") {
                initVersionData();
                bindDataVersionTab();
            }
            else if (element === "#allreq") {
                build_ReqData_By_PdService();

                // 요구사항 전체목록 호출 후 전역변수에서 바인딩작업
                // set_req_list_view();
                // set_req_list_button();
            }
            else if (element === "#files") {
                fileLoadByPdService();
            }
            else if (element === "#question") {

                if (callAPI("reqCommentAPI")) {
                    return;
                }

                getTotalCount();

                getReqCommentList(1);

                calledAPIs["reqCommentAPI"] = true;
            }

            visibilityStatus[element] = true;
        }

        // 모든 요소가 로드되면 더이상 이벤트 스크립트가 있을 필요가 없으니 삭제
        if (Object.values(visibilityStatus).every(status => status === true)) {
            window.removeEventListener('scroll', scrollApiFunc);
            break;
        }
    }
}

// ------------------ 계정 정보 바인딩 ------------------ //
function bindAccountInfo() {
    $("#user-name").html(userName + "<span style=\"font-weight: normal\">님</span>");
    $("#user-name-detail").html(fullName + ' (' + userName + ')');
    $("#user-email").html(userEmail);
}

// ------------------ 메뉴 클릭 이벤트 ------------------ //
function menuClick() {
    $('.mobile-nav-toggle').click(function (e) {
        $('body').toggleClass('mobile-nav-active');
        $(this).toggleClass('bi-list');
        $(this).toggleClass('bi-x');
    });
}

// ------------------ 통계정보 ------------------ //
function statsViewTabClick() {
    $("#get_stats").click(function() {
        bindStatsTab();
    });
}

function bindStatsTab() {

    if (callAPI("statsAPI")) {
        return;
    }

    console.log("Stats Tab ::::");

    var urlParams= new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');
    var selectedReq = urlParams.get('reqAdd');
    var selectedJiraServer = urlParams.get('jiraServer');

    // api 호출 및 데이터 바인딩
    $.ajax({
        url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + selectedPdService + "/getPdReqStats.do" +
            "?assigneeEmail=" + userEmail,
        type: "GET",
        async: false,
        statusCode: {
            200: function (json) {
                console.log("::제품 요구사항 통계::");
                console.log(json);

                $("#product-all-req").text(json.allReq);
                $("#product-my-req").text(json.myReq + " 개");
                $("#product-my-req-display").css("width", ((json.myReq/json.allReq) * 100).toFixed(2) + "%");

                var excludeKey = ["allReq", "myReq"];
                var newJson = Object.assign({}, json);
                for (var key in excludeKey) {
                    delete newJson[excludeKey[key]];
                }

                console.log("newJson: " + JSON.stringify(newJson));
                loadChart("#product-chart-pie svg", "#product-chart-footer", newJson);
            }
        },
        beforeSend: function () {
        },
        complete: function () {
        },
        error: function (e) {
            jError("통계 자료를 불러오는 중 에러가 발생했습니다.");
        }
    });

    $.ajax({
        url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + selectedPdService + "/getPdRelatedReqStats.do" +
            "?assigneeEmail=" + userEmail,
        type: "GET",
        data: {
            c_jira_server_link: selectedJiraServer,
            c_req_link: selectedReq
        },
        async: false,
        statusCode: {
            200: function (json) {
                console.log("::해당 요구사항 통계::");
                console.log(json);

                $("#req-all-req").text(json.allReq);
                $("#req-my-req").text(json.myReq + " 개");
                $("#req-my-req-display").css("width", ((json.myReq/json.allReq) * 100).toFixed(2) + "%");

                var excludeKey = ["allReq", "myReq"];
                var newJson = Object.assign({}, json);
                for (var key in excludeKey) {
                    delete newJson[excludeKey[key]];
                }
                console.log("newJson: " + JSON.stringify(newJson));
                loadChart("#requirement-chart-pie svg", "#requirement-chart-footer", newJson);
            }
        },
        beforeSend: function () {
        },
        complete: function () {
        },
        error: function (e) {
            jError("통계 자료를 불러오는 중 에러가 발생했습니다.");
        }
    });
    
    // 현재는 임시 데이터로 로드
    // var json = {
    //     "openCount": 2,
    //     "underwayCount": 3,
    //     "completeCount": 5,
    //     "etcCount": 0
    // };

    calledAPIs["statsAPI"] = true;
}

// ------------------ 상세보기 ------------------ //
function reqDetailViewTabClick() {
    $("#get_version_list").click(function () {
        getDetailViewTab();
    });
}

function getDetailViewTab() {

    if (callAPI("detailAPI")) {
        return;
    }

    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');
    var selectedPdServiceVersion = urlParams.get('pdServiceVersion');
    selectedJsTreeId = urlParams.get('reqAdd');
    var selectedJiraServer = urlParams.get('jiraServer');
    var selectedJiraProject = urlParams.get('jiraProject');
    console.log("Detail Tab ::::");
    var tableName = "T_ARMS_REQADD_";

    $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
    $.ajax({
        url: "/auth-user/api/arms/reqAdd/" + tableName + "/getDetail.do" +
            "?jiraProject=" + selectedJiraProject +
            "&jiraServer=" + selectedJiraServer +
            "&pdService=" + selectedPdService +
            "&pdServiceVersion=" + selectedPdServiceVersion +
            "&reqAdd=" + selectedJsTreeId,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                console.log(data);
                console.table(data);

                // ------------------ 상세보기 ------------------ //
                bindDataDetailTab(data);
                //////////////////////////////////////////////////////////
                jSuccess("요구사항 조회가 완료 되었습니다.");
                calledAPIs["detailAPI"] = true;
            }
        },
        beforeSend: function () {
        },
        complete: function () {
        },
        error: function (e) {
            jError("요구사항 조회 중 에러가 발생했습니다.");
        }
    });
}

function bindDataDetailTab(ajaxData) {

    console.log(ajaxData);
    //제품(서비스) 데이터 바인딩
    var selectedPdServiceText = ajaxData.pdService_c_title;

    if (isEmpty(selectedPdServiceText)) {
        $("#detailview_req_pdservice_name").val("");
    } else {
        $("#detailview_req_pdservice_name").val(selectedPdServiceText);
        setPdServiceName(selectedPdServiceText);
    }

    $("#detailview_req_id").val(selectedJsTreeId);
    $("#detailview_req_name").val(ajaxData.reqAdd_c_title);
    setRequirementName(ajaxData.reqAdd_c_title);

    //Version 데이터 바인딩
    if (isEmpty(ajaxData.pdServiceVersion_c_title)) {
        $("#detailview_req_pdservice_version").val("요구사항에 등록된 버전이 없습니다.");
    } else {
        $("#detailview_req_pdservice_version").val(ajaxData.pdServiceVersion_c_title);
    }

    $("#detailview_req_writer").val(ajaxData.reqAdd_c_req_writer);
    $("#detailview_req_write_date").val(new Date(ajaxData.reqAdd_c_req_create_date).toLocaleString());

    if (ajaxData.reqAdd_c_req_reviewer01 == null || ajaxData.reqAdd_c_req_reviewer01 == "none") {
        $("#detailview_req_reviewer01").val("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#detailview_req_reviewer01").val(ajaxData.reqAdd_c_req_reviewer01);
    }
    if (ajaxData.reqAdd_c_req_reviewer02 == null || ajaxData.reqAdd_c_req_reviewer02 == "none") {
        $("#detailview_req_reviewer02").val("2번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer02").val(ajaxData.reqAdd_c_req_reviewer02);
    }
    if (ajaxData.reqAdd_c_req_reviewer03 == null || ajaxData.reqAdd_c_req_reviewer03 == "none") {
        $("#detailview_req_reviewer03").val("3번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer03").val(ajaxData.reqAdd_c_req_reviewer03);
    }
    if (ajaxData.reqAdd_c_req_reviewer04 == null || ajaxData.reqAdd_c_req_reviewer04 == "none") {
        $("#detailview_req_reviewer04").val("4번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer04").val(ajaxData.reqAdd_c_req_reviewer04);
    }
    if (ajaxData.reqAdd_c_req_reviewer05 == null || ajaxData.reqAdd_c_req_reviewer05 == "none") {
        $("#detailview_req_reviewer05").val("5번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer05").val(ajaxData.reqAdd_c_req_reviewer05);
    }

    $("#detailview_req_contents").html(ajaxData.reqAdd_c_req_contents);
    $("#req_detail_contents").html(ajaxData.reqAdd_c_req_contents);


}

// ------------------ 버전 상세보기 ------------------ //
function versionDetailViewTabClick() {
    $("#get_version_list").click(function () {
        initVersionData();
        bindDataVersionTab();
    });
}

function bindDataVersionTab() {
    console.log("Version Detail View Tab ::::");
    if (callAPI("versionAPI")) {
        return;
    }

    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');
    var selectedPdServiceVersion = urlParams.get('pdServiceVersion');

    // ajax 처리 후 데이터 바인딩
    console.log("dataLoad :: getSelectedID → " + selectedPdService);
    $.ajax({
        url: "/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + selectedPdService,
        async: false
    }).done(function (json) {
        console.log("dataLoad :: success → ", json);

        $("#version-product-name").html(json.c_title);
        $("#version-accordion").jsonMenu(selectedPdServiceVersion, json.pdServiceVersionEntities, { speed: 5000 });
        $(".version-list").slimscroll({
            height: "502px"
        });

        calledAPIs["versionAPI"] = true;
    });
}

function initVersionData() {
    let data = ``;

    $.fn.jsonMenu = function (c_id, items, options) {
        $(this).addClass("json-menu");

        for (var i = 0; i < items.length; i++) {
            data += `
           <div class="panel">
               <div class="panel-heading">
                   <a class="accordion-toggle"
                            name="versionLink_List"
                            style="text-decoration: none; cursor: pointer; border-radius: 5px;  
                                   align-items: center; display: flex; justify-content: space-between;"
                            data-value="${items[i].c_id}"
                            onclick="versionClick(this, ${items[i].c_id})"
                            return false;">
                       ${items[i].c_title}
                       <i class="bi bi-chevron-right"></i>
                   </a>
               </div>
           </div>`;
        }
        $(this).html(data);

        // 버전 데이터 바인딩
        var element = $("a[data-value='" + c_id + "']");
        console.log("해당 요구사항의 버전 요소: ", element[0]);

        versionClick(element[0], c_id);
    };
}

function versionClick(element, c_id) {
    console.log("versionClick:: c_id  -> ", c_id);
    $("a[name='versionLink_List']").each(function () {
        this.style.background = "";
        this.style.color = "";
    });
    element.style.background = "rgba(2, 59, 109, 0.7)";
    element.style.color = "rgb(255, 255, 255)";
    console.log(element);

    $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
    $.ajax({
        url: "/auth-user/api/arms/pdServiceVersion/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
        data: { c_id: c_id }, // HTTP 요청과 함께 서버로 보낼 데이터
        method: "GET", // HTTP 요청 메소드(GET, POST 등)
        dataType: "json" // 서버에서 보내줄 데이터의 타입
    })
        // HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
        .done(function (json) {
            console.log(" → " + json.c_contents);
            console.log(json);

            // 데이터 바인딩
            $("#version-name").html(json.c_title);
            $("#version-start-date").val(json.c_pds_version_start_date);
            $("#version-end-date").val(json.c_pds_version_end_date);
            $("#version-desc").slimscroll({
                height: "300px"
            });
            $("#version-desc").html(json.c_pds_version_contents);
            $("#req_version_detail_contents").html(json.c_pds_version_contents);

            jSuccess("버전 상세 정보 조회가 완료 되었습니다.");
        })
        // HTTP 요청이 실패하면 오류와 상태에 관한 정보가 fail() 메소드로 전달됨.
        .fail(function (xhr, status, errorThrown) {
            console.log(xhr + status + errorThrown);
        })
        //
        .always(function (xhr, status) {
            console.log(xhr + status);
        });
}

// ------------------ 제품의 요구사항 전체 목록 보기 ------------------ //
function allReqListViewTabClick() {
    $("#get_req_list").click(function () {
        build_ReqData_By_PdService();

        // 요구사항 전체목록 호출 후 전역변수에서 바인딩작업
        // set_req_list_view();
        // set_req_list_button();
    });
}

function build_ReqData_By_PdService() {
    console.log("Requirement List View Tab::");
    if (callAPI("allReqListAPI")) {
        return;
    }

    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');

    console.log(selectedPdService);
    // div id값
    var jQueryElementID = "#req_tree";
    // api 호출
    var serviceNameForURL = "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" + selectedPdService;

    // common.js에 정의되어있는 함수
    detailTreeBuild(jQueryElementID, serviceNameForURL);
    calledAPIs["allReqListAPI"] = true;
}

function detailTreeBuild(jQueryElementID, serviceNameForURL) {
    console.log("common :: detailTreeBuild : ( jQueryElementID ) → " + jQueryElementID);
    console.log("common :: detailTreeBuild : ( serviceNameForURL ) → " + serviceNameForURL);

    console.log("common :: detailTreeBuild : ( href ) → " + $(location).attr("href"));
    console.log("common :: detailTreeBuild : ( protocol ) → " + $(location).attr("protocol"));
    console.log("common :: detailTreeBuild : ( host ) → " + $(location).attr("host"));
    console.log("common :: detailTreeBuild : ( pathname ) → " + $(location).attr("pathname"));
    console.log("common :: detailTreeBuild : ( search ) → " + $(location).attr("search"));
    console.log("common :: detailTreeBuild : ( hostname ) → " + $(location).attr("hostname"));
    console.log("common :: detailTreeBuild : ( port ) → " + $(location).attr("port"));

    $(jQueryElementID)
        .bind("before.jstree", function (e, data) {
            $("#alog").append(data.func + "<br />");
            $("li:not([rel='drive']).jstree-open > a > .jstree-icon").css(
                "background-image",
                "url(../reference/jquery-plugins/jstree-v.pre1.0/themes/open_folder.png)"
            );
            $("li:not([rel='drive']).jstree-closed > a > .jstree-icon").css(
                "background-image",
                "url(../reference/jquery-plugins/jstree-v.pre1.0/themes/folder.png)"
            );
        })
        .jstree({
            // List of active plugins
            plugins: ["themes", "json_data", "ui", "types"],
            themes: { theme: ["lightblue4"] },
            json_data: {
                ajax: {
                    url: serviceNameForURL + "/getChildNode.do",
                    cache: false,
                    data: function (n) {
                        console.log("[ common :: detailTreeBuild ] :: json data load = " + JSON.stringify(n));
                        return {
                            c_id: n.attr ? n.attr("id").replace("node_", "").replace("copy_", "") : 1
                        };
                    },
                    success: function (n) {
                        jSuccess("Product(service) Data Load Complete");
                    }
                }
            },
            types: {
                max_depth: -1,
                max_children: -1,
                valid_children: ["drive"],
                types: {
                    default: {
                        valid_children: "none",
                        icon: {
                            image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/search.png"
                        }
                    },
                    folder: {
                        valid_children: ["default", "folder"],
                        icon: {
                            image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/folder.png"
                        }
                    },
                    drive: {
                        valid_children: ["default", "folder"],
                        icon: {
                            image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/root.png"
                        },
                        start_drag: false,
                        move_node: false,
                        delete_node: false,
                        remove: false
                    }
                }
            },
            ui: {
                initially_select: ["node_4"]
            },
            core: {
                initially_open: ["node_2"]
            }
        })
        .bind("select_node.jstree", function (event, data) {
            // `data.rslt.obj` is the jquery extended node that was clicked

            var selectRel = data.rslt.obj.attr("rel");

            if (selectRel == "folder" || selectRel == "drive") {
                var nodeIsOpen = $('#req_tree').jstree("is_open", data.node);
                if (nodeIsOpen) {
                    $('#req_tree').jstree("close_node", data.node);
                } else {
                    $('#req_tree').jstree("open_node", data.node);
                }
            }

            if ($.isFunction(detailTreeClick)) {
                console.log("[ detailTreeBuild :: select_node ] :: data.rslt.obj.data('id')" + data.rslt.obj.attr("id"));
                console.log("[ detailTreeBuild :: select_node ] :: data.rslt.obj.data('rel')" + data.rslt.obj.attr("rel"));
                console.log("[ detailTreeBuild :: select_node ] :: data.rslt.obj.data('class')" + data.rslt.obj.attr("class"));
                console.log("[ detailTreeBuild :: select_node ] :: data.rslt.obj.children('a')" + data.rslt.obj.children("a"));
                console.log("[ detailTreeBuild :: select_node ] :: data.rslt.obj.children('ul')" + data.rslt.obj.children("ul"));
                detailTreeClick(data.rslt.obj);
            }
        })
        .bind("loaded.jstree", function (event, data) {
            /*           setTimeout(function () {
                           $(jQueryElementID).jstree("open_all");
                       }, 1500);*/

            $(jQueryElementID).slimscroll({
                height: "545px"
            });
        });
}

/*
수정 - 김찬호
작성일 - 0929
수정일 - 1010(박현민) - 메소드 명 수정
트리에서 해당 요구사항 클릭시 해당 요구사항 아이디 조회
*/
function detailTreeClick(selectedNode) {

    console.log("[ detail :: detailTreeClick ] :: selectedNode ");

    selectedJsTreeId = selectedNode.attr("id").replace("node_", "").replace("copy_", "");//요구사항 아이디
    selectedJsTreeName = $("#req_tree").jstree("get_selected").text();

    console.log(selectedJsTreeName);

    if (selectedJsTreeId == 2) {
        $("#select_Req").text("루트 요구사항이 선택되었습니다.");
    } else {
        $("#select_Req").text($("#req_tree").jstree("get_selected").text());
    }

    var selectRel = selectedNode.attr("rel");

    //요구사항 타입에 따라서 탭의 설정을 변경 (삭제예정)
    if (selectRel == "folder" || selectRel == "drive") {

        // 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
        // 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
        // 박현민 - 폴더 일 때 이부분 어떻게 바뀌는지 확인하고 어떻게 바꿀지 고민해야함
        // 김찬호 - 일단 고려 하지 않음. 0929
        // dataTableLoad(selectedJsTreeId, selectRel);
    } else {
        //이전에 화면에 렌더링된 데이터 초기화
        // 상세데이터 영역 바인딩 start
        setDetailViewTab();
    }

}

/*
작성자 - 김찬호
작성일 - 0929
트리에서 해당 요구사항 클릭시 데이터 호출 부분
*/
function setDetailViewTab() {
    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService'); // 해당 서비스는 고정
    var tableName = "T_ARMS_REQADD_" + selectedPdService;

    $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
    $.ajax({
        url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedJsTreeId,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true
    })
        .done(function (data) {
            /*----------- 해당 상세 정보 영역 바인딩 -----------*/
            bindClickedDataDetail(data);
        })
        .fail(function (e) {})
        .always(function () {});
}
/*
작성자 - 김찬호
작성일 - 0930
버전 아이디로 버전 정보상세 조회
*/
function getVersionName(c_id , callback) {

    $.ajax({
        url: "/auth-user/api/arms/pdServiceVersion/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
        data: { c_id: c_id }, // HTTP 요청과 함께 서버로 보낼 데이터
        method: "GET", // HTTP 요청 메소드(GET, POST 등)
        dataType: "json" // 서버에서 보내줄 데이터의 타입
    })
        // HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
        .done(function (json) {
            callback(json);
        })
        // HTTP 요청이 실패하면 오류와 상태에 관한 정보가 fail() 메소드로 전달됨.
        .fail(function (xhr, status, errorThrown) {
            console.log(xhr + status + errorThrown);
        })
}

/*
작성자 - 김찬호
수정일 - 1001 (요구사항 버전 리스트 형태 바인딩)
해당 상세 정보 영역 데이터 바인딩
*/
function bindClickedDataDetail(ajaxData) {
    var buttonElement = document.querySelector('#view_allreq_btn');

    if(buttonElement){
        buttonElement.style.display = "block";
    }

    //console.table(ajaxData);
    var version_id_list = JSON.parse(ajaxData.c_req_pdservice_versionset_link);

    if (isEmpty(version_id_list)) {
        $("#allreq_pdservice_version").val("요구사항에 등록된 버전이 없습니다.");
    } else {
        var promises = version_id_list.map(function(version_id) {
            return new Promise(function(version_title) {
                getVersionName(version_id.toString(), function(response) {
                    version_title(response.c_title);
                });
            });
        });

        Promise.all(promises)
            .then(function(titles) {
                titles.sort()
                titles = titles.slice(-1).concat(titles.slice(0, -1));
                $("#allreq_pdservice_version").val(titles[titles.length-1]);
                $("#allreq_pdservice_version_list").val(titles.join(", "));
            })
            .catch(function(error) {
                console.error(error);
            });
    }

    $("#allreq_pdservice_name").val(ajaxData.pdServiceEntity.c_title); // 요구사항 제품(서비스)

    $("#allreq_pdservice_id").val(ajaxData.c_id);                // 요구사항 아이디
    $("#allreq_pdservice_title").val(ajaxData.c_title);             // 요구사항 제목
    $("#allreq_pdservice_writer").val(ajaxData.c_req_writer);       // 요구사항 작성자
    $("#allreq_pdservice_date").val(new Date(ajaxData.c_req_create_date).toLocaleString());   // 요구사항 최근 작성일

    if (ajaxData.c_req_reviewer01 == null || ajaxData.c_req_reviewer01 == "none") {
        $("#allreq_pdservice_reviewer01").val("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer01").val(ajaxData.c_req_reviewer01);
    }
    if (ajaxData.c_req_reviewer02 == null || ajaxData.c_req_reviewer02 == "none") {
        $("#allreq_pdservice_reviewer02").val("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer02").val(ajaxData.c_req_reviewer02);
    }
    if (ajaxData.c_req_reviewer03 == null || ajaxData.c_req_reviewer03 == "none") {
        $("#allreq_pdservice_reviewer03").val("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer03").val(ajaxData.c_req_reviewer03);
    }
    if (ajaxData.c_req_reviewer04 == null || ajaxData.c_req_reviewer04 == "none") {
        $("#allreq_pdservice_reviewer04").val("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer04").val(ajaxData.c_req_reviewer04);
    }
    if (ajaxData.c_req_reviewer05 == null || ajaxData.c_req_reviewer05 == "none") {
        $("#allreq_pdservice_reviewer05").val("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer05").val(ajaxData.c_req_reviewer05);
    }

    $("#allreq_pdservice_content").html(ajaxData.c_req_contents);       // 요구사항 내용
    $("#req_all_detail_contents").html(ajaxData.c_req_contents);


}
/*
작성자 - 김찬호
작성일 - 1001
2~5번 리뷰어 감추고 "제품(서비스) 리뷰어"클릭시 나머지 리뷰어 확인 가능하게 동작
*/
function resize_reviewer(){
    $(".toggle-content").click(function(){
        if ($('#additional-item2').hasClass('d-none')) {
            $('#additional-item2').removeClass('d-none');
            $('#additional-item3').removeClass('d-none');
            $('#additional-item4').removeClass('d-none');
            $('#additional-item5').removeClass('d-none');
        } else {
            $('#additional-item2').addClass('d-none');
            $('#additional-item3').addClass('d-none');
            $('#additional-item4').addClass('d-none');
            $('#additional-item5').addClass('d-none');
        }
    });
}

// ------------------ 제품 관련 파일 보기 ------------------ //
function filesViewTabClick() {
    $("#get_file_list").click(function () {
        fileLoadByPdService();
    });
}

function fileLoadByPdService() {
    console.log("File Tab ::::");

    if (callAPI("fileAPI")) {
        return;
    }

    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');

    $("#fileIdlink").val(selectedPdService);
    $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
    $.ajax({
        url: "/auth-user/api/arms/fileRepository/getFilesByNode.do",
        data: {fileIdLink: selectedPdService},
        async: false,
        dataType: "json"
    }).done(function (result) {
        console.log(result.files);
        calledAPIs["fileAPI"] = true;

        bindFileList(result);

        jSuccess("파일 조회가 완료 되었습니다.");
    });
}

function bindFileList(result) {
    if (result.files.length === 0) {
        noFileMessage();
        return;
    }

    let $portfolioContainer = $('.portfolio-container');
    if ($portfolioContainer.length) {
        createFileList($portfolioContainer, result);
    }
}

function noFileMessage() {
    let $container = $('#files-container');

    var $noDataHtml = $(`<p style="width: 100%; text-align: center; font-size: 20px;">
                                    <i class="bi bi-file-earmark-x" style="font-size:50px;"></i><br>
                                    등록된 파일이 없습니다.
                                  </p>`);
    $container.append($noDataHtml);
}

function createFileList($portfolioContainer, result) {

    let portfolioIsotope = new Isotope($portfolioContainer[0], {
        itemSelector: '.portfolio-item'
    });

    for (var key in result) {
        if (result.hasOwnProperty(key)) {
            var fileSet = result[key];

            // 각 파일 정보(fileSet)을 처리
            fileSet.forEach(function (file) {
                console.log(file.fileName);
                var filterClass;
                if (file.contentType.includes("image")) {
                    filterClass = 'filter-image';
                } else if (file.contentType.includes("text")) {
                    filterClass = 'filter-doc';
                } else if (file.contentType.includes("application")) {
                    filterClass = 'filter-doc';
                } else {
                    filterClass = 'filter-etc';
                }

                var imgSrc = iconsMap[file.contentType] || prefix + 'Default.png';
                var title = file.fileName;
                var downloadUrl = file.url;
                var thumbnailUrl = file.thumbnailUrl;
                var fileSize = formatBytes(file.size, 3);
                var imageLinkHtml = '';

                var $newHtml = $(`<div class="col-lg-2 col-md-3 col-sm-3 portfolio-item ${filterClass}">
                                            <div class="portfolio-wrap" style="display: grid; background: rgb(69 80 91 / 0%)!important;">
                                                <img src="${imgSrc}" class="img-fluid" alt="" style="margin:auto;">
                                                <div class="portfolio-info">
                                                    <h4>${title}</h4>
                                                    <p>${fileSize}</p>
                                                    <div class="portfolio-links">
                                                        <a href="${downloadUrl}" class="portfolio-details-lightbox" data-glightbox="type: external" title="${title}"><i class="bx bx-download"></i></a>
                                                        ${imageLinkHtml}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`);

                let imgLoadCheck = new Image();
                imgLoadCheck.src = imgSrc;

                imgLoadCheck.onload = function () {
                    $portfolioContainer.append($newHtml);
                    portfolioIsotope.appended($newHtml[0]);
                    portfolioIsotope.arrange();
                };
            });
        }
    }

    /* data-filter 통해서 이미지, 문서, 기타 파일로 클릭 시 나눠지는 부분 */
    $('#portfolio-flters li').on('click', function(e){
        e.preventDefault();
        $('#portfolio-flters li').removeClass('filter-active');
        $(this).addClass('filter-active');

        portfolioIsotope.arrange({
            filter: $(this).attr('data-filter')
        });

        portfolioIsotope.on( 'arrangeComplete', function() {
            AOS.refresh();
        });

        portfolioIsotope.reloadItems();
        portfolioIsotope.arrange();
    });

}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ------------------ QnA 게시판보기 ------------------ //
function reqCommentListViewTabClick() {
    $("#get_req_comment_list").click(function () {

        if (callAPI("reqCommentAPI")) {
            return;
        }

        getTotalCount();
        getReqCommentList(1);

        calledAPIs["reqCommentAPI"] = true;
    });
}

function getTotalCount() {
    console.log("ReqComment Total Count :::");
    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');
    selectedJsTreeId = urlParams.get('reqAdd');

    $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
    $.ajax({
        url: "/auth-user/api/arms/reqComment/getTotalCountReqComment.do",
        type: "GET",
        data: {
            c_pdservice_link: selectedPdService,
            c_req_link: selectedJsTreeId
        },
        async: false,
        statusCode: {
            200: function (data) {
                //모달 팝업 끝내고
                console.log(data.response);
                totalReqCommentCount = data.response;
            }
        },
        beforeSend: function () {
        },
        complete: function () {
        },
        error: function (e) {
            jError("신규 게시물 등록 중 에러가 발생했습니다.");
        }
    });
}

function getReqCommentList(pageNum) {
    console.log("ReqList Tab ::::");

    var pageSize = 10;
    var totalPages = 0;
    var curPage = pageNum;

    if (totalReqCommentCount !== null && totalReqCommentCount > 0) {
        totalPages = Math.ceil(totalReqCommentCount / pageSize);
        console.log("totalPages : " + totalPages);

        $(".pagination").empty();
        var htmlStr = bindPagination(curPage, totalPages, "getReqCommentList");

        $(".pagination").append(htmlStr);
    }
    else{
        noReqCommentMessage();
        return;
    }

    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');
    var selectedPdServiceVersion = urlParams.get('pdServiceVersion');
    selectedJsTreeId = urlParams.get('reqAdd');

    $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
    $.ajax({
        url: "/auth-user/api/arms/reqComment/getReqCommentPagingByPdService.do",
        type: "GET",
        data: {
            c_pdservice_link: selectedPdService,
            c_req_link: selectedJsTreeId,
            pageIndex: pageNum,
            pageUnit: pageSize
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        statusCode: {
            200: function (data) {
                var $chatMessages = $('#chat_messages');
                $chatMessages.empty();

                console.log(data.response);

                if (data.response.length === 0) {
                    /* 게시글이 없을 경우 처리 필요 */
                    noReqCommentMessage();
                    return;
                }

                data.response.forEach(function(comment) {
                    var commentHtml = createReqCommentList(comment);
                    $chatMessages.append(commentHtml);
                });

                reqCommentRegisterEventHandlers();

            }
        },
        beforeSend: function () {
        },
        complete: function () {
        },
        error: function (e) {
            jError("신규 게시물 등록 중 에러가 발생했습니다.");
        }
    });
}

function bindPagination(curPage, totalPages, funName) {
    var pageUrl = "";

    var pageLimit = 5;
    var startPage = parseInt((curPage - 1) / pageLimit) * pageLimit + 1;

    var endPage = startPage + pageLimit - 1;

    if (totalPages < endPage) {
        endPage = totalPages;
    }

    var nextPage = endPage + 1;
    // console.log(curPage,"curPage,",startPage,"startPage,",endPage,"endPage,",nextPage,"nextPage")

    //맨 첫 페이지
    if (curPage > 1 && pageLimit < curPage) {
        pageUrl += "<li class='page-item'><a class='first_page' href='javascript:" + funName + "(1);'><i class='fa fa-angle-double-left' /></a></li>";
    }
    //이전 페이지
    if (curPage > pageLimit) {
        pageUrl += "<li class='page-item'><a class='prev_page' href='javascript:" + funName + "(" + (startPage == 1 ? 1 : startPage - 1) + ");'><i class='fa fa-angle-left' /></a></li>";
    }
    //~pageLimit 맞게 페이지 수 보여줌
    for (var i = startPage; i <= endPage; i++) {
        //현재페이지면 진하게 표시
        if (i === curPage) {
            pageUrl += "<li class='page-item active'><a>" + i + "</a>";
        } else {
            pageUrl += "<li class='page-item'><a href='javascript:" + funName + "(" + i + ");'> " + i + " </a></li>";
        }
    }
    //다음 페이지
    if (nextPage <= totalPages) {
        pageUrl += "<li class='page-item'><a class='next_page' href='javascript:" + funName + "(" + (nextPage < totalPages ? nextPage : totalPages) + ");'><i class='fa fa-angle-right' /></a></li>";
    }
    //맨 마지막 페이지
    if (curPage < totalPages && nextPage < totalPages) {
        pageUrl += "<li class='page-item'><a class='last_page' href='javascript:" + funName + "(" + totalPages + ");'><i class='fa fa-angle-double-right' /></a></li>";
    }

    // console.log(pageUrl);

    return pageUrl;
}

function noReqCommentMessage() {
    var $chatMessages = $('#chat_messages');
    $chatMessages.empty();

    var $noDataHtml = $(`<p style="width: 100%; text-align: center; font-size: 20px; margin-top: 40px;">
                                            등록된 글이 없습니다.
                                         </p>`);
    $chatMessages.append($noDataHtml);
}

function createReqCommentList(comment) {
    var c_id = comment.c_id;
    var sender = comment.c_req_comment_sender;
    var date = dateFormat(comment.c_req_comment_date);
    var title = comment.c_title;
    var req_comment_contents = comment.c_req_comment_contents.replace(/\n/g, '<br>');
    var contents = `<p id="contents">` + req_comment_contents +`</p>`;
    var $newHtml;

    /* 로그인한 사용자 일 경우 우측으로 아닐 경우 좌측으로 보이게 하기 */
    var iconPosition = (sender !== userName) ? 'left' : 'right';
    var position = (sender !== userName) ? '' : 'on-left';
    var personIcon = (sender !== userName) ? 'bi-person-fill' : 'bi-person';
    var buttonsHtml = '';

    if (sender === userName) {
        buttonsHtml = `<div class="dropdown">
                                            <button class="dropdown-button"><i class="fa fa-ellipsis-v"></i></button>
                                            <div class="dropdown-content">
                                                <button id="req_comment_edit_btn" class="chat-btn edit-chat-btn">
                                                    <div style="width:40px; vertical-align: middle; display: inline-block;"><i style="float: left; " class="fa fa-edit"></i></div>
                                                    <div style="display: inline-block;">수정</div>
                                                </button>
                                                <button id="req_comment_delete_btn" class="chat-btn delete-chat-btn" value="${c_id}">
                                                    <div style="width:40px; vertical-align: middle; display: inline-block;"><i style="float: left; " class="fa fa-trash-o"></i></div>
                                                    <div style="display: inline-block;">삭제</div>
                                                </button>
                                            </div>
                                        </div>`;
    }

    $newHtml = $(`<div class="chat-message">
                                    <div class="sender pull-${iconPosition}">
                                        <div class="icon">
                                            <i class="bi ${personIcon}" style="font-size: 40px"></i>
                                        </div>
                                    </div>
                                    <div class="chat-message-body ${position}">
                                        ${buttonsHtml}
                                        <span class="arrow"></span>
                                        <div class="sender">
                                            ${(position === "on-left") ? `<span class="write-time">${date}&nbsp;&nbsp;&nbsp;\t</span>` : ''}
                                            <span href="#" class="user-id">${sender}</span>
                                            ${(position === "") ? `<span class="write-time">&nbsp;&nbsp;&nbsp;${date}</span>` : ''}
                                        </div>
                                        <div class="text">
                                            ${contents}
                                        </div>
                                        <div class="edit-comment" style="display: none;">
                                            <textarea class="edit-text form-control"></textarea>
                                            <div style="text-align: right;">
                                                <button class="mt-2 btn btn-default btn-sm edit-save-button" value="${c_id}">저장</button>
                                                <button class="mt-2 btn btn-default btn-sm cancel-button">취소</button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>`);

    return $newHtml;
}

function reqCommentRegisterEventHandlers() {
    $('.edit-chat-btn').on('click', handleEditClick);
    $('.delete-chat-btn').on('click', handleDeleteClick);
    $('.cancel-button').on('click', handleCancelClick);
    $('.edit-save-button').on('click', handleSaveClick);
}

function handleEditClick(e){
    var parentDiv = $(this).closest('.chat-message-body');
    var commentText = parentDiv.find('#contents').html();
    commentText = commentText.replace(/<br>/g, "\n");

    parentDiv.find('.edit-text').val(commentText);
    parentDiv.find('#contents').hide();
    parentDiv.find('.dropdown-button').hide();
    parentDiv.find('.dropdown-content').addClass('hide');
    parentDiv.find('.edit-comment').show();

    $('.edit-text').on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

function handleDeleteClick(e){
    var c_id = $(this).val();
    req_comment_delete_btn_click(c_id);
}

function handleCancelClick(e){
    var commentDiv = $(this).closest('.chat-message-body');
    commentDiv.find('#contents').show();
    commentDiv.find('.dropdown-button').show();
    commentDiv.find('.dropdown-content').removeClass('hide');
    commentDiv.find('.edit-comment').hide();
}

function handleSaveClick(e){
    var c_id = $(this).val();
    var editText = $(this).closest('.edit-comment');
    var commentText = editText.find('.edit-text').val();

    req_comment_edit_btn_click(c_id, commentText);
}

function req_comment_save_btn_click() {
    addReqComment();
}

function addReqComment() {
    $('#req_comment_save_btn').on('click', function(e){
        var content = $('#comment-contents').val();
        if (content === null || content === '') {
            alert("질문을 작성 후 등록해주세요.");
            return;
        }

        var urlParams = new URL(location.href).searchParams;
        var selectedPdService = urlParams.get('pdService');
        var selectedPdServiceVersion = urlParams.get('pdServiceVersion');
        selectedJsTreeId = urlParams.get('reqAdd');

        $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
        $.ajax({
            url: "/auth-user/api/arms/reqComment/addReqComment.do",
            type: "POST",
            data: {
                ref: 2,
                c_pdservice_link: selectedPdService,
                c_req_link: selectedJsTreeId,
                c_type: "default",
                c_req_comment_sender: userName,
                c_req_comment_contents: content
            },
            statusCode: {
                200: function () {
                    //모달 팝업 끝내고
                    jSuccess("등록 되었습니다.");
                    $('#comment-contents').val('');
                    getTotalCount();
                    getReqCommentList(1);
                    //데이터 테이블 데이터 재 로드
                }
            },
            beforeSend: function () {
            },
            complete: function () {
            },
            error: function (e) {
                jError("신규 게시물 등록 중 에러가 발생했습니다.");
            }
        });
    });
}

function req_comment_edit_btn_click(c_id, commentText) {
    if (confirm("해당 글을 수정하시겠습니까?")) {
        console.log("edit : " + c_id + "\ncontents : " + commentText);
        var urlParams = new URL(location.href).searchParams;
        var selectedPdService = urlParams.get('pdService');
        selectedJsTreeId = urlParams.get('reqAdd');
        console.log("edit : " + c_id);

        var content = commentText;
        if (content === null || content === '') {
            alert("질문을 작성 후 수정해주세요.");
            return;
        }

        $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
        $.ajax({
            url: "/auth-user/api/arms/reqComment/updateNode.do",
            type: "PUT",
            data: {
                c_id: c_id,
                c_req_comment_contents: commentText
            },
            statusCode: {
                200: function () {
                    //모달 팝업 끝내고
                    jSuccess("수정 되었습니다.");
                    getTotalCount();
                    getReqCommentList(1);
                }
            },
            beforeSend: function () {
            },
            complete: function () {
            },
            error: function (e) {
                jError("신규 게시물 등록 중 에러가 발생했습니다.");
            }
        });
    }
}

function req_comment_delete_btn_click(c_id) {
    if (confirm("해당 글을 삭제하시겠습니까?")) {
        console.log("delete : " + c_id);
        $(".spinner").html("<i class=\"fa fa-spinner fa-spin\"></i> 데이터를 로드 중입니다...");
        $.ajax({
            url: "/auth-user/api/arms/reqComment/removeNode.do",
            type: "DELETE",
            data: {
                c_id: c_id
            },
            statusCode: {
                200: function () {
                    //모달 팝업 끝내고
                    jSuccess("삭제 되었습니다.");
                    $('#comment-contents').val('');
                    getTotalCount();
                    getReqCommentList(1);
                }
            },
            beforeSend: function () {
            },
            complete: function () {
            },
            error: function (e) {
                jError("게시물 삭제 중 에러가 발생했습니다.");
            }
        });
    }
}

function req_comment_message_size_change() {
    $('#comment-contents').on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// 요구사항 전체목록 디자인 변경 관련한 메소드들
async function req_list_load() {
    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');
    var tableName = "T_ARMS_REQADD_" + selectedPdService;

    try {
        // AJAX 요청을 Promise 형태로 변환
        const response = await $.ajax({
            url: "/auth-user/api/arms/reqAdd/" + tableName + "/getMonitor.do",
            type: "GET",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true
        });

        // 결과 c_left 기반 정렬
        response.sort(function(a, b) {
            return a.c_left - b.c_left;
        });

        // 전역 변수에 데이터 저장
        reqTreeList = response;

    } catch (error) {
        console.error("AJAX 요청 실패:", error);
    }
}

function set_req_list_view() {
    $(".dd-list").empty();
    $(".dd").slimscroll({
        height: "720px"
    });

    reqTreeList.sort(function(a, b) {
        return a.c_left - b.c_left;
    });
    var data = reqTreeList;

    console.log (data);

    var firstBranchChecker = true;
    $.each(data, function (key, value) {
        console.log("key : " + key + "\nvalue : " + value);
        if (value.c_contents == null || value.c_contents == "null") {
            value.c_contents = "";
        }

        console.log(value.c_id + "=" + value.c_type + "=" + value.c_title + "//" + value.c_parentid);

        var iconHtml;
        if (value.c_type == "root" || value.c_type == "drive") {
            iconHtml = "<i class='fa fa-clipboard'></i>";
        } else if (value.c_type == "folder") {
            iconHtml = "<i class='fa fa-files-o'></i>";
        } else {
            iconHtml = "<i class='fa fa-file-text-o'></i>";
        }

        if (value.c_type == "root") {
            console.log("ROOT 노드는 처리하지 않습니다.");
        } else if (value.c_type == "drive" || value.c_type == "folder") {
            if (firstBranchChecker) {
                $(".dd-list").append(
                    "<li class='dd-item' id='" +
                    "T_ARMS_REQ_" +
                    value.c_id +
                    "' data-id='" +
                    value.c_id +
                    "'>" +
                    "<div class='dd-handle'>" +
                    iconHtml +
                    " " +
                    value.c_title +
                    "</div>" +
                    "</li>"
                );
                firstBranchChecker = false;
            } else {
                $("#T_ARMS_REQ_" + value.c_parentid).append(
                    "<ol class='dd-list'>" +
                    "<li class='dd-item' id='" +
                    "T_ARMS_REQ_" +
                    value.c_id +
                    "' data-id='" +
                    value.c_id +
                    "'>" +
                    "<div class='dd-handle'>" +
                    iconHtml +
                    " " +
                    value.c_title +
                    "</div>" +
                    "</li>" +
                    "</ol>"
                );
            }
        } else {
            $("#T_ARMS_REQ_" + value.c_parentid).append(
                "<ol class='dd-list'>" +
                "<li class='dd-item' id='" +
                "T_ARMS_REQ_" +
                value.c_id +
                "' data-id='" +
                value.c_id +
                "'>" +
                "<div class='dd-handle'>" +
                iconHtml +
                " " +
                value.c_title +
                "</div>" +
                "</li>" +
                "</ol>"
            );
        }


    });

    $('.dd-handle').on('click', function() {
        var dataId = $(this).closest('.dd-list').data('id');
        console.log(dataId);  // 콘솔에 data-id 값 출력
    });
}

function set_req_list_button() {
    $('.dd-item').each(function() {
        if ($(this).children('ol').length > 0) {
            $(this).prepend('<button data-action="collapse" type="button" class="collapseBtn"  style="display: block;">Collapse</button>' +
                '<button data-action="expand" type="button" class="expandBtn" style="display: none;">Expand</button>');
        }
    });

    collapse_or_expand_button_click();
}

function collapse_or_expand_button_click() {
    $('.collapseBtn').on('click', collapse_button_click_event);
    $('.expandBtn').on('click', expand_button_click_event);

}

function collapse_button_click_event(e){
    var parentDiv = $(this).closest('.dd-list');
    parentDiv.find('.dd-list').css('display', 'none');
    parentDiv.find('.collapseBtn').css('display', 'none');
    parentDiv.find('.expandBtn').css('display', 'block');
}

function expand_button_click_event(e){
    var parentDiv = $(this).closest('.dd-list');
    parentDiv.find('.dd-list').css('display', 'block');
    parentDiv.find('.collapseBtn').css('display', 'block');
    parentDiv.find('.expandBtn').css('display', 'none');
}
