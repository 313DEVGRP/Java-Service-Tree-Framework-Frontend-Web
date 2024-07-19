var gojs = (function () {
    "use strict";

    var myDiagram;
    let isLinkDeletion = false;
    let isContextMenuOpen = false;

    function init() {
        // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
        // For details, see https://gojs.net/latest/intro/buildingObjects.html
        const $ = go.GraphObject.make; // for conciseness in defining templates
        myDiagram = new go.Diagram('myDiagramDiv', {
            allowCopy: false,
            layout: $(go.LayeredDigraphLayout, {
                setsPortSpots: false, // Links already know their fromSpot and toSpot
                columnSpacing: 5,
                isInitial: false,
                isOngoing: false,
            }),
            validCycle: go.CycleMode.NotDirected,
            'undoManager.isEnabled': true,
            "maxSelectionCount": 1,  // 다중 선택 비활성
        });

        // when the document is modified, add a "*" to the title and enable the "Save" button
        myDiagram.addDiagramListener('Modified', (e) => {
            const button = document.getElementById('mapping_save_button');
            if (button) button.disabled = !myDiagram.isModified;
            const idx = document.title.indexOf('*');
            if (myDiagram.isModified) {
                if (idx < 0) document.title += '*';
            } else {
                if (idx >= 0) document.title = document.title.slice(0, idx);
            }
        });

        // const graygrad = $(go.Brush, 'Linear', { 0: 'white', 0.1: 'whitesmoke', 0.9: 'whitesmoke', 1: 'lightgray' });

        // 노드 박스 배경색
        const graygrad = $(go.Brush, 'Linear', {
            0: 'rgba(51, 51, 51, 0)',
            0.1: 'rgba(51, 51, 51, 0.1)',
            0.9: 'rgba(51, 51, 51, 0.9)',
            1: 'rgba(51, 51, 51, 1)'
        });
        // 노드 박스 테두리
        const lightGray = 'rgba(128, 128, 128, 0.5)'; // 흐린 회색 (투명도 50%)

        myDiagram.nodeTemplate = // the default node template
            $(go.Node,
                'Spot',
                { selectionAdorned: false, textEditable: true, locationObjectName: 'BODY' },
                new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
                // the main body consists of a Rectangle surrounding the text
                $(go.Panel,
                    'Auto',
                    { name: 'BODY' },
                    $(go.Shape,
                        'RoundedRectangle',
                        { fill: graygrad, stroke: lightGray, minSize: new go.Size(100, 30) },
                        new go.Binding('fill', 'isSelected', (s) => (s ? 'dodgerblue' : graygrad)).ofObject()
                    ),
                    $(go.Panel,
                        'Horizontal',
                        { alignment: go.Spot.Left, margin: 3 },
                        $(go.Picture, {
                            source: "/arms/img/arms.png",  // 아이콘 이미지 경로
                            width: 20,
                            height: 20,
                            margin: new go.Margin(0, 0, 0, 0)
                        }),
                        $(go.TextBlock,
                            {
                                stroke: 'white',
                                font: '12px sans-serif',
                                editable: true,
                                margin: new go.Margin(3, 4, 3, 4), // 적절한 마진 설정
                                alignment: go.Spot.Left,
                            },
                            new go.Binding('text').makeTwoWay()
                        )
                    )
                ),
                // output port
                $(go.Panel,
                    'Auto',
                    { alignment: go.Spot.Right, portId: 'from', fromLinkable: true, cursor: 'pointer', click: (e, obj) => {
                            if (obj.part.data.category !== 'NoAdd') {
                                addNodeAndLink(e, obj);
                            }
                        }},
                    $(go.Shape, 'Diamond', { width: 11, height: 11, fill: 'white', stroke: graygrad, strokeWidth: 3 }),
                    $(go.Shape, 'PlusLine', new go.Binding('visible', '', (data) => data.category !== 'NoAdd').ofObject(), { width: 11, height: 11, fill: null, stroke: 'dodgerblue', strokeWidth: 3 })
                ),
                // input port
                $(go.Panel,
                    'Auto',
                    { alignment: go.Spot.Left, portId: 'to', toLinkable: true },
                    $(go.Shape, 'Ellipse', { width: 9, height: 9, fill: 'white', stroke: graygrad, strokeWidth: 3 }),
                    $(go.Shape, 'Ellipse', { width: 6, height: 6, fill: 'white', stroke: null })
                )
            );

        // 우측 마우스 버튼 제거
        /*myDiagram.nodeTemplate.contextMenu = $('ContextMenu',
            $('ContextMenuButton',
                $(go.TextBlock, 'Rename'),
                { click: (e, obj) => e.diagram.commandHandler.editTextBlock() },
                new go.Binding('visible', '', (o) => o.diagram && o.diagram.commandHandler.canEditTextBlock()).ofObject()
            ),
            // add one for Editing...
            $('ContextMenuButton',
                $(go.TextBlock, 'Delete'),
                { click: (e, obj) => e.diagram.commandHandler.deleteSelection() },
                new go.Binding('visible', '', (o) => o.diagram && o.diagram.commandHandler.canDeleteSelection()).ofObject()
            )
        );*/

        myDiagram.nodeTemplateMap.add(
            'Loading',
            $(go.Node,
                'Spot',
                { selectionAdorned: false, textEditable: true, locationObjectName: 'BODY' },
                new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
                // the main body consists of a Rectangle surrounding the text
                $(go.Panel,
                    'Auto',
                    { name: 'BODY' },
                    $(go.Shape,
                        'RoundedRectangle',
                        { fill: graygrad, stroke: lightGray, minSize: new go.Size(100, 30) },
                        new go.Binding('fill', 'isSelected', (s) => (s ? 'dodgerblue' : graygrad)).ofObject()
                    ),
                    $(go.Panel,
                        'Horizontal',
                        { alignment: go.Spot.Left, margin: 3 },
                        $(go.TextBlock,
                            {
                                stroke: 'white',
                                font: '12px FontAwesome, sans-serif',
                                editable: false,
                                margin: new go.Margin(3, 3 + 11, 3, 3 + 4),
                                alignment: go.Spot.Left,
                            },
                            new go.Binding("text", "", function(data) {
                                // 아이콘과 텍스트를 함께 표시
                                return "\uf009 " + data.text; // "\uf007"는 Font Awesome의 유니코드 문자입니다 (예: 사용자 아이콘)
                            })
                        )
                    )

                ),
                // output port
                $(go.Panel,
                    'Auto',
                    { alignment: go.Spot.Right, portId: 'from', fromLinkable: true, click: addNodeAndLink },
                    $(go.Shape, 'Circle', { width: 22, height: 22, fill: 'white', stroke: graygrad, strokeWidth: 3 }),
                    $(go.Shape, 'PlusLine', { width: 11, height: 11, fill: null, stroke: graygrad, strokeWidth: 3 })
                )
            )
        );

        myDiagram.nodeTemplateMap.add(
            'End',
            $(go.Node,
                'Spot',
                { selectionAdorned: false, textEditable: true, locationObjectName: 'BODY' },
                new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
                // the main body consists of a Rectangle surrounding the text
                $(go.Panel,
                    'Auto',
                    { name: 'BODY' },
                    $(go.Shape,
                        'RoundedRectangle',
                        { fill: graygrad, stroke: lightGray, minSize: new go.Size(100, 30) },
                        new go.Binding('fill', 'isSelected', (s) => (s ? 'dodgerblue' : graygrad)).ofObject()
                    ),
                    $(go.Panel,
                        'Horizontal',
                        { alignment: go.Spot.Left, margin: 3 },
                        $(go.Picture,
                            {
                                width: 20,
                                height: 20,
                                margin: new go.Margin(0, 0, 0, 2)
                            },
                            new go.Binding('source', 'server_type', function(type) {
                                console.log(type);
                                switch(type) {
                                    case '클라우드': return '/arms/img/jira/mark-gradient-white-jira.svg';
                                    case '온프레미스': return '/arms/img/jira/mark-gradient-blue-jira.svg';
                                    case '레드마인_온프레미스': return '/arms/img/redmine/logo.png';
                                    default: return '';
                                }
                            })
                        ),
                        $(go.TextBlock,
                            {
                                stroke: 'white',
                                font: '12px sans-serif',
                                editable: false,
                                margin: new go.Margin(3, 3 + 11, 3, 3 + 4),
                                alignment: go.Spot.Left,
                            },
                            new go.Binding('text', 'text')
                        )
                    )
                ),
                // input port
                $(go.Panel,
                    'Auto',
                    { alignment: go.Spot.Left, portId: 'to', toLinkable: true },
                    $(go.Shape, 'Ellipse', { width: 9, height: 9, fill: 'white', stroke: graygrad, strokeWidth: 3 }),
                    $(go.Shape, 'Ellipse', { width: 6, height: 6, fill: 'white', stroke: null })
                )
            )
        );

        // dropping a node on this special node will cause the selection to be deleted;
        // linking or relinking to this special node will cause the link to be deleted
        myDiagram.nodeTemplateMap.add(
            'Recycle',
            $(go.Node,
                'Auto',
                {
                    portId: 'to',
                    toLinkable: true,
                    deletable: false,
                    layerName: 'Background',
                    locationSpot: go.Spot.Center,
                },
                new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
                {
                    dragComputation: (node, pt, gridpt) => pt,
                    mouseDrop: (e, obj) => e.diagram.commandHandler.deleteSelection(),
                },
                $(go.Shape, { fill: 'lightgray', stroke: 'gray' }),
                $(go.TextBlock, 'Drop Here\nTo Delete', { margin: 5, textAlign: 'center' })
            )
        );

        // this is a click event handler that adds a node and a link to the diagram,
        // connecting with the node on which the click occurred
        function addNodeAndLink(e, obj) {
            const fromNode = obj.part;
            const diagram = fromNode.diagram;
            diagram.startTransaction('Add State');
            // get the node data for which the user clicked the button
            const fromData = fromNode.data;
            const category = fromData.category;
            const c_id = fromData.c_id;
            const type = fromData.type;

            if (category === 'NoAdd') {
                // 중간 노드의 경우 ALM 상태의 Node는 생성 못하도록 처리
                diagram.commitTransaction('Add Node');
                return;
            }
            else {
                if (!confirm(fromData.text + " 카테고리 상태를 추가하시겠습니까?")) {
                    return;
                }
            }

            // create a new "State" data object, positioned off to the right of the fromNode
            const p = fromNode.location.copy();
            p.x += diagram.toolManager.draggingTool.gridSnapCellSize.width;
/*            const toData = {
                text: 'new',
                loc: go.Point.stringify(p),
            };*/

            let toData;

            if (type === 'arms-category') {
                toData = {
                    key: 'arms-state-' + (diagram.model.nodeDataArray.length + 1),
                    text: '신규 상태',
                    isNew: true,
                    type: 'arms-state',
                    mapping_id: fromData.c_id,
                    category: 'NoAdd',
                    loc: go.Point.stringify(p),
                };
            }
            else {
                toData = {
                    text: '신규 상태',
                    isNew: true,
                    loc: go.Point.stringify(p),
                };
            }

            // add the new node data to the model
            const model = diagram.model;
            model.addNodeData(toData);
            // create a link data from the old node data to the new node data
            const linkdata = {
                from: model.getKeyForNodeData(fromData),
                to: model.getKeyForNodeData(toData),
                isNew: true,
            };

            // and add the link data to the model
            model.addLinkData(linkdata);
            // select the new Node
            const newnode = diagram.findNodeForData(toData);
            diagram.select(newnode);
            // snap the new node to a valid location
            newnode.location = diagram.toolManager.draggingTool.computeMove(newnode, p);
            // then account for any overlap
            shiftNodesToEmptySpaces();
            diagram.commitTransaction('Add State');
        }

        // Highlight ports when they are targets for linking or relinking.
        let OldTarget = null; // remember the last highlit port
        function highlight(port) {
            if (OldTarget !== port) {
                lowlight(); // remove highlight from any old port
                OldTarget = port;
                port.scale = 1.3; // highlight by enlarging
            }
        }
        function lowlight() {
            // remove any highlight
            if (OldTarget) {
                OldTarget.scale = 1.0;
                OldTarget = null;
            }
        }

        // Connecting a link with the Recycle node removes the link
        myDiagram.addDiagramListener('LinkDrawn', (e) => {
            const link = e.subject;
            const fromNode = link.fromNode;
            const toNode = link.toNode;

            link.data.fromNode = fromNode.Qt;
            link.data.toNode = toNode.Qt;

            if (fromNode.category === 'NoAdd' && fromNode.findLinksOutOf().count > 1) {
                isLinkDeletion = false;
                myDiagram.remove(link);
            }

            if (toNode.category === 'NoAdd' && toNode.findLinksInto().count > 1) {
                isLinkDeletion = false;
                myDiagram.remove(link);
            }

            if (toNode.category === 'End' && toNode.findLinksInto().count > 1) {
                isLinkDeletion = false;
                myDiagram.remove(link);
            }

            if (fromNode.category === 'Loading' && toNode.category === "End") {
                isLinkDeletion = false;
                myDiagram.remove(link);
            }

            lowlight();
        });
        myDiagram.addDiagramListener('LinkRelinked', (e) => {
            console.log(e);
            const link = e.subject;
            const fromNode = link.fromNode;
            const toNode = link.toNode;

            if (fromNode.category === 'NoAdd' && fromNode.findLinksOutOf().count > 1) {
                myDiagram.remove(link);
            }

            if (toNode.category === 'NoAdd' && toNode.findLinksInto().count > 1) {
                myDiagram.remove(link);
            }

            if (toNode.category === 'End' && toNode.findLinksInto().count > 1) {
                myDiagram.remove(link);
            }

            if (fromNode.category === 'Loading' && toNode.category === "End") {
                myDiagram.remove(link);
            }
        });

        myDiagram.commandHandler.canDeleteSelection = function() {

            if (isContextMenuOpen) {
                return false;
            }

            // 선택된 노드 (다중 선택이 비활성화되어 있어 항상 하나의 노드만 선택됨)
            const selectedNode = myDiagram.selection.first();

            // 노드가 선택되어 있고, 조건에 맞는 경우 경고 메시지와 함께 false 반환
            if (selectedNode instanceof go.Node) {
                isLinkDeletion = false;
                // 노드가 선택되어 있고, 조건에 맞는 경우 경고 메시지와 함께 false 반환
                if (selectedNode && (selectedNode.data.type === "arms-category" || selectedNode.data.type === 'alm-status')) {
                    let node_type = selectedNode.data.type === "arms-category" ? "카테고리" : "ALM 상태";
                    alert(`${node_type} 유형의 노드는 삭제할 수 없습니다.`);
                    return false;
                }
                else if (selectedNode && (selectedNode.data.type === "arms-state")) {
                    const state_name = selectedNode.data.text;
                    if (!confirm( state_name + " 상태를 삭제하시겠습니까?")) {
                        return false;
                    }
                }
            }

            // 기본 삭제 동작 수행
            return go.CommandHandler.prototype.canDeleteSelection.call(this);
        };

        myDiagram.addDiagramListener("SelectionDeleting", function(e) {
            const selectedNode = e.diagram.selection.first();

            // 연결 선택 시 삭제 확인 알림 창 뜨도록 처리를 위한 플래그
            if (selectedNode instanceof go.Node) {
                isLinkDeletion = false;
            }
            else if (selectedNode instanceof  go.Link) {
                isLinkDeletion = true;
            }
        });

        // 연결 삭제 제어
        myDiagram.addModelChangedListener(function(e) {

            if (e.change === go.ChangedEvent.Remove) {
                if (e.propertyName === 'linkDataArray' && isLinkDeletion) {
                    // 노드 삭제 과정에서 링크 삭제 시 확인 메시지를 건너뜁니다.
                    const removedLinkData = e.oldValue;
                    if (!confirm("해당 연결을 삭제하시겠습니까?")) {
                        // 삭제를 취소 시 링크 재연결
                        myDiagram.model.addLinkData(removedLinkData);
                        return;
                    }

                    // 연결 삭제(업데이트) API 호출 (필요시)
                    // $.ajax({
                    //     url: '/your/ajax/endpoint',  // Your server endpoint
                    //     type: 'POST',
                    //     data: JSON.stringify(removedLinkData),
                    //     contentType: 'application/json',
                    //     success: function(response) {
                    //         console.log('Link deletion acknowledged by server:', response);
                    //     },
                    //     error: function(error) {
                    //         console.error('Error while acknowledging link deletion:', error);
                    //     }
                    // });
                }
            }
        });

        myDiagram.linkTemplate = $(go.Link,
            { selectionAdorned: false, fromPortId: 'from', toPortId: 'to', relinkableTo: true },
            $(go.Shape,
                { stroke: 'lightgray', strokeWidth: 3 },
                {
                    mouseEnter: (e, obj) => {
                        obj.strokeWidth = 5;
                        obj.stroke = 'dodgerblue';
                    },
                    mouseLeave: (e, obj) => {
                        obj.strokeWidth = 3;
                        obj.stroke = 'lightgray';
                    },
                }
            )
        );

        function commonLinkingToolInit(tool) {
            // the temporary link drawn during a link drawing operation (LinkingTool) is thick and blue
            tool.temporaryLink = $(go.Link, { layerName: 'Tool' }, $(go.Shape, { stroke: 'dodgerblue', strokeWidth: 5 }));

            // change the standard proposed ports feedback from blue rectangles to transparent circles
            tool.temporaryFromPort.figure = 'Circle';
            tool.temporaryFromPort.stroke = null;
            tool.temporaryFromPort.strokeWidth = 0;
            tool.temporaryToPort.figure = 'Circle';
            tool.temporaryToPort.stroke = null;
            tool.temporaryToPort.strokeWidth = 0;

            // provide customized visual feedback as ports are targeted or not
            tool.portTargeted = (realnode, realport, tempnode, tempport, toend) => {
                if (realport === null) {
                    // no valid port nearby
                    lowlight();
                } else if (toend) {
                    highlight(realport);
                }
            };
        }

        const ltool = myDiagram.toolManager.linkingTool;
        commonLinkingToolInit(ltool);
        // do not allow links to be drawn starting at the "to" port
        ltool.direction = go.LinkingDirection.ForwardsOnly;

        const rtool = myDiagram.toolManager.relinkingTool;
        commonLinkingToolInit(rtool);
        // change the standard relink handle to be a shape that takes the shape of the link
        rtool.toHandleArchetype = $(go.Shape, { isPanelMain: true, fill: null, stroke: 'dodgerblue', strokeWidth: 5 });

        // use a special DraggingTool to cause the dragging of a Link to start relinking it
        myDiagram.toolManager.draggingTool = new DragLinkingTool();

        // detect when dropped onto an occupied cell
        myDiagram.addDiagramListener('SelectionMoved', shiftNodesToEmptySpaces);

        function shiftNodesToEmptySpaces() {
            myDiagram.selection.each((node) => {
                if (!(node instanceof go.Node)) return;
                // look for Parts overlapping the node
                while (true) {
                    const exist = myDiagram
                        .findObjectsIn(
                            node.actualBounds,
                            // only consider Parts
                            (obj) => obj.part,
                            // ignore Links and the dropped node itself
                            (part) => part instanceof go.Node && part !== node,
                            // check for any overlap, not complete containment
                            true
                        )
                        .first();
                    if (exist === null) break;
                    // try shifting down beyond the existing node to see if there's empty space
                    node.moveTo(node.actualBounds.x, exist.actualBounds.bottom + 10);
                }
            });
        }

        // prevent nodes from being dragged to the left of where the layout placed them
        myDiagram.addDiagramListener('LayoutCompleted', (e) => {
            myDiagram.nodes.each((node) => {
                if (node.category === 'Recycle') return;
                node.minLocation = new go.Point(node.location.x, -Infinity);
            });
        });

        // load(); // load initial diagram from the mySavedModel textarea
    }

    function save() {
        let data = myDiagram.model.toJson();
        console.log(data);
        let jsonData = JSON.parse(data);
        decodeObject(jsonData);
        console.log(jsonData);

        document.getElementById('mySavedModel').value = JSON.stringify(jsonData, null, 2);
        myDiagram.isModified = false;
    }

    function isEncoded(str) {
        try {
            return str !== decodeURIComponent(str);
        } catch (e) {
            return false;
        }
    }

    // 객체의 모든 문자열을 디코딩하는 재귀 함수
    function decodeObject(obj) {
        for (let key in obj) {
            if (typeof obj[key] === 'string' && isEncoded(obj[key])) {
                obj[key] = decodeURIComponent(obj[key]);
            } else if (typeof obj[key] === 'object') {
                decodeObject(obj[key]);
            }
        }
    }

    function load(data) {

        // let data = document.getElementById('mySavedModel').value;
        console.log(data);

        myDiagram.model = go.Model.fromJson(data);
        // if any nodes don't have a real location, explicitly do a layout
        if (myDiagram.nodes.any((n) => !n.location.isReal())) layout();
    }

    function layout() {
        myDiagram.layoutDiagram(true);
    }

    // Define a custom tool that changes a drag operation on a Link to a relinking operation,
    // but that operates like a normal DraggingTool otherwise.
    class DragLinkingTool extends go.DraggingTool {
        constructor() {
            super();
            this.isGridSnapEnabled = true;
            this.isGridSnapRealtime = false;
            this.gridSnapCellSize = new go.Size(182, 1);
            this.gridSnapOrigin = new go.Point(5.5, 0);
        }

        // Handle dragging a link specially -- by starting the RelinkingTool on that Link
        doActivate() {
            const diagram = this.diagram;
            if (diagram === null) return;
            this.standardMouseSelect();
            const main = this.currentPart; // this is set by the standardMouseSelect
            if (main instanceof go.Link) {
                // maybe start relinking instead of dragging
                const relinkingtool = diagram.toolManager.relinkingTool;
                // tell the RelinkingTool to work on this Link, not what is under the mouse
                relinkingtool.originalLink = main;
                // start the RelinkingTool
                diagram.currentTool = relinkingtool;
                // can activate it right now, because it already has the originalLink to reconnect
                relinkingtool.doActivate();
                relinkingtool.doMouseMove();
            } else {
                super.doActivate();
            }
        }
    }
    // end DragLinkingTool

    return {
        init, save, load, layout
    }

})(); //즉시실행 함수
