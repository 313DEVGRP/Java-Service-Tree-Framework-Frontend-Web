var GtaGroup = ( function () {
        var gta_dashboard = function () {
            $.guides({
                guides: [
                    {
                        element: $("#osStatusHeader"),
                        html: '등록된 Host의 OS 통계를 확인할 수 있습니다.'
                    }, {
                        element: $("#sources-chart-pie"),
                        html: '등록된 Host 차트입니다. 각 OS별 비율을 시각적으로 확인할 수 있습니다.'
                    }
                ]
            }).start();
        };

        var gta_pdService = function () {
            $.guides({
                guides: [
                    {
                        element: $(".page-title"),
                        html: "해당 페이지의 타이틀 입니다."
                    },
                    {
                        element: $(".tg-2nd-section"),
                        html: "두번째 섹션"
                    }
                ]
                /*guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]*/
            }).start();
        };

        var gta_pdServiceVersion = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };
        var gta_jiraConnection = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };
        var gta_pdServiceJira = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };

        var gta_reqAdd = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };

        var gta_reqStatus = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };
        var gta_analysisGantt = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };


        var gta_analysisTime = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };
        var gta_analysisScope = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };
        var gta_analysisResource = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };
        var gta_analysisCost = function () {
            $.guides({
                guides: [
                    {
                        element: $("#pdServiceFirstSection"),
                        html: '제품(서비스) 목록입니다. 제품(서비스) 추가 버튼을 통해 등록할 수 있습니다.'
                    }, {
                        element: $("#pdServiceSecondSection"),
                        html: '상세 섹션입니다. 상세보기 편집 삭제 탭으로 이루어져 있습니다.'
                    }
                ]
            }).start();
        };

        return { gta_dashboard : gta_dashboard,

            gta_pdService : gta_pdService,
            gta_pdServiceVersion : gta_pdServiceVersion,

            gta_jiraConnection : gta_jiraConnection,
            gta_pdServiceJira : gta_pdServiceJira,

            gta_reqAdd  : gta_reqAdd,
            gta_reqStatus : gta_reqStatus,

            gta_analysisGantt : gta_analysisGantt,
            gta_analysisTime : gta_analysisTime,
            gta_analysisScope : gta_analysisScope,
            gta_analysisResource : gta_analysisResource,
            gta_analysisCost : gta_analysisCost
        }; // 내부함수 key : value
    }
)();

// If you want to manually start the tour you can do the following:
/*
var guides = $.guides({
    guides: [{
        html: 'Welcome to Guides.js'
    }, {
        element: $('.navbar'),
        html: 'Navigate through guides.js website'
    }, {
        element: $('#demo'),
        html: 'See how it works'
    }, {
        element: $('#download'),
        html: 'Download guides.js'
    }, {
        element: $('#getting-started'),
        html: 'Check out how to get started with guides.js'
    }, {
        element: $('#docs'),
        html: 'Read the docs'
    }]
});
guides.start();
*/