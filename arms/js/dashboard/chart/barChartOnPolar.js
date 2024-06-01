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
        tooltip: {
            trigger: 'item', // 'item'으로 설정하여 데이터 포인트에 마우스를 올리면 툴팁이 표시되도록 함
            formatter: function(params) {
                return `${params.seriesName}<br/>${params.name}: ${params.value}`;
            }
        },
        angleAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                textStyle: {
                    color: 'white',
                    fontWeight: "",
                    fontSize: "11"
                }
            },
        },
        radiusAxis: {},
        polar: { center: ["50%", "55%"], radius: "65%"},
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

    window.addEventListener('resize', function () {
        myChart.resize();
    });

    return myChart;
}

function drawBarOnPolarAtScope(target, categories, legends, seriesArr) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);

    var option = {
        angleAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                textStyle: {
                    color: 'white',
                    fontWeight: "",
                    fontSize: "11"
                }
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        radiusAxis: {},
        polar: { center: ["50%", "50%"], radius: "70%"},
        series: seriesArr,
        legend: {
            show: true,
            data: legends, // [ A, B , C , D, ...]
            textStyle: {
                color: 'white', // 이름의 텍스트 색상 설정
                fontStyle: 'normal', // 이름의 텍스트 스타일 설정 (예: italic, normal)
                fontWeight: '', // 이름의 텍스트 굵기 설정 (예: bold, normal)
                fontSize: 11 // 이름의 텍스트 크기 설정
            }
        }
    };
    myChart.setOption(option,true);

    window.addEventListener('resize', function () {
        myChart.resize();
    });
}