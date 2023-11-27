var ResourceApi = (function () {
    var selectedPdserviceId;
    var selectedPdServiceversions = [];

    var fetchedResourceData = [];
    var fetchedResourceDetailData = [];

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
            url: "/auth-user/api/arms/analysis/resource/workerStatus/"+pdservice_id,
            type: "GET",
            data: { "서비스아이디" : pdservice_id,
                "메인그룹필드" : "assignee.assignee_emailAddress.keyword",
                "하위그룹필드들": "isReq,status.status_name.keyword",
                "컨텐츠보기여부" : true,
                "크기" : 1000,
                "하위크기": 1000,
                "pdServiceVersionLinks" : pdServiceVersionLinks},
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (data) {
                    //console.log("=== === === 작업자 상태 집계 시작=== === ===")
                    console.log(data);
                    let search_name = data["검색결과"]["group_by_assignee.assignee_displayName.keyword"];
                    let search_mail = data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                    //console.log("=== === === 작업자 상태 집계 종료=== === ===")
                    fetchedResourceData = search_mail;
                    deferred.resolve(fetchedResourceData);
                },
                error: function (e) {
                    jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
                }
            }
        });
        return deferred.promise();
    }
    var getFetchedResourceData = function () {
        return fetchedResourceData;
    }

    var fetchResourceDetailInfo = function (assignee_email) {
        var deferred = $.Deferred();
        let pdservice_id = getPdServiceId();
        let pdServiceVersionLinks = getPdServiceVersions();
        $.ajax({
            url: "/auth-user/api/arms/analysis/resource/workerStatus/"+pdservice_id,
            type: "GET",
            data: { "서비스아이디" : pdservice_id,
                "메인그룹필드" : "assignee.assignee_emailAddress.keyword",
                "하위그룹필드들": "isReq,status.status_name.keyword",
                "컨텐츠보기여부" : true,
                "크기" : 1000,
                "하위크기": 1000,
                "pdServiceVersionLinks" : pdServiceVersionLinks},
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (data) {
                    let search_keys2 = data["검색결과"]["group_by_assignee.assignee_emailAddress.keyword"];
                    fetchedResourceDetailData = search_keys2;
                    deferred.resolve(fetchedResourceDetailData);
                },
                error: function (e) {
                    jError("Resource Status 조회에 실패했습니다. 나중에 다시 시도 바랍니다.");
                }
            }
        });

        return deferred.promise();
    }

    var getFetchedResourceDetailData = function () {
        return fetchedResourceDetailData;
    }

    return {
        setPdServiceId, getPdServiceId,
        setPdServiceVersionLinks, getPdServiceVersions,
        fetchResourceData, getFetchedResourceData,
        fetchResourceDetailInfo, getFetchedResourceDetailData
    }
})();