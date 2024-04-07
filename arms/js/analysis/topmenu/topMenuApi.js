var TopMenuApi = (function () {
    "use strict";

    /*
    * TopMenu에서 사용하는 변수 정리
    * */
    // MySQL - 요구사항(DB)의 상태
    var req_state_data = {
        "total" : 0,   // 총합
        "open" : 0,    // 열림
        "not-open" : 0 // 열림 제외(진행중, 해결됨, 닫힘)
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


    // 작업자수 - 필요할까?
    var resource = {
        "total" : null,
        "resourceInfo" : null
    };

    var pullTotalApi = function(pdService_id, pdServiceVersionLinks) {
        return Promise.all([
            reqStateData(pdService_id, pdServiceVersionLinks),
            versionPeriod(pdServiceVersionLinks),
            reqAndSubtaskIssue(pdService_id, pdServiceVersionLinks),
            resourceInfo(pdService_id, pdServiceVersionLinks)
        ]);
    };


    //////////////////////////////////
    // 요구사항(DB)의 상태 - Application
    //////////////////////////////////
    var setReqStateData = function (result) {
        req_state_data["total"] = (result["total"] ? result["total"] : 0);
        req_state_data["open"] = (result["open"] ? result["open"] : 0);
        req_state_data["not-open"] = (result["not-open"] ? result["not-open"] : 0);
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
                                    console.log(i);
                                    console.log(가장이른시작날짜);
                                    console.log(가장늦은종료날짜);
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
        const keyCount = Object.keys(result).length;
        resource["total"] = keyCount;
        resource["resourceInfo"] = result;
    };

    var getResourceInfo = function() {
        return resource;
    };


    return {
        pullTotalApi,
        reqStateData,   getReqStateData,
        versionPeriod,  getVersionPeriod,
        reqAndSubtaskIssue, getReqAndSubtaskIssue,
        resourceInfo,   getResourceInfo
    }
})(); //즉시실행 함수