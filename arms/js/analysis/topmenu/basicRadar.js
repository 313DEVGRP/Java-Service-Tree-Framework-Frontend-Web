function exBasicChart() {
    var chartDom = document.getElementById('main');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: 'Basic Radar Chart'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['Target Business', 'Actual Progress']
        },
        radar: {
            // shape: 'circle',
            indicator: [
                { text: 'Resource', max: 5 },
                { text: 'Requirement/Subtask', max: 116 },
                { text: 'schedule', max: 120 }
            ],
            axisLine: {
                lineStyle: {
                    color: 'rgba(3, 3, 3, 0.5)'
                }
            }
        },
        series: [
            {
                name: 'Budget vs spending',
                type: 'radar',
                tooltip: {
                    trigger: 'item'
                },
                areaStyle: {},
                data: [
                    {
                        value: [5, 116, 120],
                        name: 'Target Business',
                        areaStyle: {
                            opacity: 0.1
                        }
                    },
                    {
                        value: [5, 11, 100],
                        name: 'Actual Progress',
                        areaStyle: {
                            opacity: 0.5
                        }
                    }
                ]
            }
        ]
    };

    option && myChart.setOption(option);
}

function drawBasicRadar(target,objectiveArr,currentProgressArr) {
    let chartDom = document.getElementById(target);
    let myChart = echarts.init(chartDom);
    let option;
    let scheduleMax ="-";
    let titleText = "";
    let titleColor = "white";
    let progress = "";

    if(objectiveArr.length !== 0) {
        if (objectiveArr[1] !== "" && objectiveArr[1] !== 0) {
            progress = (currentProgressArr[1]*100/objectiveArr[1]).toFixed(1);
            titleText+= "진행률: " + progress + "%, ";
        }
        let dateDiff = Math.abs(objectiveArr[2] - currentProgressArr[2]).toFixed(0);

        if (currentProgressArr[2] < 0) {
            scheduleMax = objectiveArr[2];
            titleText += "일정 시작: " + Math.abs(currentProgressArr[2]) +"일 남음";
            currentProgressArr[2]=0;
            titleColor = 'rgb(164,198,255)';
        } else if (objectiveArr[2] >= currentProgressArr[2]) {
            scheduleMax = objectiveArr[2];
            titleText += "일정: " + dateDiff +"일 남음";
            titleColor = 'rgb(164,198,255)';
        } else {
            scheduleMax = currentProgressArr[2];
            titleText += "일정: " + dateDiff +"일 초과";
            titleColor = 'rgb(219,42,52)';
        }
    }

    let titleOption = {
        text: titleText,
        top: 0,
        textStyle: {
            color: titleColor,
            fontSize: 13
        }
    };

    option = {
        title: titleOption,
        /*tooltip: {
            trigger: 'axis'
        },*/
        grid: {
            top: '15%',
            containLabel: false
        },
        legend: {
            data: ['제품(서비스) 설정기준','현재 진행상황'], //
            left: "left",
            top: "10%",
            textStyle: {
                color: 'white', // 이름의 텍스트 색상 설정
                fontStyle: 'normal', // 이름의 텍스트 스타일 설정 (예: italic, normal)
                fontSize: 11 // 이름의 텍스트 크기 설정
            }
        },
        radar: {
            // shape: 'circle',
            indicator: [
                { name: '작업자수: ' + objectiveArr[0]+'명', max: objectiveArr[0] },
                { name: '요구사항: ' + objectiveArr[1]+'개', max: objectiveArr[1] },
                { name: '일정: ' + objectiveArr[2]+'일',    max: scheduleMax }
            ],
            name: {
                textStyle: {
                    color: 'white', // 데이터 전체의 이름 폰트 색상 설정
                    fontSize: 12 // 데이터 전체의 이름 폰트 크기 설정
                }
            },
            nameGap: 30,
            center: ["52%","68%"],
            radius: "55%",
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 244, 244, 0.5)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'gray'
                }
            }
        },
        series: [
            {
                name: 'Budget vs spending',
                type: 'radar',
                tooltip: {
                    trigger: 'item'
                },
                areaStyle: {},
                data: [
                    {
                        value: objectiveArr,
                        name: '제품(서비스) 설정기준',
                        symbol:'triangle',
                        symbolSize: 10,
                        areaStyle: {
                            opacity: 0.3
                        }
                    },
                    {
                        value: currentProgressArr,
                        name: '현재 진행상황',
                        symbol:'roundRect', // circle, rect, roundRect, triangle, diamond, pin, arrow
                        symbolSize: 10,
                        label: {
                            show: true,
                            textStyle: {
                                color: 'rgb(162,198,255)',
                                fontsize: 12,
                                backgroundColor: 'rgba(51,51,51,0.8)',
                                padding: [3, 5],
                                borderRadius: 3,
                            },
                            formatter: function (params) {
                                if (params.value < 0) {
                                    return "("+Math.abs(params.value)+")";
                                } else {
                                    return params.value;
                                }
                            }
                        },
                        areaStyle: {
                            opacity: 0.6
                        }
                    }
                ]
            }
        ]
    };

    option && myChart.setOption(option,true);

    window.addEventListener('resize', function () {
        myChart.resize();
    });
}

function drawBasicRadarForDashBoard(target,objectiveArr,currentProgressArr) {
    let chartDom = document.getElementById(target);
    let myChart = echarts.init(chartDom);
    let option;
    let scheduleMax ="-";
    let titleText = "";
    let titleColor = "white";
    let progress = "";
    if(objectiveArr.length !== 0) {
        if (objectiveArr[1] !== "" || objectiveArr[1] !== 0) {
            progress = (currentProgressArr[1]*100/objectiveArr[1]).toFixed(1);
            titleText+= "진행률: " + progress + "%, ";
        }
        let dateDiff = Math.abs(objectiveArr[2] - currentProgressArr[2]).toFixed(0);

        if (objectiveArr[2] >= currentProgressArr[2]) {
            scheduleMax = objectiveArr[2];
            titleText += "일정: " + dateDiff +"일 남음";
            titleColor = 'rgb(164,198,255)';
        } else {
            scheduleMax = currentProgressArr[2];
            titleText += "일정: " + dateDiff +"일 초과";
            titleColor = 'rgb(219,42,52)';
        }
    }

    let titleOption = {text: titleText, top: 25,
        textStyle: {
            color: titleColor,
            fontSize: 13
        }
    };

    option = {
        title: titleOption,
        /*tooltip: {
            trigger: 'axis'
        },*/
        /*legend: {
            data: ['제품(서비스) 설정기준','현재 진행상황'], //
            left: "left",
            textStyle: {
                color: 'white', // 이름의 텍스트 색상 설정
                fontStyle: 'normal', // 이름의 텍스트 스타일 설정 (예: italic, normal)
                fontSize: 11 // 이름의 텍스트 크기 설정
            }
        },*/
        radar: {
            // shape: 'circle',
            indicator: [
                { name: '작업자수: ' + objectiveArr[0]+'명', max: objectiveArr[0] },
                { name: '요구사항: ' + objectiveArr[1]+'개', max: objectiveArr[1] },
                { name: '일정: ' + objectiveArr[2]+'일',    max: scheduleMax }
            ],
            name: {
                textStyle: {
                    color: 'white', // 데이터 전체의 이름 폰트 색상 설정
                    fontSize: 12 // 데이터 전체의 이름 폰트 크기 설정
                }
            },
            nameGap: 25,
            center: ["50%","50%"],
            radius: "50%",
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 244, 244, 0.5)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'gray'
                }
            }
        },
        series: [
            {
                name: 'Budget vs spending',
                type: 'radar',
                tooltip: {
                    trigger: 'item'
                },
                areaStyle: {},
                data: [
                    {
                        value: objectiveArr,
                        name: '제품(서비스) 설정기준',
                        symbol:'triangle',
                        symbolSize: 10,
                        areaStyle: {
                            opacity: 0.3
                        }
                    },
                    {
                        value: currentProgressArr,
                        name: '현재 진행상황',
                        symbol:'roundRect', // circle, rect, roundRect, triangle, diamond, pin, arrow
                        symbolSize: 10,
                        label: {
                            show: true,
                            textStyle: {
                                color: 'rgb(162,198,255)',
                                fontsize: 12,
                                backgroundColor: 'rgba(51,51,51,0.8)',
                                padding: [3, 5],
                                borderRadius: 3,
                            },
                            formatter: function (params) {
                                return params.value;
                            }
                        },
                        areaStyle: {
                            opacity: 0.6
                        }
                    }
                ]
            }
        ]
    };

    option && myChart.setOption(option,true);
}

