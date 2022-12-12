////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedJsTreeId; // 요구사항 아이디
var reqStatusDataTable;

$(function () {

	//좌측 메뉴
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_status",
		"requirement-elements-collapse"
	);

	//제품(서비스) 셀렉트 박스 이니시에이터
	makePdServiceSelectBox();
	//버전 멀티 셀렉트 박스 이니시에이터
	makeVersionMultiSelectBox();

});

////////////////////////////////////////////////////////////////////////////////////////
//제품 서비스 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makePdServiceSelectBox(){
	//제품 서비스 셀렉트 박스 이니시에이터
	$(".chzn-select").each(function(){
		$(this).select2($(this).data());
	});

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/pdService/getPdServiceMonitor.do",
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType : "json",
		progress: true
	}).done(function(data) {

		for(var k in data){
			var obj = data[k];
			var newOption = new Option(obj.c_title, obj.c_id, false, false);
			$('#country').append(newOption).trigger('change');
		}
	}).fail(function(e) {
	}).always(function() {
	});

} // end makePdServiceSelectBox()

$('#country').on("select2:open", function () {
	//슬림스크롤
	makeSlimScroll(".select2-results__options");
});

// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
$('#country').on('select2:select', function (e) {
	// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
	// 디폴트는 base version 을 선택하게 하고 ( select all )
//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
	bind_VersionData_By_PdService();

	common_dataTableLoad($('#country').val());

});



////////////////////////////////////////////////////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makeVersionMultiSelectBox(){
	//버전 선택 셀렉트 박스 이니시에이터
	$('.multiple-select').multipleSelect();
}

function bind_VersionData_By_PdService(){
	$(".multiple-select option").remove();
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/getVersion.do?c_id=" + $('#country').val(),
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType : "json",
		progress: true
	}).done(function(data) {

		for(var k in data){
			var obj = data[k];
			var $opt = $('<option />', {
				value: obj.c_id,
				text: obj.c_title,
			})

			//$('#multiVersion').append($opt);
			//$('#editMultiVersion').append($opt);
			$('.multiple-select').append($opt);
		}

		if(data.length > 0){
			console.log("display 재설정.");
		}
		//$('#multiVersion').multipleSelect('refresh');
		//$('#editMultiVersion').multipleSelect('refresh');
		$('.multiple-select').multipleSelect('refresh');

	}).fail(function(e) {
	}).always(function() {
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//슬림스크롤
////////////////////////////////////////////////////////////////////////////////////////
function  makeSlimScroll(targetElement) {
	$(targetElement).slimScroll({
		height: '200px',
		railVisible: true,
		railColor: '#222',
		railOpacity: 0.3,
		wheelStep: 10,
		allowPageScroll: false,
		disableFadeOut: false
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //
function common_dataTableLoad(selectId) {

	var jQueryElementID = "#reqStatusTable";
	var reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
	var jQueryElementStr = jQueryElementID.replace(reg,'');
	console.log("jQueryElementStr ======== " + jQueryElementStr );
	var serviceNameForURL = "reqStatus";
	var endPointUrl = "/T_ARMS_REQSTATUS_" + selectId + "/getStatusMonitor.do";
	// 데이터 테이블 컬럼 및 열그룹 구성
	var columnList = [
		{ name: "c_pdservice_link",
				title: "제품(서비스) 아이디",
				data: "c_pdservice_link",
			 visible: false
		},
		{ name: "c_pdservice_name",
			title: "제품(서비스)",
			data: "c_pdservice_name",
			visible: true
		},

		{ name: "c_version_link",
			title: "제품(서비스) 버전 아이디",
			data: "c_version_link",
			visible: false
		},
		{ name: "c_version_name",
			title: "Version",
			data: "c_version_name",
			visible: true
		},

		{ name: "c_jira_project_link",
			title: "지라 프로젝트 아이디",
			data: "c_jira_project_link",
			visible: false
		},
		{
			name: "c_jira_project_name",
			title: "JIRA Project",
			data:   "c_jira_project_name",
			render: function (data, type, row, meta) {
				if (type === 'display') {
					var link = 'http://www.313.co.kr/jira/browse/';
					return '<a href="' + link + row.c_jira_project_key + '" target="_blank">' + data + '</a>';
				}

				return data;
			},
			className: "dt-body-center",
			visible: true
		},

		{ name: "c_jira_version_link",
			title: "지라 프로젝트 버전 아이디",
			data: "c_jira_version_link",
			visible: false
		},
		{ name: "c_jira_version_name",
			title: "JIRA Version",
			data: "c_jira_version_name",
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
		},

		{
			name: "c_jira_req_issue_key",
			title: "JIRA 이슈",
			data:   "c_jira_req_issue_key",
			render: function (data, type, row, meta) {
				if (type === 'display') {
					var link = 'http://www.313.co.kr/jira/browse/';
					return '<a href="' + link + row.c_jira_req_issue_key + '" target="_blank">' + data + '</a>';
				}

				return data;
			},
			className: "dt-body-center",
			visible: true
		},
		{ name: "c_jira_req_issue_id",
			title: "JIRA 이슈 아이디",
			data: "c_jira_req_issue_id",
			visible: false
		},

		{
			name: "c_jira_req_issue_id",
			title: "SubTask",
			data:   "c_jira_req_subtaskissue",
			render: function ( data, type, row ) {
				if ( isEmpty(data) || data == "[]" ) {
					return 'no data';
				}else{
					//data-target="#myModal1" data-toggle="modal"
					return '<label id="newReqRegist01" class="btn btn-success btn-sm" data-target="#myModal1" data-toggle="modal">SubTask</label>';
				}
			},
			className: "dt-body-center",
			visible: true
		},
		{
			name: "c_jira_req_linkingissue",
			title: "SubTask",
			data:   "c_jira_req_linkingissue",
			render: function ( data, type, row ) {
				if ( isEmpty(data) || data == "[]" ) {
					return 'no data';
				}else{
					//data-target="#myModal1" data-toggle="modal"
					return '<label id="newReqRegist01" class="btn btn-primary btn-sm" data-target="#myModal1" data-toggle="modal">LinkIssue</label>';
				}
			},
			className: "dt-body-center",
			visible: true
		},

	];
	var rowsGroupList = [
		"c_pdservice_name:name",
		"c_version_name:name",
		"c_jira_project_name:name",
		"c_jira_version_name:name"
	];
	var columnDefList = [];
	var selectList = {};
	var orderList = [[ 1, 'asc' ]];
	console.log("defaultType_dataTableLoad selectId -> " + selectId);
	console.log("dataTableBuild :: jQueryElementID -> " + jQueryElementID + ", serviceNameForURL -> " + serviceNameForURL);
	console.log("dataTableBuild :: columnList -> " + columnList + ", rowsGroupList -> " + rowsGroupList);

	console.log("dataTableBuild :: href: " + $(location).attr("href"));
	console.log("dataTableBuild :: protocol: " + $(location).attr("protocol"));
	console.log("dataTableBuild :: host: " + $(location).attr("host"));
	console.log("dataTableBuild :: pathname: " + $(location).attr("pathname"));
	console.log("dataTableBuild :: search: " + $(location).attr("search"));
	console.log("dataTableBuild :: hostname: " + $(location).attr("hostname"));
	console.log("dataTableBuild :: port: " + $(location).attr("port"));

	var authCheckURL = "/auth-user";

	var tempDataTable = $(jQueryElementID).DataTable({
		ajax: {
			url: authCheckURL + "/api/arms/" + serviceNameForURL + endPointUrl,
			dataSrc: ''
		},
		destroy: true,
		processing: true,
		responsive: false,
		columns: columnList,
		rowsGroup: rowsGroupList,
		columnDefs: columnDefList,
		select: selectList,
		order: orderList,
		buttons: [
			'copy', 'csv', 'excel', 'pdf', 'print'
		],
		drawCallback: function() {
			console.log("dataTableBuild :: drawCallback");
			if ($.isFunction(dataTableCallBack )) {
				dataTableCallBack();
			}
		}
	});

	reqStatusDataTable = tempDataTable;

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

$("#copychecker").on("click", function() {
	reqStatusDataTable.button( '.buttons-copy' ).trigger();
});
$("#printchecker").on("click", function() {
	reqStatusDataTable.button( '.buttons-print' ).trigger();
});
$("#csvchecker").on("click", function() {
	reqStatusDataTable.button( '.buttons-csv' ).trigger();
});
$("#excelchecker").on("click", function() {
	reqStatusDataTable.button( '.buttons-excel' ).trigger();
});
$("#pdfchecker").on("click", function() {
	reqStatusDataTable.button( '.buttons-pdf' ).trigger();
});