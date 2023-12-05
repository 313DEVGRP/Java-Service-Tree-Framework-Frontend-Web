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
                console.log("TourGuideApi.startTour :: dashboard tour");
                break;
            //Product Service
            case 'pdService':
                console.log("tgApi.startTour :: pdService tour");
                steps = TgGroup.tg_pdService();
                break;
            case 'pdServiceVersion':
                console.log("TourGuideApi.startTour :: pdServiceVersion tour");
                break;
            //Jira
            case 'jiraServer':
                console.log("TourGuideApi.startTour :: jiraServer tour");
                break;
            case 'jiraConnection':
                console.log("TourGuideApi.startTour :: jiraConnection tour");
                break;

            //Requirement
            case 'reqAdd':
                console.log("TourGuideApi.startTour :: reqAdd tour");
                break;
            case 'reqStatus':
                console.log("TourGuideApi.startTour :: reqStatus tour");
                break;

            //Analysis
            case 'analysisGantt':
                console.log("TourGuideApi.startTour :: analysisGantt tour");
                break;
            case 'analysisResource':
                console.log("TourGuideApi.startTour :: analysisResource tour");
                break;
            case 'analysisTime':
                console.log("TourGuideApi.startTour :: analysisTime tour");
                break;
            default:
                console.log("투어가이드에 해당하는 페이지가 없습니다. tgApi 의 pageName 을 확인해주세요.");

        } //end of switch
        if (steps === undefined) {
            return TgGroup.sampleStep(pageName);
        }
        return steps;
    };

    return {fetchSteps : fetchSteps,
            makeInstance :makeInstance}; // 내부 함수 key : value ( function )
})();