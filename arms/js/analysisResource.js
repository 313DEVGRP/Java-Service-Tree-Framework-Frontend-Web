////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;
var dataTableRef;
var selectedVersionId; // 선택된 버전 아이디
var dashboardColor;
var req_count, linkedIssue_subtask_count, resource_count;
var labelType, useGradients, nativeTextSupport, animate; //투입 인력별 요구사항 관여 차트
var resourceSet = new Set(); // 담당자 set
var chartInstance = []; // 차트인스턴스를 담을 배열;

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
            "../reference/jquery-plugins/apache-echarts/echarts.js"
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
            // 투입 인력별 요구사항 관여 차트
            "../reference/jquery-plugins/Jit-2.0.1/jit.js",
            "../reference/jquery-plugins/Jit-2.0.1/Examples/css/Treemap.css",
            // 제품-버전-투입인력 차트
            "../reference/jquery-plugins/d3-sankey-v0.12.3/d3-sankey.min.js",
        ],
        [
            "js/common/table.js",
            "js/analysis/api/resourceApi.js",
            "js/analysis/table/workerStatusTable.js",
            "js/analysis/resource/chart/horizontalBarChart.js",
            "js/analysis/resource/chart/simplePie.js"
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
            "../arms/css/analysis/analysis.css",
            "../arms/js/analysis/resource/sankey.js",
            "../arms/js/analysis/resource/treemap.js"
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

        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}

function stackedHorizontalBar(){
    if (!selectedPdServiceId || !selectedVersionId) {
        alert('제품(서비스)와 버전을 선택해주세요.');
        document.getElementById('apache-echarts-stacked-horizontal-bar').innerHTML = '';
        return;
    }

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

        const myChart = echarts.init(document.getElementById('apache-echarts-stacked-horizontal-bar'));

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
                data: statusTypes,
                textStyle: {
                    color: 'white'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category',
                data: sortedData.map(function(item) {return item["필드명"];})
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
            200: function (response) {
                stackedBarChartInit(response);
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
        initTable();
        refreshDetailChart();
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

        //statisticsMonitor($("#selected_pdService").val()); //ES모으는중 by YHS


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
            req_count = 0; linkedIssue_subtask_count = 0;
            console.log("onOpen event fire!\n");
            var checked = $("#checkbox1").is(":checked");
            var endPointUrl = "";
            var versionTag = $(".multiple-select").val();
            selectedVersionId = versionTag.join(',');

            refreshDetailChart();

            // 요구사항 및 연결이슈 통계
            getReqAndLinkedIssueData($("#selected_pdService").val(), selectedVersionId);
            // 작업자별 상태
            drawResource($("#selected_pdService").val(), selectedVersionId);

            drawProductToManSankeyChart($("#selected_pdService").val(), selectedVersionId);
            drawManRequirementTreeMapChart($("#selected_pdService").val(), selectedVersionId);
            stackedHorizontalBar();
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
                refreshDetailChart();
                selectedVersionId = pdServiceVersionIds.join(',');
                // 요구사항 및 연결이슈 통계
                getReqAndLinkedIssueData($("#selected_pdService").val(), selectedVersionId);
                // 작업자별 상태
                drawResource($("#selected_pdService").val(), selectedVersionId);

                drawProductToManSankeyChart($("#selected_pdService").val(), selectedVersionId);
                drawManRequirementTreeMapChart($("#selected_pdService").val(), selectedVersionId);
                stackedHorizontalBar();
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
                })
                //요구사항 및 연결이슈 수
                $('#total_req_count').text(all_req_count);
                $('#total_linkedIssue_subtask_count').text(all_linkedIssue_subtask_count);
                req_count = assignedReqSum;
                $('#req_count').text(assignedReqSum);
                linkedIssue_subtask_count = assignedSubtaskSum;
                $('#linkedIssue_subtask_count').text(assignedSubtaskSum);
                $('#no_assigned_req_count').text(no_assigned_req_count);
                $('#no_assigned_linkedIssue_subtask_count').text(no_assigned_linkedIssue_subtask_count);

                // 작업자수 및 평균계산
                getAssigneeInfo(pdservice_id,pdServiceVersionLinks);

                // 요구사항 및 연결이슈 파이차트
                drawSimplePieChart("req_pie","요구사항",reqDataMapForPie)
                drawSimplePieChart("linkedIssue_subtask_pie","연결이슈 및 하위작업",subtaskDataMapForPie)
            },
            error: function (e) {
                jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
            }
        }
    });
}

var drawResource = function (pdservice_id, pdServiceVersionLinks) {
    var deferred = $.Deferred();
    var pdId = pdservice_id; console.log("pdId=" + pdId);
    var verLinks = pdServiceVersionLinks; console.log("verLinks=" + verLinks);

    ResourceApi.fetchResourceData(pdId, verLinks)
        .done( function() {
            var fetchedReousrceData = ResourceApi.getFetchedResourceData();
            var workerStatusTable = new $.fn.WorkerStatusTable("#analysis_worker_status_table");

            workerStatusTable.dataTableBuild({
                rowGroup: [0],
                data: fetchedReousrceData
            });

            deferred.resolve();
        }
    );

    return deferred.promise();
}
    
//개발중
var drawResourceDetail = function () {
    var deferred = $.Deferred();
    var pdId = pdservice_id; console.log("pdId=" + pdId);
    var verLinks = pdServiceVersionLinks; console.log("verLinks=" + verLinks);

    ResourceApi.fetchResourceData(pdId, verLinks)
        .done( function() {
                var fetchedReousrceData = ResourceApi.fetchResourceDetailInfo();
                var workerDetailInfoTable = new $.fn.WorkerDetailInfoTable("#analysis_worker_detail_table");

                workerStatusTable.dataTableBuild({
                    rowGroup: [0],
                    data: fetchedReousrceData
                });

                deferred.resolve();
            }
        );

    return deferred.promise();
}
var initTable = function () {
    var workerStatusTable = new $.fn.WorkerStatusTable("#analysis_worker_status_table");
    //var workerDetailInfoTable = new $.fn.WorkerDetailInfoTable("#analysis_worker_detail_table"); //작업예정
};

function getAssigneeInfo(pdservice_id, pdServiceVersionLinks) {
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
                let mailAddressList = [];
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

                drawDetailChartForAll(pdservice_id, pdServiceVersionLinks,mailAddressList);
            },
            error: function (e) {
                jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
            }
        }
    });
}
function refreshDetailChart() { // 차트8개 초기화
    chartInstance.forEach((chart) => chart.dispose());
    chartInstance =[];
    resourceSet.clear();
}

//공통코드-extract필요
function drawDetailChartForAll(pdservice_id, pdServiceVersionLinks, mailAddressList) {
    let mailList = [];
    mailList = mailAddressList;
    let mailStr ="";
    let searchMap = [
        { "field" : "priority.priority_name.keyword",     "reqId" : "req-priority-bar",  "subId" :"subtask-priority-bar"},
        { "field" : "status.status_name.keyword",         "reqId" : "req-status-bar",    "subId" :"subtask-status-bar"},
        { "field" : "issuetype.issuetype_name.keyword",   "reqId" : "req-issuetype-bar", "subId" :"subtask-issuetype-bar"},
        { "field" : "resolution.resolution_name.keyword", "reqId" : "req-resolution-bar", "subId" :"subtask-resolution-bar"}
    ];

    if(mailList.length == 1) {
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

function getDetailCharts(pdservice_id, pdServiceVersionLinks, mailAddressList) {
    let mailList = [];
    let mailStr ="";
    let searchMap = [
        { "field" : "priority.priority_name.keyword",     "reqId" : "req-priority-bar",  "subId" :"subtask-priority-bar"},
        { "field" : "status.status_name.keyword",         "reqId" : "req-status-bar",    "subId" :"subtask-status-bar"},
        { "field" : "issuetype.issuetype_name.keyword",   "reqId" : "req-issuetype-bar", "subId" :"subtask-issuetype-bar"},
        { "field" : "resolution.resolution_name.keyword", "reqId" : "req-resolution-bar", "subId" :"subtask-resolution-bar"}
    ];
    resourceSet.add(mailAddressList);

    resourceSet.forEach((e)=>{mailList.push(e)});
    if(mailList.length == 1) {
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
                chartInstance.push(drawHorizontalBarChart(targetReqId,    yAxisDataArr_req,    seriesArr_req));
                chartInstance.push(drawHorizontalBarChart(targetSubtaskId,yAxisDataArr_subtask,seriesArr_subtask));

            }
        }
    });
}

function getIdFromMail (param) {
    var full_str = param;
    var indexOfAt = full_str.indexOf('@');
    return full_str.substring(0,indexOfAt);
}