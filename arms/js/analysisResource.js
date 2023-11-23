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
            //"js/analysis/table/workerDetailInfoTable.js"
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

            // 담당자 별 이슈 상태 차트(mock)
            // https://echarts.apache.org/en/option.html#tooltip.formatter
            echartExample();
        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}

function echartExample(){
    var myChart = echarts.init(document.getElementById('apache-echarts-stacked-horizontal-bar'));
    var option;
    option = {
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
            data: ['완료', 'Done', 'In Progress', 'Resolved', 'Backlog', '진행 중', '해야 할 일', '열기', '완료됨', 'Open'],
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
            data: ['dumbbelloper', '김찬호', 'admin', '최수현', 'hsyang', 'gkfn185'] // 담당자 이록
        },

        series: [
            {
                name: '완료', // 이슈 상태
                type: 'bar',
                stack: 'total',
                itemStyle: {
                    // color: '#FF0000'
                },
                label: {
                    show: true,
                    // position: 'top'
                },
                emphasis: {
                    focus: 'series'
                },
                data: [320, 302, 301, 334, 390, 330]
            },
            {
                name: 'Done',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [120, 132, 101, 134, 90, 230]
            },
            {
                name: 'In Progress',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [220, 182, 191, 234, 290, 330]
            },
            {
                name: 'Resolved',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [150, 212, 201, 154, 190, 330]
            },
            {
                name: 'Backlog',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [820, 832, 901, 934, 1290, 1330]
            },

            {
                name: '진행 중',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [820, 832, 901, 934, 1290, 1330]
            },
            {
                name: '해야 할 일',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [820, 832, 901, 934, 1290, 1330]
            },
            {
                name: '열기',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [820, 832, 901, 934, 1290, 1330]
            },
            {
                name: '완료됨',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [820, 832, 901, 934, 1290, 1330]
            },{
                name: 'Open',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [119, 832, 901, 934, 1290, 1330]
            },
        ]
    };

    option && myChart.setOption(option);

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

            // 요구사항 및 연결이슈 통계
            getReqLinkedIssueData($("#selected_pdService").val(), selectedVersionId, true);
            getReqLinkedIssueData($("#selected_pdService").val(), selectedVersionId, false);
            // 작업자별 상태
            drawResource($("#selected_pdService").val(), selectedVersionId);

            drawProductToManSankeyChart($("#selected_pdService").val(), selectedVersionId);
            drawManRequirementTreeMapChart($("#selected_pdService").val(), selectedVersionId);
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
                selectedVersionId = pdServiceVersionIds.join(',');
                // 요구사항 및 연결이슈 통계 - 리펙토링예정
                getReqLinkedIssueData($("#selected_pdService").val(), selectedVersionId, true);
                getReqLinkedIssueData($("#selected_pdService").val(), selectedVersionId, false);

                // 작업자별 상태
                drawResource($("#selected_pdService").val(), selectedVersionId);

                drawProductToManSankeyChart($("#selected_pdService").val(), selectedVersionId);
                drawManRequirementTreeMapChart($("#selected_pdService").val(), selectedVersionId);

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

function getReqLinkedIssueData(pdservice_id, pdServiceVersionLinks, isReq) {
    console.log(pdServiceVersionLinks);
    var _url = "/auth-user/api/arms/analysis/resource/normal-version/"+pdservice_id;
    $.ajax({
        url: _url,
        type: "GET",
        data: { "서비스아이디" : pdservice_id,
                "메인그룹필드" : "pdServiceVersion",
                "isReq" : isReq,
                "컨텐츠보기여부" : true,
                "크기" : 1000,
                "pdServiceVersionLinks" : pdServiceVersionLinks},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                if(isReq == true) {
                    console.log("요구사항");
                    req_count = data["전체합계"];
                    $("#req_count").text(data["전체합계"]);
                } else {
                    console.log("연결이슈");
                    linkedIssue_subtask_count = data["전체합계"];
                    $("#linkedIssue_subtask_count").text(data["전체합계"]);
                }
                // 작업자수 및 평균계산 - 수정예정
                getAssigneeInfo(pdservice_id,pdServiceVersionLinks);
            }
        },
    });
}

function getWorkStatus(pdservice_id, pdServiceVersionLinks) {
    var _url = "/auth-user/api/arms/analysis/resource/workerStatus/"+pdservice_id;
    $.ajax({
        url: _url,
        type: "GET",
        data: { "서비스아이디" : pdservice_id,
                "메인그룹필드" : "assignee.assignee_displayName.keyword",
                "하위그룹필드들": "isReq,status.status_name.keyword",
                "컨텐츠보기여부" : true,
                "크기" : 1000,
                "하위크기": 1000,
                "pdServiceVersionLinks" : pdServiceVersionLinks},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                console.log("=== === === 작업자 상태 집계 시작=== === ===")
                console.log(data);
                let search_keys1 = data["검색결과"]["group_by_assignee.assignee_displayName.keyword"];
                console.log(search_keys1);
                console.log(data['검색결과']['group_by_assignee.assignee_displayName.keyword']['필드명'])
                console.log("=== === === 작업자 상태 집계 종료=== === ===")


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

function getAssigneeInfo(pdservice_id, pdServiceVersionLinks) { //버전으로 추가해야함.
    $.ajax({
        url:"/auth-user/api/arms/dashboard/jira-issue-assignee",
        type: "get",
        data: {"pdServiceId" : pdservice_id},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //담당자 미지정 이슈 수
                $('#no_assigned_issue_count').text(data["담당자 미지정"]);
                if (Object.keys(data).length !== "" || Object.keys(data).length !== undefined) {
                    //제품(서비스)에 투입된 총 인원수
                    resource_count = +Object.keys(data).length-1;
                    $('#resource_count').text(resource_count);
                    if (resource_count == 0) {
                        $('#avg_req_count').text("-");
                        $('#avg_linkedIssue_count').text("-");
                    } else {
                        $('#avg_req_count').text((req_count/resource_count).toFixed(1));
                        $('#avg_linkedIssue_count').text((linkedIssue_subtask_count/resource_count).toFixed(1));
                    }
                } else {
                    $('#resource_count').text("n/a");
                }
            }
        }
    });
}
