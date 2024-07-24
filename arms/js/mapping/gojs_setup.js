var gojs = (function () {
    "use strict";

    var myDiagram;
    let isLinkDeletion = false;

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
                                margin: new go.Margin(3, 4, 3, 4), // 적절한 마진 설정
                                alignment: go.Spot.Left,
                                editable: true,
                                textEdited: function(textBlock, oldText, newText) {
                                    // 줄바꿈 문자를 제거
                                    textBlock.text = newText.replace(/\r?\n|\r/g, '');
                                    if (textBlock.text.trim() === "") {
                                        jNotify("빈 값으로는 상태명을 변경할 수 없습니다.");
                                        textBlock.text = oldText;
                                    }
                                },
                            },
                            new go.Binding('text').makeTwoWay()
                        )
/*                        $(go.TextBlock,
                            {
                                stroke: 'white',
                                font: '12px sans-serif',
                                editable: true,
                                margin: new go.Margin(3, 4, 3, 4), // 적절한 마진 설정
                                alignment: go.Spot.Left,
                            },
                            new go.Binding('text').makeTwoWay()
                        )*/
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
                    // $(go.Shape, 'PlusLine', new go.Binding('visible', '', (data) => data.category !== 'NoAdd').ofObject(), { width: 11, height: 11, fill: null, stroke: 'dodgerblue', strokeWidth: 3 })
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

        // ARMS 카테고리 노드 설정
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
                                editable: false,
                                margin: new go.Margin(3, 4, 3, 4), // 적절한 마진 설정
                                alignment: go.Spot.Left,
                            },
                            new go.Binding('text').makeTwoWay()
                        )
                        // 아이콘 설정 샘플
                        /*$(go.TextBlock,
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
                        )*/
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
                    // $(go.Shape, 'PlusLine', new go.Binding('visible', '', (data) => data.category !== 'Loading').ofObject(), { width: 11, height: 11, fill: null, stroke: 'dodgerblue', strokeWidth: 3 })
                ),
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

        // 노드 쓰레기통 영역 주석
        /*myDiagram.nodeTemplateMap.add(
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
        );*/

        function addNodeAndLink(e, obj) {
            const fromNode = obj.part;
            const diagram = fromNode.diagram;
            diagram.startTransaction('Add State');
            // get the node data for which the user clicked the button
            const fromData = fromNode.data;
            const category = fromData.category;
            const c_id = fromData.c_id;
            const type = fromData.type;

            if (category === "NoAdd" || category === "Loading") {
                // NoAdd, Loading 카테고리 노드의 경우 Node는 생성 못하도록 처리
                diagram.commitTransaction('Add Node');
                return;
            }
            // else {
            //     if (!confirm(fromData.text + " 카테고리 상태를 추가하시겠습니까?")) {
            //         return;
            //     }
            // }

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

        // ARMS 상태 노드 텍스트 편집 이벤트 리스너 추가
        myDiagram.addDiagramListener('TextEdited', (e) => {
            const text_block = e.subject;  // 편집된 텍스트 블록
            const node = text_block.part;  // 텍스트 블록이 포함된 노드
            if (node !== null) {
                const edited_text = text_block.text;
                const state_c_id = node.data.c_id;
                const mapping_id = node.data.mapping_id;
                console.log(node.data.c_id);
                console.log('Edited text: ', edited_text);

                // 상태명 변경 호출
                update_arms_state(state_c_id, mapping_id, edited_text, null)
                    .then((result) => {
                        // API 호출 결과를 처리합니다.
                        console.log(result);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                        return;
                    });
            }
        });

        // 연결을 Point to Point 연결 이벤트 처리
        myDiagram.addDiagramListener('LinkDrawn', (e) => {
            const link = e.subject;
            const from_node = link.fromNode;
            const to_node = link.toNode;

            link.data.fromNode = from_node.data;
            link.data.toNode = to_node.data;
            link.data.oldFromNode = from_node.data;
            link.data.oldToNode = to_node.data;

            // ARMS 상태 노드에서 ALM 상태로 이미 연결이 있는 경우
            if (from_node.category === "NoAdd" && from_node.findLinksOutOf().count > 1) {
                const existing_link = from_node.findLinksOutOf().first();   //
                jNotify(from_node.data.text + "는 이미 연결된 ALM 상태가 있습니다. 연결 삭제 후 연결 해주세요.");
                isLinkDeletion = false;
                myDiagram.remove(link);
                return;
            }

            // ALM 상태 노드가 이미 연결된 ARMS 상태가 있는 경우
            if (to_node.category === 'End' && to_node.findLinksInto().count > 1) {
                const existing_link = to_node.findLinksInto().first();
                jNotify("ALM 상태(" + to_node.data.text + ")는 이미 "+ existing_link.data.fromNode.text +" 상태와 연결되어있습니다.");
                isLinkDeletion = false;
                myDiagram.remove(link);
                return;
            }

            // ARMS 상태는 상태 카테고리 1개에만 연결 가능
            if (to_node.category === "NoAdd" && to_node.findLinksInto().count > 1) {
                const existing_link = to_node.findLinksInto().first();
                jNotify(to_node.data.text + " 상태는 " + existing_link.data.fromNode.text +" 카테고리가 지정 되어있습니다.");
                isLinkDeletion = false;
                myDiagram.remove(link);
                return;
            }

            // 카테고리 - ALM 상태 연결 막기
            if (from_node.category === 'Loading' && to_node.category === "End") {
                jNotify("카테고리는 ARMS 상태에만 연결할 수 있습니다.");
                isLinkDeletion = false;
                myDiagram.remove(link);
                return;
            }

            let update_c_id = to_node.data.c_id;
            let update_mapping_id = from_node.data.c_id;

            // if (to_node.data.type === "arms-state") {
            //     update_arms_state(update_c_id, update_mapping_id, null, null)
            //         .then((result) => {
            //             console.log(result);
            //             jSuccess(to_node.data.text + " 상태가 " + from_node.data.text + "카테고리에 연결되었습니다.");
            //         })
            //         .catch((error) => {
            //             console.error('Error fetching data:', error);
            //             return;
            //         });
            // }
            // else if (to_node.data.type === "alm-status") {
            //     update_alm_status(update_c_id, update_mapping_id)
            //         .then((result) => {
            //             console.log(result);
            //             jSuccess("ALM 상태(" + to_node.data.text + ")가 " + from_node.data.text + " 상태에 연결되었습니다.");
            //         })
            //         .catch((error) => {
            //             console.error('Error fetching data:', error);
            //             return;
            //         });
            // }

            lowlight();
        });

        // 연결 드래그로 연결을 그리는 이벤트 처리
        myDiagram.addDiagramListener('LinkRelinked', (e) => {
            console.log(e);
            const link = e.subject;
            const from_node = link.fromNode;
            const to_node = link.toNode;

            // 드래그 전 링크 데이터 추가
            const old_from_node = link.data.oldFromNode;
            const old_to_node = link.data.oldToNode;

            // 유효성 검사에 실패한 경우 링크를 제거하고 기존 상태로 복원
            const remove_new_link_and_restore = () => {
                isLinkDeletion = false;
                myDiagram.remove(link);
                if (old_from_node && old_to_node) {
                    const newLinkData = {
                        from: old_from_node.key,
                        to: old_to_node.key,
                        fromNode: old_from_node,
                        toNode: old_to_node,
                        oldFromNode: old_from_node,
                        oldToNode: old_to_node,
                    };
                    myDiagram.model.addLinkData(newLinkData);
                }
            };

            // ARMS 상태 노드에서 ALM 상태로 이미 연결이 있는 경우
            if (from_node.category === "NoAdd" && from_node.findLinksOutOf().count > 1) {
                const existing_link = from_node.findLinksOutOf().first();   //
                jNotify(from_node.data.text + "는 이미 연결된 ALM 상태가 있습니다. 연결 삭제 후 연결 해주세요.");
                remove_new_link_and_restore();
                return;
            }

            // ALM 상태 노드가 이미 연결된 ARMS 상태가 있는 경우
            if (to_node.category === 'End' && to_node.findLinksInto().count > 1) {
                const existing_link = to_node.findLinksInto().first();
                jNotify("ALM 상태(" + to_node.data.text + ")는 이미 "+ existing_link.data.fromNode.text +" 상태와 연결되어있습니다.");
                remove_new_link_and_restore();
                return;
            }

            // ARMS 상태는 상태 카테고리 1개에만 연결 가능
            if (to_node.category === "NoAdd" && to_node.findLinksInto().count > 1) {
                const existing_link = to_node.findLinksInto().first();
                jNotify(to_node.data.text + " 상태는 " + existing_link.data.fromNode.text +" 카테고리가 지정 되어있습니다.");
                remove_new_link_and_restore();
                return;
            }

            // 카테고리 - ALM 상태 연결 막기
            if (from_node.category === 'Loading' && to_node.category === "End") {
                jNotify("카테고리는 ARMS 상태에만 연결할 수 있습니다.");
                remove_new_link_and_restore();
                return;
            }
/*            // ARMS 상태 노드는 카테고리를 1개만 연결 가능
            if (from_node.category === "NoAdd" && from_node.findLinksOutOf().count > 1) {
                // jNotify("1");
                remove_new_link_and_restore();
                return;
            }

            // ARMS 상태 노드의 연결은 1개만 연결 가능
            if (to_node.category === "NoAdd" && to_node.findLinksInto().count > 1) {
                jNotify(to_node.data.text + " 상태에 연결된 상태 카테고리가 있습니다.");
                remove_new_link_and_restore();
                return;
            }

            // ALM 상태 노드의 연결은 1개만 연결 가능
            if (to_node.category === 'End' && to_node.findLinksInto().count > 1) {
                jNotify("ALM 상태와 ARMS 상태는 1 : 1 매핑만 가능합니다.");
                remove_new_link_and_restore();
                return;
            }

            // 카테고리 - ALM 상태 연결 막기
            if (from_node.category === 'Loading' && to_node.category === "End") {
                jNotify("카테고리는 ARMS 상태에만 연결할 수 있습니다.");
                remove_new_link_and_restore();
                return;
            }*/

            // 드래그 앤 드롭으로 연결을 변경 처리할 경우 기존 연결 삭제 update 처리
            console.log(old_to_node);
            console.log(old_from_node);
/*            let old_c_id = old_to_node.c_id;
            let old_mapping_id = old_from_node.c_id;

            if (old_to_node.type === "arms-state") {
                console.log("기존 ARMS 상태 초기화");
                update_arms_state(old_c_id, null, null, null)
                    .then((result) => {
                        // API 호출 결과를 처리합니다.
                        console.log(result);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                        return;
                    });
            }
            else if (old_to_node.type === "alm-status") {
                console.log("기존 ALM 상태 초기화");

                update_alm_status(old_c_id, null)
                    .then((result) => {
                        console.log(result);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                        return;
                    });
            }

            // 드래그 앤 드롭으로 연결을 변경 처리할 경우 새로운 연결 link update 처리
            let c_id = to_node.data.c_id;
            let mapping_id = from_node.data.c_id;

            if (to_node.data.type === "arms-state") {
                update_arms_state(c_id, mapping_id, null, null)
                    .then((result) => {
                        // API 호출 결과를 처리합니다.
                        jSuccess(to_node.data.text + " 상태가 " + from_node.data.text + "카테고리에 연결되었습니다.");
                        console.log(result);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                        return;
                    });
            }
            else if (to_node.data.type === "alm-status") {
                console.log("ALM 상태 매핑 변경");
                update_alm_status(c_id, mapping_id)
                    .then((result) => {
                        jSuccess("ALM 상태(" + to_node.data.text + ")가 " + from_node.data.text + " 상태에 연결되었습니다.");
                        console.log(result);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                        return;
                    });
            }*/

            // old data 최신화
            link.data.oldFromNode = from_node.data;
            link.data.oldToNode = to_node.data;
        });

        myDiagram.commandHandler.canDeleteSelection = function() {

            // 선택된 데이터 (다중 선택이 비활성화되어 있어 항상 하나만 선택됨)
            const selectedNode = myDiagram.selection.first();

            // 선택된 데이터가 Node 타입일 때
            if (selectedNode instanceof go.Node) {
                isLinkDeletion = false; // Link 삭제가 아닌 Node 삭제로 처리

                // 카테고리 이거나, ALM 상태일 경우
                if (selectedNode && (selectedNode.data.type === "arms-category" || selectedNode.data.type === 'alm-status')) {
                    // 삭제 못하도록 처리
                    let node_type = selectedNode.data.type === "arms-category" ? "카테고리" : "ALM 상태";
                    alert(`${node_type} 유형의 노드는 삭제할 수 없습니다.`);
                    return false;
                }
                // ARMS의 상태의 경우
                else if (selectedNode && (selectedNode.data.type === "arms-state")) {
                    // 삭제할지 여부에 대한 알림 창 추가
                    const state_name = selectedNode.data.text;
                    const state_c_id = selectedNode.data.c_id;

                    if (!confirm( state_name + " 상태를 삭제하시겠습니까?")) {
                        return false;
                    }
                    else {
/*                        remove_arms_state(state_c_id, state_name)
                            .then((result) => {
                                // API 호출 결과를 처리합니다.
                                console.log(result);
                            })
                            .catch((error) => {
                                // 오류가 발생한 경우 처리합니다.
                                console.error('Error fetching data:', error);
                                return false;
                            });*/
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
            else if (selectedNode instanceof go.Link) {
                isLinkDeletion = true;
            }
        });

        myDiagram.addModelChangedListener(function(e) {
            if (e.change === go.ChangedEvent.Remove) {
                // 링크 삭제의 경우
                if (e.propertyName === 'linkDataArray' && isLinkDeletion) {
                    // 연결 삭제 타입의 경우
                    const removedLinkData = e.oldValue;
                    if (!confirm("해당 연결을 삭제하시겠습니까?")) {
                        // 삭제 취소 시 링크 재연결
                        myDiagram.model.addLinkData(removedLinkData);
                        return;
                    }

                    console.log(removedLinkData);
                    let c_id = removedLinkData.toNode.c_id;

                    /*if (removedLinkData.toNode.type === "arms-state") {

                        update_arms_state(c_id, null, null, null)
                            .then((result) => {
                                // API 호출 결과를 처리합니다.
                                console.log(result);
                            })
                            .catch((error) => {
                                // 오류가 발생한 경우 처리합니다.
                                console.error('Error fetching data:', error);
                                myDiagram.model.addLinkData(removedLinkData);
                                return;
                            });
                    }
                    else if (removedLinkData.toNode.type === "alm-status") {
                        console.log("alm 상태 링크 삭제");
                        update_alm_status(c_id, null)
                            .then((result) => {
                                // API 호출 결과를 처리합니다.
                                console.log(result);
                            })
                            .catch((error) => {
                                // 오류가 발생한 경우 처리합니다.
                                console.error('Error fetching data:', error);
                                myDiagram.model.addLinkData(removedLinkData);
                                return;
                            });
                    }*/
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

    function save() {
        let data = myDiagram.model.toJson();
        console.log(data);
        let jsonData = JSON.parse(data);
        decodeObject(jsonData);

        console.log(jsonData.linkDataArray);
        jsonData.linkDataArray.forEach(link => {
            console.log(link);
            if (link.toNode && link.fromNode) {
                let type = link.toNode.type;
                let c_id = link.toNode.c_id;
                let mapping_id = link.fromNode.c_id;
                console.log(type);
                console.log("바꿀 데이터의 아이디 = "+ c_id);
                console.log("바꿀 데이터의 매핑 아이디 = "+ mapping_id);
                if (type === "arms-state") {
                    let name = link.toNode.c_title;
                    // arms state의 c_id에 mapping_id 값 업데이트
                    let data = {
                        c_id : c_id,
                        c_state_category_mapping_id : mapping_id
                    };

                    console.log(data);
                    console.log(name);
                }
                else if (type === "alm-status") {
                    // alm status의 c_id에 mapping_id 값 업데이트
                }
            }
            else if (link.isNew === true) {
                let node = find_arms_state_data(jsonData.nodeDataArray, link.to);
                console.log(node);
                let state_name = node.text.trim();
                if (!state_name) {
                    alert("상태의 이름이 입력되지 않았습니다.");
                    return;
                }

                let state_category_value = node.mapping_id;
                if (!state_category_value) {
                    alert("상태 카테고리가 선택되지 않았습니다.");
                    return;
                }

                let data = {
                    ref : 2,
                    c_type : "default",
                    c_state_category_mapping_id : state_category_value,
                    c_title : state_name
                };
            }
        })

        console.log(jsonData.nodeDataArray);

        document.getElementById('mySavedModel').value = JSON.stringify(jsonData, null, 2);
        myDiagram.isModified = false;
    }

    function find_arms_state_data(node_data_array, key) {
        const node = node_data_array.find(node => node.key === key);
        return node ? node : null;
    }

    return {
        init, save, load, layout
    }

})(); //즉시실행 함수
