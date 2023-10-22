const categories_mock = ['강남', '송파', '서초', '관악', '동작', '강서', '금천', '강동', '광진', '중랑',
    '노원', '도봉', '강북', '성북', '동대문', '용산', '마포', '구로', '종로'];
const data_mock = [
    [5000, 10000, 6785.71],
    [4000, 10000, 6825],
    [3000, 6500, 4463.33],
    [2500, 5600, 3793.83],
    [2000, 4000, 3060],
    [2000, 4000, 3222.33],
    [2500, 4000, 3133.33],
    [1800, 4000, 3100],
    [2000, 3500, 2750],
    [2000, 3000, 2500],
    [1800, 3000, 2433.33],
    [2000, 2700, 2375],
    [1500, 2800, 2150],
    [1500, 2300, 2100],
    [1600, 3500, 2057.14],
    [1500, 2600, 2037.5],
    [1500, 2417.54, 1905.85],
    [1500, 2000, 1775],
    [1500, 1800, 1650]
];

function drawBarOnPolar(target, categories, data) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);
    // cities와 data
    var _categories = (categories === undefined ? ["데이터 없음"] : categories);
    var _data = (data === undefined ? [0,0,10] : data);

    const barHeight = 50;
    var option = {
        title: {
            text: 'Resources?',
            subtext: 'Data from http://www.a-rms.net/313devgrp/arms/'
        },
        legend: {
            show: true,
            top: 'bottom',
            data: ['Range', 'Average']
        },
        grid: {
            top: 100
        },
        angleAxis: {
            type: 'category',
            data: categories
        },
        tooltip: {
            show: true,
            formatter: function (params) {
                const id = params.dataIndex;
                return (
                    categories[id] +
                    '<br>Lowest：' +
                    data[id][0] +
                    '<br>Highest：' +
                    data[id][1] +
                    '<br>Average：' +
                    data[id][2]
                );
            }
        },
        radiusAxis: {},
        polar: {},
        series: [
            {
                type: 'bar',
                itemStyle: {
                    color: 'transparent'
                },
                data: data.map(function (d) {
                    return d[0];
                }),
                coordinateSystem: 'polar',
                stack: 'Min Max',
                silent: true
            },
            {
                type: 'bar',
                data: data.map(function (d) {
                    return d[1] - d[0];
                }),
                coordinateSystem: 'polar',
                name: 'Range',
                stack: 'Min Max'
            },
            {
                type: 'bar',
                itemStyle: {
                    color: 'transparent'
                },
                data: data.map(function (d) {
                    return d[2] - barHeight;
                }),
                coordinateSystem: 'polar',
                stack: 'Average',
                silent: true,
                z: 10
            },
            {
                type: 'bar',
                data: data.map(function (d) {
                    return barHeight * 2;
                }),
                coordinateSystem: 'polar',
                name: 'Average',
                stack: 'Average',
                barGap: '-100%',
                z: 10
            }
        ]
    };
    myChart.setOption(option);

    window.onresize = function() {
        myChart.resize();
    };
}

function drawBarOnPolar2(target, categories) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);

    var _categories = (categories === undefined ? ["데이터 없음"] : categories);

    var option = {
        angleAxis: {
            type: 'category',
            data: categories
        },
        radiusAxis: {},
        polar: {},
        series: [
            {
                type: 'bar',
                data: [1, 2, 3, 4, 3, 5, 1],
                coordinateSystem: 'polar',
                name: 'A',
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: [2, 4, 6, 1, 3, 2, 1],
                coordinateSystem: 'polar',
                name: 'B',
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: [1, 2, 3, 4, 1, 2, 5],
                coordinateSystem: 'polar',
                name: 'C',
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: [2, 2, 2, 2, 4, 2, 1],
                coordinateSystem: 'polar',
                name: 'D',
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            }
        ],
        legend: {
            show: true,
            data: ['A', 'B', 'C', 'D']
        }
    };
    myChart.setOption(option);

    window.onresize = function() {
        myChart.resize();
    };
}