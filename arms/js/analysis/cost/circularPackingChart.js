function drawCircularPacking(target, psServiceName,rawData, colorArr) {
    var chartDom = document.getElementById(target);
    var myChart = echarts.init(chartDom);
    var option;
    // ChartWithFooter 관련
    let reqCount = 0; // total
    let statusCounts = {};
    let statusDataArr = [];

    var colorPalette = [ //e chart 컬러 팔레트
            '#546570', '#c4ccd3' , '#749f83','#91c7ae'
        ];

    if(rawData) {
        run(rawData);
    }

    function run(rawData) {
        const dataWrap = prepareData(rawData);

        console.log(dataWrap);

        initChart(dataWrap.seriesData, dataWrap.maxDepth);
    }

    function prepareData(rawData) {
        const seriesData = [];
        let maxDepth = 0;
        let index = 0;

        function convert(source, basePath, depth) {
            maxDepth = Math.max(maxDepth, depth);
            let value = 0;
            let version, req_name; // version과 req_name을 선언

            for (let key in source) {
                let path = `${basePath}.${key}`;
                if (Array.isArray(source[key])) {
                    let subValue = 0;
                    source[key].forEach(item => {
                        for(let subkey in item) {
                            let subPath = `${path}.${subkey}`;
                            let subsubValue = 0;
                            item[subkey].forEach(subItem => {
                                version = subItem.version; // version 업데이트
                                req_name = subItem.req_name; // req_name 업데이트
                                let itemPath = `${subPath}.${subItem.project}`;
                                subsubValue += subItem.cost;
                                seriesData.push({
                                    id: itemPath,
                                    value: subItem.cost,
                                    depth: depth + 3,
                                    index: index++,
                                    version: version,
                                    req_name: req_name
                                }); // 3 depth
                            });
                            if (subsubValue !== 0) {
                                subValue += subsubValue;
                                seriesData.push({
                                    id: subPath,
                                    value: subsubValue,
                                    depth: depth + 2,
                                    index: index++,
                                    version: version,
                                    req_name: req_name
                                });  // 2 depth
                            }
                        }
                    });
                    if (subValue !== 0) {
                        value += subValue;
                        seriesData.push({
                            id: path,
                            value: subValue,
                            depth: depth + 1,
                            index: index++,
                            version: version,
                            req_name: req_name
                        });
                    }
                } else if (typeof source[key] === 'object' && source[key] !== null) {
                    value += convert(source[key], path, depth + 1);
                }
            }

            if (depth > 0) {
                seriesData.push({
                    id: basePath,
                    value: value,
                    depth: depth,
                    index: index++,
                    version: version,
                    req_name: req_name
                });
            }

            return value;
        }

        let totalValue = convert(rawData, psServiceName, 0);

        // 최상단 노드의 value를 업데이트
        seriesData.push({
            id: psServiceName,
            value: totalValue,
            depth: 0,
            index: index
        });

        return {
            seriesData: seriesData,
            maxDepth: maxDepth
        };
    }


    function initChart(seriesData, maxDepth) {
        console.log("seriesData ===> ")
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

       let productCost = seriesData.find(function(data) {
           return data.depth === 0;
       }).value;
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
                            return colorPalette[params.value.depth];
                        } else {
                            return "rgba(55,125,184,0.62)";
                        }
                    }
                },
                tooltip: {
                    formatter: function(params) {
                        // params.value에는 원본 값이 들어있을 것입니다. 여기에 단위를 붙여 반환하면 됩니다.
                        let id = params.data.id;
                        let parts = id.split('.');

                        if(params.data.value) {
                            if(params.data.depth === 0){
                                return "제품(서비스) 정보 </br>● 제품(서비스) :"+ parts[0] +" </br>● 비용 :"+params.data.value ;
                            }else if(params.data.depth === 1){
                                return "버전 정보 </br>● 버전 :"+ params.data.version +" </br>● 비용 :"+params.data.value ;
                            }else if(params.data.depth === 2){
                                return "요구사항 정보 </br>● 버전 :"+ params.data.version +" </br>● 요구사항 :"+ params.data.req_name +" </br>● 비용 :"+params.data.value ;
                            }else if(params.data.depth === 3){
                                return "요구사항 키 정보 </br>● 버전 :"+ params.data.version +" </br>● 요구사항 :"+ params.data.req_name +" </br>● 요구사항 키 :"+ parts[3] +" </br>● 비용 :"+params.data.value ;
                            }
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
                                    '{a| 제품 비용 }',
                                    '{a| ' + productCost + '}'
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

    window.addEventListener('resize', function () {
        myChart.resize();
    });
}
