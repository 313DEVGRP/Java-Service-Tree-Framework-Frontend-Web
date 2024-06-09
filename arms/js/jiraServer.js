//////////////////////////////////
// Page 전역 변수
//////////////////////////////////
var selectServerId;   // 선택한 서버 이름 (c_id)
var selectServerName; // 선택한 서버 이름 (c_jira_server_name )
var selectServerType; // 선택한 서버 타입 (c_jira_server_type, 클라우드 or 온프레미스)
var selectedTab;     // 선택한 탭
var selectProjectId; // 선택한 지라프로젝트 아이디
var selectRadioId; // 이슈 유형 or 이슈 상태 or 이슈 해결책

var dataTableRef; // 데이터테이블 참조 변수

var serverDataList; // 서버 전체 맵

var isAccountVerified = false; // 계정 검증 완료 플래그
var req_state_data = {
	"10": "열림",
	"11": "진행중",
	"12": "해결됨",
	"13": "닫힘"
};

////////////////
//Document Ready
////////////////
function execDocReady() {

	var pluginGroups = [

		[   "../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/lightblue4/docs/lib/d3/d3.min.js",
			"../reference/lightblue4/docs/lib/nvd3/build/nv.d3.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"],

		[   "css/jiraServerCustom.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

		[   "../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"
		],

		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function() {

			console.log('모든 플러그인 로드 완료');

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
						if(window.CKEDITOR.status === "loaded"){
							CKEDITOR.replace("input_jira_server_editor",{ skin: "office2013" });
							CKEDITOR.replace("detailview_jira_server_contents",{ skin: "office2013" });
							CKEDITOR.replace("extend_modal_editor",{ skin: "office2013" }); //팝업편집
							CKEDITOR.replace("modal_editor",{ skin: "office2013" });
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

			popup_buttons_click();
			popup_update_btn_click();

			autoSlide();

			레드마인_안내문구();
			서버등록_계정검증_버튼_클릭();

			var 라따적용_클래스이름_배열 = ['.default_update', '.jira_renew_btn'];
			laddaBtnSetting(라따적용_클래스이름_배열);

		})
		.catch(function() {
			console.error('플러그인 로드 중 오류 발생');
		});

}

function makeJiraServerCardDeck() {
	console.log("지라 서버 카드 목록 생성");
	// 지라 서버 목록 데이터 가져오기 및 element 삽입
	$.ajax({
		url: "/auth-user/api/arms/jiraServerPure/getJiraServerMonitor.do",
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				/////////////////// insert Card ///////////////////////
				let obj = data;
				serverDataList = {};
				for (let k in obj) {
					let serverData = obj[k];
					serverDataList[serverData.c_id] = serverData;
				}

				draw_card_deck(obj);
			}
		},
		beforeSend: function () {
			//$(".loader-ribbon").removeClass("hide");
			//$("#regist_pdservice").hide(); 버튼 감추기
		},
		complete: function () {
			//$(".loader-ribbon").addClass("hide");
			//$("#regist_pdservice").show(); 버튼 보이기
		},
		error: function (e) {
			jError("지라(서버) 목록 조회 중 에러가 발생했습니다.");
		}
	});
}

///////////////////////////////
//서버 목록 조회 (카드 덱 형태)
///////////////////////////////
function draw_card_deck(alm_server_list) {
	$("#jira_server_card_deck").html(""); // 카드 덱 초기화

	var data=``;

	if (alm_server_list.length > 0) {
		// 카드 있음 (등록된 서버 있음)
		for (let i = 0; i < alm_server_list.length; i++) {
			let insertImage = '';
			if (alm_server_list[i].c_jira_server_type === '클라우드') {
				insertImage = `<img src="./img/jira/mark-gradient-white-jira.svg" width="30px" style=""></img>`;
			}
			if (alm_server_list[i].c_jira_server_type === '온프레미스') {
				insertImage = `<img src="./img/jira/mark-gradient-blue-jira.svg" width="30px" style=""></img>`;
			}
			if (alm_server_list[i].c_jira_server_type === '레드마인_온프레미스') {
				insertImage = `<img src="./img/redmine/logo.png" width="30px" style=""></img>`;
			}

			data += `<div class="card mb-2 ribbon-box ribbon-fill right" id="card-${alm_server_list[i].c_id}" onclick="jiraServerCardClick(${alm_server_list[i].c_id})">
						<!-- 리본표시 부분 -->
						<div class="ribbon-${alm_server_list[i].c_id}"></div>					
						<!--카드내용1-->
						<div class="card-body">
							<div class="" style="display: flex; align-items: baseline;">
								<div class="flex-shrink-0 card-icon-wrap">
									<div class="card-icon bg-light rounded">
										${insertImage}
									</div>
								</div>
								<div class="flex-grow-1 ml-4 mb-2">
									<h5 class="fs-15 mb-1 font14">${alm_server_list[i].c_title}</h5>
									<p class="font13 text-muted">${alm_server_list[i].c_jira_server_base_url}</p>
								</div>
							</div>
							<!-- 값 넣을 수 있는 공간 -->
							<p class="font13 mt-1" style="margin-bottom: 0px;"></p>
						</div>
						<!--카드내용2-->
						<div class="card-body top-border border-top">
							<div class="d-flex-sb-11">
								<div class="flex-grow-1">
									<h6 class="font13">status: <i class="fa fa-circle-o"></i> 200</h6>
								</div>
								<h6 class="font13">Last Update - <i class="fa fa-clock-o mr-2"></i>08 Aug, 2023</h6>
							</div>
						</div>
					</div>`;

			// 리본출력 함수 호출
			draw_ribbon(alm_server_list[i].c_id, alm_server_list[i].c_jira_server_type);
		}
	}

	$("#jira_server_card_deck").html(data);
}

/////////////////////////////////////
// 지라 서버 클릭할 때 동작하는 함수
// 1. 상세보기 데이터 바인딩
// 2. 편집하기 데이터 바인딩
/////////////////////////////
function jiraServerCardClick(alm_server_c_id) {
	if(!alm_server_c_id) {
		alert("선택된 ALM 서버가 없습니다.");
		return;
	}
	else {
		selectServerId = alm_server_c_id;
	}

	return new Promise((resolve, reject) => {
		$.ajax({
			url: "/auth-user/api/arms/jiraServerPure/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
			data: { c_id: alm_server_c_id },
			method: "GET",
			dataType: "json", // 서버에서 보내줄 데이터의 타입
			beforeSend: function () {
				$(".loader").removeClass("hide");
				let cardId = "#card-"+alm_server_c_id;
				$(".card").removeClass("clicked");
				$(cardId).addClass("clicked");
			},
			success: function(response) {
				resolve(); // 비동기 작업 성공 시 resolve 호출
			},
			error: function(error) {
				reject(error); // 비동기 작업 실패 시 reject 호출
			}
		})
			// HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
			.done(function (json) {
				console.log(json);

				selectServerType = "";
				selectServerId = json.c_id;
				selectServerName = json.c_title;
				selectServerType = json.c_jira_server_type;
				let alm_server_type = json.c_jira_server_type;

				$("#nav_stats>a").click();
				display_set_wide_projectTable();

				// 디폴트
				// 상세보기 , 편집하기, 지라프로젝트, 이슈 운선순위, 이슈 유형, 삭제하기
				if (alm_server_type === "클라우드") {
					// 상세보기 , 편집하기, 지라 프로젝트, 이슈 우선수위, 삭제하기
					$("#type_tab").hide(); // 이슈 유형 숨김
					$("#status_tab").hide(); // 이슈 상태 숨김
					$("#resolution_tab").hide(); // 이슈 해결책 숨김
					$("#redmine_info_edit").hide();
					$("#cloudIssueTypeInfo").removeClass("hidden");

					$("li a[href='#related_project'] strong").text("지라 프로젝트");
				}
				else if (alm_server_type === "온프레미스") {
					// 상세보기, 편집하기, 지라프로젝트, 이슈 우선순위, 이슈 유형, 삭제하기
					$("#type_tab").show();// 이슈 유형 보여주기
					$("#status_tab").removeClass("hidden").show();
					$("#resolution_tab").hide(); //해결책 숨김
					$("#redmine_info_edit").hide();
					$("#cloudIssueTypeInfo").addClass("hidden");

					$("li a[href='#related_project'] strong").text("지라 프로젝트");
				}
				else {
					// 상세보기, 편집하기, 지라프로젝트, 이슈 우선순위, 이슈 상태, 삭제하기
					$("#type_tab").hide(); // 이슈 유형 슴김
					$("#status_tab").removeClass("hidden").show();
					$("#resolution_tab").hide(); // 해결책 숨기기
					$("#redmine_info_edit").show();
					$("#cloudIssueTypeInfo").removeClass("hidden");

					$("li a[href='#related_project'] strong").text("레드마인 프로젝트");
				}

				// Sender 설정
				var selectedHtml =
					`<div class="chat-message">
					<div class="chat-message-body" style="margin-left: 0px !important;">
					   <span class="arrow" style="top: 35% !important;"></span>
					   <span class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 선택된 서버 :  </span>
						<span class="text" style="color: #a4c6ff;">
						` + json.c_title + `	
						</span>
					</div>
				</div>`;

				$("#list-group-item").html(selectedHtml);

				// => 데이터 바인딩 설정해야함.
				$("#detailview_jira_server_name").val(json.c_title);
				$("#editview_jira_server_name").val(json.c_title);

				if (alm_server_type === "클라우드") {
					$("#detailview_jira_server_type_option1").parent().click();
					$("#editview_jira_server_type_option1").parent().click();
				}
				else if (alm_server_type === "온프레미스") {
					$("#detailview_jira_server_type_option2").parent().click();
					$("#editview_jira_server_type_option2").parent().click();
				}
				else{
					$("#detailview_jira_server_type_option3").parent().click();
					$("#editview_jira_server_type_option3").parent().click();
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

				//상세보기 에디터 부분
				CKEDITOR.instances.detailview_jira_server_contents.setData(json.c_jira_server_contents);
				//편집하기 에디터 부분
				CKEDITOR.instances.input_jira_server_editor.setData(json.c_jira_server_contents);

				//삭제 부분
				$("#delete_text").text(json.c_title);
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
			searchable: true,
			orderable: false,
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return `<div style='color: #808080'>N/A</div>`;
				}

				let project_c_id = row.c_id;
				let splitData = splitAndColor(data);
				let buttonHTML = `<button 
												style="border:0; background:rgba(51,51,51,0.425); color:#fbeed5; vertical-align: middle" 
												onclick="click_projectList_table('${data}', '${selectServerType}', '${project_c_id}')">
												<i class="fa fa-th-list" />
											</button>`;

				return `<div style='white-space: nowrap; color: #f8f8f8'>${splitData}${buttonHTML}</div>`;
			},
		}
	];

	var columnDefList_onpremise = [];
	var rowsGroupList = null;
	var jquerySelector = "#jira_project_table";
	var ajaxUrl = "/auth-user/api/arms/jiraServer/getJiraProjectPure.do?c_id=" + c_id;
	var jsonRoot = "response";
	if (selectServerType === "클라우드" || selectServerType === "레드마인_온프레미스") {
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

	$(jquerySelector+' tbody').off('click', 'tr');
}

function dataTableDrawCallback(tableInfo) {
	console.log("[ jiraServer :: dataTableDrawCallback ] :: selectedTab -> " + selectedTab);
	console.log("[ jiraServer :: dataTableDrawCallback ] :: tableInfo");
	console.log(tableInfo);

	var className = "";

	if(selectedTab !== undefined) {
		if (selectedTab ==="issuePriority") { className = "issuePriority";   }
		if (selectedTab === "issueStatus") {
			if (selectServerType === "클라우드") { className = "project-issueStatus"; }
			else { className = "issueStatus"; }
		}
		if (selectedTab === "issueType") {
			if (selectServerType === "클라우드"||selectServerType === "레드마인_온프레미스") { className = "project-issueType"; }
			else { className = "issueType"; }
		}
	}

	var tableData = tableInfo.aoData;
	if(!isEmpty(tableData)) {
		tableData.forEach(function (rowInfo, index) {
			if( !isEmpty(rowInfo._aData) ) {
				var tableRowData = rowInfo._aData;
				var rowIsDefault = tableRowData.c_check;
				var rowNameClass = "." + className + "-data" + index;

				var appendHtml = rowNameClass+">input";
				if (rowIsDefault === "true") {
					$(appendHtml).prop("checked", "true");
				}
			}
		});
	}
}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(settings, json) {

	// 데이터 테이블 그려진 후 상태 매핑 select2 적용
	$(".chzn-select").each(function () {
		// $(this).select2($(this).data());
		$(this).select2({
			...$(this).data(),
			minimumResultsForSearch: -1 // 검색 기능 제거
		});
	});

	// slim scroll 적용
	// $(".select_status_mapping").on("select2:open", function () {
	// 	makeSlimScroll(".select2-results__options");
	// });

	$(".select_status_mapping").on("select2:select", function (e) {

		console.log(e);
		console.log(e.params);
		console.log(e.params.data.element);
		let issue_status_c_id = $(e.params.data.element).data('id');
		let issue_status_name = $(e.params.data.element).data('title');
		let req_state_c_id = $(e.params.data.element).val();
		let req_state_c_title = $(e.params.data.element).text();
		console.log(issue_status_c_id);
		console.log(req_state_c_id);

		// ajax updateNode 호출
		$.ajax({
			url: "/auth-user/api/arms/jiraIssueStatus/updateNode.do",
			type: "put",
			data: { c_id: issue_status_c_id, c_desc: req_state_c_id},
			statusCode: {
				200: function () {
					jSuccess( issue_status_name + " 상태가 " + req_state_c_title + "와 매핑 되었습니다.");
				}
			}
		});
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// --- 신규 제품(서비스) 등록 팝업 및 팝업 띄울때 사이즈 조정 -- //
////////////////////////////////////////////////////////////////////////////////////////
function popup_buttons_click() {
	// 팝업 사이즈 조절 및 팝업 내용 데이터 바인딩
	//지라 서버(등록)
	$("#modal_popup_id").click(function () {
		console.log("modal_popup_id clicked");
		isAccountVerified = false;
		$('#verify_account').text("계정 검증 하기");
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

		if ($("#editview_jira_server_type").find(".active input").val() === "클라우드") {
			$("#extend_editview_jira_server_type_option1").parent().click();
		}
		else if (($("#editview_jira_server_type").find(".active input").val() === "온프레미스") ) {
			$("#extend_editview_jira_server_type_option2").parent().click();
		}
		else{
			$("#extend_editview_jira_server_type_option3").parent().click();
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

		if ($("#editview_jira_server_type").find(".active input").val() === "클라우드") {
			$("#extend_editview_jira_server_type_option1").parent().click();
		}
		else if ($("#editview_jira_server_type").find(".active input").val() === "온프레미스"){
			$("#extend_editview_jira_server_type_option2").parent().click();
		}
		else{
			$("#extend_editview_jira_server_type_option3").parent().click();
		}

	});

}

///////////////////////////////////
// 팝업 띄울 때, UI 일부 수정되도록
///////////////////////////////////
function modalPopup(popupName) {
	if (popupName === "modal_popup_readonly") {
		//modal_popup_readOnly = 새 창으로 지라(서버) 보기
		$("#my_modal2_title").text("지라(서버) 내용 보기 팝업");
		$("#my_modal2_sub").text("새 창으로 등록된 지라 정보를 확인합니다.");
		//$("#extend_change_to_update_jira_server").removeClass("hidden");
		$("#extendupdate_jira_server").addClass("hidden");
	} else { //팝업 창으로 편집하기
		$("#my_modal2_title").text("지라(서버) 수정 팝업");
		$("#my_modal2_sub").text("a-rms에 등록된 지라(서버)의 정보를 수정합니다.")
		$("#extend_change_to_update_jira_server").addClass("hidden");
		$("#extendupdate_jira_server").removeClass("hidden");
	}
}
function 레드마인_안내문구(){
	$('input[type="radio"][name="options"]').change(function() {

		if ($('#popup_editview_jira_server_type_option3').is(':checked')) {
			$('#redmine_info').show();
		}else{
			$('#redmine_info').hide();
		}

	});
}

////////////////////////////////
// 지라 서버 등록
////////////////////////////////
function 서버등록_계정검증_버튼_클릭(){
	$('#verify_account').off().click(function(){
		var uri = $("#popup_editview_jira_server_base_url").val();
		var type = $("#popup_editview_jira_server_type input[name='options']:checked").val();
		var userId = $("#popup_editview_jira_server_connect_id").val();
		var passwordOrToken = $("#popup_editview_jira_pass_token").val();

		if(!type){
			alert("ALM 환경을 선택해주세요.");
			return;
		}

		if(!uri){
			alert("ALM URL을 입력해주세요.");
			return;
		}

		if(!userId){
			alert("ALM ID를 입력해주세요.");
			return;
		}
		if(!passwordOrToken){
			alert("ALM 암호 또는 토큰을 입력해주세요.");
			return;
		}
		console.log("Base URL==> " + uri);
		console.log("c_jira_server_type==> " + type);
		console.log("c_jira_server_connect_id==> " +userId);
		console.log("c_jira_server_connect_pw==> " + passwordOrToken);

		$.ajax({
			url: "/auth-user/api/arms/jiraServer/verifyAccount.do",
			type: "GET",
			data: {
				uri: uri,
				type: type,
				userId: userId,
				passwordOrToken: passwordOrToken
			},
			statusCode: {
				200: function (계정_정보) {
					if(type ==="레드마인_온프레미스"){
						var isAdmin = 계정_정보.response.admin;
						if(isAdmin === true ){
							jSuccess("계정 검증이 완료 되었습니다.");
							isAccountVerified = true;
							$('#verify_account').text("계정 검증 성공");
						}else{
							jError("관리자 계정이 아닙니다. 등록한 정보를 확인해 주세요.");
						}
					}else{
						var isActivate = 계정_정보.response.active;
						if(isActivate === true ){
							jSuccess("계정 검증이 완료 되었습니다.");
							isAccountVerified = true;
							$('#verify_account').text("계정 검증 성공");
						}else{
							jError("활성화된 계정이 아닙니다. 등록한 정보를 확인해 주세요.");
						}
					}
				}
			},
			error: function(){
				jError("등록이 불가한 계정 정보입니다. 등록한 정보를 확인해 주세요.");
			}
		});

	});
}

function save_btn_click() {
	$("#regist_jira_server").off().click(function() {
		if (!isAccountVerified) { // 계정 검증이 완료되지 않았다면
			jError("계정 검증을 먼저 해주세요.");
		}
		else {
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
					200: function() {
						//모달 팝업 끝내고
						$("#close_regist_jira_server").trigger("click");
						//지라 서버 목록 재 로드
						makeJiraServerCardDeck();
						//dataTableRef.ajax.reload();
						jSuccess("신규 제품 등록이 완료 되었습니다.");
					}
				},
				beforeSend: function() {
					$("#regist_jira_server").hide();
				},
				complete: function() {
					$("#regist_jira_server").show();
				},
				error: function(e) {
					jError("지라 서버 등록 중 에러가 발생했습니다.");
				}
			});
		}
	});
}

function update_btn_click(){
	$("#jira_server_update").click( function () {
		console.log($("#editview_jira_server_type input[name='options']:checked").val());

		$.ajax({
			url: "/auth-user/api/arms/jiraServer/updateNodeAndEngineServerInfoUpdate.do",
			type: "put",
			data: {
				c_id: selectServerId,
				c_title: $("#editview_jira_server_name").val(),
				c_jira_server_name: $("#editview_jira_server_name").val(),
				c_jira_server_type: $("#editview_jira_server_type input[name='options']:checked").val(),
				c_jira_server_base_url: $("#editview_jira_server_base_url").val(),
				c_jira_server_connect_id: $("#editview_jira_server_connect_id").val(),
				c_jira_server_connect_pw: $("#editview_jira_pass_token").val(),
				c_jira_server_contents: CKEDITOR.instances.input_jira_server_editor.getData()
			},
			statusCode: {
				200: function () {
					jSuccess(selectServerName + "의 데이터가 변경되었습니다.");
					console.log("현재 선택된 항목(c_id, 서버명) :" + selectServerId +", " + selectServerName);
					//데이터 테이블 데이터 재 로드
					makeJiraServerCardDeck();
					jiraServerCardClick(selectServerId);
				}
			}
		});
	});
}

function popup_update_btn_click() {
	$("#extendupdate_jira_server").click( function () {

		$.ajax({
			url: "/auth-user/api/arms/jiraServer/updateNodeAndEngineServerInfoUpdate.do",
			type: "put",
			data: {
				c_id: selectServerId,
				c_title: $("#extend_editview_jira_server_name").val(),
				c_jira_server_name: $("#extend_editview_jira_server_name").val(),
				c_jira_server_type: $("#extend_editview_jira_server_type input[name='options']:checked").val(),
				c_jira_server_base_url: $("#extend_editview_jira_server_base_url").val(),
				c_jira_server_connect_id: $("#extend_editview_jira_server_connect_id").val(),
				c_jira_server_connect_pw: $("#editview_jira_pass_token").val(),
				c_jira_server_contents: CKEDITOR.instances.extend_modal_editor.getData()
			},
			statusCode: {
				200: function () {
					$("#extendclose_jira_server").trigger("click");

					jSuccess(selectServerName + "의 데이터가 팝업으로 변경되었습니다.");
					console.log("현재 선택된 항목(c_id, 서버명) :" + selectServerId +", " + selectServerName);
					//데이터 테이블 데이터 재 로드
					makeJiraServerCardDeck();
					jiraServerCardClick(selectServerId);
				}
			}
		});
	});
}

////////////////////////////////
// 지라 서버 삭제 버튼
////////////////////////////////
function delete_btn_click() { // TreeAbstractController 에 이미 있음.
	console.log("삭제 버튼 활성화");

	$("#delete_jira_server").click(function () {
		console.log("selectServerName = " + selectServerName);
		if(!confirm("정말 삭제하시겠습니까? \n 삭제할 서버명 : " + selectServerName )) {
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

function set_renew_btn(selectedTab, selectServerId) {
	$("#jira_renew_button_div").html("");
	var renewHtml = ``;
	if(selectedTab === "jiraProject") {
		renewHtml += `<button type="button"
                             onClick="jira_renew('almProject', ${selectServerId}, null)"
                             data-style="contract"
                             class="jira_project_renew_btn btn btn-success btn-sm mr-1">
                            프로젝트 갱신
                     </button>`;
	}else if(selectedTab === "issuePriority") {
		renewHtml += `<button type="button"
                             onClick="jira_renew('issuePriority', ${selectServerId}, null)"
                             data-style="contract"
                             class="jira_priority_renew_btn btn btn-success btn-sm mr-1">
                            이슈우선순위 갱신
                     </button>`;
	}else if(selectedTab === "issueType") {
		renewHtml += `<button type="button"
                             onClick="jira_renew('issueType', ${selectServerId}, null)"
                             data-style="contract"
                             class="jira_type_renew_btn btn btn-success btn-sm mr-1">
                            이슈유형 갱신
                     </button>`;
	}else if(selectedTab === "issueStatus") {
		renewHtml += `<button type="button"
                             onClick="jira_renew('issueStatus', ${selectServerId}, null)"
                             data-style="contract"
                             class="jira_status_renew_btn btn btn-success btn-sm mr-1">
                            이슈상태 갱신
                     </button>`;
	}
	$("#jira_renew_button_div").html(renewHtml);

	var 라따적용_클래스이름_배열 = ['.jira_project_renew_btn', '.jira_priority_renew_btn', '.jira_type_renew_btn', '.jira_status_renew_btn'];
	laddaBtnSetting(라따적용_클래스이름_배열);
}

function set_renew_btn_3rd_grid(selectdTab, selectServerId, selectProjectId) {
	$("#jira_renew_button_div_3rd_grid").html("");
	var renewHtml = ``;
	if(selectedTab === "issueType") {
		renewHtml += `<button type="button"
                            onClick="jira_renew('issueType', ${selectServerId} ,${selectProjectId})"
                             data-style="contract"
                             class="jira_project_type_renew_btn btn btn-success btn-sm mr-1"
                             style="width:77%">
                            이슈유형 갱신
                     </button>`;
	}
	if(selectedTab === "issueStatus") {
		renewHtml += `<button type="button"
                             onClick="jira_renew('issueStatus', ${selectServerId} ,${selectProjectId})"
                             data-style="contract"
                             class="jira_project_status_renew_btn btn btn-success btn-sm mr-1"
                             style="width:77%">
                            이슈상태 갱신
                     </button>`;
	}
	$("#jira_renew_button_div_3rd_grid").html(renewHtml);
	var 라따적용_클래스이름_배열 = ['.jira_project_type_renew_btn', '.jira_project_status_renew_btn'];
	laddaBtnSetting(라따적용_클래스이름_배열);
}

function set_redmine_renew_btn_3rd_grid(selectdTab, selectServerId, selectProjectId) {
	$("#redmine_renew_button_div_3rd_grid").html("");
	var renewHtml = ``;
	if(selectedTab === "issueType") {
		renewHtml += `<button type="button"
                             onClick="jira_renew('issueType', ${selectServerId} ,${selectProjectId})"
                             data-style="contract"
                             class="jira_project_type_renew_btn btn btn-success btn-sm mr-1"
                             style="width:77%">
                            이슈유형 갱신
                     </button>`;
	}
	$("#redmine_renew_button_div_3rd_grid").html(renewHtml);
	var 라따적용_클래스이름_배열 = ['.jira_project_type_renew_btn', '.jira_project_status_renew_btn'];
	laddaBtnSetting(라따적용_클래스이름_배열);
}

function tab_click_event() { // 탭 클릭시 이벤트
	$('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {

		var target = $(e.target).attr("href"); // activated tab
		console.log("[ jiraServer :: tab_click_event ] :: target => " + target);

		if (isEmpty(selectServerId)) {
			jError("선택된 ALM 서버가 없습니다. ALM 서버를 선택해주세요. 오류는 무시됩니다.");
			return;
		}

		if (target === "#dropdown1") { // 삭제하기
			$("#jira_default_update_div").addClass("hidden");
			$("#jira_server_update_div").addClass("hidden");
			$("#jira_server_delete_div").removeClass("hidden");
			$("#jira_renew_button_div").addClass("hidden");

			$(".body-middle").hide();
		}
		else if (target === "#report") { // 편집하기
			$("#jira_default_update_div").addClass("hidden");
			$("#jira_server_update_div").removeClass("hidden");
			$("#jira_server_delete_div").addClass("hidden");
			$("#jira_renew_button_div").addClass("hidden");
		}
		else if (target === "#related_project") {
			selectedTab = "jiraProject";
			set_renew_btn(selectedTab, selectServerId);
			$("#jira_renew_button_div").removeClass("hidden");
			$("#jira_default_update_div").addClass("hidden");
			$("#jira_server_update_div").addClass("hidden");
			$("#jira_server_delete_div").addClass("hidden");

			project_dataTableLoad(selectServerId);

		}
		else if (target ==="#stats") { // 상세보기, 처음화면
			$("#jira_default_update_div").addClass("hidden");
			$("#jira_server_update_div").addClass("hidden");
			$("#jira_server_delete_div").addClass("hidden");
			$("#jira_renew_button_div").addClass("hidden");
			if (selectServerId === undefined) {
				$(".body-middle").hide();
			} else {
				$(".body-middle").show();
			}
		}
		else {
			$("#jira_default_update_div").removeClass("hidden");
			$("#jira_server_delete_div").addClass("hidden");
			if (target ==="#server_issue_priority") {
				selectedTab = "issuePriority";
				$("#server_issue_priority").removeClass("hidden");
				set_renew_btn(selectedTab, selectServerId);
				$("#jira_renew_button_div").removeClass("hidden");

				if (isEmpty(selectServerId)) {
					jError("선택된 ALM 서버가 없습니다. ALM 서버를 선택해주세요. 오류는 무시됩니다.");
				}

				display_set_wide_projectTable();
				jiraServerDataTable(selectedTab);
			}

			if (target === "#issue_type" || target ==="#server_issue_type") {
				selectedTab = "issueType";
				$("#issue_type_table").removeClass("hidden");
				$("#issue_status_table").addClass("hidden");
				$("#default_project_each_update").removeClass("hidden");

				if (isEmpty(selectServerId)) {
					jError("선택된 ALM 서버가 없습니다. ALM 서버를 선택해주세요. 오류는 무시됩니다.");
				}

				if (selectServerType === "클라우드" || selectServerType === "레드마인_온프레미스")  {
					$("#jira_default_update_div").addClass("hidden");
					$("#jira_renew_button_div_3rd_grid").removeClass("hidden");
					set_renew_btn_3rd_grid(selectedTab, selectServerId, selectProjectId);
					projectIssueTypeDataTable(selectProjectId);
				}
				if (selectServerType === "온프레미스") {
					$("#server_issue_type").removeClass("hidden");
					$("#jira_renew_button_div").removeClass("hidden");
					set_renew_btn(selectedTab, selectServerId);
					jiraServerDataTable(selectedTab);
				}

			}
			if (target === "#issue_status" || target ==="#server_issue_status") {
				$("#jira_default_update_div").addClass("hidden");
				$("#default_project_each_update").addClass("hidden");

				selectedTab = "issueStatus";
				$("#issue_type_table").addClass("hidden");
				$("#issue_status_table").removeClass("hidden");

				if (isEmpty(selectServerId)) {
					jError("선택된 ALM 서버가 없습니다. ALM 서버를 선택해주세요. 오류는 무시됩니다.");
				}

				if (selectServerType === "클라우드")  {
					$("#jira_default_update_div").addClass("hidden");
					$("#jira_renew_button_div_3rd_grid").removeClass("hidden");
					set_renew_btn_3rd_grid(selectedTab, selectServerId, selectProjectId);
					// projectIssueStatusDataTable();
					draw_req_state_mapping_datatable("project_issuestatus", selectProjectId);
				}
				if (selectServerType === "온프레미스") {
					$("#server_issue_status").removeClass("hidden");
					$("#jira_renew_button_div").removeClass("hidden");
					set_renew_btn(selectedTab, selectServerId);
					// jiraServerDataTable(selectedTab);
					draw_req_state_mapping_datatable(selectedTab);
				}

				if (selectServerType === "레드마인_온프레미스")  {
					$("#jira_renew_button_div_3rd_grid").removeClass("hidden");
					$("#server_issue_status").removeClass("hidden");
					$("#jira_renew_button_div").removeClass("hidden");
					set_renew_btn(selectedTab, selectServerId);
					display_set_wide_projectTable();
					// jiraServerDataTable(selectedTab);
					draw_req_state_mapping_datatable(selectedTab);
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

// 갱신 버튼 (project, issueType, issuePriority, issueStatus)
function jira_renew(renewJiraType, serverId, projectId) { // 서버 c_id
	if (serverId === undefined) { serverId = "서버 아이디 정보 없음"; return false; }
	if (projectId === undefined) { projectId = null; }
	if (renewJiraType === undefined) { renewJiraType = "갱신할 지라 타입 없음"; return false; }
	console.log("[ jiraServer :: jira_renew] :: renewJiraType =>" + renewJiraType +" serverId => " + serverId);

	$.ajax({
		url: "/auth-user/api/arms/jiraServer/"+ renewJiraType + "/renewNode.do",
		type: "put",
		data: { c_id: serverId, projectCId: projectId},
		statusCode: {
			200: function () {
				jSuccess(selectServerName + "의 데이터가 갱신되었습니다.");
				console.log("현재 선택된 항목(c_id, 서버명) :" + serverId +", " + selectServerName);
				//데이터 테이블 데이터 재 로드
				//makeJiraServerCardDeck();
				//jiraServerCardClick(serverId);
				if(renewJiraType === 'almProject'){
					project_dataTableLoad(selectServerId);
				}
				else if (renewJiraType === 'issueStatus') {
					if (projectId) {
						renewJiraType = "project_issuestatus";
					}
					draw_req_state_mapping_datatable(renewJiraType, projectId);
				}
				else {
					jiraServerDataTable(renewJiraType);
				}
			}
		}
	});
}

function projectIssueTypeDataTable(project_c_id) {
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
		},
		{ title:"이슈 유형 아이디",
			data: "c_issue_type_id",
			className: "dt-body-left",
			defaultContent: "<div style='color: #808080'>N/A</div>"
		}
	];
	var rowsGroupList = []; //그룹을 안쓰려면 null 처리
	var columnDefList = [];
	var selectList = {};
	var orderList = [[1, "asc"]];
	var buttonList = [];
	console.log("[ jiraServer :: projectIssueTypeDataTable ] selectProjectId => " + project_c_id);
	var jquerySelector = "#issue_type_table";
	var ajaxUrl = "/auth-user/api/arms/jiraProject/getProjectIssueType.do?c_id=" + project_c_id; // 사용 예정
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

// 이슈 유형, 우선순위 데이터 테이블, 상태는 draw_req_state_mapping_datatable에서 처리
function jiraServerDataTable(target) {
	console.log("[ jiraServer :: jiraServerDataTable] target = " +target);
	var columnList;
	var targetAjaxUrl ="";
	var targetSelector ="";

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
		},
		{ title:"이슈 유형 아이디",
			data: "c_issue_type_id",
			className: "dt-body-left",
			defaultContent: "<div style='color: #808080'>N/A</div>"
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
		},
		{ title:"이슈 우선순위 아이디",
			data: "c_issue_priority_id",
			className: "dt-body-left",
			defaultContent: "<div style='color: #808080'>N/A</div>"
		}
	];

	if(target === "issueType")  {
		columnList = columnList_type;
		targetAjaxUrl = "getJiraIssueType.do?c_id=" + selectServerId;
		targetSelector = "#server_issue_type_table";
	}
	if(target === "issuePriority") {
		columnList = columnList_priority;
		targetAjaxUrl = "getJiraIssuePriority.do?c_id=" + selectServerId;
		targetSelector = "#server_issue_priority_table";
	}

	var rowsGroupList = []; //그룹을 안쓰려면 null 처리
	var columnDefList = [];
	var selectList = {};
	var orderList = [[1, "asc"]];
	var buttonList = [];
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

	$(jquerySelector+' tbody').off('click', 'tr');
}

function fn_urlHandler(data) {
	selectRadioId = data;
}

function default_setting_event() {
	var ajax_url ="";
	var sourceCid = "";
	$("button[name='default_update']").click( function (){
		console.log("[ jiraServer :: default_setting_event ] button[name='default_update'].click :: selectedServerType -> " + selectServerType);

		if( isEmpty(selectRadioId) ){
			jError("설정된 값이 없거나, 변경된 데이터가 없습니다.");
			return;
		}

		if (selectedTab === "issueType" && (selectServerType === "클라우드" || selectServerType === "레드마인_온프레미스")) {
			sourceCid = selectProjectId;
			ajax_url = "jiraProject/"+ selectedTab+"/makeDefault.do";
		}
		else if (selectedTab === "issueStatus" && selectServerType === "클라우드") {
			sourceCid = selectProjectId;
			ajax_url = "jiraProject/"+ selectedTab+"/makeDefault.do";
		} else { // 온프레미스 4가지, 클라우드의 해결책,우선순위
			sourceCid = selectServerId;
			ajax_url = "jiraServer/"+ selectedTab+"/makeDefault.do";
		}

		$.ajax({
			url: "/auth-user/api/arms/" + ajax_url,
			type: "PUT",
			data: { c_id: sourceCid, targetCid: selectRadioId }, // 지라프로젝트 또는 서버의 아이디
			statusCode: {
				200: function (data) {
					console.log(data);
					jSuccess("기본 설정("+selectedTab+")이 변경되었습니다.");
					//데이터 테이블 데이터 재 로드
					display_set_wide_projectTable(); // 다시 wide 설정으로.

					if (selectedTab === "issueType" || selectedTab === "issuePriority") {
						makeJiraServerCardDeck();
					}
				}
			}
		});

	});

}

//지라 프로젝트 - 데이터테이블 프로젝트 명 클릭시, 프로젝트 관련 데이터 가져오는 중 Ajax 오류 픽스(전역 데이터의 undefined)
function click_projectList_table(projectName, selectServerType, project_c_id) {
	selectProjectId = project_c_id;
	console.log("[ jiraServer :: click_projectList_table ] :: projectName => " + projectName);
	$(".grid3rd").html("");
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
	console.log($("#server_info_wrapper")[0].className);
	console.log("[ jiraServer :: click_projectList_table ] :: selectProjectId => " + project_c_id);

	if ($("#server_info_wrapper").hasClass("col-lg-7")) {
		//서버 정보 줄이기
		$("#server_info_wrapper").removeClass("col-lg-7").addClass("col-lg-4");

		$("#server_project_each_config_wrapper").show();

		$("#returnList_Layer").show();

		$("#server_info_wrapper").removeClass("fade-out-box");
		$("#server_info_wrapper").addClass("fade-in-box");

		var box = document.querySelector("#server_info_wrapper");
		box.ontransitionend = () => {
			$("#server_info_wrapper").show();
			$("#jira_project_table").DataTable().columns.adjust().responsive.recalc();
		};
	}

	if(selectServerType === '레드마인_온프레미스'){
		$('a[href="#issue_status"]').hide();
	}
	else {
		$('a[href="#issue_status"]').show();
	}

	let is_issue_status_actvie = $('a[href="#issue_status"]').parent().hasClass('active');

	if (is_issue_status_actvie) {
		selectedTab = "issueStatus";
	}
	else {
		selectedTab = "issueType";
	}

	if(selectedTab === "issueStatus") {
		$("#jira_renew_button_div_3rd_grid").removeClass("hidden");
		$("#default_project_each_update").addClass("hidden");
		set_renew_btn_3rd_grid(selectedTab, selectServerId, project_c_id);
		draw_req_state_mapping_datatable("project_issuestatus", project_c_id);
	}
	else {
		$("#jira_renew_button_div_3rd_grid").removeClass("hidden");
		$("#default_project_each_update").removeClass("hidden");
		set_renew_btn_3rd_grid(selectedTab, selectServerId, project_c_id);

		projectIssueTypeDataTable(project_c_id);
	}
}

//프로젝트 목록 다시 넓게 쓰기
function display_set_wide_projectTable() {
	var box = document.querySelector("#server_info_wrapper");
	box.ontransitionend = () => {
		$("#jira_project_table").DataTable().columns.adjust().responsive.recalc();
	};

	// 테이블 원복
	$("table.dataTable > tbody > tr.child ul.dtr-details").css("display", "inline-block;");
	//$("#jira_project_table").addClass("dtr-inline collapsed");

	// 감추기
	$("#returnList_Layer").hide();
	$("#server_info_wrapper").removeClass("fade-in-box");
	//$("#hostInfo_Wrapper").addClass("fade-out-box");
	$("#server_project_each_config_wrapper").hide();

	//호스트 테이블 늘이기
	$("#server_info_wrapper").removeClass("col-lg-4").addClass("col-lg-7");

}

// 자동 슬라이드
function autoSlide(){
	$('#carousel-example-generic').carousel({
		interval: 5000,
	});
}

function draw_ribbon(alm_server_c_id, alm_server_type) {
	$.ajax({
		url: "/auth-user/api/arms/jiraServerProjectPure/getNode.do?c_id=" + alm_server_c_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				let alm_server = data;

				let ribbonSelector = ".ribbon-" + alm_server_c_id;
				let ribbonHtmlData = ``;

				if (alm_server_type === "온프레미스") {
					if (is_issuetype_ready(alm_server.jiraIssueTypeEntities)) {
						ribbonHtmlData += `<div class="ribbon ribbon-info">Ready</div>`;
					}
				}
				else {
					// 지라 클라우드 or 레드마인 온프레미스일 경우 확인
					let issue_type_by_project = alm_server.jiraProjectIssueTypePureEntities.every(project =>
						is_issuetype_ready(project.jiraIssueTypeEntities)
					);

					if (alm_server_type === "레드마인_온프레미스") {
						const issue_priority = is_issuetype_ready(alm_server.jiraIssuePriorityEntities);

						if (issue_type_by_project && issue_priority) {
							ribbonHtmlData += `<div class="ribbon ribbon-info" >Ready</div>`;
						}
						else if (issue_priority) {
							ribbonHtmlData += create_ribbon_html(`notReadyModalPopup('${alm_server_c_id}', 'issueType', '${alm_server_type}')`, "Help");
						}
						else if (issue_type_by_project) {
							ribbonHtmlData += create_ribbon_html(`notReadyModalPopup('${alm_server_c_id}', 'issuePriority', '${alm_server_type}')`, "Help");
						}
						else {
							ribbonHtmlData += create_ribbon_html(`notReadyModalPopup('${alm_server_c_id}', 'both', '${alm_server_type}')`, "Help");
						}
					}
					else if (alm_server_type === "클라우드") {
						if (issue_type_by_project) {
							ribbonHtmlData += `<div class="ribbon ribbon-info" >Ready</div>`;
						}
						else {
							ribbonHtmlData += create_ribbon_html(`notReadyModalPopup('${alm_server_c_id}', 'issueType', '${alm_server_type}')`, "Help");
						}
					}
				}

				$(ribbonSelector).append(ribbonHtmlData);
			}
		},
		error: function (e) {
			if(alm_server_c_id === undefined || alm_server_c_id === "") {
				jError("지라 서버 조회 중 에러가 발생했습니다. (지라(서버) 아이디 없음)");
			}
			else {
				jError("지라 서버 조회 중 에러가 발생했습니다. 지라 서버 아이디 :: " + alm_server_c_id);
			}
		}
	});
}

function is_issuetype_ready(entities) {
	return entities && find_checked_true_entity(entities);
}

// 기본설정 확인
function find_checked_true_entity(entities) {
	return entities && entities.length > 0 ? entities.find(entity => entity.c_check === "true") : null;
}

function create_ribbon_html(on_click_event, button_text) {
	return `<div class="ribbon ribbon-info" style="background: #DB2A34; cursor: pointer;"
				 onclick="event.stopPropagation(); ${on_click_event}">
				<button style="background: #DB2A34; border:none; font-weight: bold;">
					${button_text}<i class="fa fa-exclamation ml-1" style="font-size: 13px;" />
				</button>
			</div>`;
}

function notReadyButtons(buttons) {
	$("#not-ready-buttons").empty();

	buttons.forEach(button => {
		console.log("button: " + button);
		const btn = `<div class="btn btn-warning btn-sm btn-disabled" style="border: none; border-radius: 5px; margin-right: 5px;">
                        <i class="fa fa-times-circle"></i> ${button}
                    </div>`;
		$("#not-ready-buttons").append(btn);
	});
}

function notReadyMessages(messages) {
	$("#not-ready-messages").empty();

	messages.forEach(message => {
		console.log("message: " + message);
		const msg = `${message}<br>`;
		$("#not-ready-messages").append(msg);
	});
}

function not_ready_modal_popup(jiraServerId, type, alm_server_type) {
	$("#select_server_name").text(serverDataList[jiraServerId].c_title);
	$("#not_ready_modal").modal("show");

	if (type === "issueType") {
		notReadyButtons(["이슈 유형"]);
		notReadyMessages(["이슈 유형이 지정되지 않은 프로젝트는 이슈를 생성할 수 없습니다."]);
	} else if (type === "both") {
		notReadyButtons(["이슈 유형", "이슈 우선순위"]);
		notReadyMessages(["이슈 유형이 지정되지 않은 프로젝트는 이슈를 생성할 수 없습니다.", "이슈 우선순위가 지정되지 않으면 이슈를 생성할 수 없습니다."]);
	}

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
		{
			title:"선택된 이슈유형",
			data: "jiraIssueTypeEntities",
			className: "dt-body-left",
			defaultContent: "<div style='color: #808080'>N/A</div>"
		},
		{ name: "c_id", title: "c_id", data: "c_id", visible: false },
	];
	var columnDefList =[];
	var columnDefList_issuetype = [
		{
			targets: 3,
			searchable: true,
			orderable: true,
			render: function (data, type, row, meta) {
				let isCheck = null;

				for (const rowInfo of data) {
					if (rowInfo.c_check === "true") {
						isCheck = rowInfo.c_issue_type_name+"["+rowInfo.c_issue_type_id+"]";
						break;
					}
				}

				if(isEmpty(isCheck)) {
					return "<div style='color: #808080'>N/A</div>";
				}
				else {
					return `<div class="project-issueStatus-data${meta.row}">
                        ${isCheck}
                     </div>`;
				}
				return data;
			}
		}
	];
	columnDefList = columnDefList_issuetype;
	var rowsGroupList = null; //그룹을 안쓰려면 null 처리
	var jquerySelector = "#modal_project_table"; // 장소
	var ajaxUrl = "/auth-user/api/arms/jiraServer/getJiraProject.do?c_id=" + jiraServerId;
	var jsonRoot = "response";

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

	$('#modal_project_table tbody').off('click', 'tr');

}

function splitAndColor(text) {
	// &nbsp;-&nbsp;을 기준으로 문자열을 분할
	const list = text.split('&nbsp;-&nbsp;');
	let htmlContent = '';

	// 분할된 리스트를 순회하면서 처리
	list.forEach((item, index) => {
		if (index === list.length - 1) {
			// 마지막 요소는 하얀색으로 처리
			htmlContent += `<span style="color: white;">${item}</span>`;
		} else {
			// 나머지는 노란색으로 처리
			htmlContent += `<span style="color: #808080;">${item}</span>`;
			// 요소 사이에 원래의 구분자 추가
			if (index < list.length - 1) {
				htmlContent += `<span style="color: #808080;">&nbsp;-&nbsp;</span>` ;
			}
		}
	});

	// 결과를 HTML 요소에 할당
	return htmlContent;
}

// 이슈 상태 매핑 데이터테이블
function draw_req_state_mapping_datatable(target, project_c_id) {
	console.log("[ jiraServer :: draw_req_state_mapping_datatable] target = " +target);

	var targetAjaxUrl ="";
	var targetSelector ="";

	if (target === "issueStatus") {
		targetAjaxUrl = "/auth-user/api/arms/jiraServer/getJiraIssueStatus.do?c_id=" + selectServerId;
		targetSelector = "#server_issue_status_table";
	}
	else if (target === "project_issuestatus") {
		targetAjaxUrl = "/auth-user/api/arms/jiraProject/getProjectIssueStatus.do?c_id=" + project_c_id;
		targetSelector = "#issue_status_table";
	}

	var columnList= [
		{
			title:"ALM 이슈 상태",
			data: "c_issue_status_name",
			render: function (data, type, row, meta) {
				let issue_status = row.c_issue_status_name + "[" + row.c_issue_status_id + "]";
				if (type === "display") {
					if (isEmpty(data)) {
						return "<div style='color: #808080'>N/A</div>";
					} else {
						return '<div style="white-space: nowrap;">' + issue_status + "</div>";
					}
				}
				return data;
			},
			className: "dt-body-left",
			visible: true,
		},
		{
			title:"ARMS 요구사항 상태 매핑",
			data: "c_id",
			className: "dt-body-center",
			render: function (data, type, row, meta) {
				console.log(row);

				let issue_status = row.c_issue_status_name + "[" + row.c_issue_status_id + "]";

				// select 박스의 초기 옵션 설정

				if (type === "display") {
					if(isEmpty(data)) {
						return `<div class="no-issueStatus-data${meta.row}" style="white-space: nowrap; text-align: center">
									<input type="radio" name="c_id" value="' + ${data} + '">
								</div>`;
					}
					else {
						let option_html = `<option data-id="${data}" data-title="${issue_status}" value=""></option>`;

						Object.keys(req_state_data).forEach(key => {
							let select_html = "";
							let value = key;
							let text = req_state_data[key];
							if (Number(value) === row.c_req_state_mapping_link) {
								select_html = "selected";
							}

							option_html += `<option data-id="${data}" data-title="${issue_status}" value="${value}" ${select_html}>${text}</option>`;
						});

						return 	`<select
									class="select_status_mapping select-block-level chzn-select darkBack"
									tabIndex="-1">
									${option_html}
								</select>`;
					}
				}
				return data;
			},
		},
	];

	var rowsGroupList = null; //그룹을 안쓰려면 null 처리
	var columnDefList = [];
	var selectList = {};
	var orderList = [[1, "asc"]];
	var buttonList = [];
	var jquerySelector = targetSelector; //
	var jsonRoot = "response";
	var isServerSide = false;

	dataTableRef = dataTable_build(
		jquerySelector,
		targetAjaxUrl,
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

	$(jquerySelector+' tbody').off('click', 'tr');
}

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
/* function dataTableClick(tempDataTable, selectedData) {
	// => 카드 목록 클릭시 해당 카드의 c_id를 활용해서 가져오도록 만들어야 함
	console.log("[ jiraServer :: dataTableClick] :: selectedData =>  ");
	console.log(selectedData);
	selectId = selectedData.c_id;
	// c_id로 getNode 실행

	//jiraServerCardClick(selectId);
	if(selectedData.c_jira_name !== undefined) {
		selectProjectId = selectedData.c_id;
		console.log("[ jiraServer :: dataTableClick ] :: selectProjectId => " + selectProjectId);
	}
}*/