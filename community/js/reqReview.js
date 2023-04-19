////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;

function execDocReady() {
	//좌측 메뉴
	setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_review", "requirement_elements_collapse");

	getJsonForPrototype("./mock/reviewClassify.json", makeClassifyMenus);

	dataTableLoad();
}

// make review classify menu
var makeClassifyMenus = function (data) {
	var reviewClassify = document.getElementById("review_classify");
	var menus = "";
	data.forEach(
		(item) =>
			(menus += `
		<li class="${item.current ? "active" : ""}" data-c_review_result_state="${item.c_review_result_state}">
			<a href="#">${item.name}</a>
		</li>
	`)
	);
	reviewClassify.innerHTML = menus;
};

////////////////////////////////////////////////////////////////////////////////////////
// --- 데이터 테이블 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function dataTableLoad() {
	// 데이터 테이블 컬럼 및 열그룹 구성
	var columnList = [
		{ name: "c_id", title: "ID", data: "c_id", visible: true },
		{ name: "c_review_pdservice_name", title: "제품(서비스)", data: "c_review_pdservice_name", visible: true },
		{ name: "c_review_req_link", title: "요구사항 아이디", data: "c_review_req_link", visible: false },
		{ name: "c_review_req_name", title: "요구사항", data: "c_review_req_name", visible: true },
		{ name: "c_review_sender", title: "리뷰 요청인", data: "c_review_sender", visible: true },
		{ name: "c_review_responder", title: "리뷰 응답인", data: "c_review_responder", visible: true },
		{ name: "c_review_result_state", title: "리뷰 상태", data: "c_review_result_state", visible: true },
		{ name: "c_review_creat_date", title: "리뷰 생성일", data: "c_review_creat_date", visible: true }
	];
	var rowsGroupList = [];
	var columnDefList = [];
	var selectList = {};
	var orderList = [[1, "asc"]];
	var buttonList = [];

	var jquerySelector = "#reqreview_table";
	var ajaxUrl = "/auth-user/api/arms/reqReview/getMonitor_Without_Root.do?reviewer=" + userName + "&filter=All";
	var jsonRoot = function (json) {
		var returnArr = [];
		if (isEmpty(json.result)) {
			console.log("data is empty");
		} else {
			for (var i = 0; i < json.result.length; i++) {
				returnArr.push(json.result[i]);
			}
		}
		return returnArr;
	};
	var isServerSide = true;

	reqStatusDataTable = dataTable_build(
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

// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
	console.log("selectedData.c_review_pdservice_link = " + selectedData.c_review_pdservice_link);
	console.log("selectedData.c_review_req_link = " + selectedData.c_review_req_link);
	console.log("selectedData.c_id = " + selectedData.c_id);
	location.href =
		"template.html?page=reqReviewDetail&c_id=" +
		selectedData.c_id +
		"&c_review_pdservice_link=" +
		selectedData.c_review_pdservice_link +
		"&c_review_req_link=" +
		selectedData.c_review_req_link;
}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(settings, json) {}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();
}

// side menu click
$("#review_classify").click(async function (ev) {
	var li = ev.target.parentNode;
	for (var item of ev.currentTarget.children) {
		item.classList.remove("active");
	}

	li.classList.add("active");

	$("#reqreview_table").dataTable().empty();

	var columnList = [
		{ name: "c_id", title: "ID", data: "c_id", visible: true },
		{ name: "c_review_pdservice_name", title: "제품(서비스)", data: "c_review_pdservice_name", visible: true },
		{ name: "c_review_req_link", title: "요구사항 아이디", data: "c_review_req_link", visible: false },
		{ name: "c_review_req_name", title: "요구사항", data: "c_review_req_name", visible: true },
		{ name: "c_review_sender", title: "리뷰 요청인", data: "c_review_sender", visible: true },
		{ name: "c_review_responder", title: "리뷰 응답인", data: "c_review_responder", visible: true },
		{ name: "c_review_result_state", title: "리뷰 상태", data: "c_review_result_state", visible: true },
		{ name: "c_review_creat_date", title: "리뷰 생성일", data: "c_review_creat_date", visible: true }
	];

	var rowsGroupList = [];
	var columnDefList = [];
	var selectList = {};
	var orderList = [[1, "asc"]];
	var buttonList = [];

	var jquerySelector = "#reqreview_table";

	var jsonRoot = function (json) {
		var returnArr = [];
		if (isEmpty(json.result)) {
			console.log("data is empty");
		} else {
			for (var i = 0; i < json.result.length; i++) {
				returnArr.push(json.result[i]);
			}
		}
		return returnArr;
	};

	var isServerSide = true;

	var ajaxUrl =
		"/auth-user/api/arms/reqReview/getMonitor_Without_Root.do?reviewer=" +
		userName +
		"&filter=" +
		li.dataset.c_review_result_state;

	reqStatusDataTable = dataTable_build(
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
});
