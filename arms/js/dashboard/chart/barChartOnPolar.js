//drawBarOnPolar2("polar_bar", cat_persons, dashboardColor.manpowerPerformance, legend_arr, arr2di);
function drawBarOnPolar2(target, categories, color, legends, arr2di) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);

    var _categories = (categories === undefined ? ["데이터 없음"] : categories);

    var option = {
        angleAxis: {
            type: 'category',
            data: categories
        },
        radiusAxis: {},
        polar: { center: ["50%", "60%"], radius: "60%"},
        series: [
            {
                type: 'bar',
                data: arr2di[0],//[1, 2, 3, 4, 3],
                itemStyle: {
                    color: color[0]
                },
                coordinateSystem: 'polar',
                name: legends[0],
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: arr2di[1],//[2, 4, 6, 1, 3],
                itemStyle: {
                    color: color[1]
                },
                coordinateSystem: 'polar',
                name: legends[1],
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: arr2di[2],//[1, 2, 3, 4, 1],
                itemStyle: {
                    color: color[2]
                },
                coordinateSystem: 'polar',
                name: legends[2],
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: arr2di[3],//[2, 2, 2, 2, 4],
                itemStyle: {
                    color: color[3]
                },
                coordinateSystem: 'polar',
                name: legends[3],
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: arr2di[4],//[2, 2, 2, 2, 4],
                itemStyle: {
                    color: color[4]
                },
                coordinateSystem: 'polar',
                name: legends[4],
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: arr2di[5],//[2, 2, 2, 2, 4],
                itemStyle: {
                    color: color[5]
                },
                coordinateSystem: 'polar',
                name: legends[5],
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: arr2di[6],//[2, 2, 2, 2, 4],
                itemStyle: {
                    color: color[6]
                },
                coordinateSystem: 'polar',
                name: legends[6],
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: arr2di[7],//[2, 2, 2, 2, 4],
                itemStyle: {
                    color: color[7]
                },
                coordinateSystem: 'polar',
                name: legends[7],
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            }
        ],
        legend: {
            show: true,
            data: legends, // [ A, B , C , D, ...]
            textStyle: {
                color: "#FFFFFF"
            }
        }
    };
    myChart.setOption(option);

    window.onresize = function() {
        myChart.resize();
    };
}

function drawBarOnPolar(target, categories, legends, seriesArr) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);

    var option = {
        angleAxis: {
            type: 'category',
            data: categories
        },
        radiusAxis: {},
        polar: { center: ["50%", "60%"], radius: "60%"},
        series: seriesArr,
        legend: {
            show: true,
            data: legends, // [ A, B , C , D, ...]
            textStyle: {
                color: "#FFFFFF"
            }
        }
    };
    myChart.setOption(option,true);

    return myChart;
}