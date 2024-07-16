var selectId; // 제품 아이디
var selectName; // 제품 이름
var dataTableRef; // 데이터테이블 참조 변수
var selected_alm_server_id;
var selected_alm_server_name;
var alm_server_list = {};
var arms_state_list;
var req_state_category_list = {
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

let boardData = Object.keys(req_state_category_list).map(state => ({ // 기본 보드 데이터
    id: req_state_category_list[state],
    title: `${reqStateToIconMapping[state]} ${req_state_category_list[state]}`
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
            "../arms/js/reqKanban/kanban.js",
            /*"../reference/jquery-plugins/jquery.flowchart-master/jquery.flowchart.css",
            "../reference/jquery-plugins/jquery.flowchart-master/jquery.flowchart.js",
            "https://cdnjs.cloudflare.com/ajax/libs/jquery.panzoom/3.2.2/jquery.panzoom.min.js",
            "../reference/jquery-plugins/jquery-mousewheel-main/jquery.mousewheel.js",*/
            "../reference/gojs/go-sample.js",
            "../reference/gojs/go-debug.js",
            "../reference/gojs/go.css",
            "../arms/js/mapping/gojs_setup.js"
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
            // initKanban();
            // setKanban();

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
            make_alm_server_select_box();
            // mapping_flow_chart();
            // flow_chart();
            // mapping_flow_chart();

            gojs.init();
        })
        .catch(function (e) {
            console.error("플러그인 로드 중 오류 발생");
            console.error(e);
        });
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

function setKanban() {
    $.ajax({
        url: "/auth-user/api/arms/reqState/getNodesWithoutRoot.do",
        type: "GET",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                arms_state_list = data.result;
                console.log(arms_state_list);

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

                const reqBoardByState = Object.keys(req_state_category_list).map(state => ({
                    id: state,                                                          // 상태 카테고리 ID
                    title: `${reqStateToIconMapping[state]} ${req_state_category_list[state]}`,  // 상태 카테고리 이름
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

    // 상세 정보 클릭 이벤트
    $(".show-info").on('click', function() {
        const state_id = $(this).data('id');;
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
                if (isEmpty(data) || data === "unknown") {
                    return `<div style='color: #808080'>N/A</div>`;
                }

                console.log(row);
                let edit_button_html =  `<button 
                                                    style="border:0; background:rgba(51,51,51,0.425); color:#E49400; vertical-align: middle" 
                                                    onclick="popup_modal('update_popup', ${row.c_id});">
                                                    <i class="fa fa-edit" />
                                                </button>`;

                return `<div style='text-align: left; white-space: nowrap; color: #f8f8f8'>${data} ${edit_button_html}</div>`;
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

                        Object.keys(req_state_category_list).forEach(key => {
                            let select_html = "";
                            let value = key;
                            let text = req_state_category_list[key];
                            // 변경할 부분 c_req_state_mapping_link
                            if (Number(value) === Number(row.c_etc)) {
                                select_html = "selected";
                            }

                            option_html += `<option data-id="${row.c_id}" data-title="${row.c_title}" value="${value}" ${select_html}>${text}</option>`;
                        });

                        return 	`<select
									class="select-state-category-mapping select-block-level chzn-select darkBack"
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
    // $(".select-state-category-mapping").on("select2:open", function () {
    // 	makeSlimScroll(".select2-results__options");
    // });

    $(".select-state-category-mapping").off("select2:select").on("select2:select", function (e) {

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
    $('#my_modal1').modal('show');

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

function flow_chart() {
    var $flowchart = $('#mapping-flow-chart');
    var $container = $flowchart.parent();

    // Apply the plugin on a standard, empty div...
    $flowchart.flowchart({
        data: defaultFlowchartData,
        defaultSelectedLinkColor: '#000055',
        grid: 10,
        multipleLinksOnInput: true,
        multipleLinksOnOutput: true
    });

    function getOperatorData($element) {
        var nbInputs = parseInt($element.data('nb-inputs'), 10);
        var nbOutputs = parseInt($element.data('nb-outputs'), 10);
        var data = {
            properties: {
                title: $element.text(),
                inputs: {},
                outputs: {}
            }
        };

        var i = 0;
        for (i = 0; i < nbInputs; i++) {
            data.properties.inputs['input_' + i] = {
                label: 'Input ' + (i + 1)
            };
        }
        for (i = 0; i < nbOutputs; i++) {
            data.properties.outputs['output_' + i] = {
                label: 'Output ' + (i + 1)
            };
        }

        return data;
    }

    //-----------------------------------------
    //--- operator and link properties
    //--- start
    var $operatorProperties = $('#operator_properties');
    $operatorProperties.hide();
    var $linkProperties = $('#link_properties');
    $linkProperties.hide();
    var $operatorTitle = $('#operator_title');
    var $linkColor = $('#link_color');

    $flowchart.flowchart({
        onOperatorSelect: function(operatorId) {
            $operatorProperties.show();
            $operatorTitle.val($flowchart.flowchart('getOperatorTitle', operatorId));
            return true;
        },
        onOperatorUnselect: function() {
            $operatorProperties.hide();
            return true;
        },
        onLinkSelect: function(linkId) {
            $linkProperties.show();
            $linkColor.val($flowchart.flowchart('getLinkMainColor', linkId));
            return true;
        },
        onLinkUnselect: function() {
            $linkProperties.hide();
            return true;
        }
    });

    $operatorTitle.keyup(function() {
        var selectedOperatorId = $flowchart.flowchart('getSelectedOperatorId');
        if (selectedOperatorId != null) {
            $flowchart.flowchart('setOperatorTitle', selectedOperatorId, $operatorTitle.val());
        }
    });

    $linkColor.change(function() {
        var selectedLinkId = $flowchart.flowchart('getSelectedLinkId');
        if (selectedLinkId != null) {
            $flowchart.flowchart('setLinkMainColor', selectedLinkId, $linkColor.val());
        }
    });
    //--- end
    //--- operator and link properties
    //-----------------------------------------

    //-----------------------------------------
    //--- delete operator / link button
    //--- start
    $flowchart.parent().siblings('.delete_selected_button').click(function() {
        $flowchart.flowchart('deleteSelected');
    });
    //--- end
    //--- delete operator / link button
    //-----------------------------------------



    //-----------------------------------------
    //--- create operator button
    //--- start
    var operatorI = 0;
    $flowchart.parent().siblings('.create_operator').click(function() {
        var operatorId = 'created_operator_' + operatorI;
        var operatorData = {
            top: ($flowchart.height() / 2) - 30,
            left: ($flowchart.width() / 2) - 100 + (operatorI * 10),
            properties: {
                title: 'Operator ' + (operatorI + 3),
                inputs: {
                    input_1: {
                        label: 'Input 1',
                    }
                },
                outputs: {
                    output_1: {
                        label: 'Output 1',
                    }
                }
            }
        };

        operatorI++;

        $flowchart.flowchart('createOperator', operatorId, operatorData);

    });
    //--- end
    //--- create operator button
    //-----------------------------------------




    //-----------------------------------------
    //--- draggable operators
    //--- start
    //var operatorId = 0;
    var $draggableOperators = $('.draggable_operator');
    $draggableOperators.draggable({
        cursor: "move",
        opacity: 0.7,

        // helper: 'clone',
        appendTo: 'body',
        zIndex: 1000,

        helper: function(e) {
            var $this = $(this);
            var data = getOperatorData($this);
            return $flowchart.flowchart('getOperatorElement', data);
        },
        stop: function(e, ui) {
            var $this = $(this);
            var elOffset = ui.offset;
            var containerOffset = $container.offset();
            if (elOffset.left > containerOffset.left &&
                elOffset.top > containerOffset.top &&
                elOffset.left < containerOffset.left + $container.width() &&
                elOffset.top < containerOffset.top + $container.height()) {

                var flowchartOffset = $flowchart.offset();

                var relativeLeft = elOffset.left - flowchartOffset.left;
                var relativeTop = elOffset.top - flowchartOffset.top;

                var positionRatio = $flowchart.flowchart('getPositionRatio');
                relativeLeft /= positionRatio;
                relativeTop /= positionRatio;

                var data = getOperatorData($this);
                data.left = relativeLeft;
                data.top = relativeTop;

                $flowchart.flowchart('addOperator', data);
            }
        }
    });
    //--- end
    //--- draggable operators
    //-----------------------------------------

}

function mapping_flow_chart() {

    $("#state_flow_chart").flowchart();

    // 스타일 적용
    $(".input-operator").css("background-color", "#f0ad4e");
    $(".output-operator").css("background-color", "#5bc0de");

    var $lastEvent = $('#last_event_state_flow_chart');
    var $lastEventContainer = $('#last_event_state_flow_chart_container');

    var $flowchart = $('#state_flow_chart');
    var $container = $("#flow_chart_container");

    var cx = $flowchart.width() / 2;
    var cy = $flowchart.height() / 2;

    // Panzoom initialization...
    $flowchart.panzoom();

    // Centering panzoom
    $flowchart.panzoom('pan', -cx + $container.width() / 2, -cy + $container.height() / 2);

    // Panzoom zoom handling...
    var possibleZooms = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    var currentZoom = 2.5;
    $flowchart.panzoom('zoom', possibleZooms[currentZoom], {
        animate: false
    });

    $container.on('mousewheel.focal', function( e ) {
        e.preventDefault();
        var delta = (e.delta || e.originalEvent.wheelDelta) || e.originalEvent.detail;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        currentZoom = Math.max(0, Math.min(possibleZooms.length - 1, (currentZoom + (zoomOut * 2 - 1))));
        $flowchart.flowchart('setPositionRatio', possibleZooms[currentZoom]);
        $flowchart.panzoom('zoom', possibleZooms[currentZoom], {
            animate: false,
            focal: e
        });
    });

    function showEvent(txt) {
        $lastEvent.text(txt + "\n" + $lastEvent.text());
        $lastEventContainer.effect( "highlight", {color: '#3366ff'}, 500);
    }

    // Apply the plugin on a standard, empty div...
    $flowchart.flowchart({
        defaultOperatorClass: 'flowchart-operator',
        onOperatorSelect: function(operatorId) {
            showEvent('Operator "' + operatorId + '" selected. Title: ' + $flowchart.flowchart('getOperatorTitle', operatorId) + '.');
            return true;
        },
        onOperatorUnselect: function() {
            showEvent('Operator unselected.');
            return true;
        },
        onLinkSelect: function(linkId) {
            showEvent('Link "' + linkId + '" selected. Main color: ' + $flowchart.flowchart('getLinkMainColor', linkId) + '.');
            return true;
        },
        onLinkUnselect: function() {
            showEvent('Link unselected.');
            return true;
        },
        onOperatorCreate: function(operatorId, operatorData, fullElement) {
            showEvent('New operator created. Operator ID: "' + operatorId + '", operator title: "' + operatorData.properties.title + '".');
            return true;
        },
        onLinkCreate: function(linkId, linkData) {
            showEvent('New link created. Link ID: "' + linkId + '", link color: "' + linkData.color + '".');
            return true;
        },
        onOperatorDelete: function(operatorId) {
            showEvent('Operator deleted. Operator ID: "' + operatorId + '", operator title: "' + $flowchart.flowchart('getOperatorTitle', operatorId) + '".');
            return true;
        },
        onLinkDelete: function(linkId, forced) {
            showEvent('Link deleted. Link ID: "' + linkId + '", link color: "' + $flowchart.flowchart('getLinkMainColor', linkId) + '".');
            return true;
        },
        onOperatorMoved: function(operatorId, position) {
            showEvent('Operator moved. Operator ID: "' + operatorId + ', position: ' + JSON.stringify(position) + '.');
        }
    });

    $flowchart.siblings('.delete_selected_button').click(function() {
        $flowchart.flowchart('deleteSelected');
    });

    $(".flowchart-operator").resizable({handles:"se"});
}

function updateFlowchartData(newData) {
    // 새로운 데이터 설정
    let $flowchart = $("#state_flow_chart");
    let $container = $("#flow_chart_container");
    $flowchart.flowchart('setData', newData);
}


///////////////////////
// ALM 서버 셀렉트 박스
//////////////////////
function make_alm_server_select_box() {
    //제품 서비스 셀렉트 박스 이니시에이터
    $(".chzn-select").each(function() {
        $(this).select2($(this).data());
    });

    //ALM 서버 셀렉트 박스 데이터 바인딩
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
                    alm_server_list[obj.c_id] = obj;
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
        $("#cloud_project_tree").hide();
        $("#select-project-div").hide();
        $("#select-project").text("선택되지 않음");
        selected_alm_server_id = $("#selected_alm_server").val();
        selected_alm_server_name = $("#selected_alm_server").select2("data")[0].text;
        $("#select-alm-server").text(selected_alm_server_name);

        let alm_server_data = alm_server_list[selected_alm_server_id];
        let alm_server_type = alm_server_data.c_jira_server_type;
        /*var $flowchart = $('#state_flow_chart');
        $flowchart.flowchart('setData', {});*/

        if (alm_server_type === "클라우드") {
            $("#cloud_project_tree").show();
            $("#select-project-div").show();
            build_alm_server_jstree(selected_alm_server_id);
            let data = {};
            gojs.load(data);
        }
        else {
            mapping_data_load(selected_alm_server_id, alm_server_type);

            //ALM 서버 이슈상태 조회
            /*$.ajax({
                url: "/auth-user/api/arms/jiraServer/getJiraIssueStatus.do?c_id=" + selected_alm_server_id ,
                type: "GET",
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                progress: true,
                statusCode: {
                    200: function(result) {
                        console.log(result.response);
                        let alm_status_list = result.response;

                        var data = {
                            operators: {},
                            links: {}
                        };

                        console.log(alm_status_list);
                        console.log(arms_state_list);
                        let inputData = arms_state_list;
                        let outputData = alm_status_list;

                        let width = $flowchart.width();

                        var topPosition = 20;
                        var leftPositionInput = 20;
                        var leftPositionOutput = width-200;

                        console.log(width);
                        inputData.forEach(function(input, index) {
                            var operatorId = 'operator' + (index + 1);
                            data.operators[operatorId] = {
                                top: topPosition + index * 80,
                                left: leftPositionInput,
                                properties: {
                                    title: "A-RMS - " +input.c_title,
                                    class: 'input-operator',
                                    inputs: {},
                                    outputs: {
                                        output_1: {
                                            label: input.c_title,
                                        }
                                    }
                                }
                            };
                        });
                        outputData.forEach(function(output, index) {
                            var operatorId = 'operator' + (inputData.length + index + 1);
                            data.operators[operatorId] = {
                                top: topPosition + index * 80,
                                left: leftPositionOutput,
                                properties: {
                                    title: "ALM - " + output.c_issue_status_name,
                                    class: 'output-operator',
                                    inputs: {
                                        input_1: {
                                            label: output.c_issue_status_name,
                                        }
                                    },
                                    outputs: {}
                                }
                            };
                        });

                        console.log(data);
                        updateFlowchartData(data);
                        // mapping_flow_chart(alm_status_list, arms_state_list);
                        //////////////////////////////////////////////////////////
                        //////////////////////////////////////////////////////////
                        jSuccess("ALM 서버 상태 조회가 완료 되었습니다.");
                    }
                },
                error: function (e) {
                    jError("ALM 서버 상태 조회 중 에러가 발생했습니다. :: " + e);
                }
            });*/
        }
    });
} // end make_alm_server_select_box()

function mapping_data_load(alm_server_id, alm_server_type, project_id) {
    if (!alm_server_type) {
        alm_server_id = alm_server_id || selected_alm_server_id;

        if (!alm_server_id) {
            alert("선택된 서버가 없습니다.");
            return;
        }

        let alm_server_data = alm_server_list[alm_server_id];
        alm_server_type = alm_server_data.c_jira_server_type;
    }

    if (alm_server_type === "클라우드") {
        if (!project_id) {
            alert("선택된 프로젝트가 없습니다.");
            return;
        }
        else {
            alert("클라우드 지라의 경우 이슈유형 등 설계가 더 필요합니다.");
        }
 /*       if (!project_id) {
            alert("선택된 프로젝트가 없습니다.");
            return;
        }

        Promise.all([get_arms_state_list(), get_project_status_list(project_id)])
            .then(([arms_state_list, alm_status_list]) => {
                // 두 API 호출 결과를 함께 사용합니다.
                console.log('ARMS State List:', arms_state_list);
                console.log('ALM Status List:', alm_status_list);

                if (alm_status_list.length === 0) {
                    alert("선택된 이슈유형이 없습니다. 서버 관리에서 프로젝트의 이슈유형을 선택해주세요.");
                    let data = {};
                    gojs.load(data);
                    return;
                }

                let data = create_gojs_data(req_state_category_list, arms_state_list, alm_status_list);
                // 여기에 두 결과를 함께 사용하는 로직을 추가합니다.
                gojs.load(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });*/
    }
    else {

        Promise.all([get_arms_state_list(), get_alm_status_list(alm_server_id)])
            .then(([arms_state_list, alm_status_list]) => {
                // 두 API 호출 결과를 함께 사용합니다.
                console.log('ARMS State List:', arms_state_list);
                console.log('ALM Status List:', alm_status_list);

                let data = create_gojs_data(req_state_category_list, arms_state_list, alm_status_list);
                // 여기에 두 결과를 함께 사용하는 로직을 추가합니다.
                gojs.load(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }
}

function create_gojs_data(req_state_category_list, arms_state_list, alm_status_list) {
    const node_data_array = generate_node_data(req_state_category_list, arms_state_list, alm_status_list); // 노드 데이터 생성
    console.log(node_data_array);
    const link_data_araay = generate_link_data(node_data_array); // 링크 데이터 생성
    console.log(link_data_araay);

    const diagram_data = {
        class: 'GraphLinksModel',
        nodeDataArray: node_data_array,
        linkDataArray: link_data_araay
    };

    return diagram_data;
}

function generate_node_data(req_state_category_list, arms_state_list, alm_status_list) {
    const node_data_array = [];

    // 카테고리 열림, 진행중, 해결됨, 닫힘 노드 생성
    Object.entries(req_state_category_list).forEach(([key, value], index) => {
        node_data_array.push({
            key: `카테고리 ${value}`,
            text: `카테고리 ${value}`,
            type: 'arms-category',
            c_id: key,
            category: 'Loading',
            loc: `0 ${40 + index * 40}`
        });
    });

    // A-RMS OPEN, PROGRESS, RESOLVED, CLOSED 노드 생성 (NoAdd 카테고리)
    arms_state_list.forEach((state, index) => {
        node_data_array.push({
            key: `A-RMS ${state.c_title}`,
            text: `A-RMS ${state.c_title}`,
            type: 'arms-state',
            c_id: state.c_id,
            mapping_id: status.c_req_state_category_mapping_link,
            category: 'NoAdd',
            loc: `183 ${40 + index * 40}`
        });
    });

    // ALM 열림, 진행중, 해결됨, 닫힘 노드 생성 (End 카테고리)
    alm_status_list.forEach((status, index) => {
        node_data_array.push({
            key: `ALM ${status.c_issue_status_name}`,
            text: `ALM ${status.c_issue_status_name}`,
            type: 'alm-status',
            c_id: status.c_id,
            mapping_id: status.c_req_state_mapping_link,
            category: 'End',
            loc: `366 ${40 + index * 40}`
        });
    });

    // Recycle 노드 추가
    // nodeDataArray.push({
    //     key: -2,
    //     category: 'Recycle',
    //     loc: '600 300'
    // });

    return node_data_array;
}

function generate_link_data(node_data_array) {
    const linkDataArray = [];

    // 링크 데이터 생성
    node_data_array.forEach((node) => {
        switch (node.type) {
            case 'arms-state':
                switch (node.text) {
                    case '카테고리 열림':
                        linkDataArray.push({ from: node.key, to: findNodeKeyByMappingId(node_data_array, 'A-RMS OPEN') });
                        break;
                    case '카테고리 진행중':
                        linkDataArray.push({ from: node.key, to: findNodeKeyByMappingId(node_data_array, 'A-RMS PROGRESS') });
                        break;
                    case '카테고리 해결됨':
                        linkDataArray.push({ from: node.key, to: findNodeKeyByMappingId(node_data_array, 'A-RMS RESOLVED') });
                        break;
                    case '카테고리 닫힘':
                        linkDataArray.push({ from: node.key, to: findNodeKeyByMappingId(node_data_array, 'A-RMS CLOSED') });
                        break;
                }
                break;
            case 'alm-status':
                switch (node.text) {
                    case 'A-RMS OPEN':
                        linkDataArray.push({ from: node.key, to: findNodeKeyByMappingId(node_data_array, 'ALM 열림') });
                        break;
                    case 'A-RMS PROGRESS':
                        linkDataArray.push({ from: node.key, to: findNodeKeyByMappingId(node_data_array, 'ALM 진행중') });
                        break;
                    case 'A-RMS RESOLVED':
                        linkDataArray.push({ from: node.key, to: findNodeKeyByMappingId(node_data_array, 'ALM 해결됨') });
                        break;
                    case 'A-RMS CLOSED':
                        linkDataArray.push({ from: node.key, to: findNodeKeyByMappingId(node_data_array, 'ALM 닫힘') });
                        break;
                }
                break;
        }
    });

    return linkDataArray;
}

// mapping_id를 기준으로 노드의 키를 찾는 함수
function findNodeKeyByMappingId(node_data_array, mappingId) {
    const node = node_data_array.find(node => node.mapping_id === mappingId);
    return node ? node.key : null;
}

function get_arms_state_list() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/auth-user/api/arms/reqState/getNodesWithoutRoot.do",
            type: "GET",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (data) {
                    resolve(data.result);
                }
            },
            error: function (e) {
                jError("요구사항 조회 중 에러가 발생했습니다.");
                reject(e);
            }
        });
    });
}

function get_alm_status_list(selected_alm_server_id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/auth-user/api/arms/jiraServer/getJiraIssueStatus.do?c_id=" + selected_alm_server_id,
            type: "GET",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function(result) {
                    console.log(result);
                    resolve(result.response);
                    jSuccess("ALM 서버 상태 조회가 완료 되었습니다.");
                }
            },
            error: function (e) {
                jError("ALM 서버 상태 조회 중 에러가 발생했습니다. :: " + e);
                reject(e);
            }
        });
    });
}

function get_project_status_list(project_id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/auth-user/api/arms/jiraProject/getProjectIssueStatus.do?c_id=" + project_id,
            type: "GET",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function(result) {
                    console.log(result);
                    resolve(result.response);
                    jSuccess("ALM 프로젝트 상태 조회가 완료 되었습니다.");
                }
            },
            error: function (e) {
                jError("ALM 프로젝트 상태 조회 중 에러가 발생했습니다. :: " + e);
                reject(e);
            }
        });
    });
}

function build_alm_server_jstree(selected_alm_server_id) {
    var jQueryElementID = "#alm_server_tree";
    var serviceNameForURL = "/auth-user/api/arms/jiraServerProjectPure/getJiraProjectPure.do?c_id=" + selected_alm_server_id;

    jstree_build(jQueryElementID, serviceNameForURL);
}

////////////////////////////////////////////////////////////////////////////////////////
// -- jstree build 설정 -- //
////////////////////////////////////////////////////////////////////////////////////////
function jstree_build(jQueryElementID, serviceNameForURL) {
    console.log("mapping :: jstree_build : ( jQueryElementID ) → " + jQueryElementID);
    console.log("mapping :: jstree_build : ( serviceNameForURL ) → " + serviceNameForURL);

    console.log("mapping :: jstree_build : ( href ) → " + $(location).attr("href"));
    console.log("mapping :: jstree_build : ( protocol ) → " + $(location).attr("protocol"));
    console.log("mapping :: jstree_build : ( host ) → " + $(location).attr("host"));
    console.log("mapping :: jstree_build : ( pathname ) → " + $(location).attr("pathname"));
    console.log("mapping :: jstree_build : ( search ) → " + $(location).attr("search"));
    console.log("mapping :: jstree_build : ( hostname ) → " + $(location).attr("hostname"));
    console.log("mapping :: jstree_build : ( port ) → " + $(location).attr("port"));

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
                        return {
                            c_id: n.attr ? n.attr("id").replace("node_", "").replace("copy_", "") : 1
                        };
                    },
                    success: function (n) {
                        jSuccess("프로젝트 조회 완료");
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
                valid_children: ["drive"],
                types: {
                    default: {
                        valid_children: "none",
                        icon: {
                            image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/attibutes.png"
                        }
                    }
                }
            },
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
}

function jstree_click(data) {
    let c_id = data.attr("id").replace("node_", "").replace("copy_", "");
    let c_title = $(".jstree-clicked").text().trim();
    $("#select-project").text(c_title);

    mapping_data_load(null, null, c_id);
}

$("#text").on("input", function () {
    var searchString = $(this).val();
    $("#alm_server_tree").jstree("search", searchString);
});