var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId; // 선택된 버전 아이디
var dataTableRef;
// 최상단 메뉴 변수
var req_state, resource_info, issue_info, period_info, total_days_progress;
var modifiedRows = {};
var dashboardColor;
let fileName = "인력별_연봉정보_템플릿.xlsx";
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
            //  최상단 메뉴
            "js/analysis/topmenu/topMenuApi.js",
            "js/analysis/topmenu/basicRadar.js",
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
            "../arms/js/analysis/resource/sankey.js"
        ],
        [
            "https://fonts.googleapis.com/css?family=Material+Icons",
            "../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jsuites.js",
            "../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jsuites.css",
            "../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/index.js",
            "../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jspreadsheet.css",
            // "../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jspreadsheet.datatables.css",
            "../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jspreadsheet.theme.css"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
      .then(function() {

          //vfs_fonts 파일이 커서 defer 처리 함.
          setTimeout(function () {
              var script = document.createElement("script");
              script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
              script.defer = true; // defer 속성 설정
              document.head.appendChild(script);
          }, 5000); // 5초 후에 실행됩니다.

          //pdfmake 파일이 커서 defer 처리 함.
          setTimeout(function () {
              var script = document.createElement("script");
              script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js";
              script.defer = true; // defer 속성 설정
              document.head.appendChild(script);
          }, 5000); // 5초 후에 실행됩니다.

          // 사이드 메뉴 색상 설정
          $(".widget").widgster();
          setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_cost");

          //제품(서비스) 셀렉트 박스 이니시에이터
          makePdServiceSelectBox();

          //버전 멀티 셀렉트 박스 이니시에이터
          makeVersionMultiSelectBox();

          // 높이 조정
          $('.top-menu-div').matchHeight({
              target: $('.top-menu-div-scope')
          });

          비용분석계산버튼();

          dashboardColor = dashboardPalette.dashboardPalette01;

      })
      .catch(function(e) {
          console.error("플러그인 로드 중 오류 발생");
          console.error(e);
      });
}

///////////////////////
//제품 서비스 셀렉트 박스
//////////////////////
function makePdServiceSelectBox() {
    //제품 서비스 셀렉트 박스 이니시에이터
    $(".chzn-select").each(function() {
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
            200: function(data) {
                //////////////////////////////////////////////////////////
                pdServiceListData = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceListData.push({ "pdServiceId": obj.c_id, "pdServiceName": obj.c_title });
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $("#selected_pdService").append(newOption).trigger("change");
                }
                //////////////////////////////////////////////////////////
                console.log("[analysisCost :: makePdServiceSelectBox] :: pdServiceListData => ");
                console.log(pdServiceListData);
            }
        }
    });

    $("#selected_pdService").on("select2:open", function() {
        //슬림스크롤
        makeSlimScroll(".select2-results__options");
    });

    // --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
    $("#selected_pdService").on("select2:select", function(e) {
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
        onClose: function() {
            console.log("onOpen event fire!\n");

            var checked = $("#checkbox1").is(":checked");
            var endPointUrl = "";
            var versionTag = $(".multiple-select").val();
            console.log("[ analysisCost :: makeVersionMultiSelectBox ] :: versionTag");
            console.log(versionTag);
            selectedVersionId = versionTag.join(",");

            if (versionTag === null || versionTag == "") {
                jError("버전이 선택되지 않았습니다.");
                return;
            }

            차트초기화();

            // 최상단 메뉴 세팅
            TopMenuApi.톱메뉴_초기화();
            TopMenuApi.톱메뉴_세팅();

            버전별_요구사항별_인력정보가져오기(selectedPdServiceId, selectedVersionId);
            $(".ms-parent").css("z-index", 1000);
        },
        onOpen: function() {
            console.log("open event");
            $(".ms-parent").css("z-index", 9999);
        }
    });
}

function productCostChart() {
    const url = new UrlBuilder()
      .setBaseUrl('/auth-user/api/arms/analysis/cost/product-accumulate-cost-by-month')
      .addQueryParam('pdServiceLink', selectedPdServiceId)
      .addQueryParam('pdServiceVersionLinks', selectedVersionId)
      .addQueryParam("isReqType", "ISSUE")
      .addQueryParam('메인그룹필드', "cReqLink")
      .addQueryParam('하위그룹필드들', "assignee.assignee_accountId.keyword")
      .build();

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function(apiResponse) {
                var responseMap = apiResponse.response;
                var line = responseMap.line;
                var bar = responseMap.bar;
                var candleStick = responseMap.candleStick;
                console.log(" [ analysisCost :: line ] :: response data -> " + JSON.stringify(line));
                console.log(" [ analysisCost :: bar ] :: response data -> " + JSON.stringify(bar));
                console.log(" [ analysisCost :: candleStick ] :: response data -> " + JSON.stringify(candleStick));
                var maxCost = Math.max(...Object.values(line));
                var productChartDom = document.getElementById('product-accumulate-cost-by-month');
                $(productChartDom).height("500px");
                var productCostChart = echarts.init(productChartDom);
                var option;
                var dates = Object.keys(line);
                var lineCosts = Object.values(line);
                var barCosts = Object.values(bar);
                var candleStickCosts = Object.values(candleStick);
                option = {
                    dataZoom: [{
                        type: 'slider',
                        start: 0,
                        end: 100
                    }],
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                            var lineTooltip = new Intl.NumberFormat().format(params[0].value);
                            var barTooltip = new Intl.NumberFormat().format(params[1].value);
                            var candleStickTooltip = params[2] ? params[2].value : null;
                            var candleText = '';
                            if (candleStickTooltip) {
                                var 시가 = new Intl.NumberFormat().format(candleStickTooltip[1]);
                                var 종가 = new Intl.NumberFormat().format(candleStickTooltip[2]);
                                var 최저가 = new Intl.NumberFormat().format(candleStickTooltip[3]);
                                var 최고가 = new Intl.NumberFormat().format(candleStickTooltip[4]);
                                candleText = `시가: ${시가}<br>종가: ${종가}<br>최저가: ${최저가}<br>최고가: ${최고가}`;
                                return '날짜: ' + params[0].name + '<br>성과 기준선: ' + lineTooltip + '<br>성과: ' + barTooltip + (candleText ? '<br>' + candleText : '');
                            } else {
                                return '날짜: ' + params[0].name + '<br>성과 기준선: ' + lineTooltip + '<br>성과: ' + barTooltip;
                            }
                        }
                    },
                    xAxis: {
                        type: 'category',
                        data: dates,
                        axisLabel: {
                            textStyle: {
                                color: 'white',
                            },
                        },
                    },
                    yAxis: [
                        {
                            type: 'value',
                            min: 0,
                            max: maxCost,
                            interval: Math.floor(maxCost / 10),
                            name: '누적 성과 비용',
                            nameTextStyle: {
                                color: 'white',
                            },
                            axisLabel: {
                                textStyle: {
                                    color: 'white',
                                },
                            },
                        },
                        {
                            type: 'value',
                            scale: true,
                            name: '총 연봉 비용 변동 추이',
                            nameTextStyle: {
                                color: 'white',
                            },
                            axisLabel: {
                                textStyle: {
                                    color: 'white',
                                },
                            },
                        }
                    ],

                    legend: {
                        data: ['누적 성과 기준선', '누적 성과 비용', '총 연봉 비용 변동 추이'],
                        textStyle: {
                            color: 'white',
                        },
                    },
                    series: [{
                        name: '누적 성과 기준선',
                        data: lineCosts,
                        type: 'line',
                        yAxisIndex: 0,
                        textStyle: {
                            color: 'white',
                        },
                    }, {
                        name: '누적 성과 비용',
                        data: barCosts,
                        type: 'bar',
                        yAxisIndex: 0,
                        textStyle: {
                            color: 'white',
                        },
                    },
                    {
                        name: '총 연봉 비용 변동 추이',
                        type: 'candlestick',
                        data: candleStickCosts,
                        yAxisIndex: 1,
                        itemStyle: {
                            color: 'red', // 양봉 색상
                            color0: 'blue', // 음봉 색상
                            borderColor: 'red', // 테두리 색상
                            borderColor0: 'blue', // 음봉 테두리 색상
                            // borderWidth: 3, // 테두리 두께
                        },
                        textStyle: {
                            color: 'white',
                        },
                        // barWidth: 3, // 캔들 가로 두께
                    }]
                };

                if (option && typeof option === 'object') {
                    productCostChart.setOption(option);
                }
                window.addEventListener('resize', productCostChart.resize);
            }
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
            200: function(data) {
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
                selectedVersionId = pdServiceVersionIds.join(",");

                // 최상단 메뉴 세팅
                TopMenuApi.톱메뉴_초기화();
                TopMenuApi.톱메뉴_세팅();

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

////////////////////////////////////////////////////////////////////////////////////////
// 연봉 정보 수정 PUT API 호출
////////////////////////////////////////////////////////////////////////////////////////
function updateSalary() {
    return $.ajax({
        url: "/auth-user/api/arms/salaries/update.do",
        type: "PUT",
        data: {
            c_annual_income: $("#editview_assignee_salary").val(),
            c_key: $("#editview_assignee_key").val()
            // plan_resource: $("#editview_assignee_plan_resource").val(),
            // assignee_start_date: new Date($("#editview_assignee_start_date").val()),
            // assignee_end_date: new Date($("#editview_assignee_end_date").val()),
        }
    });
}


function 버전별_요구사항별_인력정보가져오기(pdServiceLink, pdServiceVersionLinks) {

    $(".spinner").html(
      '<img src="./img/loading.gif" alt="로딩" style="width: 16px;"> ' +
      "요구사항별 인력정보를 조회 중 입니다..."
    );

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
        async: false,
        statusCode: {
            200: function(apiResponse) {
                console.log(" [ analysisCost :: 버전별_요구사항별_인력정보가져오기 ] :: response data -> ");
                console.log(apiResponse.response);
                버전_요구사항_담당자 = apiResponse.response.버전_요구사항_담당자;
                전체담당자목록 = apiResponse.response.전체담당자목록;

                Object.keys(전체담당자목록).forEach((key) => {
                    //전체담당자목록[key].연봉 = 연봉;
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
                <!-- <button
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
                </button> -->
            </div>
            <div class="fileupload-loading">
                <i class="fa fa-spin fa-spinner"></i>
            </div>
            <!-- The table listing the files available for upload/download -->
            <!--<table
                    role="presentation"
                    class="table table-striped"
                    style="margin-bottom: 5px">
                <tbody
                        class="files"
                        data-toggle="modal-gallery"
                        data-target="#modal-gallery"></tbody>
            </table>-->
        </form>
    `);

    // Initialize the jQuery File Upload widget:
    var $fileupload = $("#fileupload");
    $fileupload.fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        autoUpload: true,
        url: "/auth-user/api/arms/salaries/excel-upload.do",
        dropZone: $("#dropzone"),
        limitMultiFileUploads: 1,
        paramName: 'excelFile',
        // Callback for successful uploads:
        fail: function(e, data) {
            console.log("--------------------------");
            console.log(data);

            jError(data.jqXHR.responseJSON.error.message);
        },
        done: function(e, data) {
            console.log("--------------------------");
            console.log(data);
            if (data.textStatus == "success") {
                jNotify("업로드한 연봉 정보가 반영되었습니다.");
            } else {
                jError("데이터 반영 중 에러가 발생했습니다. 엑셀 파일을 확인해주세요");
            }

            버전별_요구사항별_인력정보가져오기(selectedPdServiceId, selectedVersionId);
            manpowerInput(전체담당자목록); //데이터 테이블 재 로드
            $("#cost-analysis-calculation").click(); // 비용 계산 버튼 클릭

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
    인력별_연봉정보 = Object.keys(전체담당자목록).map((key) => {
        let data = {};
        data.이름 = 전체담당자목록[key].이름;
        data.키 = key;
        data.연봉 = 전체담당자목록[key].연봉;
        return data;
    });
    console.log(" [ analysisCost :: manpowerInput ] :: 인력별_연봉정보 => " + JSON.stringify(인력별_연봉정보));

    jspreadsheetRender(인력별_연봉정보);

    // 템플릿 다운로드
    excel_download(인력별_연봉정보);
}

function excel_download(인력별_연봉정보) {
    console.log(" [ analysisCost :: excel_download ] :: 인력별_연봉정보 => " + JSON.stringify(인력별_연봉정보));

    let fileName = "인력별_연봉정보_템플릿.xlsx";

    $("#excel-annual-income-template-download").click(function() {
        if (Object.keys(인력별_연봉정보).length === 0) {
            jError("다운로드할 인력 정보가 없습니다.");
        } else {
            $.ajax({
                url: "/auth-user/api/arms/salaries/excel-download.do?excelFileName=" + fileName,
                type: "POST",
                data: JSON.stringify(인력별_연봉정보),
                contentType: "application/json",
                xhrFields: {
                    responseType: 'blob'  // 응답 데이터 타입을 blob으로 설정
                },
                statusCode: {
                    200: function(data) {
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
    $("#cost-analysis-calculation").on('click', async function() {
        //spinnerSettingWithText("", "비용분석 계산 중 입니다...");

        if (!selectedPdServiceId || !selectedVersionId) {
            jError("제품(서비스), 버전을 선택해주세요.");
            return;
        }

        let isEmpty = true;
        // 연봉 정보 유효성 체크 및 세팅, 담당자목록 성과 초기화
        for (let owner in 전체담당자목록) {
            전체담당자목록[owner].인력별소모비용 = 0;
            전체담당자목록[owner].완료성과 = 0;

            if (isNaN(전체담당자목록[owner].연봉)) {
                jError(owner + "의 연봉 정보가 잘못되었습니다. 숫자만 입력해주세요.");
                return;
            }
            isEmpty = false;
        }

        if (isEmpty) {
            jError("요구사항에 할당된 담당자가 없습니다.");
            return;
        }

        productCostChart();

        비용계산데이터_초기화();

        console.log(" [ analysisCost :: 비용 분석 계산 ] :: 전체담당자목록 -> ");
        console.log(전체담당자목록);

        const url = new UrlBuilder()
          .setBaseUrl("/auth-user/api/arms/analysis/cost/req-linked-issue")
          .addQueryParam("pdServiceLink", selectedPdServiceId)
          .addQueryParam("pdServiceVersionLinks", selectedVersionId)
          .build();

        const url2 = new UrlBuilder()
          .setBaseUrl("/auth-user/api/arms/analysis/cost/T_ARMS_REQADD_" + selectedPdServiceId + "/req-difficulty-priority-list")
          .addQueryParam("c_req_pdservice_versionset_link", selectedVersionId)
          .build();

        const completeKeywordUrl = new UrlBuilder()
          .setBaseUrl("/auth-user/api/arms/reqState/complete-keyword")
          .build();

        try {
            $(".spinner").html(
              "<img src=\"./img/loading.gif\" width='20px' height='20px' style='margin-bottom: 3px;'/> 비용분석계산 API 실행 중입니다..."
            );
            const data1 = await $.ajax({ url: url, type: "GET", dataType: "json" });
            console.log("[ analysisCost :: 비용분석계산 API 1 ] :: data1 => ");
            console.log(data1);

            const data2 = await $.ajax({ url: url2, type: "GET", dataType: "json" });
            console.log("[ analysisCost :: 비용분석계산 API 2 ] :: data2 => ");
            console.log(data2);

            const data3 = await $.ajax({ url: completeKeywordUrl, type: "GET", dataType: "json" });
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
            for (const 요구사항 of Object.values(요구사항전체목록)) {
                // 요구사항 전체목록을 반복문 돌기 및 요구사항별 단가 초기화
                요구사항.요구사항금액 = 0;

                // 해당 요구사항이 멀티 버전일 수 있으니 버전목록을 가져옴
                let 요구사항이포함된버전목록 = JSON.parse(요구사항.c_req_pdservice_versionset_link);

                // 요구사항의 버전목록을 반복문 돌기
                for (const 버전 of 요구사항이포함된버전목록) {
                    // 해당 버전에 요구사항 키 목록을 가져옴
                    let 버전_요구사항_키목록 = 요구사항별_키목록[버전];

                    // 버전의 요구사항 목록 유무 확인
                    if (버전_요구사항_키목록 != null) {
                        // 있을 시 계산, 버전과 요구사항 c_id로 해당 요구사항이 가진 키목록 데이터 가져오기
                        let 요구사항_키목록 = 버전_요구사항_키목록[요구사항.c_id];

                        // 요구사항 키 목록 유무 확인
                        if (요구사항_키목록 != null) {
                            // 있을 시 키목록을 반목문 돌기
                            for (const 요구사항키 of 요구사항_키목록) {
                                // 키 별 담당자목록 조회를 위한 버전_요구사항_담당자 중 버전 유무 확인
                                let 요구사항_담당자목록 = 버전_요구사항_담당자[버전];
                                if (요구사항_담당자목록 != null) {
                                    // 있으면 버전_요구사항_담당자 중 담당자목록 유무 확인
                                    let 담당자목록 = 요구사항_담당자목록[요구사항키.c_issue_key];
                                    if (담당자목록 != null) {
                                        // 있으면 담당자목록을 반목문 돌기
                                        for (const [key, value] of Object.entries(담당자목록)) {
                                            // 요구사항의 비용 계산을 위한 날짜 카운팅 ****** 수정필요(정책) ******

                                            // 요구사항 단가 계산 및 인력 성과 계산 등
                                            최종비용분석계산(key, 요구사항, 버전, 요구사항키, data3);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            data2.requirement = 요구사항전체목록;
            $("#req-cost-analysis-chart").height("500px");
            요구사항비용분석차트(data2);

            $("#manpower-analysis-chart").height("500px");
            인력별_연봉대비_성과차트(전체담당자목록);

            let pdServiceName;
            pdServiceListData.forEach(elements => {
                if (elements["pdServiceId"] === +selectedPdServiceId) {
                    pdServiceName = elements["pdServiceName"];
                }
            });

            $("#version-stack-container").height("500px");
            버전소모비용스택차트();
        } catch (error) {
            console.log('Error:', error);
            jError("비용 분석 계산 중 에러가 발생했습니다.");
        }

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
    clearChart('product-accumulate-cost-by-month');
    clearChart('compare_costs');
    clearChart('req-cost-analysis-chart');
    clearChart('manpower-analysis-chart');
    clearChart('version-stack-container');


    $("#product-accumulate-cost-by-month").height("0px");
    $("#compare_costs").height("0px");
    $("#req-cost-analysis-chart").height("0px");
    $("#manpower-analysis-chart").height("0px");
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
    let priorityJson = data.priority;

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
                subtext: '전체 ' + reqTotalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '원',
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
                    color: '#a4c6ff',
                    rotate: 0,
                    formatter: function(value) {
                        // 최대 20자까지 표시
                        if (value.length > 40) {
                            return value.substring(0, 40) + '...';
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
                label: {
                    show: true,
                    textStyle: {
                        color: 'white',
                        fontSize: 12
                    }
                },
                data: difficultyData,
            },
            {
                type: 'pie',
                radius: [0, '30%'],
                center: ['80%', '75%'],
                label: {
                    show: true,
                    textStyle: {
                        color: 'white',
                        fontSize: 12
                    }
                },
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

function 버전소모비용스택차트() {

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
        data = 전체담당자목록[key].이름 + "[" + key + "]";
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
            formatter: function(params) {
                const tooltip = params.reduce((acc, param) => {
                    const { marker, seriesName, value } = param;
                    if (param.value > 0) {
                        let data = param.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '원';
                        acc += `${marker}${seriesName}: ${data}<br/>`;
                    }
                    return acc;
                }, '');

                const totalCount = params.reduce((acc, param) => acc + param.value, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '원';
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
                start: (100 - zoomPersent),
                end: 100
            },
            {
                show: true,
                type: 'slider',
                left: '0%',
                backgroundColor: 'rgba(0,0,0,0)', // 슬라이더의 배경색
                dataBackgroundColor: 'rgba(255,255,255,1)', // 데이터 배경색
                yAxisIndex: [0],
                start: (100 - zoomPersent),
                end: 100
            }
        ],
    };

    option && myChart.setOption(option);

    window.addEventListener('resize', function() {
        myChart.resize();
    });
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
                    formatter: function(params) {
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
                    formatter: function(params) {
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
                dataZoom: { show: true },
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
                        $("#my_modal2_body").height(heights - 450 + "px");
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

function jspreadsheetRender(data) {
    var spreadsheetElement = document.getElementById("spreadsheet");

    if (spreadsheetElement.jexcel) {
        spreadsheetElement.jexcel.destroy();
    }

    var sheet = jspreadsheet(spreadsheetElement, {
        // allowComments: true,
        contextMenu: function(o, x, y, e, items) {
            var items = [];

            // Save
            items.push({
                title: jSuites.translate('Save as'),
                shortcut: 'Ctrl + S',
                icon: 'save',
                onclick: function () {
                    o.download();
                }
            });

            return items;
        },
        search:true,
        pagination:10,
        data: data,
        columns: [
            { type: "text", title: "이름", readOnly: true },
            { type: "text", title: "키",  readOnly: true  },
            { type: "text", title: "연봉"  }
        ],
        onbeforechange: function(instance, cell, x, y, value) {
            var cellName = jspreadsheet.getColumnNameFromId([x,y]);
            console.log('The cell ' + cellName + ' will be changed' + '\n');
        },
        oninsertcolumn: function(instance) {
            console.log('Column added' + '\n');
        },
        onchange: function(instance, cell, x, y, value) {
            var cellName = jspreadsheet.getColumnNameFromId([x,y]);
            console.log('onchange :: ' + cell + " :;  x :: " + x + " :: y :: " + y +" :: cellName ::" + cellName + ' to: ' + value + '\n');
            if (x == 2) {
                var key = instance.jexcel.getValueFromCoords(1, y);
                if (!modifiedRows[key]) {
                    modifiedRows[key] = {};
                }
                modifiedRows[key].이름 = instance.jexcel.getValueFromCoords(0, y);
                modifiedRows[key].키 = instance.jexcel.getValueFromCoords(1, y);
                modifiedRows[key].연봉 = value;
            }
        },
        oninsertrow: function(instance, rowNumber) {
            console.log('Row added' + rowNumber);
        },
        ondeleterow: function(instance, rowNumber) {
            console.log('Row deleted' + rowNumber);
        },
        ondeletecolumn: function(instance) {
            console.log('Column deleted' +'\n');
        },
        onselection: function(instance, x1, y1, x2, y2, origin) {
            var cellName1 = jspreadsheet.getColumnNameFromId([x1, y1]);
            var cellName2 = jspreadsheet.getColumnNameFromId([x2, y2]);
            console.log('The selection from ' + cellName1 + ' to ' + cellName2 + '' + '\n');
        },
        onsort: function(instance, cellNum, order) {
            var order = (order) ? 'desc' : 'asc';
            console.log('The column  ' + cellNum + ' sorted by ' + order + '\n');
        },
        onresizerow: function(instance, cell, height) {
            console.log('The row  ' + cell + ' resized to height ' + height + ' px' + '\n');
        },
        onresizecolumn: function(instance, cell, width) {
            console.log('The column  ' + cell + ' resized to width ' + width + ' px' + '\n');
        },
        onmoverow: function(instance, from, to) {
            console.log('The row ' + from + ' was move to the position of ' + to + ' ' + '\n');
        },
        onmovecolumn: function(instance, from, to) {
            console.log('The col ' + from + ' was move to the position of ' + to + ' ' + '\n');
        },
        onload: function(instance) {
            console.log('New data is loaded' + '\n');
        },
        onblur: function(instance) {
            console.log('The table ' + $(instance).prop('id') + ' is blur' + '\n');
        },
        onfocus: function(instance) {
            console.log('The table ' + $(instance).prop('id') + ' is focus' + '\n');
        },
        onpaste: function(data) {
            console.log('Paste on the table ' + $(instance).prop('id') + '' + '\n');
        },
    });

}

$(document).ready(function() {
    $("#cost-excel-batch-update").on('click', function() {
        if (Object.keys(modifiedRows).length === 0) {
            jError("수정된 연봉 데이터가 없습니다.");
            return;
        }
        var data = $("#spreadsheet").jexcel("getData");

        var isValid = data.every(function(row) {
            if (!row[0] || !row[1] || !row[2]) {
                return true;
            }
            return !isNaN(row[2]) && row[2] !== "";
        });

        if (!isValid) {
            jError("연봉 데이터는 숫자만 입력해야하며, 값이 존재해야 합니다.");
        } else {
            $(".spinner").html(
              "<img src=\"./img/loading.gif\" width='20px' height='20px' style='margin-bottom: 3px;'/> 연봉 데이터 업데이트 중입니다..."
            );
            $.ajax({
                url: "/auth-user/api/arms/salaries",
                type: "PUT",
                data: JSON.stringify(modifiedRows),
                contentType: "application/json",
                statusCode: {
                    200: function(apiResponse) {
                        var response = apiResponse.response;
                        버전별_요구사항별_인력정보가져오기(selectedPdServiceId, selectedVersionId);
                        modifiedRows = {};
                        jSuccess("연봉 정보가 수정되었습니다.");
                    }
                }
            });
        }
    });


});