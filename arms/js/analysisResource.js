//////////////////
//Document Ready
//////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId;   // 선택된 버전 아이디
var dataTableRef;
var mailAddressList;
var dashboardColor;
var req_count, linkedIssue_subtask_count, resource_count, req_in_action, total_days_progress;
var labelType, useGradients, nativeTextSupport, animate; //투입 인력별 요구사항 관여 차트
var resourceSet = new Set(); // 담당자 set
var searchMap = [
    { "field" : "priority.priority_name.keyword",     "reqId" : "req-priority-bar",  "subId" :"subtask-priority-bar"},
    { "field" : "status.status_name.keyword",         "reqId" : "req-status-bar",    "subId" :"subtask-status-bar"},
    { "field" : "issuetype.issuetype_name.keyword",   "reqId" : "req-issuetype-bar", "subId" :"subtask-issuetype-bar"}
];
var table;

function execDocReady() {

    var pluginGroups = [
        [	"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
            "../reference/light-blue/lib/jquery.iframe-transport.js",
            "../reference/light-blue/lib/jquery.fileupload.js",
            "../reference/light-blue/lib/jquery.fileupload-fp.js",
            "../reference/light-blue/lib/jquery.fileupload-ui.js",
            //d3
            "../reference/jquery-plugins/d3-v4.13.0/d3.v4.min.js",
            // "./js/common/colorPalette.js",
            //chart Colors
            "./js/dashboard/chart/colorPalette.js",
            // Apache Echarts
            "../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js",
        ],

        [	"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

        [	"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
            "../reference/light-blue/lib/bootstrap-datepicker.js",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js",
            "../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
            // 제품-버전-투입인력 차트
            "../reference/jquery-plugins/d3-sankey-v0.12.3/d3-sankey.min.js",
        ],
        [
            "js/common/table.js",
            "js/analysis/api/resourceApi.js",
            "js/analysis/table/workerStatusTable.js",
            "js/analysis/resource/chart/horizontalBarChart.js",
            "js/analysis/resource/chart/simplePie.js",
            "js/analysis/resource/chart/basicRadar.js"
        ],

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
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js",
            "../reference/jquery-plugins/jQCloud-2.0.3/dist/jqcloud.js",
            "../reference/jquery-plugins/jQCloud-2.0.3/dist/jqcloud.css",
            "../arms/js/analysis/resource/sankey.js"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function() {
            // 사이드 메뉴 색상 설정
            $('.widget').widgster();
            setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_resource");
            dashboardColor = dashboardPalette.dashboardPalette01;

            //제품(서비스) 셀렉트 박스 이니시에이터
            makePdServiceSelectBox();

            //버전 멀티 셀렉트 박스 이니시에이터
            makeVersionMultiSelectBox();
            
            //데이터테이블초기화
            table = initTable();
        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}

function stackedHorizontalBar(){
    // 0 or ""
    const defaultValue = 0;

    function getStatusCounts(data, statusTypes) {
        let statusCounts = {};

        data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"].forEach(item => {
            let itemStatusCounts = {};
            if (item["하위검색결과"]["group_by_status.status_name.keyword"]) {
                item["하위검색결과"]["group_by_status.status_name.keyword"].forEach(status => {
                    itemStatusCounts[status["필드명"]] = status["개수"];
                });
            }

            statusTypes.forEach(statusType => {
                if (!itemStatusCounts[statusType]) {
                    itemStatusCounts[statusType] = defaultValue;
                }
            });

            statusCounts[item["필드명"]] = itemStatusCounts;
        });

        return statusCounts;
    }
    function stackedBarChartInit(data) {
        let chartDom = document.getElementById('apache-echarts-stacked-horizontal-bar');

        let myChart = echarts.init(chartDom);

        const sortedData = data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"].sort((a, b) => a.개수 - b.개수);

        const jiraIssueStatuses = sortedData.reduce((acc, item) => {
            if (item["하위검색결과"]["group_by_status.status_name.keyword"]) {
                item["하위검색결과"]["group_by_status.status_name.keyword"].forEach(status => {
                    acc.add(status["필드명"]);
                });
            }
            return acc;
        }, new Set());

        const statusTypes = Array.from(jiraIssueStatuses);

        const statusCounts = getStatusCounts(data, statusTypes);

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow' // 'line' or 'shadow'. 기본값은 'shadow'
                },
                formatter: function (params) {
                    const tooltip = params.reduce((acc, param) => {
                        const { marker, seriesName, value } = param;
                        acc += `${marker}${seriesName}: ${value}<br/>`;
                        return acc;
                    }, '');

                    const totalCount = params.reduce((acc, param) => acc + param.value, 0);
                    const totalTooltip = `Total: ${totalCount}<br/>`;

                    return totalTooltip + tooltip;
                }
            },
            legend: {
                left: 'left',
                data: statusTypes,
                textStyle: {
                    color: 'white',
                    fontSize: 11
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLabel: {
                    textStyle: {
                        color: 'white',
                        fontWeight: "",
                        fontSize: "11"
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: 'white',
                        width: 0.2,
                        opacity: 0.5
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: sortedData.map(function(item) {return getIdFromMail(item["필드명"]);}),
                axisLabel: {
                    textStyle: {
                        color: 'white',
                        fontWeight: "",
                        fontSize: "11"
                    }
                }
            },
            series: statusTypes.map(statusType => {
                const data = Object.values(statusCounts).map(statusCount => statusCount[statusType] || defaultValue);
                return {
                    name: statusType,
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: data
                };
            })
        };

        option && myChart.setOption(option);

        window.addEventListener('resize', function () {
            myChart.resize();
        });
    }

    const url = new UrlBuilder()
        .setBaseUrl(`/auth-user/api/arms/dashboard/aggregation/flat`)
        .addQueryParam('pdServiceLink', selectedPdServiceId)
        .addQueryParam('pdServiceVersionLinks', selectedVersionId)
        .addQueryParam('메인그룹필드', "assignee.assignee_emailAddress.keyword")
        .addQueryParam('하위그룹필드들', "status.status_name.keyword,assignee.assignee_displayName.keyword")
        .addQueryParam('크기', 1000)
        .addQueryParam('하위크기', 1000)
        .addQueryParam('컨텐츠보기여부', true)
        .addQueryParam("isReqType", "ISSUE")
        .build();


    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (apiResponse) {
                stackedBarChartInit(apiResponse.response);
            }
        }
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
        selectedPdServiceId = $("#selected_pdService").val();
        refreshDetailChart(); 수치_초기화();
        // 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
        // 디폴트는 base version 을 선택하게 하고 ( select all )
        //~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
        bind_VersionData_By_PdService();



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

            refreshDetailChart(); 수치_초기화();

            // 요구사항 및 연결이슈 통계
            getReqAndLinkedIssueData(selectedPdServiceId, selectedVersionId);
            // 작업자별 상태
            drawResource(selectedPdServiceId, selectedVersionId);

            drawProductToManSankeyChart($("#selected_pdService").val(), selectedVersionId);
            drawManRequirementTreeMapChart($("#selected_pdService").val(), selectedVersionId);
            stackedHorizontalBar();
            wordCloud();
        }
    });
}

function wordCloud() {
    $('#tag-cloud').jQCloud('destroy');

    const url = new UrlBuilder()
        .setBaseUrl(`/auth-user/api/arms/dashboard/aggregation/flat`)
        .addQueryParam('pdServiceLink', selectedPdServiceId)
        .addQueryParam('pdServiceVersionLinks', selectedVersionId)
        .addQueryParam('메인그룹필드', "assignee.assignee_accountId.keyword")
        .addQueryParam('하위그룹필드들', "assignee.assignee_displayName.keyword")
        .addQueryParam('크기', 1000)
        .addQueryParam('하위크기', 1000)
        .addQueryParam('컨텐츠보기여부', true)
        .addQueryParam("isReqType", "ISSUE")
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (apiResponse) {
                const data = apiResponse.response;
                let words = data['검색결과']["group_by_assignee.assignee_accountId.keyword"].map(item => ({
                    text: item["하위검색결과"]["group_by_assignee.assignee_displayName.keyword"][0]["필드명"],
                    weight: item["하위검색결과"]["group_by_assignee.assignee_displayName.keyword"][0]["개수"]
                }));

                $('#tag-cloud').jQCloud(words);
            }
        }
    });



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
                var pdServiceVersionIds = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceVersionIds.push(obj.c_id);
                    var newOption = new Option(obj.c_title, obj.c_id, true, false);
                    $(".multiple-select").append(newOption);
                }
                refreshDetailChart(); 수치_초기화();
                selectedVersionId = pdServiceVersionIds.join(',');
                // 요구사항 및 연결이슈 통계
                getReqAndLinkedIssueData(selectedPdServiceId, selectedVersionId);
                // 작업자별 상태 - dataTable
                drawResource(selectedPdServiceId, selectedVersionId);

                drawProductToManSankeyChart(selectedPdServiceId, selectedVersionId);
                drawManRequirementTreeMapChart(selectedPdServiceId, selectedVersionId);
                stackedHorizontalBar();
                wordCloud();
                

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


function getReqAndLinkedIssueData(pdservice_id, pdServiceVersionLinks) {
    $.ajax({
        url: "/auth-user/api/arms/analysis/resource/workerStatus/"+pdservice_id,
        type: "GET",
        data: { "서비스아이디" : pdservice_id,
            "pdServiceVersionLinks" : pdServiceVersionLinks,
            "메인그룹필드" : "isReq",
            "하위그룹필드들": "assignee.assignee_emailAddress.keyword",
            "컨텐츠보기여부" : true,
            "크기" : 1000},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {

                //전체 요구사항, 연결이슈
                let all_req_count = 0;
                let all_linkedIssue_subtask_count = 0;
                //담당자존재 요구사항, 연결이슈
                let assignedReqSum = 0;
                let assignedSubtaskSum = 0;
                //담당자 미지정 요구사항,연결이슈
                let no_assigned_req_count = 0;
                let no_assigned_linkedIssue_subtask_count =0;

                //요구사항,연결이슈 파이차트용 데이터배열
                let reqDataMapForPie = [];
                let subtaskDataMapForPie = [];
                console.log(data);
                if (data["전체합계"] === 0) {
                    alert("작업자 업무 처리현황 데이터가 없습니다.");
                    수치_초기화();
                } else {
                    let isReqGrpArr = data["검색결과"]["group_by_isReq"];
                    isReqGrpArr.forEach((elementArr,index) => {
                        if(elementArr["필드명"] == "true") {
                            all_req_count = elementArr["개수"];
                            let tempArrReq= elementArr["하위검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                            tempArrReq.forEach(e => {
                                assignedReqSum+=e["개수"];
                                reqDataMapForPie.push({name: getIdFromMail(e["필드명"]), value: e["개수"]});
                            });
                            no_assigned_req_count = all_req_count - assignedReqSum;
                        }
                        if(elementArr["필드명"] == "false") {
                            all_linkedIssue_subtask_count = elementArr["개수"];
                            let tempArrReq= elementArr["하위검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                            tempArrReq.forEach(e => {
                                assignedSubtaskSum+=e["개수"];
                                subtaskDataMapForPie.push({name: getIdFromMail(e["필드명"]), value: e["개수"]});
                            });
                            no_assigned_linkedIssue_subtask_count = all_linkedIssue_subtask_count - assignedSubtaskSum;
                        }
                    });
                    // 총 요구사항 및 연결이슈 수
                    $('#total_req_count').text(all_req_count);
                    $('#total_linkedIssue_subtask_count').text(all_linkedIssue_subtask_count);

                    // 담당자 지정 - 요구사항 및 연결이슈
                    req_count = assignedReqSum;
                    $('#req_count').text(assignedReqSum);
                    linkedIssue_subtask_count = assignedSubtaskSum;
                    $('#linkedIssue_subtask_count').text(assignedSubtaskSum);

                    // 담당자 미지정 - 요구사항 및 연결이슈
                    $('#no_assigned_req_count').text(no_assigned_req_count);
                    $('#no_assigned_linkedIssue_subtask_count').text(no_assigned_linkedIssue_subtask_count);

                }
                // 작업자수 및 평균계산
                getAssigneeInfo(pdservice_id,pdServiceVersionLinks);
                getExpectedEndDate(pdservice_id,pdServiceVersionLinks, all_req_count);

                // 요구사항 및 연결이슈 파이차트
                drawSimplePieChart("req_pie","요구사항",reqDataMapForPie);
                drawSimplePieChart("linkedIssue_subtask_pie","연결이슈 및 하위작업",subtaskDataMapForPie);
            },
            error: function (e) {
                jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
            }
        }
    });
}

var initTable = function () {
    var workerStatusTable = new $.fn.WorkerStatusTable("#analysis_worker_status_table");

    workerStatusTable.dataTableBuild({
        rowGroup: [0],
        isAddCheckbox: true
    });

    workerStatusTable.onDataTableClick = function (selectedData) {
        disposeDetailChartInstance();
        resourceSet.add(selectedData["필드명"]);
        getDetailCharts(selectedPdServiceId, selectedVersionId);
    };

    workerStatusTable.onDeselect = function (selectedData) {
        disposeDetailChartInstance();
        resourceSet.delete(selectedData["필드명"]);
        getDetailCharts(selectedPdServiceId, selectedVersionId);
    };

    return {
        redrawTable: workerStatusTable.reDraw.bind(workerStatusTable)
    };
};

var drawResource = function (pdservice_id, pdServiceVersionLinks) {
    var deferred = $.Deferred();
    var pdId = pdservice_id;
    var verLinks = pdServiceVersionLinks;

    ResourceApi.fetchResourceData(pdId, verLinks)
        .done( function() {
            var fetchedReousrceData = ResourceApi.getFetchedResourceData();

            table.redrawTable(fetchedReousrceData);

            deferred.resolve();
        }
    );

    return deferred.promise();
};

function getAssigneeInfo(pdservice_id, pdServiceVersionLinks) {
    mailAddressList = [];
    $.ajax({
        url: "/auth-user/api/arms/analysis/resource/workerStatus/"+pdservice_id,
        type: "GET",
        data: { "서비스아이디" : pdservice_id,
                "pdServiceVersionLinks" : pdServiceVersionLinks,
                "메인그룹필드" : "assignee.assignee_emailAddress.keyword",
                "컨텐츠보기여부" : true,
                "크기" : 1000},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                let assigneesArr = data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];

                //제품(서비스)에 투입된 총 인원수
                resource_count = assigneesArr.length;
                if (data["전체합계"] === 0) { //담당자(작업자) 없음.
                    $('#resource_count').text("-");
                    $('#avg_req_count').text("-");
                    $('#avg_linkedIssue_count').text("-");
                    refreshDetailChart(); //상세 바차트 초기화
                } else {
                    assigneesArr.forEach((element,idx) =>{
                        mailAddressList.push(element["필드명"]);
                    });
                    $('#resource_count').text(resource_count);
                    $('#avg_req_count').text((req_count/resource_count).toFixed(1));
                    $('#avg_linkedIssue_count').text((linkedIssue_subtask_count/resource_count).toFixed(1));
                }
                getReqInActionCount(pdservice_id,pdServiceVersionLinks);
                //모든작업자 - 상세차트
                drawDetailChartForAll(pdservice_id, pdServiceVersionLinks,mailAddressList);
            },
            error: function (e) {
                jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
            }
        }
    });
}

function getReqInActionCount(pdService_id, pdServiceVersionLinks) {
    $.ajax({
        url: "/auth-user/api/arms/analysis/resource/reqInAction/"+pdService_id,
        type: "GET",
        data: { "서비스아이디" : pdService_id,
            "pdServiceVersionLinks" : pdServiceVersionLinks,
            "isReq" : false,
            "메인그룹필드" : "parentReqKey",
            "컨텐츠보기여부" : true,
            "크기" : 1000},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                req_in_action = data["parentReqCount"];
                let req_in_wait_count = req_count-req_in_action;
                if (req_in_action === "") {
                    $("#req_in_action_count").text("-");
                    $('#linkedIssue_subtask_count_per_req_in_action').text("-");
                } else {
                    if(req_in_action === 0) {
                        $('#linkedIssue_subtask_count_per_req_in_action').text("-");
                    } else {
                        $("#req_in_action_count").text(req_in_action);   //진행중 요구사항
                        $("#req_in_action_avg").text((resource_count !== 0 ? (req_in_action/resource_count).toFixed(1) : "-"));
                        $("#req_in_wait_count").text(req_in_wait_count); //작업대기 요구사항
                        $("#req_in_wait_avg").text((resource_count !== 0 ? (req_in_wait_count/resource_count).toFixed(1) : "-"));
                        $('#linkedIssue_subtask_count_per_req_in_action').text((linkedIssue_subtask_count/req_in_action).toFixed(1));
                    }
                }
                // 리소스-요구사항-일정 레이더차트
                getScheduleToDrawRadarChart(pdService_id,pdServiceVersionLinks);
            },
            error: function (e) {
                jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
            }
        }
    });
}

function refreshDetailChart() { // 차트8개 초기화
    disposeDetailChartInstance();
    resourceSet.clear();
}
function disposeDetailChartInstance() {
    searchMap.forEach((target) => {
        let reqChartInstance = echarts.getInstanceByDom(document.getElementById(target["reqId"]));
        let subtaskChartInstance = echarts.getInstanceByDom(document.getElementById(target["subId"]));
        if(reqChartInstance) { reqChartInstance.dispose(); };
        if(subtaskChartInstance) { subtaskChartInstance.dispose(); };
    });
}

function drawDetailOverallChart() {
    let mailList = mailAddressList;
    let mailStr ="";

    if (mailAddressList.length === 1) {
        mailStr = mailList[0];
    } else {
        for (let cnt = 0; cnt < mailList.length; cnt++) {
            if(cnt !== mailList.length-1) {
                mailStr += mailList[cnt] +",";
            } else {
                mailStr += mailList[cnt];
            }
        }
    }
    searchMap.forEach(
        (target, index) => {
            drawChartsPerPerson(selectedPdServiceId,selectedVersionId,mailStr, target["field"], target["reqId"], target["subId"]);
        }
    )
}
//공통코드-extract필요
function drawDetailChartForAll(pdservice_id, pdServiceVersionLinks, mailAddressList) {
    let mailList = mailAddressList;
    let mailStr ="";

    if (mailAddressList.length === 1) {
        mailStr = mailList[0];
    } else {
        for (let cnt = 0; cnt < mailList.length; cnt++) {
            if(cnt !== mailList.length-1) {
                mailStr += mailList[cnt] +",";
            } else {
                mailStr += mailList[cnt];
            }
        }
    }
    searchMap.forEach(
        (target, index) => {
            drawChartsPerPerson(pdservice_id,pdServiceVersionLinks,mailStr, target["field"], target["reqId"], target["subId"]);
        }
    )
}

function getDetailCharts(pdservice_id, pdServiceVersionLinks) {
    let mailList = [];
    let mailStr ="";

    resourceSet.forEach((e)=>{mailList.push(e)});
    if (mailList.length === 1) {
        mailStr = mailList[0];
    } else {
        for (let cnt = 0; cnt < mailList.length; cnt++) {
            if(cnt !== mailList.length-1) {
                mailStr += mailList[cnt] +",";
            } else {
                mailStr += mailList[cnt];
            }
        }
    }

    searchMap.forEach(
        (target, index) => {
            drawChartsPerPerson(pdservice_id,pdServiceVersionLinks,mailStr, target["field"], target["reqId"], target["subId"]);
        }
    )
}


function drawChartsPerPerson(pdservice_id, pdServiceVersionLinks, mailAddressList, targetField, targetReqId, targetSubtaskId) {
    let _url = "/auth-user/api/arms/analysis/resource/normal-versionAndMail-filter/"+pdservice_id;
    $.ajax({
        url: _url,
        type: "GET",
        data: { "서비스아이디" : pdservice_id,
            "mailAddressList" : mailAddressList,
            "메인그룹필드" : 'assignee.assignee_emailAddress.keyword',
            "하위그룹필드들": 'isReq,'+targetField,
            "컨텐츠보기여부" : true,
            "크기" : 1000,
            "하위크기": 1000,
            "pdServiceVersionLinks" : pdServiceVersionLinks},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                let set_req =  new Set();
                let set_subtask =  new Set();

                //y축 좌표
                let yAxisDataArr_req =[];
                let yAxisDataArr_subtask = [];
                //담당자 데이터 - 담당자별 name,type,data -> map 이 들어있는 배열
                let seriesArr_req = [];
                let seriesArr_subtask = [];

                let totalMap_req = []; //담당자별 이슈항목의 필드(k)-개수(v) map 이 들어있는 배열
                let totalMap_subtask = [];

                let searchDepth1 = data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                if (searchDepth1.length !== 0) {
                    for (let i = 0; i<searchDepth1.length; i++) { //사람별 분류 0번째(첫번재 사람) 1 (두번째 사람)
                        let depth1Cnt = searchDepth1[i]["개수"];     // 총 개수(요구사항 + 연결이슈)
                        let depth1filed = searchDepth1[i]["필드명"]; // emailAddress
                        let seriesMap_req = {
                            name: getIdFromMail(depth1filed),
                            type: "bar",
                            data: []
                        }
                        let seriesMap_subtask = {
                            name: getIdFromMail(depth1filed),
                            type: "bar",
                            data: []
                        }
                        let map_req = new Map();
                        let map_subtask = new Map();

                        let searchDepth1_sub = searchDepth1[i]["하위검색결과"]["group_by_isReq"];
                        if (searchDepth1_sub.length !== 0) {
                            for (let j =0; j<searchDepth1_sub.length; j++) {
                                if (searchDepth1_sub[j]["필드명"] === "true") { //요구사항
                                    let reqCnt = searchDepth1_sub[j]["개수"];   // 요구사항 개수
                                    if (reqCnt !== 0) {
                                        let searchDepth2 = searchDepth1_sub[j]["하위검색결과"]["group_by_"+targetField];
                                        searchDepth2.forEach((target, index) => {
                                            set_req.add(target["필드명"]);
                                            map_req.set(target["필드명"],target["개수"]);
                                        });
                                    }
                                }

                                if (searchDepth1_sub[j]["필드명"] === "false") { //연결이슈
                                    let subTaskCnt = searchDepth1_sub[j]["개수"]; // 연결이슈 개수
                                    if (subTaskCnt !== 0) {
                                        let priorityArr = searchDepth1_sub[j]["하위검색결과"]["group_by_"+targetField];
                                        priorityArr.forEach((target, index) => {
                                            set_subtask.add(target["필드명"]);
                                            map_subtask.set(target["필드명"],target["개수"]);
                                        });
                                    }
                                }
                            }
                        }
                        seriesArr_req.push(seriesMap_req);
                        seriesArr_subtask.push(seriesMap_subtask);
                        totalMap_req.push(map_req);
                        totalMap_subtask.push(map_subtask);
                    }//per Person

                }
                //setToList - 담당자별 이슈항목 필드의 중복제거 배열
                set_req.forEach((e)=>{yAxisDataArr_req.push(e)});
                set_subtask.forEach((e)=>{yAxisDataArr_subtask.push(e)});

                //totalMap_req;
                //seriesArr_req;    // 담당자별 name,type,data -> map 이 들어있는 배열

                // 차트에 넣을 담당자별 data 를 넣어주기 위해 사용.
                for (var idx1 = 0; idx1 < totalMap_req.length; idx1++) {
                    let refinedDataFromYAxis_req = new Array(yAxisDataArr_req.length); // yAxis의 수로 배열만듦.
                    let refinedDataFromYAxis_subtask = new Array(yAxisDataArr_subtask.length); // yAxis의 수로 배열만듦.

                    let personMap_req = totalMap_req[idx1];
                    let personMap_subtask = totalMap_subtask[idx1];

                    for(let idx2 = 0; idx2<yAxisDataArr_req.length; idx2++ ) {
                        if(personMap_req.has(yAxisDataArr_req[idx2])) { //0번째
                            refinedDataFromYAxis_req[idx2] = personMap_req.get(yAxisDataArr_req[idx2]);
                        } else {
                            refinedDataFromYAxis_req[idx2] = 0;
                        }
                    }
                    for(let idx3=0; idx3<yAxisDataArr_subtask.length; idx3++) {
                        if(personMap_subtask.has(yAxisDataArr_subtask[idx3])) { //0번째
                            refinedDataFromYAxis_subtask[idx3] = personMap_subtask.get(yAxisDataArr_subtask[idx3]);
                        } else {
                            refinedDataFromYAxis_subtask[idx3] = 0;
                        }
                    }
                    //정제된 데이터를 해당 담당자의 data 항목에 삽입
                    seriesArr_req[idx1]["data"]= refinedDataFromYAxis_req;
                    seriesArr_subtask[idx1]["data"] = refinedDataFromYAxis_subtask;
                }

                //drawChart
                drawHorizontalBarChart(targetReqId,    yAxisDataArr_req,    seriesArr_req);
                drawHorizontalBarChart(targetSubtaskId,yAxisDataArr_subtask,seriesArr_subtask);
            }
        }
    });
}

//email에서 ID 만 가져오기
function getIdFromMail (param) {
    var full_str = param;
    var indexOfAt = full_str.indexOf('@');
    return full_str.substring(0,indexOfAt);
}

function getScheduleToDrawRadarChart(pdservice_id, pdServiceVersionLinks) {

    let 선택한_버전_세트 = new Set();
    pdServiceVersionLinks.split(",").forEach( e => 선택한_버전_세트.add({c_id:e}));

    if(선택한_버전_세트.size !== 0) {
        $.ajax({
            url: "/auth-user/api/arms/pdServiceVersion/getVersionListBy.do",
            data: { c_ids: pdServiceVersionLinks},
            type: "GET",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (json) {

                    let 버전목록 = json;
                    let 가장이른시작날짜;
                    let 가장늦은종료날짜;
                    if(버전목록.length !== 0) {
                        for (let i=0; i<버전목록.length; i++) {
                            if (i === 0) {
                                가장이른시작날짜 = 버전목록[i].c_pds_version_start_date;
                                가장늦은종료날짜 = 버전목록[i].c_pds_version_end_date;
                            } else {
                                if(버전목록[i]["c_pds_version_start_date"] < 가장이른시작날짜) {
                                    가장이른시작날짜 = 버전목록[i]["c_pds_version_start_date"];
                                }
                                if(버전목록[i]["c_pds_version_end_date"] > 가장늦은종료날짜) {
                                    가장늦은종료날짜 = 버전목록[i]["c_pds_version_end_date"];
                                }
                            }
                        }
                    }

                    if(가장이른시작날짜 ==="start") { 가장이른시작날짜 = new Date(); }
                    if(가장늦은종료날짜 ==="end") {가장늦은종료날짜 = new Date(); }
                    let objectiveDateDiff = getDateDiff(가장이른시작날짜, 가장늦은종료날짜);
                    let currentDateDiff = getDateDiff(가장이른시작날짜, new Date());

                    total_days_progress = currentDateDiff;

                    let 목표데이터_배열 = [resource_count, req_count, objectiveDateDiff];
                    let 현재진행데이터_배열 = [resource_count, req_in_action, currentDateDiff];
                    let dateDiff = Math.abs(objectiveDateDiff - currentDateDiff).toFixed(0);

                    $("#progressDateRate").text((currentDateDiff*100/(objectiveDateDiff === 0 ? 1 : objectiveDateDiff)).toFixed(0)+"%");
                    if(objectiveDateDiff>= currentDateDiff) {
                        $("#remaining_days").text("D-"+dateDiff);
                    } else {
                        $("#remaining_days").text("D+"+dateDiff);
                        $("#remaining_days").css("color", "rgb(219,42,52)");
                    }
                    drawBasicRadar("radarPart",목표데이터_배열, 현재진행데이터_배열);

                }
            }
        });
    }

}

const getDateDiff = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);

    const diffDate = date1.getTime() - date2.getTime();

    return +(Math.abs(diffDate / (1000 * 60 * 60 * 24)).toFixed(0)); // 밀리세컨 * 초 * 분 * 시 = 일

}

function 수치_초기화() {
    req_count = 0;
    linkedIssue_subtask_count = 0;
    resource_count =0;
    req_in_action =0;
    total_days_progress = undefined;

    $("#total_req_count").text("-");       // 총 요구사항 수(미할당포함)
    $("#no_assigned_req_count").text("-"); // 미할당 요구사항 수
    $("#req_count").text("-");             // 작업 대상 요구사항 수
    $("#req_in_action_count").text("-");   // 작업중 요구사항

    $("#total_linkedIssue_subtask_count").text("-");       //연결이슈 수
    $("#no_assigned_linkedIssue_subtask_count").text("-"); //미할당 연결이슈 수
    $("#linkedIssue_subtask_count_per_req_in_action").text("-"); // 작업중 요구사항에 대한 연결이슈 평균

    $("#resource_count").text("-");        // 작업자수
    $("#req_in_action_avg").text("-");     // 작업중 요구사항 평균
    $("#avg_linkedIssue_count").text("-"); // 연결이슈 평균

    let radarChart = echarts.getInstanceByDom(document.getElementById("radarPart"));
    if(radarChart) { radarChart.dispose(); }
    let stackBarChart = echarts.getInstanceByDom(document.getElementById("apache-echarts-stacked-horizontal-bar"));
    if(stackBarChart) { stackBarChart.dispose(); }
}

function drawManRequirementTreeMapChart(pdServiceLink, pdServiceVersionLinks) {
    const url = new UrlBuilder()
        .setBaseUrl('/auth-user/api/arms/dashboard/assignees-requirements-involvements')
        .addQueryParam('pdServiceLink', pdServiceLink)
        .addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
        .addQueryParam('메인그룹필드', "pdServiceVersion")
        .addQueryParam('하위그룹필드들', "assignee.assignee_accountId.keyword,assignee.assignee_displayName.keyword")
        .addQueryParam('크기', 0)
        .addQueryParam('하위크기', 0)
        .addQueryParam('컨텐츠보기여부', true)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (apiResponse) {
                const data = apiResponse.response;
                let chartDom = document.getElementById('chart-manpower-requirement');
                let myChart = echarts.init(chartDom);
                let option;
                    myChart.setOption(
                        (option = {
                            title: {
                                text: '',
                                subtext: '',
                                left: 'leafDepth'
                            },
                            tooltip: {
                                formatter: function (info) {
                                    var value = info.value;
                                    var treePathInfo = info.treePathInfo;
                                    var treePath = [];
                                    for (var i = 1; i < treePathInfo.length; i++) {
                                        treePath.push(treePathInfo[i].name);
                                    }
                                    return [
                                        '<div class="tooltip-title">' +
                                        echarts.format.encodeHTML(treePath.join('/')) +
                                        '</div>',
                                        '관여한 횟수: ' + echarts.format.addCommas(value)
                                    ].join('');
                                }
                            },
                            series: [
                                {
                                    name: 'ROOT',
                                    type: 'treemap',
                                    visibleMin: 300,
                                    width: '100%',
                                    height: '90%', // breadcrumb를 사용하지 않을 경우, width, height 모두 100%를 주면 됩니다.
                                    breadcrumb: {
                                        show: true,
                                        itemStyle: {
                                            color: 'grey'
                                        }
                                    },
                                    label: {
                                        show: true,
                                        formatter: '{b}',
                                        color: 'white',
                                        borderWidth: 0,
                                    },
                                    upperLabel: {
                                        show: true,
                                        height: 30,
                                        color: 'white',
                                        borderWidth: 0,
                                    },
                                    itemStyle: {
                                        borderColor: '#fff',
                                    },
                                    data: data,
                                    leafDepth: 1,
                                    levels:
                                        [
                                            {
                                                itemStyle: {
                                                    borderColor: '#555',
                                                    borderWidth: 4,
                                                    gapWidth: 4
                                                }
                                            },
                                            {
                                                colorSaturation: [0.3, 0.6],
                                                itemStyle: {
                                                    borderColorSaturation: 0.7,
                                                    gapWidth: 2,
                                                    borderWidth: 2
                                                }
                                            },
                                            {
                                                colorSaturation: [0.3, 0.5],
                                                itemStyle: {
                                                    borderColorSaturation: 0.6,
                                                    gapWidth: 1
                                                }
                                            },
                                            {
                                                colorSaturation: [0.3, 0.5]
                                            }
                                        ],
                                }
                            ]
                        })
                    );

                option && myChart.setOption(option);
                window.addEventListener('resize', function () {
                    myChart.resize();
                });
            }
        }
    });
}

async function getExpectedEndDate(pdServiceLink, pdServiceVersionLinks, all_req_count) {
    $("#expected_end_date").text("").css("color", "");

    let totalDaysProgress = await waitForTotalDaysProgress();

    const url = new UrlBuilder()
        .setBaseUrl("/auth-user/api/arms/analysis/time/normal-version/resolution")
        .addQueryParam("pdServiceLink", pdServiceLink)
        .addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
        .addQueryParam("isReqType", "REQUIREMENT")
        .addQueryParam("resolution", "resolutiondate")
        .addQueryParam("메인그룹필드", "isReq")
        .addQueryParam("크기", 1000)
        .addQueryParam("컨텐츠보기여부", true)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: async function (data) {
                console.log("[ topMenu :: getExpectedEndDate ] :: Resolution 개수 확인 = " + data.전체합계);
                console.log("[ topMenu :: getExpectedEndDate ] :: 전체 요구사항 개수 확인 = " + all_req_count);

                if (data.전체합계 !== 0) {
                    let workingRatio = (data.전체합계 / all_req_count) * 100;
                    if (all_req_count === data.전체합계) {
                        $("#expected_end_date").text("작업 완료");
                    }
                    else {
                        console.log("totalDaysProgress : " + totalDaysProgress);
                        let result = Math.abs((100 / workingRatio) * totalDaysProgress).toFixed(0);

                        $("#expected_end_date").text(addDaysToDate(result));
                    }
                }
                else {
                    $("#expected_end_date").text("예측 불가").css("color", "red");
                }
            }
        }
    });

}

function waitForTotalDaysProgress() {
    return new Promise(resolve => {
        let intervalId = setInterval(() => {
            if (total_days_progress !== undefined) {
                clearInterval(intervalId);
                resolve(total_days_progress);
            }
        }, 100);  // 100ms마다 globalDeadline 값 확인
    });
}

function addDaysToDate(daysToAdd) {
    var currentDate = new Date(); // 현재 날짜 가져오기
    var targetDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000)); // 대상 날짜 계산

    // 대상 날짜를 년, 월, 일로 분리
    var year = targetDate.getFullYear();
    var month = targetDate.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함
    var day = targetDate.getDate();

    return year + "년 " + month + "월 " + day + "일"; // 결과 반환
}
