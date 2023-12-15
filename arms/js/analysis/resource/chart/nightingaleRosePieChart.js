function exampleNightingaleChart() {
    var chartDom = document.getElementById('main');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        legend: {
            top: 'bottom'
        },
        toolbox: {
            show: true,
            feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        series: [
            {
                name: 'Nightingale Chart',
                type: 'pie',
                radius: [50, 200],
                center: ['50%', '50%'],
                roseType: 'area',
                itemStyle: {
                    borderRadius: 8
                },
                data: [
                    { value: 0, name: 'rose 1' },
                    { value: 38, name: 'rose 2' },
                    { value: 32, name: 'rose 3' },
                    { value: 30, name: 'rose 4' },
                    { value: 28, name: 'rose 5' },
                    { value: 26, name: 'rose 6' },
                    { value: 22, name: 'rose 7' },
                    { value: 18, name: 'rose 8' }
                ]
            }
        ]
    };

    option && myChart.setOption(option);
}

//NightingaleRoseChart
function drawNightingalePieChart(target, dataArr, colorArr) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);
    var option;

    function calculateTotal(dataArr) {
        const total = dataArr.reduce((acc, curr) => acc + curr.value, 0);
        return total;
    }

    const totalValue = calculateTotal(dataArr);

    option = {

        legend: {
            top: 'top',
            textStyle: {
                color: 'white', // 이름의 텍스트 색상 설정
                fontStyle: 'normal', // 이름의 텍스트 스타일 설정 (예: italic, normal)
                fontSize: 15 // 이름의 텍스트 크기 설정
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b} - {c}개 ({d}%)'
        },
        graphic: [
            {
                type: 'text',
                left: 'center',
                top: 'middle',
                z: 100,
                style: {
                    text: [
                        '{a|Total}',
                        '{a|  ' + totalValue + '}' // 여기에 값들의 총 합을 계산하여 넣어주세요.
                    ].join('\n'),
                    rich: {
                        a: {
                            fontSize: 15,
                            fontWeight: 'bold',
                            lineHeight: 30,
                            fontFamily: 'Arial',
                            fill:"white"
                        }
                    }
                }
            }
        ],
        toolbox: {
            show: true,
            feature: {
                mark: { show: true },
                //dataView: { show: true, readOnly: false },
                //restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        backgroundColor: 'rgba(0,0,0,0)',
        series: [
            {
                name: 'Nightingale Chart',
                type: 'pie',
                radius: ["25%", "65%"],
                center: ['50%', '50%'],
                roseType: 'area',
                itemStyle: {
                    borderRadius: 1
                },
                label: {
                    show: true,
                    color:'white',
                    fontSize: 12,
                    formatter: function (params) {
                        return params.name + '\n' + '(' +params.value+')';
                    },
                    position: 'inner'
                },
                data: dataArr
            }
        ]
    };

    // colorArr 이 있으면 해당 색상으로 세팅, 없으면 기본색 옵션 사용
    if(colorArr && colorArr.length > 0) {
        option.series[0]["color"] = colorArr;
    }
    option && myChart.setOption(option, true);

    window.addEventListener('resize', function () {
        myChart.resize();
    });
}