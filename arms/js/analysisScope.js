var dashboardColor;
var selectedVersionId;
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
            "./js/common/colorPalette.js",
            // network chart
            "./js/analysisTime/d3.v5.min.js",
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


    // $("#selected_pdService").on("select2:open", function () {
    //     //슬림스크롤
    //     makeSlimScroll(".select2-results__options");
    // });

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

        console.log("선택된 제품(서비스) c_id = " + $("#selected_pdService").val());

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

                setTimeout(function () {
                    networkChart(pdServiceVersions, data);
                },1000);

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
