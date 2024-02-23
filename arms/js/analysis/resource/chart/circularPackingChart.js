function drawCircularPacking(target, psServiceName,rawData, issueStatusList, colorArr) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);
    var option;

    // ChartWithFooter 관련
    let reqCount = 0; // total
    let statusCounts = {};
    let statusDataArr = [];

    var defaultColorSet = [
        "rgba(255,255,51,0.71)",
        "rgba(151,78,163,0.73)",
        "rgba(77,175,74,0.65)",
        "rgba(255,127,0,0.7)",
        "rgba(55,125,184,0.62)",
        "rgba(166,86,40,0.7)",
        "rgba(227,26,27,0.66)"
    ];

    if(rawData) {
        run(rawData);
    }

    function run(rawData) {
        const dataWrap = prepareData(rawData);
        console.log(dataWrap);
        dataWrap.seriesData.forEach(element => {
            if (element["depth"] === 2) {
                reqCount++; // 총 진행중인 요구사항 수
                const status = element["status"];
                if (!statusCounts[status]) {
                    statusCounts[status] = 1;
                } else {
                    statusCounts[status]++;
                }
            }
        });
        //자료 구조 변경
        statusDataArr = Object.entries(statusCounts).map(([key, value]) => ({ name: key, value }));

        initChart(dataWrap.seriesData, dataWrap.maxDepth);
    }
    function prepareData(rawData) {
        const seriesData = [];
        let maxDepth = 0;
        function convert(source, basePath, depth) {
            if (source == null) {
                return;
            }
            if (maxDepth > 5) {
                return;
            }
            maxDepth = Math.max(depth, maxDepth);
            seriesData.push({
                id: basePath,
                value: source.$count,
                status: source.$status,
                depth: depth,
                index: seriesData.length
            });
            for (var key in source) {
                if (source.hasOwnProperty(key) && !key.match(/^\$/)) {
                    var path = basePath + '.' + key;
                    convert(source[key], path, depth + 1);
                }
            }
        }
        convert(rawData, psServiceName, 0); // raw데이터 삽입,첫번째 Node 이름 설정.
        return {
            seriesData: seriesData,
            maxDepth: maxDepth
        };
    }
    function initChart(seriesData, maxDepth) {
        console.log("[circularPackingChart :: initChart] :: seriesData ===> ");
        console.log(seriesData);
        var displayRoot = stratify();
        function stratify() {
            return d3
                .stratify()
                .parentId(function (d) {
                    return d.id.substring(0, d.id.lastIndexOf('.'));
                })(seriesData)
                .sum(function (d) {
                    return d.value || 0;
                })
                .sort(function (a, b) {
                    return b.value - a.value;
                });
        }
        function overallLayout(params, api) {
            var context = params.context;
            d3
                .pack()
                .size([api.getWidth() - 2, api.getHeight() - 2])
                .padding(3)(displayRoot);
            context.nodes = {};
            displayRoot.descendants().forEach(function (node, index) {
                context.nodes[node.id] = node;
            });
        }
        function renderItem(params, api) {
            var context = params.context;
            // Only do that layout once in each time `setOption` called.
            if (!context.layout) {
                context.layout = true;
                overallLayout(params, api);
            }
            var nodePath = api.value('id');
            var node = context.nodes[nodePath];
            if (!node) {
                // Reder nothing.
                return;
            }
            var isLeaf = !node.children || !node.children.length;
            var focus = new Uint32Array(
                node.descendants().map(function (node) {
                    return node.data.index;
                })
            );
            var nodeName = isLeaf
                ? nodePath
                    .slice(nodePath.lastIndexOf('.') + 1)
                    .split(/(?=[A-Z][^A-Z])/g)
                    .join('\n')
                : '';
            var z2 = api.value('depth') * 2;
            return {
                type: 'circle',
                focus: focus,
                shape: {
                    cx: node.x,
                    cy: node.y,
                    r: node.r
                },
                transition: ['shape'],
                z2: z2,
                textContent: {
                    type: 'text',
                    style: {
                        // transition: isLeaf ? 'fontSize' : null,
                        text: nodeName,
                        fontFamily: 'Arial',
                        width: node.r * 1.3,
                        overflow: 'truncate',
                        fontSize: node.r / 3
                    },
                    emphasis: {
                        style: {
                            overflow: null,
                            fontSize: Math.max(node.r / 3, 12)
                        }
                    }
                },
                textConfig: {
                    position: 'inside'
                },
                style: {
                    fill: api.visual('color')
                },
                emphasis: {
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 12,
                        shadowBlur: 20,
                        shadowOffsetX: 3,
                        shadowOffsetY: 5,
                        shadowColor: 'rgba(0,0,0,0.3)'
                    }
                }
            };
        }

        option = {
            dataset: {
                source: seriesData
            },
            tooltip: {
                confine: true
            },
            visualMap: [
                {
                    show: false,
                    min: 0,
                    max: maxDepth,
                    dimension: 'depth',
                    inRange: {} // 색 일괄 지정을 하지 않아도. 빈값으로 두어야 합니다.
                }
            ],
            hoverLayerThreshold: Infinity,
            series: {
                type: 'custom',
                renderItem: renderItem,
                progressive: 0,
                coordinateSystem: 'none',
                itemStyle: {
                    color: function(params) {
                        if (params.data.value) {

                            return defaultColorSet[issueStatusList.indexOf(params.data.status)];
                        } else {
                            return "rgba(55,125,184,0.62)";
                        }
                    }
                },
                tooltip: {
                    formatter: function(params) {
                        // params.value에는 원본 값이 들어있을 것입니다. 여기에 단위를 붙여 반환하면 됩니다.
                        if(params.data.value) {
                            return `${params.data.id} </br>
                            - 상태 : ${params.data.status} </br>
                            - 작업자 : ${params.data.value} 명`;
                        } else {
                            return `${params.data.id}`;
                        }
                    }
                }
            },
            graphic: [
                {
                    type: 'group',
                    left: 20,
                    top: 20,
                    children: [
                        {
                            type: 'text',
                            z: 100,
                            left: 0,
                            top: 0,
                            style: {
                                text: [
                                    '{a| Total }',
                                    '{a| ' + reqCount + '}'
                                ].join('\n'),
                                rich: {
                                    a: {
                                        fontSize: 13,
                                        fontWeight: 'bold',
                                        lineHeight: 20,
                                        fontFamily: 'Arial',
                                        fill: 'white'
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        };

        option && myChart.setOption(option, true);
        drawChartWithFooter(statusDataArr,reqCount);

        myChart.on('click', { seriesIndex: 0 }, function (params) {
            drillDown(params.data.id);
        });

        function drillDown(targetNodeId) {
            displayRoot = stratify();
            if (targetNodeId != null) {
                displayRoot = displayRoot.descendants().find(function (node) {
                    return node.data.id === targetNodeId;
                });
            }
            // A trick to prevent d3-hierarchy from visiting parents in this algorithm.
            displayRoot.parent = null;
            myChart.setOption({
                dataset: {
                    source: seriesData
                }
            });
        }
        // Reset: click on the blank area.
        myChart.getZr().on('click', function (event) {
            if (!event.target) {
                drillDown();
            }
        });
    }

    function replaceNaN(value) {
        if (isNaN(value)) {
            return " - ";
        } else {
            return value;
        }
    }

    function drawChartWithFooter(dataArr,total) {
        console.log("drawChartWithFooter 호출");
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
            item.style.borderColor = defaultColorSet[index];
            item.innerHTML = `<div class="item-name">${data.name}</div> <div class="item-value">${data.value} (${portion}%)</div>`;
            chartFooter.appendChild(item);
        });

        chartDom.appendChild(chartFooter);

        const footerItems = document.querySelectorAll('#'+target+' .chart-footer .footer-item');
        const itemCount = footerItems.length;
        const remainder = itemCount % 4; //나머지
        const quotient = Math.floor(itemCount / 4); // 몫

        footerItems.forEach((item, index) => {
            if (remainder === 1 && Math.floor(index / 4) === quotient) {
                item.style.width = '100%';
            } else if (remainder === 2 && Math.floor(index / 4) >= quotient) {
                item.style.width = '50%';
            } else if (remainder === 3 && Math.floor(index / 4) >= quotient) {
                item.style.width = '33.33%';
            } else { // 나머지 0
                item.style.width = '25%';
            }
        });
    }

    window.addEventListener('resize', function () {
        myChart.resize();
    });
}

