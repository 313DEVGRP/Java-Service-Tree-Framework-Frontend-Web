var TgGroup = ( function () {
        var sampleStep = function (pageName) {
            const steps = [
                {
                    title: '<div class="step-title"> 선택한 페이지 - '+pageName+'</div>',
                    content: '<div class="step-content"> 페이지명과 범주를 확인할 수 있습니다. </div>',
                    target: ".widgetheader"
                },
                {
                    title: '<div class="step-title tgOnOff">투어가이드 설정 On/Off</div>',
                    content: '<div class="step-content"> 페이지가 새로 로드 될 때마다 실행됩니다.<br/>' +
                        '가이드를 끄시려면 TourGuide <b>Off</b>로 설정해주세요.</div>',
                    target: "#settings"
                }
            ];
            return steps;
        };
        var tg_dashboard = function () {
            const steps = [{
                content: "This is a short guide to get you set up and show you where things are",
                title: "Welcome aboard",
                target: "#firstStep"
            },
                {
                    content: "Register New Product(or Service) that you want to manage",
                    title: "Register Product(or Service) Button",
                    target: "#modal_popup_id"
                }
            ];

            return steps;
        };

        var tg_pdService = function () {
            const steps = [
                {
                    title: '<div class="step-title">제품<small>서비스</small> 목록</div>',
                    content: '<div class="step-content">등록한 제품<small>서비스</small> 목록 입니다. <br/>' +
                        '제품<small>서비스</small> 명을 선택하시면 상세 정보를 확인할 수 있습니다.</div>',
                    target: "#firstSection"
                },
                {
                    title: '<div class="step-title">제품<small>서비스</small> 등록</div>',
                    content: '<div class="step-content">새로운 제품 또는 서비스를 등록할 수 있습니다.</div>',
                    target: "#modal_popup_id"
                },
                {
                    title: '<div class="step-title">제품<small>서비스</small> 상세</div>',
                    content: '<div class="step-content">목록에서 선택한 제품<small>서비스</small>의 상세 정보 확인 <br/>' +
                        '편집하고 삭제할 수 있습니다.</div>',
                    target: "#secondSection"
                },
                {
                    title: '<div class="step-title tgOnOff">투어가이드 설정 On/Off</div>',
                    content: '<div class="step-content"> 페이지가 새로 로드 될 때마다 실행됩니다.<br/>' +
                        '가이드를 끄시려면 <b>TourGuide</b>를 <b>Off</b>로 설정해주세요.</div>',
                    target: "#settings"
                }
            ];

            return steps;
        };

        var modalReqKanban = function (data) {

            let reqId = data.reqId;
            let reqInfo = data.reqInfo;

            const keyMap = {
                reqVersions: "버전",
                reqPriority: "우선순위",
                reqDifficulty: "난이도",
                reqPlan: "계획일",
                reqSummary: "요구사항"
            };

            let formattedString = "";
            Object.keys(reqInfo).forEach((key) => {
                const mappedKey = keyMap[key] || key;
                formattedString += `<div class="step-content"><strong>${mappedKey}:</strong> ${reqInfo[key]}</div>`;
            });

            $(`[data-id="${reqId}"]`).attr({
                'data-tg-tour': formattedString,
                'data-tg-title': "<div class=\"step-title\">요구사항 상세 정보</div>"
            });

            const steps = [
                {
                    title: '<div class="step-title">요구사항 상세 정보</div>',
                    content: formattedString,
                    target: `[data-id="${reqId}"]`,
                }
            ];

            return steps;
        }

        var tg_pdServiceVersion = function () {

        };
        var tg_jiraConnection = function () {

        };
        var tg_pdServiceJira = function () {

        };

        var tg_reqAdd = function () {

        };

        var tg_reqStatus = function () {

        };
        var tg_analysisGantt = function () {

        };


        var tg_analysisTime = function () {

        };
        var tg_analysisScope = function () {

        };
        var tg_analysisResource = function () {

        };
        var tg_analysisCost = function () {

        };

        return { tg_dashboard : tg_dashboard,

            tg_pdService : tg_pdService,
            tg_pdServiceVersion : tg_pdServiceVersion,

            tg_jiraConnection : tg_jiraConnection,
            tg_pdServiceJira : tg_pdServiceJira,

            tg_reqAdd  : tg_reqAdd,
            tg_reqStatus : tg_reqStatus,

            tg_analysisGantt : tg_analysisGantt,
            tg_analysisTime : tg_analysisTime,
            tg_analysisScope : tg_analysisScope,
            tg_analysisResource : tg_analysisResource,
            tg_analysisCost : tg_analysisCost,

            sampleStep : sampleStep,

            modalReqKanban : modalReqKanban
        }; // 내부함수 key : value
    }
)();
