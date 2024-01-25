var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId; // 선택된 버전 아이디
var dataTableRef;
var mailAddressList; // 투입 작업자 메일
var req_count, linkedIssue_subtask_count, resource_count, req_in_action, total_days_progress;

var dashboardColor;
var pdServiceData;

var pdServiceListData;
var versionListData;

var personData = {};

////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {
    var pluginGroups = [
        [
            "../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
            "../reference/light-blue/lib/jquery.iframe-transport.js",
            "../reference/light-blue/lib/jquery.fileupload.js",
            "../reference/light-blue/lib/jquery.fileupload-fp.js",
            "../reference/light-blue/lib/jquery.fileupload-ui.js",
            //chart Colors
            "./js/dashboard/chart/colorPalette.js",
            // Apache Echarts
            "../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js"
        ],
        [
            "../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
        ],
        [
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
            "../reference/light-blue/lib/bootstrap-datepicker.js",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js",
            "../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
            // 투입 인력별 요구사항 관여 차트
            "../reference/jquery-plugins/Jit-2.0.1/jit.js",
            "../reference/jquery-plugins/Jit-2.0.1/Examples/css/Treemap.css",
            // 제품-버전-투입인력 차트
            "../reference/jquery-plugins/d3-sankey-v0.12.3/d3-sankey.min.js"
        ],
        [
            // d3-5.16.0 네트워크 차트
            "../reference/jquery-plugins/d3-5.16.0/d3.min.js",
            // 생성한 차트 import
            "js/analysis/topmenu/basicRadar.js",
            "js/analysis/topmenu/topMenu.js",

            //CirclePacking with d3 Chart
            "js/analysis/resource/chart/circularPackingChart.js"
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
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js",
            "../arms/js/analysis/resource/sankey.js"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function () {
            // 사이드 메뉴 색상 설정

            $(".widget").widgster();
            setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_cost");

            reqCostAnalysisChart();

            candleStickChart();

            //제품(서비스) 셀렉트 박스 이니시에이터
            makePdServiceSelectBox();

            //버전 멀티 셀렉트 박스 이니시에이터
            makeVersionMultiSelectBox();

            dashboardColor = dashboardPalette.dashboardPalette01;

            // 비용 입력
            costInput();

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
                pdServiceListData = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceListData.push({ "pdServiceId": obj.c_id, "pdServiceName": obj.c_title });
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $("#selected_pdService").append(newOption).trigger("change");
                }
                //////////////////////////////////////////////////////////
                console.log("[analysisScope :: makePdServiceSelectBox] :: pdServiceListData => " );
                console.log(pdServiceListData);
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
    $(".multiple-select").multipleSelect({
        filter: true,
        onClose: function () {
            console.log("onOpen event fire!\n");

            var checked = $("#checkbox1").is(":checked");
            var endPointUrl = "";
            var versionTag = $(".multiple-select").val();
            console.log("[ analysisScope :: makeVersionMultiSelectBox ] :: versionTag");
            console.log(versionTag);
            selectedVersionId = versionTag.join(",");

            if (versionTag === null || versionTag == "") {
                alert("버전이 선택되지 않았습니다.");
                return;
            }
            //분석메뉴 상단 수치 초기화
            수치_초기화();

            // 요구사항 및 연결이슈 통계
            getReqAndLinkedIssueData(selectedPdServiceId, selectedVersionId);

            // Circular Packing with D3 차트
            getReqStatusAndAssignees(selectedPdServiceId, selectedVersionId);

            담당자목록_조회();
            //요구사항 현황 데이터 테이블 로드
            // console.log(" ============ makeVersionMultiSelectBox ============= ");
            // endPointUrl =
            // 	"/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false&versionTag=" + versionTag;
            // 요구사항_현황_데이터_테이블($("#selected_pdService").val(), endPointUrl);

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
                //console.log(data.response);
                var pdServiceVersionIds = [];
                versionListData = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceVersionIds.push(obj.c_id);
                    versionListData.push(obj);
                    // versionListData.push({ c_id: obj.c_id, versionTitle: obj.c_title });
                    var newOption = new Option(obj.c_title, obj.c_id, true, false);
                    $(".multiple-select").append(newOption);
                }
                var versionTag = $(".multiple-select").val();
                console.log("[ analysisCost :: bind_VersionData_By_PdService ] :: versionTag");

                수치_초기화();
                selectedVersionId = pdServiceVersionIds.join(",");
                // 요구사항 및 연결이슈 통계
                getReqAndLinkedIssueData(selectedPdServiceId, selectedVersionId);
                // Circular Packing with D3 차트
                getReqStatusAndAssignees(selectedPdServiceId, selectedVersionId);

                // 투자 대비 소모 비용 차트
                compareCostsChart(selectedPdServiceId, selectedVersionId);
                // 수익 현황 차트
                incomeStatusChart();

                담당자목록_조회();
                if (data.length > 0) {
                    console.log("display 재설정.");
                }
                //$('#multiversion').multipleSelect('refresh');
                //$('#edit_multi_version').multipleSelect('refresh');
                $(".multiple-select").multipleSelect("refresh");


                //요구사항 현황 데이터 테이블 로드
                console.log("=========================");
                endPointUrl =
                    "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false&versionTag=" + versionTag;
                요구사항_현황_데이터_테이블($("#selected_pdService").val(), endPointUrl);
                //////////////////////////////////////////////////////////
            }
        }
    });
}

// 비용 입력
function costInput() {
    
    // 버전 정보


    // 연봉 정보
    var mockData = [
        {
            "name": "홍길동",
            "salary": ""
        },
        {
            "name": "이순신",
            "salary": ""
        },
        // 추가적인 데이터 객체...
    ];

    $('#manpower-annual-income').DataTable({
        "data": mockData,
        "columns": [
            { "data": "name", "title": "투입 인력", "className": "dt-center" },
            {
                "data": "salary",
                "title": "연봉 (입력)",
                "className": "dt-center",
                "render": function(data, type, row) {
                    return '<input type="text" class="salary-input"value="' + data + '"> 만원';
                }
            }
        ],
        "drawCallback": function(settings) {
            $('.salary-input').on('input', function() {
                var value = this.value.replace(/,/g, '');
                this.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            });
        }
    });
}

// 도넛차트
function donutChart(pdServiceLink, pdServiceVersionLinks) {
    console.log("pdServiceId : " + pdServiceLink);
    console.log("pdService Version : " + pdServiceVersionLinks);
    function donutChartNoData() {
        c3.generate({
            bindto: "#donut-chart",
            data: {
                columns: [],
                type: "donut"
            },
            donut: {
                title: "Total : 0"
            }
        });
    }

    if (pdServiceLink === "" || pdServiceVersionLinks === "") {
        donutChartNoData();
        return;
    }

    const url = new UrlBuilder()
        .setBaseUrl("/auth-user/api/arms/dashboard/aggregation/flat")
        .addQueryParam("pdServiceLink", pdServiceLink)
        .addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
        .addQueryParam("메인그룹필드", "status.status_name.keyword")
        .addQueryParam("하위그룹필드들", "")
        .addQueryParam("크기", 1000)
        .addQueryParam("하위크기", 1000)
        .addQueryParam("컨텐츠보기여부", true)
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
                let 검색결과 = data["검색결과"]["group_by_status.status_name.keyword"];
                if (
                    (Array.isArray(data) && data.length === 0) ||
                    (typeof data === "object" && Object.keys(data).length === 0) ||
                    (typeof data === "string" && data === "{}")
                ) {
                    donutChartNoData();
                    return;
                }

                const columnsData = [];

                검색결과.forEach((status) => {
                    columnsData.push([status.필드명, status.개수]);
                });

                let totalDocCount = data.전체합계;

                const chart = c3.generate({
                    bindto: "#donut-chart",
                    data: {
                        columns: columnsData,
                        type: "donut"
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
                        }
                    }
                });

                $(document).on("click", "#donut-chart .c3-legend-item", function () {
                    const id = $(this).text();
                    const isHidden = $(this).hasClass("c3-legend-item-hidden");
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
                    $("#donut-chart .c3-chart-arcs-title").text("Total : " + totalDocCount);
                });
            }
        }
    });
}

// 바차트
function combinationChart(pdServiceLink, pdServiceVersionLinks) {
    function combinationChartNoData() {
        c3.generate({
            bindto: "#combination-chart",
            data: {
                x: "x",
                columns: [],
                type: "bar",
                types: {}
            }
        });
    }

    if (pdServiceLink === "" || pdServiceVersionLinks === "") {
        combinationChartNoData();
        return;
    }

    const url = new UrlBuilder()
        .setBaseUrl("/auth-user/api/arms/dashboard/requirements-jira-issue-statuses")
        .addQueryParam("pdServiceLink", pdServiceLink)
        .addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
        .addQueryParam("메인그룹필드", "pdServiceVersion")
        .addQueryParam("하위그룹필드들", "assignee.assignee_accountId.keyword,assignee.assignee_displayName.keyword")
        .addQueryParam("크기", 1000)
        .addQueryParam("하위크기", 1000)
        .addQueryParam("컨텐츠보기여부", true)
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
                if (
                    (Array.isArray(data) && data.length === 0) ||
                    (typeof data === "object" && Object.keys(data).length === 0) ||
                    (typeof data === "string" && data === "{}")
                ) {
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

                const requirementCounts = ["요구사항"];
                for (const month in data) {
                    requirementCounts.push(data[month].totalRequirements);
                }
                columnsData.push(requirementCounts);

                let monthlyTotals = {};

                for (const month in data) {
                    monthlyTotals[month] = data[month].totalIssues + data[month].totalRequirements;
                }

                const chart = c3.generate({
                    bindto: "#combination-chart",
                    data: {
                        x: "x",
                        columns: [["x", ...Object.keys(data)], ...columnsData],
                        type: "bar",
                        types: {
                            요구사항: "area"
                        },
                        groups: [issueStatusTypes]
                    },
                    color: {
                        pattern: dashboardColor.accumulatedIssueStatusColor
                    },
                    onrendered: function () {
                        d3.selectAll(".c3-line, .c3-bar, .c3-arc").style("stroke", "white").style("stroke-width", "0.3px");
                    },
                    axis: {
                        x: {
                            type: "category"
                        }
                    },
                    tooltip: {
                        format: {
                            title: function (index) {
                                const month = Object.keys(data)[index];
                                const total = monthlyTotals[month];
                                return `${month} | Total : ${total}`;
                            }
                        }
                    }
                });

                $(document).on("click", "#combination-chart .c3-legend-item", function () {
                    const id = $(this).text();
                    const isHidden = $(this).hasClass("c3-legend-item-hidden");
                    let docCount = 0;

                    for (const month in data) {
                        if (data[month].statuses.hasOwnProperty(id)) {
                            docCount = data[month].statuses[id];
                        } else if (id === "요구사항") {
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

function statisticsMonitor(pdservice_id, pdservice_version_id) {
    console.log("[ analysisScope :: statisticsMonitor ] :: pdservice_id => " + pdservice_id);
    console.log("[ analysisScope :: statisticsMonitor ] :: pdservice_version_id => " + pdservice_version_id);

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
                let versionCustomTimeline = [];

                let today = new Date();
                versionData.sort((a, b) => a.c_id - b.c_id);

                versionData.forEach(function (versionElement, idx) {
                    var versionTimelineCustomData = {
                        "c_id": versionElement.c_id,
                        "title" : versionElement.c_title,
                        "startDate" : (versionElement.c_pds_version_start_date === "start" ? today : versionElement.c_pds_version_start_date),
                        "endDate" : (versionElement.c_pds_version_end_date === "end" ? today : versionElement.c_pds_version_end_date)
                    };
                    versionCustomTimeline.push(versionTimelineCustomData);
                });

                let version_count = versionData.length;

                console.log("등록된 버전 개수 = " + version_count);
            }
        }
    });
}

function versionUpdateIssueScatterChart(pdservice_id, pdservice_version_id, versionData) {
    console.log("[ analysisScope :: versionUpdateIssueScatterChart ] :: 버전별 요구사항 업데이트 상태 스캐터 차트 버전데이터 = ");
    console.log(versionData);

    var yVersionData = [];
    var xVesrionStartEndData = [];
    var yearData = new Set();
    versionData.forEach(version => {
        yVersionData.push(version.title);
        var arrayData = [version.title, +new Date(version.startDate), +new Date(version.endDate)];
        yearData.add(new Date(version.startDate).getFullYear());
        yearData.add(new Date(version.endDate).getFullYear());
        xVesrionStartEndData.push(arrayData);
    });

    var versionDataMap = versionData.reduce(function(map, obj) {
        map[obj.c_id] = obj;
        return map;
    }, {});

    var dom = document.getElementById('boxplot-scatter-chart-container');

    let myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    let colorList = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'];
    let scatterData = [];

    const url = new UrlBuilder()
        .setBaseUrl("/auth-user/api/arms/analysis/time/standard-daily/jira-issue")
        .addQueryParam("pdServiceLink", pdservice_id)
        .addQueryParam("pdServiceVersionLinks", pdservice_version_id)
        .addQueryParam("일자기준", "updated")
        .addQueryParam("메인그룹필드", "isReq")
        .addQueryParam("하위그룹필드들", "pdServiceVersion")
        .addQueryParam("크기", 1000)
        .addQueryParam("하위크기", 1000)
        .addQueryParam("컨텐츠보기여부", true)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                console.log("[ analysisScope :: versionUpdateIssueScatterChart ] :: 버전별 요구사항 업데이트 상태 스캐터 차트데이터 = ");
                console.log(data);

                let result = Object.keys(data).reduce(
                    (acc, date) => {

                        if (data[date].requirementStatuses !== null) {
                            Object.keys(data[date].requirementStatuses).forEach((versionId) => {
                                if (data[date].requirementStatuses[versionId] !== 0) {
                                    acc.versionScatterData.push([versionDataMap[versionId].title, new Date(date).getTime(), data[date].requirementStatuses[versionId]]);
                                }
                            });
                        }

                        return acc;
                    },
                    {
                        versionScatterData: []
                    }
                );
                scatterData = result.versionScatterData;

                var option = {
                    legend: {
                        data: ['요구사항'],
                        textStyle: {
                            color: '#fff'  // 범례의 텍스트 색상을 설정합니다.
                        }
                    },
                    yAxis: {
                        type: 'time',
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: "white"
                            },
                            fontSize: 9,
                            rotate: 0,
                            formatter: function(params) {
                                return formatDate(new Date(params));
                            }
                        },
                        axisTick: { show: false },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(255,255,255,0.2)",
                                width: 1,
                                type: "dashed"
                            }
                        },
                        // splitNumber: 5, // 라벨의 간격을 조절합니다. 이 값은 원하는 간격에 따라 조절할 수 있습니다.
                    },
                    xAxis: {
                        data: yVersionData.reverse(),
                        inverse: true,
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: "white"
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Versions',
                            type: 'custom',
                            itemStyle: {
                                color: function(params) {
                                    return colorList[params.dataIndex % colorList.length];
                                }
                            },
                            renderItem: function(params, api) {
                                var categoryIndex = api.value(0);
                                var start = api.coord([categoryIndex, api.value(1)]);
                                var end = api.coord([categoryIndex, api.value(2)]);
                                var gap = 40; // 간격의 크기를 설정
                                var width  = (params.coordSys.width - gap * (yVersionData.length - 1)) / yVersionData.length; // 간격을 고려하여 사각형의 너비를 계산합니다.

                                if (width > 90) {
                                    width = 90;
                                }

                                return {
                                    type: 'rect',
                                    shape: {
                                        x: start[0] - width / 2,
                                        y: start[1],
                                        width: width,
                                        height: end[1] - start[1]
                                    },
                                    style: api.style(params.dataIndex) // apply color here
                                };
                            },
                            encode: {
                                y: [1, 2],
                                x: 0
                            },
                            data: xVesrionStartEndData
                        },
                        {
                            name: '요구사항',
                            type: 'scatter',
                            encode: {
                                y: 1,
                                x: 0
                            },
                            itemStyle: {
                                color: "rgba(255,106,0,0.82)",
                                borderColor: '#fff',
                                borderWidth: 1
                            },
                            label: {
                                normal: {
                                    show: true,
                                    color: "#FFFFFF"
                                },
                            },
                            symbolSize: function (data) {
                                let sSize = Math.sqrt(data[2]) * 3;
                                if (sSize < 5) {
                                    sSize = 5;
                                }
                                return sSize;
                            },
                            data: scatterData
                        }
                    ],
                    tooltip: {
                        trigger: 'item',
                        formatter: function (params) {
                            if (params.seriesType === 'scatter') {
                                return params.marker + params.name + '<br/>' + new Date(params.value[1]).toLocaleDateString() + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + params.value[2] + '개<br/>';
                            } else {
                                var tooltipText = '';
                                tooltipText += params.marker + params.name + '<br/><span style="float: right;">' + new Date(params.value[1]).toLocaleDateString()+ " ~ " + new Date(params.value[2]).toLocaleDateString() + '</span>' + '<br/>';
                                return tooltipText;
                            }
                        }
                    },
                    grid: {
                        left: '15%',
                        containLabel: false
                    }
                };

                if (option && typeof option === 'object') {
                    myChart.setOption(option, true);
                }

                window.addEventListener('resize', myChart.resize);
            }
        }
    });
}

function formatDate(date) {
    var year = date.getFullYear().toString().slice(-2); // 연도의 마지막 두 자리를 얻습니다.
    var month = (date.getMonth() + 1).toString().padStart(2, "0");
    var day = date.getDate().toString().padStart(2, "0");
    return year + "-" + month + "-" + day;
}

/////////////////////////////////////////////////////////
// Circular Packing Chart
/////////////////////////////////////////////////////////
function getReqStatusAndAssignees(pdServiceLink, pdServiceVersionLinks) {

	const url = new UrlBuilder()
		.setBaseUrl("/auth-user/api/arms/analysis/scope/req-status-and-reqInvolved-unique-assignees")
		.addQueryParam("요구_사항.isReqType","REQUIREMENT")
		.addQueryParam("요구_사항.pdServiceLink", selectedPdServiceId)
		.addQueryParam("요구_사항.pdServiceVersionLinks", selectedVersionId)
		.addQueryParam('요구_사항.메인그룹필드', "pdServiceVersion")
		.addQueryParam('요구_사항.컨텐츠보기여부', false)
		.addQueryParam('요구_사항.크기', 10000)
		.addQueryParam('요구_사항.하위그룹필드들', "key,assignee.assignee_emailAddress.keyword")
		.addQueryParam('요구_사항.하위크기', 10000)
		.addQueryParam("하위_이슈_사항.isReqType","ISSUE")
		.addQueryParam("하위_이슈_사항.pdServiceLink", selectedPdServiceId)
		.addQueryParam("하위_이슈_사항.pdServiceVersionLinks", selectedVersionId)
		.addQueryParam('하위_이슈_사항.메인그룹필드', "parentReqKey")
		.addQueryParam('하위_이슈_사항.컨텐츠보기여부', false)
		.addQueryParam('하위_이슈_사항.크기', 10000)
		.addQueryParam('하위_이슈_사항.하위그룹필드들', "assignee.assignee_emailAddress.keyword")
		.addQueryParam('하위_이슈_사항.하위크기', 10000)
		.build();

	$.ajax({
		url: url,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (result) {
				console.log("[ analysisScope :: getReqStatusAndAssignees ] :: result");
				console.log(result);
				let pdServiceName;
				pdServiceListData.forEach(elements => {
					if (elements["pdServiceId"] === +pdServiceLink) {
						pdServiceName = elements["pdServiceName"];
					}
				});
				let dataObject = {};
				let issueStatusSet = new Set();
				let issueStatusList = [];
				if (result.length > 0) {
					for (let i = 0; i < result.length; i++) {
						// 버전이름 가져오기
						let versionName ="";
						for (let j = 0; j < versionListData.length; j++) {
							if(result[i]["제품_서비스_버전"] === versionListData[j]["c_id"]){
								versionName = versionListData[j]["c_title"].replaceAll(".","_");
								break;
							}
						}
						let verSubObject = {};
						result[i]["요구사항들"].forEach((element) => {
							// 작업자수가 0이 아닌 요구 사항만 (담당자 배정된 요구사항만)
							if (element["작업자수"] !== 0) {
								verSubObject[element["요구_사항_번호"]] =
									{"$count" : element["작업자수"], "$status" : element["요구_사항_상태"]};
								issueStatusSet.add(element["요구_사항_상태"]);
							}
						});
						dataObject[versionName] = verSubObject;
					}
				}
				issueStatusSet.forEach(e=>issueStatusList.push(e));
				drawCircularPacking("circularPacking",pdServiceName,dataObject, issueStatusList);
			}
		}
	});
}

function chord(data) {
    const $container = document.getElementById("circular_sankey");
    const $chart = makeChart(data);

    $container.append($chart);
}

function makeChart(data) {
    const width = 640;
    const height = width;
    const outerRadius = Math.min(width, height) * 0.5 - 30;
    const innerRadius = outerRadius - 20;
    const { names, colors } = data;
    const sum = d3.sum(data.flat());
    const tickStep = d3.tickStep(0, sum, 100);
    const tickStepMajor = d3.tickStep(0, sum, 20);
    const formatValue = d3.formatPrefix(",.0", tickStep);

    const chord = d3
        .chord()
        .padAngle(20 / innerRadius)
        .sortSubgroups(d3.descending);

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    const ribbon = d3.ribbon().radius(innerRadius);

    const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const chords = chord(data);

    const group = svg.append("g").selectAll().data(chords.groups).join("g");

    group
        .append("path")
        .attr("fill", (d) => colors[d.index])
        .attr("d", arc)
        .append("title")
        .text((d) => `${d.value.toLocaleString("en-US")} ${names[d.index]}`);

    const groupTick = group
        .append("g")
        .selectAll()
        .data((d) => groupTicks(d, tickStep))
        .join("g")
        .attr("transform", (d) => `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${outerRadius},0)`);

    groupTick.append("line").attr("stroke", "currentColor").attr("x2", 6);

    groupTick
        .filter((d) => d.value % tickStepMajor === 0)
        .append("text")
        .attr("x", 8)
        .attr("dy", ".35em")
        .attr("transform", (d) => (d.angle > Math.PI ? "rotate(180) translate(-16)" : null))
        .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
        .text((d) => formatValue(d.value));

    svg
        .append("g")
        .attr("fill-opacity", 0.7)
        .selectAll()
        .data(chords)
        .join("path")
        .attr("d", ribbon)
        .attr("fill", (d) => colors[d.target.index])
        .attr("opacity", 0.6)
        .on("mouseenter", function (d) {
            d3.select(this).transition().attr("opacity", 1);
        })
        .on("mouseout", function () {
            d3.select(this).transition().attr("opacity", 0.6);
        })
        .attr("stroke", "white")
        .append("title")
        .text(
            (d) =>
                `${d.source.value.toLocaleString("en-US")} ${names[d.source.index]} → ${names[d.target.index]}${
                    d.source.index !== d.target.index
                        ? `\n${d.target.value.toLocaleString("en-US")} ${names[d.target.index]} → ${names[d.source.index]}`
                        : ``
                }`
        );

    return svg.node();
}

function groupTicks(d, step) {
    const k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map((value) => {
        return { value: value, angle: value * k + d.startAngle };
    });
}
/////////////////////////////////////////////////////////
// 요구사항 별 수익 현황 그래프
/////////////////////////////////////////////////////////
function incomeStatusChart(){
    var chartDom = document.getElementById('income_status_chart');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        xAxis: {
            type: 'category',
            data: [
                '2024-01-01',
                '2024-01-11',
                '2024-01-12',
                '2024-01-17',
                '2024-01-23',
                '2024-02-12',
                '2024-02-11'
            ],
            axisLabel: {
                color: '#FFFFFF'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#FFFFFF'
            }
        },
        legend: {
            data: ['예상', '소모 비용', '투자비용'] ,
            textStyle: {
                color: '#FFFFFF' // 범례 텍스트 색상 변경
            }
        },
        series: [
            {
                data: [0, 50, 100, 150, 200, 250, 300],
                type: 'line',
                name: '예상', // 첫 번째 선에 대한 라벨
                lineStyle: {
                    type: 'dashed' // 선의 스타일을 점선으로 변경
                },
                markLine: {
                    lineStyle: {
                        color: 'red', // line color
                        type: 'dashed', // line style
                        width: 3 // line width
                    },
                    label: {
                        position: 'middle', // label이 markLine의 중간에 위치하도록 설정
                        formatter: '투자 비용', // label의 텍스트 설정
                        fontSize: 15, // label의 폰트 크기 설정
                        color: '#FFFFFF'
                    },
                    data: [
                        {
                            yAxis: 300,
                            name: '투자비용' // line label
                        }
                    ]
                }
            },
            {
                data: [0, 100, 120, 120, 280, 320, 320],
                type: 'line',
                name: '소모 비용',
                markLine: {
                    lineStyle: {
                        color: 'red', // line color
                        type: 'dashed', // line style
                        width: 3 // line width
                    },
                    label: {
                        position: 'middle', // label이 markLine의 중간에 위치하도록 설정
                        formatter: '요구사항 기한', // label의 텍스트 설정
                        fontSize: 15, // label의 폰트 크기 설정
                        color: '#FFFFFF'
                    },
                    data: [
                        {
                            xAxis: 6,
                            name: '투자비용' // line label
                        }
                    ]
                }
            }
        ]
    };

    option && myChart.setOption(option);
}


/////////////////////////////////////////////////////////
// 투입 비용 현황 차트
/////////////////////////////////////////////////////////
function compareCostsChart(selectedPdServiceId, selectedVersionId){
    var chartDom = document.getElementById("compare_costs");
    var myChart = echarts.init(chartDom);
    var option;
    var titles = versionListData.map(item => item.c_title);

    option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            textStyle: {
                color: '#FFFFFF'
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
            boundaryGap: [0, 0.01],
            axisLabel: {
                color: '#FFFFFF'
            }
        },
        yAxis: {
            type: 'category',
            data: titles,
            axisLabel: {
                color: '#FFFFFF'
            }
        },
        series: [
            {
                name: '투자 비용',
                type: 'bar',
                data: [18203, 23489, 29034, 104970]
            },
            {
                name: '소모 비용',
                type: 'bar',
                data: [19325, 23438, 31000, 121594]
            }
        ]
    };

    option && myChart.setOption(option);
}

////////////////////////////////////////////////////////////////////////////////////////
//요구사항 현황 데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
function 요구사항_현황_데이터_테이블(selectId, endPointUrl) {
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
                        '<button data-target="#my_modal2" data-toggle="modal" style="border:0; background:rgba(51,51,51,0.425); color:#fbeed5; vertical-align: middle" onclick="click_issue_key('
                        + '\'' + row.c_jira_server_link + '\','
                        + '\'' + row.c_issue_key + '\','
                        + '\'' + row.c_pds_version_link + '\')"><i class="fa fa-list-alt"></i></button>'+
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

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {

}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(settings, json) {
    console.log("check");
}

function dataTableDrawCallback(tableInfo) {
    $("#" + tableInfo.sInstance)
        .DataTable()
        .columns.adjust()
        .responsive.recalc();
}

$("#copychecker").on("click", function () {
    reqStatusDataTable.button(".buttons-copy").trigger();
});
$("#printchecker").on("click", function () {
    reqStatusDataTable.button(".buttons-print").trigger();
});
$("#csvchecker").on("click", function () {
    reqStatusDataTable.button(".buttons-csv").trigger();
});
$("#excelchecker").on("click", function () {
    reqStatusDataTable.button(".buttons-excel").trigger();
});
$("#pdfchecker").on("click", function () {
    reqStatusDataTable.button(".buttons-pdf").trigger();
});

function click_issue_key(c_jira_server_link, c_issue_key, c_pds_version_link) {

    console.log("clicked_issue_name ==> " + c_issue_key);
    if (c_issue_key !== "" || c_issue_key !== undefined) {
        //selectedIssueKey = name; // 쓸일 없음.
    }

    var endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val()
        + "/getIssueAndSubLinks.do?serverId=" + c_jira_server_link
        + "&issueKey=" + c_issue_key
        + "&versionId=" + c_pds_version_link;
    getLinkedIssueAndSubtask(endPointUrl); // 데이터테이블 그리기
}

function getLinkedIssueAndSubtask(endPointUrl) {
    var columnList = [
        {
            name: "issueID",
            title: "이슈아이디",
            data: "issueID",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: false
        },
        {
            name: "key",
            title: "요구사항 이슈 키",
            data: "key",
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
            name: "summary",
            title: "요구사항",
            data: "summary",
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
            name: "parentReqKey",
            title: "부모이슈 키",
            data: "parentReqKey",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: false
        },
        {
            name: "priority",
            title: "이슈 우선순위",
            data: "priority.priority_name",
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
            name: "status.status_name",
            title: "이슈 상태",
            data: "status.status_name",
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
            name: "reporter",
            title: "이슈 보고자",
            data: "reporter.reporter_accountId",
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
            name: "assignee",
            title: "이슈 할당자",
            data: "assignee.assignee_accountId",
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
            name: "created",
            title: "이슈 생성일자",
            data: "created",
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
            name: "updated",
            title: "이슈 최근 업데이트 일자",
            data: "updated",
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

    var rowsGroupList = [];
    var columnDefList = [
        {
            orderable: false,
            className: "select-checkbox",
            targets: 0
        }
    ];
    var orderList = [[1, "asc"]];
    var jquerySelector = "#linkedIssueAndSubtaskTable";
    var ajaxUrl = "/auth-user/api/arms/reqStatus" + endPointUrl;
    var jsonRoot = "";
    var buttonList = [];
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

function reqCostAnalysisChart() {

    let requirementPriceList = {
        요구사항1: 10000000,
        요구사항2: 20000000,
        요구사항3: 30000000,
        요구사항4: 40000000,
        요구사항5: 50000000,
        요구사항6: 60000000,
        요구사항7: 30000000,
        요구사항8: 30000000,
        요구사항9: 30000000,
        요구사항11: 10000000,
        요구사항12: 20000000,
        요구사항13: 30000000,
        요구사항14: 40000000,
        요구사항15: 50000000,
        요구사항16: 60000000,
        요구사항17: 30000000,
        요구사항18: 30000000,
        요구사항19: 30000000
    };

    let reqTotalPrice = 0;
    for (let key in requirementPriceList) {
        reqTotalPrice += requirementPriceList[key];
    }
    console.log(reqTotalPrice);

    let difficultyJson = {
        '매우 어려움': 100,
        '어려움': 200,
        '보통': 300,
        '쉬움': 200,
        '매움 쉬움': 100
    };

    let priorityJson = {
        '1순위': 10,
        '2순위': 20,
        '3순위': 30,
        '4순위': 20,
        '5순위': 10
    };

    var dom = document.getElementById('req-cost-analysis-chart');
    var myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });
    var app = {};

    var option;

    const waterMarkText = '';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 300;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.08;
    ctx.font = '20px Microsoft Yahei';
    ctx.translate(50, 50);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(waterMarkText, 0, 0);
    option = {
        backgroundColor: {
            type: 'pattern',
            image: canvas,
            repeat: 'repeat'
        },
        tooltip: {},
        title: [
            {
                text: '요구사항',
                subtext: '전체 ' + reqTotalPrice +'원',
                left: '25%',
                textAlign: 'center'
            },
            {
                text: '난이도 별 통계',
                subtext:
                    '요구사항 난이도 ' +
                    Object.keys(difficultyJson).reduce(function (all, key) {
                        return all + difficultyJson[key];
                    }, 0) + '개',
                left: '75%',
                bottom: '0%',
                textAlign: 'center'
            },
        ],
        grid: [
            {
                top: 50,
                width: '50%',
                bottom: '5%',
                left: 10,
                containLabel: true
            },
            /*            {
                            top: '55%',
                            width: '100%',
                            bottom: 0,
                            left: 10,
                            containLabel: true
                        }*/
        ],
        xAxis: [
            {
                type: 'value',
                max: reqTotalPrice,
                splitLine: {
                    show: false
                }
            },
        ],
        yAxis: [
            {
                type: 'category',
                data: Object.keys(requirementPriceList),
                axisLabel: {
                    interval: 0,
                    rotate: 30
                },
                splitLine: {
                    show: false
                }
            },
        ],
        series: [
            {
                type: 'bar',
                stack: 'chart',
                z: 3,
                label: {
                    position: 'right',
                    show: true
                },
                data: Object.keys(requirementPriceList).map(function (key) {
                    return requirementPriceList[key];
                })
            },
            {
                type: 'bar',
                stack: 'chart',
                silent: true,
                itemStyle: {
                    color: '#eee'
                },
                data: Object.keys(requirementPriceList).map(function (key) {
                    return reqTotalPrice - requirementPriceList[key];
                })
            },
            {
                type: 'pie',
                radius: [0, '30%'],
                center: ['75%', '25%'],
                data: Object.keys(difficultyJson).map(function (key) {
                    return {
                        name: key.replace('.js', ''),
                        value: difficultyJson[key]
                    };
                })
            },
            {
                type: 'pie',
                radius: [0, '30%'],
                center: ['75%', '65%'],
                data: Object.keys(priorityJson).map(function (key) {
                    return {
                        name: key.replace('.js', ''),
                        value: priorityJson[key]
                    };
                })
            }
        ]
    };


    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

function manPowerAnalysisChart(selectedPerson) {

    let manPowerData = personData[selectedPerson];
    console.log(selectedPerson);
    console.log(manPowerData);

    var dom = document.getElementById('manpower-analysis-chart');
    var myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    var option;

    // var salaryArr = [200, 100, 66, 200, 150, 150, 77, 23];
    // var revenueArr = [100, 50, 30, 20, 10, 5, 3, 66];
    //
    // var maxArr = salaryArr.map(function(salary, i) {
    //     return {
    //         value: Math.max(salary, revenueArr[i]),
    //         symbolSize: [0, 0]
    //     };
    // });

    option = {
        grid: {
            top: 50,
            left: '20%',
            bottom: '5%',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none'
            },
        },
        xAxis: {
            data: [selectedPerson],
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: '#ffffff'
            },
        },
        yAxis: {
            splitLine: { show: false },
            axisTick: { show: true },
            axisLine: { show: true },
            axisLabel: {
                show: true,
                color: '#ffffff'
            }
        },
        /*color: ['#e54035'],*/
        series: [
            {
                name: '연봉',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                // symbol: 'path://M0,10 L10,10 L5,0 L0,10 z',
                symbol: 'path://M0,10 C10,10 10,0 20,0 C30,0 30,10 40,10',
                itemStyle: {
                    opacity: 0.5
                },
                emphasis: {
                    itemStyle: {
                        opacity: 0.7
                    }
                },
                data: [manPowerData.salary],
                z: 10,
                label: {
                    show: true,
                    position: 'outside',
                    color: "white",  // 여기에 'color' 속성을 추가해주세요.
                },
            },
            {
                name: '벌어들인 수익',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                // symbol: 'path://M0,10 L10,10 L5,0 L0,10 z',
                symbol: 'path://M0,10 C10,10 10,0 20,0 C30,0 30,10 40,10',
                itemStyle: {
                    opacity: 0.5,
                    /*color: "blue"*/
                },
                emphasis: {
                    itemStyle: {
                        opacity: 0.7,

                    }
                },
                data: [manPowerData.performance],
                z: 10,
                label: {
                    show: true,
                    position: 'outside',
                    color: "white",  // 여기에 'color' 속성을 추가해주세요.
                },
            },
        ]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

// 주식차트
function candleStickChart() {
    var dom = document.getElementById("candlestick-chart-container");
    var myChart = echarts.init(dom, "dark", {
        renderer: "canvas",
        useDirtyRect: false
    });

    var option;

    option = {
        xAxis: {
            data: ["2017-10-24", "2017-10-25", "2017-10-26", "2017-10-27", "2017-10-30"],
            scale: true, // 축의 스케일을 자동으로 조정합니다.
        },
        yAxis: {
            // 상한선을 나타내는 라인을 추가합니다.
            splitLine: {
                lineStyle: {
                    type: 'dashed' // or 'solid'
                }
            },
            min: 0,  // y축의 최소값을 설정합니다.
            max: 70,  // y축의 최대값을 설정합니다.
            scale: true, // 축의 스케일을 자동으로 조정합니다.
        },
        series: [
            {
                type: "candlestick",
                data: [
                    [20, 34, 10, 38],
                    [40, 35, 30, 50],
                    [31, 38, 33, 44],
                    [38, 15, 5, 42]
                ],
                // 상한선을 나타내는 markLine을 추가합니다.
                markLine: {
                    data: [
                        {xAxis: "2017-10-30"}, // 마감일을 나타냅니다.
                        {yAxis: 60} // 상한선을 나타냅니다.
                    ],
                }
            }
        ],
        tooltip: {
            trigger: "axis",
            position: "top",
            borderWidth: 1,
            axisPointer: {
                type: "cross"
            }
        },
        backgroundColor: "rgba(255,255,255,0)"
    };

    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }

    window.addEventListener("resize", myChart.resize);
}

function 담당자목록_조회() {
    // 초기화 로직
    $("#person-select-box").hide();
    $('.person-data + .bootstrap-select .dropdown-menu').empty();
    $('.person-data + .bootstrap-select .filter-option').text("");

    var data = {
        "홍길동": { total: 2000000, salary: 1400000, performance: 600000 },
        "이순신": { total: 3000000, salary: 1800000, performance: 1200000 },
        "유관순": { total: 1500000, salary: 600000, performance: 900000 },
        "안중근": { total: 1200000, salary: 480000, performance: 720000 },
        "세종대왕": { total: 1800000, salary: 720000, performance: 1080000 }
    };

    personData = data;

    var options = Object.keys(personData);
    if (options.length > 0) {
        $("#person-select-box").show();
        $("#first-person-select").text(options[0]);
        manPowerAnalysisChart(options[0]);

        $.each(options, function(index, option) {
            $('.person-data').append($('<option>', {
                value: option,
                text : option
            }));

            var li = $('<li>', { 'rel': index }).append($('<a>', { 'tabindex': '-1', 'class': '', 'text': option }));
            $('.person-data + .bootstrap-select .dropdown-menu').append(li);
        });
    }
    else {
        // 데이터 없을 떄 처리
    }

    $('.person-data + .bootstrap-select .dropdown-menu').on('click', 'li', function() {
        var selectedOption = $(this).text();

        manPowerAnalysisChart(selectedOption);
        $('.person-data + .bootstrap-select .filter-option').text(selectedOption);
    });
}