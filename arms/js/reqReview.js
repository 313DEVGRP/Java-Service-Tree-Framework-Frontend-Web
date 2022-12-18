////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;

$(function () {

	//좌측 메뉴
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_review",
		"requirement-elements-collapse"
	);

	getJsonForPrototype("./js/reviewClassify.json", makeClassifyMenus);

	var externalData = "";
	var jquerySelectorID = "#reqReviewTable";
	var ajaxUrl = "/auth-user/api/arms/reqReview/getMonitor_Without_Root.do?reviewer=admin&filter=All";
	var columnList = [
		{ name: "c_id",
			title: "ID",
			data: "c_id",
			visible: true
		},
		{ name: "c_review_pdservice_name",
			title: "제품(서비스)",
			data: "c_review_pdservice_name",
			visible: true
		},

		{ name: "c_review_sender",
			title: "리뷰 요청인",
			data: "c_review_sender",
			visible: false
		},
		{ name: "c_review_responder",
			title: "리뷰 응답인",
			data: "c_review_responder",
			visible: true
		},

		{ name: "c_review_req_name",
			title: "리뷰 제목",
			data: "c_review_req_name",
			visible: false
		},
		{ name: "c_review_result_state",
			title: "리뷰 상태",
			data: "c_review_result_state",
			visible: true
		},
		{ name: "c_review_creat_date",
			title: "리뷰 일자",
			data: "c_review_creat_date",
			visible: true
		},

		{ name: "c_req_link",
			title: "요구사항 아이디",
			data: "c_req_link",
			visible: false
		},
		{ name: "c_req_name",
			title: "요구사항",
			data: "c_req_name",
			visible: true
		}

	];
	var rowsGroupList = [];
	var columnDefList = [];
	var selectList = {};
	var buttonList = [];
	common_dataTableLoad(externalData, jquerySelectorID, ajaxUrl, columnList, rowsGroupList, columnDefList, selectList, buttonList);

});

// make review classify menu
var makeClassifyMenus = function (data) {
	var reviewClassify = document.getElementById("review-classify");
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
//데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //
function common_dataTableLoad(externalData ,jquerySelectorID, ajaxUrl, columnList, rowsGroupList, columnDefList, selectList, buttonList) {

	var jQueryElementID = jquerySelectorID;
	var reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
	var jQueryElementStr = jQueryElementID.replace(reg,'');
	// 데이터 테이블 컬럼 및 열그룹 구성
	var orderList = [[ 1, 'asc' ]];
	console.log("defaultType_dataTableLoad externalData -> " + externalData);
	console.log("dataTableBuild :: jQueryElementID -> " + jQueryElementID);
	console.log("dataTableBuild :: jQueryElementStr -> " + jQueryElementStr);
	console.log("dataTableBuild :: columnList -> " + columnList);
	console.log("dataTableBuild :: rowsGroupList -> " + rowsGroupList);
	console.log("dataTableBuild :: href: " + $(location).attr("href"));
	console.log("dataTableBuild :: protocol: " + $(location).attr("protocol"));
	console.log("dataTableBuild :: host: " + $(location).attr("host"));
	console.log("dataTableBuild :: pathname: " + $(location).attr("pathname"));
	console.log("dataTableBuild :: search: " + $(location).attr("search"));
	console.log("dataTableBuild :: hostname: " + $(location).attr("hostname"));
	console.log("dataTableBuild :: port: " + $(location).attr("port"));

	var tempDataTable = $(jQueryElementID).DataTable({
		ajax: {
			url: ajaxUrl,
			dataSrc: 'result'
		},
		destroy: true,
		processing: true,
		responsive: false,
		columns: columnList,
		rowsGroup: rowsGroupList,
		columnDefs: columnDefList,
		select: selectList,
		order: orderList,
		buttons: buttonList,
		drawCallback: function() {
			console.log("dataTableBuild :: drawCallback");
			if ($.isFunction(dataTableCallBack )) {
				dataTableCallBack();
			}
		}
	});

	$(jQueryElementID + " tbody").on("click", "tr", function () {

		if ($(this).hasClass("selected")) {
			$(this).removeClass("selected");
		} else {
			tempDataTable.$("tr.selected").removeClass("selected");
			$(this).addClass("selected");
		}

		var selectedData = tempDataTable.row(this).data();
		selectedData.selectedIndex = $(this).closest('tr').index();

		var info = tempDataTable.page.info();
		console.log( 'Showing page: '+info.page+' of '+info.pages );
		selectedData.selectedPage = info.page;

		dataTableClick(selectedData);
	});

	// ----- 데이터 테이블 빌드 이후 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$(".dataTables_length").find("select:eq(0)").addClass("darkBack");
	$(".dataTables_length").find("select:eq(0)").css("min-height", "30px");
	//min-height: 30px;

	// ----- 데이터 테이블 빌드 이후 별도 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$("body").find("[aria-controls='" + jQueryElementStr + "']").css("width", "100px");
	$("select[name=" + jQueryElementStr + "]").css("width", "50px");

	return tempDataTable;
}
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(selectedData) {
	console.log(selectedData);
}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(){

}
//
// // make review list
// var makeReviewList = function (data) {
// 	var reviewList = document.getElementById("review-list");
// 	var list = "<thead>"+
// 		"<tr>"+
// 		"<th>ID</th>"+
// 		"<th>제품(서비스)</th>"+
// 		"<th>리뷰 요청자</th>"+
// 		"<th>리뷰어</th>"+
// 		"<th>리뷰 제목</th>"+
// 		"<th>리뷰 상태</th>"+
// 		"<th>리뷰 일자</th>"+
// 		"</tr>"+
// 		"</thead>";
// 	data.forEach(
// 		(item) =>
// 			(list += `
// 		<tr data-id="${item.c_id}">
// 		<td class="tiny-column"><i class="fa fa-star"></i></td>
// 		<td class="c_review_pdservice_name">${item.c_review_pdservice_name}</td>
// 		<td class="c_review_sender">${item.c_review_sender}</td>
// 		<td class="c_review_responder">${item.c_review_responder}</td>
// 		<td>${item.c_review_req_name}</td>
// 		<td class="c_review_result_state">${item.c_review_result_state}</td>
// 		<td class="c_review_creat_date">${dateFormat(item.c_review_creat_date)}</td>
// 		</tr>
// 	`)
// 	);
//
// 	dataSet = data;
// 	reviewList.innerHTML = list;
// };
//
// var makeEmptyList = function () {
// 	var reviewList = document.getElementById("review-list");
// 	var list = "<thead>"+
// 		"<tr>"+
// 		"<th>ID</th>"+
// 		"<th>제품(서비스)</th>"+
// 		"<th>리뷰 요청자</th>"+
// 		"<th>리뷰어</th>"+
// 		"<th>리뷰 제목</th>"+
// 		"<th>리뷰 상태</th>"+
// 		"<th>리뷰 일자</th>"+
// 		"</tr>"+
// 		"</thead>"+
// 		"<tr>"+
// 		"<td class='empty'>"+
// 		"<i class='fa fa-star'></i>"+
// 		"데이터가 없습니다."+
// 		"</td>"+
// 		"</tr>";
// 	reviewList.innerHTML = list;
// };
//
// // --- 사이드 메뉴 -- //
// $(function () {
// 	setSideMenu(
// 		"sidebar_menu_requirement",
// 		"sidebar_menu_requirement_review",
// 		"requirement-elements-collapse"
// 	);
//
// 	getJsonForPrototype("./js/reviewClassify.json", makeClassifyMenus);
//
//
// 	$.ajax({
// 		url: "/auth-user/api/arms/reqReview/getMonitor_Without_Root.do",
// 		data: {
// 			reviewer: "admin",
// 			filter: "All",
// 		},
// 		type: "GET",
// 		progress: true
// 	}).done(function(data) {
//
// 		// for(var key in data){
// 		// 		// 	var value = data[key];
// 		// 		// 	console.log(key + "=" + value);
// 		// 		// }
// 		// 		//
// 		// 		// var loopCount = 3;
// 		// 		// for (var i = 0; i < loopCount ; i++) {
// 		// 		// 	console.log( "loop check i = " + i );
// 		// 		// }
// 		makeReviewList(data.result);
//
// 	}).fail(function(e) {
// 	}).always(function() {
// 	});
//
//
//
//
// 	//getJsonForPrototype("/auth-user/api/arms/reqReview/getMonitor_Without_Root.do?searchReviewer=admin", makeReviewList);
// });
//
// // reviwe click
// $("#review-list").click(function (ev) {
// 	var row = ev.target.parentNode.dataset;
// 	location.href = `reqReviewDetail.html?id=${row.id}`;
// });
//
// // side menu click
// $("#review-classify").click(async function (ev) {
// 	var li = ev.target.parentNode;
// 	for (var item of ev.currentTarget.children) {
// 		item.classList.remove("active");
// 	}
//
// 	li.classList.add("active");
//
// 	// 서버에서 필터 될 때 사용
// 	// getJsonForPrototype("./js/reviewList.json", makeReviewList);
//
// 	$.ajax({
// 		url: "/auth-user/api/arms/reqReview/getMonitor_Without_Root.do",
// 		data: {
// 			reviewer: "admin",
// 			filter: li.dataset.c_review_result_state,
// 		},
// 		type: "GET",
// 		progress: true
// 	}).done(function(data) {
//
// 		// for(var key in data){
// 		// 		// 	var value = data[key];
// 		// 		// 	console.log(key + "=" + value);
// 		// 		// }
// 		// 		//
// 		// 		// var loopCount = 3;
// 		// 		// for (var i = 0; i < loopCount ; i++) {
// 		// 		// 	console.log( "loop check i = " + i );
// 		// 		// }
// 		if(data.message == undefined){
// 			makeReviewList(data.result);
// 		}else{
// 			makeEmptyList();
// 		}
//
// 	}).fail(function(e) {
// 	}).always(function() {
// 	});
// });
//
