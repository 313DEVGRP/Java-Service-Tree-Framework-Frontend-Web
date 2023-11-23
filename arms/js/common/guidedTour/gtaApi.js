// guided-tour-arrow 요소를 추가하면 됩니다.
var GtaApi = (function () {
    var startTour = function (pageName) {
        switch (pageName) {
            case 'dashboard':
                console.log("GtaApi.startTour :: dashboard tour");
                //GtaGroup.gta_dashboard();
                break;
            //Product Service
            case 'pdService':
                console.log("GtaApi.startTour :: pdService tour");
                //GtaGroup.gta_pdService();
                break;
            case 'pdServiceVersion':
                console.log("GtaApi.startTour :: pdServiceVersion tour");
                //GtaGroup.gta_pdServiceVersion();
                break;
            //Jira
            case 'jiraConnection':
                console.log("GtaApi.startTour :: jiraConnection tour");
                //GtaGroup.gta_jiraConnection();
                break;
            case 'pdServiceJira':
                console.log("GtaApi.startTour :: pdServiceJira tour");
                //GtaGroup.gta_pdServiceJira();
                break;
            //Requirement
            case 'reqAdd':
                console.log("GtaApi.startTour :: reqAdd tour");
                //GtaGroup.gta_reqAdd();
                break;
            case 'reqStatus':
                console.log("GtaApi.startTour :: reqStatus tour");
                //GtaGroup.gta_reqStatus();
                break;
            //Analysis
            case 'analysisGantt':
                console.log("GtaApi.startTour :: analysisGantt tour");
                //GtaGroup.gta_analysisGantt();
                break;
            case 'analysisResource':
                console.log("GtaApi.startTour :: analysisResource tour");
                //GtaGroup.gta_analysisResource();
                break;
            case 'analysisTime':
                console.log("GtaApi.startTour :: analysisTime tour");
                //GtaGroup.gta_analysisTime();
                break;
            case 'analysisCost':
                console.log("GtaApi.startTour :: analysisCost tour");
                //GtaGroup.gta_analysisCost();
                break;
            default:
                console.log("투어가이드에 해당하는 페이지가 없습니다. gtaApi 의 pageName 을 확인해주세요.");
        } //end of switch
    };

    return {startTour : startTour}; // 내부 함수 key : value ( function )
})();