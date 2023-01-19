////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;

function execDocReady() {

	//좌측 메뉴
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_review",
		"requirement-elements-collapse"
	);

	getJsonForPrototype("./mock/reviewClassify.json", makeClassifyMenus);

	var externalData = "";
	var jquerySelectorID = "#reqReviewTable";
	var ajaxUrl = "/auth-user/api/arms/reqReview/getMonitor_Without_Root.do?reviewer=" + userName + "&filter=All";
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
		{ name: "c_review_req_link",
			title: "요구사항 아이디",
			data: "c_review_req_link",
			visible: false
		},
		{ name: "c_review_req_name",
			title: "요구사항",
			data: "c_review_req_name",
			visible: true
		},
		{ name: "c_review_sender",
			title: "리뷰 요청인",
			data: "c_review_sender",
			visible: true
		},
		{ name: "c_review_responder",
			title: "리뷰 응답인",
			data: "c_review_responder",
			visible: true
		},
		{ name: "c_review_result_state",
			title: "리뷰 상태",
			data: "c_review_result_state",
			visible: true
		},
		{ name: "c_review_creat_date",
			title: "리뷰 생성일",
			data: "c_review_creat_date",
			visible: true
		},

	];
	var rowsGroupList = [];
	var columnDefList = [];
	var selectList = {};
	var buttonList = [];
	reqStatusDataTable = common_dataTableLoad(externalData, jquerySelectorID, ajaxUrl, columnList, rowsGroupList, columnDefList, selectList, buttonList);

}

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
		serverSide: true,
		destroy: true,
		processing: true,
		responsive: false,
		columns: columnList,
		rowsGroup: rowsGroupList,
		columnDefs: columnDefList,
		select: selectList,
		order: orderList,
		buttons: buttonList,
		language: {
			processing: '<img src="./img/earth.gif" height="90px" width="90px"> '
		},
		initComplete: function(settings, json) {
			console.log("dataTableBuild :: drawCallback");
			if ($.isFunction(dataTableCallBack )) {
				dataTableCallBack(settings, json);
			}
		},
		fnInitComplete: function(oSettings, json) {
					if(json.message == undefined){
						console.log("정상");
					}else{
						console.log("비정상");
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

	$("select[name=" + jQueryElementStr + "_length] option").css("background", "#41434A");
	$("select[name=" + jQueryElementStr + "_length]").css("border", "1px solid blue");

	$.fn.dataTable.ext.errMode = function ( settings, helpPage, message ) {
		console.log(message);
		jError("Notification : <strong>Ajax Error</strong>, Complete !");
	};

	return tempDataTable;
}


// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(selectedData) {
	console.log("selectedData.c_review_pdservice_link = " + selectedData.c_review_pdservice_link);
	console.log("selectedData.c_review_req_link = " + selectedData.c_review_req_link);
	console.log("selectedData.c_id = " + selectedData.c_id);
	location.href = "reqReviewDetail.html?c_id=" + selectedData.c_id + "&c_review_pdservice_link=" + selectedData.c_review_pdservice_link + "&c_review_req_link=" + selectedData.c_review_req_link;
}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(settings, json){

}


// side menu click
$("#review-classify").click(async function (ev) {
	var li = ev.target.parentNode;
	for (var item of ev.currentTarget.children) {
		item.classList.remove("active");
	}

	li.classList.add("active");


	$('#reqReviewTable').dataTable().empty();
	var externalData = "";
	var jquerySelectorID = "#reqReviewTable";
	var ajaxUrl = "/auth-user/api/arms/reqReview/getMonitor_Without_Root.do?reviewer=" + userName + "&filter=" + li.dataset.c_review_result_state;
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
		{ name: "c_review_req_link",
			title: "요구사항 아이디",
			data: "c_review_req_link",
			visible: false
		},
		{ name: "c_review_req_name",
			title: "요구사항",
			data: "c_review_req_name",
			visible: true
		},
		{ name: "c_review_sender",
			title: "리뷰 요청인",
			data: "c_review_sender",
			visible: true
		},
		{ name: "c_review_responder",
			title: "리뷰 응답인",
			data: "c_review_responder",
			visible: true
		},
		{ name: "c_review_result_state",
			title: "리뷰 상태",
			data: "c_review_result_state",
			visible: true
		},
		{ name: "c_review_creat_date",
			title: "리뷰 생성일",
			data: "c_review_creat_date",
			visible: true
		},

	];
	var rowsGroupList = [];
	var columnDefList = [];
	var selectList = {};
	var buttonList = [];
	reqStatusDataTable = common_dataTableLoad(externalData, jquerySelectorID, ajaxUrl, columnList, rowsGroupList, columnDefList, selectList, buttonList);


});