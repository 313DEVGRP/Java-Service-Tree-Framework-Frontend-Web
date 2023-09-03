//////////////////////////////////
// Page 전역 변수
//////////////////////////////////
var selectId;   // 선택한 대상 아이디(c_id)
var selectName; // 선택한 대상 이름 (c_title)
var selectServerId;   // 선택한 서버 이름 (c_id)
var selectServerName; // 선택한 서버 이름 (c_jira_server_name )
var selectServerType; // 선택한 서버 타입 (c_jira_server_type, 클라우드 or 온프레미스)
var selectedTab;
var selectProjectId; // 선택한 지라프로젝트 아이디
var selectRadioId; // 이슈 유형 or 이슈 상태 or 이슈 해결책 or

var selectedIndex; // 데이터테이블 선택한 인덱스
var selectedPage;  // 데이터테이블 선택한 인덱스

var dataTableRef; // 데이터테이블 참조 변수


////////////////
//Document Ready
////////////////
function execDocReady() {

    var pluginGroups = [

        [	"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
            "../reference/lightblue4/docs/lib/d3/d3.min.js",
            "../reference/lightblue4/docs/lib/nvd3/build/nv.d3.min.js",
            "../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js"],

        [	"../reference/jquery-plugins/select2-4.0.2/dist/css/jira_server_connection.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

        [	"../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
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
            "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"],

        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function() {

            //vfs_fonts 파일이 커서 defer 처리 함.
            setTimeout(function() {
                var script = document.createElement("script");
                script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
                script.defer = true; // defer 속성 설정
                document.head.appendChild(script);
            }, 2000); // 2초 후에 실행됩니다.
            console.log('모든 플러그인 로드 완료');

            //사이드 메뉴 처리
            $('.widget').widgster();
            setSideMenu("sidebar_menu_jira", "sidebar_menu_jira_manage");

            var waitCardDeck = setInterval( function () {
                try {
                    // 카드 덱(서버 목록) 이니시에이터
                    makeJiraServerCardDeck();
                    clearInterval(waitCardDeck);
                } catch (err) {
                    console.log("지라 서버 데이터 로드가 완료되지 않아서 초기화 재시도 중...");
                }
            }, 313 /* milli */);


            // --- 에디터 설정 --- //
            var waitCKEDITOR = setInterval( function () {
                try {
                    if (window.CKEDITOR) {
                        if(window.CKEDITOR.status == "loaded"){
                            CKEDITOR.replace("input_jira_server_editor",{ skin: "prestige" });
                            CKEDITOR.replace("detailview_jira_server_contents",{ skin: "prestige" });
                            CKEDITOR.replace("extend_modal_editor",{ skin: "prestige" }); //팝업편집
                            CKEDITOR.replace("modal_editor",{ skin: "prestige" });
                            clearInterval(waitCKEDITOR);
                        }
                    }
                } catch (err) {
                    console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
                }
             }, 1000); //313ms

            tab_click_event();

            default_setting_event();

            save_btn_click();
            delete_btn_click();
            update_btn_click();

            popup_size_setting();

            popup_update_btn_click();

            autoSlide();

        })
        .catch(function() {
            console.error('플러그인 로드 중 오류 발생');
        });

}

function makeJiraServerCardDeck() {
    console.log("지라 서버 카드 목록 생성");
    // 지라 서버 목록 데이터 가져오기 및 element 삽입
    $.ajax({
        url: "/auth-user/api/arms/jiraServer/getJiraServerMonitor.do",
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                /////////////////// insert Card ///////////////////////
                var obj = data.response;
                draw_card_deck(obj);
            }
        },
        beforeSend: function () {
            //$("#regist_pdservice").hide(); 버튼 감추기
        },
        complete: function () {
            //$("#regist_pdservice").show(); 버튼 보이기
        },
        error: function (e) {
            jError("지라(서버) 목록 조회 중 에러가 발생했습니다.");
        }
    });
}

function draw_card_deck(cardInfo) {
    $("#jira_server_card_deck").html(""); // 카드 덱 초기화
    var cardList = [];
    cardList = cardInfo;
    console.log(cardList.length); // 목록 크기

    var data=``;

    if (cardList.length == 0) { // 카드 없음 (등록된 서버 없음)

    } else { // 카드 있음 (등록된 서버 있음)
        for (let i = 0; i < cardList.length; i++) {
            let insertImage = '';
            if (cardList[i].c_jira_server_type == '클라우드') {
                insertImage = `<img src="./img/jira/mark-gradient-white-jira.svg" width="30px" style=""></img>`;
            }
            if (cardList[i].c_jira_server_type == '온프레미스') {
                insertImage = `<img src="./img/jira/mark-gradient-blue-jira.svg" width="30px" style=""></img>`;
            }

            data +=
            `
            <div class="card mb-2 ribbon-box ribbon-fill right" onclick="jiraServerCardClick(${cardList[i].c_id})">
                <!-- 리본표시 -->
                ${draw_ribbon_result_of_issueType_check(cardList[i])}
                <!--카드내용1-->
                <div class="card-body">
                    <div class="" style="display: flex; align-items: baseline;">
                        <div class="flex-shrink-0 card-icon-wrap">
                            <div class="card-icon bg-light rounded">
                                ${insertImage}
                            </div>
                        </div>
                        <div class="flex-grow-1 ml-4 mb-2">
                            <h5 class="fs-15 mb-1 font14">${cardList[i].c_title}</h5>
                            <p class="font13 text-muted">${cardList[i].c_jira_server_base_url}</p>
                        </div>
                    </div>
                    <!-- 값 가져와서 넣어줄 예정 -->
                    <p class="font13 mt-1" style="margin-bottom: 0px;">                        
                        <span class="badge card-detai text-success" onclick="jira_renew('프로젝트',${cardList[i].c_id})">프로젝트</span>
                        <span class="card-detail" style="color: #a4c6ff">${chk_default_settings_icon(cardList[i].jiraProjectEntities)}</span>
                        
                        <span class="badge card-detail text-success" onclick="jira_renew('이슈유형',${cardList[i].c_id})">이슈유형</span>
                        <span class="card-detail" style="color: #a4c6ff">${num_of_issue_type_and_status(cardList[i], "이슈유형")}</span>
                        
                        <span class="badge card-detail text-success" onclick="jira_renew('이슈우선순위',${cardList[i].c_id})">이슈우선순위</span>
                        <span class="card-detail" style="color: #a4c6ff">${chk_default_settings_icon(cardList[i].jiraIssuePriorityEntities)}</span>
                        
                        <span class="badge card-detail text-success" onclick="jira_renew('이슈해결책',${cardList[i].c_id})">이슈해결책</span>
                        <span class="card-detail" style="color: #a4c6ff">${chk_default_settings_icon(cardList[i].jiraIssueResolutionEntities)}</span>
                        
                        <span class="badge card-detail text-success" onclick="jira_renew('이슈상태',${cardList[i].c_id})">이슈상태</span>
                        <span class="card-detail" style="color: #a4c6ff">${num_of_issue_type_and_status(cardList[i], "이슈상태")}</span>
                    </p>                    

                </div>
                <!--카드내용2-->
                <div class="card-body top-border border-top">
                    <div class="d-flex-sb-11">
                        <div class="flex-grow-1">
                            <h6 class="font13">status: <i class="fa fa-circle-o">200</i></h6>
                        </div>
                        <h6 class="font13">Last Update - <i class="fa fa-clock-o mr-2"></i>08 Aug, 2023</h6>
                    </div>
                </div>
            </div>
            `;
        }
    }
    $("#jira_server_card_deck").html(data);
}

////////////////////////////////////////////////////////////////////////////////////////
// --- 데이터 테이블 설정 --- // (사용 X)
////////////////////////////////////////////////////////////////////////////////////////
function dataTableLoad() {
    // 데이터 테이블 컬럼 및 열그룹 구성
    var columnList = [
        { name: "c_id", title: "지라(서버) 아이디", data: "c_id", visible: false },
        {
            name: "c_jira_name",
            title: "프로젝트 이름",
            data: "jiraProjectEntities",
            render: function (data, type, row, meta) {
                if (type === "display") {
                    return '<label style="color: #a4c6ff">' + data + "</label>";
                }
                return data+1;
            },
            className: "dt-body-left",

            visible: true
        },
        { name: "c_jira_server_type", title: "서버 타입", data: "c_jira_server_type", visible: true,
            render: function (data, type, row, meta) {
                if (type ==="display") {
                    console.log("data =" + data);
                    if ( data == "cloud") {
                        return '<label style="color: #FFFFFF; margin-right: 5%;">' + '클라우드' + "</label>"+'<i class="fa fa-cloud">'+"</i>";
                        //return '<label style="color: #a4c6ff">' + "클라우드" + "</label>";
                    } else {
                        return '<label style="color: #FFFFFF; margin-right: 5%;">' + '온프레미스' + "</label>"+'<i class="fa fa-home">'+"</i>";
                    }
                }
            },
            className: "dt-body-center",
            width: "100px"
        },
    ];
    var rowsGroupList = [];
    var columnDefList = [];
    var selectList = {};
    var orderList = [[1, "asc"]];
    var buttonList = [];

    var jquerySelector = "#jira_connection_table"; //
    var ajaxUrl = "/auth-user/api/arms/jiraServer/getJiraServerMonitor.do"; // 사용 예정
    var jsonRoot = "response";
    var isServerSide = false;

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
        isServerSide
    );
}


// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
// 데이터 테이블을 사용하지 않으므로, 쓰지 않아도 된다.
function dataTableClick(tempDataTable, selectedData) {
    // => 카드 목록 클릭시 해당 카드의 c_id를 활용해서 가져오도록 만들어야 함
    console.log(selectedData);
    selectId = selectedData.c_id;

    // c_id로 getNode 실행
    //jiraServerCardClick(selectId);
    if(selectedData.c_jira_name !== undefined) {
        selectProjectId = selectedData.c_id;
        console.log("selectProjectId = " + selectProjectId);
    }
}

/////////////////////////////////////
// 지라 서버 클릭할 때 동작하는 함수
// 1. 상세보기 데이터 바인딩
// 2. 편집하기 데이터 바인딩
/////////////////////////////
function jiraServerCardClick(c_id) {
    $.ajax({
        url: "/auth-user/api/arms/jiraServer/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
        data: { c_id: c_id },
           //     c_jira_server_type: c_jira_server_type}, // HTTP 요청과 함께 서버로 보낼 데이터
        method: "GET",
        dataType: "json", // 서버에서 보내줄 데이터의 타입
        beforeSend: function () {
            $(".loader").removeClass("hide");
        }
    })
        // HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
        .done(function (json) {
            console.log(json);
            $("#nav_stats>a").click();
            display_set_wide_projectTable();

            selectServerType ="";
            selectServerId = json.c_id;
            selectServerType = json.c_jira_server_type;
            if (selectServerType === "클라우드") {
                $("#type_tab").hide();
                $("#status_tab").hide();
            } else {
                $("#type_tab").show();
                $("#status_tab").show();
            }

            //지라 프로젝트 갱신버튼 c_id 설정
            $("#jira_project_renew_div").html("");
            var renewProjectBtnHtml = `
                <button type="button"
                            id="jira_project_renew_btn"
                            onClick="jira_renew('project', ${json.c_id})"
                            class="btn btn-success btn-sm">
                        프로젝트 갱신
                </button>
            `;
            $("#jira_project_renew_div").html(renewProjectBtnHtml);

            // Sender 설정
            var selectedHtml =
                `<div class="chat-message">
				<div class="chat-message-body" style="margin-left: 0px !important;">
					<span class="arrow" style="top: 35% !important;"></span>
					<span class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 선택된 서버 :  </span>
				<span class="text" style="color: #a4c6ff;">
				` + json.c_title +
                `
				</span>
				</div>
				</div>
				`;

            $(".list-group-item").html(selectedHtml);

            // => 데이터 바인딩 설정해야함.
            $("#detailview_jira_server_name").val(json.c_title);
            $("#editview_jira_server_name").val(json.c_title);

            if(json.c_jira_server_type === "클라우드") {
                $("#detailview_jira_server_type_option1").parent().click();
                $("#editview_jira_server_type_option1").parent().click();
            } else {
                $("#detailview_jira_server_type_option2").parent().click();
                $("#editview_jira_server_type_option2").parent().click();
            }

            // BASE_URL
            $("#detailview_jira_server_base_url").val(json.c_jira_server_base_url);
            $("#editview_jira_server_base_url").val(json.c_jira_server_base_url);

            // 서버 ID
            $("#detailview_jira_server_connect_id").val(json.c_jira_server_connect_id);
            $("#editview_jira_server_connect_id").val(json.c_jira_server_connect_id);
            // 서버 PW
            $("#detailview_jira_pass_token").val(json.c_jira_server_connect_pw);
            $("#editview_jira_pass_token").val(json.c_jira_server_connect_pw);

            $("#detailview_jira_server_contents").html(json.c_jira_server_contents);
            // 편집하기 에디터 부분
            CKEDITOR.instances.input_jira_server_editor.setData(json.c_jira_server_contents);

            //삭제 부분
            $("#delete_text").text(json.c_title);
            selectServerId = json.c_id;
            selectServerName = json.c_title;

        })
        // HTTP 요청이 실패하면 오류와 상태에 관한 정보가 fail() 메소드로 전달됨.
        .fail(function (xhr, status, errorThrown) {
            console.log(xhr + status + errorThrown);
        })
        // 항상 실행
        .always(function (xhr, status) {
            console.log(xhr + status);
            $(".loader").addClass("hide");
        });

}

// 카드 클릭에 연동 할 프로젝트 데이터 테이블 만들기 //defaultContent: "<div style='color: #808080'>N/A</div>",
function project_dataTableLoad(c_id) {
    var columnList = [
        {
            name: "c_jira_name",
            title:"프로젝트 이름",
            data: "c_jira_name",
            className: "dt-body-left",
            visible: true
        },
        { title:"프로젝트 키",
            data: "c_jira_key",
            className: "dt-body-left",
            defaultContent: "<div style='color: #808080'>N/A</div>"
        },
        { title:"프로젝트 아이디",
            data: "c_desc",
            className: "dt-body-left",
            defaultContent: "<div style='color: #808080'>N/A</div>"
        },
        { name: "c_id", title: "c_id", data: "c_id", visible: false },
    ];
    var columnDefList =[];
    var columnDefList_cloud = [
        {
            targets: 0,
            searchable: false,
            orderable: false,
            render: function(data, type, full, meta){
                if(type === 'display'){
                    data = '<label><a href="javascript:void(0)" onclick="click_projectList_table(\''+data+'\')">' + data + "</a></label>";
                }
                return data;
            }
        }
    ];
    var columnDefList_onpremise = [];
    var rowsGroupList = null; //그룹을 안쓰려면 null 처리
    var jquerySelector = "#jira_project_table"; // 장소
    var ajaxUrl = "/auth-user/api/arms/jiraServer/getJiraproject.do?c_id=" + c_id;
    var jsonRoot = "response";
    if (selectServerType === "클라우드") {
        columnDefList = columnDefList_cloud;
    } else {
        columnDefList = columnDefList_onpremise;
    }
    var selectList = {};
    var orderList = [[1, "asc"]];
    var buttonList = [];
    var isServerSide = false;

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
        isServerSide
    );
}



function dataTableDrawCallback(tableInfo) {
    console.log(tableInfo);

    var className = "";
    if(selectedTab !== undefined) {
        if (selectedTab === "이슈해결책")  { className = "issueResolution"; }
        if (selectedTab ==="이슈우선순위") { className = "issuePriority";   }
        if (selectedTab === "이슈상태") {
            if (selectServerType === "클라우드") { className = "project-issueStatus"; }
            else { className = "issueStatus"; }
        }
        if (selectedTab === "이슈유형") {
            if (selectServerType === "클라우드") { className = "project-issueType"; }
            else { className = "issueType"; }
        }
    }
    var tableData = tableInfo.aoData;
    if(!isEmpty(tableData)) {
        tableData.forEach(function (rowInfo, index) {
            var tableRowData = rowInfo._aData;
            var rowIsDefault = tableRowData.c_check;
            var rowNameClass = "." + className + "-data" + index;

            var appendHtml = rowNameClass+">input";
            if (rowIsDefault ==="true") {
                //console.log("rowIsDefault is true");
                $(appendHtml).prop("checked", "true");
            } else {
                //console.log("rowIsDefault is not true");
            }
        });

    }

}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(settings, json) {}

////////////////////////////////////////////////////////////////////////////////////////
// --- 신규 제품(서비스) 등록 팝업 및 팝업 띄울때 사이즈 조정 -- //
////////////////////////////////////////////////////////////////////////////////////////
function popup_size_setting() {
    // 팝업 사이즈 조절 및 팝업 내용 데이터 바인딩
    //지라 서버(등록)
    $("#modal_popup_id").click(function () {
        console.log("modal_popup_id clicked");
        var height = $(document).height() - 600;

        $("#my_modal1").on("hidden.bs.modal", function (e) {
            console.log("modal close");
            console.log($(this).find('form')[0]);
            $(this).find('form')[0].reset();
        });

        $(".modal-body")
            .find(".cke_contents:eq(0)")
            .css("height", height + "px");
    });

    // 모달 편집
    $("#extend_modal_popup_id").click(function () {

        var editorData = CKEDITOR.instances.input_jira_server_editor.getData();
        CKEDITOR.instances.extend_modal_editor.setData(editorData);
        CKEDITOR.instances.extend_modal_editor.setReadOnly(false);

        // 지라 서버 이름
        $("#extend_editview_jira_server_name").val($("#editview_jira_server_name").val());

        // BASE URL
        $("#extend_editview_jira_server_base_url").val($("#editview_jira_server_base_url").val());

        // 서버 연결 ID, PW
        $("#extend_editview_jira_server_connect_id").val($("#editview_jira_server_connect_id").val());
        $("#extend_editview_jira_pass_token").val($("#editview_jira_pass_token").val());

        if ( $("#editview_jira_server_type").find(".active input").val() === "클라우드") {
            $("#extend_editview_jira_server_type_option1").parent().click();
        } else {
            $("#extend_editview_jira_server_type_option2").parent().click();
        }
    });

    // 팝업 ReadOnly
    $("#extend_modal_readOnly").click(function () {

        var editorData = CKEDITOR.instances.input_jira_server_editor.getData();
        CKEDITOR.instances.extend_modal_editor.setData(editorData);
        CKEDITOR.instances.extend_modal_editor.setReadOnly(true); // 읽기전용

        // 지라 서버 이름
        $("#extend_editview_jira_server_name").val($("#editview_jira_server_name").val());


        // BASE URL
        $("#extend_editview_jira_server_base_url").val($("#editview_jira_server_base_url").val());

        // 서버 연결 ID, PW
        $("#extend_editview_jira_server_connect_id").val($("#editview_jira_server_connect_id").val());
        $("#extend_editview_jira_pass_token").val($("#editview_jira_pass_token").val());

        if ( $("#editview_jira_server_type").find(".active input").val() === "클라우드") {
            $("#extend_editview_jira_server_type_option1").parent().click();
        } else {
            $("#extend_editview_jira_server_type_option2").parent().click();
        }

    });

}

///////////////////////////////////
// 팝업 띄울 때, UI 일부 수정되도록
///////////////////////////////////
function modalPopup(popupName) {
    //console.log("popupName = " + popupName);
    if (popupName === "modal_popup_readonly") {
        //modal_popup_readOnly = 새 창으로 지라(서버) 보기
        $("#my_modal2_title").text("지라(서버) 내용 보기 팝업");
        $("#my_modal2_sub").text("새 창으로 등록된 지라 정보를 확인합니다.")
        //$("#extend_change_to_update_jira_server").removeClass("hidden");
        $("#extendupdate_jira_server").addClass("hidden");
    } else { //팝업 창으로 편집하기
        $("#my_modal2_title").text("지라(서버) 수정 팝업");
        $("#my_modal2_sub").text("a-rms에 등록된 지라(서버)의 정보를 수정합니다.")
        $("#extend_change_to_update_jira_server").addClass("hidden");
        $("#extendupdate_jira_server").removeClass("hidden");
    }
}

////////////////////////////////
// 지라 서버 등록
////////////////////////////////
function save_btn_click() {
    $("#regist_jira_server").click(function () {
        if($("#popup_editview_jira_server_name").val() !== "") { // 서버 이름
            if($("#popup_editview_jira_server_type input[name='options']:checked").val() !== undefined) { // 지라환경 선택여부
                console.log("Base URL==> " + $("#popup_editview_jira_server_base_url").val());
                console.log("c_jira_server_type==> " + $("#popup_editview_jira_server_type input[name='options']:checked").val());
                console.log("c_jira_server_connect_id==> " + $("#popup_editview_jira_server_connect_id").val());
                console.log("c_jira_server_connect_pw==> " + $("#popup_editview_jira_pass_token").val());
                $.ajax({
                    url: "/auth-user/api/arms/jiraServer/addJiraServerNode.do",
                    type: "POST",
                    data: {
                        ref: 2,
                        c_title: $("#popup_editview_jira_server_name").val(),
                        c_type: "default",
                        c_jira_server_name: $("#popup_editview_jira_server_name").val(),
                        c_jira_server_base_url: $("#popup_editview_jira_server_base_url").val(),
                        c_jira_server_type: $("#popup_editview_jira_server_type input[name='options']:checked").val(), //클라우드, on-premise
                        c_jira_server_connect_id: $("#popup_editview_jira_server_connect_id").val(),
                        c_jira_server_connect_pw: $("#popup_editview_jira_pass_token").val(),
                        c_jira_server_contents: CKEDITOR.instances.modal_editor.getData()
                    },
                    statusCode: {
                        200: function () {
                            //모달 팝업 끝내고
                            $("#close_regist_jira_server").trigger("click");
                            //지라 서버 목록 재 로드
                            makeJiraServerCardDeck();
                            //dataTableRef.ajax.reload();
                            jSuccess("신규 제품 등록이 완료 되었습니다.");
                        }
                    },
                    beforeSend: function () {
                        $("#regist_jira_server").hide();
                    },
                    complete: function () {
                        $("#regist_jira_server").show();
                    },
                    error: function (e) {
                        jError("지라 서버 등록 중 에러가 발생했습니다.");
                    }
                });

            } else {
                alert("지라 서버 환경을 선택해주세요.");
                return false;
            }
        } else {
            alert("지라 서버의 이름이 없습니다.");
            return false;
        }
    });
}

function update_btn_click(){
    $("#jira_server_update").click( function () {
        console.log($("#editview_jira_server_type input[name='options']:checked").val());
        ///*
        $.ajax({
            url: "/auth-user/api/arms/jiraServer/updateNode.do",
            type: "put",
            data: {
                c_id: selectId,
                c_title: $("#editview_jira_server_name").val(),
                c_jira_server_name: $("#editview_jira_server_name").val(),
                c_jira_server_connect_id: $("#editview_jira_server_connect_id").val(),
                c_jira_server_connect_pw: $("#editview_jira_pass_token").val(),
                c_jira_server_contents: CKEDITOR.instances.input_jira_server_editor.getData()
            },
            statusCode: {
                200: function () {
                    jSuccess(selectServerName + "의 데이터가 변경되었습니다.");
                    console.log("현재 선택된 항목(c_id, 서버명) :" + selectId +", " + selectServerName);
                    //데이터 테이블 데이터 재 로드
                    makeJiraServerCardDeck();
                    jiraServerCardClick(selectId);
                }
            }
        });
        //*/
    });
}

function popup_update_btn_click() {
    $("#extendupdate_jira_server").click( function () {

        $.ajax({
            url: "/auth-user/api/arms/jiraServer/updateNode.do",
            type: "put",
            data: {
                c_id: selectId,
                c_title: $("#extend_editview_jira_server_name").val(),
                c_jira_server_name: $("#extend_editview_jira_server_name").val(),
                c_jira_server_connect_id: $("#extend_editview_jira_server_connect_id").val(),
                c_jira_server_connect_pw: $("#editview_jira_pass_token").val(),
                c_jira_server_contents: CKEDITOR.instances.extend_modal_editor.getData()
            },
            statusCode: {
                200: function () {
                    $("#extendclose_jira_server").trigger("click");

                    jSuccess(selectServerName + "의 데이터가 팝업으로 변경되었습니다.");
                    console.log("현재 선택된 항목(c_id, 서버명) :" + selectId +", " + selectServerName);
                    //데이터 테이블 데이터 재 로드
                    makeJiraServerCardDeck();
                    jiraServerCardClick(selectId);
                }
            }
        });
    });
}


////////////////////////////////
// 지라 서버 삭제 버튼
////////////////////////////////
function delete_btn_click() { // TreeAbstractController 에 이미 있음.
    console.log("삭제 버튼 활성화 또는 삭제 대상 없음");

        $("#delete_jira_server").click(function () {
            console.log("selectId = " + selectId);
            console.log("selectServerName = " + selectServerName);
            if(!confirm("정말 삭제하시겠습니까? \n 삭제할 서버명 : " + selectServerName +")")) {
                console.log("삭제하지 않음");
            } else {
                $.ajax({
                    url: "/auth-user/api/arms/jiraServer/removeNode.do",
                    type: "delete",
                    data: { //테이블 형식으로 Card를 나열할 수 있을 것인가.
                        c_id: selectServerId
                    },
                    statusCode: {
                        200: function () {
                            jSuccess($("#editview_pdservice_name").val() + "데이터가 삭제되었습니다.");
                            //지라 서버 목록 재 로드
                            makeJiraServerCardDeck();
                        }
                    }
                });
            }
        });
}

function tab_click_event() {
    $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        var target = $(e.target).attr("href"); // activated tab
        console.log(target);

        if (target === "#dropdown1") { // 삭제하기
            $("#jira_default_update_div").addClass("hidden");
            $("#jira_server_details_popup_div").addClass("hidden");
            $("#jira_server_update_div").addClass("hidden");
            $("#jira_server_delete_div").removeClass("hidden");
            $("#jira_project_renew_div").addClass("hidden");

            $(".body-middle").hide();

            if (isEmpty(selectId)) {
                jError("선택된 제품(서비스)가 없습니다. 오류는 무시됩니다.");
            }
        } else if (target === "#report") { // 편집하기
            $("#jira_default_update_div").addClass("hidden");
            $("#jira_server_details_popup_div").addClass("hidden");
            $("#jira_server_update_div").removeClass("hidden");
            $("#jira_server_delete_div").addClass("hidden");
            $("#jira_project_renew_div").addClass("hidden");
        } else if (target === "#related_project") {
            $("#jira_default_update_div").addClass("hidden");
            $("#jira_server_details_popup_div").addClass("hidden");
            $("#jira_server_update_div").addClass("hidden");
            $("#jira_server_delete_div").addClass("hidden");
            $("#jira_project_renew_div").removeClass("hidden");

            project_dataTableLoad(selectServerId);
        } else if(target ==="#stats") { // 상세보기, 처음화면
            $("#jira_default_update_div").addClass("hidden");
            $("#jira_server_details_popup_div").removeClass("hidden");
            $("#jira_server_update_div").addClass("hidden");
            $("#jira_server_delete_div").addClass("hidden");
            $("#jira_project_renew_div").addClass("hidden");
            if (selectId == undefined) {
                $(".body-middle").hide();
            } else {
                $(".body-middle").show();
            }
        }
        else {
            $("#jira_default_update_div").removeClass("hidden");
            if (target === "#server_issue_resolution") {
                $("#server_issue_resolution").removeClass("hidden");
                selectedTab = "이슈해결책";
                display_set_wide_projectTable();
                jiraServerDataTable(selectedTab);
            }
            if (target ==="#server_issue_priority") {
                $("#server_issue_priority").removeClass("hidden");
                selectedTab = "이슈우선순위";
                display_set_wide_projectTable();
                jiraServerDataTable(selectedTab);
            }

            if (target === "#issue_type" || target ==="#server_issue_type") {
                selectedTab = "이슈유형";

                $("#issue_type_table").removeClass("hidden");
                $("#issue_status_table").addClass("hidden");

                if (selectServerType === "클라우드")  {
                    $("#jira_default_update_div").addClass("hidden");
                    projectIssueTypeDataTable();
                }
                if (selectServerType === "온프레미스") {
                    $("#server_issue_type").removeClass("hidden");
                    jiraServerDataTable(selectedTab);
                }
            }
            if (target === "#issue_status" || target ==="#server_issue_status") {
                selectedTab = "이슈상태";

                $("#issue_type_table").addClass("hidden");
                $("#issue_status_table").removeClass("hidden");

                if (selectServerType === "클라우드")  {
                    $("#jira_default_update_div").addClass("hidden");
                    projectIssueStatusDataTable();
                }
                if (selectServerType === "온프레미스") {
                    $("#server_issue_status").removeClass("hidden");
                    jiraServerDataTable(selectedTab);
                }
            }
        }
    });
    // 유틸 잠시 의지
    $("#setWide_Btn").on("click", function () {
        $("#jira_default_update_div").addClass("hidden");
        display_set_wide_projectTable();
    });
}

// 갱신 버튼 (예상: all, project, issueType, issuePriority, issueResolution, issueStatus 등..)
function jira_renew(renewJiraType, serverId) { // 서버 c_id

    if (serverId === undefined) { serverId = "서버 아이디 정보 없음"; return false; }
    if (renewJiraType === undefined) { renewJiraType = "갱신할 지라 타입 없음"; return false; }
    console.log("갱신버튼을 눌렀습니다. 갱신할 종류(서버아이디) : " + renewJiraType+"("+serverId+")");

    $.ajax({
        url: "/auth-user/api/arms/jiraServer/"+ renewJiraType + "/renewNode.do",
        type: "put",
        data: { c_id: serverId},
        statusCode: {
            200: function () {
                jSuccess(selectServerName + "의 데이터가 갱신되었습니다.");
                console.log("현재 선택된 항목(c_id, 서버명) :" + selectId +", " + selectServerName);
                //데이터 테이블 데이터 재 로드
                makeJiraServerCardDeck();
                jiraServerCardClick(selectId);
            }
        }
    });
}

function projectIssueStatusDataTable() {
    console.log("issueStatus DataTable");
    var columnList= [
        { title:"설정",
            data: "c_id",
            className: "dt-body-left texe-align-center",
            render: function (data, type, row,meta) {
                if (type === "display") {
                    if(isEmpty(data)) {
                        return `<div class="no-project-issueStatus-data${meta.row}" style="white-space: nowrap; text-align: center">
                                    <input type="radio" name="c_id" value="' + ${data} + '"> </div>`;
                    }
                    else {
                        return `<div class="project-issueStatus-data${meta.row}" style="white-space: nowrap; text-align: center">
                                    <input type="radio" name="c_id" value="' + ${data} + '" onclick="fn_urlHandler(${data})"> 
                                </div>`;
                    }
                }
                return data;
            },
        },
        { title:"이슈 상태 아이디",
            data: "c_issue_status_id",
            className: "dt-body-left",
            defaultContent: "<div style='color: #808080'>N/A</div>"
        },
        { title:"이슈 상태",
            data: "c_issue_status_name",
            render: function (data, type, row, meta) {
                if (type === "display") {
                    if (isEmpty(data)) {
                        return "<div style='color: #808080'>N/A</div>";
                    } else {
                        return '<div style="white-space: nowrap;">' + data + "</div>";
                    }
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        }
    ];
    var rowsGroupList = null; //그룹을 안쓰려면 null 처리
    var columnDefList = [];
    var selectList = {};
    var orderList = [[1, "asc"]];
    var buttonList = [];
    console.log("issue_status selectProjectId => " + selectProjectId);
    var jquerySelector = "#issue_status_table"; //
    var ajaxUrl = "/auth-user/api/arms/jiraProject/getProjectIssueStatus.do?c_id="+selectProjectId; // 사용 예정
    var jsonRoot = "response";
    var isServerSide = false;

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
        isServerSide
    );
    // ----- 데이터 테이블 빌드 이후 스타일 구성 ------ //
    //datatable 좌상단 datarow combobox style
    $(".dataTables_length").find("select:eq(0)").addClass("darkBack");
    $(".dataTables_length").find("select:eq(0)").css("min-height", "30px");
}

function projectIssueTypeDataTable() {
    console.log("projectIssueType DataTable");
    var columnList= [
        {
            title:"설정",
            data: "c_id",
            className: "dt-body-left",
            render: function (data, type, row,meta) {
                    if (type === "display") {
                        if(isEmpty(data)) {
                            return `<div class="no-project-issueType-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '">
                                    </div>`;
                        }
                        else {
                            return `<div class="project-issueType-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '" onclick="fn_urlHandler(${data})">
                                    </div>`;
                        }
                    }
                    return data;
            },
        },
        { title:"이슈 타입 아이디",
          data: "c_issue_type_id",
          className: "dt-body-left",
          defaultContent: "<div style='color: #808080'>N/A</div>"
        },
        { title:"이슈 타입",
          data: "c_issue_type_name",
          render: function (data, type, row, meta) {
              if (type === "display") {
                  if (isEmpty(data)) {
                      return "<div style='color: #808080'>N/A</div>";
                  } else {
                      return '<div style="white-space: nowrap;">' + data + "</div>";
                  }
              }
              return data;
          },
          className: "dt-body-left",
          visible: true
        }
    ];
    var rowsGroupList = []; //그룹을 안쓰려면 null 처리
    var columnDefList = [];
    var selectList = {};
    var orderList = [[1, "asc"]];
    var buttonList = [];

    console.log("issue_type selectProjectId => " + selectProjectId);

    var jquerySelector = "#issue_type_table"; //
    var ajaxUrl = "/auth-user/api/arms/jiraProject/getProjectIssueType.do?c_id=" + selectProjectId; // 사용 예정
    var jsonRoot = "response";
    var isServerSide = false;


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
        isServerSide
    );

    // ----- 데이터 테이블 빌드 이후 스타일 구성 ------ //
    //datatable 좌상단 datarow combobox style
    $(".dataTables_length").find("select:eq(0)").addClass("darkBack");
    $(".dataTables_length").find("select:eq(0)").css("min-height", "30px");
}

function jiraServerDataTable(target) {
    console.log("jiraServerDataTable target => " + selectedTab);
    var columnList; var targetAjaxUrl =""; var targetSelector ="";

    var columnList_type= [
        {
            title:"설정",
            data: "c_id",
            className: "dt-body-left",
            render: function (data, type, row,meta) {
                if (type === "display") {
                    if(isEmpty(data)) {
                        return `<div class="no-issueType-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '">
                                    </div>`;
                    }
                    else {
                        return `<div class="issueType-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '" onclick="fn_urlHandler(${data})">
                                    </div>`;
                    }
                }
                return data;
            },
        },
        { title:"이슈 유형 아이디",
            data: "c_issue_type_id",
            className: "dt-body-left",
            defaultContent: "<div style='color: #808080'>N/A</div>"
        },
        { title:"이슈 유형",
            data: "c_issue_type_name",
            render: function (data, type, row, meta) {
                if (type === "display") {
                    if (isEmpty(data)) {
                        return "<div style='color: #808080'>N/A</div>";
                    } else {
                        return '<div style="white-space: nowrap;">' + data + "</div>";
                    }
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        }
    ];
    var columnList_status= [
        {
            title:"설정",
            data: "c_id",
            className: "dt-body-left",
            render: function (data, type, row,meta) {
                if (type === "display") {
                    if(isEmpty(data)) {
                        return `<div class="no-issueStatus-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '">
                                </div>`;
                    }
                    else {
                        return `<div class="issueStatus-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '" onclick="fn_urlHandler(${data})">
                                </div>`;
                    }
                }
                return data;
            },
        },
        { title:"이슈 상태 아이디",
            data: "c_issue_status_id",
            className: "dt-body-left",
            defaultContent: "<div style='color: #808080'>N/A</div>"
        },
        { title:"이슈 유형",
            data: "c_issue_status_name",
            render: function (data, type, row, meta) {
                if (type === "display") {
                    if (isEmpty(data)) {
                        return "<div style='color: #808080'>N/A</div>";
                    } else {
                        return '<div style="white-space: nowrap;">' + data + "</div>";
                    }
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        }
    ];
    var columnList_priority= [
        {
            title:"설정",
            data: "c_id",
            className: "dt-body-left",
            render: function (data, type, row,meta) {
                if (type === "display") {
                    if(isEmpty(data)) {
                        return `<div class="no-issuePriority-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '">
                                </div>`;
                    }
                    else {
                        return `<div class="issuePriority-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '" onclick="fn_urlHandler(${data})">
                                </div>`;
                    }
                }
                return data;
            },
        },
        { title:"이슈 우선순위 아이디",
            data: "c_issue_priority_id",
            className: "dt-body-left",
            defaultContent: "<div style='color: #808080'>N/A</div>"
        },
        { title:"이슈 우선순위",
            data: "c_issue_priority_name",
            render: function (data, type, row, meta) {
                if (type === "display") {
                    if (isEmpty(data)) {
                        return "<div style='color: #808080'>N/A</div>";
                    } else {
                        return '<div style="white-space: nowrap;">' + data + "</div>";
                    }
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        }
    ];
    var columnList_Resolution= [
        {
            title:"설정",
            data: "c_id",
            className: "dt-body-left",
            render: function (data, type, row,meta) {
                if (type === "display") {
                    if(isEmpty(data)) {
                        return `<div class="no-issueResolution-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '">
                                </div>`;
                    }
                    else {
                        return `<div class="issueResolution-data${meta.row}" style="white-space: nowrap; text-align: center">
                                        <input type="radio" name="c_id" value="' + ${data} + '" onclick="fn_urlHandler(${data})">
                                </div>`;
                    }
                }
                return data;
            },
        },
        { title:"이슈 해결책 아이디",
            data: "c_issue_resolution_id",
            className: "dt-body-left",
            defaultContent: "<div style='color: #808080'>N/A</div>"
        },
        { title:"이슈 해결책",
            data: "c_issue_resolution_name",
            render: function (data, type, row, meta) {
                if (type === "display") {
                    if (isEmpty(data)) {
                        return "<div style='color: #808080'>N/A</div>";
                    } else {
                        return '<div style="white-space: nowrap;">' + data + "</div>";
                    }
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        }
    ];

    if(target === "이슈유형")  {
        columnList = columnList_type;
        targetAjaxUrl = "getJiraIssueType.do?c_id=" + selectServerId;
        targetSelector = "#server_issue_type_table";
    }
    if(target === "이슈상태")  {
        columnList = columnList_status;
        targetAjaxUrl = "getJiraIssueStatus.do?c_id=" + selectServerId;
        targetSelector = "#server_issue_status_table";
    }
    if(target === "이슈우선순위") {
        columnList = columnList_priority;
        targetAjaxUrl = "getJiraIssuePriority.do?c_id=" + selectServerId;
        targetSelector = "#server_issue_priority_table";
    }
    if(target === "이슈해결책")   {
        columnList = columnList_Resolution;
        targetAjaxUrl = "getJiraIssueResolution.do?c_id=" + selectServerId;
        targetSelector = "#server_issue_resolution_table";
    }

    var rowsGroupList = []; //그룹을 안쓰려면 null 처리
    var columnDefList = [];
    var selectList = {};
    var orderList = [[1, "asc"]];
    var buttonList = [];

    console.log("issue_type selectProjectId => " + selectProjectId);

    var jquerySelector = targetSelector; //
    var ajaxUrl = "/auth-user/api/arms/jiraServer/" + targetAjaxUrl;
    var jsonRoot = "response";
    var isServerSide = false;


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
        isServerSide
    );

    // ----- 데이터 테이블 빌드 이후 스타일 구성 ------ //
    //datatable 좌상단 datarow combobox style
    $(".dataTables_length").find("select:eq(0)").addClass("darkBack");
    $(".dataTables_length").find("select:eq(0)").css("min-height", "30px");
}
function fn_urlHandler(data) {
    console.log("fn_handler & c_id = " + data);
    selectRadioId = data;
    console.log("selectRadioId in urlHandler : " + selectRadioId);
}

function default_setting_event() {
    var ajax_url ="";
    var sourceCid = "";
    $("button[name='default_update']").click( function (){
        console.log("selectServerType in default_setting_event ===> " + selectServerType);

        if (selectedTab === "이슈유형" && selectServerType === "클라우드") {
            sourceCid = selectProjectId;
            ajax_url = "jiraProject/makeDefaultIssueType.do/" + selectRadioId;
        }
        else if (selectedTab === "이슈상태" && selectServerType === "클라우드") {
            sourceCid = selectProjectId;
            ajax_url = "jiraProject/makeDefaultIssueStatus.do/" + selectRadioId;
        } else { // 온프레미스 4가지, 클라우드의 해결책,우선순위
            sourceCid = selectServerId;
            ajax_url = "jiraServer/"+ selectedTab+"/makeDefault.do/"+selectRadioId;
        }
        console.log("ajax_url ====> " + ajax_url);

        ///*
        $.ajax({
           url: "/auth-user/api/arms/" + ajax_url,
           type: "put",
           data: { c_id: sourceCid }, // 지라프로젝트 또는 서버의 아이디
           statusCode: {
               200: function () {
                   //jSuccess(selectRadioId + "의 데이터가 변경되었습니다.");
                   jSuccess("기본 설정("+selectedTab+")이 변경되었습니다.");
                   //데이터 테이블 데이터 재 로드
                   display_set_wide_projectTable(); // 다시 wide 설정으로.
                   $("#nav_stats>a").click();
               }
           }
        });
        //*/
    });

}

//지라 프로젝트 - 데이터테이블 프로젝트 명 클릭시
function click_projectList_table(projectName) {
    console.log("click_projectList_table :: projectName = " + projectName);

    // Sender 설정
    var selectedHtml =
        `<div class="chat-message">
				<div class="chat-message-body" style="margin-left: 0px !important;">
					<span class="arrow" style="top: 35% !important;"></span>
					<span class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 선택된 프로젝트 :  </span>
                    <span class="text" style="color: #a4c6ff;">
                    ` + projectName +`
                    </span>
				</div>
		 </div>`;
    $(".grid3rd").html(selectedHtml);

    //풀사이즈 그리드이면 줄이고, 호스트 정보를 보여준다
    console.log($("#serverInfo_Wrapper")[0].className);
    console.log("issue_type selectProjectId => " + selectProjectId);
    if ($("#serverInfo_Wrapper")[0].className == "col-lg-7") {
        //서버 정보 줄이기
        $("#serverInfo_Wrapper").removeClass("col-lg-7").addClass("col-lg-4");

        $("#serverConfig_Wrapper").show();

        $("#returnList_Layer").show();

        $("#serverInfo_Wrapper").removeClass("fade-out-box");
        $("#serverInfo_Wrapper").addClass("fade-in-box");

        var box = document.querySelector("#serverInfo_Wrapper");
        box.ontransitionend = () => {
            $("#serverInfo_Wrapper").show();
            $("#jira_project_table").DataTable().columns.adjust().responsive.recalc();
        };
    }

    setTimeout(function () {
        $("#nav_issue_type>a").click();
        selectedTab = "이슈유형"
        projectIssueTypeDataTable();
    }, 313);
}

//프로젝트 목록 다시 넓게 쓰기
function display_set_wide_projectTable() {
    var box = document.querySelector("#serverInfo_Wrapper");
    box.ontransitionend = () => {
        $("#jira_project_table").DataTable().columns.adjust().responsive.recalc();
    };

    // 테이블 원복
    $("table.dataTable > tbody > tr.child ul.dtr-details").css("display", "inline-block;");
    //$("#jira_project_table").addClass("dtr-inline collapsed");

    // 감추기
    $("#returnList_Layer").hide();
    $("#serverInfo_Wrapper").removeClass("fade-in-box");
    //$("#hostInfo_Wrapper").addClass("fade-out-box");
    $("#serverConfig_Wrapper").hide();

    //호스트 테이블 늘이기
    $("#serverInfo_Wrapper").removeClass("col-lg-4").addClass("col-lg-7");

}
// 자동 슬라이드
function autoSlide(){
    $('#carousel-example-generic').carousel({
        interval: 5000,
    });
}

function chk_default_settings_icon(list) {
    // list에 cardList.jiraIssueResolutionEntities 이런거
    var check_default_set = "false";
    //console.log(list);
    if(list.length != 0) {
        //console.log("list.length ===> " + list.length);
        if(!isEmpty(list[0].c_check)){
            list.forEach(function (info, index){
                if (info.c_check ==="true"){
                    check_default_set ="true";
                }
            });
            if (check_default_set ==="false") {
                return ": "
                    + `<i class="fa fa-exclamation-circle mr-1" style="vertical-align: middle;"></i>`
                    + list.length
                    + `<span style="color: #FFFFFF !important;"> 개</span>`;
            } else if (check_default_set ==="true") {
                return ": "+list.length+`<span style="color: #FFFFFF !important;"> 개</span>`;
            }
        } else { //project를 위함
            return ": "+list.length+`<span style="color: #FFFFFF !important;"> 개</span>`;
        }
    } else {
        //console.log("list.length is 0");
        return `<i class="fa fa-exclamation-circle"></i>`;
    }
}

function num_of_issue_type_and_status(list, type) { // cardList, "이슈상태" || "이슈유형" 들어올듯.
    var arr = []; var chk_result ="";
    if (list.c_jira_server_type === "클라우드") {
        var check_default_set;
        var 기본값_설정이_안된_프로젝트 = "";
        arr = list.jiraProjectEntities; // 프로젝트 리스트
        // 클라우드서버 이슈유형
        if (type ==="이슈유형") {
            기본값_설정이_안된_프로젝트 = "";
            var type_cnt = 0;
            for(var i = 0; i < arr.length ; i++) {
                check_default_set = "false";
                arr[i].jiraIssueTypeEntities.forEach(function (info, index) {
                    if (info.c_check === "true") {
                        check_default_set = "true";
                    }
                });
                if(check_default_set !== "true") {
                    기본값_설정이_안된_프로젝트 += "'"+arr[i].c_jira_name +"' ";
                }
                type_cnt +=  arr[i].jiraIssueTypeEntities.length;
            }
            if(기본값_설정이_안된_프로젝트 !== "") { // 기본값 설정이 안된 프로젝트가 존재함
                return `: <i class="fa fa-exclamation-circle mr-1"></i>`+type_cnt+`<span style="color: #FFFFFF !important;"> 개</span>`;
            } else {
                return ": "+type_cnt+`<span style="color: #FFFFFF !important;"> 개</span>`;
            }
        }
        // 클라우드서버 이슈상태
        if (type === "이슈상태") {
            var status_cnt = 0;
            기본값_설정이_안된_프로젝트 = "";
            for(var i = 0; i < arr.length ; i++) {
                check_default_set = "false";
                arr[i].jiraIssueStatusEntities.forEach(function (info, index) {
                    if (info.c_check === "true") {
                        check_default_set = "true";
                    }
                });
                if(check_default_set !== "true") {
                    기본값_설정이_안된_프로젝트 += arr[i].c_jira_name +" ";
                }
                status_cnt += arr[i].jiraIssueStatusEntities.length;
            }
            if(기본값_설정이_안된_프로젝트 !== "") { // 기본값 설정이 안된 프로젝트가 존재함
                console.log("기본값_설정이_안된_프로젝트 명 : " + 기본값_설정이_안된_프로젝트);
                return `: <i class="fa fa-exclamation-circle mr-1"></i>`+status_cnt+`<span style="color: #FFFFFF !important;"> 개</span>`

            } else {
                return ": "+status_cnt+`<span style="color: #FFFFFF !important;"> 개</span>`;
            }
        }



    }
    if (list.c_jira_server_type === "온프레미스") {
        if (type === "이슈유형") {
            return chk_default_settings_icon(list.jiraIssueTypeEntities);  }
        if (type === "이슈상태") {
            return chk_default_settings_icon(list.jiraIssueStatusEntities); }
    }
}



// arms-requirement 존재 확인해서 리본 그리기
function draw_ribbon_result_of_issueType_check(list) {
    var arr = []; var chk_result ="";
    if (list.c_jira_server_type === "클라우드") {
        arr = list.jiraProjectEntities; // 프로젝트 리스트
        var issueTypeList = [];
        var 이슈타입_없는_프로젝트명 ="";
        for(var i = 0; i < arr.length ; i++) {
            issueTypeList = arr[i].jiraIssueTypeEntities; // 이슈타입들의 목록
            chk_result = chk_issue_type_whether_have_arms_requirement(issueTypeList);
            if (chk_result === "true") { console.log(arr[i].c_jira_name + "은 arms-requirement 있음"); }
            else {
                이슈타입_없는_프로젝트명 += arr[i].c_jira_name+ " ";
            }
        }
        if (이슈타입_없는_프로젝트명 !== "") { // 이슈타입으로 arms-requirement가 없는 프로젝트 존재
            console.log(이슈타입_없는_프로젝트명);
            return `<div class="ribbon ribbon-info" style="background: #DB2A34;">Help <i class="fa fa-exclamation ml-1" style="font-size: 13px;"></i></div>`;
        } else {
            return `<div class="ribbon ribbon-info">Ready</div>`;
        }
    }
    if (list.c_jira_server_type =="온프레미스") {
        arr = list.jiraIssueTypeEntities;
        chk_result = chk_issue_type_whether_have_arms_requirement(arr);
        if (chk_result === "true") {
            return `<div class="ribbon ribbon-info">Ready</div>`;
        } else if (chk_result == "false") { // 이슈타입은 있지만, arms-requirement가 없음
            var htmlData = `<div class="ribbon ribbon-info" style="background: #DB2A34;">Help <i class="fa fa-exclamation ml-1" style="font-size: 13px;"></i></div>`
            return htmlData;
        } else { // undefined - 이슈 타입 자체가 없음
            return `<div class="ribbon ribbon-info" style="background: #DB2A34;">Nothing<i class="fa fa-exclamation ml-1"></i></div>`;
        }
    }
}

//이슈유형(타입)에 arms-requirement 가 있는지 확인
function chk_issue_type_whether_have_arms_requirement(list) {
    var arr = list; var chk_result = "false";
    if (arr.length != 0) {
        arr.forEach( function (info, index) {
            if (info.c_issue_type_name === "arms-requirement") {
                chk_result = "true";
            }
        });
        return chk_result;
    } else { // arr.length 양의 정수가 아님
        chk_result = "";
        return chk_result; // undefined
    }
}