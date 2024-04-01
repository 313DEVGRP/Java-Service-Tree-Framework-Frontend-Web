
function exampleHorizontalBarChart() {
    var chartDom = document.getElementById('main');
    var myChartEx = echarts.init(chartDom);
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

    option && myChartEx.setOption(option);
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
        legend: {
            left: 'left',
            textStyle: {
                color: 'white',
                fontWeight: "",
                fontSize: "11"
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
            boundaryGap: [0, 0.03],
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
            data: yAxisDataArr,
            axisLine: {
                lineStyle: {
                    width: 1,
                    color: 'gray'
                }
            },
            axisLabel: {
                textStyle: {
                    color: 'white',
                    fontWeight: "",
                    fontSize: "11"
                },
                formatter: function (value) {
                    if (value.length > 10) { // 길이가 10보다 크면 생략
                        return value.substr(0, 10) + '...'; // 일부만 표시하고 "..." 추가
                    } else {
                        return value;
                    }
                }
            }
        },
        series: seriesArr
    };

    option && myChart.setOption(option,true);

    window.addEventListener('resize', function () {
        myChart.resize();
    });

    return myChart;
}