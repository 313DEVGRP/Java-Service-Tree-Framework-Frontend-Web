//colors
//same as in _variables.scss
//keep it synchronized
var $lime = "#8CBF26",
    $red = "#e5603b",
    $redDark = "#d04f4f",
    $blue = "#6a8da7",
    $green = "#56bc76",
    $orange = "#eac85e",
    $pink = "#E671B8",
    $purple = "#A700AE",
    $brown = "#A05000",
    $teal = "#4ab0ce",
    $gray = "#666",
    $white = "#fff",
    $textColor = $gray;

//turn off charts is needed
var chartsOff = false;
if (chartsOff){
    nv.addGraph = function(){};
}

COLOR_VALUES = [$red, $orange, $green, $blue, $teal, $redDark];

var colors = function(){
    if (!window.d3) return false;
    return d3.scale.ordinal().range(COLOR_VALUES);
}();

function keyColor(d, i) {
    return colors(d.key)
}

/**
 * Util functions
 */

// function testData(stream_names, points_count) {
//     var now = new Date().getTime(),
//         day = 1000 * 60 * 60 * 24, //milliseconds
//         days_ago_count = 60,
//         days_ago = days_ago_count * day,
//         days_ago_date = now - days_ago,
//         points_count = points_count || 45, //less for better performance
//         day_per_point = days_ago_count / points_count;
//     return stream_layers(stream_names.length, points_count, .1).map(function(data, i) {
//         return {
//             key: stream_names[i],
//             values: data.map(function(d,j){
//                 return {
//                     x: days_ago_date + d.x * day * day_per_point,
//                     y: Math.floor(d.y * 100) //just a coefficient
//                 }
//             })
//         };
//     });
// }

// var testData = testData(['Search', 'Referral', 'Direct', 'Organic'], 25),// just 25 points, since there are lots of charts
//     pieSelect = d3.select("#sources-chart-pie"),
//     pieFooter = d3.select("#data-chart-footer"),
//     pieChart;

// nv.addGraph(function() {
//
//     /*
//      * we need to display total amount of visits for some period
//      * calculating it
//      * pie chart uses y-property by default, so setting sum there.
//      */
//     for (var i = 0; i < testData.length; i++){
//         testData[i].y = Math.floor(d3.sum(testData[i].values, function(d){
//             return d.y;
//         }))
//     }
//
//     var chart = nv.models.pieChartTotal()
//         .x(function(d) {return d.key })
//         .margin({top: 0, right: 20, bottom: 20, left: 20})
//         .values(function(d) {return d })
//         .color(COLOR_VALUES)
//         .showLabels(false)
//         .showLegend(false)
//         .tooltipContent(function(key, y, e, graph) {
//             return '<h4>' + key + '</h4>' +
//                 '<p>' +  y + '</p>'
//         })
//         .total(function(count){
//             return "<div class='visits'>" + count + "<br/> visits </div>"
//         })
//         .donut(true);
//     chart.pie.margin({top: 10, bottom: -20});
//
//     var sum = d3.sum(testData, function(d){
//         return d.y;
//     });
//     pieFooter
//         .append("div")
//         .classed("controls", true)
//         .selectAll("div")
//         .data(testData)
//         .enter().append("div")
//         .classed("control", true)
//         .style("border-top", function(d, i){
//             return "3px solid " + COLOR_VALUES[i];
//         })
//         .html(function(d) {
//             return "<div class='key'>" + d.key + "</div>"
//                 + "<div class='value'>" + Math.floor(100 * d.y / sum) + "%</div>";
//         })
//         .on('click', function(d) {
//             pieChartUpdate.apply(this, [d]);
//             setTimeout(function() {
//                 // pieSelect.selectAll('.control').classed("disabled", function(d){
//                 //     return d.disabled;
//                 // });
//             }, 100);
//         });
//
//     d3.select("#sources-chart-pie svg")
//         .datum([testData])
//         .transition(500).call(chart);
//     nv.utils.windowResize(chart.update);
//
//     pieChart = chart;
//
//     return chart;
// });

function mockData(stream_names, points_count) {
    return stream_layers(stream_names.length, points_count, 0.1).map(function (data, i) {
        return {
            key: stream_names[i],
            values: data.map(function (d, j) {
                return {
                    y: Math.floor(Math.random() * 10) + 1 //just a coefficient
                };
            })
        };
    });
}

function roundToPrecision(subject, precision) {
    return +(+subject).toFixed(precision);
}

var openCount = 2;
var underwayCount = 2;
var completeCount = 5;
var etcCount = 1;

function loadChart(chartElement, footerElement, json) {
    nv.addGraph(function () {
        /*
         * we need to display total amount of visits for some period
         * calculating it
         * pie chart uses y-property by default, so setting sum there.
         */
        var testData = mockData(["열림", "진행 중", "완료", "기타"], 25); // just 25 points, since there are lots of charts
        var pieChart;
        var pieFooter = d3.select(footerElement);

        // for (var i = 0; i < testData.length; i++){
        //     testData[i].y = Math.floor(d3.sum(testData[i].values, function(d){
        //         return d.y;
        //     }))
        // }

        console.log("testData.length = " + testData.length);
        testData[0].y = json.openCount;
        testData[1].y = json.underwayCount;
        testData[2].y = json.completeCount;
        testData[3].y = json.etcCount;

        // 요구사항 없을 경우 테스트
        // testData[0].y = 0;
        // testData[1].y = 0;
        // testData[2].y = 0;
        // testData[3].y = 0;

        console.log("testData[0].y: ", testData[0].y);
        console.log("testData[1].y: ", testData[1].y);
        console.log("testData[2].y: ", testData[2].y);
        console.log("testData[3].y: ", testData[3].y);

        var chart;
        var sum = d3.sum(testData, function (d) {
            return d.y;
        });
        var pieElement = chartElement.split(" ")[0];

        if (sum === 0) {
            console.log("할당된 요구사항이 없는 경우");

            var msg = `
                <div class="msg">
                    할당된 요구사항이 없습니다.
                </div>`;

            $(pieElement).addClass('no-requirement');
            $(pieElement).html(msg);

            pieFooter
                .append("div")
                .classed("controls", true)
                .selectAll("div")
                .data(testData)
                .enter()
                .append("div")
                .classed("control", true)
                .style("border-top", function (d, i) {
                    return "3px solid " + COLOR_VALUES[i];
                })
                .html(function (d) {
                    return (
                        "<div class='key'>" +
                        d.key +
                        "</div>" +
                        "<div class='value'>" +
                        Math.floor(d.y) +
                        "<span class='font11'> 개 ( 0% )</span></div>"
                    );
                });

            return;
        }

        // 파이 차트 그리기
        if ($(pieElement).hasClass('no-requirement')) {
            $(pieElement).removeClass('no-requirement');
            console.log('할당 요구사항 없을 때의 클래스 제거');
        }

        chart = nv.models
            .pieChartTotal()
            .x(function (d) {
                return d.key;
            })
            .margin({ top: 0, right: 20, bottom: 20, left: 20 })
            .values(function (d) {
                return d;
            })
            .color(COLOR_VALUES)
            .showLabels(true)
            .showLegend(false)
            .tooltipContent(function (key, y, e, graph) {
                return "<h4>" + key + "</h4>" + "<p>" + roundToPrecision((100 * y) / sum, 1) + "%</p>";
            })
            .total(function (count) {
                return "<div class='requirements'>" + count + "<br/> requirements </div>";
            })
            .donut(true);
        chart.pie.margin({ top: 10, bottom: -20 });

        pieFooter
            .append("div")
            .classed("controls", true)
            .selectAll("div")
            .data(testData)
            .enter()
            .append("div")
            .classed("control", true)
            .style("border-top", function (d, i) {
                return "3px solid " + COLOR_VALUES[i];
            })
            .html(function (d) {
                // return "<div class='key'>" + d.key + "</div>" + "<div class='value'>" + Math.floor(100 * d.y / sum) + "%</div>";
                return (
                    "<div class='key'>" +
                    d.key +
                    "</div>" +
                    "<div class='value'>" +
                    Math.floor(d.y) +
                    "<span class='font11'> 개 ( " +
                    Math.floor((100 * d.y) / sum) +
                    "% )</span></div>"
                );
            });

        d3.select(chartElement).datum([testData]).transition(500).call(chart);
        nv.utils.windowResize(chart.update);

        d3.selectAll(".nv-label text").each(function (d, i) {
            d3.select(this).style("fill", colors[i]);
            d3.select(this).style("font-weight", 500);
            d3.select(this).style("font-size", 11);
        });

        pieChart = chart;

        return chart;
    });
}

