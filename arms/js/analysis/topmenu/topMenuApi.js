var TopMenuApi = (function () {
    "use strict";

    /*
    * TopMenu에서 사용하는 변수 정리
    * */
    // MySQL - 요구사항(DB)의 상태
    var req_state_data = {
        "total" : 0,    // 총합
        "folder" : 0,   // 폴더타입
        "not-open" : 0, // 열림 제외(진행중, 해결됨, 닫힘)
        "resolved-and-closed" : 0, // 해결됨+닫힘
        "open" : 0,        // 열림
        "in-progress" : 0, // 진행중
        "resolved" : 0,    // 해결됨
        "closed" : 0       // 닫힘
    };
    // Version 시작일, 종료일
    var period_date = {
        "start_date" : null, //시작일(가장 이른 시작일)
        "end_date" : null    //종료일(가장 늦은 마감일)
    };

    // 요구사항등록으로 생성된 요구사항 이슈 (req)
    // 생성된 요구사항이슈에 연결한 연결이슈 또는 생성한 하위이슈(subtask)
    var issue = {
      "total": null,
      "req" : null,
      "subtask" : null
    };


    var resource = {
        "resource" : 0,   // 총 작업자수
        "req_total" : 0,  // 요구사항 이슈 총수
        "sub_total" : 0,  // 하위작업 이슈 총수
        "req_max" : null, // 1명이 맡은 가장 많은 요구사항 이슈 수
        "req_avg" : null, // 평균 맡고 있는 요구사항 이슈 ( req_total / resource)
        "req_min" : null, // 1명이 맡은 가장 적은 요구사항 이슈 수
        "sub_max" : null, // 1명이 가장 많은 하위작업 이슈를 갖는 정도
        "sub_avg" : null, // 평균 맡고 있는 하위작업 이슈 ( sub_total / resource)
        "sub_min" : null  // 1명이 맡은 가장 적은 하위작업 이슈 수
    };

    var expectedEndDate = {
        "text" : null,
        "css_color" : null
    };

    var pullTotalApi = function(pdService_id, pdServiceVersionLinks) {

        return reqStateData(pdService_id, pdServiceVersionLinks)
          .then(() => {
              return versionPeriod(pdServiceVersionLinks);
          })
          .then(() => {
              return reqAndSubtaskIssue(pdService_id, pdServiceVersionLinks);
          })
          .then(() => {
              return resourceInfo(pdService_id, pdServiceVersionLinks);
          });

    };

    var getReqProgress = function () {
        let state_data = getReqStateData();
        if (state_data["total"] !== 0 || !isNaN(state_data["total"])) {
            return (( state_data["resolved-and-closed"] / state_data["total"] ) * 100 ).toFixed(1);
        } else {
            return " - (invalid)";
        }
    }
    //////////////////////////////////
    // 요구사항(DB)의 상태 - Application
    //////////////////////////////////
    var setReqStateData = function (result) {
        req_state_data["total"] = (result["total"] ? result["total"] : 0);
        req_state_data["folder"] = (result["folder"] ? result["folder"] : 0);
        req_state_data["open"] = (result["open"] ? result["open"] : 0);
        req_state_data["in-progress"] = (result["in-progress"]  ? result["in-progress"] : 0);
        req_state_data["resolved"] = (result["resolved"] ? result["resolved"] : 0);
        req_state_data["closed"] = (result["closed"] ? result["closed"] : 0);
        req_state_data["not-open"] = result["total"] - req_state_data["open"];
        req_state_data["resolved-and-closed"] = req_state_data["resolved"] + req_state_data["closed"];
    };

    var getReqStateData = function () {
        return req_state_data;
    };

    //완료
    var reqStateData = function (pdService_id, pdServiceVersionLinks) {
        return new Promise((resolve, reject) => {
            let reqAddUrl = "/T_ARMS_REQADD_"+ pdService_id +"/getReqAddListByFilter.do?";

            $.ajax({
                url: "/auth-user/api/arms/analysis/top-menu" +reqAddUrl,
                type: "GET",
                data: {	pdServiceId: pdService_id, pdServiceVersionLinks: pdServiceVersionLinks },
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                progress: true,
                statusCode: {
                    200: function (result) {
                        console.log("[ topMenuApi :: reqStateData ] :: result");
                        console.log(result);
                        setReqStateData(result);
                        resolve();
                    }
                }
            });
        });
    };

    //////////////////////////////////
    // 버전 기간 - Application
    //////////////////////////////////
    var versionPeriod = function (pdServiceVersionLinks) {
        return new Promise((resolve, reject) => {
            if(pdServiceVersionLinks && pdServiceVersionLinks.length > 0) {
                $.ajax({
                    url: "/auth-user/api/arms/pdServiceVersion/getVersionListBy.do",
                    data: {c_ids: pdServiceVersionLinks},
                    type: "GET",
                    contentType: "application/json;charset=UTF-8",
                    dataType: "json",
                    progress: true,
                    statusCode: {
                        200: function (result) {
                            console.log("[ topMenuApi :: versionPeriod ] :: result");
                            console.log(result);
                            let 버전목록 = result;
                            let 가장이른시작날짜;
                            let 가장늦은종료날짜;
                            if(버전목록.length !== 0) {
                                for (let i=0; i<버전목록.length; i++) {
                                    let today = new Date();
                                    if(버전목록[i]["c_pds_version_start_date"]==="start") {
                                        버전목록[i]["c_pds_version_start_date"] = today;
                                    }
                                    if(버전목록[i]["c_pds_version_end_date"] ==="end") {
                                        버전목록[i]["c_pds_version_end_date"] = today;
                                    }

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

                            setVersionPeriod(가장이른시작날짜, 가장늦은종료날짜);
                            resolve();
                        }
                    }
                });
            }
        });
    };

    var setVersionPeriod = function (earliestDate, latestDate) {
        period_date["start_date"] = earliestDate;
        period_date["end_date"] = latestDate;
    };

    var getVersionPeriod = function () {
        return period_date;
    };

    ///////////////////////////////////////
    // 요구사항 및 연결&하위 이슈 - Application
    ///////////////////////////////////////
    var reqAndSubtaskIssue = function (pdService_id, pdServiceVersionLinks) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/auth-user/api/arms/analysis/top-menu/issue/reqAndSubtask/" + pdService_id,
                type: "GET",
                data: { pdServiceVersionLinks: pdServiceVersionLinks },
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                progress: true,
                statusCode: {
                    200: function(result) {
                        console.log("[ topMenuApi :: reqAndSubtaskIssue ] :: result");
                        console.log(result);
                        setReqAndSubtaskIssue(result);
                        resolve();
                    }
                }
            });
        });
    };

    var setReqAndSubtaskIssue = function (result) {
        issue["total"] = (result["total"] !== null ? result["total"] : 0);
        issue["req"] = (result["req"] !== null ? result["req"] : 0);
        issue["subtask"] = (result["subtask"] !== null ? result["subtask"] : 0);
    };

    var getReqAndSubtaskIssue = function () {
        return issue;
    };

    var resourceInfo = function (pdservice_id, pdServiceVersionLinks) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/auth-user/api/arms/analysis/top-menu/resourceInfo/" + pdservice_id,
                type: "GET",
                data: { pdServiceVersionLinks: pdServiceVersionLinks },
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                progress: true,
                statusCode: {
                    200: function(result) {
                        console.log("[ topMenuApi :: resourceInfo ] :: result");
                        console.log(result);
                        setResourceInfo(result);
                        resolve();
                    }
                }
            });
        });
    };

    var setResourceInfo = function (result) {
        resource["resource"] = result["resource"];
        resource["req_total"] = result["req"];
        resource["sub_total"] = result["subtask"];
        resource["req_max"] = result["req_max"];
        resource["req_avg"] = (result["resource"] !== 0 ? (result["req"] / result["resource"]).toFixed(1) : " - ");
        resource["req_min"] = result["req_min"];
        resource["sub_max"] = result["sub_max"];
        resource["sub_avg"] = (result["resource"] !== 0 ? (result["subtask"] / result["resource"]).toFixed(1) : " - ");
        resource["sub_min"] = result["sub_min"];
    };

    var getResourceInfo = function() {
        return resource;
    };

    function 톱메뉴_초기화() {
        $("#remaining_days").text(" - ");
        $("#progressDateRate").text(" - ");

        $("#req_count").text(" - ");
        $("#req_open").text(" - ");
        $("#req_in_progress").text(" - ");
        $("#req_resolved").text(" - ");
        $("#req_closed").text(" - ");

        $("#req_progress").text(""); // 진척도
        $("#req_progress_bar").text("");
        $("#req_progress_bar").css("width","0%");
        $("#req_completed").text(" - "); // 완료된_요구사항(resolved+closed)
        $("#req_total2").text("");

        $("#total_req_issue_count").text(" - ");  // 생성된 요구사항 이슈
        $("#no_assigned_req_issue_count").text(" - "); // 생성된 요구사항 이슈(미할당)
        $("#total_linkedIssue_subtask_count").text(" - "); //생성한 연결이슈
        $("#no_assigned_linkedIssue_subtask_count").text(" - "); //생성한 연결이슈(미할당)
        //전체 일정
        $("#start_date_summary").text(" - ");
        $("#end_date_summary").text(" - ");
        $("#expected_end_date").text(" - ").css("color", "");
        //작업자수
        $("#resource").text(" - ");
        $("#req_max").text(" - ");
        $("#req_avg").text(" - ");
        $("#req_min").text(" - ");
        $("#sub_max").text(" - ");
        $("#sub_avg").text(" - ");
        $("#sub_min").text(" - ");

        let radarChart = echarts.getInstanceByDom(document.getElementById("radarPart"));
        if(radarChart) { radarChart.dispose(); }
    }



    var getExpectedEndDate = function () {
        return expectedEndDate;
    }

    var setExpectedEndDate = function (result) {
        expectedEndDate["text"] = (result["text"] ? result["text"] : null);
        expectedEndDate["css_color"] = (result["css_color"] ? result["css_color"] : null);
    }

    var calExpectedEndDate = function (pdServiceLink, pdServiceVersionLinks, all_req_count, total_days_progress) {

        return new Promise((resolve) => {
            let totalDaysProgress = (total_days_progress ? total_days_progress : undefined);
            let resultData = {
                "text" : null,
                "css_color" : null
            };

            if(total_days_progress < 0) {
                resultData["text"] = "일정 시작일 전 입니다.";
                resultData["css_color"] = "rgb(164,198,255)";
                setExpectedEndDate(resultData);
                resolve();
            } else {
                const url = new UrlBuilder()
                  .setBaseUrl("/auth-user/api/arms/analysis/top-menu/normal-version/resolution")
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
                            console.log("[ topMenuAPI :: getExpectedEndDate ] :: 전체 할당된 요구사항 개수 = " + all_req_count);

                            if (data.전체합계 !== 0) {
                                let workingRatio = (data.전체합계 / all_req_count) * 100;
                                if (all_req_count === data.전체합계) {
                                    resultData["text"] = "작업_완료";
                                    resultData["css_color"] = "rgb(45, 133, 21)";

                                }
                                else {
                                    console.log("totalDaysProgress : " + totalDaysProgress);
                                    let result = Math.abs((100 / workingRatio) * totalDaysProgress).toFixed(0);
                                    resultData["text"] = addDaysToDate(result);
                                    resultData["css_color"] = "rgb(164,198,255)";
                                }
                            }
                            else {
                                resultData["text"] = "예측 불가.(완료 0)";
                                resultData["css_color"] = "rgb(219, 42, 52)";
                            }
                            setExpectedEndDate(resultData);
                            resolve();
                        }
                    }
                });
            }
        });


    };

    function addDaysToDate(daysToAdd) {
        var currentDate = new Date(); // 현재 날짜 가져오기
        var targetDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000)); // 대상 날짜 계산

        // 대상 날짜를 년, 월, 일로 분리
        var year = targetDate.getFullYear();
        var month = targetDate.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함
        var day = targetDate.getDate();

        return year + "년 " + month + "월 " + day + "일"; // 결과 반환
    }

    function 톱메뉴_세팅() {
        TopMenuApi.pullTotalApi(selectedPdServiceId, selectedVersionId)
          .then(() => {
              req_state = TopMenuApi.getReqStateData();
              period_info = TopMenuApi.getVersionPeriod();
              issue_info = TopMenuApi.getReqAndSubtaskIssue();
              resource_info = TopMenuApi.getResourceInfo();
              let today = new Date();
              console.log(today);
              console.log(period_info);
              let objectiveDateDiff = calDateDiff(period_info["start_date"], period_info["end_date"]);
              let currentDateDiff = calDateDiff(period_info["start_date"], today);

              console.log("톱메뉴_세팅 :: currentDateDiff => " + currentDateDiff);
              let 목표데이터_배열 = [resource_info["resource"], req_state["total"], objectiveDateDiff];
              let 현재진행데이터_배열 = [];
              if (currentDateDiff < 0) { // 시작일이 현재보다 미래인 경우
                  let abs_currentDateDiff = Math.abs(currentDateDiff);
                  
                  $("#remaining_days").text("시작 D-"+abs_currentDateDiff);
                  $("#remaining_days").css("color","rgb(164,198,255)");
                  $("#remaining_days").css("font-size","15px");
                  $("#progressDateRate").text("0%");

                  현재진행데이터_배열 = [resource_info["resource"], req_state["not-open"], currentDateDiff];
                  total_days_progress = -1;

              } else { // 시작일이 현재이거나 과거인 경우(현재 그대로 가능)
                  $("#progressDateRate").text((currentDateDiff*100/(objectiveDateDiff === 0 ? 1 : objectiveDateDiff)).toFixed(0)+"%");
                  let dateDiff = Math.abs(objectiveDateDiff - currentDateDiff).toFixed(0);
                  if(objectiveDateDiff>= currentDateDiff) {
                      $("#remaining_days").text("D-"+dateDiff);
                      $("#remaining_days").css("color","rgb(164,198,255)");
                      $("#remaining_days").css("font-size","20px");
                  } else {
                      $("#remaining_days").text("D+"+dateDiff);
                      $("#remaining_days").css("color", "rgb(219,42,52)");
                      $("#remaining_days").css("font-size","20px");
                  }
                  현재진행데이터_배열 = [resource_info["resource"], req_state["not-open"], currentDateDiff];
                  total_days_progress = currentDateDiff;
              }
              //레이더차트
              drawBasicRadar("radarPart",목표데이터_배열, 현재진행데이터_배열);
          })
          .then(() => {
              //범위현황
              $("#req_in_action_count").text(req_state["not-open"]);// 작업중
              $("#req_count").text(req_state["total"]); 						// 전체
              $("#req_open").text(req_state["open"]); 						// 전체
              $("#req_in_progress").text(req_state["in-progress"]); 						// 전체
              $("#req_resolved").text(req_state["resolved"]); 						// 전체
              $("#req_closed").text(req_state["closed"]);

              $("#total_req_issue_count").text(issue_info["req"]);  // 생성된 요구사항 이슈
              $("#no_assigned_req_issue_count").text(issue_info["req"]-resource_info["req_total"]); // 생성된 요구사항 이슈(미할당)
              $("#total_linkedIssue_subtask_count").text(issue_info["subtask"]); //생성한 연결이슈
              $("#no_assigned_linkedIssue_subtask_count").text(issue_info["subtask"]-resource_info["sub_total"]); //생성한 연결이슈(미할당)
              //전체 일정
              $("#start_date_summary").text(period_info["start_date"].substr(0,10).replaceAll("\/","-"));
              $("#end_date_summary").text(period_info["end_date"].substr(0,10).replaceAll("\/","-"));
              let progress_per = TopMenuApi.getReqProgress() +"%";
              $("#req_progress").text(progress_per); // 진척도
              $("#req_progress_bar").text(progress_per);
              $("#req_progress_bar").css("width",progress_per);
              $("#req_completed").text(req_state["resolved-and-closed"]);
              $("#req_total2").text("("+req_state["total"]+")");
              TopMenuApi.calExpectedEndDate(selectedPdServiceId, selectedVersionId,resource_info["req_total"], total_days_progress)
                .then( () => {
                    return TopMenuApi.getExpectedEndDate();
                }).then(expEndDate => {
                  $("#expected_end_date").text(expEndDate["text"]).css("color",expEndDate["css_color"]);
              }).catch(error => {
                  console.error("An error occurred:", error);
              });
              //작업자수
              $("#resource").text(resource_info["resource"]);
              $("#req_max").text(resource_info["req_max"]);
              $("#req_avg").text(resource_info["req_avg"]);
              $("#req_min").text(resource_info["req_min"]);
              $("#sub_max").text(resource_info["sub_max"]);
              $("#sub_avg").text(resource_info["sub_avg"]);
              $("#sub_min").text(resource_info["sub_min"]);

          })
          .catch((error) => {
              console.error('Error occurred:', error);
          });
    }

    const calDateDiff = (d1, d2) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        console.log("[topMenuApi :: calDateDiff] :: date1 => " + date1);
        console.log("[topMenuApi :: calDateDiff] :: date2 => " + date2);
        if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            console.error("유효하지 않은 날짜 형식입니다.");
            console.log(date1.getTime());
            console.log(date2.getTime());
            return NaN;
        }

        let startDate, endDate;
        if (date1 < date2) {
            startDate = date1;
            endDate = date2;
        } else {
            startDate = date2;
            endDate = date1;
        }

        //const diffTime = Math.abs(endDate - startDate);
        const diffTime = date2 - date1;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    function setEqualHeight(selector) {
        var maxHeight = 0;
        $(selector).each(function() {
            var height = $(this).height();
            if (height > maxHeight) {
                maxHeight = height;
            }
        });
        $(selector).height(maxHeight);
    }

    function resizeHeightEvent() {
        $(window).resize(function() {
            TopMenuApi.setEqualHeight('.top-menu-div');
        });
    }

    return {
        pullTotalApi,
        reqStateData,   getReqStateData,
        versionPeriod,  getVersionPeriod,
        reqAndSubtaskIssue, getReqAndSubtaskIssue,
        resourceInfo,   getResourceInfo,
        getReqProgress,
        calExpectedEndDate, getExpectedEndDate,
        톱메뉴_초기화, 톱메뉴_세팅,
        setEqualHeight, resizeHeightEvent
    }
})(); //즉시실행 함수