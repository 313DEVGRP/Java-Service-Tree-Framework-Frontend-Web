var selectId; // 제품 아이디
var selectName; // 제품 이름
var dataTableRef; // 데이터테이블 참조 변수
var selected_alm_server_id;
var selected_alm_server_name;
var req_state_data = {
    "10": "열림",
    "11": "진행중",
    "12": "해결됨",
    "13": "닫힘"
};

const reqStateToIconMapping = {     // 요구사항 상태에 아이콘 매핑
    "10": '<i class="fa fa-folder-o text-danger"></i>',
    "11": '<i class="fa fa-fire" style="color: #E49400;"></i>',
    "12": '<i class="fa fa-fire-extinguisher text-success"></i>',
    "13": '<i class="fa fa-folder text-primary"></i>'
};

let boardData = Object.keys(req_state_data).map(state => ({ // 기본 보드 데이터
    id: req_state_data[state],
    title: `${reqStateToIconMapping[state]} ${req_state_data[state]}`
}));

const reqKanbanTg = new tourguide.TourGuideClient({           // 상세 정보 투어 가이드
    exitOnClickOutside: true,
    autoScroll: false,
    hidePrev: true,
    hideNext: true,
    showStepDots: false,
    showStepProgress: false
});

////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {
    let pluginGroups = [
        [
            "../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
            "../reference/light-blue/lib/jquery.iframe-transport.js",
            "../reference/light-blue/lib/jquery.fileupload.js",
            "../reference/light-blue/lib/jquery.fileupload-fp.js",
            "../reference/light-blue/lib/jquery.fileupload-ui.js"
        ],

        [
            "../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
            "../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
            "../reference/light-blue/lib/bootstrap-datepicker.js",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js"
        ],

        [
            "../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
            "../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
            "../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js",
            "../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
        ],
        [
            "../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"
        ],
        [
            // 칸반 보드
            "../reference/jquery-plugins/jkanban-1.3.1/dist/jkanban.min.css",
            "../reference/jquery-plugins/jkanban-1.3.1/dist/jkanban.min.js",
            "../arms/js/reqKanban/kanban.js"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function () {
            //사이드 메뉴 처리
            $(".widget").widgster();
            setSideMenu("sidebar_menu_jira", "sidebar_menu_product_mapping");

            // --- 에디터 설정 --- //
            var waitCKEDITOR = setInterval(function () {
                try {
                    if (window.CKEDITOR) {
                        if (window.CKEDITOR.status === "loaded") {
                            CKEDITOR.replace("popup_view_state_description_editor", { skin: "office2013" });
                            clearInterval(waitCKEDITOR);
                        }
                    }
                } catch (err) {
                    console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
                }
            }, 313 /*milli*/);

            // 칸반 보드 초기화
            initKanban();
            setKanban();

            state_category_tab_group_click_event();
            save_req_state_btn_click();
            update_req_state_btn_click();
            delete_req_state_btn_click();

            $(window).resize(function() {
                adjustHeight();
            });

            // 검색
            $("#kanban_search").on("input", function () {
                let searchText = $(this).val().toLowerCase();
                // console.log("검색: " + searchText);

                $('.kanban-item').each(function() {
                    let itemText = $(this).find('.req_item').text().toLowerCase();
                    if (itemText.indexOf(searchText) !== -1) {
                        $(this).removeClass('hidden');
                    } else {
                        $(this).addClass('hidden');
                    }
                });

                if ($(this).val().length > 0) {
                    $('.kanban_search_clear').show();
                } else {
                    $('.kanban_search_clear').hide();
                }
            });

            $('.kanban_search_clear').click(function() {
                $('#kanban_search').val('').focus();
                $('.kanban-item').removeClass('hidden');
                $(this).hide();
            });

            //ALM 서버 셀렉트 박스 이니시에이터
            // make_alm_server_select_box();
        })
        .catch(function (e) {
            console.error("플러그인 로드 중 오류 발생");
            console.error(e);
        });
}

function setKanban() {
    $.ajax({
        url: "/auth-user/api/arms/reqState/getNodesWithoutRoot.do",
        type: "GET",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                console.log(data.result);
                // 요구사항 상태 별 리스트
                const reqListByState = data.result.reduce((reqList, item) => {
                    const state = (item && item.c_etc) || "상태 정보 없음";

                    // 해당 상태의 리스트가 없으면 초기화
                    if (!reqList[state]) {
                        reqList[state] = [];
                    }

                    // 현재 상태에 해당하는 리스트에 아이템 추가
                    reqList[state].push({
                        id: item.c_id,
                        title: `<span class="req_item">${item.c_title}</span>
                            <i class="fa fa-ellipsis-h show-info" data-id="${item.c_id}"></i>`,
                        info: {
                            reqSummary: item.c_title
                        },
                        data: item
                    });

                    return reqList;
                }, {});
                console.log(reqListByState);

                const reqBoardByState = Object.keys(req_state_data).map(state => ({
                    id: state,                                                          // 상태 카테고리 ID
                    title: `${reqStateToIconMapping[state]} ${req_state_data[state]}`,  // 상태 카테고리 이름
                    item: reqListByState[state]                                         // 상태 카테고리별 상태 목록
                }));


                // 칸반 보드 로드
                loadKanban(reqListByState, reqBoardByState);

                // 높이 조정
                adjustHeight();
            }
        },
        error: function (e) {
            jError("요구사항 조회 중 에러가 발생했습니다.");
        }
    });
}

function loadKanban(reqListByState, reqBoardByState) {

    $("#myKanban").empty();

    let kanban = new jKanban({
        element : '#myKanban',
        gutter  : '15px',
        responsivePercentage: true,
        dragBoards: false,
        boards  : reqBoardByState,
        dropEl: function (el, target, source) {

            // 보드 변경
            let reqId = el.dataset.eid;
            let reqTitle = el.innerText;
            let state = source.parentNode.dataset.id;
            let changeState = target.parentNode.dataset.id;

            console.log(reqId);
            console.log(changeState);

            console.log('[ reqKanban :: loadKanban ] :: 보드 이동', {
                element: el.dataset,
                fromBoard: state,
                toBoard: changeState
            });

            // 요구사항 상태 변경
            let reqData = {
                c_id: reqId,
                c_etc: changeState,
            };
            $.ajax({
                url: "/auth-user/api/arms/reqState/updateNode.do",
                type: "put",
                data: reqData,
                statusCode: {
                    200: function () {
                        console.log("[ reqKanban :: loadKanban ] :: 요구사항 상태 변경 -> ", changeState);
                        jSuccess('"' + reqTitle + '"' + " 상태 카테고리가 변경되었습니다.");
                    }
                }
            });
        }
    });
    jSuccess("보드가 로드 되었습니다.");

    // 상세 정보 클릭 이벤트
    $(".show-info").on('click', function() {
        const state_id = $(this).data('id');
        $('#my_modal1').modal('show');
        popup_modal('update_popup', state_id);
    });

    // 툴팁
    $('.req_item').hover(function() {

        let reqSummary = $(this).text(); // 요구사항 제목

        // req_item 요소
        let target = $(this);
        let reqItem = target[0].getBoundingClientRect();

        // 툴팁 요소
        let tooltip = $('<div class="req_item_tooltip"></div>')
            .text(reqSummary)
            .appendTo('body')
            .fadeIn('slow');

        let tooltipWidth = tooltip.outerWidth();
        let tooltipHeight = tooltip.outerHeight();

        // 요소의 가운데 아래에 툴팁 위치 설정
        let topPosition = reqItem.bottom + window.scrollY + 5; // 페이지 스크롤을 고려하여 bottom 위치 사용
        let leftPosition = reqItem.left + window.scrollX + (target.outerWidth() - tooltipWidth) / 2; // 요소의 가운데 정렬
        if (leftPosition < 0) {
            leftPosition = 0; // 화면 왼쪽을 넘지 않도록 보정
        }
        tooltip.css({top: topPosition + 'px', left: leftPosition + 'px'});

    }, function() {
        // 툴팁 제거
        $('.req_item_tooltip').fadeOut('fast', function() {
            $(this).remove();
        });
    }).mousemove(function(e) {
        // 마우스 위치에 따라 툴팁 위치 조정
        /*$('.req_item_tooltip')
            .css({top: e.pageY + 20 + 'px', left: e.pageX - 20 + 'px'});*/
    });
}

function adjustHeight() {
    // 높이 조정
    $('.kanban_board').height(350);

    let sidebarHeight = 350;
    $('.kanban-drag').each(function() {
        this.style.setProperty('height', `calc(${sidebarHeight}px - 181px)`, 'important');
    });
}

function initKanban() {
    KanbanBoard.init('myKanban', boardData);
    adjustHeight();
}

function state_category_tab_group_click_event() {
    $('ul[data-group="state_category_tab_group"] a[data-toggle="tab"]').on("shown.bs.tab", function(e) {
        var target = $(e.target).attr("href"); // activated tab

        if (target === "#board") {
            setKanban();
        }
        else if (target === "#table"){
            dataTableLoad();
        }
    });
}


////////////////////////////////////////////////////////////////////////////////////////
// --- 데이터 테이블 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function dataTableLoad() {
    // 데이터 테이블 컬럼 및 열그룹 구성
    var columnList = [
        { name: "c_id", title: "상태 아이디", data: "c_id", visible: false },
        {
            name: "c_title",
            title: "상태 이름",
            data: "c_title",
            render: function (data, type, row, meta) {
                if (type === "display") { //// 렌더링 시 이름을 라벨로 감싸서 표시
                    return '<label style="color: #a4c6ff">' + data + "</label>";
                }

                return data;
            },
            className: "dt-body-left",  // 좌측 정렬
            visible: true
        },
        {
            name: "c_id",
            title: "상태 카테고리",
            data: "c_id",
            render: function (data, type, row, meta) {
                // select 박스의 초기 옵션 설정

                if (type === "display") {
                    if(isEmpty(data)) {
                        return `<div class="no-issueStatus-data${meta.row}" style="white-space: nowrap; text-align: center">
									<input type="radio" name="c_id" value="' + ${row.c_title} + '">
								</div>`;
                    }
                    else {
                        let option_html = `<option data-id="${row.c_id}" data-title="${row.c_title}" value=""></option>`;

                        Object.keys(req_state_data).forEach(key => {
                            let select_html = "";
                            let value = key;
                            let text = req_state_data[key];
                            // 변경할 부분 c_req_state_mapping_link
                            if (Number(value) === Number(row.c_etc)) {
                                select_html = "selected";
                            }

                            option_html += `<option data-id="${row.c_id}" data-title="${row.c_title}" value="${value}" ${select_html}>${text}</option>`;
                        });

                        return 	`<select
									class="select_status_mapping select-block-level chzn-select darkBack"
									tabIndex="-1">
									${option_html}
								</select>`;
                    }
                }
                return data;
            },
            className: "dt-body-left",  // 좌측 정렬
            visible: true
        }
    ];
    var rowsGroupList = [];
    var columnDefList = [];
    var selectList = {};
    var orderList = [[0, "asc"]];
    var buttonList = [
        "copy",
        "excel",
        "print",
        {
            extend: "csv",
            text: "Export csv",
            charset: "utf-8",
            extension: ".csv",
            fieldSeparator: ",",
            fieldBoundary: "",
            bom: true
        },
        {
            extend: "pdfHtml5",
            orientation: "landscape",
            pageSize: "LEGAL"
        }
    ];

    var jquerySelector = "#req_state_table";
    var ajaxUrl = "/auth-user/api/arms/reqState/getNodesWithoutRoot.do";
    var jsonRoot = "result";
    var isServerSide = false;
    console.log("jsonRoot:", jsonRoot);

    dataTableRef = dataTable_build(
        jquerySelector,
        ajaxUrl,
        jsonRoot,
        columnList,
        rowsGroupList,
        columnDefList,
        selectList,
        orderList,
        buttonList,
        isServerSide
    );

    // $(jquerySelector+' tbody').off('click', 'tr');
    // select 박스 및 ajax 적용 코드
    if ($.fn.DataTable.isDataTable(jquerySelector)) {
        // DataTable이 이미 초기화된 경우, draw 이벤트에 콜백 함수 연결
        var table = $(jquerySelector).DataTable();
        table.off('draw').on('draw', function() {
            select_state_mapping_event();
        });
        select_state_mapping_event(); // 페이지가 처음 로드될 때도 적용되도록
    }
    else {
        // 초기화되지 않은 경우 초기화
        var table = $(jquerySelector).DataTable({
            // 다른 DataTable 옵션들
            initComplete: function(settings, json) {
                select_state_mapping_event();
            }
        });

        // 데이터 테이블의 draw 이벤트에 콜백 함수 연결
        table.on('draw', function() {
            select_state_mapping_event();
        });
    }
}

function select_state_mapping_event() {

    // 데이터 테이블 그려진 후 상태 매핑 select2 적용
    $(".chzn-select").each(function () {
        // $(this).select2($(this).data());
        $(this).select2({
            ...$(this).data(),
            minimumResultsForSearch: -1 // 검색 기능 제거
        });
    });

    // slim scroll 적용
    // $(".select_status_mapping").on("select2:open", function () {
    // 	makeSlimScroll(".select2-results__options");
    // });

    $(".select_status_mapping").off("select2:select").on("select2:select", function (e) {

        console.log(e);
        console.log(e.params);
        console.log(e.params.data.element);
        let c_id = $(e.params.data.element).data('id');
        let c_title = $(e.params.data.element).data('title');
        let req_state_category_c_id = $(e.params.data.element).val();
        let req_state_category_c_title = $(e.params.data.element).text();

        // ajax updateNode 호출
        $.ajax({
            url: "/auth-user/api/arms/reqState/updateNode.do",
            type: "put",
            data: { c_id: c_id, c_etc: req_state_category_c_id}, // 변경할 부분 c_req_state_mapping_link
            statusCode: {
                200: function () {
                    jSuccess( c_title + " 상태가 " + req_state_category_c_title + " 카테고리로 지정되었습니다.");
                }
            }
        });
    });
}

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
    console.log(selectedData);
}

function dataTableDrawCallback(tableInfo) {
    $("#" + tableInfo.sInstance)
        .DataTable()
        .columns.adjust()
        .responsive.recalc();
}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(settings, json) {
    console.log(json);
}

///////////////////////////////////
// 팝업 띄울 때, UI 일부 수정되도록
///////////////////////////////////
function popup_modal(popup_type, state_id) {

    $("#popup_view_state_category_div label").removeClass("active");
    $("input[name='popup_view_state_category_options']:checked").prop("checked", false);
    $("#popup_view_state_name").val("");
    CKEDITOR.instances.popup_view_state_description_editor.setData("상태 관련 설명 등을 기록합니다.");

    $("#delete_req_state").addClass("hidden");
    $("#update_req_state").addClass("hidden");
    $("#save_req_state").addClass("hidden");

    if (popup_type === "save_popup") {
        $("#my_modal1_title").text("ARMS 상태 등록 팝업");
        $("#my_modal1_description").text("A-RMS 요구사항의 상태를 등록합니다.");

        // 모달 등록, 수정별 버튼 초기화
        $("#save_req_state").removeClass("hidden");
    }
    else if (popup_type === "update_popup") {
        $("#my_modal1_title").text("ARMS 상태 수정 팝업");
        $("#my_modal1_description").text("A-RMS 요구사항의 상태를 수정합니다.");

        $("#update_req_state").removeClass("hidden");
        $("#delete_req_state").removeClass("hidden");

        $.ajax({
            url: "/auth-user/api/arms/reqState/getNode.do?c_id=" + state_id,
            type: "get",
            statusCode: {
                200: function (data) {
                    console.log(data);

                    $("#popup_view_state_c_id").val(data.c_id);
                    $("#popup_view_state_name").val(data.c_title);
                    CKEDITOR.instances.popup_view_state_description_editor.setData(data.c_contents);
                    let state_category_value = data.c_etc;
                    update_radio_buttons("#popup_view_state_category_div", state_category_value);
                    // jSuccess('"' + reqTitle + '"' + " 상태 카테고리가 변경되었습니다.");
                }
            }
        });
    }
}

function update_radio_buttons(container_selector, value) {
    $(container_selector + " label").removeClass("active");
    $(container_selector + " input[type='radio']:checked").prop("checked", false);

    let radio_buttons = $(container_selector + " input[type='radio']");
    radio_buttons.each(function () {
        if (value && $(this).val() === value) {
            $(this).parent().addClass("active");
            $(this).prop("checked", true);
        }
    });
}

function save_req_state_btn_click() {
    $("#save_req_state").off().click(function() {
        let state_name = $("#popup_view_state_name").val().trim();
        if (!state_name) {
            alert("상태의 이름이 입력되지 않았습니다.");
            return;
        }
        let state_category_value = $("#popup_view_state_category_div input[name='popup_view_state_category_options']:checked").val();
        if (!state_category_value) {
            alert("상태 카테고리가 선택되지 않았습니다.");
            return;
        }
        let state_description = CKEDITOR.instances["popup_view_state_description_editor"].getData();

        let data = {
            ref : 2,
            c_type : "default",
            c_etc : state_category_value,
            c_title : state_name,
            c_contents : state_description
        };

        $.ajax({
            url: "/auth-user/api/arms/reqState/addNode.do",
            type: "POST",
            data: data,
            statusCode: {
                200: function () {
                    jSuccess('"' + state_name + '"' + " 상태가 생성되었습니다.");
                    let active_tab_name = getActiveTab();
                    if (active_tab_name === "#board") {
                        setKanban();
                    }
                    else if (active_tab_name === "#table") {
                        dataTableLoad();
                    }

                    $("#close_modal_popup").trigger("click");
                }
            }
        });
    });
}

function update_req_state_btn_click() {
    $("#update_req_state").off().click(function() {
        let state_name = $("#popup_view_state_name").val().trim();
        if (!state_name) {
            alert("상태의 이름이 입력되지 않았습니다.");
            return;
        }
        let state_category_value = $("#popup_view_state_category_div input[name='popup_view_state_category_options']:checked").val();
        if (!state_category_value) {
            alert("상태 카테고리가 선택되지 않았습니다.");
            return;
        }
        let state_description = CKEDITOR.instances["popup_view_state_description_editor"].getData();

        let data = {
            c_id : $("#popup_view_state_c_id").val(),
            c_etc : state_category_value,
            c_title : state_name,
            c_contents : state_description
        };

        $.ajax({
            url: "/auth-user/api/arms/reqState/updateNode.do",
            type: "PUT",
            data: data,
            statusCode: {
                200: function () {
                    jSuccess('"' + state_name + '"' + " 상태가 수정되었습니다.");
                    let active_tab_name = getActiveTab();
                    if (active_tab_name === "#board") {
                        setKanban();
                    }
                    else if (active_tab_name === "#table") {
                        dataTableLoad();
                    }

                    $("#close_modal_popup").trigger("click");
                }
            }
        });
    });
}

function delete_req_state_btn_click() {
    $("#delete_req_state").off().click(function() {
        let state_name = $("#popup_view_state_name").val().trim();

        let isDelete = confirm(state_name + " 상태를 삭제하시겠습니까?");
        if (!isDelete) {
            return;
        }


        let data = {
            c_id : $("#popup_view_state_c_id").val(),
        };

        $.ajax({
            url: "/auth-user/api/arms/reqState/removeNode.do",
            type: "DELETE",
            data: data,
            statusCode: {
                200: function () {
                    jSuccess('"' + state_name + '"' + " 상태가 삭제되었습니다.");
                    let active_tab_name = getActiveTab();
                    if (active_tab_name === "#board") {
                        setKanban();
                    }
                    else if (active_tab_name === "#table") {
                        dataTableLoad();
                    }

                    $("#close_modal_popup").trigger("click");
                }
            }
        });
    });
}

function getActiveTab() {
    var activeTab = $('ul[data-group="state_category_tab_group"] li.active a[data-toggle="tab"]')[0].hash;
    return activeTab;
}

///////////////////////
// ALM 서버 셀렉트 박스
//////////////////////
/*
function make_alm_server_select_box() {
    //제품 서비스 셀렉트 박스 이니시에이터
    $(".chzn-select").each(function() {
        $(this).select2($(this).data());
    });

    //제품 서비스 셀렉트 박스 데이터 바인딩
    $.ajax({
        url: "/auth-user/api/arms/jiraServerPure/getNodesWithoutRoot.do",
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function(data) {
                console.log(data.result);
                //////////////////////////////////////////////////////////
                for (var k in data.result) {
                    var obj = data.result[k];
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $("#selected_alm_server").append(newOption).trigger("change");
                }
                //////////////////////////////////////////////////////////
                jSuccess("ALM 서버 조회가 완료 되었습니다.");
            }
        },
        error: function (e) {
            jError("ALM 서버 조회 중 에러가 발생했습니다. :: " + e);
        }
    });

    $("#selected_alm_server").on("select2:open", function() {
        //슬림스크롤
        makeSlimScroll(".select2-results__options");
    });

    // --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
    $("#selected_alm_server").on("select2:select", function(e) {
        selected_alm_server_id = $("#selected_alm_server").val();
        selected_alm_server_name = $("#selected_alm_server").select2("data")[0].text;

        $("#select-alm-server").text(selected_alm_server_name);

        build_alm_server_jstree(selected_alm_server_id);
        /!*        let selectedHtml =
                    `<div class="chat-message">
                        <div class="chat-message-body" style="margin-left: 0px !important;">
                            <span class="arrow" style="top: 35% !important;"></span>
                            <span class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 선택된 서버 :  </span>
                            <span class="text" style="color: #a4c6ff;">
                            ` +
                            selected_alm_server_name +
                            `
                            </span>
                        </div>
                    </div>
                    `;
                $("#reqSender").html(selectedHtml); // 선택된 제품(서비스)*!/
    });
} // end make_alm_server_select_box()

function build_alm_server_jstree(selected_alm_server_id) {
    var jQueryElementID = "#alm_server_tree";
    var serviceNameForURL = "/auth-user/api/arms/jiraServer/getNode.do?c_id=" + selected_alm_server_id;

    jstree_build(jQueryElementID, serviceNameForURL);
}

////////////////////////////////////////////////////////////////////////////////////////
// -- jstree build 설정 -- //
////////////////////////////////////////////////////////////////////////////////////////
function jstree_build(jQueryElementID, serviceNameForURL) {
    console.log("mapping :: jsTreeBuild : ( jQueryElementID ) → " + jQueryElementID);
    console.log("mapping :: jsTreeBuild : ( serviceNameForURL ) → " + serviceNameForURL);

    console.log("mapping :: jsTreeBuild : ( href ) → " + $(location).attr("href"));
    console.log("mapping :: jsTreeBuild : ( protocol ) → " + $(location).attr("protocol"));
    console.log("mapping :: jsTreeBuild : ( host ) → " + $(location).attr("host"));
    console.log("mapping :: jsTreeBuild : ( pathname ) → " + $(location).attr("pathname"));
    console.log("mapping :: jsTreeBuild : ( search ) → " + $(location).attr("search"));
    console.log("mapping :: jsTreeBuild : ( hostname ) → " + $(location).attr("hostname"));
    console.log("mapping :: jsTreeBuild : ( port ) → " + $(location).attr("port"));

    $(jQueryElementID)
        .jstree({
            plugins: ["themes", "json_data", "ui", "crrm", "dnd", "search", "types"],
            themes: { theme: ["lightblue4"] },
            json_data: {
                ajax: {
                    url: serviceNameForURL,
                    cache: false,
                    data: function (n) {
                        // the result is fed to the AJAX request `data` option
                        console.log("[ common :: jsTreeBuild ] :: json data load = " + JSON.stringify(n));
                        console.log(n);
                        return {
                            c_id: n.attr ? n.attr("id").replace("node_", "").replace("copy_", "") : 1
                        };
                    },
                    success: function (data) {
                        console.log(data);
                        if (data.c_jira_server_type === "클라우드") {
                            // 자식 노드 추가
                            data.children = [];
                            data.jiraProjectEntities.forEach(item => {
                                let children_item = {
                                    data: [item.c_title],
                                    attr: {id: "node_" + item.c_id, rel: "default"},
                                    parent: "node_"+data.c_id
                                };
                                console.log(children_item);
                                data.children.push(children_item);
                            });
                        }
                        console.log(data);
                        // jSuccess("Product(service) Data Load Complete");
                        $(jQueryElementID).jstree("search", $("#text").val());
                    }
                }
            },
            search: {
                show_only_matches: true,
                search_callback: function (str, node) {
                    return node.data().search(str);
                }
            },
            types: {
                max_depth: -2,
                max_children: -2,
                valid_children: ["default"],
                types: {
                    default: {
                        valid_children: "default",
                        icon: {
                            image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/attibutes.png"
                        }
                    }
                }
            }
        })
        .bind("select_node.jstree", function (event, data) {
            if ($.isFunction(jstree_click)) {
                console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.data('id')" + data.rslt.obj.attr("id"));
                console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.data('rel')" + data.rslt.obj.attr("rel"));
                console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.data('class')" + data.rslt.obj.attr("class"));
                console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.children('a')" + data.rslt.obj.children("a"));
                console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.children('ul')" + data.rslt.obj.children("ul"));
                jstree_click(data.rslt.obj);
            }
        })
        .bind("loaded.jstree", function (event, data) {
            $(jQueryElementID).slimscroll({
                height: "200px"
            });
        });

    $("#mmenu input, #mmenu button").click(function () {
        switch (this.id) {
            case "add_default":
            case "add_folder":
                $(jQueryElementID).jstree("create", null, "last", {
                    attr: {
                        rel: this.id.toString().replace("add_", "")
                    }
                });
                break;
            case "search":
                $(jQueryElementID).jstree("search", document.getElementById("text").value);
                break;
            case "text":
                break;
            default:
                $(jQueryElementID).jstree(this.id);
                break;
        }
    });

    $("#mmenu .form-search").submit(function (event) {
        event.preventDefault();

        $(jQueryElementID).jstree("search", document.getElementById("text").value);
    });

    function mappingStateIcon(key) {
        if (key === "열림") {
            return '<i class="fa fa-folder-o text-danger status-icon"></i>';
        } else if (key === "진행중") {
            return '<i class="fa fa-fire text-danger status-icon" style="color: #E49400;"></i>';
        } else if (key === "해결됨") {
            return '<i class="fa fa-fire-extinguisher text-success status-icon"></i>';
        } else if (key === "닫힘") {
            return '<i class="fa fa-folder text-primary status-icon"></i>';
        }
        return ''; // 기본적으로 빈 문자열 반환
    }
}

function jstree_click(data) {
    console.log(data);
}

$("#text").on("input", function () {
    var searchString = $(this).val();
    $("#alm_server_tree").jstree("search", searchString);
});*/
