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

    var reqStateData = function (pdService_id, pdServiceVersionLinks) {
        let reqAddUrl = "/T_ARMS_REQADD_"+ pdService_id +"/getReqAddListByFilter.do?";

        $.ajax({
            url: "/auth-user/api/arms/analysis/scope/top-menu" +reqAddUrl,
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
                }
            }
        });
    };

    //////////////////////////////////
    // 버전 기간 - Application
    //////////////////////////////////
    var versionPeriod = function (pdServiceVersionLinks) {
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
                        setVersionPeriod(result);
                    }
                }
            });
        }
    };

    var setVersionPeriod = function (param) {
        period_date["start_date"] = param["earliestDate"];
        period_date["end_date"] = param["latestDate"];
    };

    var getVersionPeriod = function () {
        return period_date;
    };

    ///////////////////////////////////////
    // 요구사항 및 연결&하위 이슈 - Application
    ///////////////////////////////////////
    var reqAndSubtaskIssue = function (pdService_id, pdServiceVersionLinks) {
        $.ajax({
            url: "/auth-user/api/arms/analysis/scope/top-menu/issue/reqAndSubtask" +pdService_id,
            type: "GET",
            data: {	pdServiceVersionLinks: pdServiceVersionLinks },
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (result) {
                    console.log("[ topMenuApi :: reqAndSubtaskIssue ] :: result");
                    console.log(result);
                    setReqAndSubtaskIssue(result);
                }
            }
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

    return {
        reqStateData,   getReqStateData,
        versionPeriod,  getVersionPeriod,
        reqAndSubtaskIssue, getReqAndSubtaskIssue
    }
})(); //즉시실행 함수