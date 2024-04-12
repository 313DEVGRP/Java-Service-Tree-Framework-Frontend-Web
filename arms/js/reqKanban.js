let selectedPdServiceId;           // 선택한 제품(서비스) 아이디
let selectedVersionId;             // 선택한 버전 아이디
const reqStateToIdMapping = {      // 요구사항 상태에 id 매핑
    '열림': 'kanban-open',
    '진행중': 'kanban-progress',
    '해결됨': 'kanban-resolve',
    '닫힘': 'kanban-close'
};
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
            "../reference/jquery-plugins/jkanban-1.3.1/dist/jkanban.css",
            "../reference/jquery-plugins/jkanban-1.3.1/dist/jkanban.js"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function () {
            //사이드 메뉴 처리
            $(".widget").widgster();
            setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_kanban");

            //제품(서비스) 셀렉트 박스 이니시에이터
            makePdServiceSelectBox();

            //버전 멀티 셀렉트 박스 이니시에이터
            makeVersionMultiSelectBox();

            // 빈 칸반 보드
            emptyKanban();

        })
        .catch(function (e) {
            console.error("플러그인 로드 중 오류 발생");
            console.error(e);
        });
}

///////////////////////
//제품 서비스 셀렉트 박스
//////////////////////
function makePdServiceSelectBox() {
    //제품 서비스 셀렉트 박스 이니시에이터
    $(".chzn-select").each(function() {
        $(this).select2($(this).data());
    });

    //제품 서비스 셀렉트 박스 데이터 바인딩
    $.ajax({
        url: "/auth-user/api/arms/pdService/getPdServiceMonitor.do",
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function(data) {
                //////////////////////////////////////////////////////////
                for (var k in data.response) {
                    var obj = data.response[k];
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $("#selected_pdService").append(newOption).trigger("change");
                }
                //////////////////////////////////////////////////////////
                jSuccess("제품(서비스) 조회가 완료 되었습니다.");
            }
        },
        error: function (e) {
            jError("제품(서비스) 조회 중 에러가 발생했습니다.");
        }
    });

    $("#selected_pdService").on("select2:open", function() {
        //슬림스크롤
        makeSlimScroll(".select2-results__options");
    });

    // --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
    $("#selected_pdService").on("select2:select", function(e) {
        selectedPdServiceId = $("#selected_pdService").val();
        //refreshDetailChart(); 변수값_초기화();
        // 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
        // 디폴트는 base version 을 선택하게 하고 ( select all )
        //~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
        bind_VersionData_By_PdService();
    });
} // end makePdServiceSelectBox()

////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////
function makeVersionMultiSelectBox() {
    //버전 선택시 셀렉트 박스 이니시에이터
    $(".multiple-select").multipleSelect();
}

function bind_VersionData_By_PdService() {
    $(".multiple-select option").remove();
    $.ajax({
        url: "/auth-user/api/arms/pdService/getVersionList.do?c_id=" + selectedPdServiceId,
        type: "GET",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                for (var k in data.response) {
                    var obj = data.response[k];
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $(".multiple-select").append(newOption);
                }

                if (data.length > 0) {
                    console.log("[ reqKanban :: bind_VersionData_By_PdService ] :: result = display 재설정.");
                }
                $(".multiple-select").multipleSelect("refresh");
                jSuccess("버전 조회가 완료 되었습니다.");
                //////////////////////////////////////////////////////////
            }
        },
        error: function (e) {
            jError("버전 조회 중 에러가 발생했습니다.");
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////
//제품(서비스) 선택 후, 버전을 선택하면 동작하는 함수
////////////////////////////////////////////////////////////////////////////////////////
function changeMultipleSelected() {
    let result = [];
    let versionIds = [];
    $("#multiversion option:selected").map(function (a, item) {
        //result.push(item.innerText);
        versionIds.push(item.value);
    });
    selectedVersionId = versionIds;
    //$("#select_Version").text(isEmpty(result) ? "선택되지 않음" : result);
    console.log("[ reqKanban :: changeMultipleSelected ] :: 선택한 제품 = " + selectedPdServiceId);
    console.log("[ reqKanban :: changeMultipleSelected ] :: 선택한 버전 = " + selectedVersionId);

    // selectedVersionId로 선택한 제품(서비스)를 구분하고
    // version 정보를 매핑해서 요구사항 이슈 가져오기
    $.ajax({
        url: "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" +
            selectedPdServiceId +
            "/getReqAddListByFilter.do?c_req_pdservice_versionset_link=" +
            selectedVersionId,
        type: "GET",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {

                // 요구사항 상태 별 리스트
                const reqListByState = data.reduce((reqList, item, index) => {

                    // 요구사항 상태 가져오기
                    const state = (item.reqStateEntity && item.reqStateEntity.c_title) || "상태 정보 없음";

                    // 해당 상태의 리스트가 없으면 초기화
                    if (!reqList[state]) {
                        reqList[state] = [];
                    }

                    // 현재 상태에 해당하는 리스트에 아이템 추가
                    reqList[state].push({
                        id: state + "-" + index,
                        title: `${item.c_title} <i class="fa fa-ellipsis-h show-info" data-id="${state}-${index}" data-state="${state}"></i>`,
                        info: {
                            reqVersions: "",
                            reqPriority: (item.reqPriorityEntity && item.reqPriorityEntity.c_title) || "우선순위 정보 없음",
                            reqDifficulty: (item.reqDifficultyEntity && item.reqDifficultyEntity.c_title) || "난이도 정보 없음",
                            reqState: state,
                            reqPlan: item.c_req_plan_time || "예상 일정 정보 없음"
                        }
                    });

                    return reqList;
                }, {});
                //console.log("[ reqKanban :: changeMultipleSelected ] :: 요구사항 상태 별 리스트 => ", JSON.stringify(reqListByState));

                // 요구사항 개수 표시
                setReqCount(reqListByState);

                // 칸반 보드 구성
                const reqBoardByState = Object.keys(reqStateToIdMapping).map(state => ({
                                            id: reqStateToIdMapping[state], // 요구사항 상태 별 id
                                            title: state,                   // 요구사항 제목
                                            item: reqListByState[state]     // 요구사항 상태 별 리스트
                                        }));

                // 칸반 보드 로드
                loadKanban(reqListByState, reqBoardByState);
                jSuccess("보드가 로드 되었습니다.");
            }
        },
        error: function (e) {
            jError("버전 조회 중 에러가 발생했습니다.");
        }
    });
}

function setReqCount(reqListByState) {

    let open = (reqListByState["열림"] && reqListByState["열림"].length) || 0;
    let progress = (reqListByState["진행중"] && reqListByState["진행중"].length) || 0;
    let resolve = (reqListByState["해결됨"] && reqListByState["해결됨"].length) || 0;
    let close = (reqListByState["닫힘"] && reqListByState["닫힘"].length) || 0;
    let total = open + progress + resolve + close;

    $("#req-count").text(total);
    $("#req-open-count").text(open);
    $("#req-progress-count").text(progress);
    $("#req-resolve-count").text(resolve);
    $("#req-close-count").text(close);

}

function loadKanban(reqListByState, reqBoardByState) {

    $("#myKanban").empty();

    let kanban = new jKanban({
        element : '#myKanban',
        gutter  : '15px',
        responsivePercentage: true,
        dragBoards: false,
        boards  : reqBoardByState
    });

    // 상세 정보 클릭 이벤트
    $('.show-info').click(function() {
        const id = $(this).data('id');
        const state = $(this).data('state');

        const item = reqListByState[state].find(item => item.id === id);

        if (item && item.info) {
            alert(JSON.stringify(item.info));
        } else {
            console.error('[ reqKanban :: loadKanban ] :: info 정보를 찾을 수 없습니다.', { id, state });
        }
    });
}

function emptyKanban() {

    $("#myKanban").empty();

    let kanban = new jKanban({
        element : '#myKanban',          // 칸반 보드 선택자
        gutter  : '15px',               // 보드 간 간격
        responsivePercentage: true,     // 반응형 여부
        dragBoards: false,              // 보드 drag 가능 여부
        click : function(el){
            alert(el.innerHTML);
        },
        boards  :[
            {
                'id' : 'kanban_open',
                'title'  : '열림'
            },
            {
                'id' : 'kanban_progress',
                'title'  : '진행 중'
            },
            {
                'id' : 'kanban_resolved',
                'title'  : '해결됨'
            },
            {
                'id' : 'kanban_closed',
                'title'  : '닫힘'
            }
        ]
    });
}