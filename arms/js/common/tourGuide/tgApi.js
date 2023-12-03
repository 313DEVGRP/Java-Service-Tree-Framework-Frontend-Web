const TourGuideApi = (function () {

    const makeInstance = function (pageName) {
        let tg = new tourguide.TourGuideClient({
            exitOnClickOutside: false,
            steps: fetchSteps(pageName)
        });
        return tg;
    }
    const fetchSteps = function (pageName) {
        let steps;
        switch (pageName) {
            case 'dashboard':
                console.log("GtaApi.startTour :: dashboard tour");
                break;
            //Product Service
            case 'pdService':
                console.log("tgApi.startTour :: pdService tour");
                steps = TgGroup.tg_pdService();
                break;
            case 'pdServiceVersion':
                console.log("GtaApi.startTour :: pdServiceVersion tour");
                break;

            //Jira
            case 'jiraConnection':
                console.log("GtaApi.startTour :: jiraConnection tour");
                break;
            case 'pdServiceJira':
                console.log("GtaApi.startTour :: pdServiceJira tour");
                break;

            //Requirement
            case 'reqAdd':
                console.log("GtaApi.startTour :: reqAdd tour");
                break;
            case 'reqStatus':
                console.log("GtaApi.startTour :: reqStatus tour");
                break;

            //Analysis
            case 'analysisGantt':
                console.log("GtaApi.startTour :: analysisGantt tour");
                break;
            case 'analysisResource':
                console.log("GtaApi.startTour :: analysisResource tour");
                break;
            case 'analysisTime':
                console.log("GtaApi.startTour :: analysisTime tour");
                break;

            default:
                console.log("투어가이드에 해당하는 페이지가 없습니다. tgApi 의 pageName 을 확인해주세요.");

        } //end of switch
        return steps;
    };

    return {fetchSteps : fetchSteps,
            makeInstance :makeInstance}; // 내부 함수 key : value ( function )
})();