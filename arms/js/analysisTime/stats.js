var testData = testData(['monday', 'tuesday', 'wendesday', 'thrusday','friday', 'saturday'],
        20),// just 25 points, since there are lots of charts
    pieSelect = d3.select("#sources-chart-pie"),
    pieFooter = d3.select("#data-chart-footer"),
    // stackedChart,
    // lineChart,
    pieChart,
    barChart;

function pieChartUpdate(d){
    d.disabled = !d.disabled;
    d3.select(this)
        .classed("disabled", d.disabled);
    if (!pieChart.pie.values()(testData).filter(function(d) { return !d.disabled }).length) {
        pieChart.pie.values()(testData).map(function(d) {
            d.disabled = false;
            return d;
        });
        pieFooter.selectAll('.control').classed('disabled', false);
    }
    d3.select("#sources-chart-pie svg").transition().call(pieChart);
}

nv.addGraph(function() {

    /*
     * we need to display total amount of visits for some period
     * calculating it
     * pie chart uses y-property by default, so setting sum there.
     */
    for (var i = 0; i < testData.length; i++){
        testData[i].y = Math.floor(d3.sum(testData[i].values, function(d){
            return d.y;
        }))
    }

    var chart = nv.models.pieChartTotal()
        .x(function(d) {return d.key })
        .margin({top: 0, right: 20, bottom: 20, left: 20})
        .values(function(d) {return d })
        .color(COLOR_VALUES)
        .showLabels(false)
        .showLegend(false)
        .tooltipContent(function(key, y, e, graph) {
            return '<h4>' + key + '</h4>' +
                '<p>' +  y + '</p>'
        })
        .total(function(count){
            return "<div class='visits'>" + count + "<br/> visits </div>"
        })
        .donut(true);
    chart.pie.margin({top: 10, bottom: -20});

    var sum = d3.sum(testData, function(d){
        return d.y;
    });
    pieFooter
        .append("div")
        .classed("controls", true)
        .selectAll("div")
        .data(testData)
        .enter().append("div")
        .classed("control", true)
        .style("border-top", function(d, i){
            return "3px solid " + COLOR_VALUES[i];
        })
        .html(function(d) {
            console.log("sum : " + sum);
            console.log("key : " + d.y);
            return "<div class='key'>" + d.key + "</div>"
                + "<div class='value'>" + Math.floor(100 * d.y / sum) + "%</div>";
        })
        .on('click', function(d) {
            pieChartUpdate.apply(this, [d]);
            setTimeout(function() {
                // stackedChart.update();
                // lineChart.update();
                barChart.update();

                // lineChartOperaHack();
            }, 100);
        });

    d3.select("#sources-chart-pie svg")
        .datum([testData])
        .transition(500).call(chart);
    nv.utils.windowResize(chart.update);

    pieChart = chart;

    return chart;
});

nv.addGraph(function(){
    var chart = nv.models.multiBarChart()
        .margin({left: 30, bottom: 20, right: 0})
        .color(keyColor)
        .controlsColor([$white, $white, $white])
        .showLegend(false);

    chart.yAxis
        .showMaxMin(false)
        .ticks(0)
        .tickFormat(d3.format(',.f'));

    chart.xAxis
        .showMaxMin(false)
        .tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });

    d3.select('#sources-chart-bar svg')
        .datum(testData)
        .transition().duration(500).call(chart);

    nv.utils.windowResize(chart.update);

    barChart = chart;

    return chart;
});

function getData() {
    var arr = [],
        theDate = new Date(2012, 1, 1, 0, 0, 0, 0),
        previous = Math.floor(Math.random() * 100);
    for (var x = 0; x < 30; x++) {
        var newY = previous + Math.floor(Math.random() * 5 - 2);
        previous = newY;
        arr.push({x: new Date(theDate.getTime()), y: newY});
        theDate.setDate(theDate.getDate() + 1);
    }
    return arr;
}
