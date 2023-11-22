$(function () {
    var opt1 = {
        /*legend: [{
            text: "Text 1-Test-images/compact_disc.png",
            name: "1",
            icon: "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/images/compact_disc.png"
        }, {
            text: "Text 2",
            name: "2",
            icon: "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/images/compose.png"
        }, {
            text: "Text 3",
            name: "3",
            icon: "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/images/computer-keyboard.png"
        }],*/
        data: [{
                text: "1.0",
                children: [{
                    text: "이슈1 | Complete",
                    id: "node1"
                }, {
                    text: "이슈2 | Backlog",
                    id: "node2"
                }, {
                    text: "이슈3 | Open",
                    id: "node3"
                }, {
                    text: "이슈4 | Open",
                    id: "node4"
                }, {
                    text: "이슈5 | Backlog",
                    id: "node5"
                }, {
                    text: "이슈6 | Complete",
                    id: "node6"
                }]
            },
            {
                text: "3.0",
                children: [{
                    text: "1-1:Text 1-Test-images/compact_disc.png",
                }, {
                    text: "1-2",
                }, {
                    text: "1-3",
                }, {
                    text: "1-4:test",
                }, {
                    text: "1-5",
                }, {
                    text: "1-6",
                }]
            }
        ]
    };

    opt1.theme = {
        centralAxisNode: {
            color: "#1a84ce"
        }
    };

    // opt1.theme = {
    //     startNode: {
    //         radius: 10,
    //         fill: "#7E899D"
    //     },
    //     endNode: {
    //         radius: 10,
    //         fill: "#7E899D"
    //     },
    //     centralAxisNode: {
    //         height: 21,
    //         radius: 4,
    //         fill: "#F9BF3B",
    //         color: "#1a84ce",
    //         inner: {
    //             fill: "#F9BF3B",
    //             "stroke-width": 0,
    //             stroke: "#F9BF3B"
    //         },
    //         outer: {
    //             fill: "#F9BF3B",
    //             "stroke-width": 3,
    //             stroke: "#F9BF3B"
    //         }
    //     },
    //     centralAxisLine: {
    //         fill: "#7E899D"
    //     },
    //     centralAxisBranchNode: {
    //         fill: "#1A84CE",
    //         radius: 10
    //     },
    //     centralAxisBranchLine: {
    //         stroke: '#1A84CE',
    //         fill: "#1A84CE"
    //     },
    //     centralAxisBranchContent: {
    //         fill: "#1A84CE",
    //         color: "#ffffff",
    //         stroke: '#ffffff',
    //         height: 24
    //     }
    // };

    //opt1.legend = null;


    //opt2.data = [];

    //$("#demo").timeline(opt1);


});