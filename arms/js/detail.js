////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedJsTreeId; // 요구사항 아이디
var calledAPIs = {};
var visibilityStatus = {
    '#version': false,
    '#allreq': false,
    '#files': false,
    '#question': false
};

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
                "../reference/light-blue/lib/jquery.fileupload.js",
                "../reference/light-blue/lib/jquery.fileupload-fp.js",
                "../reference/light-blue/lib/jquery.fileupload-ui.js",
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
            window.addEventListener('scroll', scrollApiFunc);

            getDetailViewTab();

            versionDetailViewTabClick();

            allReqListViewTabClick();

            filesViewTabClick();

            filterClick();

            reqCommentListViewTabClick();

            save_post_btn_click();

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

    calledAPIs[apiName] = true;

    return false;
}

// ------------------ 스크롤 api 호출하기 ------------------ //

function checkVisible( element, check = 'above' ) {
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
    for (let element in visibilityStatus) {
        if (!visibilityStatus[element] && checkVisible(element)) {

            if(element === "#version") {
                bindDataVersionTab();

                init_versionList();
            }
            else if (element === "#allreq") {
                build_ReqData_By_PdService();
            }
            else if (element === "#files") {
                fileLoadByPdService();
            }
            else if (element === "#question") {
                // getReqCommentList();
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

// ------------------ 상세보기 ------------------ //
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
                // ------------------ 상세보기 ------------------ //
                bindDataDetailTab(data);
                //////////////////////////////////////////////////////////
                jSuccess("요구사항 조회가 완료 되었습니다.");
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

        init_versionList();
    });
}

function bindDataVersionTab() {
    console.log("Version Detail View Tab ::::");
    if (callAPI("versionAPI")) {
        return;
    }

    var urlParams = new URL(location.href).searchParams;
    var selectedPdService = urlParams.get('pdService');

    // ajax 처리 후 데이터 바인딩
    console.log("dataLoad :: getSelectedID → " + selectedPdService);
    $.ajax("/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + selectedPdService).done(function (json) {
        console.log("dataLoad :: success → ", json);

        $("#version-product-name").html(json.c_title);
        $("#version-accordion").jsonMenu(json.pdServiceVersionEntities, { speed: 5000 });
    });
}

function init_versionList() {
    let data = ``;

    $.fn.jsonMenu = function (items, options) {
        $(this).addClass("json-menu");

        for (var i = 0; i < items.length; i++) {
            data += `
           <div class="panel">
               <div class="panel-heading">
                   <a class="accordion-toggle"
                            name="versionLink_List"
                            style="color: #a4c6ff; text-decoration: none; cursor: pointer; border-radius: 5px;  
                                   align-items: center; display: flex; justify-content: space-between;"
                            onclick="versionClick(this, ${items[i].c_id});
                            return false;">
                       ${items[i].c_title}
                       <i class="bi bi-chevron-right"></i>
                   </a>
               </div>
           </div>`;
        }

        $(this).html(data);
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
        dataTableLoad(selectedJsTreeId, selectRel);
    } else {
        //이전에 화면에 렌더링된 데이터 초기화
        // 상세데이터 영역 바인딩 start
        setDetailViewTab();
        // defaultType_dataTableLoad(selectedJsTreeId);
    }

    //파일 데이터셋팅
    //get_FileList_By_Req();
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
작성일 - 0929
해당 상세 정보 영역 데이터 바인딩
요구사항 버전 미구현
*/
function bindClickedDataDetail(ajaxData) {

    console.table(ajaxData);

    $("#allreq_pdservice_name").text(ajaxData.pdServiceEntity.c_title); // 요구사항 제품(서비스)

	$("#allreq_pdservice_version").text(); // 요구사항 버전

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
        data: { fileIdLink: selectedPdService },
        dataType: "json"
    }).done(function (result) {
        console.log(result.files);

        for (var key in result) {
            if (result.hasOwnProperty(key)) {
                var fileSet = result[key];

                // 각 파일 정보(fileSet)을 처리
                fileSet.forEach(function(file) {
                    console.log(file.fileName);
                    var $target = $('#filter-files');
                    var filterClass;
                    if (file.contentType.includes("image")) {
                        filterClass = 'filter-image';
                    }
                    else if (file.contentType.includes("application")) {
                        filterClass = 'filter-doc';
                    }
                    else {
                        filterClass = 'filter-etc';
                    }

                    var imgSrc = "../arms/html/armsDetailExceptTemplate/assets/img/portfolio/portfolio-3.jpg"; // 이미지 경로
                    var title = file.fileName;
                    var fileSize = file.size;
                    var newHtml = `<div class="col-lg-4 col-md-6 portfolio-item ${filterClass}">
                                                <div class="portfolio-wrap">
                                                    <img src="${imgSrc}" class="img-fluid" alt="">
                                                    <div class="portfolio-info">
                                                        <h4>${title}</h4>
                                                        <p>${fileSize}</p>
                                                        <div class="portfolio-links">
                                                            <a href="portfolio-details.html" class="portfolio-details-lightbox" data-glightbox="type: external" title="${title}"><i class="bx bx-download"></i></a>
                                                            <a href="${imgSrc}" data-gallery="portfolioGallery" class="portfolio-lightbox" title="${title}"><i class="bx bx-plus"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`;

                    $target.append(newHtml);
                });
            }
        }
        // $(this).fileupload("option", "done").call(this, null, { result: result });
    });

    var portfolioContainer = select(".portfolio-container");
    if (portfolioContainer) {
        var portfolioIsotope = new Isotope(portfolioContainer, {
            itemSelector: ".portfolio-item"
        });

        var portfolioFilters = select("#portfolio-flters li", true);

        portfolioFilters.forEach(function (el) {
            el.classList.remove("filter-active");
        });

        // this.classList.add("filter-active");

        // portfolioIsotope.arrange({
        //     filter: this.getAttribute("data-filter")
        // });

        portfolioIsotope.on("arrangeComplete", function () {
            AOS.refresh();
        });

        portfolioIsotope.reloadItems();
        portfolioIsotope.arrange();
    }
}

function filterClick() {
    $("#portfolio-flters li").click(function () {
        filterChage();
    });
}

function filterChage() {
    let portfolioContainer = select(".portfolio-container");
    if (portfolioContainer) {
        let portfolioIsotope = new Isotope(portfolioContainer, {
            itemSelector: ".portfolio-item"
        });

        let portfolioFilters = select("#portfolio-flters li", true);

        on(
            "click",
            "#portfolio-flters li",
            function (e) {
                e.preventDefault();
                portfolioFilters.forEach(function (el) {
                    el.classList.remove("filter-active");
                });
                this.classList.add("filter-active");

                portfolioIsotope.arrange({
                    filter: this.getAttribute("data-filter")
                });
                portfolioIsotope.on("arrangeComplete", function () {
                    AOS.refresh();
                });

                portfolioIsotope.reloadItems();
                portfolioIsotope.arrange();
            },
            true
        );
    }
}

var select = (el, all = false) => {
    el = el.trim();
    if (all) {
        return [...document.querySelectorAll(el)];
    } else {
        return document.querySelector(el);
    }
};

var on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
        if (all) {
            selectEl.forEach((e) => e.addEventListener(type, listener));
        } else {
            selectEl.addEventListener(type, listener);
        }
    }
};

// ------------------ QnA 게시판보기 ------------------ //
function reqCommentListViewTabClick() {
    $("#get_req_comment_list").click(function () {
        // getReqCommentList();
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
                console.log(data.response);
                for (var k in data.response) {
                    var obj = data.response[k];
                    // console.log(obj);
                    // var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    // $("#selected_pdService").append(newOption).trigger("change");
                }
                // $("#close_pdservice").trigger("click");
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


