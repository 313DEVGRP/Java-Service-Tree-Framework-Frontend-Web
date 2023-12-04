///////////////////
//Page 전역 변수
///////////////////
var dashboardColor;
var selectedVersionId;
var globalJiraIssue = {};
var pdServiceData;
var versionListData;
var deadline;
// 필요시 작성

////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {

    var pluginGroups = [
        [	"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
            "../reference/light-blue/lib/jquery.iframe-transport.js",
            // chart Colors
            // "./js/dashboard/chart/colorPalette.js",
            // 2번째 박스 d3 게이지 차트
            "../reference/jquery-plugins/c3/c3.min.css",
            "../reference/jquery-plugins/c3/c3-custom.css",
            "../reference/jquery-plugins/c3/c3.min.js",
            "./js/common/colorPalette.js",
            // 2번째 박스 timeline
            "../reference/jquery-plugins/info-chart-v1/js/D.js",
            "../reference/jquery-plugins/info-chart-v1/js/timeline_analysisTime.js",
            //"./js/dashboard/chart/timeline_custom.js",
            "./js/dashboard/chart/infographic_custom.css",
            "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/timeline/css/newtimeline.css",
            "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/timeline/js/raphael.min.js",
            "../reference/jquery-plugins/Timeline-Graphs-jQuery-Raphael/timeline/js/newtimeline.js",
            // 3번째 박스 데이터 테이블 내 차트
            "../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js",
            // 5번째 박스 network chart
            "./js/analysisTime/d3.v5.min.js",
            // 5번째 박스 heatmap
            "../reference/jquery-plugins/github-calendar-heatmap/js/calendar_yearview_blocks.js",
            "../reference/jquery-plugins/github-calendar-heatmap/css/calendar_yearview_blocks.css",
            // 7번째 박스
            "../reference/jquery-plugins/timelines-chart-2.11.8/src/show-time-marker.js",
            "../reference/jquery-plugins/timelines-chart-2.11.8/example/random-data.js"
        ],

        [	"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
            "../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
            "../reference/light-blue/lib/bootstrap-datepicker.js",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js"],

        [	"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

        [	"../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function() {
            //vfs_fonts 파일이 커서 defer 처리 함.
            setTimeout(function() {
                var script = document.createElement("script");
                script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
                script.defer = true; // defer 속성 설정
                document.head.appendChild(script);
            }, 3000); // 2초 후에 실행됩니다.
            console.log('모든 플러그인 로드 완료');

            // 사이드 메뉴 처리
            $('.widget').widgster();
            setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_time");

            //제품(서비스) 셀렉트 박스 이니시에이터
            makePdServiceSelectBox();

            //버전 멀티 셀렉트 박스 이니시에이터
            makeVersionMultiSelectBox();

            candleStickChart();
            dashboardColor = dashboardPalette.dashboardPalette01;

        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}

///////////////////////
//제품 서비스 셀렉트 박스
//////////////////////
function makePdServiceSelectBox() {
    //제품 서비스 셀렉트 박스 이니시에이터
    $(".chzn-select").each(function () {
        $(this).select2($(this).data());
    });

    //제품 서비스 셀렉트 박스 데이터 바인딩
    $.ajax({
        url: "/auth-user/api/arms/pdService/getPdServiceMonitor.do",
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                for (var k in data.response) {
                    var obj = data.response[k];
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $("#selected_pdService").append(newOption).trigger("change");
                }
                //////////////////////////////////////////////////////////
            }
        }
    });


    $("#selected_pdService").on("select2:open", function () {
        //슬림스크롤
        makeSlimScroll(".select2-results__options");
    });

    // --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
    $("#selected_pdService").on("select2:select", function (e) {
        // 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
        // 디폴트는 base version 을 선택하게 하고 ( select all )
        //~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
        bind_VersionData_By_PdService();

        var checked = $("#checkbox1").is(":checked");
        var endPointUrl = "";

//        if (checked) {
//            endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true";
//        } else {
//            endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false";
//        }

        console.log("선택된 제품(서비스) c_id = " + $("#selected_pdService").val());

    });
} // end makePdServiceSelectBox()

function bind_VersionData_By_PdService() {
    $(".multiple-select option").remove();
    $.ajax({
        url: "/auth-user/api/arms/pdService/getVersionList.do?c_id=" + $("#selected_pdService").val(),
        type: "GET",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                // console.log(data.response); // versionData

                versionListData = data.response.reduce((obj, item) => {
                    obj[item.c_id] = item;
                    return obj;
                }, {});

                var pdServiceVersionIds = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceVersionIds.push(obj.c_id);
                    var newOption = new Option(obj.c_title, obj.c_id, true, false);
                    $(".multiple-select").append(newOption);
                }

                selectedVersionId = pdServiceVersionIds.join(',');

                statisticsMonitor($("#selected_pdService").val(), selectedVersionId);

                showStatusesCountBox();
                getReqLinkedIssueCountAndRate($("#selected_pdService").val(), selectedVersionId, true);
                getReqLinkedIssueCountAndRate($("#selected_pdService").val(), selectedVersionId, false);

                combinationChart($("#selected_pdService").val(), selectedVersionId);

                getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);
                calendarHeatMap($("#selected_pdService").val(), selectedVersionId);

                if (data.length > 0) {
                    console.log("display 재설정.");
                }
                //$('#multiversion').multipleSelect('refresh');
                //$('#edit_multi_version').multipleSelect('refresh');
                $(".multiple-select").multipleSelect("refresh");
                //////////////////////////////////////////////////////////
            }
        }
    });
}

////////////////////
//버전 멀티 셀렉트 박스
////////////////////
function makeVersionMultiSelectBox() {
    //버전 선택시 셀렉트 박스 이니시에이터
    $(".multiple-select").multipleSelect({
        filter: true,
        onClose: function () {
            console.log("onOpen event fire!\n");

            var checked = $("#checkbox1").is(":checked");
            var endPointUrl = "";
            var versionTag = $(".multiple-select").val();

            if (versionTag === null || versionTag == "") {
                alert("버전이 선택되지 않았습니다.");
                return;
            }

            selectedVersionId = versionTag.join(',');

            statisticsMonitor($("#selected_pdService").val(), selectedVersionId);

            showStatusesCountBox();
            getReqLinkedIssueCountAndRate($("#selected_pdService").val(), selectedVersionId, true);
            getReqLinkedIssueCountAndRate($("#selected_pdService").val(), selectedVersionId, false);

            combinationChart($("#selected_pdService").val(), selectedVersionId);

            getRelationJiraIssueByPdServiceAndVersions($("#selected_pdService").val(), selectedVersionId);
            calendarHeatMap($("#selected_pdService").val(), selectedVersionId);

            if (checked) {
                endPointUrl =
                    "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true&versionTag=" + versionTag;
                //dataTableLoad($("#selected_pdService").val(), endPointUrl);
            } else {
                endPointUrl =
                    "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false&versionTag=" + versionTag;
                //dataTableLoad($("#selected_pdService").val(), endPointUrl);
            }
        }
    });
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, "0");
    var day = date.getDate().toString().padStart(2, "0");
    return year + "-" + month + "-" + day;
}

////////////////////
// 첫번째 박스
////////////////////
function showStatusesCountBox() {
    $("#progress_req_status").slimScroll({
        height: "190px",
        railVisible: true,
        railColor: "#222",
        railOpacity: 0.3,
        wheelStep: 10,
        allowPageScroll: false,
        disableFadeOut: false
    });

    $("#progress_linked_issue_status").slimScroll({
        height: "190px",
        railVisible: true,
        railColor: "#222",
        railOpacity: 0.3,
        wheelStep: 10,
        allowPageScroll: false,
        disableFadeOut: false
    });
}

function statisticsMonitor(pdservice_id, pdservice_version_id) {
    console.log("선택된 서비스 ===> " + pdservice_id);
    console.log("선택된 버전 리스트 ===> " + pdservice_version_id);

    //1. 좌상 게이지 차트 및 타임라인
    //2. Time ( 작업일정 ) - 버전 개수 삽입
    $.ajax({
        url: "/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + pdservice_id,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (json) {
                pdServiceData = json;
                let versionData = json.pdServiceVersionEntities;
                versionData.sort((a, b) => a.c_id - b.c_id);
                let version_count = versionData.length;

                console.log("등록된 버전 개수 = " + version_count);
                if(version_count !== undefined) {
                    $('#version_prgress').text(version_count);

                    if (version_count >= 0) {
                        let today = new Date();
                        let plusDate = new Date();

                        $("#notifyNoVersion").slideUp();
                        $("#project-start").show();
                        $("#project-end").show();

                        $("#versionGaugeChart").html(""); //게이지 차트 초기화
                        var versionGauge = [];
                        var versionTimeline = [];
                        versionData.forEach(function (versionElement, idx) {
                            if (pdservice_version_id.includes(versionElement.c_id)) {
                                var gaugeElement = {
                                    "current_date": today.toString(),
                                    "version_name": versionElement.c_title,
                                    "version_id": versionElement.c_id,
                                    "start_date": (versionElement.c_pds_version_start_date == "start" ? today : versionElement.c_pds_version_start_date),
                                    "end_date": (versionElement.c_pds_version_end_date == "end" ? today : versionElement.c_pds_version_end_date)
                                    //"end_date": (versionElement.c_pds_version_end_date == "end" ? plusDate.setMonth(plusDate.getMonth()+1) : versionElement.c_pds_version_end_date)
                                }
                                versionGauge.push(gaugeElement);
                            }

                            var timelineElement = {
                                "id" : "timelineData",
                                "title" : "버전: "+versionElement.c_title,
                                "startDate" : (versionElement.c_pds_version_start_date == "start" ? today : versionElement.c_pds_version_start_date),
                                "endDate" : (versionElement.c_pds_version_end_date == "end" ? today : versionElement.c_pds_version_end_date)
                                //"endDate" : (versionElement.c_pds_version_end_date == "end" ? plusDate : versionElement.c_pds_version_end_date)
                            };
                            versionTimeline.push(timelineElement);
                        });

                        drawVersionProgress(versionGauge); // 버전 게이지
                        // 이번 달의 첫째 날 구하기
                        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

                        // 이번 달의 마지막 날 구하기
                        var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        // 이번달 일수 구하기
                        var daysCount  = lastDay.getDate();
                        // 오늘 일자 구하기
                        var day = today.getDate();
                        var today_flag = {
                            "title" : "오늘",
                            "startDate" : formatDate(firstDay),
                            "endDate" : formatDate(lastDay),
                            "id" : "today_flag"
                        };
                        versionTimeline.push(today_flag);

                        $("#version-timeline-bar").show();
                        Timeline.init($("#version-timeline-bar"), versionTimeline);

                        var basePosition = $("#today_flag").css("left");
                        var baseWidth = $("#today_flag").css("width");
                        var calFlagPosition = parseFloat(baseWidth)/daysCount*day;
                        var flagPosition = parseFloat(basePosition)+calFlagPosition+"px";

                        $("#today_flag").css("border-top-width", "150px");
                        $("#today_flag").css("width", "3px");
                        $("#today_flag").css("border-top-color", "rgba(255, 0, 0,0.78)");
                        $("#today_flag span").remove();
                        $("#timelineData .label").css("text-align", "left");
                        $("#today_flag").css("left", flagPosition);

                        // radarChart(pdservice_id, versionData);
                    }
                }
            }
        }
    });
}

function calculateDateDiff(date1, date2) {
    return Math.floor((new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24));
}

function progressShow(today, start_date, end_date) {
    var totalDate = calculateDateDiff(end_date, start_date);
    var remainingDate = calculateDateDiff(end_date, today);
    var isExceeded = remainingDate < 0;
    var absoluteRemainingDate = isExceeded ? Math.abs(remainingDate) : Math.abs(remainingDate);
    var progress = totalDate === 0 ? 0 : ((absoluteRemainingDate / totalDate) * 100).toFixed(2);

    $('.isExceed').text(isExceeded ? " 초과" : "").css("color", isExceeded ? "#FF4D4D" : "none");
    $('#remaining_days').text(absoluteRemainingDate).css("color", isExceeded ? "#FF4D4D" : "");
    $('#version_progress').text(progress).css("color", isExceeded ? "#FF4D4D" : "");
}

function getReqLinkedIssueCountAndRate(pdservice_id, pdServiceVersionLinks, isReq) {

    var _url = "/auth-user/api/arms/analysis/time/normal-version/"+pdservice_id;
    $.ajax({
        url: _url,
        type: "GET",
        data: {
            "서비스아이디" : pdservice_id,
            "메인그룹필드" : "status.status_name.keyword",
            "isReq" : isReq,
            "컨텐츠보기여부" : false,
            "크기" : 1000,
            "pdServiceVersionLinks" : pdServiceVersionLinks
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                if(isReq === true) {
                    calculateCompletion(data, "completed_req_count", "total_req_count", "req_completion_rate", "progress_req_status");

                } else {
                    calculateCompletion(data, "completed_linked_issue_count", "total_linked_issue_count", "linked_issue_completion_rate", "progress_linked_issue_status");
                }
            }
        }
    });
}

function calculateCompletion(data, completedId, totalId, rateId, progressId) {
    $('#' + progressId).empty();
    var totalCount = data["전체합계"];
    var result = data["검색결과"]["group_by_status.status_name.keyword"];
    console.log(progressId);
    var completedCount = 0;
    result.forEach((item) => {
        var count = item["개수"];
        completedCount += count;

        var key = item["필드명"];
        var value = count;

        var html_piece = 	"<div	class=\"controls form-group darkBack\"\n" +
            "		style=\"margin-bottom: 5px !important; padding-top: 5px !important;\">\n" +
            "<span>✡ " + key + " : <a id=\"alm_server_count\" style=\"font-weight: bold;\"> " + value + "</a> 개</span>\n" +
            "</div>";
        // console.log(html_piece);
        $("#" + progressId).append(html_piece);
    });
    $("#" + totalId).text(totalCount);
}

////////////////////
// 두번째 박스
////////////////////
function drawVersionProgress(data) {
    var Needle,
        arc,
        arcEndRad,
        arcStartRad,
        barWidth,   // 색션의 두께
        chart,
        chartInset, // 가운데로 들어간 정도
        el,
        endPadRad,
        height,
        i,
        margin,		// 차트가 그려지는 위치 마진
        needle,		// 침
        numSections,// 색션의 수
        padRad,
        percToDeg, percToRad, degToRad, // 고정
        percent,
        radius, 	// 반지름
        ref,
        sectionIndx, // 색션 인덱스
        sectionPerc, // 색션의 퍼센트
        startPadRad,
        svg,
        totalPercent,
        width,
        versionId,
        versionName,
        waveName;

    // percent = 0.55;
    barWidth = 25;
    padRad = 0;
    chartInset = 11;
    totalPercent = 0.75;

    margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    width = 220;
    height = width;
    radius = Math.min(width, height) / 2.5;

    // percToDeg percToRad degToRad 고정
    percToDeg = function (perc) {
        return perc * 360;
    };

    percToRad = function (perc) {
        return degToRad(percToDeg(perc));
    };

    degToRad = function (deg) {
        return (deg * Math.PI) / 180;
    };

    svg = d3
        .select("#versionGaugeChart")
        .append("svg")
        .attr("viewBox", [70, 10, width -150, height -100])
        .append("g");

    chart = svg
        .append("g")
        .attr("transform", "translate(" + (width + margin.left) / 2 + ", " + (height + margin.top) / 2 + ")");

    var tooltip = d3
        .select("#versionGaugeChart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("color", "black")
        .style("padding", "10px");

    var arc = d3
        .arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius);

    var outerArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    var totalDate;

    numSections = data.length; // 전체 색션의 수(버전의 수)
    sectionPerc = 1 / numSections / 2; //  '/ 2' for Half-circle

    var fastestStartDate;
    var latestEndDate;
    // 가장 빠른날짜, 가장 느린날짜 세팅
    for (var idx = 0; idx < data.length; idx++) {
        if (idx === 0) {
            fastestStartDate = data[idx].start_date;
            latestEndDate = data[idx].end_date;
        } else {
            if (data[idx].start_date < fastestStartDate) {
                fastestStartDate = data[idx].start_date;
            }
            if (data[idx].end_date > latestEndDate) {
                latestEndDate = data[idx].end_date;
            }
        }
    }
    deadline = formatDate(new Date(latestEndDate));
    console.log(deadline);
    $("#fastestStartDate").text(new Date(fastestStartDate).toLocaleDateString());
    $("#latestEndDate").text(new Date(latestEndDate).toLocaleDateString());

    const today = new Date(data[0].current_date);
    today.setHours(0,0,0,0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

    // 시작일과 종료일은 'YYYY-MM-DD' 형식의 문자열로 가정
    const startDate = new Date(fastestStartDate);
    startDate.setHours(0,0,0,0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

    const endDate = new Date(latestEndDate);
    endDate.setHours(0,0,0,0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

    var diffStart = (today - startDate) / (1000 * 60 * 60 * 24); // 오늘 날짜와 시작일 사이의 차이를 일 단위로 계산
    var diffEnd = (today - endDate) / (1000 * 60 * 60 * 24); // 오늘 날짜와 종료일 사이의 차이를 일 단위로 계산

    $("#startDDay").css("color", "");
    $("#endDDay").css("color", "");

    if(diffStart > 0) {
        $("#startDDay").text("D + " + diffStart);
    } else if(diffStart === 0) {
        $("#startDDay").text("D - day");
    } else {
        diffStart *= -1;
        $("#startDDay").text("D - " + diffStart);
    }

    if(diffEnd > 0) {
        $("#endDDay").css("color", "#FF4D4D").css("font-weight", "bold").text("D + " + (diffEnd)).append(" 초과");
    } else if(diffEnd === 0) {
        $("#endDDay").text("D - day");
    } else {
        diffEnd *= (-1);
        $("#endDDay").text("D - " + diffEnd);
    }

    totalDate = Math.floor(
        Math.abs((new Date(latestEndDate) - new Date(fastestStartDate)) / (1000 * 60 * 60 * 24)) + 1
    );

    var mouseover = function (d) {
        var subgroupId = d.version_id;
        var subgroupName = d.version_name;
        var subgroupValue = new Date(d.start_date).toLocaleDateString() + " ~ " + new Date(d.end_date).toLocaleDateString();
        tooltip.html("버전명: " + subgroupName + "<br>" + "기간: " + subgroupValue).style("opacity", 1);

        d3.selectAll(".myWave").style("opacity", 0.2);
        d3.selectAll(".myStr").style("opacity", 0.2);
        d3.selectAll(".wave-" + subgroupId).style("opacity", 1);
    };

    var mousemove = function (d) {
        tooltip.style("left", d3.mouse(this)[0] + 120 + "px").style("top", d3.mouse(this)[1] + 150 + "px");
    };

    var mouseleave = function (d) {
        tooltip.style("opacity", 0);
        d3.selectAll(".myStr").style("opacity", 1);
        d3.selectAll(".myWave").style("opacity", 1);
    };

    for (sectionIndx = i = 1, ref = numSections; 1 <= ref ? i <= ref : i >= ref; sectionIndx = 1 <= ref ? ++i : --i) {
        arcStartRad = percToRad(totalPercent);
        arcEndRad = arcStartRad + percToRad(sectionPerc);
        totalPercent += sectionPerc;
        startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
        endPadRad = sectionIndx === numSections ? 0 : padRad / 2;
        versionId = data[sectionIndx - 1].version_id;
        versionName = data[sectionIndx - 1].version_name;

        var sectionData = data[sectionIndx - 1];

        var arc = d3
            .arc()
            .outerRadius(radius - chartInset)
            .innerRadius(radius - chartInset - barWidth)
            .startAngle(arcStartRad + startPadRad)
            .endAngle(arcEndRad - endPadRad);

        var section = chart.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionId);

        section
            .data([sectionData])
            .enter()
            .append("g")
            .attr("class", "arc chart-color" + sectionIndx + " myWave wave-" + versionId)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .append("path")
            .attr("fill", function (d) {
                return dashboardColor.projectProgressColor[(sectionIndx - 1) % data.length];
            })
            .attr("stroke", "white")
            .style("stroke-width", "0.4px")
            .attr("d", arc);

        chart
            .selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionId)
            .append("text")
            .attr("class", "no-select")
            .text(function (d) {
                return getStrLimit(d.version_name, 9);
            })
            .attr("x", function (d) {
                return arc.centroid(d)[0];
            })
            .attr("y", function (d) {
                return arc.centroid(d)[1] + 2;
            })
            .style("font-size", "10px")
            .style("font-weight", "700")
            .attr("text-anchor", "middle");
    }

    Needle = (function () {
        function Needle(len, radius1) {
            this.len = len;
            this.radius = radius1;
        }

        Needle.prototype.drawOn = function (el, perc) {
            el.append("circle")
                .attr("class", "needle-center")
                .attr("cx", 0)
                .attr("cy", -10)
                .attr("r", this.radius)
                .attr("stroke", "white")
                .style("stroke-width", "0.3px");
            return el
                .append("path")
                .attr("class", "needle")
                .attr("d", this.mkCmd(perc))
                .attr("stroke", "white")
                .style("stroke-width", "0.3px");
        };

        Needle.prototype.animateOn = function (el, perc) {
            var self;
            self = this;
            return el
                .selectAll(".needle")
                .transition()
                .delay(500)
                .ease(d3.easeElasticOut)
                .duration(3000)
                .attrTween("progress", function () {
                    return function (percentOfPercent) {
                        var progress;
                        progress = percentOfPercent * perc;
                        return d3.select(".needle").attr("d", self.mkCmd(progress));
                    };
                });
        };

        Needle.prototype.mkCmd = function (perc) {
            var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
            thetaRad = percToRad(perc / 2);
            centerX = 0;
            centerY = -10;
            topX = centerX - this.len * Math.cos(thetaRad);
            topY = centerY - this.len * Math.sin(thetaRad);
            leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
            leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
            rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
            rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
            return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
        };

        return Needle;
    })();

    needle = new Needle(35, 3);

    needle.drawOn(chart, 0);

    var needleAngle = (diffStart+1) / totalDate;

    if (needleAngle > 1) {
        needleAngle = 1;
    }
    else if (needleAngle < 0) {
        needleAngle = 0;
    }

    needle.animateOn(chart, needleAngle);

    progressShow(today, startDate, endDate);
}

////////////////////
// 세번째 박스
////////////////////
function scatterChart(data) {
    console.log(data);
    var requirementDataCount = {};
    var relationIssueDataCount = {};

    data.forEach(jiraissue => {
        if(jiraissue.updated === null || jiraissue.updated === undefined) {
            return;
        }

        var updatedDate = jiraissue.updated.split('T')[0];
        // var updatedDate = jiraissue.updated;

        if (jiraissue.isReq === true) {
            if (!requirementDataCount[updatedDate]) {
                requirementDataCount[updatedDate] = 0;
            }
            requirementDataCount[updatedDate]++;
        } else {
            if (!relationIssueDataCount[updatedDate]) {
                relationIssueDataCount[updatedDate] = 0;
            }
            relationIssueDataCount[updatedDate]++;
        }
    });

    var requirementData = Object.keys(requirementDataCount).map(key => {
        var dateObj = new Date(key+'T00:00:00');
        return [dateObj, requirementDataCount[key]];
    });

    var relationIssueData = Object.keys(relationIssueDataCount).map(key => {
        var dateObj = new Date(key+'T00:00:00');
        return [dateObj, relationIssueDataCount[key]];
    });


    var dom = document.getElementById('scatter-chart-container');

    var myChart = echarts.init(dom, 'dark', {
        renderer: 'canvas',
        useDirtyRect: false
    });
    var app = {};

    var option;

    if ((requirementData && requirementData.length > 0) || (relationIssueData && relationIssueData.length > 0) ) {

        option = {
            aria: {
                show: true
            },
            legend: {
                data: ['요구사항' , '연결된 이슈'] // 여기에 실제 데이터 종류를 적어주세요
            },
            /*        toolbox: {
                        left: 'left',
                        feature: {
                            dataView: {},
                            saveAsImage: {},
                            dataZoom: {}
                        }
                    },*/
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: 'rgba(255,255,255,0.2)', // 라인 색상을 빨간색으로 변경
                        width: 1, // 라인 너비를 2로 변경
                        type: 'solid' // 라인 유형을 실선으로 변경
                    }
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255,255,255,0.2)', // 라인 색상을 빨간색으로 변경
                        width: 1, // 라인 너비를 2로 변경
                        type: 'solid' // 라인 유형을 실선으로 변경
                    }
                }
            },
            series: [
                {
                    name: '요구사항',
                    data: requirementData,
                    type: 'scatter',
                    symbol: 'diamond',
                    clip: false,  // clip 옵션 추가
                    label: {
                        emphasis: {
                            show: true,
                            color: '#FFFFFF'
                        }
                    },
                    symbolSize: function (val) {
                        var sbSize = 10;
                        if (val[1] > 10) {
                            sbSize = val[1] * 1.1;
                        }
                        return sbSize;
                    },
                    // 마감일 표현
                    markLine : {
                        silent: true,
                        symbol: 'none',
                        data : [{
                            xAxis : deadline // x축 날짜 지정
                        }],
                        lineStyle: {
                            color: 'red',
                            width: 2,
                            type: 'dashed'
                        },
                        label: {
                            formatter: '마감일 : {c}',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    }
                },
                {
                    name: '연결된 이슈',
                    data: relationIssueData,
                    type: 'scatter',
                    clip: false,  // clip 옵션 추가
                    label: {
                        emphasis: {
                            show: true,
                            color: '#FFFFFF'
                        }
                    },
                    symbolSize: function (val) {
                        var sbSize = 10;
                        if (val[1] > 10) {
                            sbSize = val[1] * 1.1;
                        }
                        return sbSize;
                    },
                    itemStyle: {
                        color: '#13de57'
                    },
                    // 마감일 표현
                    markLine : {
                        silent: true,
                        symbol: 'none',
                        data : [{
                            xAxis : deadline // x축 날짜 지정
                        }],
                        lineStyle: {
                            color: 'red',
                            width: 2,
                            type: 'dashed'
                        },
                        label: {
                            formatter: '마감일 : {c}',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    }
                }
            ],
            tooltip: {
                trigger: 'axis',
                position: 'top',
                borderWidth: 1,
                axisPointer: {
                    type: 'line',
                    label: {
                        formatter: function(params) {
                            return formatDate(new Date(params.value));
                        }
                    }
                }
            },
            backgroundColor: 'rgba(255,255,255,0)',
            animationDelay: function (idx) {
                return idx * 20;
            },
            animationDelayUpdate: function (idx) {
                return idx * 20;
            }
        };

        myChart.on('click', function (params) {
            console.log(params.data);
        });

    }
    else {
        option = {
            title: {
                text: '데이터가 없습니다',
                left: 'center',
                top: 'middle'
            },
            backgroundColor: 'rgba(255,255,255,0)',
        };
    }

    if (option && typeof option === 'object') {
        myChart.setOption(option, true);
    }

    window.addEventListener('resize', myChart.resize);
}

// 바차트
function combinationChart(pdServiceLink, pdServiceVersionLinks) {
    function combinationChartNoData() {

        $('#status-chart').html('데이터가 없습니다').css({
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center'
        });

        // c3.generate({
        //     bindto: '#combination-chart',
        //     data: {
        //         x: 'x',
        //         columns: [],
        //         type: 'bar',
        //         types: {},
        //     },
        // });
    }

    if(pdServiceLink === "" || pdServiceVersionLinks === "") {
        combinationChartNoData();
        return;
    }

    const url = new UrlBuilder()
        .setBaseUrl('/auth-user/api/arms/analysis/time/daily-requirements-jira-issue-statuses')
        .addQueryParam('pdServiceLink', pdServiceLink)
        .addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
        .addQueryParam('메인그룹필드', "pdServiceVersion")
        .addQueryParam('하위그룹필드들', "assignee.assignee_accountId.keyword,assignee.assignee_displayName.keyword")
        .addQueryParam('크기', 1000)
        .addQueryParam('하위크기', 1000)
        .addQueryParam('컨텐츠보기여부', true)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                if ((Array.isArray(data) && data.length === 0) ||
                    (typeof data === 'object' && Object.keys(data).length === 0) ||
                    (typeof data === 'string' && data === "{}")) {
                    combinationChartNoData();
                    return;
                }

                const issueStatusTypesSet = new Set();
                for (const day in data) {
                    for (const status in data[day].statuses) {
                        //console.log('status ', status);
                        issueStatusTypesSet.add(status);
                    }
                }
                const issueStatusTypes = [...issueStatusTypesSet];

                let columnsData = [];
                let dayTotal = {};

                issueStatusTypes.forEach((status) => {
                    const columnData = [status];
                    for (const day in data) {
                        const count = data[day].statuses[status] || 0;
                        columnData.push(count);
                        dayTotal[day] = (dayTotal[day] || 0) + count;

                        //console.log(`Day: ${day}, Status: ${status}, Count: ${count}, dayTotal: ${dayTotal[day]}`);
                    }
                    columnsData.push(columnData);
                });

                // 차트 x축 날짜값 포맷팅
                let keys = Object.keys(data).map(key => {
                    let [year, month, day] = key.split('-');
                    return `${month}/${day}`;
                });

                const chart = c3.generate({
                    bindto: '#status-chart',
                    data: {
                        x: 'x',
                        columns: [
                            ['x', ...keys],
                            ...columnsData,
                            ['전체이슈', ...Object.keys(dayTotal).map(day => dayTotal[day])],
                        ],
                        type: 'bar',
                        types: {
                            '전체이슈': 'area',
                        },
                    },
                    color: {
                        pattern: dashboardColor.accumulatedIssueStatusColor,
                    },
                    onrendered: function() {
                        d3.selectAll('.c3-line, .c3-bar, .c3-arc')
                            .style('stroke', 'white')
                            .style('stroke-width', '0.3px');
                    },
                    axis: {
                        x: {
                            type: 'category',
                        },
                    },
                    tooltip: {
                        format: {
                            title: function (index) {
                                const day = Object.keys(data)[index];
                                const total = dayTotal[day];
                                return `${day} | Total : ${total}`;
                            },
                        },
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                            // 기본 툴팁 생성
                            let tooltipHtml = this.getTooltipContent.apply(this, arguments);
                            // 툴팁 HTML 파싱
                            let parsedHtml = $.parseHTML(`<div>${tooltipHtml}</div>`);
                            // '전체이슈' 행 제거
                            $(parsedHtml).find('tr').each(function() {
                                if ($(this).find('td').first().text() === '전체이슈') {
                                    $(this).remove();
                                }
                            });
                            // 다시 HTML 문자열로 변환
                            return $(parsedHtml).html();
                        }
                    }
                });

                $(document).on('click', '#status-chart .c3-legend-item', function () {
                    const id = $(this).text();
                    const isHidden = $(this).hasClass('c3-legend-item-hidden');

                    for (const day in data) {
                        const docCount = data[day].statuses[id] || 0;

                        if (isHidden) {
                            dayTotal[day] -= docCount;
                        } else {
                            dayTotal[day] += docCount;
                        }
                    }
                });

                let isGrouped = false; // 차트 그룹화 여부

                $('#status-chart-button').on('click', function() {
                    if (isGrouped) {
                        // 그룹화 해제
                        chart.groups([]);
                        $(this).text('그룹화 적용');
                    } else {
                        // 그룹화
                        chart.groups([issueStatusTypes]);
                        $(this).text('그룹화 해제');
                    }
                    isGrouped = !isGrouped;
                });
            }
        }
    });
}

////////////////////
// 네번째 박스
////////////////////

function getRelationJiraIssueByPdServiceAndVersions(pdServiceLink, pdServiceVersions) {
    $.ajax({
        url: "/auth-user/api/arms/analysis/time/pdService/pdServiceVersions",
        type: "GET",
        data: {"pdServiceLink": pdServiceLink, "pdServiceVersionLinks": pdServiceVersions},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        async: true,
        statusCode: {
            200: function (data) {
                console.log(data);
                statusTimeline(data);
                sevenTimeline(data);
                scatterChart(data);

                globalJiraIssue = data;

            }
        }
    });

}

function calendarHeatMap(pdServiceLink, pdServiceVersions) {

    $('#calendar_yearview_blocks_chart_1 svg').remove();
    $('#calendar_yearview_blocks_chart_2 svg').remove();

    $.ajax({
        url: "/auth-user/api/arms/analysis/time/heatmap",
        type: "GET",
        data: {"pdServiceLink": pdServiceLink, "pdServiceVersionLinks": pdServiceVersions},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        async: true,
        statusCode: {
            200: function (data) {
                console.log(data);
                $(".update-title").show();

                $('#calendar_yearview_blocks_chart_1').calendar_yearview_blocks({
                    data: JSON.stringify(data.requirement),
                    start_monday: true,
                    always_show_tooltip: true,
                    month_names: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],
                    day_names: ['mo', 'wed', 'fri', 'sun'],
                    colors: data.requirementColors
                });

                $('#calendar_yearview_blocks_chart_2').calendar_yearview_blocks({
                    data: JSON.stringify(data.relationIssue),
                    start_monday: true,
                    always_show_tooltip: true,
                    month_names: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
                    day_names: ['mo', 'wed', 'fri', 'sun'],
                    colors: data.relationIssueColors
                });

                d3.select("#heatmap-body").style("overflow-x","scroll");
            }
        }
    });

}

////////////////////
// 다섯번째 박스
////////////////////

function statusTimeline(data) {

    // 필요한 데이터만 추출
    var extractedData = extractDataForStatusTimeline(data);

    // 버전 별로 그룹화
    var groupedDataByVersion = groupingByVersion(extractedData);

    // 데이터 포맷팅
    var relatedIssues = dataFormattingForStatusTimeline(groupedDataByVersion);

    // 요소 호버
    $(".reqNode").hover(
        function() {

            $(this).find('title').text('');
            var classValue = $(this).attr('class');
            var key = classValue.split(" ").pop(); // 요구사항 이슈 키

            $("." + key).css("opacity", "0.7");

            var tooltip = $('<div id="stlTooltip"></div>');
            tooltip.html(`
                <table class="stltable">
                    <tr>
                        <th>하위 이슈</th>
                        <th>상태</th>
                    </tr>
                    ${relatedIssues[key] ? relatedIssues[key] : '<tr><td colspan="2">데이터가 없습니다</td></tr>'}
                </table>
            `);

            tooltip.css({
                "visibility": "visible",
                "opacity": "1",
                "position": "absolute",
                "left": event.pageX + 10,
                "top": event.pageY + 10,
            });

            $("body").append(tooltip);

        }, function() {
            $(".reqNode").css("opacity", "1");
            $("#stlTooltip").remove();

        }
    );
}

function extractDataForStatusTimeline(data){

    var extractedData = [];

    data.forEach(item => {
        var extractedItem = {
            version: item.pdServiceVersion,
            issueKey: item.key,
            isReq: item.isReq,
            parentReqKey: item.parentReqKey,
            createdDate: new Date(Date.parse(item.created)),
            summary: item.summary,
            status: item.status.status_name
        };
        extractedData.push(extractedItem);
    });

    return extractedData;
}

function groupingByVersion(data) {

    var groupedData = data.reduce((result, item) => {
        var pdServiceVersion = item.version;
        if (!result[pdServiceVersion]) {
            result[pdServiceVersion] = [];
        }
        result[pdServiceVersion].push(item);
        return result;
    }, {});

    return groupedData;
}

function dataFormattingForStatusTimeline(data) {

    var statusTimelineData = {};
    var formattedData = [];
    var relatedIssues = {};

    for (const version in data) {

        var reqIssue = data[version].filter(item => item.isReq === true); // 요구사항 이슈만 필터링
        var versionData = convertVersionIdToTitle(version); // text (버전)
        var reqIssues = []; // children 전체

        reqIssue.forEach(reqIssue => {

            // children 요소 중 하나
            var req = {
                text: reqIssue.summary + " | " + reqIssue.status,
                id: reqIssue.issueKey
            };

            reqIssues.push(req);

            // 호버 시 하위 이슈 볼 수 있도록 데이터 포맷팅
            var relatedIssue = data[version].filter(item => item.parentReqKey === reqIssue.issueKey);

            relatedIssue.forEach(relatedIssue => {

                if (!relatedIssues[relatedIssue.parentReqKey]) {
                    relatedIssues[relatedIssue.parentReqKey] = '';
                }

                relatedIssues[relatedIssue.parentReqKey] += "<tr><td>" +
                    relatedIssue.summary +
                    "</td><td>" +
                    relatedIssue.status +
                    "</td></tr>";
            });
        });

        var totalData = {
            text: versionData,
            children: reqIssues
        };

        formattedData.push(totalData);
    }
    statusTimelineData.data = formattedData;

    $("#demo").timeline(statusTimelineData);
    console.log("연관 이슈 전체: ", relatedIssues);

    return relatedIssues;
}

////////////////////
// 여섯번째 박스
////////////////////
function sevenTimeline(data) {
    var sevenTimeLineDiv = document.getElementById("sevenTimeLine");
    sevenTimeLineDiv.innerHTML = "";

    if (typeof data === 'object' && Object.keys(data).length > 0) {
        //필요한 데이터만 추출
        var extractedData = extractDataForSevenTimeline(data);
        // 버전 별 그룹화
        var groupedData = groupingByVersion(extractedData);
        var myData = [];
        var myData = dataFormattingForSevenTimeLine(groupedData);
        TimelinesChart()('#sevenTimeLine')
            .width(1440)
            .maxHeight(3000)
            .maxLineHeight(40)
            .topMargin(40)
            .zQualitative(true)
            .data(myData)
            .refresh();
        $('#sevenTimeLineBody').css("overflow","scroll");
    } else {
        var pElement = document.createElement("p");
        pElement.textContent = "데이터가 없습니다.";
        sevenTimeLineDiv.appendChild(pElement);
    }
}
//  필요한 데이터만 추출
function extractDataForSevenTimeline(data){
    var extractedData = [];
    data.forEach(obj => {
        var extractedObj = {
            issueKey: obj.key,
            isReq: obj.isReq,
            parentReqKey: obj.parentReqKey,
            createdDate: new Date(Date.parse(obj.created)),
            resolutionDate: obj.resolutiondate ? obj.resolutiondate : new Date(),
            version: obj.pdServiceVersion
        };
        extractedData.push(extractedObj);
    });
    return extractedData;
}
// 버전 별 그룹화 하기
function groupDataByPdServiceVersion(data) {
    var extractedData = extractDataForSevenTimeline(data);
    var groupedData = extractedData.reduce((result, obj) => {
        var pdServiceVersion = obj.version;
        if (!result[pdServiceVersion]) {
            result[pdServiceVersion] = [];
        }
        result[pdServiceVersion].push(obj);
        return result;
    }, {});
    return groupedData;
}
// 차트에 맞게 데이터 변환 하기
function dataFormattingForSevenTimeLine(groupedByVersionData) {
    var formattedData = [];

    for (var version in groupedByVersionData) {
        var reqIssueData = groupedByVersionData[version].filter(data => data.isReq === true);

        reqIssueData.forEach(reqIssue => {
            var groupByReqIssueData = {
                group: reqIssue.issueKey,
                data: []
            };

            var childData = groupedByVersionData[version].filter(issue => issue.parentReqKey === groupByReqIssueData.group);
            groupByReqIssueData.data.push({
                label: "요구사항 이슈",
                data: [{
                    timeRange: [reqIssue.createdDate, reqIssue.resolutionDate],
                    val: convertVersionIdToTitle(reqIssue.version)
                }]
            });
            childData.forEach(child => {
                groupByReqIssueData.data.push({
                    label: child.issueKey,
                    data: [{
                        timeRange: [child.createdDate, child.resolutionDate],
                        val: convertVersionIdToTitle(child.version)
                    }]
                });
            });
            formattedData.push(groupByReqIssueData);
        });
    }

    return formattedData;
}

function convertVersionIdToTitle(versionId) {
    if (versionListData.hasOwnProperty(versionId)) {
        var version = versionListData[versionId];
        return version.c_title;
    }
}

function candleStickChart() {
    console.log("candle stick");
    var dom = document.getElementById('candlestick-chart-container');
    var myChart = echarts.init(dom, 'dark', {
        renderer: 'canvas',
        useDirtyRect: false
    });
    var app = {};

    var option;

    option = {
        xAxis: {
            data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
        },
        yAxis: {},
        series: [
            {
                type: 'candlestick',
                data: [
                    [20, 34, 10, 38],
                    [40, 35, 30, 50],
                    [31, 38, 33, 44],
                    [38, 15, 5, 42]
                ]
            }
        ],
        tooltip: {
            trigger: 'axis',
            position: 'top',
            borderWidth: 1,
            axisPointer: {
                type: 'cross'
            }
        },
        backgroundColor: 'rgba(255,255,255,0)',
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

////////////////////
// 레이더 차트
////////////////////
/*
function radarChart(pdServiceId, pdServiceVersionList) {

    var maxCount;
    var versionText = [];
    var reqCount = [];

    var _url = "/auth-user/api/arms/dashboard/normal/"+pdServiceId;
    $.ajax({
        url: _url,
        type: "GET",
        data: { "서비스아이디" : pdServiceId,
            "메인그룹필드" : "pdServiceVersion",
            "isReq" : true,
            "컨텐츠보기여부" : false,
            "크기" : 1000
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        async: false,
        statusCode: {
            200: function (data) {
                maxCount = data.전체합계;
                var result = data.검색결과.group_by_pdServiceVersion;

                result.forEach(item => {
                    if (versionListData[item.필드명]) {
                        versionListData[item.필드명].totalCount = item.개수;
                    }
                });

                Object.values(versionListData).forEach(item => {
                    var version = {};
                    version.text = item.c_title;
                    version.max = maxCount;

                    versionText.push(version);
                    reqCount.push(item.totalCount);
                });
            }
        }
    });

    var chart = echarts.init(document.getElementById('radar-chart-main'));

    chart.setOption({
        color: ['#E49400'],
        dataZoom: [
            { // The first dataZoom component
                radiusAxisIndex: [0, 2] // Indicates that this dataZoom component
                // controls the first and the third radiusAxis
            }
        ],
        aria: {
            show: false
        },
        tooltip: {},
        legend: {
            data: [{
                icon: 'circle',
                name: '요구사항'
            }],
            textStyle: {
                color: 'white', // 원하는 텍스트 색상으로 변경합니다.
                fontSize: 14
            }
        },
        radar: {
            radius: [0, '50%'],
            triggerEvent: true,
            // shape: 'circle',
            indicator: versionText,
            name: {
                rotate: 45, // 텍스트를 45도로 회전시킵니다.
                position: 'outside', // 텍스트를 레이더 영역 내부에 위치시킵니다.
                color: '#ffffff',
                formatter: function(text) {
                    // 줄바꿈을 위해 '\n' 문자를 삽입합니다.
                    var wrappedValue = text.replace(/(.{12})/g, '$1\n');  // 10자마다 줄바꿈
                    return '[' + wrappedValue + ']';
                },
                rich: {
                    value: {
                        align: 'left',
                        color: '#ffffff',
                        lineHeight: 10  // 줄 간격을 설정합니다.
                    }
                }
            }
        },
        series: [{
            name: '',
            type: 'radar',
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        color: 'white' // 원하는 텍스트 색상으로 변경합니다.
                    }
                }
            },
            itemStyle: {
                borderWidth: 2,
                borderColor: '#fff'
            },
            // areaStyle: {normal: {}},
            data : [
                {
                    value: reqCount,
                    name: '요구사항'
                }
            ],
            symbol: 'circle',
            symbolSize: 7,
            symbolRotate: function(value, params) {
                return ~~(360 * Math.random());
            }
        }
        ]
    });
    window.addEventListener('resize', function () {
        chart.resize();
    });
}
*/