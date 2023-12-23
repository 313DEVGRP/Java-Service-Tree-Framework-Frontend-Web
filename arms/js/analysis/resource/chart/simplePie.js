function exampleSimplePieChart() {
    var chartDom = document.getElementById('main');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: 'Referer of a Website',
            subtext: 'Fake Data',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 1048, name: 'Search Engine' },
                    { value: 735, name: 'Direct' },
                    { value: 580, name: 'Email' },
                    { value: 484, name: 'Union Ads' },
                    { value: 300, name: 'Video Ads' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    option && myChart.setOption(option);

}

function drawSimplePieChart(target,seriesName,dataArr) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: '',
            subtext: '',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        toolbox:{
            show: "false",
            feature: {
                //mark: { show: true },
                saveAsImage: { show: true }
            }
        },
        backgroundColor: 'rgba(0,0,0,0)',
        legend: {
            orient: 'horizontal',
            left: 'left',
            textStyle: {
                color: 'white',
                fontStyle: 'normal',
                fontWeight: '',
                fontSize: 11
            }
        },
        series: [
            {
                name: seriesName,
                type: 'pie',
                radius: '65%',
                label: {
                    show: true, // 라벨을 표시합니다.
                    textStyle: {
                        color: 'white',
                        fontSize: 12
                    },
                    position: "inner",
                    formatter: '{c} ({d}%)' // 표시할 포맷을 지정합니다. {b}는 name, {c}는 value를 나타냅니다.
                },
                data: dataArr,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    option && myChart.setOption(option);

    window.addEventListener('resize', function () {
        myChart.resize();
    });

    return myChart;
}