
function exampleHorizontalBarChart() {
    var chartDom = document.getElementById('main');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: 'World Population'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {},
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.03]
        },
        yAxis: {
            type: 'category',
            data: [
                '우선순위-보류',
                '우선순위-미비',
                '우선순위-하',
                '우선순위-중',
                '우선순위-상',
                '누적' // 총합을 넣자. total.
            ]
        },
        series: [
            {
                name: '양형석', // 사람 넣고
                type: 'bar',
                data: [18203, 23489, 29034, 104970, 131744, 630230] // 각 하위목록별 값 넣고
            },
            {
                name: '문용민',
                type: 'bar',
                data: [19325, 23438, 31000, 121594, 134141, 681807]
            }
        ]
    };

    option && myChart.setOption(option);
}

function drawHorizontalBarChart(target,yAxisDataArr,seriesArr) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {},
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.03]
        },
        yAxis: {
            type: 'category',
            data: yAxisDataArr
        },
        series: seriesArr
    };

    myChart.setOption(option);

    return myChart;
}

