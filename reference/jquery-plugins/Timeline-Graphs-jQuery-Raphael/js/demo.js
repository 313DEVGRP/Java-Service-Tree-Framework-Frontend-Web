$(function () {
    var opt1 = {
        legend: [{
            text: "Text 1-Test-images/compact_disc.png",
            name: "1",
            icon: "images/compact_disc.png"
        }, {
            text: "Text 2",
            name: "2",
            icon: "images/compose.png"
        }, {
            text: "Text 3",
            name: "3",
            icon: "images/computer-keyboard.png"
        }, {
            text: "Text 4-Test-abcdefg",
            name: "4",
            icon: "images/contacts.png"
        }, {
            text: "Text 5",
            name: "5",
            icon: "images/contacts-alt.png"
        }, {
            text: "legend6",
            name: "6",
            icon: "images/counter.png"
        }],
        data: [{
                text: "item0405/item0405/A.001",
                imageUrl: "images/counter.png",
                children: [{
                    text: "Test",
                    legendName: "1",
                    imageUrl: ""
                }]
            },
            {
                text: "Node 1",
                imageUrl: ["images/counter.png", "images/counter.png"],
                children: [{
                    text: "1-1:Text 1-Test-images/compact_disc.png",
                    legendName: "1",
                    imageUrl: ""
                }, {
                    text: "1-2",
                    legendName: "2",
                    imageUrl: "images/contacts-alt.png"
                }, {
                    text: "1-3",
                    legendName: "3",
                    imageUrl: ["images/contacts-alt.png", "images/computer-keyboard.png"]
                }, {
                    text: "1-4:test",
                    legendName: "4",
                    imageUrl: ""
                }, {
                    text: "1-5",
                    legendName: "5",
                    imageUrl: ["images/counter.png", "images/counter.png", "images/counter.png"]
                }, {
                    text: "1-6",
                    legendName: "6",
                    imageUrl: ""
                }]
            },
            {
                text: "Node 2",
                imageUrl: ["images/counter.png", "images/counter.png", "images/counter.png"]
            },
            {
                text: "Node 3",
                children: [{
                    text: "1-1:Text 1-Test-images/compact_disc.png",
                    legendName: "1",
                    imageUrl: ""
                }, {
                    text: "1-2",
                    legendName: "2",
                    imageUrl: ""
                }, {
                    text: "1-3",
                    legendName: "3",
                    imageUrl: ""
                }, {
                    text: "1-4:test",
                    legendName: "4",
                    imageUrl: ""
                }, {
                    text: "1-5",
                    legendName: "5",
                    imageUrl: ""
                }, {
                    text: "1-6",
                    legendName: "6",
                    imageUrl: ""
                }]
            },
            {
                text: "Node 4",
                children: [{
                    text: "1-1:Text 1-Test-images/compact_disc.png",
                    legendName: "1",
                    imageUrl: ""
                }]
            },
            {
                text: "Node 5",
                children: [{
                        text: "1-1:Text 1-Test-images/compact_disc.png",
                        legendName: "1",
                        imageUrl: ""
                    },
                    {
                        text: "1-1:Text 1-Test-images/compact_disc.png",
                        legendName: "1",
                        imageUrl: ""
                    }
                ]
            },
            {
                text: "Node 6"
            }
        ]
    };

    var opt2 = {
        legend: [{
            text: "Text 1-Test-images/compact_disc.png",
            name: "1",
            icon: "images/compact_disc.png"
        }, {
            text: "Text 2",
            name: "2",
            icon: "images/compose.png"
        }, {
            text: "Text 3",
            name: "3",
            icon: "images/computer-keyboard.png"
        }],
        data: [{
                text: "Node 1",
                children: [{
                    text: "1-1:Text 1-Test-images/compact_disc.png",
                    legendName: "1",
                    imageUrl: ""
                }, {
                    text: "1-2",
                    legendName: "2",
                    imageUrl: ""
                }, {
                    text: "1-3",
                    legendName: "3",
                    imageUrl: ""
                }, {
                    text: "1-4:test",
                    legendName: "4",
                    imageUrl: ""
                }, {
                    text: "1-5",
                    legendName: "5",
                    imageUrl: ""
                }, {
                    text: "1-6",
                    legendName: "6",
                    imageUrl: ""
                }]
            },
            {
                text: "Node 2"
            },
            {
                text: "Node 3",
                children: [{
                    text: "1-1:Text 1-Test-images/compact_disc.png",
                    legendName: "1",
                    imageUrl: ""
                }, {
                    text: "1-2",
                    legendName: "2",
                    imageUrl: ""
                }, {
                    text: "1-3",
                    legendName: "3",
                    imageUrl: ""
                }, {
                    text: "1-4:test",
                    legendName: "4",
                    imageUrl: ""
                }, {
                    text: "1-5",
                    legendName: "5",
                    imageUrl: ""
                }, {
                    text: "1-6",
                    legendName: "6",
                    imageUrl: ""
                }]
            },
            {
                text: "Node 4"
            }

        ]
    };
    opt2.theme = {
        lengend: {
            fill: "#000000",
        },
        startNode: {
            radius: 10,
            fill: "#7E899D"
        },
        endNode: {
            radius: 10,
            fill: "#7E899D"
        },
        centralAxisNode: {
            height: 21,
            radius: 4,
            fill: "#1A84CE",
            color: "#ffffff",
            inner: {
                fill: "#1A84CE",
                "stroke-width": 0,
                stroke: "#1A84CE"
            },
            outer: {
                fill: "#1A84CE",
                "stroke-width": 3,
                stroke: "#1A84CE"
            }
        },
        centralAxisLine: {
            fill: "#7E899D"
        },
        centralAxisBranchNode: {
            fill: "#F9BF3B",
            radius: 10
        },
        centralAxisBranchLine: {
            stroke: '#F9BF3B',
            fill: "#F9BF3B"
        },
        centralAxisBranchContent: {
            fill: "#F9BF3B",
            color: "#ffffff",
            stroke: '#ffffff',
            height: 24
        }
    }

    opt1.legend = null;

    var theme = 'default';

    var opt3 = {
        legend: [],
        data: [{
                text: "Node 1",
                children: []
            },
            {
                text: "Node 2"
            },
            {
                text: "Node 3",
                children: []
            },
            {
                text: "Node 4"
            }
        ]
    };

    //opt2.data = [];

    $("#demo").timeline(opt2);

    $("#reload").click(function () {

        if (theme === 'default') {
            theme = 'custom';
        } else {
            theme = 'default';
        }

        theme === 'default' ? $("#demo").timeline(opt2) : $("#demo").timeline(opt1);
    });




});