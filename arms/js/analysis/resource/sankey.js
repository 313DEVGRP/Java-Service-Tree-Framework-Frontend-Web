var SankeyChart = (function ($) {
    "use strict";

    var initSvg = function () {
        var margin = { top: 10, right: 10, bottom: 10, left: 10 };
        var width = document.getElementById("chart-product-manpower").offsetWidth;
        var height = document.getElementById("chart-product-manpower").offsetHeight - margin.top - margin.bottom;
        var vx = width + margin.left + margin.right;
        var vy = height + margin.top + margin.bottom;

        return d3
            .select("#chart-product-manpower") // 그려지는 위치
            .append("svg")
            .attr("viewBox", "0 0 " + vx + " " + vy)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    };

    var drawEmptyChart = function () {
        var margin = { top: 10, right: 10, bottom: 10, left: 10 };
        var width = document.getElementById("chart-product-manpower").offsetWidth - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        initSvg()
            .append("text")
            .style("font-size", "12px")
            .style("fill", "white")
            .style("font-weight", 5)
            .text("선택된 어플리케이션이 없습니다.")
            .attr("x", width / 2)
            .attr("y", height / 2);R
    };

    var loadChart = function (data) {
        var margin = { top: 10, right: 10, bottom: 10, left: 10 };
        var width = document.getElementById("chart-product-manpower").offsetWidth - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        var formatNumber = d3.format(",.0f");
        var format = function (d) {
            return formatNumber(d);
        };

        var iconXs = [10, 12, 11.5, 12];
        var nodeIcons = ['<i class="fa fa-cube"></i>', '<i class="fa fa-server"></i>', '<i class="fa fa-database"></i>'];
        var colors = dashboardColor.productToMan;

        var svg = initSvg();

        if (isEmpty(data.nodes)) {
            svg
                .append("text")
                .style("font-size", "12px")
                .style("fill", "white")
                .style("font-weight", 5)
                .text("해당 프로젝트에 매핑된 버전이 없습니다.")
                .attr("x", width / 2)
                .attr("y", height / 2);

            return;
        }

        var sankey = d3.sankey()
            .nodeWidth(36)
            .nodePadding(40)
            .size([width, height]);

        var graph = {
            nodes: [],
            links: []
        };
        var nodeMap = { };

        var color = d3.scaleOrdinal(colors);
        var iconX = d3.scaleOrdinal(iconXs);
        var nodeIcon = d3.scaleOrdinal(nodeIcons);

        data.nodes.forEach(function (nodeInfos) {
            graph.nodes.push(nodeInfos);
        });

        data.links.forEach(function (nodeLinks) {
            graph.links.push(nodeLinks);
        });

        graph.nodes.forEach(function (node) {
            nodeMap[node.id] = node;
        });

        graph.links = graph.links.map(function (link) {
            return {
                source: nodeMap[link.source],
                target: nodeMap[link.target],
                value: 1
            };
        });

        graph = sankey(graph);

        var link = svg
            .append("g")
            .selectAll(".link")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function (d) {
                return d.width;
            });

        link.append("title").text(function (d) {
            return d.source.name + " → " + d.target.name + "\n" + format(d.value);
        });

        var node = svg.append("g").selectAll(".node").data(graph.nodes).enter().append("g").attr("class", "node");

        node
            .append("rect")
            .attr("x", function (d) {
                return d.x0;
            })
            .attr("y", function (d) {
                return d.y0;
            })
            .attr("height", function (d) {
                return d.y1 - d.y0;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function (d) {
                return (d.color = color(d.type));
            })
            .style("cursor", "default")
            .style("stroke", function (d) {
                return d3.rgb(d.color).darker(2);
            })
            .append("title")
            .text(function (d) {
                return d.name + "\n" + format(d.value);
            });

        node
            .append("svg:foreignObject")
            .attr("x", function (d) {
                return d.x0 + iconX(d.type);
            })
            .attr("y", function (d) {
                return (d.y1 + d.y0 - 16) / 2;
            })
            .attr("height", "16px")
            .attr("width", "16px")
            .style("cursor", "default")
            .html((d) => nodeIcon(d.type));

        node
            .append("text")
            .attr("x", function (d) {
                return d.x0 > 0 ? d.x0 - 6 : d.x1 - d.x0 + 6;
            })
            .attr("y", function (d) {
                return (d.y1 + d.y0 - 18) / 2;
            })
            .attr("dy", "0.35em")
            .style("fill", function (d) {
                return (d.color = color(d.type));
            })
            .style("text-shadow", function (d) {
                return `0 1px 0 ${(d.color = color(d.type))}`;
            })
            .attr("text-anchor", function (d) {
                return d.x0 > 0 ? "end" : "start";
            })
            .text(function (d) {
                return `[${d.type}]`;
            })
            .filter(function (d) {
                return d.x < width / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        node
            .append("text")
            .attr("x", function (d) {
                return d.x0 > 0 ? d.x0 - 6 : d.x1 - d.x0 + 6;
            })
            .attr("y", function (d) {
                return (d.y1 + d.y0 + 18) / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) {
                return d.x0 > 0 ? "end" : "start";
            })
            .attr("transform", null)
            .text(function (d) {
                return d.name;
            })
            .filter(function (d) {
                return d.x < width / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");
    };

    return { loadChart, drawEmptyChart };
})(jQuery);


////////////////////////////////////////////////////////////////////////////////////////
// 제품-버전-투입인력 차트 생성
////////////////////////////////////////////////////////////////////////////////////////
function drawProductToManSankeyChart(pdServiceLink, pdServiceVersionLinks) {
    function removeSankeyChart() {
        const svgElement = d3.select("#chart-product-manpower").select("svg");
        if (!svgElement.empty()) {
            svgElement.remove();
        }
    }

    const url = new UrlBuilder()
        .setBaseUrl('/auth-user/api/arms/dashboard/version-assignees')
        .addQueryParam('pdServiceLink', pdServiceLink)
        .addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
        .addQueryParam('메인그룹필드', "pdServiceVersions")
        .addQueryParam('하위그룹필드들', "assignee.assignee_accountId.keyword,assignee.assignee_displayName.keyword")
        .addQueryParam('크기', pdServiceVersionLinks.split(",").length)
        .addQueryParam('하위크기', 5)
        .addQueryParam("isReqType", "ISSUE")
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
                removeSankeyChart();
                const data = apiResponse.response;
                SankeyChart.loadChart(data);
            }
        }
    });

}