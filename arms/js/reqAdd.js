////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////

var selectedJsTreeId; // 요구사항 아이디
var selectedJsTreeName; // 요구사항 이름
var tempDataTable;
var isChecked = []; // 지라 프로젝트 연결 목록 체크
var jiraCheckId = []; // 여러 개의 c_id를 저장할 배열

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
			"../reference/light-blue/lib/jquery.fileupload-ui.js"
		],

		[
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"
		],

		[
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
		],

		[
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js",
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
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"
		],
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
		["js/reqAddTable.js", "js/reqAddPivot.js", "css/jiraServerCustom.css"]
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {

			console.log("모든 플러그인 로드 완료");

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

			//위젯 헤더 처리 및 사이드 메뉴 처리
			$(".widget").widgster();
			setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_regist");

			//신규 요구사항 등록 버튼 숨김
			$(".newReqDiv").hide();

			//Select2
			var waitSelect2 = setInterval(function () {
				try {
					if ($(".ms-select-all") !== 3) {
						//제품(서비스) 셀렉트 박스 이니시에이터
						makePdServiceSelectBox();
						//버전 멀티 셀렉트 박스 이니시에이터
						makeVersionMultiSelectBox();

						clearInterval(waitSelect2);
					}
				} catch (err) {
					console.log("서비스 데이터 테이블 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);

			// --- 에디터 설정 --- //
			var waitCKEDITOR = setInterval(function () {
				try {
					if (window.CKEDITOR) {
						if (window.CKEDITOR.status == "loaded") {
							CKEDITOR.replace("modal_editor", { skin: "office2013" });
							CKEDITOR.replace("edit_tabmodal_editor", { skin: "office2013" });
							CKEDITOR.replace("detailview_req_contents", { skin: "office2013" });
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);

			makeDatePicker($("#btn_start_calendar_popup"));
			makeDatePicker($("#btn_end_calendar_popup"));

			autoCompleteForUser();

			selected_after_action_for_select2();
			click_btn_for_new_req();
			switch_action_for_mode();

			click_btn_for_req_update();
			click_btn_for_search_history();
			change_tab_action();
			click_btn_for_connect_req_jira();

			save_req();

			// 스크립트 실행 로직을 이곳에 추가합니다.
			//save_req
			var 라따적용_클래스이름_배열 = ['.ladda_save_req'];
			laddaBtnSetting(라따적용_클래스이름_배열);
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

////////////////////////////////////////////////////////////////////////////////////////
//제품 서비스 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
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
				for (var k in data.response) {
					var obj = data.response[k];
					$("#reqAddTableSelect").append(tableSelectOption(obj));

					var newOption = new Option(obj.c_title, obj.c_id, false, false);
					$("#selected_pdService").append(newOption).trigger("change");
				}
				//////////////////////////////////////////////////////////
				jSuccess("제품(서비스) 조회가 완료 되었습니다.");
			}
		},
		beforeSend: function () {
			//$("#regist_pdservice").hide(); 버튼 감추기
		},
		complete: function () {
			//$("#regist_pdservice").show(); 버튼 보이기
		},
		error: function (e) {
			jError("제품(서비스) 조회 중 에러가 발생했습니다.");
		}
	});

	$("#selected_pdService").on("select2:open", function () {
		makeSlimScroll(".select2-results__options");
	});

	// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
	$("#selected_pdService").on("select2:select", function (e) {
		// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
		// 디폴트는 base version 을 선택하게 하고 ( select all )

		// 선택된 제품(서비스) 데이터 바인딩
		var selectedService = $("#selected_pdService").select2("data")[0].text;

		$("#select_PdService").text(selectedService);

		var selectedHtml =
			`<div class="chat-message">
				<div class="chat-message-body" style="margin-left: 0px !important;">
					<span class="arrow" style="top: 35% !important;"></span>
					<span class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 선택된 서버 :  </span>
					<span class="text" style="color: #a4c6ff;">
					` +
					selectedService +
					`
					</span>
				</div>
			</div>
			`;
		$("#reqSender").html(selectedHtml); // 선택된 제품(서비스)

		//~> 이벤트 연계 함수 :: 요구사항 표시 jsTree 빌드
		//서비스(어플리케이션) 트리 로드
		build_ReqData_By_PdService();

		//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
		bind_VersionData_By_PdService();
	});
} // end makePdServiceSelectBox()

////////////////////////////////////////////////////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makeVersionMultiSelectBox() {
	//버전 선택 셀렉트 박스 이니시에이터
	$(".multiple-select").multipleSelect();
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
				for (var k in data.response) {
					var obj = data.response[k];
					var $opt = $("<option />", {
						value: obj.c_id,
						text: obj.c_title
					});
					$(".multiple-select").append($opt);
				}

				if (data.length > 0) {
					console.log("[ reqAdd :: bind_VersionData_By_PdService ] :: result = display 재설정.");
				}
				$(".multiple-select").multipleSelect("refresh");
				//////////////////////////////////////////////////////////
				jSuccess("버전 조회가 완료 되었습니다.");
			}
		},
		error: function (e) {
			jError("버전 조회 중 에러가 발생했습니다.");
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//제품(서비스) 선택 후, 버전을 선택하면 동작하는 함수
////////////////////////////////////////////////////////////////////////////////////////
function changeMultipleSelected() {
	//초기화
	$("#req_tree #node_2 ul li").each(function (a, item) {
		$(this)
			.find("a i")
			.each(function () {
				$(this).replaceWith("<ins class='jstree-icon' style='color: rgb(164, 198, 255)'>&nbsp;</ins>");
			});
	});

	var result = [];
	var result_cids = [];
	$("#multiversion option:selected").map(function (a, item) {
		result.push(item.innerText);
		result_cids.push(item.value);
	});
	$("#select_Version").text(isEmpty(result) ? "선택되지 않음" : result);

	console.log("[ reqAdd :: changeMultipleSelected ] :: version result = " + result_cids);

	// 필터할 대상을 아이디로 잡아서 처리해야 하는데,
	// $("#selected_pdService").val() 로 선택한 제품(서비스)를 구분하고
	// version 정보를 매치 해서 대상 요구사항 이슈 c_id 를 받아오는 로직이 필요.
	console.log("select pdservice:: " + $("#selected_pdService").val());

	$.ajax({
		url: "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" +
			 $("#selected_pdService").val() +
			 "/getReqAddListByFilter.do?c_req_pdservice_versionset_link=" +
			 result_cids,
		type: "GET",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				var appIds = [];
				var loopCount = data.length;
				for (var i = 0; i < loopCount; i++) {
					appIds.push(data[i].c_id);
				}
				console.log(appIds);
				var mappedApps = [];
				for (var appId of appIds) {
					$("#req_tree #node_2 ul li").each(function (a, item) {
						$(this)
							.find("a i")
							.each(function () {
								$(this).replaceWith("<ins class='jstree-icon' style='color: rgb(164, 198, 255)'>&nbsp;</ins>");
							});
						console.log(
							"[ reqAdd :: changeMultipleSelected ] :: version node value = " +
								item.id.substring(item.id.indexOf("_") + 1)
						);
						console.log("[ reqAdd :: changeMultipleSelected ] :: version filterNode value = " + appId);
						if (item.id.substring(item.id.indexOf("_") + 1) == appId) {
							mappedApps.push($(this));
							return false;
						}
					});
				}

				console.log(" mappedApps::: " + mappedApps);
				for (var mappedApp of mappedApps) {
					mappedApp.find("a ins").each(function () {
						$(this).replaceWith("<i class='fa fa-check' style='color: #1ea726'>&nbsp;&nbsp;</i>");
					});
				}
			}
		},
		error: function (e) {
			jError("버전 조회 중 에러가 발생했습니다.");
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//요구사항 :: jsTree
////////////////////////////////////////////////////////////////////////////////////////
function build_ReqData_By_PdService() {
	var jQueryElementID = "#req_tree";
	var serviceNameForURL = "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" + $("#selected_pdService").val();

	jsTreeBuild(jQueryElementID, serviceNameForURL);
}

////////////////////////////////////////
// --- 요구사항 (jstree) 선택 이벤트 --- //
////////////////////////////////////////
function jsTreeClick(selectedNode) {
	console.log("[ reqAdd :: jsTreeClick ] :: selectedNode ");
	console.log(selectedNode);

	selectedJsTreeId = selectedNode.attr("id").replace("node_", "").replace("copy_", "");
	selectedJsTreeName = $("#req_tree").jstree("get_selected").text();

	var selectRel = selectedNode.attr("rel");

	if (selectedJsTreeId == 2) {
		$("#select_Req").text("루트 요구사항이 선택되었습니다.");
	} else if (selectRel == "folder") {
		$("#select_Req").text("(folder)" + $(".jstree-clicked").text());
	} else {
		$("#select_Req").text($("#req_tree").jstree("get_selected").text());
	}

	//요구사항 타입에 따라서 탭의 설정을 변경
	if (selectRel == "drive") {
		$("#folder_tab").get(0).click();
		$(".newReqDiv").show();
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").hide(); //상세보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").hide(); //편집하기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //리스트보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").show(); //문서로보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(5)").hide(); //JIRA연결설정

		// 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
		// 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
		dataTableLoad(selectedJsTreeId, selectRel);
	} else if (selectRel == "folder") {

		$("#folder_tab").get(0).click();
		$(".newReqDiv").show();
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").hide(); //상세보기

		$("#req_edit_layer_id").hide();
		$("#req_edit_layer_priority").hide();
		$("#req_edit_layer_difficulty").hide();
		$("#req_edit_layer_state").hide();
		$("#req_edit_layer_writer").hide();
		$("#req_edit_layer_write_date").hide();
		$("#req_edit_layer_reviewers").hide();
		$("#req_edit_layer_req_contents").show();
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").show(); //편집하기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //리스트보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").show(); //문서로보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(5)").hide(); //JIRA연결설정

		//상세보기 탭 셋팅
		setDetailAndEditViewTab();

		// 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
		// 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
		dataTableLoad(selectedJsTreeId, selectRel);

	} else {
		$("#default_tab").get(0).click();
		$(".newReqDiv").hide();
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").show(); //상세보기

		$("#req_edit_layer_version").show();
		$("#req_edit_layer_id").show();
		$("#req_edit_layer_priority").show();
		$("#req_edit_layer_difficulty").show();
		$("#req_edit_layer_state").show();
		$("#req_edit_layer_start_date").show();
		$("#req_edit_layer_end_date").show();
		$("#req_edit_layer_plantime").show();
		$("#req_edit_layer_writer").show();
		$("#req_edit_layer_write_date").show();
		$("#req_edit_layer_reviewers").show();
		$("#req_edit_layer_req_contents").show();
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").show(); //편집하기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").hide(); //리스트보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(4)").hide(); //문서로보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(5)").show(); //JIRA연결설정

		//이전에 화면에 렌더링된 데이터 초기화
		//상세보기 탭 셋팅
		setDetailAndEditViewTab();
	}
}

////////////////////////////////////////////////////////////////////////////////////////
//리스트 :: DataTable
////////////////////////////////////////////////////////////////////////////////////////
// --- Root, Drive, Folder 데이터 테이블 설정 --- //
function dataTableLoad(selectId, selectRel) {
	console.log("dataTableLoad - selectRel:::" + selectRel);
	console.log("dataTableLoad - selectId:::" + selectId);
	// 데이터 테이블 컬럼 및 열그룹 구성
	var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();

	var c_type = $("#req_tree").jstree("get_selected").attr("rel");
	console.log("dataTableLoad - c_type:::" + c_type);

	var dataTableRef;
	if (selectId == 2) {
		// 데이터 테이블 컬럼 및 열그룹 구성
		var columnList = [
			{ data: "c_id", defaultContent: "-" },
			{ data: "c_left", defaultContent: "-" },
			{ data: "c_title", defaultContent: "-" }
		];
		var rowsGroupList = [];
		var columnDefList = [];
		var selectList = {};
		var orderList = [[1, "asc"]];
		var buttonList = [];

		var jquerySelector = "#req_table";
		var ajaxUrl = "/auth-user/api/arms/reqAdd/" + tableName + "/getMonitor.do";
		var jsonRoot = "";
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
	} else if (selectRel !== "folder") {
		//select node 정보를 가져온다.
		console.log("tableName:: " + tableName);
		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectId,
			type: "GET",
			contentType: "application/json;charset=UTF-8",
			dataType: "json",
			progress: true,
			success: function (data) {
				// 데이터 테이블 컬럼 및 열그룹 구성
				var columnList = [
					{ data: "c_id", defaultContent: "-" },
					{ data: "c_left", defaultContent: "-" },
					{ data: "c_title", defaultContent: "-" }
				];
				var rowsGroupList = [];
				var columnDefList = [];
				var selectList = {};
				var orderList = [[1, "asc"]];
				var buttonList = [];

				var jquerySelector = "#req_table";
				var ajaxUrl = "/auth-user/api/arms/reqAdd/" + tableName + "/getChildNodeWithParent.do";
				var jsonRoot = "";
				var paramUrl = "?c_id=313&c_left=" + data.c_left + "&c_right=" + data.c_right;
				ajaxUrl = ajaxUrl + paramUrl;
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
		})
			.done(function (data) {})
			.fail(function (e) {})
			.always(function () {});
	} else {
		console.log("folder clicked");
		var columnList = [
			{ data: "c_id", defaultContent: "-" },
			{ data: "c_left", defaultContent: "-" },
			{ data: "c_title", defaultContent: "-" }
		];
		var rowsGroupList = [];
		var columnDefList = [];
		var selectList = {};
		var orderList = [];
		var buttonList = [];

		var jquerySelector = "#req_table";
		var ajaxUrl = "/auth-user/api/arms/reqAdd/" + tableName + "/getChildNodeWithParent.do?c_id=" + selectId;
		var jsonRoot = "";
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
}


// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
	console.log("dataTableClick");
}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(settings, json) {
	setDocViewTab();
}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();
}

////////////////////////////////////////////////////////////////////////////////////////
//상세 보기 탭 & 편집 탭
////////////////////////////////////////////////////////////////////////////////////////
function setDetailAndEditViewTab() {
	console.log("Detail Tab ::::");
	var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();
	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedJsTreeId,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true
	})
		.done(function (data) {
			// ------------------ 편집하기 ------------------ //
			bindDataEditTab(data);
			// ------------------ 상세보기 ------------------ //
			bindDataDetailTab(data);
		})
		.fail(function (e) {})
		.always(function () {});
}

// ------------------ 편집하기 ------------------ //
function bindDataEditTab(ajaxData) {
	console.table(ajaxData);

	//제품(서비스) 데이터 바인딩
	var selectedPdServiceText = $("#selected_pdService").select2("data")[0].text;
	if (isEmpty(selectedPdServiceText)) {
		$("#editview_req_pdservice_name").val("");
	} else {
		$("#editview_req_pdservice_name").val(selectedPdServiceText);
	}

	$("#editview_req_type").val(ajaxData.c_type);

	// 버전 데이터 바인딩
	if (!isEmpty(ajaxData.c_req_pdservice_versionset_link)) {
		$("#edit_multi_version").multipleSelect("setSelects", JSON.parse(ajaxData.c_req_pdservice_versionset_link));
	} else {
		$("#edit_multi_version").multipleSelect("uncheckAll");
	}

	$("#editview_req_id").val(ajaxData.c_id);
	$("#editview_req_title").val(ajaxData.c_title);

	//radio 버튼 - 선택 초기화
	$("#editview_req_priority label").removeClass("active");
	$("#editview_req_difficulty label").removeClass("active");
	$("#editview_req_state label").removeClass("active");
	//radio 버튼 - 상태 초기화
	$("input[name='editview_req_priority_options']:checked").prop("checked", false);
	$("input[name='editview_req_difficulty_options']:checked").prop("checked", false);
	$("input[name='editview_req_state_options']:checked").prop("checked", false);

	//편집하기 - 우선순위 버튼
	let priorityRadioButtons = $("#editview_req_priority input[type='radio']");
	priorityRadioButtons.each(function () {
		if (ajaxData.reqPriorityEntity && $(this).val() == ajaxData.reqPriorityEntity["c_id"]) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});
	//편집하기 - 난이도 버튼
	let difficultRadioButtons = $("#editview_req_difficulty input[type='radio']");
	difficultRadioButtons.each(function () {
		if (ajaxData.reqDifficultyEntity && $(this).val() == ajaxData.reqDifficultyEntity["c_id"]) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});
	//편집하기 - 상태 버튼
	let stateRadioButtons = $("#editview_req_state input[type='radio']");
	stateRadioButtons.each(function () {
		if (ajaxData.reqStateEntity && $(this).val() == ajaxData.reqStateEntity["c_id"]) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});

	var datepickerOption = {
		timepicker: false,
		format: "Y/m/d",
		formatDate: "Y/m/d",
		scrollInput: false,
		value: null
	};

	if (ajaxData.c_req_start_date) {
		$("#editview_req_start_date").datetimepicker(
			$.extend({}, datepickerOption, { value: new Date(ajaxData.c_req_start_date) })
		);
	}
	else {
		$("#editview_req_start_date").val(null);
		$("#editview_req_start_date").datetimepicker(datepickerOption);
	}
	if (ajaxData.c_req_end_date) {
		$("#editview_req_end_date").datetimepicker(
			$.extend({}, datepickerOption, { value: new Date(ajaxData.c_req_end_date) })
		);
	}
	else {
		$("#editview_req_end_date").val(null);
		$("#editview_req_end_date").datetimepicker(datepickerOption);
	}

	// -------------------- reviewer setting -------------------- //
	//reviewer clear
	$("#editview_req_reviewers").val(null).trigger("change");

	var selectedReviewerArr = [];
	if (ajaxData.c_req_reviewer01 == null || ajaxData.c_req_reviewer01 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer01 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer01);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer01 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer01 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption01 = new Option(ajaxData.c_req_reviewer01, ajaxData.c_req_reviewer01, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption01).trigger("change");
		}
	}
	if (ajaxData.c_req_reviewer02 == null || ajaxData.c_req_reviewer02 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer02 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer02);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer02 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer02 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption02 = new Option(ajaxData.c_req_reviewer02, ajaxData.c_req_reviewer02, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption02).trigger("change");
		}
	}
	if (ajaxData.c_req_reviewer03 == null || ajaxData.c_req_reviewer03 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer03 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer03);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer03 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer03 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption03 = new Option(ajaxData.c_req_reviewer03, ajaxData.c_req_reviewer03, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption03).trigger("change");
		}
	}
	if (ajaxData.c_req_reviewer04 == null || ajaxData.c_req_reviewer04 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer04 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer04);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer04 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer04 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption04 = new Option(ajaxData.c_req_reviewer04, ajaxData.c_req_reviewer04, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption04).trigger("change");
		}
	}
	if (ajaxData.c_req_reviewer05 == null || ajaxData.c_req_reviewer05 == "none") {
		console.log("bindDataEditTab :: ajaxData.c_req_reviewer05 empty");
	} else {
		selectedReviewerArr.push(ajaxData.c_req_reviewer05);
		// Set the value, creating a new option if necessary
		if ($("#editview_req_reviewers").find("option[value='" + ajaxData.c_req_reviewer05 + "']").length) {
			console.log('option[value=\'" + ajaxData.c_req_reviewer05 + "\']"' + "already exist");
		} else {
			// Create a DOM Option and pre-select by default
			var newOption05 = new Option(ajaxData.c_req_reviewer05, ajaxData.c_req_reviewer05, true, true);
			// Append it to the select
			$("#editview_req_reviewers").append(newOption05).trigger("change");
		}
	}
	$("#editview_req_reviewers").val(selectedReviewerArr).trigger("change");

	// ------------------------- reviewer end --------------------------------//
	$("#editview_req_status").val(ajaxData.c_req_status);
	$("#editview_req_writer").val(ajaxData.c_req_writer); //ajaxData.c_req_reviewer01
	$("#editview_req_write_date").val(new Date(ajaxData.c_req_create_date).toLocaleString());
	CKEDITOR.instances.edit_tabmodal_editor.setData(ajaxData.c_req_contents);
	CKEDITOR.instances.edit_tabmodal_editor.setReadOnly(false);
}

// ------------------ 상세보기 ------------------ //
function bindDataDetailTab(ajaxData) {
	console.log(ajaxData);

	//제품(서비스) 데이터 바인딩
	var selectedPdServiceText = $("#selected_pdService").select2("data")[0].text;
	if (isEmpty(selectedPdServiceText)) {
		$("#detailview_req_pdservice_name").val("");
	} else {
		$("#detailview_req_pdservice_name").val(selectedPdServiceText);
	}

	//Version 데이터 바인딩
	var selectedVersionText = $("#edit_multi_version").multipleSelect("getSelects", "text");
	if (isEmpty(selectedVersionText)) {
		$("#detailview_req_pdservice_version").val("요구사항에 등록된 버전이 없습니다.");
	} else {
		$("#detailview_req_pdservice_version").val(selectedVersionText);
	}
	$("#detailview_req_id").val(ajaxData.c_id);
	$("#detailview_req_name").val(ajaxData.c_title);

	//radio 버튼 - 선택 초기화
	$("#detailview_req_priority label").removeClass("active");
	$("#detailview_req_difficulty label").removeClass("active");
	$("#detailview_req_state label").removeClass("active");
	//radio 버튼 - 상태 초기화
	$("input[name='detailview_req_priority_options']:checked").prop("checked", false);
	$("input[name='detailview_req_difficulty_options']:checked").prop("checked", false);
	$("input[name='detailview_req_state_options']:checked").prop("checked", false);

	//상세보기 - 우선순위 버튼
	let priorityRadioButtons = $("#detailview_req_priority input[type='radio']");
	priorityRadioButtons.each(function () {
		if (ajaxData.reqPriorityEntity && $(this).val() == ajaxData.reqPriorityEntity["c_id"]) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});
	//상세보기 - 난이도 버튼
	let difficultRadioButtons = $("#detailview_req_difficulty input[type='radio']");
	difficultRadioButtons.each(function () {
		if (ajaxData.reqDifficultyEntity && $(this).val() == ajaxData.reqDifficultyEntity["c_id"]) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});
	//상세보기 - 상태 버튼
	let stateRadioButtons = $("#detailview_req_state input[type='radio']");
	stateRadioButtons.each(function () {
		if (ajaxData.reqStateEntity && $(this).val() == ajaxData.reqStateEntity["c_id"]) {
			$(this).parent().addClass("active");
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
	});

	if (ajaxData.c_req_start_date) {
		$("#detailview_req_start_date").val(formatDate(new Date(ajaxData.c_req_start_date)));
	}
	if (ajaxData.c_req_end_date) {
		$("#detailview_req_end_date").val(formatDate(new Date(ajaxData.c_req_end_date)));
	}

	$("#detailview_req_writer").val(ajaxData.c_req_writer);
	$("#detailview_req_write_date").val(new Date(ajaxData.c_req_create_date).toLocaleString());

	if (ajaxData.c_req_reviewer01 == null || ajaxData.c_req_reviewer01 == "none") {
		$("#detailview_req_reviewer01").val("리뷰어(연대책임자)가 존재하지 않습니다.");
	} else {
		$("#detailview_req_reviewer01").val(ajaxData.c_req_reviewer01);
	}
	if (ajaxData.c_req_reviewer02 == null || ajaxData.c_req_reviewer02 == "none") {
		$("#detailview_req_reviewer02").val("2번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer02").val(ajaxData.c_req_reviewer02);
	}
	if (ajaxData.c_req_reviewer03 == null || ajaxData.c_req_reviewer03 == "none") {
		$("#detailview_req_reviewer03").val("3번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer03").val(ajaxData.c_req_reviewer03);
	}
	if (ajaxData.c_req_reviewer04 == null || ajaxData.c_req_reviewer04 == "none") {
		$("#detailview_req_reviewer04").val("4번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer04").val(ajaxData.c_req_reviewer04);
	}
	if (ajaxData.c_req_reviewer05 == null || ajaxData.c_req_reviewer05 == "none") {
		$("#detailview_req_reviewer05").val("5번째 리뷰어(연대책임자) 없음");
	} else {
		$("#detailview_req_reviewer05").val(ajaxData.c_req_reviewer05);
	}

	CKEDITOR.instances.detailview_req_contents.setData(ajaxData.c_req_contents);
	CKEDITOR.instances.detailview_req_contents.setReadOnly(true);
}

///////////////////////////////////////////////////////////////////////////////
//문서로 보기 탭
///////////////////////////////////////////////////////////////////////////////
function setDocViewTab() {
	$(".dd-list").empty();
	var data = $("#req_table").DataTable().rows().data().toArray();

	let treeData = buildDocTreeData(data); // 데이터를 계층적 구조로 변환
	console.log("setDocViewTab :: doc data -> ");
	console.log(treeData);
	treeData.forEach(rootNode => {
		$(".dd-list").append(generateDocHTML(rootNode)); // HTML 생성 및 추가
	});
}

function buildDocTreeData(data) {
	let tree = {};
	let roots = [];

	// 먼저 모든 노드를 id를 키로 하는 객체로 변환
	data.forEach(item => {
		tree[item.c_id] = {...item, children: []};
	});

	// 각 노드의 자식 노드들을 찾아서 추가
	Object.keys(tree).forEach(id => {
		let item = tree[id];
		if (item.c_parentid && tree[item.c_parentid]) {
			tree[item.c_parentid].children.push(item);
		} else {
			roots.push(item);
		}
	});

	return roots; // 최상위 노드 반환
}

function generateDocHTML(node) {

	let iconHtml = getDocIcon(node.c_type);

	let html = "<li class='dd-item' id='T_ARMS_REQ_" + node.c_id + "' data-id='" + node.c_id + "'>" +
		"<div class='dd-handle'>" + iconHtml + " " + node.c_title +
		"<p>" + (node.c_contents || "") + "</p></div>";

	if (node.children.length > 0) {
		html += "<ol class='dd-list'>";
		node.children.forEach(child => {
			html += generateDocHTML(child);
		});
		html += "</ol>";
	}

	html += "</li>";
	return html;
}

function getDocIcon(type) {
	switch (type) {
		case "root":
		case "drive":
			return "<i class='fa fa-clipboard'></i>";
		case "folder":
			return "<i class='fa fa-folder'></i>";
		default:
			return "<i class='fa fa-file-text-o'></i>";
	}
}

///////////////////////////////////////////////////////////////////////////////
// --- select2 (사용자 자동완성 검색 ) 설정 --- //
///////////////////////////////////////////////////////////////////////////////
function autoCompleteForUser() {
	$(".js-data-example-ajax").select2({
		maximumSelectionLength: 5,
		width: "resolve",
		ajax: {
			url: function (params) {
				return "/auth-user/search-user/" + params.term;
			},
			dataType: "json",
			delay: 250,
			processResults: function (data, params) {
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
		placeholder: "리뷰어 설정을 위한 계정명을 입력해 주세요",
		minimumInputLength: 1,
		templateResult: formatUser,
		templateSelection: formatUserSelection
	});
}

// --- select2 (사용자 자동완성 검색 ) templateResult 설정 --- //
function formatUser(jsonData) {
	var $container = $(
		"<div class='select2-result-jsonData clearfix'>" +
			"<div class='select2-result-jsonData__meta'>" +
			"<div class='select2-result-jsonData__username'><i class='fa fa-flash'></i></div>" +
			"<div class='select2-result-jsonData__id'><i class='fa fa-star'></i></div>" +
			"</div>" +
			"</div>"
	);

	$container.find(".select2-result-jsonData__username").text(jsonData.username);
	$container.find(".select2-result-jsonData__id").text(jsonData.id);

	return $container;
}

// --- select2 (사용자 자동완성 검색 ) templateSelection 설정 --- //
function formatUserSelection(jsonData) {
	if (jsonData.id == "") {
		jsonData.text = "placeholder";
	} else {
		if (jsonData.username == undefined) {
			jsonData.text = jsonData.id;
		} else {
			jsonData.text = "[" + jsonData.username + "] - " + jsonData.id;
		}
	}
	return jsonData.text;
}

///////////////////////////////////////////////////////////////////////////////
// --- select2 (사용자 자동완성 검색 ) 선택하고 나면 선택된 데이터 공간을 벌리기위한 설정 --- //
///////////////////////////////////////////////////////////////////////////////
function selected_after_action_for_select2() {
	$("#editview_req_reviewers").on("select2:select", function (e) {
		console.log("[ reqAdd :: selected_after_action_for_select2 ]");
	});
}

///////////////////////////////////////////////////////////////////////////////
// 신규 요구사항 팝업 데이터 셋팅
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_new_req() {
	$("#new_reqregist01").click(function () {
		registNewPopup();
	});
	$("#new_req_regist02").click(function () {
		registNewPopup();
	});
	$("#new_req_regist03").click(function () {
		registNewPopup();
	});
}

function registNewPopup() {
	var height = $(document).height() - 700;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");

	//요구사항 이름 초기화
	$("#my_modal1 #req_title").val(null);
	//에디터 내용 초기화
	CKEDITOR.instances["modal_editor"].setData("요구사항 내용을 기록합니다.");

	//제품(서비스) 셋팅
	var selectPdService = $("#selected_pdService").select2("data")[0].text;
	$("#disabled_input_pdservice").val(selectPdService);

	//version 셋팅
	var selectedVersion = $("#multiversion").val();
	$("#popup_version").multipleSelect("setSelects", selectedVersion);

	//radio 버튼 - 선택 초기화
	$("#popup_req_priority label").removeClass("active");
	$("#popup_req_difficulty label").removeClass("active");
	$("#popup_req_state label").removeClass("active");
	//radio 버튼 - 상태 초기화
	$("input[name='popup_req_priority_options']:checked").prop("checked", false);
	$("input[name='popup_req_difficulty_options']:checked").prop("checked", false);
	$("input[name='popup_req_state_options']:checked").prop("checked", false);

	var datepickerOption = {
		timepicker: false,
		format: "Y/m/d",
		formatDate: "Y/m/d",
		value: null,
		scrollInput: false
	};

	$("#popup_req_start_date").val(null);
	$("#popup_req_end_date").val(null);
	$("#popup_req_start_date").datetimepicker(datepickerOption);
	$("#popup_req_end_date").datetimepicker(datepickerOption);

	//리뷰어 셋팅
	$.ajax({
		url: "/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + $("#selected_pdService").val(),
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true
	}).done(function (data) {
		// -------------------- reviewer setting -------------------- //
		//reviewer clear
		$("#popup_pdservice_reviewers").val(null).trigger("change");

		var selectedReviewerArr = [];
		if (data.c_req_reviewer01 == null || data.c_req_reviewer01 == "none") {
			console.log("registNewPopup :: data.c_req_reviewer01 empty");
		} else {
			selectedReviewerArr.push(data.c_req_reviewer01);
			// Set the value, creating a new option if necessary
			if ($("#popup_pdservice_reviewers").find("option[value='" + data.c_req_reviewer01 + "']").length) {
				console.log('option[value=\'" + data.c_req_reviewer01 + "\']"' + "already exist");
			} else {
				// Create a DOM Option and pre-select by default
				var newOption01 = new Option(data.c_req_reviewer01, data.c_req_reviewer01, true, true);
				// Append it to the select
				$("#popup_pdservice_reviewers").append(newOption01).trigger("change");
			}
		}
		if (data.c_req_reviewer02 == null || data.c_req_reviewer02 == "none") {
			console.log("registNewPopup :: data.c_req_reviewer02 empty");
		} else {
			selectedReviewerArr.push(data.c_req_reviewer02);
			// Set the value, creating a new option if necessary
			if ($("#popup_pdservice_reviewers").find("option[value='" + data.c_req_reviewer02 + "']").length) {
				console.log('option[value=\'" + data.c_req_reviewer02 + "\']"' + "already exist");
			} else {
				// Create a DOM Option and pre-select by default
				var newOption02 = new Option(data.c_req_reviewer02, data.c_req_reviewer02, true, true);
				// Append it to the select
				$("#popup_pdservice_reviewers").append(newOption02).trigger("change");
			}
		}
		if (data.c_req_reviewer03 == null || data.c_req_reviewer03 == "none") {
			console.log("registNewPopup :: data.c_req_reviewer03 empty");
		} else {
			selectedReviewerArr.push(data.c_req_reviewer03);
			// Set the value, creating a new option if necessary
			if ($("#popup_pdservice_reviewers").find("option[value='" + data.c_req_reviewer03 + "']").length) {
				console.log('option[value=\'" + data.c_req_reviewer03 + "\']"' + "already exist");
			} else {
				// Create a DOM Option and pre-select by default
				var newOption03 = new Option(data.c_req_reviewer03, data.c_req_reviewer03, true, true);
				// Append it to the select
				$("#popup_pdservice_reviewers").append(newOption03).trigger("change");
			}
		}
		if (data.c_req_reviewer04 == null || data.c_req_reviewer04 == "none") {
			console.log("registNewPopup :: data.c_req_reviewer04 empty");
		} else {
			selectedReviewerArr.push(data.c_req_reviewer04);
			// Set the value, creating a new option if necessary
			if ($("#popup_pdservice_reviewers").find("option[value='" + data.c_req_reviewer04 + "']").length) {
				console.log('option[value=\'" + data.c_req_reviewer04 + "\']"' + "already exist");
			} else {
				// Create a DOM Option and pre-select by default
				var newOption04 = new Option(data.c_req_reviewer04, data.c_req_reviewer04, true, true);
				// Append it to the select
				$("#popup_pdservice_reviewers").append(newOption04).trigger("change");
			}
		}
		if (data.c_req_reviewer05 == null || data.c_req_reviewer05 == "none") {
			console.log("registNewPopup :: data.c_req_reviewer05 empty");
		} else {
			selectedReviewerArr.push(data.c_req_reviewer05);
			// Set the value, creating a new option if necessary
			if ($("#popup_pdservice_reviewers").find("option[value='" + data.c_req_reviewer05 + "']").length) {
				console.log('option[value=\'" + data.c_req_reviewer05 + "\']"' + "already exist");
			} else {
				// Create a DOM Option and pre-select by default
				var newOption05 = new Option(data.c_req_reviewer05, data.c_req_reviewer05, true, true);
				// Append it to the select
				$("#popup_pdservice_reviewers").append(newOption05).trigger("change");
			}
		}
		$("#popup_pdservice_reviewers").val(selectedReviewerArr).trigger("change");

		// ------------------------- reviewer end --------------------------------//
	});
}

///////////////////////////////////////////////////////////////////////////////
// 팝업에서 요구사항 등록 모드에 따라서, 정보를 보여주거나 감추는 역할
///////////////////////////////////////////////////////////////////////////////
function switch_action_for_mode() {
	$(".form-horizontal input[name=reqType]").on("change", function () {
		if ($("input[name=reqType]:checked").val() === "default") {
			$("#popup_version_div").show();
			$("#popup_reviewer_div").show();
			$("#popup_priority_div").show();

			$("#popup_req_priority_div").show();
			$("#popup_req_difficulty_div").show();
			$("#popup_req_state_div").show();
		}
		else {
			$("#popup_reviewer_div").hide();
			$("#popup_priority_div").hide();

			$("#popup_req_priority_div").hide();
			$("#popup_req_difficulty_div").hide();
			$("#popup_req_state_div").hide();
		}
	});
}

///////////////////////////////////////////////////////////////////////////////
// 팝업에서 신규 요구사항 저장 버튼
///////////////////////////////////////////////////////////////////////////////
function save_req() {
	$("#save_req").click(function () {
		let table_name = "T_ARMS_REQADD_" + $("#selected_pdService").val();

		let c_type_value;
		if (isEmpty($("input[name=reqType]:checked").val())) {
			c_type_value = "default";
		} else {
			c_type_value = $("input[name=reqType]:checked").val();
		}

		let req_title = $("#req_title").val().trim();
		if(!req_title) {
			alert("요구사항 제목이 없습니다.");
			return false;
		}

		let versionset_link = $("#popup_version").val();
		if (versionset_link.length < 1) {
			alert("선택된 버전이 없습니다.");
			return false;
		}

		var reviewers01 = getReviewer(0, "popup_pdservice_reviewers");
		var reviewers02 = getReviewer(1, "popup_pdservice_reviewers");
		var reviewers03 = getReviewer(2, "popup_pdservice_reviewers");
		var reviewers04 = getReviewer(3, "popup_pdservice_reviewers");
		var reviewers05 = getReviewer(4, "popup_pdservice_reviewers");

		let priority_value = $("#popup_req_priority input[name='popup_req_priority_options']:checked").val();
		let select_req_priority_link = priority_value === undefined ? "5" : priority_value;

		let difficulty_value = $("#popup_req_difficulty input[name='popup_req_difficulty_options']:checked").val();
		let	select_req_difficulty_link = difficulty_value === undefined ? "5" : difficulty_value;

		let state_value = $("#popup_req_state input[name='popup_req_state_options']:checked").val();
		let	select_req_state_link = state_value === undefined ? "10" : state_value;

		let start_date_value = $("#popup_req_start_date").val();
		let c_req_start_date;
		if (start_date_value) {
			c_req_start_date = new Date(start_date_value);
		}

		let end_date_value = $("#popup_req_end_date").val();
		let c_req_end_date;
		if (end_date_value) {
			c_req_end_date = new Date(end_date_value);
		}

		let data_object_param = {
			ref: selectedJsTreeId,
			c_title: req_title,
			c_type: c_type_value,
			c_req_pdservice_link: $("#selected_pdService").val(),
			c_req_pdservice_versionset_link: JSON.stringify(versionset_link),
			c_req_start_date: c_req_start_date,
			c_req_end_date: c_req_end_date,
			c_req_writer: "[" + userName + "]" + " - " + userID,
			c_req_contents: CKEDITOR.instances["modal_editor"].getData(),
			c_req_desc: "설명",
			c_req_etc: "비고"
		};

		if (c_type_value === "default") {
			Object.assign(data_object_param, {
				c_req_priority_link: select_req_priority_link,
				c_req_difficulty_link: select_req_difficulty_link,
				c_req_state_link: select_req_state_link,
				c_req_reviewer01: reviewers01,
				c_req_reviewer02: reviewers02,
				c_req_reviewer03: reviewers03,
				c_req_reviewer04: reviewers04,
				c_req_reviewer05: reviewers05,
				c_req_reviewer01_status: "Draft",
				c_req_reviewer02_status: "Draft",
				c_req_reviewer03_status: "Draft",
				c_req_reviewer04_status: "Draft",
				c_req_reviewer05_status: "Draft"
			});
		}

		console.log("save_req :: save data ->");
		console.log(data_object_param);

		let url_suffix = c_type_value === "default" ? "/addNode.do" : "/addFolderNode.do";
		let success_message = c_type_value === "default" ?
			"신규 요구사항 ( " + req_title + " )이 추가되었습니다." :
			" 요구사항 폴더 ( " + req_title + " )가 등록되었습니다.";

		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + table_name + url_suffix,
			type: "POST",
			data: data_object_param,
			statusCode: {
				200: function () {
					$("#req_tree").jstree("refresh");
					$("#close_req").trigger("click");
					jSuccess(success_message);
				}
			}
		});
	});
}

///////////////////////////////////////////////////////////////////////////////
// 요구사항 편집 탭 저장 버튼
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_req_update() {
	$("#edit_tab_req_update").click(function () {
		let table_name = "T_ARMS_REQADD_" + $("#selected_pdService").val();
		let edit_req_title = $("#editview_req_title").val().trim();
		if(!edit_req_title) {
			alert("변경할 요구사항 제목이 없습니다.");
			return false;
		}

		let edit_versionset_link = $("#edit_multi_version").val();
		if (edit_versionset_link.length < 1) {
			alert("선택된 버전이 없습니다.");
			return false;
		}

		var reviewers01 = getReviewer(0, "editview_req_reviewers");
		var reviewers02 = getReviewer(1, "editview_req_reviewers");
		var reviewers03 = getReviewer(2, "editview_req_reviewers");
		var reviewers04 = getReviewer(3, "editview_req_reviewers");
		var reviewers05 = getReviewer(4, "editview_req_reviewers");

		let edit_priority_value = $("#editview_req_priority input[name='editview_req_priority_options']:checked").val();
		let edit_difficulty_value = $("#editview_req_difficulty input[name='editview_req_difficulty_options']:checked").val();
		let edit_state_value = $("#editview_req_state input[name='editview_req_state_options']:checked").val();
		let edit_req_priority_link = edit_priority_value === undefined ? "5" : edit_priority_value;
		let	edit_req_difficulty_link = edit_difficulty_value === undefined ? "5" : edit_difficulty_value;
		let	edit_req_state_link = edit_state_value === undefined ? "10" : edit_state_value;
		let c_type_value = $("#editview_req_type").val();

		let edit_start_date_value = $("#editview_req_start_date").val();
		let c_req_start_date;
		if (edit_start_date_value) {
			c_req_start_date = new Date(edit_start_date_value);
		}

		let edit_ent_date_value = $("#editview_req_end_date").val();
		let c_req_end_date;
		if (edit_ent_date_value) {
			c_req_end_date = new Date(edit_ent_date_value);
		}

		let data_object_param = {
			c_id: $("#editview_req_id").val(),
			c_title: edit_req_title,
			c_req_pdservice_versionset_link: JSON.stringify(edit_versionset_link),
			c_req_start_date: c_req_start_date,
			c_req_end_date: c_req_end_date,
			c_req_contents: CKEDITOR.instances["edit_tabmodal_editor"].getData()
		};

		if (c_type_value === "default") {
			Object.assign(data_object_param, {
				c_req_priority_link: edit_req_priority_link,
				c_req_difficulty_link: edit_req_difficulty_link,
				c_req_state_link: edit_req_state_link,
				c_req_reviewer01: reviewers01,
				c_req_reviewer02: reviewers02,
				c_req_reviewer03: reviewers03,
				c_req_reviewer04: reviewers04,
				c_req_reviewer05: reviewers05,
			});
		}

		console.log("update_req :: update data ->");
		console.log(data_object_param);

		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + table_name + "/updateNode.do",
			type: "POST",
			data: data_object_param,
			statusCode: {
				200: function () {
					$("#req_tree").jstree("refresh");
					jSuccess('"' + edit_req_title + '"' + " 요구사항이 변경되었습니다.");
				}
			}
		});
	});
}

///////////////////////////////////////////////////////////////////////////////
// 달력
///////////////////////////////////////////////////////////////////////////////
function makeDatePicker(calender) {
	var Inputs = $(calender).parent().prev().val();
	$(calender).attr("data-date", Inputs);

	calender
		.datepicker({
			autoclose: true
		})
		.datepicker("update", Inputs)
		.on("changeDate", function (ev) {
			var Input = $(this).parent().next();
			Input.val(calender.data("date"));
			calender.datepicker("hide");
		});
}

///////////////////////////////////////////////////////////////////////////////
// History TAB 검색 버튼
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_search_history() {
	$("#logsearch").click(function () {
		$(".timeline-item-body").remove();
		var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();

		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/getHistory.do",
			type: "GET",
			data: {
				startDate: $("#input_req_start_date").val(),
				endDate: $("#input_req_end_date").val()
			},
			contentType: "application/json;charset=UTF-8",
			dataType: "json",
			progress: true,
			statusCode: {
				200: function () {
					console.log("성공!");
					jSuccess("데이터 조회가 완료되었습니다.");
				}
			}
		})
			.done(function (data) {
				for (var k in data) {
					var obj = data[k];

					console.log("jsonIndex[" + k + "]=" + "obj.fileIdlink => " + obj.fileIdlink); //t_arms_filerepository
					console.log("jsonIndex[" + k + "]=" + "obj.c_pdservice_jira_ids => " + obj.c_pdservice_jira_ids); //t_arms_pdserviceconnect
					console.log("jsonIndex[" + k + "]=" + "obj.c_jira_con_passmode => " + obj.c_jira_con_passmode); //t_arms_pdservicjira
					console.log("jsonIndex[" + k + "]=" + "obj.c_end_date => " + obj.c_end_date); //t_arms_pdservicversion
					console.log("jsonIndex[" + k + "]=" + "obj.c_fileid_link => " + obj.c_fileid_link); //t_arms_pdservice
					console.log("jsonIndex[" + k + "]=" + "obj.c_req_status => " + obj.c_req_status); //t_arms_reqadd

					if (
						!isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_filerepository
						if (obj.c_title == "pdService") {
						} else {
							var timestamp_t_arms_filerepository = new Date(obj.c_date);
							var datetime_t_arms_filerepository =
								timestamp_t_arms_filerepository.getFullYear() +
								"/" +
								(timestamp_t_arms_filerepository.getMonth() + 1) +
								"/" +
								timestamp_t_arms_filerepository.getDate() +
								" " +
								timestamp_t_arms_filerepository.getHours() +
								":" +
								timestamp_t_arms_filerepository.getMinutes();

							var add_t_arms_filerepository =
								'<li class="timeline-item-body">\n' +
								'	<i class="fa fa-check-square-o bg-maroon"></i>\n' +
								'	<div class="timeline-item">\n' +
								'		<span class="arrow"></span>\n' +
								'		<span class="time"><i class="fa fa-clock-o"></i>' +
								datetime_t_arms_filerepository +
								"</span>\n" +
								'		<h3 class="timeline-header"><a href="#">기획</a> <small class="font11">요구사항 파일 로그</small></h3>\n' +
								'		<div class="timeline-body col-md-4 font11">\n' +
								'			<a href="#" target="_blank" class="btn bg-maroon btn-xs" style="font-size: 11px;"><i class="fa fa-share"></i> 로그 자세히 보기</a>\n' +
								"		</div>\n" +
								' <div class="timeline-footer col-md-8 font12 fontw600">\n' +
								"  저장된 액션 : " +
								obj.c_state +
								"<br>\n" +
								"  저장된 액션 : " +
								obj.c_method +
								"<br>\n" +
								"  저장된 파일 이름 : " +
								obj.fileName +
								"<br>\n" +
								"  저장된 파일 타입 : " +
								obj.contentType +
								"\n" +
								"  </div>\n" +
								" </div>\n" +
								"</li>";
							$(".timeline.timeline-inverse").append(add_t_arms_filerepository);
						}
					} else if (
						isEmpty(obj.fileIdlink) &&
						!isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_pdserviceconnect
					} else if (
						isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						!isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_pdservicjira
					} else if (
						isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						!isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_pdservicversion
					} else if (
						isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						!isEmpty(obj.c_fileid_link) &&
						isEmpty(obj.c_req_status)
					) {
						//t_arms_pdservice
					} else if (
						isEmpty(obj.fileIdlink) &&
						isEmpty(obj.c_pdservice_jira_ids) &&
						isEmpty(obj.c_jira_con_passmode) &&
						isEmpty(obj.c_end_date) &&
						isEmpty(obj.c_fileid_link) &&
						!isEmpty(obj.c_req_status)
					) {
						//t_arms_reqadd
						var timestamp_t_arms_reqadd = new Date(obj.c_date);
						var datetime_t_arms_reqadd =
							timestamp_t_arms_reqadd.getFullYear() +
							"/" +
							(timestamp_t_arms_reqadd.getMonth() + 1) +
							"/" +
							timestamp_t_arms_reqadd.getDate() +
							" " +
							timestamp_t_arms_reqadd.getHours() +
							":" +
							timestamp_t_arms_reqadd.getMinutes();

						var add_t_arms_reqadd =
							'<li class="timeline-item-body">\n' +
							'	<i class="fa fa-check-square-o bg-maroon"></i>\n' +
							'	<div class="timeline-item">\n' +
							'		<span class="arrow"></span>\n' +
							'		<span class="time"><i class="fa fa-clock-o"></i>' +
							datetime_t_arms_reqadd +
							"</span>\n" +
							'		<h3 class="timeline-header"><a href="#">기획</a> <small class="font11">요구사항 등록,변경,삭제 로그</small></h3>\n' +
							'		<div class="timeline-body col-md-4 font11">\n' +
							'			<a href="#" target="_blank" class="btn bg-maroon btn-xs" style="font-size: 11px;"><i class="fa fa-share"></i> 로그 자세히 보기</a>\n' +
							"		</div>\n" +
							' <div class="timeline-footer col-md-8 font12 fontw600">\n' +
							"  저장된 액션 : " +
							obj.c_state +
							"<br>\n" +
							"  저장된 액션 : " +
							obj.c_method +
							"<br>\n" +
							"  저장된 요구사항 이름 : " +
							obj.c_title +
							"<br>\n" +
							"  저장된 제품(서비스) 아이디 : " +
							obj.c_pdservice_link +
							"<br>\n" +
							"  저장된 요구사항 상태 : " +
							obj.c_req_status +
							"\n" +
							"  </div>\n" +
							" </div>\n" +
							"</li>";
						$(".timeline.timeline-inverse").append(add_t_arms_reqadd);
					} else {
						console.log("정의되지 않은 타입의 객체 데이터 확인 :: " + obj);
					}
				} //for end

				var endPointHtmlStr =
					"<!-- END timeline item -->\n" +
					'                                    <li class="timeline-item-body">\n' +
					'                                        <i class="fa fa-clock-o bg-gray"></i>\n' +
					"                                    </li>";
				$(".timeline.timeline-inverse").append(endPointHtmlStr);
			})
			.fail(function (e) {})
			.always(function () {});
	});
}

///////////////////////////////////////////////////////////////////////////////
// 탭 클릭 이벤트
///////////////////////////////////////////////////////////////////////////////
function change_tab_action() {
	$('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
		var target = $(e.target).attr("href"); // activated tab

		if (target == "#stats") {
			$(".edit_btn_group").addClass("hidden");
			$(".jira_btn_group").addClass("hidden");
			$(".newReqDiv").hide();
		} else if (target == "#edit") {
			$(".edit_btn_group").removeClass("hidden");
			$(".jira_btn_group").addClass("hidden");
			$(".newReqDiv").hide();
		} else if (target == "#jira") {
			$(".edit_btn_group").addClass("hidden");
			$(".jira_btn_group").removeClass("hidden");
			$(".newReqDiv").hide();

			console.log("jira tab click event");
			//1-1. 제품(서비스) 아이디를 기준으로, -- $('#selected_pdService').val()
			console.log("selected_pdService::::" + $("#selected_pdService").val()); // service id
			console.log("selectedJsTreeId::::" + selectedJsTreeId); //  jsTree ID

			//1-2. 요구사항 jsTree ID 가져와서 -- selectedJsTreeId
			//2. 요구사항 테이블 ( REQADD ) 을 검색하여
			//3. JIRA_VER 정보에 체크해 주기.
			//제품 서비스 셀렉트 박스 데이터 바인딩
			//요구사항 클릭하면 자세히보기 탭으로 가니까 이 로직은 유효하다.

			var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();
			console.log("jira selectedJsTreeId" + selectedJsTreeId);
			console.log("jira tableName" + tableName);
			console.log("jira datatables_jira_project 완료 ");
		} else if (target == "#report") {
			$(".newReqDiv").show();
			$(".edit_btn_group").addClass("hidden");
		} else if (target == "#doc") {
			$(".edit_btn_group").addClass("hidden");
			$(".jira_btn_group").addClass("hidden");
			$(".newReqDiv").hide();
		} else if (target == "#history") {
			$(".edit_btn_group").addClass("hidden");
			$(".jira_btn_group").addClass("hidden");
			$(".newReqDiv").hide();
		}
	});
}

///////////////////////////////////////////////////////////////////////////////
// 요구사항 - 지라 연결설정 변경 버튼 클릭 이벤트
///////////////////////////////////////////////////////////////////////////////
function click_btn_for_connect_req_jira() {
	$("#req_jiraver_connect_change").click(function () {
		console.log("req_jiraver_connect_change");

		//JiraVersion 정보 셋팅
		// var jiraCheckId = [];
		// $("input:checkbox[name=jiraVerList]:checked").each(function (i, iVal) {
		// 	chk_Val.push(iVal.value);
		// });
		console.log(" jiraCheckId :: " + JSON.stringify(jiraCheckId));

		//반영할 테이블 네임 값 셋팅
		var tableName = "T_ARMS_REQADD_" + $("#selected_pdService").val();
		// check box 값 = jiraCheckId
		$.ajax({
			url: "/auth-user/api/arms/reqAdd/" + tableName + "/updateNode.do",
			data: {
				c_id: selectedJsTreeId, // reqAdd id
				c_req_pdservice_versionset_link: "[]", //c_req_pdservice_versionset_link
				c_jira_link: "independent",
				c_req_etc: JSON.stringify(jiraCheckId) //c_req_etc, c_jira_ver_link
			},
			type: "POST",
			progress: true
		})
			.done(function (data) {
				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);
				}

				var loopCount = 3;
				for (var i = 0; i < loopCount; i++) {
					console.log("loop check i = " + i);
				}
			})
			.fail(function (e) {})
			.always(function () {});
	});
}

$("#text").on("input", function () {
	var searchString = $(this).val();
	$("#req_tree").jstree("search", searchString);
});

function tableSelectOption(obj) {
	const $li = document.createElement("li");
	const $title = document.getElementById("tableTitle");

	$li.innerHTML = `<a href="#reqTable" data-toggle="tab">${obj.c_title}</a>`;

	$li.addEventListener("click", (e) => {
		tableSelect(obj.c_id);
		$title.innerText = obj.c_title;
	});

	return $li;
}

function checkAnswer(e) {
	//const radioEl = document.querySelector('[name="pivot"]:checked');
	//changeTableType(radioEl.value);

	const selectEl = document.querySelector('.select-type select');
	changeTableType(selectEl.value);
}

function tableSelect(id) {
	makeReqTable({
		wrapper: "reqDataTable",
		id,
		onGetVersion: async function (id) {
			return await $.ajax({
				url: `/auth-user/api/arms/pdService/getVersionList.do?c_id=${id}`,
				type: "GET",
				dataType: "json",
				progress: true,
				statusCode: {
					200: function (data) {
						if (!isEmpty(data)) {
							return data;
						}
					}
				},
				error: function (e) {
					jError("버전 조회 중 에러가 발생했습니다.");
				}
			});
		},
        onGetReqAssignee: async function (id) {
			return await $.ajax({
				url: `/auth-user/api/arms/reqAdd/getRequirementAssignee.do?c_id=${id}`,
				type: "GET",
				dataType: "json",
				progress: true,
				statusCode: {
					200: function (data) {
						if (!isEmpty(data)) {
							return data.response;
						}
					}
				},
				error: function (e) {
					jError("버전 조회 중 에러가 발생했습니다.");
				}
			});
		},
		onGetData: async function (id) {
			return await $.ajax({
				url: `/auth-user/api/arms/reqAdd/T_ARMS_REQADD_${id}/getMonitor.do`,
				type: "GET",
				dataType: "json",
				progress: true,
				statusCode: {
					200: function (data) {
						if (!isEmpty(data)) {
							return data;
						}
					}
				}
			});
		},
		onUpdate: function (id, params) { // 요구사항 제목
			$.ajax({
				url: `/auth-user/api/arms/reqAdd/T_ARMS_REQADD_${id}/updateNode.do`,
				type: "POST",
				data: params,
				statusCode: {
					200: function () {
						jSuccess('"' + params.c_title + '"' + " 요구사항이 변경되었습니다.");
					}
				},
                error: function() {
                    jError("요구사항 변경에 실패하였습니다.");
                    tableSelect(id);
                }
			});
		},
		onDBUpdate: function (id ,params) { // 상태, 우선순위, 난이도, 시작일, 종료일
            $.ajax({
       			url: `/auth-user/api/arms/reqAdd/T_ARMS_REQADD_${id}/updateDataBase.do`,
   				type: "POST",
  				data: params,
        		statusCode: {
   					200: function () {
       				jSuccess("요구사항이 변경되었습니다.");
        			}
       			},
                error: function() {
                    jError("요구사항 변경에 실패하였습니다.");
                    tableSelect(id);
                }
   			});
   		}
	});
}

function getReviewer(index, req_reviewers_id) {
	let reviewer = "none";
	if ($("#"+req_reviewers_id).select2("data")[index] != undefined) {
		reviewer = $("#"+req_reviewers_id).select2("data")[0].text;
	}
	return reviewer;
}

function formatDate(date) {
	var year = date.getFullYear().toString(); // 연도의 마지막 두 자리를 얻습니다.
	var month = (date.getMonth() + 1).toString().padStart(2, "0");
	var day = date.getDate().toString().padStart(2, "0");
	return year + "-" + month + "-" + day;
}