(function () {
    var ua = navigator.userAgent,
        iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
        typeOfCanvas = typeof HTMLCanvasElement,
        nativeCanvasSupport = typeOfCanvas == "object" || typeOfCanvas == "function",
        textSupport =
            nativeCanvasSupport && typeof document.createElement("canvas").getContext("2d").fillText == "function";
    //I'm setting this based on the fact that ExCanvas provides text support for IE
    //and that as of today iPhone/iPad current text support is lame
    labelType = !nativeCanvasSupport || (textSupport && !iStuff) ? "Native" : "HTML";
    nativeTextSupport = labelType == "Native";
    useGradients = nativeCanvasSupport;
    animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
    elem: false,
    write: function (text) {
        if (!this.elem) this.elem = document.getElementById("log");
        this.elem.innerHTML = text;
        this.elem.style.left = 500 - this.elem.offsetWidth / 2 + "px";
    }
};

function init(treeMapInfos) {
    const colorMapping = {};
    // TODO: 요구사항의 가짓수가 많아지면 색상을 더 추가해야 함
    let colors = dashboardColor.treeMapColor;
    function getColorForName(name) {
        if (!colorMapping[name]) {
            const selectedColor = colors.shift();
            colorMapping[name] = selectedColor;
            colors = colors.filter(color => color !== selectedColor);
        }
        return colorMapping[name];
    }

    treeMapInfos.children.forEach((worker) => {
        worker.children.forEach((task) => {
            const color = getColorForName(task.name);
            task.data.$color = color;
            task.id = task.id + "-" + worker.id;
            task.data.$area = task.data.involvedCount;
        });
        worker.data.$area = worker.data.totalInvolvedCount;
    });
    //init TreeMap
    var tm = new $jit.TM.Squarified({
        //where to inject the visualization
        injectInto: "chart-manpower-requirement",
        //parent box title heights
        titleHeight: 22,
        //enable animations
        animate: animate,
        //box offsets
        offset: 2.5,
        //Attach left and right click events
        Events: {
            enable: true,
            onClick: function (node) {
                if (node) tm.enter(node);
            },
            onRightClick: function () {
                tm.out();
            }
        },
        duration: 300,
        //Enable tips
        Tips: {
            enable: true,
            //add positioning offsets
            offsetX: 20,
            offsetY: 20,
            //implement the onShow method to
            //add content to the tooltip when a node
            //is hovered
            onShow: function (tip, node, isLeaf, domElement) {
                var html =
                    '<div class="tip-title" style="font-size: 13px; font-weight: bolder">' +
                    node.name +
                    '</div><div class="tip-text">';
                var data = node.data;
                if (data.involvedCount) {
                    html +=
                        "<div style='white-space: pre-wrap; font-size: 11px;'>관여한 횟수 : <span style='color: lawngreen'>" +
                        data.involvedCount +
                        "<br/></span></div>";
                }
                if (data.totalInvolvedCount) {
                    html +=
                        "<div style='white-space: pre-wrap; font-size: 11px;'>작업자가 관여한 총 횟수 : <span style='color: orange'>" +
                        data.totalInvolvedCount +
                        "<br/></span></div>";
                }
                if (data.image) {
                    html += '<img src="' + data.image + '" class="album" />';
                }
                html +=
                    "<div style='white-space: pre-wrap; margin-top: 8px; color: #d0d0d0; font-size: 10px'>우클릭 시 뒤로 갑니다.<br/></div>";
                tip.innerHTML = html;
            }
        },
        //Add the name of the node in the correponding label
        //This method is called once, on label creation.
        onCreateLabel: function (domElement, node) {
            if (node.id === "root" || !node.id.includes("app")) {
                var html =
                    '<div style="font-size: 13px; font-weight: bolder; text-align: center; margin: 2.5px 0 0 0">' +
                    node.name +
                    "</div>";
            } else {
                var html =
                    '<div style="font-size: 15.5px; font-weight: 600; text-align: center; margin: 2.5px 0 0 0; color: #464649">' +
                    // '<span style="color: whitesmoke; -webkit-text-stroke: 0.1px #1A2920;">' +
                    node.name +
                    // "</span>" +
                    "</div>";
            }
            domElement.innerHTML = html;
            var style = domElement.style;
            style.display = "";
            style.border = "1.5px solid transparent";
            // style.borderRadius = "50%";
            domElement.onmouseover = function () {
                style.border = "1.5px solid #9FD4FF";
            };
            domElement.onmouseout = function () {
                style.border = "1.5px solid transparent";
            };
        }
    });
    tm.loadJSON(treeMapInfos);
    tm.refresh();
    //end
    //add events to radio buttons
    var sq = $jit.id("r-sq"),
        st = $jit.id("r-st"),
        sd = $jit.id("r-sd");
    var util = $jit.util;
    util.addEvent(sq, "change", function () {
        if (!sq.checked) return;
        util.extend(tm, new $jit.Layouts.TM.Squarified());
        tm.refresh();
    });
    util.addEvent(st, "change", function () {
        if (!st.checked) return;
        util.extend(tm, new $jit.Layouts.TM.Strip());
        tm.layout.orientation = "v";
        tm.refresh();
    });
    util.addEvent(sd, "change", function () {
        if (!sd.checked) return;
        util.extend(tm, new $jit.Layouts.TM.SliceAndDice());
        tm.layout.orientation = "v";
        tm.refresh();
    });
    //add event to the back button
    var back = $jit.id("back");
    $jit.util.addEvent(back, "click", function () {
        tm.out();
    });

    let resizeTimeout;

    function drawChart() {
        tm.refresh();
    }

    function onResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(drawChart, 100);
    }

    window.addEventListener('resize', onResize);
}