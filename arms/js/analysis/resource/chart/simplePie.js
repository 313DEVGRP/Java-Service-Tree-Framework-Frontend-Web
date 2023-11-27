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
        legend: {
            orient: 'horizontal',
            left: 'left',
            textStyle: {
                color: 'white', // 이름의 텍스트 색상 설정
                fontStyle: 'normal', // 이름의 텍스트 스타일 설정 (예: italic, normal)
                fontWeight: '', // 이름의 텍스트 굵기 설정 (예: bold, normal)
                fontSize: 13 // 이름의 텍스트 크기 설정
                // 그 외 다른 텍스트 관련 속성들도 설정 가능합니다.
            }
        },
        series: [
            {
                name: seriesName,
                type: 'pie',
                radius: '50%',
                label: {
                    textStyle: {
                        color: 'white', // 데이터 전체의 이름 폰트 색상 설정
                        fontSize: 12 // 데이터 전체의 이름 폰트 크기 설정
                        // 다른 텍스트 관련 속성들도 설정 가능합니다.
                    }
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
    return myChart;
}