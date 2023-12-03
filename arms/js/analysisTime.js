///////////////////
//Page 전역 변수
///////////////////
var dashboardColor;
var selectedVersionId;
var globalJiraIssue = {};
var pdServiceData;
var versionListData;
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
            "../reference/jquery-plugins/info-chart-v1/js/timeline_analysisTime.js",
            //"./js/dashboard/chart/timeline_custom.js",
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
            // "../reference/light-blue/lib/sparkline/jquery.sparkline.js",
            "../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js",
            /*"../reference/jquery-plugins/echarts-5.4.3/test/lib/simpleRequire.js",
            "../reference/jquery-plugins/echarts-5.4.3/test/lib/config.js",*/
            // "./js/analysisTime/index.js",
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

//        if (checked) {
//            endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true";
//        } else {
//            endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false";
//        }

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

            statisticsMonitor($("#selected_pdService").val(), selectedVersionId);

            showStatusesCountBox();
            getReqLinkedIssueCountAndRate($("#selected_pdService").val(), selectedVersionId, true);
            getReqLinkedIssueCountAndRate($("#selected_pdService").val(), selectedVersionId, false);

            combinationChart($("#selected_pdService").val(), selectedVersionId);

            getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);
            calendarHeatMap($("#selected_pdService").val(), selectedVersionId);

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

function showStatusesCountBox() {
    $("#progress_req_status").slimScroll({
        height: "190px",
        railVisible: true,
        railColor: "#222",
        railOpacity: 0.3,
        wheelStep: 10,
        allowPageScroll: false,
        disableFadeOut: false
    });

    $("#progress_linked_issue_status").slimScroll({
        height: "190px",
        railVisible: true,
        railColor: "#222",
        railOpacity: 0.3,
        wheelStep: 10,
        allowPageScroll: false,
        disableFadeOut: false
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

                statusTimeline(data);
                sevenTimeline(data);

                scatterChart(data);
                // setTimeout(function () {
                //     networkChart(pdServiceVersions, data);
                // },1000);

                globalJiraIssue = data;

            }
        }
    });

}
function statisticsMonitor(pdservice_id, pdservice_version_id) {
    console.log("선택된 서비스 ===> " + pdservice_id);
    console.log("선택된 버전 리스트 ===> " + pdservice_version_id);

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
                pdServiceData = json;
                let versionData = json.pdServiceVersionEntities;
                versionData.sort((a, b) => a.c_id - b.c_id);
                let version_count = versionData.length;

                console.log("등록된 버전 개수 = " + version_count);
                if(version_count !== undefined) {
                    $('#version_prgress').text(version_count);

                    if (version_count >= 0) {
                        let today = new Date();
                        let plusDate = new Date();

                        $("#notifyNoVersion").slideUp();
                        $("#project-start").show();
                        $("#project-end").show();

                        $("#versionGaugeChart").html(""); //게이지 차트 초기화
                        var versionGauge = [];
                        var versionTimeline = [];
                        versionData.forEach(function (versionElement, idx) {
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
                                "id" : "timelineData",
                                "title" : "버전: "+versionElement.c_title,
                                "startDate" : (versionElement.c_pds_version_start_date == "start" ? today : versionElement.c_pds_version_start_date),
                                "endDate" : (versionElement.c_pds_version_end_date == "end" ? today : versionElement.c_pds_version_end_date)
                                //"endDate" : (versionElement.c_pds_version_end_date == "end" ? plusDate : versionElement.c_pds_version_end_date)
                            };
                            versionTimeline.push(timelineElement);
                        });

                        drawVersionProgress(versionGauge); // 버전 게이지
                        // 이번 달의 첫째 날 구하기
                        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

                        // 이번 달의 마지막 날 구하기
                        var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        // 이번달 일수 구하기
                        var daysCount  = lastDay.getDate();
                        // 오늘 일자 구하기
                        var day = today.getDate();
                          var today_flag = {
                            "title" : "오늘",
                            "startDate" : formatDate(firstDay),
                            "endDate" : formatDate(lastDay),
                            "id" : "today_flag"
                          };
                          versionTimeline.push(today_flag);

                        $("#version-timeline-bar").show();
                        Timeline.init($("#version-timeline-bar"), versionTimeline);

                        var basePosition = $("#today_flag").css("left");
                        var baseWidth = $("#today_flag").css("width");
                        var calFlagPosition = parseFloat(baseWidth)/daysCount*day;
                        var flagPosition = parseFloat(basePosition)+calFlagPosition+"px";

                        $("#today_flag").css("border-top-width", "150px");
                        $("#today_flag").css("width", "3px");
                        $("#today_flag").css("border-top-color", "rgba(255, 0, 0,0.78)");
                        $("#today_flag span").remove();
                        $("#timelineData .label").css("text-align", "left");
                        $("#today_flag").css("left", flagPosition);

                        // radarChart(pdservice_id, versionData);
                    }
                }
            }
        }
    });



}
function formatDate(date) {
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, "0");
  var day = date.getDate().toString().padStart(2, "0");
  return year + "-" + month + "-" + day;
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
                // console.log(data.response); // versionData

                versionListData = data.response.reduce((obj, item) => {
                    obj[item.c_id] = item;
                    return obj;
                }, {});

                var pdServiceVersionIds = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceVersionIds.push(obj.c_id);
                    var newOption = new Option(obj.c_title, obj.c_id, true, false);
                    $(".multiple-select").append(newOption);
                }

                selectedVersionId = pdServiceVersionIds.join(',');

                statisticsMonitor($("#selected_pdService").val(), selectedVersionId);

                showStatusesCountBox();
                getReqLinkedIssueCountAndRate($("#selected_pdService").val(), selectedVersionId, true);
                getReqLinkedIssueCountAndRate($("#selected_pdService").val(), selectedVersionId, false);

                combinationChart($("#selected_pdService").val(), selectedVersionId);

                getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);
                calendarHeatMap($("#selected_pdService").val(), selectedVersionId);

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

function calculateDateDiff(date1, date2) {
    return Math.floor((new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24));
}

function progressShow(today, start_date, end_date) {
    var totalDate = calculateDateDiff(end_date, start_date);
    var remainingDate = calculateDateDiff(end_date, today);
    var isExceeded = remainingDate < 0;
    var absoluteRemainingDate = isExceeded ? Math.abs(remainingDate) : Math.abs(remainingDate);
    var progress = totalDate === 0 ? 0 : ((absoluteRemainingDate / totalDate) * 100).toFixed(2);

    $('.isExceed').text(isExceeded ? " 초과" : "").css("color", isExceeded ? "#FF4D4D" : "none");
    $('#remaining_days').text(absoluteRemainingDate).css("color", isExceeded ? "#FF4D4D" : "");
    $('#version_progress').text(progress).css("color", isExceeded ? "#FF4D4D" : "");
}

function getReqLinkedIssueCountAndRate(pdservice_id, pdServiceVersionLinks, isReq) {

    var _url = "/auth-user/api/arms/analysis/time/normal-version/"+pdservice_id;
    $.ajax({
        url: _url,
        type: "GET",
        data: {
            "서비스아이디" : pdservice_id,
            "메인그룹필드" : "status.status_name.keyword",
            "isReq" : isReq,
            "컨텐츠보기여부" : false,
            "크기" : 1000,
            "pdServiceVersionLinks" : pdServiceVersionLinks
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                if(isReq === true) {
                    calculateCompletion(data, "completed_req_count", "total_req_count", "req_completion_rate", "progress_req_status");

                } else {
                    calculateCompletion(data, "completed_linked_issue_count", "total_linked_issue_count", "linked_issue_completion_rate", "progress_linked_issue_status");
                }
            }
        }
    });
}

function calculateCompletion(data, completedId, totalId, rateId, progressId) {
    $('#' + progressId).empty();
    var totalCount = data["전체합계"];
    var result = data["검색결과"]["group_by_status.status_name.keyword"];
    console.log(progressId);
    var completedCount = 0;
    result.forEach((item) => {
        var count = item["개수"];
        completedCount += count;

        var key = item["필드명"];
        var value = count;

        var html_piece = 	"<div	class=\"controls form-group darkBack\"\n" +
            "		style=\"margin-bottom: 5px !important; padding-top: 5px !important;\">\n" +
            "<span>✡ " + key + " : <a id=\"alm_server_count\" style=\"font-weight: bold;\"> " + value + "</a> 개</span>\n" +
            "</div>";
       // console.log(html_piece);
        $("#" + progressId).append(html_piece);
    });
    $("#" + totalId).text(totalCount);

    /*$("#" + completedId).text(completedCount + " 개");


    var completion = 0;
    if (totalCount !== 0 ) {
        completion = ((completedCount/totalCount) * 100).toFixed(0);
    }

    $("#" + rateId).text(completion + "%").css("width", completion +"%");*/

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

    // percent = 0.55;
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

    const today = new Date(data[0].current_date);
    today.setHours(0,0,0,0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

    // 시작일과 종료일은 'YYYY-MM-DD' 형식의 문자열로 가정
    const startDate = new Date(fastestStartDate);
    startDate.setHours(0,0,0,0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

    const endDate = new Date(latestEndDate);
    endDate.setHours(0,0,0,0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

    var diffStart = (today - startDate) / (1000 * 60 * 60 * 24); // 오늘 날짜와 시작일 사이의 차이를 일 단위로 계산
    var diffEnd = (today - endDate) / (1000 * 60 * 60 * 24); // 오늘 날짜와 종료일 사이의 차이를 일 단위로 계산

    $("#startDDay").css("color", "");
    $("#endDDay").css("color", "");

    if(diffStart > 0) {
        console.log("시작일은 오늘보다 이전입니다.");
        $("#startDDay").text("D + " + diffStart);
    } else if(diffStart === 0) {
        console.log("오늘은 시작일입니다.");
        $("#startDDay").text("D - day");
    } else {
        console.log("시작일은 오늘보다 이후입니다.");
        diffStart *= -1;
        $("#startDDay").text("D - " + diffStart);
    }

    if(diffEnd > 0) {
        console.log("종료일은 오늘보다 이전입니다.");
        $("#endDDay").css("color", "#FF4D4D").css("font-weight", "bold").text("D + " + (diffEnd)).append(" 초과");
    } else if(diffEnd === 0) {
        console.log("오늘은 종료일입니다.");
        $("#endDDay").text("D - day");
    } else {
        console.log("종료일은 오늘보다 이후입니다.");
        diffEnd *= (-1);
        $("#endDDay").text("D - " + diffEnd);
    }

    totalDate = Math.floor(
        Math.abs((new Date(latestEndDate) - new Date(fastestStartDate)) / (1000 * 60 * 60 * 24)) + 1
    );

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

    var needleAngle = (diffStart+1) / totalDate;

    if (needleAngle > 1) {
        needleAngle = 1;
    }
    else if (needleAngle < 0) {
        needleAngle = 0;
    }

    needle.animateOn(chart, needleAngle);

    progressShow(today, startDate, endDate);
}

////////////////////
// 세번째 박스
////////////////////
/*
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

                result.forEach(item => {
                    if (versionListData[item.필드명]) {
                        versionListData[item.필드명].totalCount = item.개수;
                    }
                });

                Object.values(versionListData).forEach(item => {
                    var version = {};
                    version.text = item.c_title;
                    version.max = maxCount;

                    versionText.push(version);
                    reqCount.push(item.totalCount);
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
*/


// 바차트
function combinationChart(pdServiceLink, pdServiceVersionLinks) {
    function combinationChartNoData() {

        $('#status-chart').html('데이터가 없습니다').css({
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center'
        });

        // c3.generate({
        //     bindto: '#combination-chart',
        //     data: {
        //         x: 'x',
        //         columns: [],
        //         type: 'bar',
        //         types: {},
        //     },
        // });
    }

    if(pdServiceLink === "" || pdServiceVersionLinks === "") {
        combinationChartNoData();
        return;
    }

    const url = new UrlBuilder()
        .setBaseUrl('/auth-user/api/arms/analysis/time/daily-requirements-jira-issue-statuses')
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
                for (const day in data) {
                    for (const status in data[day].statuses) {
                        //console.log('status ', status);
                        issueStatusTypesSet.add(status);
                    }
                }
                const issueStatusTypes = [...issueStatusTypesSet];

                let columnsData = [];
                let dayTotal = {};

                issueStatusTypes.forEach((status) => {
                    const columnData = [status];
                    for (const day in data) {
                        const count = data[day].statuses[status] || 0;
                        columnData.push(count);
                        dayTotal[day] = (dayTotal[day] || 0) + count;

                        //console.log(`Day: ${day}, Status: ${status}, Count: ${count}, dayTotal: ${dayTotal[day]}`);
                    }
                    columnsData.push(columnData);
                });

                // 차트 x축 날짜값 포맷팅
                let keys = Object.keys(data).map(key => {
                    let [year, month, day] = key.split('-');
                    return `${month}/${day}`;
                });

                const chart = c3.generate({
                    bindto: '#status-chart',
                    data: {
                        x: 'x',
                        columns: [
                            ['x', ...keys],
                            ...columnsData,
                            ['전체이슈', ...Object.keys(dayTotal).map(day => dayTotal[day])],
                        ],
                        type: 'bar',
                        types: {
                            '전체이슈': 'area',
                        },
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
                                const day = Object.keys(data)[index];
                                const total = dayTotal[day];
                                return `${day} | Total : ${total}`;
                            },
                        },
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                            // 기본 툴팁 생성
                            let tooltipHtml = this.getTooltipContent.apply(this, arguments);
                            // 툴팁 HTML 파싱
                            let parsedHtml = $.parseHTML(`<div>${tooltipHtml}</div>`);
                            // '전체이슈' 행 제거
                            $(parsedHtml).find('tr').each(function() {
                                if ($(this).find('td').first().text() === '전체이슈') {
                                    $(this).remove();
                                }
                            });
                            // 다시 HTML 문자열로 변환
                            return $(parsedHtml).html();
                        }
                    }
                });

                $(document).on('click', '#status-chart .c3-legend-item', function () {
                    const id = $(this).text();
                    const isHidden = $(this).hasClass('c3-legend-item-hidden');

                    for (const day in data) {
                        const docCount = data[day].statuses[id] || 0;

                        if (isHidden) {
                            dayTotal[day] -= docCount;
                        } else {
                            dayTotal[day] += docCount;
                        }
                    }
                });

                let isGrouped = false; // 차트 그룹화 여부

                $('#status-chart-button').on('click', function() {
                    if (isGrouped) {
                        // 그룹화 해제
                        chart.groups([]);
                        $(this).text('그룹화 적용');
                    } else {
                        // 그룹화
                        chart.groups([issueStatusTypes]);
                        $(this).text('그룹화 해제');
                    }
                    isGrouped = !isGrouped;
                });
            }
        }
    });
}

////////////////////
// 다섯번째 박스
////////////////////
/*function networkChart(pdServiceVersions, jiraIssueData) {
    d3.select(".network-graph").selectAll("*").remove();

    var NETWORK_DATA = {
        "nodes": [],
        "links": []
    };

    pdServiceData.id = pdServiceData.c_id;
    pdServiceData.type = "pdService";
    NETWORK_DATA.nodes.push(pdServiceData);

    var targetIds = pdServiceVersions.split(',').map(Number);
    var versionList = pdServiceData.pdServiceVersionEntities;

    versionList.forEach((item)=> {
        if (targetIds.includes(item.c_id)) {
            item.id = item.c_id;
            item.type = "version";
            NETWORK_DATA.nodes.push(item);

            console.log(typeof item.id);
            var link = {
                source: item.id,
                target: pdServiceData.c_id
            };
            NETWORK_DATA.links.push(link);
        }
    });

    var index = {};

    jiraIssueData.forEach(function(item) {
        NETWORK_DATA.nodes.push(item);
        index[item.key] = item;
    });

    jiraIssueData.forEach(function(item) {
        if (item.isReq === true) {
            var versionLink = {
                source: item.id,
                target: item.pdServiceVersion
            };

            NETWORK_DATA.links.push(versionLink);
        }

        var parentItem = index[item.parentReqKey];

        if (parentItem) {
            var link = {
                source: item.id,
                target: parentItem.id
            };
            NETWORK_DATA.links.push(link);
        }
    });

    if (NETWORK_DATA.nodes.length === 0) { // 데이터가 없는 경우를 체크
        d3.select("#NETWORK_GRAPH").remove();
        d3.select(".network-graph").append("p").text('데이터가 없습니다.');
        return;
    }

    d3.select(".network-graph").append("svg").attr("id","NETWORK_GRAPH");

    /!******** network graph config ********!/
    var networkGraph = {
        createGraph : function(){
            var links = NETWORK_DATA.links.map(function(d){
                return Object.create(d);
            });
            var nodes = NETWORK_DATA.nodes.map(function(d){
                return Object.create(d);
            });
            var fillCircle = function(g){
                if (g.type === "pdService") {
                    return "#c67cff";
                } else if (g.type === "version") {
                    return "rgb(255,127,14)";
                } else if (g.isReq === true) {
                    return "rgb(214,39,40)";
                } else if (g.isReq === false) {
                    return "rgb(31,119,180)";
                } else {
                    return "rgb(44,160,44)";
                }
            };

            var typeBinding = function(g) {
                var name = '';

                if (g.type === "pdService") {
                    name = '제품(서비스)';
                } else if (g.type === "version") {
                    name = '버전';
                } else if (g.isReq === true) {
                    name = '요구사항';
                } else if (g.isReq === false) {
                    name = '연결된 이슈';
                }

                return "[" + name + "]";
            };

            var nameBinding = function(g) {
                var name = '';

                if (g.type === "pdService") {
                    return g.c_title;
                } else if (g.type === "version") {
                    return g.c_title;
                } else {
                    return g.key;
                }
            };

            var width = 500;
            var height = 500;

            var simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id( function(d){ return d.id; }))
                .force("charge", d3.forceManyBody().strength(-100))
                .force("center", d3.forceCenter(width / 3, height / 3));
            // .force("collide",d3.forceCollide().radius( function(d){ return d.value*8}) );

            //simulation.stop(); // stop 필요한가?

            var svg = d3.select("#NETWORK_GRAPH")
                .attr("viewBox", [0, 0, width, height]);

            var initScale;

            if (NETWORK_DATA.nodes.length > 200) {
                initScale = 0.2;
            } else if (NETWORK_DATA.nodes.length > 90) {
                initScale = 0.4;
            } else {
                initScale = 1;
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

            /!*
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
              .style("font-size", "12px") *!/

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
                        .attr("fill", fillCircle(d));
                    /!*d3.select(this)
                        .append("text").text(d.id)
                        .attr("dy",6)
                        .style("text-anchor","middle")
                        .attr("class", "node-label");*!/
                }).call(networkGraph.drag(simulation));

            node.append("text")
                .attr("x", 11)
                .attr("dy", ".31em")
                .style("font-size", "9px")
                .style("fill", (d) => fillCircle(d))
                .style("font-weight", "5")
                .attr("stroke", "white")
                .attr("stroke-width", "0.3")
                .text((d) => typeBinding(d));

            node.append("text")
                .attr("x", 12)
                .attr("dy", "1.5em")
                .style("font-family", "Arial")
                .style("font-size", "10px")
                .style("font-weight", "10")
                .text((d) => nameBinding(d));

            simulation.on("tick", function(){
                link.attr("x1", function(d){ return d.source.x; })
                    .attr("y1", function(d){ return d.source.y; })
                    .attr("x2", function(d){ return d.target.x; })
                    .attr("y2", function(d){ return d.target.y; });

                /!*node
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; });*!/

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

    /!******** network graph create ********!/
    networkGraph.createGraph();
}*/

function formatDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');

    return year + '-' + month + '-' + day;
}

function calendarHeatMap(pdServiceLink, pdServiceVersions) {

    $('#calendar_yearview_blocks_chart_1 svg').remove();
    $('#calendar_yearview_blocks_chart_2 svg').remove();

    $.ajax({
        url: "/auth-user/api/arms/analysis/time/heatmap",
        type: "GET",
        data: {"pdServiceLink": pdServiceLink, "pdServiceVersionLinks": pdServiceVersions},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        async: true,
        statusCode: {
            200: function (data) {
                // scatterChart(data);

                $(".update-title").show();

                $('#calendar_yearview_blocks_chart_1').calendar_yearview_blocks({
                    data: JSON.stringify(data.requirement),
                    start_monday: true,
                    always_show_tooltip: true,
                    month_names: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],
                    day_names: ['mo', 'wed', 'fri', 'sun'],
                    colors: data.requirementColors
                });

                /*var heatMapBarHtml = `<div id="heatmap-bar" className="time_element"></div>`;
                $('#calendar_yearview_blocks_chart_1').append(heatMapBarHtml);*/

                $('#calendar_yearview_blocks_chart_2').calendar_yearview_blocks({
                    data: JSON.stringify(data.relationIssue),
                    start_monday: true,
                    always_show_tooltip: true,
                    month_names: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
                    day_names: ['mo', 'wed', 'fri', 'sun'],
                    colors: data.relationIssueColors
                });

                d3.select("#heatmap-body").style("overflow-x","scroll");
            }
        }
    });

}

/*function calendarHeatMap(jiraIssueData, pdServiceLink, pdServiceVersions) {

    var jiraIssueBackupData;

    $('#calendar_yearview_blocks_chart_1 svg').remove();
    $('#calendar_yearview_blocks_chart_2 svg').remove();

    var requirement = {};
    var relation_issue = {};
    var requirement_colors = [];
    var relation_issue_colors = [];

    jiraIssueData.forEach(item => {
        console.log(item.summary);
        if(item.isReq === true) {
            heatmapDataParsing(requirement, item, requirement_colors);
        }
        else {
            heatmapDataParsing(relation_issue, item, relation_issue_colors);
        }
    });

    function heatmapDataParsing(return_object, item, return_colors) {
        var display_date = formatDate(new Date(item.updated));
        console.log(display_date + " : " +item.updated);
        console.log(item.summary);
        if (return_object[display_date] === undefined) {
            return_object[display_date] = {};
            return_object[display_date].items = [];
        }

        if (!return_object[display_date].items.includes(item.summary)) {
            return_object[display_date].items.push(item.summary);
            return_colors.push(item.summary);
        }
    }

    var requirementHeatMapData = JSON.stringify(requirement);
    var relationIssuetHeatMapData = JSON.stringify(relation_issue);

    console.log(requirementHeatMapData);
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

    /!*var heatMapBarHtml = `<div id="heatmap-bar" className="time_element"></div>`;
    $('#calendar_yearview_blocks_chart_1').append(heatMapBarHtml);*!/

    $('#calendar_yearview_blocks_chart_2').calendar_yearview_blocks({
        data: relationIssuetHeatMapData,
        start_monday: true,
        always_show_tooltip: true,
        month_names: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        day_names: ['mo', 'wed', 'fri', 'sun'],
        colors: issue_colors
    });

    d3.select("#heatmap-body").style("overflow-x","scroll");
}*/


////////////////////
// 여섯번째 박스
////////////////////

function statusTimeline(data) {

    // 필요한 데이터만 추출
    var extractedData = extractDataForStatusTimeline(data);

    // 버전 별로 그룹화
    var groupedDataByVersion = groupingByVersion(extractedData);

    // 데이터 포맷팅
    var relatedIssues = dataFormattingForStatusTimeline(groupedDataByVersion);

    // 요소 호버
    $(".reqNode").hover(
        function() {

            $(this).find('title').text('');
            var classValue = $(this).attr('class');
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

function groupingByVersion(data) {

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
        var versionData = convertVersionIdToTitle(version); // text (버전)
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

////////////////////
// 일곱번째 박스
////////////////////

function sevenTimeline(data) {
    var sevenTimeLineDiv = document.getElementById("sevenTimeLine");
    sevenTimeLineDiv.innerHTML = "";

    if (typeof data === 'object' && Object.keys(data).length > 0) {
        //필요한 데이터만 추출
        var extractedData = extractDataForSevenTimeline(data);
        // 버전 별 그룹화
        var groupedData = groupingByVersion(extractedData);
        var myData = [];
        var myData = dataFormattingForSevenTimeLine(groupedData);
        TimelinesChart()('#sevenTimeLine')
            .width(1440)
            .maxHeight(3000)
            .maxLineHeight(30)
            .zQualitative(true)
            .data(myData)
            .refresh();
    } else {
        var pElement = document.createElement("p");
        pElement.textContent = "데이터가 없습니다.";
        sevenTimeLineDiv.appendChild(pElement);
    }
}
//  필요한 데이터만 추출
function extractDataForSevenTimeline(data){
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
    var extractedData = extractDataForSevenTimeline(data);
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
            var groupByReqIssueData = {
                group: reqIssue.issueKey,
                data: []
            };

            var childData = groupedByVersionData[version].filter(issue => issue.parentReqKey === groupByReqIssueData.group);
            groupByReqIssueData.data.push({
                label: "요구사항 이슈",
                data: [{
                    timeRange: [reqIssue.createdDate, reqIssue.resolutionDate],
                    val: convertVersionIdToTitle(reqIssue.version)
                }]
            });
            childData.forEach(child => {
                groupByReqIssueData.data.push({
                    label: child.issueKey,
                    data: [{
                        timeRange: [child.createdDate, child.resolutionDate],
                        val: convertVersionIdToTitle(child.version)
                    }]
                });
            });
            formattedData.push(groupByReqIssueData);
        });
    }

    return formattedData;
}

function convertVersionIdToTitle(versionId) {
    if (versionListData.hasOwnProperty(versionId)) {
        var version = versionListData[versionId];
        return version.c_title;
    }
}

function scatterChart(data) {
    console.log(data);
    var requirementDataCount = {};
    var relationIssueDataCount = {};

    data.forEach(jiraissue => {
        if(jiraissue.updated === null || jiraissue.updated === undefined) {
            return;
        }

        var updatedDate = jiraissue.updated.split('T')[0];

        if (jiraissue.isReq === true) {
            if (!requirementDataCount[updatedDate]) {
                requirementDataCount[updatedDate] = 0;
            }
            requirementDataCount[updatedDate]++;
        } else {
            if (!relationIssueDataCount[updatedDate]) {
                relationIssueDataCount[updatedDate] = 0;
            }
            relationIssueDataCount[updatedDate]++;
        }
    });

    var requirementData = Object.keys(requirementDataCount).map(key => {
        var dateObj = new Date(key+'T00:00:00');
        return [dateObj, requirementDataCount[key]];
    });

    var relationIssueData = Object.keys(relationIssueDataCount).map(key => {
        var dateObj = new Date(key+'T00:00:00');
        return [dateObj, relationIssueDataCount[key]];
    });


    var dom = document.getElementById('scatter-chart-container');

    var myChart = echarts.init(dom, 'dark', {
        renderer: 'canvas',
        useDirtyRect: false
    });
    var app = {};

    var option;

    if ((requirementData && requirementData.length > 0) || (relationIssueData && relationIssueData.length > 0) ) {

        option = {
            aria: {
                show: true
            },
            legend: {
                data: ['요구사항' , '연결된 이슈'] // 여기에 실제 데이터 종류를 적어주세요
            },
    /*        toolbox: {
                left: 'left',
                feature: {
                    dataView: {},
                    saveAsImage: {},
                    dataZoom: {}
                }
            },*/
            xAxis: {
                type: 'time',
                splitLine: {
                    show: true
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: true
                }
            },
            series: [
                {
                    name: '요구사항',
                    data: requirementData,
                    type: 'scatter',
                    symbol: 'diamond',
                    label: {
                        emphasis: {
                            show: true,
                            color: '#FFFFFF'
                        }
                    },
                    symbolSize: function (val) {
                        var sbSize = 10;
                        if (val[1] > 10) {
                            sbSize = val[1] * 1.1;
                        }
                        return sbSize;
                    },
                },
                {
                    name: '연결된 이슈',
                    data: relationIssueData,
                    type: 'scatter',
                    label: {
                        emphasis: {
                            show: true
                        }
                    },
                    symbolSize: function (val) {
                        var sbSize = 10;
                        if (val[1] > 10) {
                            sbSize = val[1] * 1.1;
                        }
                        return sbSize;
                    },
                    itemStyle: {
                        color: '#13de57'
                    },
                }
            ],
            tooltip: {
                trigger: 'axis',
                position: 'top',
                borderWidth: 1,
                axisPointer: {
                    type: 'cross'
                }
            },
            backgroundColor: 'rgba(255,255,255,0)',
            animationDelay: function (idx) {
                return idx * 20;
            },
            animationDelayUpdate: function (idx) {
                return idx * 20;
            }
        };

        myChart.on('click', function (params) {
            console.log(params.data);
        });

    }
    else {
        option = {
            title: {
                text: '데이터가 없습니다',
                left: 'center',
                top: 'middle'
            },
            backgroundColor: 'rgba(255,255,255,0)',
        };
    }

    if (option && typeof option === 'object') {
        myChart.setOption(option, true);
    }

    window.addEventListener('resize', myChart.resize);
}