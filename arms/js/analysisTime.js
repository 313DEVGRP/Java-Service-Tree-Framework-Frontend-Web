///////////////////
//Page 전역 변수
///////////////////
var dashboardColor;
var selectedVersionId;
var tot_ver_count, active_ver_count, req_count, subtask_count, resource_count;
var globalJiraIssue = {};
var versionList;
// 필요시 작성

////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {

    var pluginGroups = [
        [	"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
            "../reference/light-blue/lib/jquery.iframe-transport.js",
            // chart Colors
            // "./js/dashboard/chart/colorPalette.js",
            // 2번째 박스 d3 게이지 차트
            // "../reference/jquery-plugins/d3-v4.13.0/d3.v4.min.js",
            "../reference/jquery-plugins/c3/c3.min.css",
            "../reference/jquery-plugins/c3/c3-custom.css",
            "../reference/jquery-plugins/c3/c3.min.js",
            "./js/common/colorPalette.js",
            // 2번째 박스 timeline
            "../reference/jquery-plugins/info-chart-v1/js/D.js",
            "./js/dashboard/chart/timeline_custom.js",
            "./js/dashboard/chart/infographic_custom.css",
            // 네번째 박스 차트
            // d3.v2와 d3.v4 버전차이 오류생김...
            // "../reference/light-blue/lib/nvd3/lib/d3.v2.js",
            // "../reference/light-blue/lib/nvd3/nv.d3.custom.js",
            // "../reference/light-blue/lib/nvd3/src/core.js",
            // "../reference/light-blue/lib/nvd3/src/models/pieChartTotal.js",
            // "../reference/light-blue/lib/nvd3/src/models/pie.js",
            // "../reference/light-blue/lib/nvd3/src/models/legend.js",
            // "../reference/light-blue/lib/nvd3/src/models/multiBar.js",
            // "../reference/light-blue/lib/nvd3/src/models/multiBarChart.js",
            // "./js/analysisTime/stats.js",
            // "../reference/light-blue/lib/nvd3/src/models/axis.js",
            // "../reference/light-blue/lib/nvd3/src/utils.js",
            // "../reference/light-blue/lib/nvd3/stream_layers.js",
            // 6번째 박스 timeline
            //"https://code.jquery.com/jquery-3.2.1.slim.min.js",
            //"https://cdnjs.cloudflare.com/ajax/libs/raphael/2.2.7/raphael.min.js",
            "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/timeline/css/newtimeline.css",
            "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/timeline/js/raphael.min.js",
            "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/timeline/js/newtimeline.js",
            //"../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/js/newdemo.js",
            // 3번째 박스 데이터 테이블 내 차트
            "../reference/light-blue/lib/sparkline/jquery.sparkline.js",
            "../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js",
            /*"../reference/jquery-plugins/echarts-5.4.3/test/lib/simpleRequire.js",
            "../reference/jquery-plugins/echarts-5.4.3/test/lib/config.js",*/
            "./js/analysisTime/index.js",
            // 5번째 박스 network chart
            "./js/analysisTime/d3.v5.min.js",
            // 5번째 박스 heatmap
            "../reference/jquery-plugins/github-calendar-heatmap/js/calendar_yearview_blocks.js",
            "../reference/jquery-plugins/github-calendar-heatmap/css/calendar_yearview_blocks.css",
            // 7번째 박스
            "../reference/jquery-plugins/timelines-chart-2.11.8/src/show-time-marker.js",
            "../reference/jquery-plugins/timelines-chart-2.11.8/example/random-data.js"
        ],

        [	"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
            "../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
            "../reference/light-blue/lib/bootstrap-datepicker.js",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js"],

        [	"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

        [	"../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function() {
            //vfs_fonts 파일이 커서 defer 처리 함.
            setTimeout(function() {
                var script = document.createElement("script");
                script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
                script.defer = true; // defer 속성 설정
                document.head.appendChild(script);
            }, 3000); // 2초 후에 실행됩니다.
            console.log('모든 플러그인 로드 완료');

            // 사이드 메뉴 처리
            $('.widget').widgster();
            setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_time");

            //제품(서비스) 셀렉트 박스 이니시에이터
            makePdServiceSelectBox();

            //버전 멀티 셀렉트 박스 이니시에이터
            makeVersionMultiSelectBox();

            dashboardColor = dashboardPalette.dashboardPalette01;
            console.log(dashboardColor);


        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}

///////////////////////
//제품 서비스 셀렉트 박스
//////////////////////
function makePdServiceSelectBox() {
    //제품 서비스 셀렉트 박스 이니시에이터
    $(".chzn-select").each(function () {
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
            200: function (data) {
                //////////////////////////////////////////////////////////
                for (var k in data.response) {
                    var obj = data.response[k];
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $("#selected_pdService").append(newOption).trigger("change");
                }
                //////////////////////////////////////////////////////////
            }
        }
    });


    $("#selected_pdService").on("select2:open", function () {
        //슬림스크롤
        makeSlimScroll(".select2-results__options");
    });

    // --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
    $("#selected_pdService").on("select2:select", function (e) {
        // 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
        // 디폴트는 base version 을 선택하게 하고 ( select all )
        //~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
        bind_VersionData_By_PdService();

        var checked = $("#checkbox1").is(":checked");
        var endPointUrl = "";

        if (checked) {
            endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true";
        } else {
            endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false";
        }

        //이슈리스트 진행 상황
        //getIssueStatus($("#selected_pdService").val(), endPointUrl);
        //통계로드
        //statisticsLoad($("#selected_pdService").val(), null);
        console.log("선택된 제품(서비스) c_id = " + $("#selected_pdService").val());


        //타임라인
        // $("#notifyNoVersion2").hide();

        // 투입 인력별 요구사항 차트
        // dataTableLoad($("#selected_pdService").val(), endPointUrl);
    });
} // end makePdServiceSelectBox()

////////////////////
//버전 멀티 셀렉트 박스
////////////////////
function makeVersionMultiSelectBox() {
    //버전 선택시 셀렉트 박스 이니시에이터
    $(".multiple-select").multipleSelect({
        filter: true,
        onClose: function () {
            console.log("onOpen event fire!\n");

            var checked = $("#checkbox1").is(":checked");
            var endPointUrl = "";
            var versionTag = $(".multiple-select").val();

            if (versionTag === null || versionTag == "") {
                alert("버전이 선택되지 않았습니다.");
                return;
            }

            selectedVersionId = versionTag.join(',');

            statisticsMonitor($("#selected_pdService").val(), selectedVersionId); //ES모으는중 by YHS
            donutChart($("#selected_pdService").val(), selectedVersionId);
            combinationChart($("#selected_pdService").val(), selectedVersionId);

            getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);



            if (checked) {
                endPointUrl =
                    "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true&versionTag=" + versionTag;
                //dataTableLoad($("#selected_pdService").val(), endPointUrl);
            } else {
                endPointUrl =
                    "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false&versionTag=" + versionTag;
                //dataTableLoad($("#selected_pdService").val(), endPointUrl);
            }
        }
    });
}

function getRelationJiraIssueByPdServiceAndVersions(pdServiceLink, pdServiceVersions) {
    $.ajax({
        url: "/auth-user/api/arms/analysis/time/pdService/pdServiceVersions",
        type: "GET",
        data: {"pdServiceLink": pdServiceLink, "pdServiceVersionLinks": pdServiceVersions},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        async: true,
        statusCode: {
            200: function (data) {

                // 버전 선택 시 데이터 파싱
                networkChart(data);
                calendarHeatMap(data);
                statusTimeline(data);
                sevenTimeline(data);
                globalJiraIssue = data;

            }
        }
    });

}
function statisticsMonitor(pdservice_id, pdservice_version_id) {
    console.log("선택된 서비스 ===> " + pdservice_id);
    console.log("선택된 버전 리스트 ===> " + pdservice_version_id);
    tot_ver_count = 0;
    active_ver_count = 0;
    req_count = 0;
    subtask_count = 0;
    resource_count = 0;

    //1. 좌상 게이지 차트 및 타임라인
    //2. Time ( 작업일정 ) - 버전 개수 삽입
    $.ajax({
        url: "/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + pdservice_id,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (json) {
                let versionData = json.pdServiceVersionEntities;

                let version_count = versionData.length;
                tot_ver_count = version_count;

                console.log("등록된 버전 개수 = " + version_count);
                if(version_count !== undefined) {
                    $('#version_count').text(version_count);

                    if (version_count >= 0) {
                        let today = new Date(); // console.log(today);
                        let plusDate = new Date();

                        $("#notifyNoVersion").slideUp();
                        $("#project-start").show();
                        $("#project-end").show();

                        $("#versionGaugeChart").html(""); //게이지 차트 초기화
                        var versionGauge = [];
                        var versionTimeline = [];
                        versionData.forEach(function (versionElement, idx) {
                            //console.log(idx); console.log(versionElement);
                            if (pdservice_version_id.includes(versionElement.c_id)) {
                                var gaugeElement = {
                                    "current_date": today.toString(),
                                    "version_name": versionElement.c_title,
                                    "version_id": versionElement.c_id,
                                    "start_date": (versionElement.c_pds_version_start_date == "start" ? today : versionElement.c_pds_version_start_date),
                                    "end_date": (versionElement.c_pds_version_end_date == "end" ? today : versionElement.c_pds_version_end_date)
                                    //"end_date": (versionElement.c_pds_version_end_date == "end" ? plusDate.setMonth(plusDate.getMonth()+1) : versionElement.c_pds_version_end_date)
                                }
                                versionGauge.push(gaugeElement);
                            }

                            var timelineElement = {
                                "title" : "버전: "+versionElement.c_title,
                                "startDate" : (versionElement.c_pds_version_start_date == "start" ? today : versionElement.c_pds_version_start_date),
                                "endDate" : (versionElement.c_pds_version_end_date == "end" ? today : versionElement.c_pds_version_end_date)
                                //"endDate" : (versionElement.c_pds_version_end_date == "end" ? plusDate : versionElement.c_pds_version_end_date)
                            };
                            versionTimeline.push(timelineElement);
                        });

                        drawVersionProgress(versionGauge); // 버전 게이지

                        $("#version-timeline-bar").show();
                        Timeline.init($("#version-timeline-bar"), versionTimeline);
                        radarChart(pdservice_id, versionData);

                    }
                }
            }
        }
    });

    // 제품서비스 - status
    getReqCount(pdservice_id, "");
    // 제품서비스별 담당자 통계
    getAssigneeInfo(pdservice_id, "");

    setTimeout(function () {
        //Scope - (2) 요구사항에 연결된 이슈 총 개수
        getLinkedIssueCount(pdservice_id, ""); // 연결된 이슈 총 개수, 평균 값 대입

        $('#inactive_version_count').text( tot_ver_count - active_ver_count );
    },1000);

}

function bind_VersionData_By_PdService() {
    $(".multiple-select option").remove();
    $.ajax({
        url: "/auth-user/api/arms/pdService/getVersionList.do?c_id=" + $("#selected_pdService").val(),
        type: "GET",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                console.log(data.response);

                for (var k in data.response) {
                    var obj = data.response[k];
                    var $opt = $("<option />", {
                        value: obj.c_id,
                        text: obj.c_title
                    });
                    $("#multiversion").append($opt);
                }

                if (data.length > 0) {
                    console.log("display 재설정.");
                }
                //$('#multiversion').multipleSelect('refresh');
                //$('#edit_multi_version').multipleSelect('refresh');
                $(".multiple-select").multipleSelect("refresh");
                //////////////////////////////////////////////////////////
            }
        }
    });
}

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
    console.log(selectedData);
}

//데이터 테이블 그리고 난 후 시퀀스 이벤트
function dataTableCallBack(settings, json) {
    console.log("check");
}

//데이터 테이블 그리고 난 후 시퀀스 이벤트
function dataTableDrawCallback(tableInfo) {
    /*$("#" + tableInfo.sInstance)
        .DataTable()
        .columns.adjust()
        .responsive.recalc();*/
}

// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //
function dataTableLoad(selectId, endPointUrl) {
    var columnList = [
        { name: "c_pdservice_link", title: "제품(서비스) 아이디", data: "c_pdservice_link", visible: false },
        {
            name: "c_pdservice_name",
            title: "제품(서비스)",
            data: "c_pdservice_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + getStrLimit(data, 25) + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        { name: "c_pds_version_link", title: "제품(서비스) 버전 아이디", data: "c_pds_version_link", visible: false },
        {
            name: "c_pds_version_name",
            title: "제품(서비스) 버전",
            data: "c_pds_version_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        { name: "c_req_link", title: "요구사항 아이디", data: "c_req_link", visible: false },
        { name: "c_issue_url", title: "요구사항 이슈 주소", data: "c_issue_url", visible: false },
        {
            name: "c_req_name",
            title: "요구사항",
            data: "c_req_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        { name: "c_jira_server_link", title: "지라 서버 아이디", data: "c_jira_server_link", visible: false },
        { name: "c_jira_server_url", title: "지라 서버 주소", data: "c_jira_server_url", visible: false },
        {
            name: "c_jira_server_name",
            title: "JIRA 서버명",
            data: "c_jira_project_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        { name: "c_jira_project_link", title: "지라 프로젝트 아이디", data: "c_jira_project_link", visible: false },
        { name: "c_jira_project_url", title: "지라 프로젝트 주소", data: "c_jira_project_url", visible: false },
        {
            name: "c_jira_project_name",
            title: "JIRA 프로젝트명",
            data: "c_jira_project_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "c_jira_project_key",
            title: "JIRA 프로젝트키",
            data: "c_jira_project_key",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "c_issue_key",
            title: "요구사항 이슈 키",
            data: "c_issue_key",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    var _render =
                        '<div style=\'white-space: nowrap; color: #a4c6ff\'>' + data +
                        '<button data-target="#my_modal2" data-toggle="modal" style="border:0; background:rgba(51,51,51,0.425); color:#fbeed5; vertical-align: middle" onclick="click_issue_key(\''+data+'\')"><i class="fa fa-list-alt"></i>' + "</button>"+
                        "</div>";
                    return _render;
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        { name: "c_issue_priority_link", title: "요구사항 이슈 우선순위 아이디", data: "c_issue_priority_link", visible: false },
        {
            name: "c_issue_priority_name",
            title: "요구사항 이슈 우선순위",
            data: "c_issue_priority_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        { name: "c_issue_status_link", title: "요구사항 이슈 상태 아이디", data: "c_issue_status_link", visible: false },
        {
            name: "c_issue_status_name",
            title: "요구사항 이슈 상태",
            data: "c_issue_status_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        { name: "c_issue_resolution_link", title: "요구사항 이슈 해결책 아이디", data: "c_issue_resolution_link", visible: false },
        {
            name: "c_issue_resolution_name",
            title: "요구사항 이슈 해결책",
            data: "c_issue_resolution_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "c_issue_reporter",
            title: "요구사항 이슈 보고자",
            data: "c_issue_reporter",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "c_issue_assignee",
            title: "요구사항 이슈 할당자",
            data: "c_issue_assignee",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "c_issue_create_date",
            title: "요구사항 이슈 생성일자",
            data: "c_issue_create_date",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "c_issue_update_date",
            title: "요구사항 이슈 최근 업데이트 일자",
            data: "c_issue_update_date",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        }
    ];
    var rowsGroupList = [1,3,6];
    var columnDefList = [
        {
            orderable: false,
            className: "select-checkbox",
            targets: 0
        }
    ];
    var orderList = [[1, "asc"]];
    var jquerySelector = "#reqstatustable";
    var ajaxUrl = "/auth-user/api/arms/reqStatus" + endPointUrl;
    var jsonRoot = "";
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
    var selectList = {};
    var isServerSide = false;

    reqStatusDataTable = dataTable_build(
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
}
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //

////////////////////
// 첫번째 박스
////////////////////
function getReqCount(pdservice_id, pdServiceVersionLinks) {
    $.ajax({
        //url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + pdservice_id + "/getStatistics.do?version=" + pdservice_version_id,
        url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + pdservice_id + "/getStatistics.do?version=" + pdServiceVersionLinks,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                console.log(data);
                for (var key in data) {
                    var value = data[key];
                }
                //해당 제품의 총 요구사항 수 (by db)
                active_ver_count = data["version"];
                $('#active_version_count').text(active_ver_count);
                console.log("active_ver_count = " + active_ver_count);

                $('#req_count').text(data["req"]);
                if(data["req"] == "" || data["req"] == 0) {
                    req_count = -1;
                } else {
                    req_count = data["req"];
                }

            }
        }
    });
}

function getAssigneeInfo(pdservice_id, pdServiceVersionLinks) {
    $.ajax({
        url:"/auth-user/api/arms/dashboard/jira-issue-assignee",
        type: "get",
        data: {"pdServiceId" : pdservice_id},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //console.log(data); console.log(Object.keys(data).length);

                //담당자 미지정 이슈 수
                $('#no_assigned_issue_count').text(data["담당자 미지정"]);
                if (Object.keys(data).length !== "" || Object.keys(data).length !== undefined) {
                    //제품(서비스)에 투입된 총 인원수
                    resource_count = +Object.keys(data).length-1;
                    $('#resource_count').text(resource_count);
                } else {
                    $('#resource_count').text("n/a");
                }
            }
        }
    });
}

function getLinkedIssueCount(pdservice_id, pdServiceVersionLinks) {
    var _url = "/auth-user/api/arms/dashboard/normal/"+pdservice_id;
    $.ajax({
        url: _url,
        type: "GET",
        data: { "서비스아이디" : pdservice_id,
            "메인그룹필드" : "pdServiceVersion",
            "isReq" : false,
            "컨텐츠보기여부" : false,
            "크기" : 1000,
            "하위그룹필드들" : "parentReqKey"},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //console.log("연결이슈 서브테스크 조회 ==========");
                //console.log(data); //console.log(data.검색결과);
                subtask_count = data.전체합계;
                $('#linkedIssue_subtask_count').text(subtask_count);
                //console.log("req_count : " + req_count); console.log("subtask_count : " + subtask_count); console.log("resource_count : " + resource_count);
                if (req_count == 0) {
                    $('#linkedIssue_subtask_count_per_req').text("-");
                } else {
                    $('#linkedIssue_subtask_count_per_req').text((subtask_count / req_count).toFixed(1));
                }
                if (resource_count == 0) {
                    $('#avg_req_count').text("-");
                } else {
                    $('#avg_req_count').text((req_count/resource_count).toFixed(1));
                }
            }
        }
    });
}

////////////////////
// 두번째 박스
////////////////////
function drawVersionProgress(data) {
    var Needle,
        arc,
        arcEndRad,
        arcStartRad,
        barWidth,   // 색션의 두께
        chart,
        chartInset, // 가운데로 들어간 정도
        el,
        endPadRad,
        height,
        i,
        margin,		// 차트가 그려지는 위치 마진
        needle,		// 침
        numSections,// 색션의 수
        padRad,
        percToDeg, percToRad, degToRad, // 고정
        percent,
        radius, 	// 반지름
        ref,
        sectionIndx, // 색션 인덱스
        sectionPerc, // 색션의 퍼센트
        startPadRad,
        svg,
        totalPercent,
        width,
        versionId,
        versionName,
        waveName;

    percent = 0.55;
    barWidth = 25;
    padRad = 0;
    chartInset = 11;
    totalPercent = 0.75;

    margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    width = 220;
    height = width;
    radius = Math.min(width, height) / 2.5;

    // percToDeg percToRad degToRad 고정
    percToDeg = function (perc) {
        return perc * 360;
    };

    percToRad = function (perc) {
        return degToRad(percToDeg(perc));
    };

    degToRad = function (deg) {
        return (deg * Math.PI) / 180;
    };
    //
    svg = d3
        .select("#versionGaugeChart")
        .append("svg")
        .attr("viewBox", [70, 10, width -150, height -100])
        .append("g");

    chart = svg
        .append("g")
        .attr("transform", "translate(" + (width + margin.left) / 2 + ", " + (height + margin.top) / 2 + ")");

    var tooltip = d3
        .select("#versionGaugeChart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("color", "black")
        .style("padding", "10px");

    var arc = d3
        .arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius);

    var outerArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    var totalDate;
    var startDDay;
    var endDDay;

    numSections = data.length; // 전체 색션의 수(버전의 수)
    sectionPerc = 1 / numSections / 2; //  '/ 2' for Half-circle

    var fastestStartDate;
    var latestEndDate;
    // 가장 빠른날짜, 가장 느린날짜 세팅
    for (var idx = 0; idx < data.length; idx++) {
        if (idx === 0) {
            fastestStartDate = data[idx].start_date;
            latestEndDate = data[idx].end_date;
        } else {
            if (data[idx].start_date < fastestStartDate) {
                fastestStartDate = data[idx].start_date;
            }
            if (data[idx].end_date > latestEndDate) {
                latestEndDate = data[idx].end_date;
            }
        }
    }

    $("#fastestStartDate").text(new Date(fastestStartDate).toLocaleDateString());
    $("#latestEndDate").text(new Date(latestEndDate).toLocaleDateString());

    startDDay = Math.floor(
        Math.abs((new Date(data[0].current_date) - new Date(fastestStartDate)) / (1000 * 60 * 60 * 24))
    );
    endDDay = Math.floor(
        Math.abs((new Date(latestEndDate) - new Date(data[0].current_date)) / (1000 * 60 * 60 * 24)) + 1
    );
    $("#startDDay").text("+ " + startDDay);

    $("#endDDay").text("- " + endDDay);

    totalDate = startDDay + endDDay;

    var mouseover = function (d) {
        var subgroupId = d.version_id;
        var subgroupName = d.version_name;
        var subgroupValue = new Date(d.start_date).toLocaleDateString() + " ~ " + new Date(d.end_date).toLocaleDateString();
        tooltip.html("버전명: " + subgroupName + "<br>" + "기간: " + subgroupValue).style("opacity", 1);

        d3.selectAll(".myWave").style("opacity", 0.2);
        d3.selectAll(".myStr").style("opacity", 0.2);
        d3.selectAll(".wave-" + subgroupId).style("opacity", 1);
    };

    var mousemove = function (d) {
        tooltip.style("left", d3.mouse(this)[0] + 120 + "px").style("top", d3.mouse(this)[1] + 150 + "px");
    };

    var mouseleave = function (d) {
        tooltip.style("opacity", 0);
        d3.selectAll(".myStr").style("opacity", 1);
        d3.selectAll(".myWave").style("opacity", 1);
    };

    for (sectionIndx = i = 1, ref = numSections; 1 <= ref ? i <= ref : i >= ref; sectionIndx = 1 <= ref ? ++i : --i) {
        arcStartRad = percToRad(totalPercent);
        arcEndRad = arcStartRad + percToRad(sectionPerc);
        totalPercent += sectionPerc;
        startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
        endPadRad = sectionIndx === numSections ? 0 : padRad / 2;
        versionId = data[sectionIndx - 1].version_id;
        versionName = data[sectionIndx - 1].version_name;

        var sectionData = data[sectionIndx - 1];

        var arc = d3
            .arc()
            .outerRadius(radius - chartInset)
            .innerRadius(radius - chartInset - barWidth)
            .startAngle(arcStartRad + startPadRad)
            .endAngle(arcEndRad - endPadRad);

        var section = chart.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionId);

        section
            .data([sectionData])
            .enter()
            .append("g")
            .attr("class", "arc chart-color" + sectionIndx + " myWave wave-" + versionId)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .append("path")
            .attr("fill", function (d) {
                return dashboardColor.projectProgressColor[(sectionIndx - 1) % data.length];
            })
            .attr("stroke", "white")
            .style("stroke-width", "0.4px")
            .attr("d", arc);

        chart
            .selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionId)
            .append("text")
            .attr("class", "no-select")
            .text(function (d) {
                return getStrLimit(d.version_name, 9);
            })
            .attr("x", function (d) {
                return arc.centroid(d)[0];
            })
            .attr("y", function (d) {
                return arc.centroid(d)[1] + 2;
            })
            .style("font-size", "10px")
            .style("font-weight", "700")
            .attr("text-anchor", "middle");
    }

    Needle = (function () {
        function Needle(len, radius1) {
            this.len = len;
            this.radius = radius1;
        }

        Needle.prototype.drawOn = function (el, perc) {
            el.append("circle")
                .attr("class", "needle-center")
                .attr("cx", 0)
                .attr("cy", -10)
                .attr("r", this.radius)
                .attr("stroke", "white")
                .style("stroke-width", "0.3px");
            return el
                .append("path")
                .attr("class", "needle")
                .attr("d", this.mkCmd(perc))
                .attr("stroke", "white")
                .style("stroke-width", "0.3px");
        };

        Needle.prototype.animateOn = function (el, perc) {
            var self;
            self = this;
            return el
                .selectAll(".needle")
                .transition()
                .delay(500)
                .ease(d3.easeElasticOut)
                .duration(3000)
                .attrTween("progress", function () {
                    return function (percentOfPercent) {
                        var progress;
                        progress = percentOfPercent * perc;
                        return d3.select(".needle").attr("d", self.mkCmd(progress));
                    };
                });
        };

        Needle.prototype.mkCmd = function (perc) {
            var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
            thetaRad = percToRad(perc / 2);
            centerX = 0;
            centerY = -10;
            topX = centerX - this.len * Math.cos(thetaRad);
            topY = centerY - this.len * Math.sin(thetaRad);
            leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
            leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
            rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
            rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
            return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
        };

        return Needle;
    })();

    needle = new Needle(35, 3);

    needle.drawOn(chart, 0);

    needle.animateOn(chart, startDDay / totalDate);
}

////////////////////
// 세번째 박스
////////////////////
function radarChart(pdServiceId, pdServiceVersionList) {

    var maxCount;
    var versionText = [];
    var reqCount = [];

    var _url = "/auth-user/api/arms/dashboard/normal/"+pdServiceId;
    $.ajax({
        url: _url,
        type: "GET",
        data: { "서비스아이디" : pdServiceId,
            "메인그룹필드" : "pdServiceVersion",
            "isReq" : true,
            "컨텐츠보기여부" : false,
            "크기" : 1000
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        async: false,
        statusCode: {
            200: function (data) {
                maxCount = data.전체합계;
                var result = data.검색결과.group_by_pdServiceVersion;

                versionList = pdServiceVersionList.reduce((obj, item) => {
                    obj[item.c_id] = item;
                    return obj;
                }, {});

                result.forEach(item => {
                    if (versionList[item.필드명]) {
                        versionList[item.필드명].개수 = item.개수;
                    }
                });

                Object.values(versionList).forEach(item => {
                    var version = {};
                    version.text = item.c_title;
                    version.max = maxCount;

                    versionText.push(version);
                    reqCount.push(item.개수);
                });
            }
        }
    });

    var chart = echarts.init(document.getElementById('radar-chart-main'));

    chart.setOption({
        color: ['#E49400'],
        dataZoom: [
            { // The first dataZoom component
                radiusAxisIndex: [0, 2] // Indicates that this dataZoom component
                // controls the first and the third radiusAxis
            }
        ],
        aria: {
            show: false
        },
        tooltip: {},
        legend: {
            data: [{
                icon: 'circle',
                name: '요구사항'
            }],
            textStyle: {
                color: 'white', // 원하는 텍스트 색상으로 변경합니다.
                fontSize: 14
            }
        },
        radar: {
            radius: [0, '50%'],
            triggerEvent: true,
            // shape: 'circle',
            indicator: versionText,
            name: {
                rotate: 45, // 텍스트를 45도로 회전시킵니다.
                position: 'outside', // 텍스트를 레이더 영역 내부에 위치시킵니다.
                color: '#ffffff',
                formatter: function(text) {
                    // 줄바꿈을 위해 '\n' 문자를 삽입합니다.
                    var wrappedValue = text.replace(/(.{12})/g, '$1\n');  // 10자마다 줄바꿈
                    return '[' + wrappedValue + ']';
                },
                rich: {
                    value: {
                        align: 'left',
                        color: '#ffffff',
                        lineHeight: 10  // 줄 간격을 설정합니다.
                    }
                }
            }
        },
        series: [{
            name: '',
            type: 'radar',
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        color: 'white' // 원하는 텍스트 색상으로 변경합니다.
                    }
                }
            },
            itemStyle: {
                borderWidth: 2,
                borderColor: '#fff'
            },
            // areaStyle: {normal: {}},
            data : [
                {
                    value: reqCount,
                    name: '요구사항'
                }
            ],
            symbol: 'circle',
            symbolSize: 7,
            symbolRotate: function(value, params) {
                return ~~(360 * Math.random());
            }
        }
        ]
    });
    window.addEventListener('resize', function () {
        chart.resize();
    });
}

////////////////////
// 네번째 박스
////////////////////
function donutChart(pdServiceLink, pdServiceVersionLinks) {

    console.log("pdServiceId : " + pdServiceLink);
    console.log("pdService Version : " + pdServiceVersionLinks)
    function donutChartNoData() {
        c3.generate({
            bindto: '#donut-chart',
            data: {
                columns: [],
                type: 'donut',
            },
            donut: {
                title: "Total : 0"
            },
        });
    }

    if(pdServiceLink === "" || pdServiceVersionLinks === "") {
        donutChartNoData();
        return;
    }

    const url = new UrlBuilder()
        .setBaseUrl('/auth-user/api/arms/dashboard/jira-issue-statuses')
        .addQueryParam('pdServiceLink', pdServiceLink)
        .addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
        .addQueryParam('메인그룹필드', "status.status_name.keyword")
        .addQueryParam('하위그룹필드들', "")
        .addQueryParam('크기', 1000)
        .addQueryParam('하위크기', 1000)
        .addQueryParam('컨텐츠보기여부', true)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                let 검색결과 = data.검색결과['group_by_status.status_name.keyword'];
                if ((Array.isArray(data) && data.length === 0) ||
                    (typeof data === 'object' && Object.keys(data).length === 0) ||
                    (typeof data === 'string' && data === "{}")) {
                    donutChartNoData();
                    return;
                }

                const columnsData = [];

                검색결과.forEach(status => {
                    columnsData.push([status.필드명, status.개수]);
                });

                let totalDocCount = data.전체합계;

                const chart = c3.generate({
                    bindto: '#donut-chart',
                    data: {
                        columns: columnsData,
                        type: 'donut',
                    },
                    donut: {
                        title: "Total : " + totalDocCount
                    },
                    color: {
                        pattern: dashboardColor.issueStatusColor
                    },
                    tooltip: {
                        format: {
                            value: function (value, ratio, id, index) {
                                return value;
                            }
                        },
                    },
                });

                $(document).on('click', '#donut-chart .c3-legend-item', function () {
                    const id = $(this).text();
                    const isHidden = $(this).hasClass('c3-legend-item-hidden');
                    let docCount = 0;

                    for (const status of 검색결과) {
                        if (status.필드명 === id) {
                            docCount = status.개수;
                            break;
                        }
                    }
                    if (docCount) {
                        if (isHidden) {
                            totalDocCount -= docCount;
                        } else {
                            totalDocCount += docCount;
                        }
                    }
                    $('#donut-chart .c3-chart-arcs-title').text("Total : " + totalDocCount);
                });
            }
        }
    });
}

// 바차트
function combinationChart(pdServiceLink, pdServiceVersionLinks) {
    function combinationChartNoData() {
        c3.generate({
            bindto: '#combination-chart',
            data: {
                x: 'x',
                columns: [],
                type: 'bar',
                types: {},
            },
        });
    }

    if(pdServiceLink === "" || pdServiceVersionLinks === "") {
        combinationChartNoData();
        return;
    }


    const url = new UrlBuilder()
        .setBaseUrl('/auth-user/api/arms/dashboard/requirements-jira-issue-statuses')
        .addQueryParam('pdServiceLink', pdServiceLink)
        .addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
        .addQueryParam('메인그룹필드', "pdServiceVersion")
        .addQueryParam('하위그룹필드들', "assignee.assignee_accountId.keyword,assignee.assignee_displayName.keyword")
        .addQueryParam('크기', 1000)
        .addQueryParam('하위크기', 1000)
        .addQueryParam('컨텐츠보기여부', true)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                if ((Array.isArray(data) && data.length === 0) ||
                    (typeof data === 'object' && Object.keys(data).length === 0) ||
                    (typeof data === 'string' && data === "{}")) {
                    combinationChartNoData();
                    return;
                }

                const issueStatusTypesSet = new Set();
                for (const month in data) {
                    for (const status in data[month].statuses) {
                        issueStatusTypesSet.add(status);
                    }
                }
                const issueStatusTypes = [...issueStatusTypesSet];

                let columnsData = [];

                issueStatusTypes.forEach((status) => {
                    const columnData = [status];
                    for (const month in data) {
                        const count = data[month].statuses[status] || 0;
                        columnData.push(count);
                    }
                    columnsData.push(columnData);
                });

                const requirementCounts = ['요구사항'];
                for (const month in data) {
                    requirementCounts.push(data[month].totalRequirements);
                }
                columnsData.push(requirementCounts);

                let monthlyTotals = {};

                for (const month in data) {
                    monthlyTotals[month] = data[month].totalIssues + data[month].totalRequirements;
                }


                const chart = c3.generate({
                    bindto: '#combination-chart',
                    data: {
                        x: 'x',
                        columns: [
                            ['x', ...Object.keys(data)],
                            ...columnsData,
                        ],
                        type: 'bar',
                        types: {
                            '요구사항': 'area',
                        },
                        groups: [issueStatusTypes]
                    },
                    color: {
                        pattern: dashboardColor.accumulatedIssueStatusColor,
                    },
                    onrendered: function() {
                        d3.selectAll('.c3-line, .c3-bar, .c3-arc')
                            .style('stroke', 'white')
                            .style('stroke-width', '0.3px');
                    },
                    axis: {
                        x: {
                            type: 'category',
                        },
                    },
                    tooltip: {
                        format: {
                            title: function (index) {
                                const month = Object.keys(data)[index];
                                const total = monthlyTotals[month];
                                return `${month} | Total : ${total}`;
                            },
                        },
                    }
                });

                $(document).on('click', '#combination-chart .c3-legend-item', function () {
                    const id = $(this).text();
                    const isHidden = $(this).hasClass('c3-legend-item-hidden');
                    let docCount = 0;

                    for (const month in data) {
                        if (data[month].statuses.hasOwnProperty(id)) {
                            docCount = data[month].statuses[id];
                        } else if (id === '요구사항') {
                            docCount = data[month].totalRequirements;
                        }
                    }

                    // 월별 통계 값 업데이트
                    for (const month in data) {
                        if (isHidden) {
                            monthlyTotals[month] -= docCount;
                        } else {
                            monthlyTotals[month] += docCount;
                        }
                    }
                });
            }
        }
    });
}

////////////////////
// 다섯번째 박스
////////////////////

function networkChart(jiraIssueData) {
    d3.select(".network-graph").selectAll("*").remove();

    var NETWORK_DATA = {
        "nodes": [],
        "links": []
    };

    NETWORK_DATA.nodes = jiraIssueData;
    var index = {};

    jiraIssueData.forEach(function(item) {
        index[item.key] = item;
    });

    jiraIssueData.forEach(function(item) {
        var parentItem = index[item.parentReqKey];
        if (parentItem) {
            var link = {
                source: item.id,
                target: parentItem.id
            };
            NETWORK_DATA.links.push(link);
        }
    });
    /*var NETWORK_DATA = {
        "nodes": [
            {
                "id": "청소년",
                "value": 3,
                "group": null
            },
            {
                "id": "장면",
                "value": 3,
                "group": "media"
            },
            {
                "id": "드라마",
                "value": 3,
                "group": "media"
            },
            {
                "id": "캐릭터",
                "value": 4,
                "group": null
            },
            {
                "id": "미디어",
                "value": 4,
                "group": "media"
            },
            {
                "id": "대중",
                "value": 4,
                "group": "media"
            },
            {
                "id": "영향",
                "value": 2,
                "group": null
            },
            {
                "id": "모습",
                "value": 3,
                "group": null
            },
            {
                "id": "티비",
                "value": 4,
                "group": "media"
            },
            {
                "id": "영화",
                "value": 2,
                "group": "media"
            },
            {
                "id": "매체",
                "value": 6,
                "group": "media"
            },
            {
                "id": "그리다",
                "value": 5,
                "group": "act"
            },
            {
                "id": "소비",
                "value": 5,
                "group": "act"
            },
            {
                "id": "이미지",
                "value": 3,
                "group": null
            },
            {
                "id": "방송",
                "value": 5,
                "group": "media"
            },
            {
                "id": "비행",
                "value": 2,
                "group": "bad"
            },
            {
                "id": "주인공",
                "value": 4,
                "group": null
            },
            {
                "id": "이야기",
                "value": 5,
                "group": null
            },
            {
                "id": "실제표현",
                "value": 5,
                "group": null
            },
            {
                "id": "가난",
                "value": 2,
                "group": "bad"
            },
            {
                "id": "폭력",
                "value": 3,
                "group": "bad"
            },
            {
                "id": "씌우다",
                "value": 4,
                "group": "act"
            },
            {
                "id": "묘사",
                "value": 3,
                "group": "act"
            },
            {
                "id": "불행",
                "value": 3,
                "group": "bad"
            },
            {
                "id": "부정",
                "value": 2,
                "group": "bad"
            },
            {
                "id": "인식",
                "value": 1,
                "group": null
            },
            {
                "id": "불량",
                "value": 4,
                "group": "bad"
            }
        ],
        "links": [
            {
                "source": "청소년",
                "target": "장면",
                "value": 2
            },
            {
                "source": "청소년",
                "target": "비행",
                "value": 8
            },
            {
                "source": "청소년",
                "target": "티비",
                "value": 4
            },
            {
                "source": "청소년",
                "target": "모습",
                "value": 10
            },
            {
                "source": "드라마",
                "target": "캐릭터",
                "value": 4
            },
            {
                "source": "드라마",
                "target": "미디어",
                "value": 3
            },
            {
                "source": "드라마",
                "target": "주인공",
                "value": 2
            },
            {
                "source": "드라마",
                "target": "매체",
                "value": 1
            },
            {
                "source": "드라마",
                "target": "그리다",
                "value": 4
            },
            {
                "source": "장면",
                "target": "비행",
                "value": 5
            },
            {
                "source": "장면",
                "target": "주인공",
                "value": 1
            },
            {
                "source": "이야기",
                "target": "실제표현",
                "value": 6
            },
            {
                "source": "미디어",
                "target": "캐릭터",
                "value": 2
            },
            {
                "source": "미디어",
                "target": "매체",
                "value": 8
            },
            {
                "source": "미디어",
                "target": "티비",
                "value": 4
            },
            {
                "source": "미디어",
                "target": "영화",
                "value": 10
            },
            {
                "source": "미디어",
                "target": "실제표현",
                "value": 4
            },
            {
                "source": "영향",
                "target": "소비",
                "value": 3
            },
            {
                "source": "영향",
                "target": "청소년",
                "value": 2
            },
            {
                "source": "영향",
                "target": "대중",
                "value": 1
            },
            {
                "source": "영향",
                "target": "미디어",
                "value": 4
            },
            {
                "source": "영향",
                "target": "매체",
                "value": 5
            },
            {
                "source": "영향",
                "target": "장면",
                "value": 1
            },
            {
                "source": "비행",
                "target": "주인공",
                "value": 6
            },
            {
                "source": "비행",
                "target": "불량",
                "value": 2
            },
            {
                "source": "비행",
                "target": "실제표현",
                "value": 8
            },
            {
                "source": "가난",
                "target": "비행",
                "value": 4
            },
            {
                "source": "가난",
                "target": "주인공",
                "value": 10
            },
            {
                "source": "가난",
                "target": "폭력",
                "value": 4
            },
            {
                "source": "가난",
                "target": "이야기",
                "value": 3
            },
            {
                "source": "폭력",
                "target": "가난",
                "value": 2
            },
            {
                "source": "폭력",
                "target": "실제표현",
                "value": 1
            },
            {
                "source": "씌우다",
                "target": "폭력",
                "value": 4
            },
            {
                "source": "씌우다",
                "target": "영향",
                "value": 5
            },
            {
                "source": "씌우다",
                "target": "소비",
                "value": 1
            },
            {
                "source": "씌우다",
                "target": "주인공",
                "value": 6
            },
            {
                "source": "씌우다",
                "target": "미디어",
                "value": 2
            },
            {
                "source": "씌우다",
                "target": "캐릭터",
                "value": 8
            },
            {
                "source": "묘사",
                "target": "씌우다",
                "value": 4
            },
            {
                "source": "묘사",
                "target": "불행",
                "value": 10
            },
            {
                "source": "묘사",
                "target": "방송",
                "value": 4
            },
            {
                "source": "묘사",
                "target": "매체",
                "value": 3
            },
            {
                "source": "소비",
                "target": "이미지",
                "value": 2
            },
            {
                "source": "소비",
                "target": "그리다",
                "value": 1
            },
            {
                "source": "소비",
                "target": "미디어",
                "value": 4
            },
            {
                "source": "소비",
                "target": "폭력",
                "value": 5
            },
            {
                "source": "매체",
                "target": "대중",
                "value": 1
            },
            {
                "source": "매체",
                "target": "영향",
                "value": 6
            },
            {
                "source": "매체",
                "target": "모습",
                "value": 2
            },
            {
                "source": "매체",
                "target": "이야기",
                "value": 3
            },
            {
                "source": "매체",
                "target": "실제표현",
                "value": 10
            },
            {
                "source": "부정",
                "target": "인식",
                "value": 10
            },
            {
                "source": "부정",
                "target": "이미지",
                "value": 3
            },
            {
                "source": "부정",
                "target": "소비",
                "value": 2
            },
            {
                "source": "부정",
                "target": "불행",
                "value": 1
            },
            {
                "source": "부정",
                "target": "묘사",
                "value": 4
            },
            {
                "source": "부정",
                "target": "씌우다",
                "value": 5
            },
            {
                "source": "부정",
                "target": "이야기",
                "value": 1
            }
        ]
    };*/

    if (NETWORK_DATA.nodes.length === 0) { // 데이터가 없는 경우를 체크
        d3.select("#NETWORK_GRAPH").remove();
        d3.select(".network-graph").append("p").text('데이터가 없습니다.');
        return;
    }

    d3.select(".network-graph").append("svg").attr("id","NETWORK_GRAPH");

    /******** network graph config ********/
    var networkGraph = {
        createGraph : function(){
            var links = NETWORK_DATA.links.map(function(d){
                return Object.create(d);
            });
            var nodes = NETWORK_DATA.nodes.map(function(d){
                return Object.create(d);
            });
            var fillCircle = function(g){
                if (g === true) {
                    return "#ff3c00";
                } else if (g === false) {
                    return "#386cff";
                } else {
                    return "#c67cff";
                }
            };
            var reqName = function(g) {
                var name = '';

                if (g.isReq === true) {
                    name = '요구사항';
                } else if (g.isReq === false) {
                    name = '연결된 이슈';
                } else {
                    name = null;
                }

                return "[" + name + "]";
            };

            var width = 500;
            var height = 500;

            var simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id( function(d){ return d.id }))
                .force("charge", d3.forceManyBody().strength(-100))
                .force("center", d3.forceCenter(width / 2, height / 2));
                // .force("collide",d3.forceCollide().radius( function(d){ return d.value*8}) );

            //simulation.stop(); // stop 필요한가?

            var svg = d3.select("#NETWORK_GRAPH")
                .attr("viewBox", [0, 0, width, height]);

            var initScale;

            if (NETWORK_DATA.nodes.length < 50) {
                initScale = 0.7;
            } else if (NETWORK_DATA.nodes.length < 200) {
                initScale = 0.2;
            } else {
                initScale = 0.1;
            }

            var initialTransform = d3.zoomIdentity
                .translate(width / 3, height / 3)  // 초기 위치 설정
                .scale(initScale);  // 초기 줌 레벨 설정

            var zoom = d3.zoom()
                .scaleExtent([0.1, 5])  // 줌 가능한 최소/최대 줌 레벨 설정
                .on("zoom", zoomed);  // 줌 이벤트 핸들러 설정

            // SVG에 확대/축소 기능 적용
            svg.call(zoom);

            // 초기 줌 설정
            svg.transition().duration(500).call(zoom.transform, initialTransform);

            var gHolder = svg.append("g")
                .attr("class", "g-holder");

            var link = gHolder.append("g")
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("stroke-opacity", 1)
                .selectAll("path")
                .data(links)
                .join("path")
                .attr("stroke-width", 1.5);

            /*
            var node = svg.append("g")
                        .selectAll("circle")
                            .data(nodes)
                            .enter()
                            .append("circle")
                                .attr("r", 8)
                                .attr("fill", color)
                                .call(drag(simulation));  // text 라벨 추가를 위해 g로 그룹핑

            node.append("text")
              .text(function(d){ return d.id })
              .style("font-size", "12px") */

            var node = gHolder.append("g")
                .attr("class", "circle-node-holder")
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .selectAll("g")
                .data(nodes)
                .enter()
                .append("g")
                .each(function(d){
                    d3.select(this)
                        .append("circle")
                        .attr("r", 10)
                        .attr("fill", fillCircle(d.isReq));
                    /*d3.select(this)
                        .append("text").text(d.id)
                        .attr("dy",6)
                        .style("text-anchor","middle")
                        .attr("class", "node-label");*/
                }).call(networkGraph.drag(simulation));

            node.append("text")
                .attr("x", 11)
                .attr("dy", ".31em")
                .style("font-size", "9px")
                .style("fill", (d) => fillCircle(d.isReq))
                .style("font-weight", "5")
                .attr("stroke", "white")
                .attr("stroke-width", "0.3")
                .text((d) => reqName(d));

            node.append("text")
                .attr("x", 12)
                .attr("dy", "1.5em")
                .style("font-family", "Arial")
                .style("font-size", "10px")
                .style("font-weight", "10")
                .text(function(d) { return d.key; });

            simulation.on("tick", function(){
                link.attr("x1", function(d){ return d.source.x; })
                    .attr("y1", function(d){ return d.source.y; })
                    .attr("x2", function(d){ return d.target.x; })
                    .attr("y2", function(d){ return d.target.y; });

                /*node
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; });*/

                //circle 노드에서 g 노드로 변경
                node.attr("transform", function(d) { return "translate("+d.x+","+ d.y+")"; });

                link.attr("d", function(d) {
                    var dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);
                    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                });
            });

            function zoomed() {
                // 현재 확대/축소 변환을 얻음
                var transform = d3.event.transform;

                // 모든 노드 및 링크를 현재 확대/축소 변환으로 이동/확대/축소
                gHolder.attr("transform", transform);
            }

            //invalidation.then(() => simulation.stop());

            return svg.node();
        },
        drag : function(simulation){
            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    }

    /******** network graph create ********/
    networkGraph.createGraph();
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');

    return year + '-' + month + '-' + day;
}

function calendarHeatMap(jiraIssueData) {

    console.table(jiraIssueData);

    d3.select("#heatmap-body").style("overflow-x","scroll");

    $('#calendar_yearview_blocks_chart_1 svg').remove();
    $('#calendar_yearview_blocks_chart_2 svg').remove();

    var requirement = {};
    var relation_issue = {};
    var requirement_colors = [];
    var relation_issue_colors = [];

    jiraIssueData.forEach(item => {
        var display_date = formatDate(new Date(item.updated));

        if(item.isReq === true) {
            heatmapDataParsing(requirement, item, requirement_colors);
        }
        else {
            heatmapDataParsing(relation_issue, item, relation_issue_colors);
        }
    });

    function heatmapDataParsing(return_object, item, return_colors) {
        var display_date = formatDate(new Date(item.updated));
        if (return_object[display_date] === undefined) {
            return_object[display_date] = {};
            return_object[display_date].items = [];
        }

        return_object[display_date].items.push(item.summary);
        return_colors.push(item.summary);
    }

    var requirementHeatMapData = JSON.stringify(requirement);
    var relationIssuetHeatMapData = JSON.stringify(relation_issue);

    var req_colors = {
        'default': '#eeeeee'
    };

    var issue_colors = {
        'default': '#eeeeee'
    };

    assignColors(requirement_colors, req_colors);
    assignColors(relation_issue_colors, issue_colors);

    function assignColors(colorsArray, colorsObj) {
        colorsArray.forEach((item) => {
            if (item !== 'default') {
                colorsObj[item] = getRandomColor();
            }
        });
    }

    function getRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    $(".update-title").show();

    $('#calendar_yearview_blocks_chart_1').calendar_yearview_blocks({
        data: requirementHeatMapData,
        start_monday: true,
        always_show_tooltip: true,
        month_names: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],
        day_names: ['mo', 'wed', 'fri', 'sun'],
        colors: req_colors
    });

    /*var heatMapBarHtml = `<div id="heatmap-bar" className="time_element"></div>`;
    $('#calendar_yearview_blocks_chart_1').append(heatMapBarHtml);*/

    $('#calendar_yearview_blocks_chart_2').calendar_yearview_blocks({
        data: relationIssuetHeatMapData,
        start_monday: true,
        always_show_tooltip: true,
        month_names: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        day_names: ['mo', 'wed', 'fri', 'sun'],
        colors: issue_colors
    });
}



/*
function getRandomData(ordinal = false) {

    const NGROUPS = 6,
        MAXLINES = 15,
        MAXSEGMENTS = 20,
        MAXCATEGORIES = 20,
        MINTIME = new Date(2013,2,21);

    const nCategories = Math.ceil(Math.random()*MAXCATEGORIES),
        categoryLabels = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

    return [...Array(NGROUPS).keys()].map(i => ({
        group: 'group' + (i+1),
        data: getGroupData()
    }));

    //

    function getGroupData() {

        return [...Array(Math.ceil(Math.random()*MAXLINES)).keys()].map(i => ({
            label: 'label' + (i+1),
            data: getSegmentsData()
        }));

        //

        function getSegmentsData() {
            const nSegments = Math.ceil(Math.random()*MAXSEGMENTS),
                segMaxLength = Math.round(((new Date())-MINTIME)/nSegments);
            let runLength = MINTIME;

            return [...Array(nSegments).keys()].map(i => {
                const tDivide = [Math.random(), Math.random()].sort(),
                    start = new Date(runLength.getTime() + tDivide[0]*segMaxLength),
                    end = new Date(runLength.getTime() + tDivide[1]*segMaxLength);

                runLength = new Date(runLength.getTime() + segMaxLength);

                return {
                    timeRange: [start, end],
                    val: ordinal ? categoryLabels[Math.ceil(Math.random()*nCategories)] : Math.random()
                    //labelVal: is optional - only displayed in the labels
                };
            });

        }
    }
}
*/

////////////////////
// 여섯번째 박스
////////////////////

function statusTimeline(data) {

    // 필요한 데이터만 추출
    var extractedData = extractDataForStatusTimeline(data);
    
    // 버전 별로 그룹화
    var groupedDataByVersion = groupingByVersionForStatusTimeline(extractedData);

    // 데이터 포맷팅
    var relatedIssues = dataFormattingForStatusTimeline(groupedDataByVersion);

    // 요소 호버
    $(".reqNode").hover(
        function() {

            $(this).find('title').text('');
            var classValue = $(this).attr('class');
            //console.log(classValue);
            var key = classValue.split(" ").pop(); // 요구사항 이슈 키

            $("." + key).css("opacity", "0.7");

            var tooltip = $('<div id="stlTooltip"></div>');
            tooltip.html(`
                <table class="stltable">
                    <tr>
                        <th>하위 이슈</th>
                        <th>상태</th>
                    </tr>
                    ${relatedIssues[key] ? relatedIssues[key] : '<tr><td colspan="2">데이터가 없습니다</td></tr>'}
                </table>
            `);

            tooltip.css({
                "visibility": "visible",
                "opacity": "1",
                "position": "absolute",
                "left": event.pageX + 10,
                "top": event.pageY + 10,
            });

            $("body").append(tooltip);

        }, function() {
            $(".reqNode").css("opacity", "1");
            $("#stlTooltip").remove();

        }
    );
}

function extractDataForStatusTimeline(data){

    var extractedData = [];

    data.forEach(item => {
        var extractedItem = {
            version: item.pdServiceVersion,
            issueKey: item.key,
            isReq: item.isReq,
            parentReqKey: item.parentReqKey,
            createdDate: new Date(Date.parse(item.created)),
            summary: item.summary,
            status: item.status.status_name
        };
        extractedData.push(extractedItem);
    });

    return extractedData;
}

function groupingByVersionForStatusTimeline(data) {

    var groupedData = data.reduce((result, item) => {
        var pdServiceVersion = item.version;
        if (!result[pdServiceVersion]) {
            result[pdServiceVersion] = [];
        }
        result[pdServiceVersion].push(item);
        return result;
    }, {});
    
    return groupedData;
}

function dataFormattingForStatusTimeline(data) {

    var statusTimelineData = {};
    var formattedData = [];
    var relatedIssues = {};

    for (const version in data) {

        var reqIssue = data[version].filter(item => item.isReq === true); // 요구사항 이슈만 필터링
        var versionData = convertVersionIdToTile(version); // text (버전)

        var reqIssues = []; // children 전체

        reqIssue.forEach(reqIssue => {

            // children 요소 중 하나
            var req = {
                text: reqIssue.summary + " | " + reqIssue.status,
                id: reqIssue.issueKey
            };

            reqIssues.push(req);

            // 호버 시 하위 이슈 볼 수 있도록 데이터 포맷팅
            var relatedIssue = data[version].filter(item => item.parentReqKey === reqIssue.issueKey);
            console.log("연관 이슈: ", relatedIssue);

            relatedIssue.forEach(relatedIssue => {

                if (!relatedIssues[relatedIssue.parentReqKey]) {
                    relatedIssues[relatedIssue.parentReqKey] = '';
                }

                relatedIssues[relatedIssue.parentReqKey] += "<tr><td>" +
                    relatedIssue.summary +
                    "</td><td>" +
                    relatedIssue.status +
                    "</td></tr>";
            });
        });

        var totalData = {
            text: versionData,
            children: reqIssues
        };

        formattedData.push(totalData);
    }
    statusTimelineData.data = formattedData;

    $("#demo").timeline(statusTimelineData);
    console.log("연관 이슈 전체: ", relatedIssues);

    return relatedIssues;
}

function sevenTimeline(data) {
    var sevenTimeLineDiv = document.getElementById("sevenTimeLine");
    sevenTimeLineDiv.innerHTML = "";

    var groupedData = groupDataByPdServiceVersion(data);

    var myData = []
    for (const version in groupedData) {
        console.log("버전 정보: " + version);
        console.log(groupedData[version]);
    }

    var myData = dataFormattingForSevenTimeLine(groupedData);
    //var myData = Data();

    TimelinesChart()('#sevenTimeLine')
        .width(1228)
        .zQualitative(true)
        .data(myData)
        .refresh();
}
//  필요한 데이터만 추출
function extractData(data){
    var extractedData = [];
    data.forEach(obj => {
        var extractedObj = {
          issueKey: obj.key,
          isReq: obj.isReq,
          parentReqKey: obj.parentReqKey,
          createdDate: new Date(Date.parse(obj.created)),
          resolutionDate: obj.resolutiondate ? obj.resolutiondate : new Date(),
          version: obj.pdServiceVersion
        };
        extractedData.push(extractedObj);
     });
     return extractedData;
}
// 버전 별 그룹화 하기
function groupDataByPdServiceVersion(data) {
  var extractedData = extractData(data);
  var groupedData = extractedData.reduce((result, obj) => {
      var pdServiceVersion = obj.version;
      if (!result[pdServiceVersion]) {
          result[pdServiceVersion] = [];
      }
      result[pdServiceVersion].push(obj);
      return result;
  }, {});
  return groupedData;
}
// 차트에 맞게 데이터 변환 하기
function dataFormattingForSevenTimeLine(groupedByVersionData) {
    var formattedData = [];

    for (var version in groupedByVersionData) {
        var reqIssueData = groupedByVersionData[version].filter(data => data.isReq === true);

        reqIssueData.forEach(reqIssue => {
            console.log("reqIssue.issueKey   "+reqIssue.issueKey);
            console.log("reqIssue.version   "+reqIssue.version);
            var groupByReqIssueData = {
                group: reqIssue.issueKey,
                data: []
            };

            var childData = groupedByVersionData[version].filter(issue => issue.parentReqKey === groupByReqIssueData.group);
            groupByReqIssueData.data.push({
                label: reqIssue.issueKey,
                data: [{
                    timeRange: [reqIssue.createdDate, reqIssue.resolutionDate],
                    val: convertVersionIdToTile(reqIssue.version)
                }]
            });
            childData.forEach(child => {
                groupByReqIssueData.data.push({
                    label: child.issueKey,
                    data: [{
                        timeRange: [child.createdDate, child.resolutionDate],
                        val: convertVersionIdToTile(child.version)
                        }]
                    });
                });
            formattedData.push(groupByReqIssueData);
        });
    }

    return formattedData;
}
//
function convertVersionIdToTile(versionId) {
  if (versionList.hasOwnProperty(versionId)) {
    var version = versionList[versionId];
    console.log("version.c_title: " + version.c_title);
    return version.c_title;
  }
}