var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId;   // 선택된 버전 아이디
var dataTableRef;
var mailAddressList; // 투입 작업자 메일
var req_count, linkedIssue_subtask_count, resource_count, req_in_action;

var dashboardColor;
var pdServiceData;
var versionListData;

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
            "../reference/light-blue/lib/jquery.fileupload.js",
            "../reference/light-blue/lib/jquery.fileupload-fp.js",
            "../reference/light-blue/lib/jquery.fileupload-ui.js",
            //d3
            "js/analysisTime/d3.v5.min.js",
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
            // 제품-버전-투입인력 차트
            "../reference/jquery-plugins/d3-sankey-v0.12.3/d3-sankey.min.js",
        ],
        [   // 생성한 차트 import
            "js/analysis/topmenu/basicRadar.js",
            "js/analysis/topmenu/topMenu.js"
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
            "../arms/js/analysis/resource/sankey.js"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function() {
            // 사이드 메뉴 색상 설정

            $('.widget').widgster();
            setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_scope");

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
        selectedPdServiceId = $("#selected_pdService").val();
        //refreshDetailChart(); 변수값_초기화();
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
            selectedVersionId = versionTag.join(',');
            if (versionTag === null || versionTag == "") {
                alert("버전이 선택되지 않았습니다.");
                return;
            }
            //분석메뉴 상단 수치 초기화
            수치_초기화();

            // 요구사항 및 연결이슈 통계
            getReqAndLinkedIssueData(selectedPdServiceId, selectedVersionId);

            // 네트워크 차트
            statisticsMonitor($("#selected_pdService").val(), selectedVersionId);
            getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);
        }
    });
}


function  bind_VersionData_By_PdService() {
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
                var pdServiceVersionIds = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceVersionIds.push(obj.c_id);
                    var newOption = new Option(obj.c_title, obj.c_id, true, false);
                    $(".multiple-select").append(newOption);
                }
                수치_초기화();
                selectedVersionId = pdServiceVersionIds.join(',');
                // 요구사항 및 연결이슈 통계
                getReqAndLinkedIssueData(selectedPdServiceId, selectedVersionId);

                // 네트워크 차트
                statisticsMonitor($("#selected_pdService").val(), selectedVersionId);
                getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);

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


// 도넛차트
function donutChart(pdServiceLink, pdServiceVersionLinks) {

    console.log("pdServiceId : " + pdServiceLink);
    console.log("pdService Version : " + pdServiceVersionLinks);
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
        .setBaseUrl('/auth-user/api/arms/dashboard/aggregation/flat')
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
                let 검색결과 = data["검색결과"]["group_by_status.status_name.keyword"];
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

                setTimeout(function () {
                    networkChart(pdServiceVersions, data);
                },1000);

            }
        }
    });

}

function networkChart(pdServiceVersions, jiraIssueData) {
    d3.select("#NETWORK_GRAPH").remove();

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

    // $('#notifyNoVersion').show();
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
                .force("link", d3.forceLink(links).id( function(d){ return d.id; }).distance(80))
                .force("charge", d3.forceManyBody().strength(-800))
                .force("center", d3.forceCenter(width / 2, height / 2));
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
                        .attr("fill", fillCircle(d));
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

