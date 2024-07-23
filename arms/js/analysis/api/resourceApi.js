var ResourceApi = (function () {
    var selectedPdserviceId;
    var selectedPdServiceversions = [];

    var fetchedResourceData = [];
    var fetchedAssigneeInfo;

    var setPdServiceId = function (pdServiceId) { selectedPdserviceId = pdServiceId; }
    var getPdServiceId = function () { return selectedPdserviceId; }

    var setPdServiceVersionLinks = function (pdServiceVersionLinks) {
        selectedPdServiceversions = pdServiceVersionLinks; }
    var getPdServiceVersions = function () { return selectedPdServiceversions };

    var fetchResourceData = function (pdservice_id, pdServiceVersionLinks) {
        var deferred = $.Deferred();
        setPdServiceId(pdservice_id);
        setPdServiceVersionLinks(pdServiceVersionLinks);

        $.ajax({
            url: "/auth-admin/api/arms/analysis/resource/workerStatus/pdServiceId/"+pdservice_id,
            type: "GET",
            data: { "pdServiceVersionLinks" : pdServiceVersionLinks },
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            async: false,
            statusCode: {
                200: function (data) {
                    //console.log("=== === === 작업자 상태 집계 시작=== === ===")
                    console.log("[resourceApi :: fetchResourceData] 작업자 상태 집계 ");
                    let search_mail = data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                    fetchedResourceData = search_mail;
                    deferred.resolve(fetchedResourceData);
                },
                error: function (e) {
                    jError("Resource WorkerStatus 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
                }
            }
        });
        return deferred.promise();
    }
    var getFetchedResourceData = function () {
        return fetchedResourceData;
    }

    var fetchAssigneeInfoMap = function (pdservice_id, pdServiceVersionLinks) {
        var deferred = $.Deferred();

        let $url = "/auth-admin/api/arms/analysis/resource/pdServiceId/"+pdservice_id+"/assigneeInfo.do";
        $.ajax({
            url: $url,
            type: "GET",
            data: { "pdServiceVersionLinks" : pdServiceVersionLinks },
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            async: false,
            statusCode: {
                200: function (data) {
                    fetchedAssigneeInfo = data;
                    deferred.resolve(fetchedAssigneeInfo);
                },
                error: function (e) {
                    jError("Resource AssigneeInfoMap 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
                }
            }
        });

        return deferred.promise();
    };

    var getFetchedAssigneeInfoMap = function() {
        return fetchedAssigneeInfo;
    }

    return {
        setPdServiceId, getPdServiceId,
        setPdServiceVersionLinks, getPdServiceVersions,
        fetchResourceData, getFetchedResourceData,
        fetchAssigneeInfoMap, getFetchedAssigneeInfoMap
    }
})();