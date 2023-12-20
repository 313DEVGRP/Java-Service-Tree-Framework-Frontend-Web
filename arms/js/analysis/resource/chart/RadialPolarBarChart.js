function exampleRadialPolarBarChart() {
    var chartDom = document.getElementById('main');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: [
            {
                text: 'Radial Polar Bar Label Position (middle)'
            }
        ],
        polar: {
            radius: [30, '80%']
        },
        radiusAxis: {
            max: 100
        },
        angleAxis: {
            type: 'category',
            data: ['1.0.1', 'BaseVersion', 'c', 'd'],
            startAngle: 90
        },
        graphic: [
            {
                type: 'text',
                left: 'center',
                top: 'middle',
                z: 100,
                style: {
                    text: [
                        'Total',
                        '100' // 여기에 값들의 총 합을 계산하여 넣어주세요.
                    ].join('\n'),
                    rich: {
                        a: {
                            fontSize: 15,
                            fontWeight: 'bold',
                            lineHeight: 30,
                            fontFamily: 'Arial',
                            fill: 'red'
                        }
                    }
                }
            }
        ],
        series: {
            type: 'bar',
            data: [
                { value: 100, itemStyle: { color: '#ff0000' } }, // 각 angle에 맞는 색상으로 수정
                { value: 33, itemStyle: { color: '#00ff00' } },
                { value: 5, itemStyle: { color: '#0000ff' } },
                { value: 0, itemStyle: { color: '#ffff00' } }
            ],
            coordinateSystem: 'polar',
            label: {
                show: true,
                position: 'middle',
                fontSize: 12,
                formatter: function (params) {
                    return params.name + '\n' + '(' + params.value + ')';
                }
            }
        },
        animation: false
    };

    option && myChart.setOption(option);
}

function drawRadialPolarBarChart(target, dataArr, colorArr) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: [
            {
                text: 'Radial Polar Bar Label Position (middle)'
            }
        ],
        polar: {
            radius: [30, '80%']
        },
        radiusAxis: {
            max: 4
        },
        angleAxis: {
            type: 'category',
            data: ['a', 'b', 'c', 'd'],
            startAngle: 90
        },
        graphic: [
            {
                type: 'text',
                left: 'center',
                top: 'middle',
                z: 100,
                style: {
                    text: [
                        'Total',
                        '100' // 여기에 값들의 총 합을 계산하여 넣어주세요.
                    ].join('\n'),
                    rich: {
                        a: {
                            fontSize: 15,
                            fontWeight: 'bold',
                            lineHeight: 30,
                            fontFamily: 'Arial',
                            fill: 'red'
                        }
                    }
                }
            }
        ],
        series: {
            type: 'bar',
            data: [
                { value: 2, itemStyle: { color: '#ff0000' } }, // 각 angle에 맞는 색상으로 수정
                { value: 1.2, itemStyle: { color: '#00ff00' } },
                { value: 2.4, itemStyle: { color: '#0000ff' } },
                { value: 3.6, itemStyle: { color: '#ffff00' } }
            ],
            coordinateSystem: 'polar',
            label: {
                show: true,
                position: 'middle',
                formatter: '{b}: {c}'
            }
        },
        animation: false
    };

    option && myChart.setOption(option);
    // 리사이즈 기능
    window.addEventListener('resize', function () {
        myChart.resize();
    });
}