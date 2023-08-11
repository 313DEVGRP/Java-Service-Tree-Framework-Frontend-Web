//////////////////////////////////
// Page 전역 변수
//////////////////////////////////
var selectId;   // 선택한 서버 아이디
var selectName; // 선택한 서버 이름 (c_title)
var selectServerName; // 선택한 서버 이름 (c_jira_server_name )
var selectServerType; // 선택한 서버 타입 (c_jira_server_type, cloud or on-premise)

var selectedIndex; // 데이터테이블 선택한 인덱스
var selectedPage; // 데이터테이블 선택한 인덱스

var selectVersion; // 선택한 버전 아이디 - 사용x
var selectVersionName; // 선택한 버전 이름 - 사용x

var dataTableRef; // 데이터테이블 참조 변수
var selectConnectID; // 제품(서비스) - 버전 - 지라 연결 정보 아이디 (보류)

var versionList;
var serverList; // 필요할지는 잘 모르겠음.

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

        [	/*"../reference/jquery-plugins/dataTables-1.10.16/extensions/Editor-1.6.5/css/editor.bootstrap4.min.css",*/
            "../reference/jquery-plugins/select2-4.0.2/dist/css/jisaconnection_temp.css",
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
            }, 3000); // 2초 후에 실행됩니다.
            console.log('모든 플러그인 로드 완료');

            //사이드 메뉴 처리
            $('.widget').widgster();
            setSideMenu("sidebar_menu_jira", "sidebar_menu_jira_manage");

            // 데이터 테이블 로드 함수
            /*
            var waitDataTable = setInterval(function () {
                try { // 데이터 테이블 말고 이 형식으로, card를 표현하고 싶다!!!!!
                    if (!$.fn.DataTable.isDataTable("#jira_server_card_deck")) {
                        dataTableLoad();
                        clearInterval(waitDataTable);
                    }
                } catch (err) {
                    console.log("서비스 데이터 테이블 로드가 완료되지 않아서 초기화 재시도 중...");
                }
            }, 313 ); // milli
            */

            var waitCardDeck = setInterval( function () {
                try {
                    // 카드 덱(서버 목록) 이니시에이터
                    makeJiraServerCardDeck();

                    clearInterval(waitCardDeck);

                } catch (err) {
                    console.log("지라 서버 데이터 로드가 완료되지 않아서 초기화 재시도 중...");
                }
            }, 1000);

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
                    //console.log(err);
                    console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
                }
             }, 2000); //313ms

            //inBox_click_event();  // 지라 환경 nav (폐기)
            //jira_nav_btn_click(); // 지라 환경 nav (폐기)



            //tab_click_event();
            //select2_setting();    // 검색 자동완성 (보류)
            save_btn_click();
            //delete_btn_click();
            //update_btn_click();
            //popup_update_btn_click();
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
            if (cardList[i].c_jira_server_type == 'cloud') {
                insertImage = `<img src="./img/jira/mark-gradient-white-jira.svg" width="30px" style=""></img>`;
            } else {
                insertImage = `<img src="./img/jira/mark-gradient-blue-jira.svg" width="30px" style=""></img>`;
            }

            data +=
            `
            <div class="card mb-2 ribbon-box ribbon-fill right">
                <!-- 리본표시 -->
                <div class="ribbon ribbon-info"><i class="fa fa-bolt mr-2"></i>2</div>
                <!--카드내용1-->
                <div class="card-body">
                    <div class="" style="display: flex; align-items: baseline;">
                        <div class="flex-shrink-0 card-icon-wrap">
                            <div class="card-icon bg-light rounded">
                                ${insertImage}
                            </div>
                        </div>
                        <div class="flex-grow-1 ml-4 mb-2">
                            <h5 class="fs-15 mb-1 font16">${cardList[i].title}</h5>
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
// --- 데이터 테이블 설정 --- // (사용 보류)
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
function dataTableClick(tempDataTable, selectedData) {
    // => 카드 목록 클릭시 해당 카드의 c_id를 활용해서 가져오도록 만들어야 함
    console.log("====== selectedData =====");
    console.log(selectedData);
    console.log("selectedData.c_id : ", selectedData.c_id);
    selectId = selectedData.c_id;
    // c_id로 getNode 실행
    jiraServerCardClick(selectId);

    // 버전은 dataLoad를 사용했음.
    // dataLoad(selectedData.c_id);

}

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
            //$("#detailview_pdservice_name").val(json.c_title);
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
            $("#detailview_pdservice_name").val(json.c_title);
            if (isEmpty(json.c_pdservice_owner) || json.c_pdservice_owner == "none") {
                $("#detailview_pdservice_owner").val("책임자가 존재하지 않습니다.");
            } else {
                $("#detailview_pdservice_owner").val(json.c_pdservice_owner);
            }


            $("#detailview_pdservice_contents").html(json.c_pdservice_contents);

            $("#editview_pdservice_name").val(json.c_title);

            //clear
            $("#editview_pdservice_owner").val(null).trigger("change");

            if (json.c_pdservice_owner == null || json.c_pdservice_owner == "none") {
                console.log("pdServiceDataTableClick :: json.c_pdservice_owner empty");
            } else {
                var newOption = new Option(json.c_pdservice_owner, json.c_pdservice_owner, true, true);
                $("#editview_pdservice_owner").append(newOption).trigger("change");
            }
            // -------------------- reviewer setting -------------------- //
            //reviewer clear
            $("#editview_pdservice_reviewers").val(null).trigger("change");

            var selectedReviewerArr = [];
            if (json.c_pdservice_reviewer01 == null || json.c_pdservice_reviewer01 == "none") {
                console.log("pdServiceDataTableClick :: json.c_pdservice_reviewer01 empty");
            } else {
                selectedReviewerArr.push(json.c_pdservice_reviewer01);
                // Set the value, creating a new option if necessary
                if ($("#editview_pdservice_reviewers").find("option[value='" + json.c_pdservice_reviewer01 + "']").length) {
                    console.log('option[value=\'" + json.c_pdservice_reviewer01 + "\']"' + "already exist");
                } else {
                    // Create a DOM Option and pre-select by default
                    var newOption01 = new Option(json.c_pdservice_reviewer01, json.c_pdservice_reviewer01, true, true);
                    // Append it to the select
                    $("#editview_pdservice_reviewers").append(newOption01).trigger("change");
                }
            }

            $("#editview_pdservice_reviewers").val(selectedReviewerArr).trigger("change");

            // ------------------------- reviewer end --------------------------------//
            // => 데이터 바인딩 설정해야함.

            CKEDITOR.instances.input_jira_server_editor.setData(json.c_jira_server_contents);
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

    //삭제 하기 부분. (#pdService_table 에서 jiraConnection 관련 테이블로 변경 수정해야)
    // => 지라(서버) 카드 덱의 선택된 서버의 c_title을 가져올 수 있게 바꿔야함.
    $("#delete_text").text($("#pdservice_table").DataTable().rows(".selected").data()[0].c_title);
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
// 버전 리스트를 재로드하는 함수 ( 버전 추가, 갱신, 삭제 시 호출 ) => 버전리스트 말고 서버리스트로 사용 가능성 모색.
////////////////////////////////////////////////////////////////////////////////////////
function dataLoad(getSelectedText, selectedText) {
    // ajax 처리 후 에디터 바인딩.
    console.log("dataLoad :: getSelectedID → " + getSelectedText);

    $.ajax("/auth-user/api/arms/pdService/getVersionList.do?c_id=" + getSelectedText).done(function (json) {
        console.log("dataLoad :: success → ", json);
        versionList = json.response;
        $("#version_accordion").jsonMenu("set", json.response, { speed: 5000 });

        //version text setting
        var selectedHtml =
            `<div class="chat-message">
				<div class="chat-message-body" style="margin-left: 0px !important; border-left: 2px solid #a4c6ff; border-right: 2px solid #e5603b;">
					<span 	class="arrow"
							style="top: 17px !important; border-right: 5px solid #a4c6ff;"></span>
					<span   id="toRight"
							class="arrow"
							style=" top: 17px !important; right: -7px; border-top: 5px solid transparent;
									border-bottom: 5px solid transparent;
									border-left: 5px solid #e5603b;border-right: 0px; left:unset;"></span>
					<div class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 선택된 지라 : 
						<span style="color: #a4c6ff;">
						` +  selectedText + `
						</span>
					</div>
				</div>
			</div>
			<div class="gradient_bottom_border" style="width: 100%; height: 2px; padding-top: 10px;"></div>`;
        $(".list-group-item").html(selectedHtml);
        $("#tooltip_enabled_service_name").val(selectedText);

        //updateD3ByVersionList();

        setTimeout(function () {
            $("#pdService_Version_First_Child").trigger("click");
        }, 500);
    });
}
// dataLoad 후에,


////////////////////////////////////////////////////////////////////////////////////////
// versionlist 이니셜라이즈 (참고용)
////////////////////////////////////////////////////////////////////////////////////////
function init_versionList() {
    let menu;
    $.fn.jsonMenu = function (action, items, options) {
        $(this).addClass("json-menu");
        if (action == "add") {
            menu.body.push(items);
            draw($(this), menu);
        } else if (action == "set") {
            menu = items;
            draw($(this), menu);
        }
        return this;
    };
}

////////////////////////////////////////////////////////////////////////////////////////
// version list html 삽입 (참고용)
////////////////////////////////////////////////////////////////////////////////////////
function draw(main, menu) {
    main.html("");

    var data = `
			   <li class='list-group-item json-menu-header' style="padding: 0px; margin-bottom: 10px;">
				   <strong>product service name</strong>
			   </li>`;

    for (let i = 0; i < menu.length; i++) {
        if (i == 0) {
            data += `
			   <div class="panel">
				   <div class="panel-heading">
					   <a class="accordion-toggle collapsed"
					   			data-toggle="collapse"
					   			id="pdService_Version_First_Child"
					   			name="versionLink_List"
					   			style="color: #a4c6ff; text-decoration: none; cursor: pointer; background: rgba(229, 96, 59, 0.20);"
					   			onclick="versionClick(this, ${menu[i].c_id});">
						   ${menu[i].c_title}
					   </a>
				   </div>
			   </div>`;
        } else {
            data += `
			   <div class="panel">
				   <div class="panel-heading">
					   <a class="accordion-toggle collapsed"
					   			data-toggle="collapse"
					   			name="versionLink_List"
					   			style="color: #a4c6ff; text-decoration: none; cursor: pointer;"
					   			onclick="versionClick(this, ${menu[i].c_id});">
						   ${menu[i].c_title}
					   </a>
				   </div>
			   </div>`;
        }
    }

    main.html(data);
}

////////////////////////////////////////////////////////////////////////////////////////
//버전 클릭할 때 동작하는 함수 (참고용) -> 향후 serverClick 으로 변경 예정
////////////////////////////////////////////////////////////////////////////////////////
function versionClick(element, c_id) {
    $("a[name='versionLink_List']").each(function () {
        this.style.background = "";
    });

    if (element == null) {
        console.log("element is empty");
    } else {
        element.style.background = "rgba(229, 96, 59, 0.20)";
        console.log("element is = " + element);
    }

    selectVersion = c_id;
    console.log("selectVersion" + selectVersion);
    $(".searchable").multiSelect("deselect_all");

    // 이미 등록된 제품(서비스)-버전-지라 연결 정보가 있는지 확인
    $.ajax({
        url: "/auth-user/api/arms/globaltreemap/getConnectInfo/pdService/pdServiceVersion/jiraProject.do",
        type: "GET",
        data: {
            pdservice_link: $("#pdservice_table").DataTable().rows(".selected").data()[0].c_id,
            pdserviceversion_link: c_id
        },
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true
    })
        .done(function (data) {
            var versionClickData = [];

            var multiSelectData = [];
            for (var k in data.response) {
                var obj = data.response[k];
                //var jira_name = obj.c_title;
                selectConnectID = obj.c_id;
                //multiSelectData.push(obj.jiraproject_link);
                versionClickData.push(obj);
            }

            if (versionClickData.length == 0) {
                $("#pdservice_connect").removeClass("btn-success");
                $("#pdservice_connect").addClass("btn-primary");
                $("#pdservice_connect").text("제품(서비스) Jira 연결 등록");
                //updateD3ByMultiSelect();
            } else {
                $("#pdservice_connect").removeClass("btn-primary");
                $("#pdservice_connect").addClass("btn-success");
                $("#pdservice_connect").text("제품(서비스) Jira 연결 변경");

                console.log("multiSelectData - " + multiSelectData.toString());
                $("#multiselect").multiSelect("select", multiSelectData.toString().split(","));
                //updateD3ByMultiSelect();
            }
        })
        .fail(function (e) {
            console.log("fail call");
        })
        .always(function () {
            console.log("always call");
        });
}

////////////////////////////////////////////////////////////////////////////////////////
// 제품(서비스)-버전-지라 저장
////////////////////////////////////////////////////////////////////////////////////////
function connect_pdservice_jira(){
    $("#pdservice_connect").click(function () {
        if ($("#pdservice_connect").hasClass("btn-primary") == true) {
            // data가 존재하지 않음.
            $.ajax({
                url: "/auth-user/api/arms/globaltreemap/setConnectInfo/pdService/pdServiceVersion/jiraProject.do",
                type: "POST",
                data: {
                    pdservice_link: $("#pdservice_table").DataTable().rows(".selected").data()[0].c_id,
                    pdserviceversion_link: selectVersion,
                    c_pdservice_jira_ids: JSON.stringify($("#multiselect").val())
                },
                progress: true
            })
                .done(function (data) {
                    //versionClick(null, selectVersion);
                    jSuccess("제품(서비스) - 버전 - JiraProject 가 연결되었습니다.");
                })
                .fail(function (e) {
                    console.log("fail call");
                })
                .always(function () {
                    console.log("always call");
                });
        } else if ($("#pdservice_connect").hasClass("btn-success") == true) {
            // data가 이미 있음
            $.ajax({
                url: "/auth-user/api/arms/globaltreemap/setConnectInfo/pdService/pdServiceVersion/jiraProject.do",
                type: "POST",
                data: {
                    pdservice_link: $("#pdservice_table").DataTable().rows(".selected").data()[0].c_id,
                    pdserviceversion_link: selectVersion,
                    c_pdservice_jira_ids: JSON.stringify($("#multiselect").val())
                },
                progress: true
            })
                .done(function (data) {
                    //versionClick(null, selectVersion);
                    jSuccess("제품(서비스) - 버전 - JiraProject 가 연결되었습니다.");
                })
                .fail(function (e) {
                    console.log("fail call");
                })
                .always(function () {
                    console.log("always call");
                });
        } else {
            jError("who are you?");
        }
    });
}


////////////////////////////////////////////////////////////////////////////////////////
// JIRA 프로젝트 데이터 로드 후 멀티 셀렉트 빌드 하고 슬림스크롤 적용
////////////////////////////////////////////////////////////////////////////////////////
/* --------------------------- multi select & slim scroll ---------------------------------- */
function setdata_for_multiSelect() {
    $.ajax({
        url: "/auth-user/api/arms/jiraProject/getChildNode.do?c_id=2",
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true
    })
        .done(function (data) {
            var optionData = [];
            for (var k in data) {
                var obj = data[k];
                var jira_name = obj.c_title;
                var jira_idx = obj.c_id;

                optionData.push("<option value='" + jira_idx + "'>" + jira_name + "</option>");
            }

            $(".searchable").html(optionData.join(""));

            ////////////////////////////////////////////////
            // 멀티 셀렉트 빌드
            buildMultiSelect();
            ////////////////////////////////////////////////
        })
        .fail(function (e) {
            console.log("fail call");
        })
        .always(function () {
            console.log("always call");
        });

    //slim scroll
    $(".ms-list").slimscroll();
}

////////////////////////////////////////////////////////////////////////////////////////
// 멀티 셀렉트 초기화 함수
////////////////////////////////////////////////////////////////////////////////////////
function buildMultiSelect() {
    //multiselect
    $(".searchable").multiSelect({
        selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='Search Jira Project'>",
        selectionHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='Selected Jira Project'>",
        afterInit: function (ms) {
            var that = this,
                $selectableSearch = that.$selectableUl.prev(),
                $selectionSearch = that.$selectionUl.prev(),
                selectableSearchString = "#" + that.$container.attr("id") + " .ms-elem-selectable:not(.ms-selected)",
                selectionSearchString = "#" + that.$container.attr("id") + " .ms-elem-selection.ms-selected";

            that.qs1 = $selectableSearch.quicksearch(selectableSearchString).on("keydown", function (e) {
                if (e.which === 40) {
                    that.$selectableUl.focus();
                    return false;
                }
            });

            that.qs2 = $selectionSearch.quicksearch(selectionSearchString).on("keydown", function (e) {
                if (e.which == 40) {
                    that.$selectionUl.focus();
                    return false;
                }
            });
        },
        afterSelect: function (value, text) {
            this.qs1.cache();
            this.qs2.cache();
            //d3Update();
        },
        afterDeselect: function (value, text) {
            this.qs1.cache();
            this.qs2.cache();
            //d3Update();
        }
    });
}

// list 클릭 이벤트 처리 - inBox 폐기..
function inBox_click_event () {
    $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
       let target = $(e.target).attr("href"); // activated tab
        console.log(target);
        // 고려해야 하는 tab - onpremise, cloud, stats, report, drowdown1
        if (target === "#stats") {
            $("#jira_server_details_popup_div").removeClass("hidden");
            $("#jira_server_update_div").addClass("hidden");
            $("#jira_server_delete_div").addClass("hidden");
        } else if ( target === "#report") {
            $("#jira_server_details_popup_div").addClass("hidden");
            $("#jira_server_update_div").removeClass("hidden");
            $("#jira_server_delete_div").addClass("hidden");
        } else if ( target === "#dropdown1") {
            $("#jira_server_details_popup_div").addClass("hidden");
            $("#jira_server_update_div").addClass("hidden");
            $("#jira_server_delete_div").removeClass("hidden");

            if (isEmpty(selectId)) {
                jError("선택된 제품(서비스)가 없습니다. 오류는 무시됩니다.");
            } else {
                $("#delete_text").text($("#pdservice_table").DataTable().rows(".selected").data()[0].c_title);
            }
        } else {
            //
        }
    });
}

//지라서버 - 목록에서 nav버튼(=) 클릭 액션
function jira_nav_btn_click() {
    $("#jira_server_list__nav_btn").click( function () {
        $("#jira_server_classify").toggleClass("collapse");
        //collapse
        if ($("#jira_server_classify").hasClass("collapse") === true) {
            $("#jira_con_nav").removeClass("col-sm-3");
            $("#jira_con_nav").addClass("col-sm-1");
            $("#jira_con_list").removeClass("col-sm-9");
            $("#jira_con_list").addClass("col-sm-11");
            $("jira_server_classify").html();
        } else { // expand
            $("#jira_con_nav").addClass("col-sm-3");
            $("#jira_con_nav").removeClass("col-sm-1");
            $("#jira_con_list").addClass("col-sm-9");
            $("#jira_con_list").removeClass("col-sm-11");
        }
        // $("#jira_server_classify").toggleClass("collapse");
        //버튼 누를 때, collapse 하고, 크기 조정
        //$("#jira_server_classify").addClass("collapse");
    });
}

////////////////////////////////////////////////////////////////////////////////////////
// --- 신규 제품(서비스) 등록 팝업 및 팝업 띄울때 사이즈 조정 -- //
////////////////////////////////////////////////////////////////////////////////////////
function popup_size_setting() {
    // 팝업  사이즈 조절 및 팝업 내용 데이터 바인딩
}

///////////////////////////////
// 팝업 띄울 때, UI 일부 수정되도록
////////////////////////////////
function modalPopup(popupName) {
    console.log("popupName = " + popupName);
    if (popupName === "modal_popup_readonly") {
        //modal_popup_readOnly = 새 창으로 지라(서버) 보기
        $("#my_modal2_title").text("지라(서버) 내용 보기 팝업");
        $("#my_modal2_sub").text("새 창으로 등록된 지라 정보를 확인합니다.")
        $("#extend_change_to_update_jira_server").removeClass("hidden");
        $("#extendupdate_jira_server").addClass("hidden");
    } else { //팝업 창으로 편집하기
        $("#my_modal2_title").text("지라(서버) 수정 팝업");
        $("#my_modal2_sub").text("a-rms에 등록된 지라(서버)의 정보를 수정합니다.")
        $("#extend_change_to_update_jira_server").addClass("hidden");
        $("#extendupdate_jira_server").removeClass("hidden");
    }
}

////////////////////////////////////////////////////////////////////////////////////////
// --- select2 (사용자 자동완성 검색 ) 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function select2_setting() {
    $(".js-data-example-ajax").select2({
        maximumSelectionLength: 5,
        width: "resolve",
        ajax: {
            url: function (params) {
                return "/auth-check/getUsers/" + params.term;
            },
            dataType: "json",
            delay: 250,
            //data: function (params) {
            //    return {
            //        q: params.term, // search term
            //        page: params.page,
            //    };
            //},
            processResults: function (data, params) {
                // parse the results into the format expected by Select2
                // since we are using custom formatting functions we do not need to
                // alter the remote JSON data, except to indicate that infinite
                // scrolling can be used
                params.page = params.page || 1;

                return {
                    results: data,
                    pagination: {
                        more: params.page * 30 < data.total_count
                    }
                };
            },
            cache: true
        },
        placeholder: "소유자(등록자) 설정을 위한 계정명을 입력해 주세요",
        minimumInputLength: 1,
        templateResult: formatUser,
        templateSelection: formatUserSelection
    });
}

////////////////////////////////
// 지라 서버 등록
////////////////////////////////
function save_btn_click() {
    $("#regist_jira_server").click(function () {
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
                /*c_pdservice_owner: $("#popup_editview_pdservice_owner").select2("data")[0].text,*/
            },
            statusCode: {
                200: function () {
                    //모달 팝업 끝내고
                    $("#close_regist_jira_server").trigger("click");
                    //데이터 테이블 데이터 재 로드
                    dataTableRef.ajax.reload();
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
    });
}
////////////////////////////////
// 지라 서버 삭제 버튼
////////////////////////////////
function delete_btn_click() { // TreeAbstractController 에 이미 있음.
    $("#delete_jira_server").click(function () {
        $.ajax({
            url: "/auth-user/api/arms/jiraServer/removeNode.do",
            type: "delete",
            data: { //테이블 형식으로 Card를 나열할 수 있을 것인가.
              c_id: $("#jira_connection_table").DataTable().rows(".selected").data()[0].c_id
            },

        });
    })
}

/////////////////////////////////////
// 지라 서버 클릭할 때 동작하는 함수
// 1. 상세보기 데이터 바인딩
// 2. 편집하기 데이터 바인딩
/////////////////////////////
function jiraServerCardClick(c_id) {
    selectId = c_id; // T_jira_server 의 c_id

    $.ajax({
        url: "/auth-user/api/arms/jiraServer/getNode.do",
        data: { c_id : c_id },
        method: "GET", // HTTP 요청 메소드(GET, POST 등)
        dataType: "json", // 서버에서 보내줄 데이터의 타입
        beforeSend: function () {
            $(".loader").removeClass("hide");
        }
    })
        .done( function (json) {
            // c_jira_server_name 또는 c_title
            var selectedHtml =
                `<div class="chat-message">
				<div class="chat-message-body" style="margin-left: 0px !important;">
					<span class="arrow" style="top: 35% !important;"></span>
					<span class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 선택된 지라 서버 :  </span>
				<span class="text" style="color: #a4c6ff;">
				` + json.c_jira_server_name +
                `
				</span>
				</div>
				</div>
				<div class="gradient_bottom_border" style="width: 100%; height: 2px; padding-top: 10px;"></div>`;

            $(".list-group-item").html(selectedHtml);

    })
        .fail( function (xhr, status, errorThrown) {
        console.log(xhr + status + errorThrown);
    })
        .always( function (xhr, status) {
            console.log(xhr + status);
            $(".loader").addClass("hide"); // progress?
        });

    // 사용처 미정.
    //$("#delete_text").text($("#pdservice_table").DataTable().rows(".selected").data()[0].c_title);
}

//////////////////////////////
// card_deck 이니셜라이즈
//////////////////////////////
function init_card_deck() {
    var menu;
/*    $.fn.jsonMenu = function (action, items, options) {

    }*/
}