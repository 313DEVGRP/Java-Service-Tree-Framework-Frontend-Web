var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId; // 선택된 버전 아이디
var dataTableRef;
var mailAddressList; // 투입 작업자 메일
var req_count, linkedIssue_subtask_count, resource_count, req_in_action, total_days_progress;

var dashboardColor;
var pdServiceData;

var pdServiceListData;
var versionListData;

var 버전_요구사항_담당자 = {};
var 전체담당자목록 = {};

////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {
    var pluginGroups = [
        [
            "../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
            "../reference/light-blue/lib/jquery.iframe-transport.js",
            "../reference/light-blue/lib/jquery.fileupload.js",
            "../reference/light-blue/lib/jquery.fileupload-fp.js",
            "../reference/light-blue/lib/jquery.fileupload-ui.js",
            //chart Colors
            "./js/dashboard/chart/colorPalette.js",
            // Apache Echarts
            "../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js"
        ],
        [
            "../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
        ],
        [
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
            "../reference/light-blue/lib/bootstrap-datepicker.js",
            "../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js",
            "../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
            // 투입 인력별 요구사항 관여 차트
            "../reference/jquery-plugins/Jit-2.0.1/jit.js",
            "../reference/jquery-plugins/Jit-2.0.1/Examples/css/Treemap.css",
            // 제품-버전-투입인력 차트
            "../reference/jquery-plugins/d3-sankey-v0.12.3/d3-sankey.min.js"
        ],
        [
            // d3-5.16.0 네트워크 차트
            "../reference/jquery-plugins/d3-5.16.0/d3.min.js",
            // 생성한 차트 import
            "js/analysis/topmenu/basicRadar.js",
            "js/analysis/topmenu/topMenu.js",

            //CirclePacking with d3 Chart
            "js/analysis/cost/circularPackingChart.js"
        ],
        [
            "../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css",
            "../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js",
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js",
            "../arms/js/analysis/resource/sankey.js"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function () {
            // 사이드 메뉴 색상 설정

            $(".widget").widgster();
            setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_cost");

            //제품(서비스) 셀렉트 박스 이니시에이터
            makePdServiceSelectBox();

            //버전 멀티 셀렉트 박스 이니시에이터
            makeVersionMultiSelectBox();

            비용분석계산();

            dashboardColor = dashboardPalette.dashboardPalette01;

        })
        .catch(function (e) {
            console.error("플러그인 로드 중 오류 발생");
            console.error(e);
        });
}

///////////////////////
//제품 서비스 셀렉트 박스
//////////////////////
function makePdServiceSelectBox() {
    //제품 서비스 셀렉트 박스 이니시에이터
    $(".chzn-select").each(function () {
        $(this).select2($(this).data());
    });

    //제품 서비스 셀렉트 박스 데이터 바인딩
    $.ajax({
        url: "/auth-user/api/arms/pdService/getPdServiceMonitor.do",
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                pdServiceListData = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceListData.push({ "pdServiceId": obj.c_id, "pdServiceName": obj.c_title });
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $("#selected_pdService").append(newOption).trigger("change");
                }
                //////////////////////////////////////////////////////////
                console.log("[analysisCost :: makePdServiceSelectBox] :: pdServiceListData => " );
                console.log(pdServiceListData);
            }
        }
    });

    $("#selected_pdService").on("select2:open", function () {
        //슬림스크롤
        makeSlimScroll(".select2-results__options");
    });

    // --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
    $("#selected_pdService").on("select2:select", function (e) {
        selectedPdServiceId = $("#selected_pdService").val();
        차트초기화();
        //refreshDetailChart(); 변수값_초기화();
        // 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
        // 디폴트는 base version 을 선택하게 하고 ( select all )
        //~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
        bind_VersionData_By_PdService();
    });
} // end makePdServiceSelectBox()

////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////
function makeVersionMultiSelectBox() {
    //버전 선택시 셀렉트 박스 이니시에이터
    $(".multiple-select").multipleSelect({
        filter: true,
        onClose: function () {
            console.log("onOpen event fire!\n");

            var checked = $("#checkbox1").is(":checked");
            var endPointUrl = "";
            var versionTag = $(".multiple-select").val();
            console.log("[ analysisCost :: makeVersionMultiSelectBox ] :: versionTag");
            console.log(versionTag);
            selectedVersionId = versionTag.join(",");

            if (versionTag === null || versionTag == "") {
                alert("버전이 선택되지 않았습니다.");
                return;
            }

            차트초기화();

            //분석메뉴 상단 수치 초기화
            수치_초기화();

            // 요구사항 및 연결이슈 통계
            getReqAndLinkedIssueData(selectedPdServiceId, selectedVersionId);

            버전별_요구사항별_인력정보가져오기(selectedPdServiceId, selectedVersionId);
        }
    });
}

function bind_VersionData_By_PdService() {
    $(".multiple-select option").remove();
    $.ajax({
        url: "/auth-user/api/arms/pdService/getVersionList.do?c_id=" + $("#selected_pdService").val(),
        type: "GET",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                //console.log(data.response);
                var pdServiceVersionIds = [];
                versionListData = {};

                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceVersionIds.push(obj.c_id);
                    console.log(obj);
                    versionListData[obj.c_id] = obj;
                    // versionListData.push({ c_id: obj.c_id, versionTitle: obj.c_title });
                    var newOption = new Option(obj.c_title, obj.c_id, true, false);
                    $(".multiple-select").append(newOption);
                }

                console.log("[ analysisCost :: bind_VersionData_By_PdService ] :: versionTag");

                수치_초기화();
                selectedVersionId = pdServiceVersionIds.join(",");
                console.log(selectedVersionId);

                // 요구사항 및 연결이슈 통계
                getReqAndLinkedIssueData(selectedPdServiceId, selectedVersionId);

                버전별_요구사항별_인력정보가져오기(selectedPdServiceId, selectedVersionId);

                if (data.length > 0) {
                    console.log("display 재설정.");
                }
                //$('#multiversion').multipleSelect('refresh');
                //$('#edit_multi_version').multipleSelect('refresh');
                $(".multiple-select").multipleSelect("refresh");

                //////////////////////////////////////////////////////////
            }
        }
    });
}

function 버전별_요구사항별_인력정보가져오기(pdServiceLink, pdServiceVersionLinks) {
    const url = new UrlBuilder()
        .setBaseUrl('/auth-user/api/arms/analysis/cost/version-req-assignees')
        .addQueryParam('pdServiceLink', pdServiceLink)
        .addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
        .addQueryParam('isReqType', "REQUIREMENT")
        .addQueryParam('크기', 1000)
        .addQueryParam('하위크기', 1000)
        .addQueryParam('컨텐츠보기여부', true)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (apiResponse) {
                console.log(" [ analysisCost :: 버전별_요구사항별_인력정보가져오기 ] :: response data -> ");
                console.log(apiResponse.response);
                버전_요구사항_담당자 = apiResponse.response.버전_요구사항_담당자;
                전체담당자목록 = apiResponse.response.전체담당자목록;

                let 연봉 = 3000;
                let 성과 = 1000;

                Object.keys(전체담당자목록).forEach((key) => {
                    전체담당자목록[key].연봉 = 연봉;
                    전체담당자목록[key].성과 = 성과;
                    연봉 -= 100;
                    성과 += 100;
                });

                costInput(전체담당자목록, pdServiceVersionLinks);
            }
        }
    });
}

function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

// 엑셀 파일 업로드
function file_upload_setting() {

    // 업로드 영역 로드
    $('.body-middle').html(`
        <button
                class="btn btn-primary btn-block btn-sm"
                id="excel-annual-income-template-download"
                type="button"
                style="margin-right: 5px;">
            Excel 템플릿 다운로드
        </button>
        
        <form
                id="fileupload"
                action="excel-upload.do"
                method="POST"
                enctype="multipart/form-data">
            <input
                    type="hidden"
                    id="fileIdlink"
                    value="" />
            <div class="row analysis-cost-image-row">
                <div class="col-md-12">
                    <div
                            id="dropzone"
                            class="dropzone">
                        <i class="fa fa-cloud-upload"></i>
                        Drop files here
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12 fileupload-progress fade font12">
                    <!-- The global progress bar -->
                    <div
                            class="progress progress-success progress-striped active font12"
                            role="progressbar"
                            aria-valuemin="0"
                            aria-valuemax="100">
                        <div
                                class="bar"
                                style="width: 0%"></div>
                    </div>
                    <!-- The extended global progress information -->
                    <div class="progress-extended font12">&nbsp;</div>
                </div>
            </div>
            <div class="form-actions fileupload-buttonbar no-margin analysis-cost-image-row">
                                        <span class="btn btn-sm btn-inverse fileinput-button">
                                            <i class="fa fa-plus"></i>
                                            <span>Add files...</span>
                                            <input
                                                    type="file"
                                                    name="files[]"
                                                    multiple="" />
                                        </span>
                <button
                        type="submit"
                        class="btn btn-inverse btn-sm start">
                    <i class="fa fa-upload"></i>
                    <span>Start upload</span>
                </button>
                <button
                        type="reset"
                        class="btn btn-inverse btn-sm cancel">
                    <i class="fa fa-ban"></i>
                    <span>Cancel upload</span>
                </button>
            </div>
            <div class="fileupload-loading">
                <i class="fa fa-spin fa-spinner"></i>
            </div>
            <!-- The table listing the files available for upload/download -->
            <table
                    role="presentation"
                    class="table table-striped"
                    style="margin-bottom: 5px">
                <tbody
                        class="files"
                        data-toggle="modal-gallery"
                        data-target="#modal-gallery"></tbody>
            </table>
        </form>
    `);

    // Initialize the jQuery File Upload widget:
    var $fileupload = $("#fileupload");
    $fileupload.fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        autoUpload: true,
        url: "/auth-user/api/arms/analysis/cost/excel-upload.do",
        dropZone: $("#dropzone")
    });


    $("#fileupload").bind("fileuploadsubmit", function (e, data) {
        // The example input, doesn't have to be part of the upload form:
        var input = $("#fileIdlink");
        data.formData = { pdservice_link: input.val() };
        if (!data.formData.pdservice_link) {
            data.context.find("button").prop("disabled", false);
            input.focus();
            return false;
        }
    });
}

// 버전 비용 및 인력 비용 입력
function costInput(전체담당자목록, pdServiceVersionLinks) {

    console.log(" [ analysisCost :: costInput ] :: 인력데이터 => " + JSON.stringify(전체담당자목록));

    file_upload_setting();
    //versionInput(pdServiceVersionLinks);
    manpowerInput(전체담당자목록);
}

/*function versionInput(pdServiceVersionLinks) {

    if ($.fn.dataTable.isDataTable('#version-cost')) {
        $('#version-cost').DataTable().clear().destroy();
    }

    let selectedVersions = pdServiceVersionLinks.split(',');

    let versionTableData = selectedVersions.map(versionId => {
        let item = versionListData[versionId];
        let startDate = item.c_pds_version_start_date === "start" ? formatDate(new Date()) : formatDate(item.c_pds_version_start_date);
        let endDate = item.c_pds_version_end_date === "end" ? formatDate(new Date()) : formatDate(item.c_pds_version_end_date);
        return { // 객체를 바로 반환
            version: item.c_title,
            period: startDate + " ~ " + endDate,
            cost: 0,
            c_id: item.c_id
        };
    });

    var columnList = [
        {
            name: "versionId",
            title: "버전아이디",
            data: "c_id",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-center",
            visible: false
        },
        {
            name: "version",
            title: "버전",
            data: "version",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-center",
            visible: true
        },
        {
            name: "period",
            title: "기간",
            data: "period",
            render: function (data, type, row, meta) {
                var dates = data.split(' ~ ');
                if(type === 'sort' || type === 'type'){
                    return dates[0]; // startDate로 정렬
                }
                return data; // 원래 형태로 표시
            },
            className: "dt-center",
            visible: true
        },
        {
            name: "cost",
            title: "비용 (입력)",
            data: "cost",
            render: function(data, type, row) {
                return '<input type="text" name="version-cost" class="cost-input" value="0" data-owner="' + row.c_id + '"> 만원';
            },
            className: "dt-center",
            visible: true
        }
    ];

    var rowsGroupList = [];
    var columnDefList = [];
    var orderList = [[2, "desc"]];
    var jquerySelector = "#version-cost";
    var ajaxUrl = "";
    var jsonRoot = "";
    var buttonList = [];
    var selectList = {};
    var isServerSide = false;
    var scrollY = false;
    var data = versionTableData;
    var isAjax = false;

    dataTableRef = dataTable_build(
        jquerySelector,
        ajaxUrl,
        jsonRoot,
        columnList,
        rowsGroupList,
        columnDefList,
        selectList,
        orderList,
        buttonList,
        isServerSide,
        scrollY,
        data,
        isAjax
    );
}*/

function manpowerInput(전체담당자목록) {

    if ($.fn.dataTable.isDataTable('#manpower-annual-income')) {
        $('#manpower-annual-income').DataTable().clear().destroy();
    }

    let manpowerData = Object.keys(전체담당자목록).map((key) => {
        let data = {};
        data.이름 = 전체담당자목록[key].이름;
        data.키 = key;
        data.연봉 = 전체담당자목록[key].연봉;
        return data;
    });
    console.log(" [ analysisCost :: manpowerInput ] :: manpowerData => " + JSON.stringify(manpowerData));

    var columnList = [
        {
            name: "name",
            title: "이름",
            data: "이름",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-center",
            visible: true
        },
        {
            name: "key",
            title: "고유 키",
            data: "키",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "unknown") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-center",
            visible: true
        },
        {
            name: "annualIncome",
            title: "연봉 (입력)",
            data: "연봉",
            render: function(data, type, row) {
                var formattedData = parseInt(data).toLocaleString();
                return '<input type="text" name="annual-income" class="annual-income-input" value="' + formattedData + '" data-owner="' + row.키 + '"> 만원';
            },
            className: "dt-center",
            visible: true
        }
    ];

    var rowsGroupList = [];
    var columnDefList = [];
    var orderList = [];
    var jquerySelector = "#manpower-annual-income";
    var ajaxUrl = null;
    var jsonRoot = null;
    var buttonList = [];
    var selectList = {};
    var isServerSide = false;
    var scrollY = false;
    var data = manpowerData;
    var isAjax = false;

    dataTableRef = dataTable_build(
        jquerySelector,
        ajaxUrl,
        jsonRoot,
        columnList,
        rowsGroupList,
        columnDefList,
        selectList,
        orderList,
        buttonList,
        isServerSide,
        scrollY,
        data,
        isAjax
    );

    excel_download();
}

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수
function dataTableCallBack(settings, json) {
    $("#fileIdlink").val(selectedPdServiceId);

    //파일 리스트 초기화
    $("table tbody.files").empty();
    // Load existing files:
    var $fileupload = $("#fileupload");

    $.ajax({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        url: "/auth-user/api/arms/fileRepository/getFilesByNode.do",
        data: { fileIdLink: selectedPdServiceId },
        dataType: "json",
        context: $fileupload[0]
    }).done(function (result) {
        $(this).fileupload("option", "done").call(this, null, { result: result });
        $(".file-delete-btn").hide(); // 파일 리스트에서 delete 버튼 display none 처리
    });
}

function dataTableDrawCallback(tableInfo) {
    $("#" + tableInfo.sInstance)
        .DataTable()
        .columns.adjust()
        .responsive.recalc();

    // 연봉 포맷 설정 및 연봉 정보 저장
    $('.annual-income-input').off('input').on('input', function() {
        var value = this.value.replace(/,/g, '');
        this.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        let owner = $(this).data('owner');
        전체담당자목록[owner].연봉 = this.value.replace(/,/g, '');
    });
}

function excel_download() {

    /* var tempDataTable = $("#manpower-annual-income").DataTable();
     var data = tempDataTable.rows().data().toArray();
     var json = JSON.stringify(data);
     console.log(" [ analysisCost :: 비용 분석 계산 ] :: 인력 테이블 -> " + json);


     $("#excel-annual-income-template-download").click(function () {
         $.ajax({
             url: "/auth-user/api/arms/analysis/cost/excel-download.do?excelFileName=" + "test",
             type: "POST",
             data: json,
             contentType: "application/json",
             statusCode: {
                 200: function (data) {
                     console.log("success");
                 }
             }
         })
     });*/
}

function 비용분석계산() {
    $("#cost-analysis-calculation").click(function() {

        // 버전 비용
        let selectedVersions = selectedVersionId.split(','); // 문자열을 배열로 변환

        let selectVersionData = [];
        for (let i = 0; i < selectedVersions.length; i++) {
            let item = versionListData[selectedVersions[i]];
            /*let inputVersionValue = $(`input[name="version-cost"][data-owner=${selectedVersions[i]}]`).val();
            let number = Number(inputVersionValue.replace(/,/g, ''));

            if (isNaN(Number(number))) {
                isNumber = false;
                break;
            }*/

            item.versionCost = 100000;
            item.consumptionCost = 9000000;

            selectVersionData.push(item);
        }

        // 연봉 정보 유효성 체크 및 세팅
        for (let owner in 전체담당자목록) {

            if (isNaN(전체담당자목록[owner].연봉)) {
                alert(owner + "의 연봉 정보가 잘못되었습니다. 숫자만 입력해주세요.");
                return;
            }
        }
        console.log(" [ analysisCost :: 비용 분석 계산 ] :: 전체담당자목록 -> " + JSON.stringify(전체담당자목록));

        $.ajax({
            url: "/auth-user/api/arms/analysis/cost/T_ARMS_REQADD_" + selectedPdServiceId
                + "/req-difficulty-priority-list?c_req_pdservice_versionset_link=" + selectedVersionId,
            type: "GET",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (data) {
                    let requirementJson = data.requirement;
                    console.log(requirementJson);
                    console.log(버전_요구사항_담당자);

                    $("#req-cost-analysis-chart").height("500px");
                    reqCostAnalysisChart(data);
                }
            },
            error: function (e) {
                jError("버전 조회 중 에러가 발생했습니다.");
            }
        });

        // 요구사항 가격 바 차트 및 난이도, 우선순위 분포 차트


        $("#circularPacking").height("620px");
        // Circular Packing with D3 차트
        var versionTag = $(".multiple-select").val();
        getReqCostRatio(selectedPdServiceId, versionTag);

        // 요구사항별 수익현황 차트
        $("#income_status_chart").height("620px");
        incomeStatusChart();


        $("#compare_costs").height("500px");
        // 버전별 투자 대비 소모 비용 차트
        compareCostsChart(selectVersionData);


        // 인력별 성과 측정 차트
        $("#manpower-analysis-chart2").height("500px");
        인력_연봉대비_성과차트();
        // 인력별_연봉대비_성과차트_기본세팅(전체담당자목록);
    });
}

function 차트초기화() {
    $("#person-select-box").hide();
    clearChart('compare_costs');
    clearChart('circularPacking');
    clearChart('income_status_chart');
    clearChart('req-cost-analysis-chart');
    clearChart('manpower-analysis-chart');
    clearChart('manpower-analysis-chart2');

    $("#compare_costs").height("0px");
    $("#circularPacking").height("0px");
    $("#income_status_chart").height("0px");
    $("#req-cost-analysis-chart").height("0px");
    $("#manpower-analysis-chart").height("0px");
    $("#manpower-analysis-chart2").height("0px");
}

function clearChart(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        var chartInstance = echarts.getInstanceByDom(element);
        if (chartInstance) {
            chartInstance.clear();
        }
    }
}

/////////////////////////////////////////////////////////
// 요구사항 금액 분석 그래프
/////////////////////////////////////////////////////////
function reqCostAnalysisChart(data) {

    console.log(" [ analysisCost :: reqCostAnalysisChart :: data -> ");
    console.log(data);
    let requirementJson = data.requirement;
    let difficultyJson = data.difficulty;
    let priorityJson = data. priority;

    let requirementList = {};
    Object.values(requirementJson).forEach(item => {
        requirementList[item.c_title] = 1000000;
    });

    let reqTotalPrice = 0;
    for (let key in requirementList) {
        reqTotalPrice += requirementList[key];
    }

    let requirementKeys = Object.keys(requirementList);
    let requirementData = requirementKeys.map(key => requirementList[key]);
    let requirementTotalData = requirementKeys.map(key => reqTotalPrice - requirementList[key]);

    let difficultyData = Object.keys(difficultyJson).map(key => ({
        name: key.replace('.js', ''),
        value: difficultyJson[key]
    }));

    let priorityData = Object.keys(priorityJson).map(key => ({
        name: key.replace('.js', ''),
        value: priorityJson[key]
    }));

    let size = requirementKeys.length;
    let x = 1;

    if (size > 0) {
        x = (15 / size) * 100;
    }

    var dom = document.getElementById('req-cost-analysis-chart');
    var myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });
    var app = {};

    var option;

    option = {
        tooltip: {
            confine: true
        },
        title: [
            {
                // text: '요구사항',
                subtext: '전체 ' + reqTotalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원',
                left: '25%',
                textAlign: 'center',
                textStyle: {
                    color: '#ffffff'  // 제목의 색상을 하얀색으로 변경
                },
                subtextStyle: {
                    color: '#ffffff'  // 부제목의 색상을 하얀색으로 변경
                }
            },
            {
                text: '',
                subtext: '난이도 및 우선순위 분포',
                left: '80%',
                bottom: '0%',
                textAlign: 'center',
                textStyle: {
                    color: '#ffffff'  // 제목의 색상을 하얀색으로 변경
                },
                subtextStyle: {
                    color: '#ffffff'  // 부제목의 색상을 하얀색으로 변경
                }
            },
        ],
        grid: [
            {
                top: 50,
                left: '5%',  // 차트의 왼쪽 여백을 늘려 슬라이더와 겹치지 않게 함
                right: '0%', // 차트의 오른쪽 여백 (필요에 따라 조정)
                width: '50%',
                bottom: '5%',
                containLabel: true
            },
            /*            {
                            top: '55%',
                            width: '100%',
                            bottom: 0,
                            left: 10,
                            containLabel: true
                        }*/
        ],
        xAxis: [
            {
                type: 'value',
                max: reqTotalPrice,
                splitLine: {
                    show: false
                },
                axisLabel: {
                    rotate: 45,
                    color: '#FFFFFFFF',
                },
            },
        ],
        yAxis: [
            {
                type: 'category',
                data: requirementKeys,
                splitLine: {
                    show: false
                },
                axisLabel: {
                    color: '#FFFFFFFF',
                    rotate: 45,
                    formatter: function(value) {
                        // 최대 10자까지 표시
                        if (value.length > 6) {
                            return value.substring(0, 6) + '...';
                        } else {
                            return value;
                        }
                    },
                },
            },
        ],
        series: [
            {
                type: 'bar',
                stack: 'chart',
                z: 3,
                label: {
                    position: 'right',
                    show: true
                },
                data: requirementData
            },
            {
                type: 'bar',
                stack: 'chart',
                silent: true,
                itemStyle: {
                    color: '#FFFFFF'
                },
                data: requirementTotalData
            },
            {
                type: 'pie',
                radius: [0, '25%'],
                center: ['80%', '25%'],
                data: difficultyData,
            },
            {
                type: 'pie',
                radius: [0, '25%'],
                center: ['80%', '65%'],
                data: priorityData
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                yAxisIndex: [0], // y축에만 dataZoom 기능 적용
                start: 0,
                end: x
            },
            {
                show: true,
                type: 'slider',
                left: '0%',
                backgroundColor: 'rgba(0,0,0,0)', // 슬라이더의 배경색
                dataBackgroundColor: 'rgba(255,255,255,1)', // 데이터 배경색
                yAxisIndex: [0],
                start: 0,
                end: x
            }
        ],

    };


    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

/////////////////////////////////////////////////////////
// 투입 비용 현황 차트
/////////////////////////////////////////////////////////
function compareCostsChart(selectVersionData){
    let chartDom = document.getElementById("compare_costs");
    let myChart = echarts.init(chartDom);
    let option;
    let titles = selectVersionData.map(item => item.c_title);

    let versionCosts = selectVersionData.map(item => item.versionCost);

    let consumptionCosts = selectVersionData.map(item => item.consumptionCost);

    option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            textStyle: {
                color: '#FFFFFF'
            }
        },
        grid: {
            left: '3%',
            right: '10%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            axisLabel: {
                color: '#FFFFFF'
            }
        },
        yAxis: {
            type: 'category',
            data: titles,
            axisLabel: {
                color: '#FFFFFF'
            }
        },
        series: [
            {
                name: '투자 비용',
                type: 'bar',
                data: versionCosts
            },
            {
                name: '소모 비용',
                type: 'bar',
                data: consumptionCosts
            }
        ]
    };

    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }

    window.addEventListener("resize", myChart.resize);
}

/////////////////////////////////////////////////////////
// 요구사항 단가 기반 크기 확인 차트
/////////////////////////////////////////////////////////
function getReqCostRatio(pdServiceLink, pdServiceVersionLinks) {

    const url = new UrlBuilder()
        .setBaseUrl("/auth-user/api/arms/analysis/cost/req-linked-issue")
        .addQueryParam("pdServiceLink", pdServiceLink)
        .addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
        .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                console.log("[ analysisCost :: getReqCostRatio ] :: = ");

                let 필요_데이터 = data.버전별_요구사항별_연결된지_지라이슈;
                console.log(필요_데이터); // 결과 출력

                let pdServiceName;
                pdServiceListData.forEach(elements => {
                    if (elements["pdServiceId"] === +pdServiceLink) {
                        pdServiceName = elements["pdServiceName"];
                    }
                });
                drawCircularPacking("circularPacking",pdServiceName,필요_데이터);
            }
        }
    });
}

/////////////////////////////////////////////////////////
// 요구사항 상세 차트
/////////////////////////////////////////////////////////
function incomeStatusChart(){
    var chartDom = document.getElementById('income_status_chart');
    var myChart = echarts.init(chartDom, null, {
        renderer: "canvas",
        useDirtyRect: false
    });
    var option;

    option = {
        xAxis: {
            type: 'category',
            data: [
                '2024-01-01',
                '2024-01-11',
                '2024-01-12',
                '2024-01-17',
                '2024-01-23',
                '2024-02-12',
                '2024-02-11'
            ],
            axisLabel: {
                color: '#FFFFFF'
            },
            scale: true
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#FFFFFF'
            },
            scale: true,
        },
        legend: {
            data: ['예상', '소모 비용', '투자비용'] ,
            textStyle: {
                color: '#FFFFFF' // 범례 텍스트 색상 변경
            }
        },
        series: [
            {
                data: [0, 50, 100, 150, 200, 250, 300],
                type: 'line',
                name: '예상', // 첫 번째 선에 대한 라벨
                lineStyle: {
                    type: 'dashed' // 선의 스타일을 점선으로 변경
                },
                markLine: {
                    lineStyle: {
                        color: 'red', // line color
                        type: 'dashed', // line style
                        width: 3 // line width
                    },
                    label: {
                        position: 'middle', // label이 markLine의 중간에 위치하도록 설정
                        formatter: '투자 비용', // label의 텍스트 설정
                        fontSize: 15, // label의 폰트 크기 설정
                        color: '#FFFFFF'
                    },
                    data: [
                        {
                            yAxis: 300,
                            name: '투자비용' // line label
                        }
                    ]
                }
            },
            {
                data: [0, 100, 120, 120, 280, 320, 320],
                type: 'line',
                name: '소모 비용',
                markLine: {
                    lineStyle: {
                        color: 'red', // line color
                        type: 'dashed', // line style
                        width: 3 // line width
                    },
                    label: {
                        position: 'middle', // label이 markLine의 중간에 위치하도록 설정
                        formatter: '요구사항 기한', // label의 텍스트 설정
                        fontSize: 15, // label의 폰트 크기 설정
                        color: '#FFFFFF'
                    },
                    data: [
                        {
                            xAxis: 6,
                            name: '투자비용' // line label
                        }
                    ]
                }
            },
            {
                type: "candlestick",
                data: [
                    [120, 134, 110, 138],
                    [138, 144, 150, 178],
                    [120, 134, 110, 138],
                    [120, 134, 110, 138],
                    [120, 134, 110, 138],
                    [120, 134, 110, 138]
                ],
            }
        ],
        tooltip: {
            trigger: "axis",
            position: "top",
            borderWidth: 1,
            axisPointer: {
                type: "shadow"
            }
        },
    };

    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }

    window.addEventListener("resize", myChart.resize);
}

/////////////////////////////////////////////////////////
// 인력 연봉 대비 성과 차트
/////////////////////////////////////////////////////////
function 인력_연봉대비_성과차트() {

    const tooltipFormatter = function (params) {

        let data = dataAll.filter(item => item[0] === params.value[0] && item[1] === params.value[1]);
        let tooltipContent = '';

        if (data.length > 1) {
            for (let i = 0; i < data.length; i++) {
                tooltipContent += data[i][2] + ", <strong>연봉</strong> : <span style=''>" + data[i][0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원'  + ", </span><strong>성과</strong> : " + data[i][1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원' + '<br>';
            }
        }
        else if (data.length === 1) {
            tooltipContent = data[0][2] + "<br><strong>연봉</strong> : <span style=''>" + data[0][0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원' + "</span><br><strong>성과</strong> : " + data[0][1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원';
        }

        return tooltipContent;
    };

    let dataAll = Object.entries(전체담당자목록).map(([key, value]) => {
        return [Number(value.연봉)*10000, Number(value.성과)*10000, value.이름+"["+key+"]"];
    });

    var dom = document.getElementById('manpower-analysis-chart2');
    var myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });
    var app = {};

    var option;

    let maxX = Math.max(...dataAll.map(item => item[0]));
    let maxX2 = Math.max(...dataAll.map(item => item[1]));

    let max = Math.max(maxX, maxX2);

    const markLineOpt = {
        animation: false,
        label: {
            formatter: '성과 기준선',
            align: 'right',
            color: 'white'
        },
        lineStyle: {
            type: 'dashed',
            color: '#EE6666',
            width: 2
        },
        tooltip: {
            formatter: '성과 기준선'
        },
        data: [
            [
                {
                    coord: [0, 0],
                    symbol: 'none'
                },
                {
                    coord: [max, max],
                    symbol: 'none'
                }
            ]
        ]
    };
    option = {
        grid: [
            { left: '15%', top: '5%'}
        ],
        tooltip: {
            confine: true,
            /*            formatter: function (params) {
                            return params.value[2] + "<br><strong>연봉</strong> : <span style=''>" + params.value[0]  + "</span><br><strong>성과</strong> : " + params.value[1];
                        },*/
            formatter: tooltipFormatter
        },
        xAxis: [
            {
                gridIndex: 0,
                min: 0,
                max: max,
                axisLabel: {
                    color: 'white',
                    interval: 1,
                    rotate: 45,
                    formatter: function (value) {
                        return value === 0 ? '' : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: 'gray',
                        type: 'dashed'
                    }
                }
            }
        ],
        yAxis: [
            {
                gridIndex: 0,
                min: 0,
                max: max,
                axisLabel: {
                    color: 'white',
                    interval: 1,
                    rotate: 45,
                },
                splitLine: {
                    lineStyle: {
                        color: 'gray',
                        type: 'dashed'
                    }
                }
            }
        ],
        series: [
            {
                name: 'I',
                type: 'scatter',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: dataAll,
                markLine: markLineOpt
            }
        ],
        toolbox: {
            show: true,
            orient: "vertical",
            left: "right",
            bottom: "50px",
            feature: {
                mark: { show: true },
                dataView: {show: true, readOnly: true},
                dataZoom: {show: true}
            },
            iconStyle: {
                borderColor: "white"
            }
        },
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

function 인력별_연봉대비_성과차트_기본세팅(전체담당자목록) {
    // 초기화 로직
    $("#person-select-box").hide();
    $('.person-data + .bootstrap-select .dropdown-menu').empty();
    $('.person-data + .bootstrap-select .filter-option').text("");

    console.log(" [ analysisCost :: 인력별_연봉대비_성과차트_기본세팅 ] :: 전체담당자목록 -> ");
    console.log(전체담당자목록);

    var options = Object.keys(전체담당자목록);

    console.log(options);
    if (options.length > 0) {
        $("#person-select-box").show();
        $("#first-person-select").text(options[0]);
        인력별_연봉대비_성과차트_그리기(options[0]);

        $.each(options, function(index, option) {
            $('.person-data').append($('<option>', {
                value: option,
                text : option
            }));

            var li = $('<li>', { 'rel': index }).append($('<a>', { 'tabindex': '-1', 'class': '', 'text': option }));
            $('.person-data + .bootstrap-select .dropdown-menu').append(li);
        });
    }
    else {
        // 데이터 없을 떄 처리
        console.log("담당자가 하나도 없습니다.");
    }

    $('.person-data + .bootstrap-select .dropdown-menu').on('click', 'li', function() {
        var selectedOption = $(this).text();

        인력별_연봉대비_성과차트_그리기(selectedOption);
        $('.person-data + .bootstrap-select .filter-option').text(selectedOption);
    });
}

function 인력별_연봉대비_성과차트_그리기(selectedPerson) {

    let manPowerData = 전체담당자목록[selectedPerson];

    console.log(" [ analysisCost :: 인력별_연봉대비_성과차트_그리기 :: selected person name -> " + selectedPerson);
    console.log(" [ analysisCost :: 인력별_연봉대비_성과차트_그리기 :: selected person data -> ");
    console.log(manPowerData);

    var dom = document.getElementById('manpower-analysis-chart');
    var myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    var option;

    option = {
        grid: {
            top: 50,
            left: '20%',
            bottom: '5%',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none'
            },
            confine: true
        },
        xAxis: {
            data: [manPowerData.이름],
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: '#FFFFFFFF',
                opacity: 1
            },
            scale: true,
        },
        yAxis: {
            splitLine: { show: false },
            axisTick: { show: true },
            axisLine: { show: false },
            axisLabel: {
                show: true,
                color: '#FFFFFFFF',
                opacity: 1
            }
        },
        /*color: ['#e54035'],*/
        series: [
            {
                name: '연봉',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                // symbol: 'path://M0,10 L10,10 L5,0 L0,10 z',
                symbol: 'path://M0,10 C10,10 10,0 20,0 C30,0 30,10 40,10',
                itemStyle: {
                    opacity: 0.5
                },
                emphasis: {
                    itemStyle: {
                        opacity: 0.7
                    }
                },
                data: [manPowerData.연봉],
                z: 10,
                label: {
                    show: false,
                },
            },
            {
                name: '벌어들인 수익',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                // symbol: 'path://M0,10 L10,10 L5,0 L0,10 z',
                symbol: 'path://M0,10 C10,10 10,0 20,0 C30,0 30,10 40,10',
                itemStyle: {
                    opacity: 0.5,
                    /*color: "blue"*/
                },
                emphasis: {
                    itemStyle: {
                        opacity: 0.7,

                    }
                },
                data: [manPowerData.성과],
                z: 10,
                label: {
                    show: false,
                    position: 'outside',
                    color: "#FFFFFFFF"
                },
            },
            {
                name: '연봉 라벨',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                symbol: 'path://M0,0',  // 심볼을 비워서 별도의 바가 보이지 않도록 합니다.
                data: [manPowerData.연봉],
                z: 11,  // z 값을 더 크게 설정하여 라벨이 다른 요소들 위에 오도록 합니다.
                label: {
                    show: true,
                    position: 'outside',
                    color: "white",
                    formatter: function(params)
                    {
                        return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
                },
                tooltip: {
                    show: false
                }
            },
            {
                name: '벌어들인 수익',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                symbol: 'path://M0,0',  // 심볼을 비워서 별도의 바가 보이지 않도록 합니다.
                data: [manPowerData.성과],
                z: 11,  // z 값을 더 크게 설정하여 라벨이 다른 요소들 위에 오도록 합니다.
                label: {
                    show: true,
                    position: 'outside',
                    color: "white",
                    formatter: function(params)
                    {
                        return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
                },
                tooltip: {
                    show: false
                }
            },
        ]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

function 전역인력맵확인() {
    return new Promise(resolve => {
        let intervalId = setInterval(() => {
            console.log(전체담당자목록);
            if (전체담당자목록.length > 0 ) {
                clearInterval(intervalId);
                resolve(전체담당자목록);
            }
        }, 500);  // 100ms마다 globalDeadline 값 확인
    });
}