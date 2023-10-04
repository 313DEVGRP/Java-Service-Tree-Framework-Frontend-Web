////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedJsTreeId; // 요구사항 아이디
var calledAPIs = {};
var visibilityStatus = {
    '#detail' : false,
    '#version': false,
    '#allreq': false,
    '#files': false,
    '#question': false
};

var iconsMap = {
    'application/vnd.ms-htmlhelp': 'CHM.png',
    'application/vnd.ms-excel': 'XLS.png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX.png',
    'application/vnd.ms-powerpoint': 'PPT.png',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX.png',
    'application/msword': 'DOC.png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX.png',
    'application/pdf': 'PDF.png',
    'application/x-rar-compressed': 'RAR.png',
    'application/zip': 'ZIP.png',
    // 'application/x-gzip': 'ZIP.png',
    'application/x-msdownload': 'DLL.png',
    'application/javascript': 'JS.png',
    'application/x-shockwave-flash': 'SWF.png',
    'application/xml': 'XML.png',
    'application/x-yaml': 'YAML.svg',
    'image/bmp': 'BMP.png',
    'image/gif': 'GIF.png',
    'image/jpeg': 'JPEG.png',
    'image/png': 'PNG.png',
    'image/tiff': 'TIFF.png',
    'image/vnd.dwg': 'DWG.png',
    'text/css': 'CSS.png',
    'text/html': 'HTML.png',
    'text/plain': 'TXT.png',
    'text/richtext': 'RTF.png',
    'text/xml': 'XML.png',
    'text/yaml': 'YAML.svg',
    'text/x-yaml': 'YAML.svg',
    'video/mp4': 'MP4.png',
    'video/mpeg': 'MPEG.png',
    'audio/mpeg': 'MP3.png',
    'audio/x-wav': 'WAV.png',
    // 추가 타입 여기에 추가
    // 'application/java-archive': 'JAR.png',
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
            // 스크롤 반응하여 API 호출 이벤트
            window.addEventListener('scroll', scrollApiFunc);

            // 계정 정보
            getAccountInfo();

            // 메뉴 클릭 이벤트
            menuClick();

            // 상세정보 탭 클릭 이벤트
            reqDetailViewTabClick();

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

            // save_post_btn_click();



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

////////////////////////////////////////////////////////////////////////////////////////
// 요구사항 상세보기 페이지
////////////////////////////////////////////////////////////////////////////////////////

// ------------------ api 호출 여부 확인하기 ------------------ //
function callAPI(apiName) {
    if (calledAPIs[apiName]) {
        console.log("This API has already been called: " + apiName);
        return true;
    }

    return false;
}

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

var scrollApiFunc = function () {
    for (var element in visibilityStatus) {
        if (!visibilityStatus[element] && checkVisible(element)) {
            if(element === "#detail") {
                getDetailViewTab();
            }
            else if(element === "#version") {
                bindDataVersionTab();

                initVersionData();
            }
            else if (element === "#allreq") {
                build_ReqData_By_PdService();
            }
            else if (element === "#files") {
                fileLoadByPdService();
            }
            else if (element === "#question") {
                getReqCommentList();
            }

            visibilityStatus[element] = true;
        }

        // 모든 요소가 로드되면 더이상 이벤트 스크립트가 있을 필요가 없으니 삭제
        if (Object.values(visibilityStatus).every(status => status === true)) {
            window.removeEventListener('scroll', scrollApiFunc);
            break;
        }
    }
};

// ------------------ 계정 정보 ------------------ //
function getAccountInfo() {

    var accountInfo;

    $.ajax({
        url: "/auth-user/me",
        type: "GET",
        timeout: 7313,
        global: false,
        statusCode: {
            200: function (json) {
                accountInfo = json;
                console.log("계정 정보: ", accountInfo);

                name = json.name;
                userName = json.preferred_username;
                userEmail = json.email;

                $("#user-name").html(userName);
                $("#user-name-detail").html(name + ' (' + userName + ')');
                $("#user-email").html(userEmail);
            }
        }
    });

    return accountInfo;
}

// ------------------ 메뉴 클릭 이벤트 ------------------ //
function menuClick() {
    $('.mobile-nav-toggle').click(function (e) {
        $('body').toggleClass('mobile-nav-active');
        $(this).toggleClass('bi-list');
        $(this).toggleClass('bi-x');
    });
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
        $("#detailview_req_pdservice_name").text("");
    } else {
        $("#detailview_req_pdservice_name").text(selectedPdServiceText);
    }

    $("#detailview_req_id").text(selectedJsTreeId);
    $("#detailview_req_name").text(ajaxData.reqAdd_c_title);

    //Version 데이터 바인딩
    if (isEmpty(ajaxData.pdServiceVersion_c_title)) {
        $("#detailview_req_pdservice_version").text("요구사항에 등록된 버전이 없습니다.");
    } else {
        $("#detailview_req_pdservice_version").text(ajaxData.pdServiceVersion_c_title);
    }

    $("#detailview_req_writer").text(ajaxData.reqAdd_c_req_writer);
    $("#detailview_req_write_date").text(new Date(ajaxData.reqAdd_c_req_create_date).toLocaleString());

    if (ajaxData.reqAdd_c_req_reviewer01 == null || ajaxData.reqAdd_c_req_reviewer01 == "none") {
        $("#detailview_req_reviewer01").text("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#detailview_req_reviewer01").text(ajaxData.reqAdd_c_req_reviewer01);
    }
    if (ajaxData.reqAdd_c_req_reviewer02 == null || ajaxData.reqAdd_c_req_reviewer02 == "none") {
        $("#detailview_req_reviewer02").text("2번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer02").text(ajaxData.reqAdd_c_req_reviewer02);
    }
    if (ajaxData.reqAdd_c_req_reviewer03 == null || ajaxData.reqAdd_c_req_reviewer03 == "none") {
        $("#detailview_req_reviewer03").text("3번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer03").text(ajaxData.reqAdd_c_req_reviewer03);
    }
    if (ajaxData.reqAdd_c_req_reviewer04 == null || ajaxData.reqAdd_c_req_reviewer04 == "none") {
        $("#detailview_req_reviewer04").text("4번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer04").text(ajaxData.reqAdd_c_req_reviewer04);
    }
    if (ajaxData.reqAdd_c_req_reviewer05 == null || ajaxData.reqAdd_c_req_reviewer05 == "none") {
        $("#detailview_req_reviewer05").text("5번째 리뷰어(연대책임자) 없음");
    } else {
        $("#detailview_req_reviewer05").text(ajaxData.reqAdd_c_req_reviewer05);
    }
    $("#detailview_req_contents").html(ajaxData.reqAdd_c_req_contents);
}

// ------------------ 버전 상세보기 ------------------ //
function versionDetailViewTabClick() {
    $("#get_version_list").click(function () {
        bindDataVersionTab();

        initVersionData();
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
    $.ajax("/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + selectedPdService).done(function (json) {
        console.log("dataLoad :: success → ", json);

        $("#version-product-name").html(json.c_title);
        $("#version-accordion").jsonMenu(selectedPdServiceVersion, json.pdServiceVersionEntities, { speed: 5000 });

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
        element[0].style.background = "rgba(241, 240, 71, 0.3)";

        versionClick(element[0], c_id);
    };
}

function versionClick(element, c_id) {
    console.log("versionClick:: c_id  -> ", c_id);
    $("a[name='versionLink_List']").each(function () {
        this.style.background = "";
    });
    element.style.background = "rgba(241, 240, 71, 0.3)";
    console.log(element);

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
            $("#version-name").text(json.c_title);
            $("#version-start-date").text(json.c_pds_version_start_date);
            $("#version-end-date").text(json.c_pds_version_end_date);
            $("#version-desc").slimscroll({
                height: "500px"
            });
            $("#version-desc").html(json.c_pds_version_contents);
        })
        // HTTP 요청이 실패하면 오류와 상태에 관한 정보가 fail() 메소드로 전달됨.
        .fail(function (xhr, status, errorThrown) {
            console.log(xhr + status + errorThrown);
        })
        //
        .always(function (xhr, status) {
            jSuccess("버전 상세 정보 조회가 완료 되었습니다.");
            console.log(xhr + status);
        });
}

// ------------------ 제품의 요구사항 전체 목록 보기 ------------------ //
function allReqListViewTabClick() {
    $("#get_req_list").click(function () {
        build_ReqData_By_PdService();
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
    jsTreeBuild(jQueryElementID, serviceNameForURL);
    calledAPIs["allReqListAPI"] = true;


}


/*
수정 - 김찬호
작성일 - 0929
트리에서 해당 요구사항 클릭시 해당 요구사항 아이디 조회
*/
function jsTreeClick(selectedNode) {

    console.log("[ reqAdd :: jsTreeClick ] :: selectedNode ");

    selectedJsTreeId = selectedNode.attr("id").replace("node_", "").replace("copy_", "");//요구사항 아이디
    selectedJsTreeName = $("#req_tree").jstree("get_selected").text();

    if (selectedJsTreeId == 2) {
        $("#select_Req").text("루트 요구사항이 선택되었습니다.");
    } else {
        $("#select_Req").text($("#req_tree").jstree("get_selected").text());
    }
    var selectRel = selectedNode.attr("rel");

    //요구사항 타입에 따라서 탭의 설정을 변경 (삭제예정)
    if (selectRel == "folder" || selectRel == "drive") {
        /*$("#folder_tab").get(0).click();
        $(".newReqDiv").show();
        $(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").show(); //상세보기
        $(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //리스트보기
        $(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").show(); //문서로보기
        */
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

    //console.table(ajaxData);
    var version_id_list = JSON.parse(ajaxData.c_req_pdservice_versionset_link);
    var version_title_list = [];

    if (isEmpty(version_id_list)) {
        $("#allreq_pdservice_version").text("요구사항에 등록된 버전이 없습니다.");
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
                $("#allreq_pdservice_version").text(titles[titles.length-1]);
                $("#allreq_pdservice_version_list").text(titles.join(", "));
            })
            .catch(function(error) {
                console.error(error);
            });
    }

    $("#allreq_pdservice_name").text(ajaxData.pdServiceEntity.c_title); // 요구사항 제품(서비스)

    $("#allreq_pdservice_id").text(ajaxData.c_id);                // 요구사항 아이디
    $("#allreq_pdservice_title").text(ajaxData.c_title);             // 요구사항 제목
    $("#allreq_pdservice_writer").text(ajaxData.c_req_writer);       // 요구사항 작성자
    $("#allreq_pdservice_date").text(new Date(ajaxData.c_req_create_date).toLocaleString());   // 요구사항 최근 작성일


    if (ajaxData.c_req_reviewer01 == null || ajaxData.c_req_reviewer01 == "none") {
        $("#allreq_pdservice_reviewer01").text("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer01").text(ajaxData.c_req_reviewer01);
    }
    if (ajaxData.c_req_reviewer02 == null || ajaxData.c_req_reviewer02 == "none") {
        $("#allreq_pdservice_reviewer02").text("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer02").text(ajaxData.c_req_reviewer02);
    }
    if (ajaxData.c_req_reviewer03 == null || ajaxData.c_req_reviewer03 == "none") {
        $("#allreq_pdservice_reviewer03").text("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer03").text(ajaxData.c_req_reviewer03);
    }
    if (ajaxData.c_req_reviewer04 == null || ajaxData.c_req_reviewer04 == "none") {
        $("#allreq_pdservice_reviewer04").text("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer04").text(ajaxData.c_req_reviewer04);
    }
    if (ajaxData.c_req_reviewer05 == null || ajaxData.c_req_reviewer05 == "none") {
        $("#allreq_pdservice_reviewer05").text("리뷰어(연대책임자)가 존재하지 않습니다.");
    } else {
        $("#allreq_pdservice_reviewer05").text(ajaxData.c_req_reviewer05);
    }

    $("#allreq_pdservice_content").html(ajaxData.c_req_contents);       // 요구사항 내용
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
    $.ajax({
        url: "/auth-user/api/arms/fileRepository/getFilesByNode.do",
        data: {fileIdLink: selectedPdService},
        async: false,
        dataType: "json"
    }).done(function (result) {
        console.log(result.files);
        let $portfolioContainer = $('.portfolio-container');
        if ($portfolioContainer.length) {
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
                        } else if (file.contentType.includes("application")) {
                            filterClass = 'filter-doc';
                        } else {
                            filterClass = 'filter-etc';
                        }

                        var iconFileName = iconsMap[file.contentType] || 'Default.png';
                        var imgSrc = "./img/fileIconPack/" + iconFileName; // 이미지 경로
                        var title = file.fileName;
                        var downloadUrl = file.url;
                        var thumbnailUrl = file.thumbnailUrl;
                        var fileSize = formatBytes(file.size, 3);
                        // var fileSize = file.size;
                        /*
                                                var imageLinkHtml = file.contentType.includes("image") ? `<a href="${thumbnailUrl}" data-gallery="portfolioGallery" class="portfolio-lightbox" title="${title}"><i class="bx bx-plus"></i></a>` : '';
                        */
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

        calledAPIs["fileAPI"] = true;
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
        getReqCommentList();
    });
}

function getReqCommentList() {
    console.log("ReqList Tab ::::");
    if (callAPI("reqCommentListAPI")) {
        return;
    }
    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');
    var selectedPdServiceVersion = urlParams.get('pdServiceVersion');
    selectedJsTreeId = urlParams.get('reqAdd');

    $.ajax({
        url: "/auth-user/api/arms/reqComment/getReqCommentList.do",
        type: "GET",
        data: {
            c_pdservice_link: selectedPdService,
            c_version_link: selectedPdServiceVersion,
            c_req_link: selectedJsTreeId
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        statusCode: {
            200: function (data) {
                //모달 팝업 끝내고
                var $chatMessages = $('#chat_messages');

                console.log(data.response);
                for (var k in data.response) {
                    var comment = data.response[k];

                    console.log(comment);
                    // var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    // $("#selected_pdService").append(newOption).trigger("change");
                    var sender = comment.c_req_comment_sender;
                    var date = comment.c_req_comment_date;
                    var title = comment.c_title;
                    var contents = comment.c_req_comment_contents;
                    var $newHtml;
                    /* 로그인한 사용자 일 경우 우측으로 아닐 경우 좌측으로 보이게 하기 */
                    if (sender !== 'kch') {
                        $newHtml = $(`<div class="chat-message">
                                            <div class="sender pull-left">
                                                <div class="icon">
                                                    <i class="bi bi-person-fill" style="font-size: 40px"></i>
                                                </div>
                                            </div>
                                            <div class="chat-message-body">
                                                <span class="arrow"></span>
                                                <div class="sender">
                                                    <span class="user-id">${sender}</span>
                                                    <span class="write-time">&nbsp;&nbsp;&nbsp;${date}</span>
                                                </div>
                                                <div class="text">
                                                   ${title}
                                                </div>
                                            </div>
                                       </div>`);
                    }
                    else {
                        $newHtml = $(`<div class="chat-message">
                                        <div class="sender pull-right">
                                            <div class="icon">
                                                <i class="bi bi-person" style="font-size: 40px"></i>
                                            </div>
                                        </div>
                                        <div class="chat-message-body on-left">
                                            <span class="arrow"></span>
                                            <div class="sender">
                                                <span class="write-time">${date}&nbsp;&nbsp;&nbsp;\t</span>
                                                <span href="#" class="user-id">${sender}</span>
                                            </div>
                                            <div class="text">
                                                ${title}
                                                <div>
                                                    <button class="chat-btn edit-chat-btn">수정하기</button>
                                                    <button class="chat-btn delete-chat-btn">삭제하기</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`);
                    }

                    $chatMessages.append($newHtml);
                }
                // $("#close_pdservice").trigger("click");
                //데이터 테이블 데이터 재 로드
                calledAPIs["reqCommentListAPI"] = true;
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

function save_post_btn_click() {
    $("#save_req_comment_btn").click(function () {

        var urlParams = new URL(location.href).searchParams;
        var selectedPdService = urlParams.get('pdService');
        var selectedPdServiceVersion = urlParams.get('pdServiceVersion');
        selectedJsTreeId = urlParams.get('reqAdd');

        const cTitle = "";

        $.ajax({
            url: "/auth-user/api/arms/reqComment/addReqCommentNode.do",
            type: "POST",
            data: {
                ref: 2,
                c_pdservice_link: selectedPdService,
                c_version_link: selectedPdServiceVersion,
                c_req_link: selectedJsTreeId,
                c_type: "default",
                c_title: cTitle
            },
            statusCode: {
                200: function () {
                    //모달 팝업 끝내고
                    alert("success");
                    $("#close_pdservice").trigger("click");
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