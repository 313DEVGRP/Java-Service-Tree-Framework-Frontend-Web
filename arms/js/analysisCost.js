var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId; // 선택된 버전 아이디
var dataTableRef;
var mailAddressList; // 투입 작업자 메일
var req_count, linkedIssue_subtask_count, resource_count, req_in_action, total_days_progress;

var dashboardColor;
var pdServiceData;

var pdServiceListData;
var versionListData;

var 버전별요구사항별 = {};
var 인력맵 = {};

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
            "js/analysis/topmenu/topMenu.js"
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

            //제품(서비스) 셀렉트 박스 이니시에이터
            makePdServiceSelectBox();

            //버전 멀티 셀렉트 박스 이니시에이터
            makeVersionMultiSelectBox();

            dashboardColor = dashboardPalette.dashboardPalette01;

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
                console.log("[analysisCost :: makePdServiceSelectBox] :: pdServiceListData => " );
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
            console.log("[ analysisCost :: makeVersionMultiSelectBox ] :: versionTag");
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

            버전별_요구사항별_인력정보가져오기(selectedPdServiceId, selectedVersionId);
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
                // getReqStatusAndAssignees(selectedPdServiceId, selectedVersionId);

                // 투자 대비 소모 비용 차트
                compareCostsChart(selectedPdServiceId, selectedVersionId);
                // 수익 현황 차트
                incomeStatusChart();
                
                버전별_요구사항별_인력정보가져오기(selectedPdServiceId, selectedVersionId);


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
function costInput(인력맵) {

    console.log(" [ analysisCost :: costInput ] :: 인력데이터 => ");
    console.log(인력맵);

    // 버전 정보
    var mockVersionData = [
        {
            "version": "BaseVersion",
            "period": "2023-10-01 ~ 2023-10-31",
            "cost": ""
        },
        {
            "version": "1.0.0",
            "period": "2023-11-01 ~ 2023-11-30",
            "cost": ""
        },
        {
            "version": "1.0.1",
            "period": "2023-12-01 ~ 2023-12-31",
            "cost": ""
        },
        {
            "version": "24.01",
            "period": "2024-01-01 ~ 2024-01-30",
            "cost": ""
        },
        {
            "version": "24.02",
            "period": "2024-02-01 ~ 2024-02-29",
            "cost": ""
        }
    ];

    $('#version-cost').DataTable({
        data: mockVersionData,
        columns: [
            { data: "version", title: "버전", className: "dt-center" },
            { data: "period", title: "기간", className: "dt-center" },
            {
                data: "cost",
                title: "비용 (입력)",
                className: "dt-center",
                render: function(data, type, row) {
                    return '<input type="text" class="cost-input"value="' + data + '"> 만원';
                }
            }
        ],
        drawCallback: function(settings) {
            $('.cost-input').on('input', function() {
                var value = this.value.replace(/,/g, '');
                this.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            });
        }
    });

    // 연봉 정보
    let mockManpowerData2 = Object.keys(인력맵).map((key) => {
        return 인력맵[key];
    });

    console.log(mockManpowerData2);

    var mockManpowerData = [
        {
            "name": "홍길동",
            "salary": ""
        },
        {
            "name": "이순신",
            "salary": ""
        },
        {
            "name": "이순신",
            "salary": ""
        },
        {
            "name": "유관순",
            "salary": ""
        },
        {
            "name": "안중근",
            "salary": ""
        },
        {
            "name": "세종대왕",
            "salary": ""
        }
        /*['홍길동', '1.0', ''],
        ['홍길동', '1.1', ''],
        ['이순신', 'BaseVersion', ''],
        ['이순신', '1.0', ''],
        ['이순신', '24.01', ''],
        ['유관순', '24.01', '']*/
    ];
    console.log(mockManpowerData);

    $('#manpower-annual-income').DataTable({
        data: mockManpowerData2,
        columns: [
            {
                name: "이름",
                data: "이름",
                title: "투입 인력",
                className: "dt-center"
            },
            {
                title: "연봉 (입력)",
                data: "연봉",
                className: "dt-center",
                render: function(data, type, row) {
                    return '<input type="text" class="salary-input"value="' + data + '"> 만원';
                }
            }
        ],
        drawCallback: function(settings) {
            $('.salary-input').on('input', function() {
                var value = this.value.replace(/,/g, '');
                this.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                // 같은 그룹의 모든 연봉 입력 필드를 찾아 값 업데이트
                var name = $(this).parents('tr').find('td').first().text();
                var salaryInputs = $('td:contains("' + name + '")').siblings().find('.salary-input');
                salaryInputs.val(this.value);
            });
        },
        /*rowsGroup: [
            "name:name",
        ]*/
    });

    /*var data = [
        ['11111', '010-1111-1111', '33333'],
        ['11111', '02-2222-2222', '33333'],
        ['aaa', '010-3333-3333', 'bbb'],
        ['aaa', '02-4444-4444', 'bbb'],
        ['ㄱㄱㄱ', '010-5555-5555', 'ㅎㅎㅎ'],
        ['ㄱㄱㄱ', '02-5555-5555', 'ㅎㅎㅎ']
    ];

    var table = $('#manpower-annual-income').DataTable({
        columns: [
            {
                name: 'rowspan',
                title: 'First group',
            },
            {
                title: 'Second group',
            },
            {
                title: 'Third group',
            }
        ],
        data: data,
        rowsGroup: [
            'rowspan:name'
        ]
    });*/
}

/////////////////////////////////////////////////////////
// 요구사항 별 수익 현황 그래프
/////////////////////////////////////////////////////////
function incomeStatusChart(){
    var chartDom = document.getElementById('income_status_chart');
    var myChart = echarts.init(chartDom, null, {
        renderer: "canvas",
        useDirtyRect: false
    });
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
            },
            scale: true
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#FFFFFF'
            },
            scale: true,
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
            },
            {
                type: "candlestick",
                data: [
                    [120, 134, 110, 138],
                    [138, 144, 150, 178],
                    [120, 134, 110, 138],
                    [120, 134, 110, 138],
                    [120, 134, 110, 138],
                    [120, 134, 110, 138]
                ],
            }
        ],
        tooltip: {
            trigger: "axis",
            position: "top",
            borderWidth: 1,
            axisPointer: {
                type: "shadow"
            }
        },
    };

    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }

    window.addEventListener("resize", myChart.resize);
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

    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }

    window.addEventListener("resize", myChart.resize);
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

function reqCostAnalysisChart(버전별요구사항별) {

    console.log(" [ analysisCost :: reqCostAnalysisChart :: 버전별요구사항별 data -> ");
    console.log(버전별요구사항별);

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
        요구사항19: 30000000,
        요구사항11: 10000000,
        요구사항12: 20000000,
        요구사항13: 30000000,
        요구사항14: 40000000,
        요구사항15: 50000000,
        요구사항16: 60000000,
        요구사항17: 30000000,
        요구사항18: 30000000,
        요구사항19: 30000000,
        요구사항20: 10000000,
        요구사항21: 20000000,
        요구사항22: 30000000,
        요구사항23: 40000000,
        요구사항24: 50000000,
        요구사항25: 60000000,
        요구사항26: 30000000,
        요구사항27: 30000000,
        요구사항28: 30000000,
        요구사항29: 10000000,
        요구사항30: 20000000,
        요구사항31: 30000000,
        요구사항32: 40000000,
        요구사항33: 50000000,
        요구사항34: 60000000,
        요구사항35: 30000000,
        요구사항36: 30000000,
        요구사항37: 30000000,
        요구사항38: 10000000,
        요구사항39: 20000000,
        요구사항40: 30000000
    };

    let reqTotalPrice = 0;
    for (let key in requirementPriceList) {
        reqTotalPrice += requirementPriceList[key];
    }

    let size = Object.keys(requirementPriceList).length;
    let x = 1;

    if (size > 0) {
        x = (15 / size) * 100;
    }

    console.log(" [ analysisCost :: reqCostAnalysisChart :: requirement total price -> " + reqTotalPrice);

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
                // text: '요구사항',
                subtext: '전체 ' + reqTotalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원',
                left: '25%',
                textAlign: 'center',
                textStyle: {
                    color: '#ffffff'  // 제목의 색상을 하얀색으로 변경
                },
                subtextStyle: {
                    color: '#ffffff'  // 부제목의 색상을 하얀색으로 변경
                }
            },
            {
                text: '난이도 및 우선순위 통계',
                subtext: '',
                left: '75%',
                bottom: '0%',
                textAlign: 'center',
                textStyle: {
                    color: '#ffffff'  // 제목의 색상을 하얀색으로 변경
                },
                subtextStyle: {
                    color: '#ffffff'  // 부제목의 색상을 하얀색으로 변경
                }
            },
        ],
        grid: [
            {
                top: 50,
                left: '5%',  // 차트의 왼쪽 여백을 늘려 슬라이더와 겹치지 않게 함
                right: '0%', // 차트의 오른쪽 여백 (필요에 따라 조정)
                width: '50%',
                bottom: '5%',
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
                },
                axisLabel: {
                    rotate: 45,
                    color: '#FFFFFFFF',
                },
            },
        ],
        yAxis: [
            {
                type: 'category',
                data: Object.keys(requirementPriceList),
                splitLine: {
                    show: false
                },
                axisLabel: {
                    color: '#FFFFFFFF',
                    rotate: 45,
                },
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
                    color: '#FFFFFF'
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
                }),
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
        ],
        dataZoom: [
            {
                type: 'inside',
                yAxisIndex: [0], // y축에만 dataZoom 기능 적용
                start: 0,
                end: x
            },
            {
                show: true,
                type: 'slider',
                left: '0%',
                backgroundColor: 'rgba(0,0,0,0)', // 슬라이더의 배경색
                dataBackgroundColor: 'rgba(255,255,255,1)', // 데이터 배경색
                yAxisIndex: [0],
                start: 0,
                end: x
            }
        ],

    };


    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

function 버전별_요구사항별_인력정보가져오기(pdServiceLink, pdServiceVersionLinks) {
    const url = new UrlBuilder()
        .setBaseUrl('/auth-user/api/arms/analysis/cost/version-req-assignees')
        .addQueryParam('pdServiceLink', pdServiceLink)
        .addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
        .addQueryParam('isReqType', "REQUIREMENT")
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
            200: function (apiResponse) {
                console.log(" [ analysisCost :: 버전별_요구사항별_인력정보가져오기 ] :: response data -> ");
                console.log(apiResponse.response.전체담당자목록);
                버전별요구사항별 = apiResponse.response.버전;
                인력맵 = apiResponse.response.전체담당자목록;

                담당자목록_조회(인력맵);
                costInput(인력맵);
                reqCostAnalysisChart(버전별요구사항별);
            }
        }
    });

}

async function 담당자목록_조회(인력맵) {
    // 초기화 로직
    $("#person-select-box").hide();
    $('.person-data + .bootstrap-select .dropdown-menu').empty();
    $('.person-data + .bootstrap-select .filter-option').text("");

    let 연봉 = 20000000;
    let 성과 = 10000000;

    Object.keys(인력맵).forEach((key) => {
        인력맵[key].연봉 = 연봉;
        인력맵[key].성과 = 성과;
        연봉 -= 1000000;
        성과 += 1000000;
    });

    console.log(" [ analysisCost :: 담당자목록_조회 ] :: 인력맵 -> ");
    console.log(인력맵);

    var options = Object.keys(인력맵);

    console.log(options);
    if (options.length > 0) {
        $("#person-select-box").show();
        $("#first-person-select").text(options[0]);
        인력별_연봉대비_성과차트(options[0]);

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
        console.log("담당자가 하나도 없습니다.");
    }

    $('.person-data + .bootstrap-select .dropdown-menu').on('click', 'li', function() {
        var selectedOption = $(this).text();

        인력별_연봉대비_성과차트(selectedOption);
        $('.person-data + .bootstrap-select .filter-option').text(selectedOption);
    });
}

function 인력별_연봉대비_성과차트(selectedPerson) {

    let manPowerData = 인력맵[selectedPerson];

    console.log(" [ analysisCost :: 인력별_연봉대비_성과차트 :: selected person name -> " + selectedPerson);
    console.log(" [ analysisCost :: 인력별_연봉대비_성과차트 :: selected person data -> ");
    console.log(manPowerData);

    var dom = document.getElementById('manpower-analysis-chart');
    var myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    var option;

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
            confine: true
        },
        xAxis: {
            data: [manPowerData.이름],
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: '#FFFFFFFF',
                opacity: 1
            },
            scale: true,
        },
        yAxis: {
            splitLine: { show: false },
            axisTick: { show: true },
            axisLine: { show: false },
            axisLabel: {
                show: true,
                color: '#FFFFFFFF',
                opacity: 1
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
                data: [manPowerData.연봉],
                z: 10,
                label: {
                    show: false,
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
                data: [manPowerData.성과],
                z: 10,
                label: {
                    show: false,
                    position: 'outside',
                    color: "#FFFFFFFF"
                },
            },
            {
                name: '연봉 라벨',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                symbol: 'path://M0,0',  // 심볼을 비워서 별도의 바가 보이지 않도록 합니다.
                data: [manPowerData.연봉],
                z: 11,  // z 값을 더 크게 설정하여 라벨이 다른 요소들 위에 오도록 합니다.
                label: {
                    show: true,
                    position: 'outside',
                    color: "white",
                    formatter: function(params)
                    {
                        return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
                },
                tooltip: {
                    show: false
                }
            },
            {
                name: '벌어들인 수익',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                symbol: 'path://M0,0',  // 심볼을 비워서 별도의 바가 보이지 않도록 합니다.
                data: [manPowerData.성과],
                z: 11,  // z 값을 더 크게 설정하여 라벨이 다른 요소들 위에 오도록 합니다.
                label: {
                    show: true,
                    position: 'outside',
                    color: "white",
                    formatter: function(params)
                    {
                        return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
                },
                tooltip: {
                    show: false
                }
            },
        ]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

function 전역인력맵확인() {
    return new Promise(resolve => {
        let intervalId = setInterval(() => {
            console.log(인력맵);
            if (인력맵.length > 0 ) {
                clearInterval(intervalId);
                resolve(인력맵);
            }
        }, 500);  // 100ms마다 globalDeadline 값 확인
    });
}