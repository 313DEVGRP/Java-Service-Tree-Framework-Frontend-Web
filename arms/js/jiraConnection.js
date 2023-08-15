//////////////////////////////////
// Page 전역 변수
//////////////////////////////////
var selectId;   // 선택한 서버 아이디
var selectName; // 선택한 서버 이름 (c_title)
var selectServerName; // 선택한 서버 이름 (c_jira_server_name )
var selectServerType; // 선택한 서버 타입 (c_jira_server_type, cloud or on-premise)

var selectedIndex; // 데이터테이블 선택한 인덱스
var selectedPage;  // 데이터테이블 선택한 인덱스

var dataTableRef; // 데이터테이블 참조 변수

var serverList;

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

            save_btn_click();
            delete_btn_click();
            update_btn_click();

            popup_size_setting();

            popup_update_btn_click();
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
                console.log(obj);
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
            if (cardList[i].c_jira_server_type == 'cloud') {
                insertImage = `<img src="./img/jira/mark-gradient-white-jira.svg" width="30px" style=""></img>`;
            } else {
                insertImage = `<img src="./img/jira/mark-gradient-blue-jira.svg" width="30px" style=""></img>`;
            }

            data +=
            `
            <div class="card mb-2 ribbon-box ribbon-fill right" onclick="jiraServerCardClick(${cardList[i].c_id})">
                <!-- 리본표시 -->
                <div class="ribbon ribbon-info"><i class="fa fa-bolt mr-2"></i>${cardList[i].c_id}</div>
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
                    <p class="font13 mt-1" style="margin-bottom: 0px;">ISSUE(배포/수집): 1(임시) / ${cardList[i].jiraIssueStatusEntities.length} <span class="badge bg-success-subtle text-success">65.00%(임시)</span></p>
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
            name: "c_jira_server_name",
            title: "지라(서버) 이름",
            data: "c_title", //"c_jira_server_name"
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
    //var ajaxUrl = "/auth-user/api/arms/pdService/getPdServiceMonitor.do";
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
				<div class="gradient_bottom_border" style="width: 100%; height: 2px; padding-top: 10px;"></div>`;

            $(".list-group-item").html(selectedHtml);

            // => 데이터 바인딩 설정해야함.
            $("#detailview_jira_server_name").val(json.c_title);
            $("#editview_jira_server_name").val(json.c_title);

            if(json.c_jira_server_type === "cloud") {
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
            selectId = json.c_id;
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

function dataTableDrawCallback(tableInfo) {
    $("#" + tableInfo.sInstance)
        .DataTable()
        .columns.adjust()
        .responsive.recalc();
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

        if ( $("#editview_jira_server_type").find(".active input").val() === "cloud") {
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

        if ( $("#editview_jira_server_type").find(".active input").val() === "cloud") {
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
        if($("#popup_editview_jira_server_name").val() !== "") { // 서버 이름 적게끔.
            $.ajax({
                url: "/auth-user/api/arms/jiraServer/addJiraServerNode.do",
                type: "POST",
                data: {
                    ref: 2,
                    c_title: $("#popup_editview_jira_server_name").val(),
                    c_type: "default",
                    c_jira_server_name: $("#popup_editview_jira_server_name").val(),
                    c_jira_server_base_url: $("#popup_editview_jira_server_base_url").val(),
                    c_jira_server_type: $("#popup_editview_jira_server_type input[name='options']:checked").val(), //cloud, on-premise
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
                c_jira_server_base_url: $("#editview_jira_server_base_url").val(),
                c_jira_server_type: $("#editview_jira_server_type input[name='options']:checked").val(), //cloud, on-premise
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
                c_jira_server_base_url: $("#extend_editview_jira_server_base_url").val(),
                c_jira_server_type: $("#extend_editview_jira_server_type input[name='options']:checked").val(), //cloud, on-premise
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
                        c_id: selectId
                    },
                    statusCode: {
                        200: function () {
                            jError($("#editview_pdservice_name").val() + "데이터가 삭제되었습니다.");
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

        if (target == "#dropdown1") { // 삭제하기

            $("#jira_server_details_popup_div").addClass("hidden");
            $("#jira_server_update_div").addClass("hidden");
            $("#jira_server_delete_div").removeClass("hidden");

            $(".body-middle").hide();

            if (isEmpty(selectId)) {
                jError("선택된 제품(서비스)가 없습니다. 오류는 무시됩니다.");
            }
        } else if (target == "#report") { // 편집하기
            $("#jira_server_details_popup_div").addClass("hidden");
            $("#jira_server_update_div").removeClass("hidden");
            $("#jira_server_delete_div").addClass("hidden");

        } else {
            $("#jira_server_details_popup_div").removeClass("hidden");
            $("#jira_server_update_div").addClass("hidden");
            $("#jira_server_delete_div").addClass("hidden");

            if (selectId == undefined) {
                $(".body-middle").hide();
            } else {
                $(".body-middle").show();
            }
        }
    });
}
