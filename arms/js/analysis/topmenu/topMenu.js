// 최상단 세팅
function getReqAndLinkedIssueData(pdservice_id, pdServiceVersionLinks) {
    $.ajax({
        url: "/auth-user/api/arms/analysis/resource/workerStatus/"+pdservice_id,
        type: "GET",
        data: {
            "pdServiceLink" : pdservice_id,
            "pdServiceVersionLinks" : pdServiceVersionLinks,
            "메인그룹필드" : "isReq",
            "하위그룹필드들": "assignee.assignee_emailAddress.keyword",
            "컨텐츠보기여부" : true,
            "크기" : 1000,
            "하위크기": 1000
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //전체 요구사항, 연결이슈
                let all_req_count = 0;
                let all_linkedIssue_subtask_count = 0;
                //담당자존재 요구사항, 연결이슈
                let assignedReqSum = 0;
                let assignedSubtaskSum = 0;
                //담당자 미지정 요구사항,연결이슈
                let no_assigned_req_count = 0;
                let no_assigned_linkedIssue_subtask_count =0;

                if (data["전체합계"] === 0) {
                    alert("작업자 업무 처리현황 데이터가 없습니다.");
                    수치_초기화();
                } else {
                    let isReqGrpArr = data["검색결과"]["group_by_isReq"];
                    isReqGrpArr.forEach((elementArr,index) => {
                        if(elementArr["필드명"] == "true") {
                            all_req_count = elementArr["개수"];
                            let tempArrReq= elementArr["하위검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                            tempArrReq.forEach(e => {
                                assignedReqSum+=e["개수"];
                            });
                            no_assigned_req_count = all_req_count - assignedReqSum;
                        }
                        if(elementArr["필드명"] == "false") {
                            all_linkedIssue_subtask_count = elementArr["개수"];
                            let tempArrReq= elementArr["하위검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                            tempArrReq.forEach(e => {
                                assignedSubtaskSum+=e["개수"];
                            });
                            no_assigned_linkedIssue_subtask_count = all_linkedIssue_subtask_count - assignedSubtaskSum;
                        }
                    });
                    // 총 요구사항 및 연결이슈 수
                    $('#total_req_count').text(all_req_count);
                    $('#total_linkedIssue_subtask_count').text(all_linkedIssue_subtask_count);

                    // 담당자 지정 - 요구사항 및 연결이슈
                    req_count = assignedReqSum;
                    $('#req_count').text(assignedReqSum);
                    linkedIssue_subtask_count = assignedSubtaskSum;
                    $('#linkedIssue_subtask_count').text(assignedSubtaskSum);

                    // 담당자 미지정 - 요구사항 및 연결이슈
                    $('#no_assigned_req_count').text(no_assigned_req_count);
                    $('#no_assigned_linkedIssue_subtask_count').text(no_assigned_linkedIssue_subtask_count);

                }
                // 작업자수 및 평균계산
                getAssigneeInfo(pdservice_id,pdServiceVersionLinks);
                getExpectedEndDate(pdservice_id,pdServiceVersionLinks, all_req_count);
            },
            error: function (e) {
                jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
            }
        }
    });
}

function getAssigneeInfo(pdservice_id, pdServiceVersionLinks) {
    mailAddressList = [];
    $.ajax({
        url: "/auth-user/api/arms/analysis/resource/workerStatus/"+pdservice_id,
        type: "GET",
        data: {
            "pdServiceLink": pdservice_id,
            "pdServiceVersionLinks": pdServiceVersionLinks,
            "메인그룹필드": "assignee.assignee_emailAddress.keyword",
            "컨텐츠보기여부": true,
            "크기": 1000,
            "하위크기": 1000
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                let assigneesArr = data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];

                console.log(" [ topMenu :: getAssigneeInfo ] :: assigneesArr -> ");
                console.log(assigneesArr);

                if (assigneesArr.length > 0) {
                    personData = assigneesArr;
                }

                //제품(서비스)에 투입된 총 인원수
                resource_count = assigneesArr.length;
                if (data["전체합계"] === 0) { //담당자(작업자) 없음.
                    $('#resource_count').text("-");
                    $('#avg_req_count').text("-");
                    $('#avg_linkedIssue_count').text("-");
                    //refreshDetailChart(); //상세 바차트 초기화
                } else {
                    //필요시 사용
                    assigneesArr.forEach((element,idx) =>{
                        mailAddressList.push(element["필드명"]);
                    });
                    $('#resource_count').text(resource_count);
                    $('#avg_req_count').text((req_count/resource_count).toFixed(1));
                    $('#avg_linkedIssue_count').text((linkedIssue_subtask_count/resource_count).toFixed(1));
                }
                getReqInActionCount(pdservice_id,pdServiceVersionLinks);
                //모든작업자 - 상세차트
                //drawDetailChartForAll(pdservice_id, pdServiceVersionLinks,mailAddressList);
            },
            error: function (e) {
                jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
            }
        }
    });
}

function getReqInActionCount(pdService_id, pdServiceVersionLinks) {
    $.ajax({
        url: "/auth-user/api/arms/analysis/resource/reqInAction/"+pdService_id,
        type: "GET",
        data: { "서비스아이디" : pdService_id,
            "pdServiceVersionLinks" : pdServiceVersionLinks,
            "isReq" : false,
            "메인그룹필드" : "parentReqKey",
            "컨텐츠보기여부" : true,
            "크기" : 1000},
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                req_in_action = data["parentReqCount"];
                let req_in_wait_count = req_count-req_in_action;
                if (req_in_action === "") {
                    $("#req_in_action_count").text("-");
                    $('#linkedIssue_subtask_count_per_req_in_action').text("-");
                } else {
                    if(req_in_action === 0) {
                        $('#linkedIssue_subtask_count_per_req_in_action').text("-");
                    } else {
                        $("#req_in_action_count").text(req_in_action);   //진행중 요구사항
                        $("#req_in_action_avg").text((resource_count !== 0 ? (req_in_action/resource_count).toFixed(1) : "-"));
                        $("#req_in_wait_count").text(req_in_wait_count); //작업대기 요구사항
                        $("#req_in_wait_avg").text((resource_count !== 0 ? (req_in_wait_count/resource_count).toFixed(1) : "-"));
                        $('#linkedIssue_subtask_count_per_req_in_action').text((linkedIssue_subtask_count/req_in_action).toFixed(1));
                    }
                }
                // 리소스-요구사항-일정 레이더차트
                getScheduleToDrawRadarChart(pdService_id,pdServiceVersionLinks);
            },
            error: function (e) {
                jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
            }
        }
    });
}

function getScheduleToDrawRadarChart(pdservice_id, pdServiceVersionLinks) {

    let 선택한_버전_세트 = new Set();
    pdServiceVersionLinks.split(",").forEach( e => 선택한_버전_세트.add({c_id:e}));

    if(선택한_버전_세트.size !== 0) {
        $.ajax({
            url: "/auth-user/api/arms/pdServiceVersion/getVersionListBy.do",
            data: { c_ids: pdServiceVersionLinks},
            type: "GET",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (json) {

                    let 버전목록 = json;
                    let 가장이른시작날짜;
                    let 가장늦은종료날짜;
                    if(버전목록.length !== 0) {
                        for (let i=0; i<버전목록.length; i++) {
                            if (i === 0) {
                                가장이른시작날짜 = 버전목록[i].c_pds_version_start_date;
                                가장늦은종료날짜 = 버전목록[i].c_pds_version_end_date;
                            } else {
                                if(버전목록[i]["c_pds_version_start_date"] < 가장이른시작날짜) {
                                    가장이른시작날짜 = 버전목록[i]["c_pds_version_start_date"];
                                }
                                if(버전목록[i]["c_pds_version_end_date"] > 가장늦은종료날짜) {
                                    가장늦은종료날짜 = 버전목록[i]["c_pds_version_end_date"];
                                }
                            }
                        }
                    }

                    if(가장이른시작날짜 ==="start") { 가장이른시작날짜 = new Date(); }
                    if(가장늦은종료날짜 ==="end") {가장늦은종료날짜 = new Date(); }


                    let objectiveDateDiff = getDateDiff(가장이른시작날짜, 가장늦은종료날짜);
                    let currentDateDiff = getDateDiff(가장이른시작날짜, new Date());

                    total_days_progress = currentDateDiff;

                    let 목표데이터_배열 = [resource_count, req_count, objectiveDateDiff];
                    let 현재진행데이터_배열 = [resource_count, req_in_action, currentDateDiff];
                    let dateDiff = Math.abs(objectiveDateDiff - currentDateDiff).toFixed(0);
                    $("#progressDateRate").text((currentDateDiff*100/(objectiveDateDiff === 0 ? 1 : objectiveDateDiff)).toFixed(0)+"%");
                    if(objectiveDateDiff>= currentDateDiff) {
                        $("#remaining_days").text("D-"+dateDiff);
                    } else {
                        $("#remaining_days").text("D+"+dateDiff);
                        $("#remaining_days").css("color", "rgb(219,42,52)");
                    }
                    drawBasicRadar("radarPart",목표데이터_배열, 현재진행데이터_배열);
                }
            }
        });
    }

}

const getDateDiff = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);

    const diffDate = date1.getTime() - date2.getTime();

    return +(Math.abs(diffDate / (1000 * 60 * 60 * 24)).toFixed(0)); // 밀리세컨 * 초 * 분 * 시 = 일

}

function 수치_초기화() {
    req_count = 0;
    linkedIssue_subtask_count = 0;
    resource_count = 0;
    req_in_action = 0;
    total_days_progress = undefined;
    $("#total_req_count").text("-");       // 총 요구사항 수(미할당포함)
    $("#no_assigned_req_count").text("-"); // 미할당 요구사항 수
    $("#req_count").text("-");             // 작업 대상 요구사항 수
    $("#req_in_action_count").text("-");   // 작업중 요구사항

    $("#total_linkedIssue_subtask_count").text("-");       //연결이슈 수
    $("#no_assigned_linkedIssue_subtask_count").text("-"); //미할당 연결이슈 수
    $("#linkedIssue_subtask_count_per_req_in_action").text("-"); // 작업중 요구사항에 대한 연결이슈 평균

    $("#resource_count").text("-");        // 작업자수
    $("#req_in_action_avg").text("-");     // 작업중 요구사항 평균
    $("#avg_linkedIssue_count").text("-"); // 연결이슈 평균

    let radarChart = echarts.getInstanceByDom(document.getElementById("radarPart"));
    if(radarChart) { radarChart.dispose(); }
}

async function getExpectedEndDate(pdServiceLink, pdServiceVersionLinks, all_req_count) {
    $("#expected_end_date").text("").css("color", "");

    let totalDaysProgress = await waitForTotalDaysProgress();

    const url = new UrlBuilder()
        .setBaseUrl("/auth-user/api/arms/analysis/time/normal-version/resolution")
        .addQueryParam("pdServiceLink", pdServiceLink)
        .addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
        .addQueryParam("isReqType", "REQUIREMENT")
        .addQueryParam("resolution", "resolutiondate")
        .addQueryParam("메인그룹필드", "isReq")
        .addQueryParam("크기", 1000)
        .addQueryParam("컨텐츠보기여부", true)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: async function (data) {
                console.log("[ topMenu :: getExpectedEndDate ] :: Resolution 개수 확인 = " + data.전체합계);
                console.log("[ topMenu :: getExpectedEndDate ] :: 전체 요구사항 개수 확인 = " + all_req_count);

                if (data.전체합계 !== 0) {
                    let workingRatio = (data.전체합계 / all_req_count) * 100;
                    if (all_req_count === data.전체합계) {
                        $("#expected_end_date").text("작업 완료");
                    }
                    else {
                        console.log("totalDaysProgress : " + totalDaysProgress);
                        let result = Math.abs((100 / workingRatio) * totalDaysProgress).toFixed(0);

                        $("#expected_end_date").text(addDaysToDate(result));
                    }
                }
                else {
                    $("#expected_end_date").text("예측 불가").css("color", "red");
                }
            }
        }
    });

}

function waitForTotalDaysProgress() {
    return new Promise(resolve => {
        let intervalId = setInterval(() => {
            if (total_days_progress !== undefined) {
                clearInterval(intervalId);
                resolve(total_days_progress);
            }
        }, 100);  // 100ms마다 globalDeadline 값 확인
    });
}

function addDaysToDate(daysToAdd) {
    var currentDate = new Date(); // 현재 날짜 가져오기
    var targetDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000)); // 대상 날짜 계산

    // 대상 날짜를 년, 월, 일로 분리
    var year = targetDate.getFullYear();
    var month = targetDate.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함
    var day = targetDate.getDate();

    return year + "년 " + month + "월 " + day + "일"; // 결과 반환
}
