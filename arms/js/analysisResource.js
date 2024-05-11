//////////////////
//Document Ready
//////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId;   // 선택된 버전 아이디
var dataTableRef;
var mailAddressList;
var dashboardColor;
var req_state, resource_info, issue_info, period_info, total_days_progress;
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
            "../reference/jquery-plugins/d3-5.16.0/d3.min.js",
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
            // 투입 인력별 요구사항 관여 차트
            "../reference/jquery-plugins/Jit-2.0.1/jit.js",
            "../reference/jquery-plugins/Jit-2.0.1/Examples/css/Treemap.css",
            "../arms/js/analysis/resource/treemap.js",
            // 제품-버전-투입인력 차트
            "../reference/jquery-plugins/d3-sankey-v0.12.3/d3-sankey.min.js",
            // 최상단 메뉴
            "js/analysis/topmenu/topMenuApi.js",
            "js/analysis/topmenu/basicRadar.js"
        ],
        [
            "js/common/table.js",
            "js/analysis/api/resourceApi.js",
            "js/analysis/table/workerStatusTable.js",
            "js/analysis/resource/chart/horizontalBarChart.js",
            "js/analysis/resource/chart/simplePie.js",
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
            "../reference/jquery-plugins/jQCloud-2.0.3/dist/jqcloud.js",
            "../reference/jquery-plugins/jQCloud-2.0.3/dist/jqcloud.css",
            "../arms/js/analysis/resource/sankey.js"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function() {

            //vfs_fonts 파일이 커서 defer 처리 함.
            setTimeout(function () {
                var script = document.createElement("script");
                script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
                script.defer = true; // defer 속성 설정
                document.head.appendChild(script);
            }, 5000); // 5초 후에 실행됩니다.

            //pdfmake 파일이 커서 defer 처리 함.
            setTimeout(function () {
                var script = document.createElement("script");
                script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js";
                script.defer = true; // defer 속성 설정
                document.head.appendChild(script);
            }, 5000); // 5초 후에 실행됩니다.

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

            // 높이 조정
            $('.top-menu-div').matchHeight({
                target: $('.top-menu-div-scope')
            });

        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}


// 우하단 StackedHorizontalBar
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
                    },
                    formatter: function (value) {
                        if (value.length > 15) { // 길이가 15보다 크면 생략
                            return value.substr(0, 15) + '...'; // 일부만 표시하고 "..." 추가
                        } else {
                            return value;
                        }
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
        async: false,
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
        refreshDetailChart(); 레이더_스택바_초기화();
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
            console.log("[ analysisResource :: makeVersionMultiSelectBox ] :: versionTag");
            console.log(versionTag);
            if (versionTag === null || versionTag == "") {
                alert("버전이 선택되지 않았습니다.");
                return;
            }

            selectedVersionId = versionTag.join(',');
            // 최상단 메뉴 세팅
            TopMenuApi.톱메뉴_초기화();
            TopMenuApi.톱메뉴_세팅();

            refreshDetailChart(); 레이더_스택바_초기화();

            // 요구사항 및 연결이슈 통계
            req_subtask_pie(selectedPdServiceId, selectedVersionId);
            // 작업자수 및 평균계산
            getAssigneeInfo(selectedPdServiceId, selectedVersionId);
            // 작업자별 상태 - dataTable
            drawResource(selectedPdServiceId, selectedVersionId);

            // 샌키
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
        async: false,
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
                refreshDetailChart(); 레이더_스택바_초기화();
                selectedVersionId = pdServiceVersionIds.join(',');

                // 최상단 메뉴 세팅
                TopMenuApi.톱메뉴_초기화();
                TopMenuApi.톱메뉴_세팅();

                // 요구사항 및 연결이슈 통계
                req_subtask_pie(selectedPdServiceId, selectedVersionId);
                // 작업자수 및 평균계산
                getAssigneeInfo(selectedPdServiceId, selectedVersionId);
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
    console.log("dataTableCallBack");
}

//데이터 테이블 그리고 난 후 시퀀스 이벤트
function dataTableDrawCallback(tableInfo) {
    console.log("dataTableDrawCallback");
}

function req_subtask_pie(pdService_id, pdServiceVersionLinks, size) {
    $.ajax({
        url: "/auth-user/api/arms/analysis/resource/req-subtask-pie/pdServiceId/"+pdService_id,
        type: "GET",
        data: { "pdServiceVersionLinks": pdServiceVersionLinks, "size" : (size ? size : 5) },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        async: false,
        statusCode: {
            200: function (data) {
                //요구사항,연결이슈 파이차트용 데이터배열
                let reqDataMapForPie = []; let top5reqTotal=0; let reqIssueTot=0;
                let subtaskDataMapForPie = []; let top5subTotal=0; let subIssueTot=0;
                console.log(data);
                if (data["전체합계"] === 0) {
                    alert("작업자 업무 처리현황 데이터가 없습니다.");
                    레이더_스택바_초기화();
                } else {
                    let isReqGrpArr = data["검색결과"]["group_by_isReq"];
                    isReqGrpArr.forEach((elementArr,index) => {
                        // 요구사항 이슈
                        if(elementArr["필드명"] == "true") {
                            reqIssueTot = elementArr["개수"];
                            let tempArrReq= elementArr["하위검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                            tempArrReq.forEach(e => {
                                reqDataMapForPie.push({name: getIdFromMail(e["필드명"]), value: e["개수"]});
                                top5reqTotal += e["개수"];
                            });
                        }
                        // 연결이슈
                        if(elementArr["필드명"] == "false") {
                            subIssueTot = elementArr["개수"];
                            let tempArrReq= elementArr["하위검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                            tempArrReq.forEach(e => {
                                subtaskDataMapForPie.push({name: getIdFromMail(e["필드명"]), value: e["개수"]});
                                top5subTotal += e["개수"];
                            });
                        }
                    });
                    reqDataMapForPie.push({name: "etc.", value: (reqIssueTot - top5reqTotal)});
                    subtaskDataMapForPie.push({name: "etc.", value: (subIssueTot - top5subTotal)});
                }

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
        url: "/auth-user/api/arms/analysis/resource/assignee-infos/"+pdservice_id,
        type: "GET",
        data: { "pdServiceVersionLinks": pdServiceVersionLinks },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        async: false,
        statusCode: {
            200: function (data) {
                let assigneesArr = data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];

                if (data["전체합계"] === 0) { //담당자(작업자) 없음.
                    refreshDetailChart(); //상세 바차트 초기화
                } else {
                    assigneesArr.forEach((element,idx) =>{
                        mailAddressList.push(element["필드명"]);
                    });
                }

                //모든작업자 - 상세차트
                drawDetailChartForAll(pdservice_id, pdServiceVersionLinks,mailAddressList);
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

// 전체보기 (히든처리됨)
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

// 요구사항 및 연결이슈 상세 (수평바)
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

function 레이더_스택바_초기화() {
    let radarChart = echarts.getInstanceByDom(document.getElementById("radarPart"));
    if(radarChart) { radarChart.dispose(); }
    let stackBarChart = echarts.getInstanceByDom(document.getElementById("apache-echarts-stacked-horizontal-bar"));
    if(stackBarChart) { stackBarChart.dispose(); }
}

////////////////////////////////////////////////////////////////////////////////////////
// 투입 인력별 요구사항 관여 차트 생성 (트리맵)
////////////////////////////////////////////////////////////////////////////////////////
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
        async: false,
        statusCode: {
            200: function (apiResponse) {
                const data = apiResponse.response;
                if ($("#chart-manpower-requirement").children().length !== 0) {
                    $("#chart-manpower-requirement").empty();
                }
                const treeMapInfos = {
                    "id": "root",
                    "name": "작업자별 요구사항 관여 트리맵",
                    "data": {},
                    "children": data
                };
                init(treeMapInfos);
            }
        }
    });
}
