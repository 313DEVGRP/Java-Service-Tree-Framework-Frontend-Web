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

    var defaultColorSet = [
        "rgba(227,26,27,0.66)",
        "rgba(55,125,184,0.62)",
        "rgba(77,175,74,0.65)",
        "rgba(255,127,0,0.7)",
        "rgba(255,255,51,0.71)",
        "rgba(151,78,163,0.73)",
        "rgba(166,86,40,0.7)"
    ];

    function calculateTotal(dataArr) {
        const total = dataArr.reduce((acc, curr) => acc + curr.value, 0);
        return total;
    }
    const totalValue = calculateTotal(dataArr);
    console.log ("totalValue => " + totalValue);
    var angleAxisArr = [], seriesDataArr=[];
    if(dataArr.length > 0) {
        dataArr.forEach((element, idx) => {
           angleAxisArr.push(element["name"]);
           seriesDataArr.push({value: element["value"], itemStyle: { color: colorArr ? colorArr[idx] : defaultColorSet[idx] }});
        });
    }

    option = {
        polar: {
            radius: ["25%", '55%'],
            center: ['50%', '50%']
        },
        radiusAxis: {
            max: (totalValue === 0 ? 5 : totalValue),
            splitNumber: 5,
            splitLine: {
                show: true,
                lineStyle: {
                    color: "gray" ,
                    width: 0.5,
                    type: "dashed"
                }
            },
            axisLabel: {
                textStyle: {
                    color: 'white', // 원하는 색상으로 변경
                    fontSize: 10, // 폰트 크기 조정
                }
            }
        },
        angleAxis: {
            type: 'category',
            data: angleAxisArr,//['BaseVersion', '1.0.1', '1.0.0'],
            startAngle: 90,
            axisLabel: {
                textStyle: {
                    color: 'white', // 원하는 색상으로 변경
                    fontSize: 12, // 폰트 크기 조정
                    fontWeight: "bold"
                }
            }
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
                        '{a|  ' + totalValue + '}'
                    ].join('\n'),
                    rich: {
                        a: {
                            fontSize: 14,
                            fontWeight: 'bold',
                            lineHeight: 20,
                            fontFamily: 'Arial',
                            fill: 'white'
                        }
                    }
                }
            }
        ],
        series: {
            type: 'bar',
            data: seriesDataArr,
            coordinateSystem: 'polar',
            // label: {
            //     show: true,
            //     position: 'inside',
            //     formatter: function (params) {
            //         if(params.value <= 10) {
            //             return params.name + '\n' + '(' +params.value+')11';
            //         } else {
            //             return params.name + '\n' + '(' +params.value+')';
            //         }
            //     }
            // },
            barWidth: "100%",
            itemStyle: {
                borderColor: "white",
                borderWidth: 1,
                barBorderRadius: 3
            }
        },
        animation: false
    }

    function replaceNaN(value) {
        if (isNaN(value)) {
            return " - ";
        } else {
            return value;
        }
    }

    function drawChartWithFooter(dataArr,total) {
        const existingChartFooter = document.querySelector('#'+target+' .chart-footer');
        if (existingChartFooter) {
            existingChartFooter.remove();
        }

        const chartFooter = document.createElement("div");
        chartFooter.classList.add("chart-footer");

        dataArr.forEach((data,index) => {
            const item = document.createElement("div");
            const portion =replaceNaN(+(data.value*100/ +total).toFixed(0));
            item.classList.add("footer-item");
            item.style.borderColor = colorArr[index];
            item.innerHTML = `<div class="item-name">${data.name}</div> <div class="item-value">${data.value} (${portion}%)</div>`;
            chartFooter.appendChild(item);
        });

        chartDom.appendChild(chartFooter);

        const footerItems = document.querySelectorAll('#'+target+' .chart-footer .footer-item');
        const itemCount = footerItems.length;

        const remainder = itemCount % 3;
        const quotient = Math.floor(itemCount / 3);

        footerItems.forEach((item, index) => {
            if (remainder === 1 && Math.floor(index / 3) === quotient) {
                item.style.width = '100%';
            } else if (remainder === 2 && Math.floor(index / 3) >= quotient) {
                item.style.width = '50%';
            } else {
                item.style.width = '33.33%';
            }
        });
    }

    drawChartWithFooter(dataArr,totalValue);

    option && myChart.setOption(option, true);

    window.addEventListener('resize', function () {
        myChart.resize();
    });
}