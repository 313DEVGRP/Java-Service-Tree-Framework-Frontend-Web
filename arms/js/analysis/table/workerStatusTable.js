+(function () {
    "use strict";
    function getIdFromMail (param) {
        var full_str = param;
        var indexOfAt = full_str.indexOf('@');
        return full_str.substring(0,indexOfAt);
    }
    var WorkerStatusTable = function (selector) {
        $.fn.Table.call(this, selector);
        this.columns = [
            {
                name: "필드명",
                title: "담당자 이름",
                data: "필드명",
                className: "dt-body-center",
                defaultContent: "-",
                visible: true,
                render: function (data, type, row, meta) {
                    if (type === "display") {
                        return '<label style="color: #a4c6ff">' + getIdFromMail(data) + "</label>";
                    }
                    return data;
                },
            },
            {
                name: "필드명",
                title: "담당자 메일",
                data: "필드명",
                className: "dt-body-center",
                defaultContent: "-",
                visible: true,
                render: function (data, type, row, meta) {
                    if (type === "display") {
                        return '<label style="color: #a4c6ff">' + data +
                            "</label>";
                    }
                    return data;
                },
            },
            {
                name: "개수",
                title: "요구사항 및 연결이슈 합계",
                data: "개수", //확인필요
                className: "dt-body-right",
                defaultContent: "-",
                visible: true,
                render: function (data, type, row, meta) {
                    if (type === "display") {
                        return '<label style="color: #a4c6ff">' + data + "</label>";
                    }
                    return data;
                },
            },
            {
                name: "하위검색결과",
                title: "요구사항 수",
                data: "하위검색결과",
                className: "dt-body-right",
                defaultContent: "-",
                visible: true,
                render: function (data, type, row, meta) {
                    if (type === "display" && data["group_by_isReq"].length !== 0) {
                        if(data["group_by_isReq"][0]["필드명"] === "true") {
                            return '<label style="color: #a4c6ff">' + data["group_by_isReq"][0]["개수"] + "</label>";
                        } else {
                            return '<label style="color: #a4c6ff">' + "-" + "</label>";
                        }
                    }
                    return data;
                },
            },
            {
                name: "하위검색결과",
                title: "연결이슈 수",
                data: "하위검색결과",
                className: "dt-body-right",
                defaultContent: "-",
                visible: true,
                render: function (data, type, row, meta) {
                    if (type === "display" && data["group_by_isReq"].length !== 0) {
                        if(data["group_by_isReq"][0]["필드명"] === "false") { // 연결이슈만 있음
                            return '<label style="color: #a4c6ff">' + data["group_by_isReq"][0]["개수"] + "</label>";
                        } else if (data["group_by_isReq"].length === 2 && data["group_by_isReq"][1]["필드명"] === "false") { // 요구사항, 연결이슈 둘다 있음.
                            return '<label style="color: #a4c6ff">' + data["group_by_isReq"][1]["개수"] + "</label>";
                        } else {
                            return '<label style="color: #a4c6ff">' + "-" + "</label>";
                        }
                    }
                    return data;
                },
            },
            {
                name: "하위검색결과",
                title: "요구사항 상태",
                data: "하위검색결과",
                className: "dt-body-right",
                defaultContent: "-",
                visible: true,
                render: function (data, type, row, meta) {
                    if (type === "display" && data["group_by_isReq"].length !== 0) {
                        if(data["group_by_isReq"][0]["필드명"] === "true") { // 연결이슈만 있음
                            let status = data["group_by_isReq"][0]["하위검색결과"]["group_by_status.status_name.keyword"];
                            let return_status = "";
                            status.forEach((data, index) => {
                                return_status += data["필드명"] + " - " + data["개수"]
                                return_status += '<br>';
                            })
                            return '<label style="color: #a4c6ff">' + return_status + "</label>";
                        } else {
                            return '<label style="color: #a4c6ff">' + "-" + "</label>";
                        }
                    }
                    return data;
                },
            },
            {
                name: "하위검색결과",
                title: "연결이슈 상태",
                data: "하위검색결과",
                className: "dt-body-right",
                defaultContent: "-",
                visible: true,
                render: function (data, type, row, meta) {
                    if (type === "display" && data["group_by_isReq"].length !== 0) {
                        if(data["group_by_isReq"][0]["필드명"] === "false") { // 연결이슈만 있음
                            let status = data["group_by_isReq"][0]["하위검색결과"]["group_by_status.status_name.keyword"];
                            let return_status = "";
                            status.forEach((data, index) => {
                                return_status += data["필드명"] + " - " + data["개수"]
                                return_status += '<br>';
                            })
                            return '<label style="color: #a4c6ff">' + return_status + "</label>";
                        } else if (data["group_by_isReq"].length === 2 && data["group_by_isReq"][1]["필드명"] === "false") { // 요구사항, 연결이슈 둘다 있음.
                            let status = data["group_by_isReq"][1]["하위검색결과"]["group_by_status.status_name.keyword"];
                            let return_status = "";
                            status.forEach((data, index) => {
                                return_status += data["필드명"] + " - " + data["개수"]
                                return_status += '<br>';
                            })
                            return '<label style="color: #a4c6ff">' + return_status + "</label>";
                        } else {
                            return '<label style="color: #a4c6ff">' + "-" + "</label>";
                        }
                    }
                    return data;
                },
            },
            {
                name: "필드명",
                title: "상세보기",
                data: "필드명",
                className: "dt-body-center",
                defaultContent: "-",
                visible: true,
                render: function (data, type, row, meta) {
                    if (isEmpty(data) || data === "unknown") {
                        return "<div style='color: #808080'>N/A</div>";
                    } else {
                        var _render =
                        '<div style=\'white-space: nowrap; color: #a4c6ff\'>' +
                            '<button style="border:0; background:rgba(51,51,51,0.425); color:#fbeed5; vertical-align: middle" onclick="">'
                        +   '<i class="fa fa-list-alt"></i></button></div>';
                        return _render;
                    }
                    return data;
                },
            }
        ];
    };

    WorkerStatusTable.prototype = Object.create($.fn.Table.prototype);
    WorkerStatusTable.prototype.constructor = WorkerStatusTable;

    $.fn.WorkerStatusTable = WorkerStatusTable;

})(jQuery);