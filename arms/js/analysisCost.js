var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId; // 선택된 버전 아이디
var dataTableRef;
var mailAddressList; // 투입 작업자 메일
var req_count, linkedIssue_subtask_count, resource_count, req_in_action, total_days_progress;

var dashboardColor;

var pdServiceListData;
var versionListData;

var 버전_요구사항_담당자 = {};   // 버전 - 요구사항 - 담당자 데이터
var 전체담당자목록 = {};        // 선택된 버전의 전체 담당자 목록
var 요구사항전체목록 = {};      // 선택된 버전의 요구사항 전체목록
var 요구사항별_키목록 = {};     // 버전 - 요구사항 cid - 요구사항 키 데이터
var 인력별_연봉정보 = {};       // 인력별 연봉정보 데이터

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

            비용분석계산버튼();

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

                // 버전 목록 데이터 및 비용 초기화
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceVersionIds.push(obj.c_id);
                    obj.버전비용 = 0;
                    versionListData[obj.c_id] = obj;
                    var newOption = new Option(obj.c_title, obj.c_id, true, false);
                    $(".multiple-select").append(newOption);
                }

                console.log("[ analysisCost :: bind_VersionData_By_PdService ] :: versionTag");

                수치_초기화();
                selectedVersionId = pdServiceVersionIds.join(",");

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
        // .setBaseUrl('/auth-user/api/arms/analysis/cost/all-assignees')
        .addQueryParam('pdServiceLink', pdServiceLink)
        .addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
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

                let 연봉 = 5000;

                Object.keys(전체담당자목록).forEach((key) => {
                    전체담당자목록[key].연봉 = 연봉;
                    전체담당자목록[key].인력별소모비용 = 0;
                    전체담당자목록[key].완료성과 = 0;
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
    manpowerInput(전체담당자목록);
}

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
    인력별_연봉정보 = Object.keys(전체담당자목록).map((key) => {
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
                return '<input type="text" name="annual-income" class="annual-income-input" value="' + formattedData  + '" data-owner="' + row.키 + '"> 만원';
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

    // 템플릿 다운로드
    excel_download(인력별_연봉정보);
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
        전체담당자목록[owner].인력별소모비용 = 0;

        var manpower = 인력별_연봉정보.find(item => item.키 === owner);
        if (manpower) {
            manpower.연봉 = 전체담당자목록[owner].연봉;
        }
    });
}

function excel_download(인력별_연봉정보) {
    console.log(" [ analysisCost :: excel_download ] :: 인력별_연봉정보 => " + JSON.stringify(인력별_연봉정보));

    let fileName = "인력별_연봉정보_템플릿.xlsx";

    $("#excel-annual-income-template-download").click(function () {
        if (Object.keys(인력별_연봉정보).length === 0) {
            alert("다운로드할 인력 정보가 없습니다.");
        } else {
            $.ajax({
                url: "/auth-user/api/arms/analysis/cost/excel-download.do?excelFileName=" + fileName,
                type: "POST",
                data: JSON.stringify(인력별_연봉정보),
                contentType: "application/json",
                xhrFields: {
                    responseType: 'blob'  // 응답 데이터 타입을 blob으로 설정
                },
                statusCode: {
                    200: function (data) {
                        var url = window.URL.createObjectURL(data);  // blob 데이터로 URL 생성
                        var a = document.createElement('a');  // 다운로드 링크를 위한 <a> 태그 생성
                        a.href = url; // url 설정
                        a.download = fileName; // 파일명 설정
                        a.style.display = 'none';  // <a> 태그를 브라우저에 보이지 않게 설정
                        document.body.appendChild(a);  // <a> 태그를 body에 추가
                        a.click();  // 다운로드 링크 클릭
                        document.body.removeChild(a);  // <a> 태그 제거
                    }
                }
            })
        }
    });
}

function 비용분석계산버튼() {
    $("#cost-analysis-calculation").click(function() {

        if(!selectedPdServiceId || !selectedVersionId) {
            alert("제품(서비스), 버전을 선택해주세요.");
            return;
        }

        let isEmpty = true;
        // 연봉 정보 유효성 체크 및 세팅, 담당자목록 성과 초기화
        for (let owner in 전체담당자목록) {
            전체담당자목록[owner].인력별소모비용 = 0;
            전체담당자목록[owner].완료성과 = 0;

            if (isNaN(전체담당자목록[owner].연봉)) {
                alert(owner + "의 연봉 정보가 잘못되었습니다. 숫자만 입력해주세요.");
                return;
            }
            isEmpty = false;
        }

        if (isEmpty) {
            alert("요구사항에 할당된 담당자가 없습니다.");
            return;
        }

        비용계산데이터_초기화();

        console.log(" [ analysisCost :: 비용 분석 계산 ] :: 전체담당자목록 -> ");
        console.log(전체담당자목록);

        const url = new UrlBuilder()
            .setBaseUrl("/auth-user/api/arms/analysis/cost/req-linked-issue")
            .addQueryParam("pdServiceLink", selectedPdServiceId)
            .addQueryParam("pdServiceVersionLinks", selectedVersionId)
            .build();

        const url2 = new UrlBuilder()
            .setBaseUrl("/auth-user/api/arms/analysis/cost/T_ARMS_REQADD_"+ selectedPdServiceId + "/req-difficulty-priority-list")
            .addQueryParam("c_req_pdservice_versionset_link", selectedVersionId)
            .build();

        const completeKeywordUrl = new UrlBuilder()
            .setBaseUrl("/auth-user/api/arms/reqState/complete-keyword")
            .build();

        Promise.all([
            $.ajax({ url: url, type: "GET", dataType: "json" }),
            $.ajax({ url: url2, type: "GET", dataType: "json" }),
            $.ajax({ url: completeKeywordUrl, type: "GET", dataType: "json" })
        ]).then(function([data1, data2, data3]) {
            console.log("[ analysisCost :: 비용분석계산 API 1 ] :: data1 => ");
            console.log(data1);
            console.log("[ analysisCost :: 비용분석계산 API 2 ] :: data2 => ");
            console.log(data2);
            console.log("[ analysisCost :: 비용분석계산 완료 요구사항 키워드 ] :: data3 => ");
            console.log(data3);

            요구사항별_키목록 = data1.버전별_요구사항별_연결된지_지라이슈;
            요구사항전체목록 = data2.requirement;

            console.log("[ analysisCost :: 비용분석계산 ] :: 게산을 위한 데이터들 => ");
            console.log(요구사항별_키목록);
            console.log(요구사항전체목록);
            console.log(버전_요구사항_담당자);
            console.log(전체담당자목록);


            /////////////////////////////////////////////////////////////////////
            ////////////////////////// 비용 분석 계산 /////////////////////////////
            /////////////////////////////////////////////////////////////////////
            Object.values(요구사항전체목록).forEach((요구사항) => {
                // 요구사항 전체목록을 반복문 돌기 및 요구사항별 단가 초기화
                요구사항.요구사항금액 = 0;

                // 해당 요구사항이 멀티 버전일 수 있으니 버전목록을 가져옴
                let 요구사항이포함된버전목록 = JSON.parse(요구사항.c_req_pdservice_versionset_link);
                
                // 요구사항의 버전목록을 반복문 돌기 
                요구사항이포함된버전목록.forEach((버전) => {
                    // 해당 버전에 요구사항 키 목록을 가져옴
                    let 버전_요구사항_키목록 = 요구사항별_키목록[버전];

                    // 버전의 요구사항 목록 유무 확인
                    if (버전_요구사항_키목록 == null) {
                    }
                    else {
                        // 있을 시 계산, 버전과 요구사항 c_id로 해당 요구사항이 가진 키목록 데이터 가져오기
                        let 요구사항_키목록 = 버전_요구사항_키목록[요구사항.c_id];

                        // 요구사항 키 목록 유무 확인
                        if (요구사항_키목록 == null) {
                            // console.log("버전 -> " + 버전 + "\n요구사항 -> " +요구사항.c_id);
                        }
                        else {
                            // 있을 시 키목록을 반목문 돌기
                            요구사항_키목록.forEach((요구사항키) => {

                                // 키 별 담당자목록 조회를 위한 버전_요구사항_담당자 중 버전 유무 확인
                                let 요구사항_담당자목록 = 버전_요구사항_담당자[버전];
                                if (요구사항_담당자목록 == null) {

                                }
                                else {
                                    // 있으면 버전_요구사항_담당자 중 담당자목록 유무 확인
                                    let 담당자목록 = 요구사항_담당자목록[요구사항키.c_issue_key];
                                    if (담당자목록 == null) {
                                        // console.log("요구사항 키 -> " + 요구사항키.c_issue_key + "n\요구사항_담당자목록 -> " +요구사항.c_id);
                                    }
                                    else {
                                        // console.log("요구사항 키 -> " + 요구사항키.c_issue_key + "\n담당자 -> " + JSON.stringify(담당자목록));

                                        // 있으면 담당자목록을 반목문 돌기
                                        Object.entries(담당자목록).forEach(([key, value]) => {

                                            // 요구사항의 비용 계산을 위한 날짜 카운팅 ****** 수정필요(정책) ******

                                            // 요구사항 단가 계산 및 인력 성과 계산 등
                                            최종비용분석계산(key, 요구사항, 버전, 요구사항키, data3);
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            });

            data2.requirement = 요구사항전체목록;
            $("#req-cost-analysis-chart").height("500px");
            요구사항비용분석차트(data2);

            // 인력별 성과 측정 차트
            $("#manpower-analysis-chart2").height("500px");
            인력_연봉성과분포차트(전체담당자목록);
            $("#manpower-analysis-chart").height("500px");
            인력별_연봉대비_성과차트(전체담당자목록);

            // 버전별 투자 대비 소모 비용 차트
            // $("#compare_costs").height("500px");
            // compareCostsChart();

            let pdServiceName;
            pdServiceListData.forEach(elements => {
                if (elements["pdServiceId"] === +selectedPdServiceId) {
                    pdServiceName = elements["pdServiceName"];
                }
            });

            clearChart('circularPacking');
            $("#circularPacking").height("620px");
            drawCircularPacking("circularPacking",pdServiceName, 요구사항별_키목록);

            $("#version-stack-container").height("500px");
            버전소모비용스택차트();
        }).catch(function(error) {
            console.log('Error:', error);
            jError("비용 분석 계산 중 에러가 발생했습니다.");
        });

        // 요구사항별 수익현황 차트
        $("#income_status_chart").height("620px");

    });
}

function 비용계산데이터_초기화() {
    // 버전 소모비용 초기화
    let 선택된_버전아이디목록 = selectedVersionId.split(',');
    선택된_버전아이디목록.forEach((아이디) => {
        versionListData[아이디].버전비용 = 0;
    });

    // 버전 요구사항별 담당자별 금액 초기화
    for (let 버전 in 버전_요구사항_담당자) {
        for (let 요구사항키 in 버전_요구사항_담당자[버전]) {
            for (let key in 버전_요구사항_담당자[버전][요구사항키]) {
                버전_요구사항_담당자[버전][요구사항키][key].버전별담당자소모비용 = 0;
            }
        }
    }
}

//////////////////////////////////////////////////////////////
/////////////// 요구사항의 일수 계산을 위한 함수///////////////////
//////////////////////////////////////////////////////////////
function 날짜계산(요구사항) {
    let startDate, endDate;

    if (요구사항.reqStateEntity == null) {
    }
    else {
        if (요구사항.reqStateEntity.c_id === 12) {
            startDate = new Date(formatDate(요구사항.c_req_start_date));
            endDate = new Date(formatDate(요구사항.c_req_end_date));
        }
        else {
            startDate = new Date(formatDate(요구사항.c_req_start_date));
            endDate = new Date(formatDate(new Date()));
        }
    }

    return {startDate, endDate};
}

function 최종비용분석계산(key, 요구사항, 버전, 요구사항키, 완료_요구사항_키워드) {

    const 완료_요구사항_키워드SET = new Set(완료_요구사항_키워드);

    let startDate = 요구사항.c_req_start_date
        ? new Date(formatDate(요구사항.c_req_start_date))
        : null;

    let endDate = 요구사항.c_req_end_date
        ? new Date(formatDate(요구사항.c_req_end_date))
        : new Date(formatDate(new Date()));

    if (요구사항.reqStateEntity != null) {
        if (완료_요구사항_키워드SET.has(요구사항.reqStateEntity.c_title)) {
            // 완료된 요구사항만 계산하여 완료성과 측정
            if (startDate && endDate && (startDate <= endDate)) {
                let cost = 담당자별_비용계산(startDate, endDate, 전체담당자목록[key].연봉);
                전체담당자목록[key].완료성과 += cost;
            }
        }
    }

    if (startDate && endDate && (startDate <= endDate)) {
        let cost = 담당자별_비용계산(startDate, endDate, 전체담당자목록[key].연봉);

        // 요구사항별 금액 측정 차트 데이터
        요구사항.요구사항금액 += cost;

        // 인력별 성과 차트 데이터
        전체담당자목록[key].인력별소모비용 += cost;

        // 버전별 소모비용 차트 데이터
        versionListData[버전].버전비용 += cost;

        // 요구사항 금액별 버블 차트 데이터
        요구사항키.cost += cost;

        // 버전별 소모비용 -> 버전별 인력비용 스택차트로 변경 데이터
        if (버전_요구사항_담당자[버전][요구사항키.c_issue_key][key].버전별담당자소모비용 == null) {
            버전_요구사항_담당자[버전][요구사항키.c_issue_key][key].버전별담당자소모비용 = cost;
        } else {
            버전_요구사항_담당자[버전][요구사항키.c_issue_key][key].버전별담당자소모비용 += cost;
        }
    }
}

function 담당자별_비용계산(startDate, endDate, salary) {
    let 업무일수 = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    let 일급 = Math.round((salary / 365)) * 10000;
    return 업무일수 * 일급;
}

function 차트초기화() {
    $("#person-select-box").hide();
    clearChart('compare_costs');
    clearChart('circularPacking');
    clearChart('income_status_chart');
    clearChart('req-cost-analysis-chart');
    clearChart('manpower-analysis-chart');
    clearChart('manpower-analysis-chart2');
    clearChart('version-stack-container');


    $("#compare_costs").height("0px");
    $("#circularPacking").height("0px");
    $("#income_status_chart").height("0px");
    $("#req-cost-analysis-chart").height("0px");
    $("#manpower-analysis-chart").height("0px");
    $("#manpower-analysis-chart2").height("0px");
    $("#version-stack-container").height("0px");
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
function 요구사항비용분석차트(data) {

    console.log(" [ analysisCost :: 요구사항비용분석차트 :: data -> ");
    console.log(data);
    let requirementJson = data.requirement;
    let difficultyJson = data.difficulty;
    let priorityJson = data. priority;

    // let requirementList = {};
    // Object.values(requirementJson).forEach(item => {
    //     requirementList[item.c_title] = item.요구사항금액;
    // });
    //
    // let reqTotalPrice = 0;
    // for (let key in requirementList) {
    //     reqTotalPrice += requirementList[key];
    // }
    //
    // let requirementKeys = Object.keys(requirementList);
    // let requirementData = requirementKeys.map(key => requirementList[key]);
    // let requirementTotalData = requirementKeys.map(key => reqTotalPrice - requirementList[key]);

    let requirementList = Object.values(requirementJson).reduce((result, item) => {
        result[item.c_title] = item.요구사항금액;
        return result;
    }, {});

    let reqTotalPrice = Object.values(requirementList).reduce((total, amount) => total + amount, 0);

    let sortedRequirementList = Object.entries(requirementList).sort((a, b) => b[1] - a[1]);

    let requirementKeys = sortedRequirementList.map(entry => entry[0]);
    let requirementData = sortedRequirementList.map(entry => entry[1]);
    let requirementTotalData = sortedRequirementList.map(entry => reqTotalPrice - entry[1]);


    let difficultyData = Object.keys(difficultyJson).map(key => ({
        name: key.replace('.js', ''),
        value: difficultyJson[key]
    }));

    let priorityData = Object.keys(priorityJson).map(key => ({
        name: key.replace('.js', ''),
        value: priorityJson[key]
    }));

    let size = requirementKeys.length;
    let zoomPersent = 1;

    if (size > 0) {
        zoomPersent = (15 / size) * 100;
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
                left: '5%',
                right: '0%', 
                width: '55%',
                bottom: '5%',
                containLabel: true
            },
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
                        if (value.length > 9) {
                            return value.substring(0, 9) + '...';
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
                radius: [0, '30%'],
                center: ['80%', '25%'],
                data: difficultyData,
            },
            {
                type: 'pie',
                radius: [0, '30%'],
                center: ['80%', '75%'],
                data: priorityData
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                yAxisIndex: [0], // y축에만 dataZoom 기능 적용
                start: 0,
                end: zoomPersent
            },
            {
                show: true,
                type: 'slider',
                left: '0%',
                backgroundColor: 'rgba(0,0,0,0)', // 슬라이더의 배경색
                dataBackgroundColor: 'rgba(255,255,255,1)', // 데이터 배경색
                yAxisIndex: [0],
                start: 0,
                end: zoomPersent
            }
        ],

    };


    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

function 버전소모비용스택차트(){

    const defaultValue = 0;

    let selectedVersions = selectedVersionId.split(','); // 문자열을 배열로 변환
    let stackVersionList = {};

    for (let i = 0; i < selectedVersions.length; i++) {
        const selectedVersion = selectedVersions[i];
        const 버전별_담당자데이터 = {};
        const item = versionListData[selectedVersion];
        const 요구사항_담당자목록들 = 버전_요구사항_담당자[selectedVersion];

        for (let 요구사항_담당자목록 in 요구사항_담당자목록들) {
            const 담당자목록 = 요구사항_담당자목록들[요구사항_담당자목록];

            for (let key in 담당자목록) {
                const 담당자 = 담당자목록[key];
                const newKey = `${담당자.이름}[${key}]`;

                if (버전별_담당자데이터[newKey] == null) {
                    버전별_담당자데이터[newKey] = 0;
                }

                버전별_담당자데이터[newKey] += 담당자.버전별담당자소모비용;
            }
        }

        stackVersionList[item.c_title] = 버전별_담당자데이터;
    }

    let stackTypeList = Object.keys(전체담당자목록).map(key => {
        let data;
        data = 전체담당자목록[key].이름 + "["+key+"]";
        return data;
    });

    let chartDom = document.getElementById('version-stack-container');

    let myChart = echarts.init(chartDom);

    console.log(" [ analysisCost :: 버전소모비용스택차트 ] :: 버전 데이터 -> ");
    console.log(stackVersionList);

    console.log(" [ analysisCost :: 버전소모비용스택차트 ] :: 버전별 담당자 성과 누적 데이터  -> ");
    console.log(stackTypeList);

    let size = stackTypeList.length;
    let zoomPersent = 1;

    if (size > 0) {
        zoomPersent = (8 / size) * 100;
    }

    const option = {
        tooltip: {
            confine: true,
            trigger: 'axis',
            axisPointer: {
                type: 'shadow' // 'line' or 'shadow'. 기본값은 'shadow'
            },
            formatter: function (params) {
                const tooltip = params.reduce((acc, param) => {
                    const { marker, seriesName, value } = param;
                    if (param.value > 0) {
                        let data = param.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원';
                        acc += `${marker}${seriesName}: ${data}<br/>`;
                    }
                    return acc;
                }, '');

                const totalCount = params.reduce((acc, param) => acc + param.value, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원';
                const versionName = params[0].name;
                const totalTooltip = `[${versionName}] - Total: ${totalCount}<br/>`;

                return totalTooltip + tooltip;
            }
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            scrollDataIndex: 0,
            pageIconColor: '#2477ff',  // 활성화된 페이지 버튼의 아이콘 색상
            pageIconInactiveColor: '#aaa',  // 비활성화된 페이지 버튼의 아이콘 색상
            pageTextStyle: {
                color: '#fff'
            },
            pageButtonPosition: 'end',
            left: 'center',
            data: stackTypeList,
            textStyle: {
                color: 'white',
                fontSize: 11
            },
            formatter: function(value) {
                // 최대 10자까지 표시
                if (value.length > 15) {
                    return value.substring(0, 15) + '...';
                } else {
                    return value;
                }
            },
            tooltip: {
                show: true, // tooltip 활성화
            }
        },
        grid: {
            left: '5%',
            right: '0%',
            bottom: '0%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                textStyle: {
                    color: 'white',
                    fontWeight: "",
                    fontSize: "11"
                },
                rotate: 45
            },
            splitLine: {
                lineStyle: {
                    type: 'dashed',
                    color: 'white',
                    width: 0.2,
                    opacity: 0.5
                }
            }
        },
        yAxis: {
            type: 'category',
            data: Object.keys(stackVersionList),
            axisLabel: {
                textStyle: {
                    color: 'white',
                    fontWeight: "",
                    fontSize: "11"
                }
            }
        },
        series: stackTypeList.map(stackTypeData => {
            const data = Object.values(stackVersionList).map(stackVersionData => stackVersionData[stackTypeData] || defaultValue);
            return {
                name: stackTypeData,
                type: 'bar',
                stack: 'total',
                label: {
                    show: false
                },
                emphasis: {
                    focus: 'series'
                },
                data: data
            };
        }),
        dataZoom: [
            {
                type: 'inside',
                yAxisIndex: [0], // y축에만 dataZoom 기능 적용
                start: (100-zoomPersent),
                end: 100
            },
            {
                show: true,
                type: 'slider',
                left: '0%',
                backgroundColor: 'rgba(0,0,0,0)', // 슬라이더의 배경색
                dataBackgroundColor: 'rgba(255,255,255,1)', // 데이터 배경색
                yAxisIndex: [0],
                start: (100-zoomPersent),
                end: 100
            }
        ],
    };

    option && myChart.setOption(option);

    window.addEventListener('resize', function () {
        myChart.resize();
    });
}

/////////////////////////////////////////////////////////
// 요구사항 상세 차트
/////////////////////////////////////////////////////////
function 요구사항_담당자_조회(요구사항_정보) {
    let 버전 = 요구사항_정보.versionId;
    let 요구사항키_목록 = 요구사항_정보.issueKey;
    let result = {};

    if (버전_요구사항_담당자.hasOwnProperty(버전)) {
        요구사항키_목록.forEach(key => {
            if (버전_요구사항_담당자[버전].hasOwnProperty(key)) {
                result[key] = 버전_요구사항_담당자[버전][key];
            }
        });
    }

    let 요구사항_담당자_목록 = Object.keys(result).flatMap(key => Object.keys(result[key]));

    console.log(" [ analysisCost :: 요구사항별_소모비용_차트 :: 선택한 요구사항 참여 인원 정보 -> ");
    console.log(요구사항_담당자_목록);

    let 일급_합산 = 0;

    요구사항_담당자_목록.forEach(key => {
        if (전체담당자목록.hasOwnProperty(key)) {
            let 연봉 = 전체담당자목록[key].연봉;
            let 일급데이터 = Math.round((연봉 / 365)) * 10000;
            일급_합산 += 일급데이터;
        }
    });

    return 일급_합산;
}

function 요구사항_하위이슈_일자별_소모비용(요구사항_시작일, 일급, 요구사항_이슈키별_업데이트_데이터){
    let 일자별_소모비용 = [];
    let assigneeList = new Set();

    for (let key in 요구사항_이슈키별_업데이트_데이터) {
        요구사항_이슈키별_업데이트_데이터[key].forEach(data => {
            if (data.assignee !== null) {
                assigneeList.add(data.assignee);
                let updated = new Date(data.updated).toISOString().split('T')[0];
                일자별_소모비용.push({
                    updated: updated,
                    일급: 일급
                });
            }
        });
    }

    요구사항_시작일 = new Date(요구사항_시작일).toISOString().split('T')[0];

    // Set을 사용하여 중복된 assignee를 제거하고 요구사항 시작일에 대한 데이터가 없으면 추가.
    if (!일자별_소모비용.some(data => data.updated === 요구사항_시작일)) {
        일자별_소모비용.push({
            updated: 요구사항_시작일,
            일급: 0
        });
    }

    // 'updated' 필드를 기준으로 오름차순 정렬
    일자별_소모비용.sort((a, b) => new Date(a.updated) - new Date(b.updated));

    let resultData = [일자별_소모비용[0]];

    for (let i = 1; i < 일자별_소모비용.length; i++) {
        //let 시작일 = new Date(resultData[0].updated);
        let 이전_데이터 = new Date(일자별_소모비용[i - 1].updated);
        let 현재_데이터 = new Date(일자별_소모비용[i].updated);

        // 이전 업데이트 일자와의 차이를 일수로 계산
        let 일자_차이 = (현재_데이터.getTime() - 이전_데이터.getTime()) / (1000 * 60 * 60 * 24);

        // 일자 차이와 일급을 곱하여 일급을 다시 계산
        // 즉 업데이트 일까지의 소모비용을 계산 한 것
        일자별_소모비용[i].일급 = 일자_차이 * 일자별_소모비용[i].일급;

        // 중복된 날짜가 아닐 경우에만 결과 데이터에 추가
        if (resultData[resultData.length - 1].updated !== 일자별_소모비용[i].updated) {
            resultData.push(일자별_소모비용[i]);
        }
    }
//    console.log(" [ analysisCost :: 요구사항별_소모비용_차트 :: 선택한 요구사항항 일자벌 소모 비용 -> ");
//    console.log(resultData);

    return resultData;
}

function 요구사항_일자별_소모비용(요구사항_시작일,요구사항_목표_종료일, 일급,요구사항_이슈키별_업데이트_데이터){
    // 요구사항_종료일(DB에 저장된 요구사항 종료 시점) 이 없거나
    // 요구사항_이슈키별_업데이트_데이터에서 레졸루션 데이트(es에서 수집한 데이터)가 없으면 오늘 날짜까지 만듬 있으면 해당중 가장 큰날까지 만듬

    let 일자별_소모비용 = [];
    let 오늘 = new Date();
    console.log(요구사항_시작일);
    console.log(요구사항_목표_종료일);
    console.log(오늘);

    if(요구사항_목표_종료일 >= 오늘){
        for (let d = 요구사항_시작일; d <= 오늘; d.setDate(d.getDate() + 1)) {
            let dateString = d.toISOString().split('T')[0];
                일자별_소모비용.push({
                    updated: dateString,
                    일급: 일급
                });
        }
    }else{
        for (let d = 요구사항_시작일; d <= 요구사항_목표_종료일; d.setDate(d.getDate() + 1)) {
                let dateString = d.toISOString().split('T')[0];
                    일자별_소모비용.push({
                        updated: dateString,
                        일급: 일급
                    });
            }
    }

//    console.log(" [ analysisCost :: 요구사항별_소모비용_차트 :: 일자별 소모 비용 -> ");
//    console.log(일자별_소모비용);

    return 일자별_소모비용;
}

function reqCostStatusChart(data){
    var chartDom = document.getElementById('income_status_chart');

    if(data != null && data.versionId !== undefined){

        let 요구사항_정보;
        요구사항_정보 = 요구사항전체목록[data.reqId];
        console.log(" [ analysisCost :: 요구사항별_소모비용_차트 :: 선택한 요구사항 정보 -> ");
        console.log(요구사항_정보);
        // 요구사항이 생성된 일자를 시작일로 설정
        let 요구사항_시작일 = new Date(요구사항_정보.c_req_start_date); // c_req_start_date
        let 요구사항_계획일 = 요구사항_정보.c_req_plan_time;
        let 요구사항_목표_종료일 ;
        let 요구사항_종료일 = new Date(요구사항_정보.c_req_end_date);

        if(요구사항_계획일 == null){ // 요구사항 계획일이 없으면 버전 종료일로 처리
            요구사항_목표_종료일 = new Date(versionListData[data.versionId].c_pds_version_end_date);
        }else{
            let 임시데이터 = new Date(요구사항_시작일.getTime());
            임시데이터.setDate(임시데이터.getDate() + 요구사항_계획일);
            요구사항_목표_종료일 = 임시데이터;
        }

        const url = new UrlBuilder()
            .setBaseUrl('/auth-user/api/arms/analysis/cost/req-updated-list')
            .addQueryParam('issueList', data.issueKey)
            .build();

        $.ajax({
            url: url,
            type: "GET",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (apiResponse) {
                    console.log(" [ analysisCost :: 요구사항별_소모비용_차트 :: data -> ");
                    console.log(apiResponse.body);
                    let 요구사항_이슈키별_업데이트_데이터 = apiResponse.body;

                    let allIsReqTrue = Object.values(요구사항_이슈키별_업데이트_데이터).flat().every(item => item.isReq === true);
                    let 일급 =  요구사항_담당자_조회(data);
                    let 일자별_소모비용_데이터;

                    if (allIsReqTrue) {// 모든 사람이 요구사항을 직접 처리 하는 경우
                        일자별_소모비용_데이터 = 요구사항_일자별_소모비용(요구사항_시작일, 요구사항_목표_종료일, 일급,요구사항_이슈키별_업데이트_데이터);

                    } else {// 참여 하는 사람 중 하나라도 하위 이슈 생성하여 작업하는 경우
                        일자별_소모비용_데이터 = 요구사항_하위이슈_일자별_소모비용(요구사항_시작일, 일급, 요구사항_이슈키별_업데이트_데이터);
                    }
                    drawReqCostStatusChart(chartDom,요구사항_정보,일급,data,요구사항_목표_종료일,일자별_소모비용_데이터);
                }
            }
        });
    }else{
        chartDom.style.display = 'flex';
        chartDom.style.justifyContent = 'center';
        chartDom.style.alignItems = 'center';
        chartDom.innerHTML = '<p>좌측 요구사항을 선택해주세요.</p>';
    }
}

function drawReqCostStatusChart(chartDom,요구사항_정보, 일급,data,요구사항_목표_종료일,일자별_소모비용_데이터){

    var 예상비용 = 일급 * 요구사항_정보.c_req_plan_time;
    요구사항_목표_종료일 = 요구사항_목표_종료일.toISOString().substring(0, 10);

    let dates = 일자별_소모비용_데이터.map(item => item.updated);
    dates.push(요구사항_목표_종료일);

    let costData = 일자별_소모비용_데이터.map(item => item.일급);

    let accumulatedData = 일자별_소모비용_데이터.reduce((acc, item) => {
        let accumulatedCost = (acc.length > 0 ? acc[acc.length - 1] : 0) + item.일급;
        return [...acc, accumulatedCost];
    }, []);

    accumulatedData.unshift(0);

    let 누적합 = costData.map((num, idx) => num + (accumulatedData[idx] || 0));

    var myChart = echarts.init(chartDom, null, {
        renderer: "canvas",
        useDirtyRect: false
    });
    var option;
    option = {
        title: {
            text: 요구사항_정보.c_title,
            left: 'center',
            textStyle: {
                fontSize: 12,
                color: '#FFFFFF'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
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
        series: [
            {
                name: '누적 소모 비용',
                type: 'line',
                lineStyle: {
                    color: 'green',
                    type: 'dashed',
                    width: 3
                },
                itemStyle: {
                    color: 'green'
                },
                data: 누적합
            },
            {
                type: 'line',
                label: {
                    show: true,
                    position: 'top'
                },
                markLine: {
                    lineStyle: {
                        color: '#5470c6', // line color
                        type: 'dashed', // line style
                        width: 2 // line width
                    },
                    label: {
                        position: 'middle', // label이 markLine의 중간에 위치하도록 설정
                        formatter: '예상 비용', // label의 텍스트 설정
                        fontSize: 15, // label의 폰트 크기 설정
                        color: '#FFFFFF',
                        formatter: function(){
                            return '예상 비용: '+예상비용.toLocaleString();
                        }
                    },
                    data: [
                        {
                            yAxis: 예상비용,
                             name: '예상 비용' // line label
                        }
                    ]
                }
            },
            {
                type: 'line',
                label: {
                    show: true,
                    position: 'top'
                },
                markLine: {
                    lineStyle: {
                        color: '#5470c6', // line color
                        type: 'dashed', // line style
                        width: 2 // line width
                    },
                    label: {
                        position: 'middle', // label이 markLine의 중간에 위치하도록 설정
                        formatter: '요구사항 기한', // label의 텍스트 설정
                        fontSize: 15, // label의 폰트 크기 설정
                        color: '#FFFFFF',
                        formatter: function(){
                            return '요구사항 기한: '+ 요구사항_목표_종료일;
                        }
                    },
                    data: [
                        {
                            xAxis: 요구사항_목표_종료일
                        }
                    ]
                }
            },
            {
                name: '누적 소모 비용',
                type: 'bar',
                stack: 'Total',
                silent: true,
                    itemStyle: {
                        borderColor: 'transparent',
                        color: 'transparent'
                    },
                    tooltip :{
                        show:false
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: 'transparent',
                            color: 'transparent'
                        }
                    },
                    data: accumulatedData  // 누적값
                },
            {
                name: '소모 비용',
                type: 'bar',
                stack: 'Total',
                label: {
                    show: true,
                    color: '#FFFFFF',
                    position: 'top'
                },
                itemStyle: {
                    color: '#eb5454'  // 바의 색상을 빨간색으로 변경
                },
                data:costData// 증폭
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
        myChart.setOption(option);
    }
    window.addEventListener("resize", myChart.resize);
}

/////////////////////////////////////////////////////////
// 인력 연봉 대비 성과 차트
/////////////////////////////////////////////////////////
function 인력_연봉성과분포차트() {

    const tooltipFormatter = function (params) {

        let data = dataAll.filter(item => item[0] === params.value[0] && item[1] === params.value[1]);
        let tooltipContent = '<div style="font-size: 12px;">';

        if (data.length > 1) {
            for (let i = 0; i < data.length; i++) {
                tooltipContent += data[i][2] + "<br><strong>연봉</strong> : <span style=''>" + data[i][0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원'  + ", </span><strong>성과</strong> : " + data[i][1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원' + '<br>';
            }
        }
        else if (data.length === 1) {
            tooltipContent = data[0][2] + "<br><strong>연봉</strong> : <span style=''>" + data[0][0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원' + "</span><br><strong>성과</strong> : " + data[0][1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +'원';
        }

        tooltipContent += "</div>";

        return tooltipContent;
    };

    let dataAll = Object.entries(전체담당자목록).map(([key, value]) => {
        return [Number(value.연봉) *10000, Number(value.완료성과), value.이름+"["+key+"]"];
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

function 인력별_연봉대비_성과차트(전체담당자목록) {
    console.log(" [ analysisCost :: 인력별_연봉대비_성과차트 :: data -> ");
    console.log(전체담당자목록);

    let userData = [];
    let salaryData = [];
    let performanceData = [];

    Object.keys(전체담당자목록).forEach((key) => {
        userData.push(전체담당자목록[key].이름 + "[" + key + "]");
        salaryData.push(전체담당자목록[key].연봉 * 10000);
        performanceData.push(전체담당자목록[key].완료성과);
    });

    console.log(userData, salaryData, performanceData);

    let size = userData.length;
    let zoomPersent = 1;

    if (size > 0) {
        zoomPersent = (5 / size) * 100;
    }

    const fullScreenIconPath = "M18.25 10V5.75H14M18.25 14v4.25H14m-4 0H5.75V14m0-4V5.75H10";

    var dom = document.getElementById('manpower-analysis-chart');
    var myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    var option;

    option = {
        grid: {
            top: '5%',
            left: '15%',
            bottom: '15%',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none'
            },
            confine: true
        },
        xAxis: {
            data: userData,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: '#FFFFFFFF',
                opacity: 1,
                fontSize: 11,
                formatter: function(value) {
                    // 최대 10자까지 표시
                    if (value.length > 10) {
                        return value.substring(0, 10) + '...';
                    } else {
                        return value;
                    }
                },
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
                opacity: 1,
                rotate: 45
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
                data: salaryData,
                z: 10,
                label: {
                    show: false,
                },
            },
            {
                name: '성과',
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
                data: performanceData,
                z: 10,
                label: {
                    show: false,
                    position: 'outside',
                    color: "#FFFFFFFF"
                },
            },
            {
                show: false,
                name: '연봉 라벨',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                symbol: 'path://M0,0',  // 심볼을 비워서 별도의 바가 보이지 않도록 합니다.
                data: salaryData,
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
                show: false,
                name: '성과 라벨',
                type: 'pictorialBar',
                barCategoryGap: '0%',
                symbol: 'path://M0,0',  // 심볼을 비워서 별도의 바가 보이지 않도록 합니다.
                data: performanceData,
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
        ],
        toolbox: {
            show: true,
            orient: "vertical",
            left: "right",
            bottom: "50px",
            feature: {
                dataZoom: {show: true},
                myTool1: {
                    show: false,
                    title: 'Full screen',
                    icon: `path://${fullScreenIconPath}`,
                    onclick: function() {
                        $("#my_modal2").modal('show');
                        $("#my_modal2_title").text('인력별 성과 분석');
                        $("#my_modal2_description").text('인력별 연봉 대비 성과를 한눈에 확인할 수 있습니다.');
                        let heights = screen.height;// window.innerHeight;
                        console.log(heights);
                        $("#my_modal2_body").height(heights-450 + "px");
                        $("#my_modal2_body").append(`<div id="manpower-analysis-chart"></div>`);
                        setTimeout(function() {
                            myChart.resize();
                        }, 500);
                    }
                }
            },
            iconStyle: {
                borderColor: "white"
            }
        },
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0],
                start: 0,
                end: zoomPersent
            },
            {
                show: true,
                type: 'slider',
                bottom: '3%',
                backgroundColor: 'rgba(0,0,0,0)',
                dataBackgroundColor: 'rgba(255,255,255,1)',
                xAxisIndex: [0],
                start: 0,
                end: zoomPersent
            }
        ],
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

/////////////////////////////////////////////////////////
// 투입 비용 현황 차트
/////////////////////////////////////////////////////////
function compareCostsChart(){

    console.log(" [ analysisCost :: compareCostsChart :: data -> ");
    console.log(versionListData);

    let selectedVersions = selectedVersionId.split(','); // 문자열을 배열로 변환

    let selectVersionData = [];
    for (let i = 0; i < selectedVersions.length; i++) {
        let item = versionListData[selectedVersions[i]];
        selectVersionData.push(item);
    }

    let chartDom = document.getElementById("compare_costs");
    let myChart = echarts.init(chartDom);
    let option;

    let titles = selectVersionData.map(item => item.c_title);
    let consumptionCosts = selectVersionData.map(item => item.버전비용);

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
                color: '#FFFFFF',
                rotate: 45
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