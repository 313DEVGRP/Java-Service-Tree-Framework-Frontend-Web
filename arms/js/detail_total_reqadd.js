////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디
var versionList;
function execDocReady() {
	var pluginGroups = [
		["../reference/lightblue4/docs/lib/widgster/widgster.js"],
		[
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js"
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
		[
			"css/jiraServerCustom.css",
			"../reference/jquery-plugins/swiper-11.1.4/swiper-bundle.min.js",
			"../reference/jquery-plugins/swiper-11.1.4/swiper-bundle.min.css",
			"./js/common/swiperHelper.js",
			"./css/customSwiper.css"
		]
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			setUrlParams();
            getVersionList();
			$(".widget").widgster();

			setSideMenu("sidebar_menu_product", "sidebar_menu_total_reqadd");

			build_ReqData_By_PdService();

			// --- 에디터 설정 --- //
			var waitCKEDITOR = setInterval(function () {
				try {
					if (window.CKEDITOR) {
						if (window.CKEDITOR.status === "loaded") {
							CKEDITOR.replace("detailview_req_contents", { skin: "office2013" });
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

function setUrlParams() {
	urlParams = new URL(location.href).searchParams;
	selectedPdService = urlParams.get("pdService");
	selectedPdServiceVersion = urlParams.get("pdServiceVersion");
	selectedJsTreeId = urlParams.get("reqAdd");
	selectedJiraServer = urlParams.get("jiraServer");
	selectedJiraProject = urlParams.get("jiraProject");
}
function getVersionList(){
    $.ajax({
        url: `/auth-user/api/arms/pdService/getVersionList.do?c_id=${selectedPdService}`,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                versionList = data.response;
            }
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////
//요구사항 :: jsTree
////////////////////////////////////////////////////////////////////////////////////////
function build_ReqData_By_PdService() {
	var jQueryElementID = "#req_tree";
	var serviceNameForURL = "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" + selectedPdService;

	jsTreeBuild(jQueryElementID, serviceNameForURL);
}

// --- 요구사항 (jstree) 선택 이벤트 --- //
function jsTreeClick(selectedNode) {
	console.log("============= js click");
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
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").show(); //리스트보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //문서로보기

		// 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
		// 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
		dataTableLoad(selectedJsTreeId, selectRel);
	} else if (selectRel == "folder") {
		$("#folder_tab").get(0).click();
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").hide(); //상세보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").show(); //리스트보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").show(); //문서로보기

		//상세보기 탭 셋팅
		setDetailAndEditViewTab();

		// 리스트로 보기(DataTable) 설정 ( 폴더나 루트니까 )
		// 상세보기 탭 셋팅이 데이터테이블 렌더링 이후 시퀀스 호출 함.
		dataTableLoad(selectedJsTreeId, selectRel);

	} else {
		$("#default_tab").get(0).click();
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(1)").show(); //상세보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(2)").hide(); //리스트보기
		$(".widget-tabs").children("header").children("ul").children("li:nth-child(3)").hide(); //문서로보기

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
	var tableName = "T_ARMS_REQADD_" +selectedPdService;

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

/*
    상세 보기
*/
function setDetailAndEditViewTab() {
	console.log("Detail Tab ::::");
	var tableName = "T_ARMS_REQADD_" + selectedPdService;
	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + selectedJsTreeId,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true
	})
		.done(function (data) {
			// ------------------ 상세보기 ------------------ //
			bindDataDetailTab(data);
		})
		.fail(function (e) {})
		.always(function () {});
}

// ------------------ 상세보기 ------------------ //
function bindDataDetailTab(ajaxData) {
	console.log("bindDataDetailTab :::::::::::");
	console.log(ajaxData);
    // 제품 서비스 데이터 바인딩
    if(ajaxData.pdServiceEntity){
        $("#detailview_req_pdservice_name").val(ajaxData.pdServiceEntity.c_title);
    }else{
        $("#detailview_req_pdservice_name").val("");
    }

	//Version 데이터 바인딩
    let reqVersion = "";
    if (ajaxData.c_req_pdservice_versionset_link) {
        const selectedVersions = versionList.filter(version =>
            ajaxData.c_req_pdservice_versionset_link.includes(version.c_id)
        );
        selectedVersions.sort((a, b) => b.c_id - a.c_id);

        const titleArray = selectedVersions.map(version => version.c_title);
        reqVersion = titleArray.join(", ");

        $("#detailview_req_pdservice_version").val(reqVersion);
    }else{
        $("#detailview_req_pdservice_version").val("요구사항에 등록된 버전이 없습니다.");
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
			console.log($(this));
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

	// ckedtior 로드가 완료되기 전에 데이터를 set해서 오류 발생
	let editor_instance_wait = setInterval(function () {
		try {
			var editor_instance = CKEDITOR.instances['detailview_req_contents'];
			if (editor_instance) {
				CKEDITOR.instances.detailview_req_contents.setData(ajaxData.c_req_contents);
				CKEDITOR.instances.detailview_req_contents.setReadOnly(true);
				clearInterval(editor_instance_wait);
			}
		} catch (err) {
			console.log("CKEDITOR 로드가 완료되지 않아서 재시도 중...");
		}
	}, 313 /*milli*/);

	if (ajaxData.c_drawio_image_raw != null && ajaxData.c_drawio_image_raw != "") {
		var imageSrcArray = Array(1).fill(ajaxData.c_drawio_image_raw);
		addImageToSwiper(imageSrcArray, "pdservice_detail_drawio_swiper_container");
		$("#pdservice_detail_drawio_swiper").show();
		$("#pdservice_detail_drawio_div").show();
	} else {
		$("#pdservice_detail_drawio_swiper").hide();
		$("#pdservice_detail_drawio_div").hide();
	}



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

function formatDate(date) {
	var year = date.getFullYear().toString(); // 연도의 마지막 두 자리를 얻습니다.
	var month = (date.getMonth() + 1).toString().padStart(2, "0");
	var day = date.getDate().toString().padStart(2, "0");
	return year + "-" + month + "-" + day;
}

function viewDrawIO() {
	if(selectedJsTreeId) {
		window.open("/reference/drawio?id=" + selectedJsTreeId + "&type=update&splash=0&armsType=reqadd&pdServiceId="+selectedPdService, "_blank");
	}
	return false;
}