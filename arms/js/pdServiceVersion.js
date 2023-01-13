////////////////////////////////////////////////////////////////////////////////////////
//Page 전역 변수
////////////////////////////////////////////////////////////////////////////////////////
var selectId; // 제품 아이디
var selectName; // 제품 이름
var selectedIndex; // 데이터테이블 선택한 인덱스
var selectedPage; // 데이터테이블 선택한 인덱스
var selectVersion; // 선택한 버전 아이디
var dataTableRef; // 데이터테이블 참조 변수


////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {

	//사이드 메뉴 처리
	setSideMenu("sidebar_menu_product", "sidebar_menu_version_manage");

	// DataPicker 처리 부분 ( 팝업 레이어 )
	$(".date-picker").datepicker({
		autoclose: true,
	});

	// --- 에디터 설정 --- //
	CKEDITOR.replace("input_pdservice_editor");
	CKEDITOR.replace("extendModalEditor");

	makeDatePicker($("#btn-select-calendar"));
	makeDatePicker($("#btn-end-calendar"));
	makeDatePicker($("#btn-select-calendar-popup"));
	makeDatePicker($("#btn-end-calendar-popup"));

	// --- 데이터 테이블 설정 --- //
	dataTableLoad();

}

////////////////////////////////////////////////////////////////////////////////////////
// --- 데이터 테이블 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function dataTableLoad() {
	// 데이터 테이블 컬럼 및 열그룹 구성
	var columnList = [
		{ name: "c_id",
			title: "제품(서비스) 아이디",
			data: "c_id",
			visible: false
		},
		{
			name: "c_title",
			title: "제품(서비스) 이름",
			data:   "c_title",
			render: function (data, type, row, meta) {
				if (type === 'display') {
					return '<label style="color: #f8f8f8">' + data + '</label>';
				}

				return data;
			},
			className: "dt-body-left",
			visible: true
		},
	];
	var rowsGroupList = [];
	var columnDefList = [];
	var selectList = {};
	var orderList = [[ 1, 'asc' ]];
	var buttonList = [];

	var jquerySelector = "#pdserviceTable";
	var ajaxUrl = "/auth-user/api/arms/pdService/getPdServiceMonitor.do";
	var jsonRoot = "";

	dataTableRef = dataTable_build(jquerySelector, ajaxUrl, jsonRoot, columnList, rowsGroupList, columnDefList, selectList, orderList, buttonList);
}

//datepicker 만들기
function makeDatePicker (calender) {

	var Inputs = $(calender).parent().prev().val();
	$(calender).attr('data-date', Inputs)

	calender
		.datepicker({
			autoclose: true,
		})
		.datepicker("update", Inputs)
		.on("changeDate", function (ev) {
			var Input = $(this).parent().next();
			Input.val(calender.data("date"));
			if (Input.attr("id") === "input_pdservice_start_date") {
				$("#versionStartDate").text(calender.data("date"));
			} else if (Input.attr("id") === "input_pdservice_end_date") {
				$("#versionEndDate").text(calender.data("date"));
			}
			calender.datepicker("hide");
		});
};


// --- 팝업 띄울때 사이즈 조정 -- //

function modalPopup(popupName) {

	if (popupName === 'modalPopupId') {
		// modalPopupId = 신규버전 등록하기
		$("#modalTitle").text('제품(서비스) 신규 버전 등록 팝업');
		$("#modalSub").text('선택한 제품(서비스)에 버전을 등록합니다.');
		$('#extendUpdate-pdService-version').attr('onClick', 'modalPopupNewUpdate()')
		$('#extendUpdate-pdService-version').text('Save');


		$("#tooltip-enabled-service-version").val('');
		$("#btn-enabled-date").val('');
		$("#btn-end-date").val('');
		CKEDITOR.instances["extendModalEditor"].setData('');

	} else {
		// 편집하기 버튼의 팝업으로 보기
		$("#modalTitle").text('제품(서비스) 버전 등록 / 변경');
		$("#modalSub").text('선택한 제품(서비스)에 버전을 등록/변경 합니다.');
		$('#extendUpdate-pdService-version').attr('onClick', 'modalPopupUpdate()')
		$('#extendUpdate-pdService-version').text('Save Changes');

		//팝업 데이터
		$("#tooltip-enabled-service-version").val($("#input_pdserviceVersion").val());
		$("#btn-enabled-date").val($("#input_pdservice_start_date").val());
		$("#btn-end-date").val($("#input_pdservice_end_date").val());
		var editorData = CKEDITOR.instances["input_pdservice_editor"].getData();
		console.log('ddd', editorData)
		CKEDITOR.instances.extendModalEditor.setData(editorData);
	}

	var height = $(document).height() - 800;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");
}

// 신규버전 등록 팝업
// $("#modalPopupId").click(function () {
// 	$("#modalTitle").text('제품(서비스) 신규 버전 등록 팝업');
// 	$("#modalSub").text('선택한 제품(서비스)에 버전을 등록합니다.');

// 	var height = $(document).height() - 800;
// 	$(".modal-body")
// 		.find(".cke_contents:eq(0)")
// 		.css("height", height + "px");
// });


// 편집하기 팝업창으로 보기 팝업
// $("#versionPopup").click(function () {

// 	var height = $(document).height() - 800;
// 	console.log('height', height)
// 	$(".modal-body")
// 		.find(".cke_contents:eq(0)")
// 		.css("height", height + "px");
// });




// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(selectedData) {

	$("#versionContents").html("");
	selectId = selectedData.c_id;
	selectName = selectedData.c_title;
	console.log('selectedData.c_id : ', selectedData.c_id);
	dataLoad(selectedData.c_id, selectedData.c_title);
}


// 버전 삭제 버튼
$("#delVersion").click(function () {
	console.log("delete btn");
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/removeNode.do",
		type: "POST",
		data: {
			c_id: selectVersion
		},
		statusCode: {
			200: function () {
				console.log("성공!");
				//모달 팝업 끝내고
				$('#close-version').trigger('click');
				//버전 데이터 재 로드
				dataLoad(selectId, selectName);
			},
		},
	});
});

// 버전 업데이트 저장 버튼
$("#versionUpdate").click(function () {
	console.log("update btn");
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/updateVersionNode.do",
		type: "POST",
		data: {
			c_id: selectVersion,
			c_title: $("#input_pdserviceVersion").val(),
			c_contents: CKEDITOR.instances["input_pdservice_editor"].getData(),
			c_start_date: $("#input_pdservice_start_date").val(),
			c_end_date: $("#input_pdservice_end_date").val(),
		},
		statusCode: {
			200: function () {
				console.log("성공!");
				jSuccess("데이터가 변경되었습니다.");
				//모달 팝업 끝내고
				$('#close-version').trigger('click');
				//버전 데이터 재 로드
				dataLoad(selectId, selectName);
			},
		},
	});
});

//버전 팝업 신규 업데이트
function modalPopupNewUpdate() {
	console.log("save btn");
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/addNode.do",
		type: "POST",
		data: {
			ref: 2,
			c_title: $("#tooltip-enabled-service-version").val(),
			c_type: "default",
			c_pdservice_link: $('#pdserviceTable').DataTable().rows('.selected').data()[0].c_id,
			// c_contents: CKEDITOR.instances["modal-editor"].getData(),
			c_contents: CKEDITOR.instances["extendModalEditor"].getData(),
			c_start_date: $("#btn-enabled-date").val(),
			c_end_date: $("#btn-end-date").val(),
		},
		statusCode: {
			200: function () {
				console.log("성공!");
				//모달 팝업 끝내고
				jSuccess("데이터가 저장되었습니다.");
				$('#close-version').trigger('click');
				//버전 데이터 재 로드
				dataLoad(selectId, selectName);
			},
		},
	});

}

// 버전 팝업 수정 업데이트
function modalPopupUpdate() {

	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/updateVersionNode.do",
		type: "POST",
		data: {
			c_id: selectVersion,
			c_title: $("#tooltip-enabled-service-version").val(),
			c_contents: CKEDITOR.instances["extendModalEditor"].getData(),
			c_start_date: $("#btn-enabled-date").val(),
			c_end_date: $("#btn-end-date").val(),
		},
		statusCode: {
			200: function () {
				console.log("성공!");
				jSuccess("데이터가 변경되었습니다.");
				//모달 팝업 끝내고
				$('#close-version').trigger('click');
				//버전 데이터 재 로드
				dataLoad(selectId, selectName);
			},
		},
	});
}



//버전 리스트를 재로드하는 함수 ( 버전 추가, 갱신, 삭제 시 호출 )
function dataLoad(getSelectedText, selectedText) {

	// ajax 처리 후 에디터 바인딩.
	console.log("dataLoad :: getSelectedID -> " + getSelectedText);
	$.ajax("/auth-user/api/arms/pdServiceVersion/getVersion.do?c_id=" + getSelectedText)
		.done(function (json) {
			console.log("dataLoad :: success -> ", json);
			$("#versionAccordion").jsonMenu("set", json, { speed: 5000 });
			//version text setting
			$(".list-group-item").text(selectedText);
			$("#tooltip-enabled-service-name").val(selectedText);

			// 상세보기
			selectVersion = json[0].c_id;
			$("#pdServiceName").text(selectedText);
			$("#pdServiceVersion").text(json[0].c_title);
			$("#versionStartDate").text(json[0].c_start_date);
			$("#versionEndDate").text(json[0].c_end_date);
			$("#versionContents").html(json[0].c_contents);

			// 상세보기 편집하기
			$("#input_pdserviceName").val(selectedText);
			$("#input_pdserviceVersion").val(json[0].c_title);
			$("#input_pdservice_start_date").val(json[0].c_start_date);
			$("#input_pdservice_end_date").val(json[0].c_end_date);
			CKEDITOR.instances.input_pdservice_editor.setData(json[0].c_contents);

			//편집하기 팝업
			$("#tooltip-enabled-service-name").val(selectedText);
			$("#tooltip-enabled-service-version").val(json[0].c_title);
			$("#btn-enabled-date").val(json[0].c_start_date);
			$("#btn-end-date").val(json[0].c_end_date);
			CKEDITOR.instances.extendModalEditor.setData(json[0].c_contents);
		});
}

// versionlist 이니셜라이즈
(function ($) {
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
})(jQuery);

//version list html 삽입
function draw(main, menu) {
	main.html("");

	let data = `
			   <li class='list-group-item json-menu-header'>
				   <strong>product service name</strong>
			   </li>
			   <button
					type="button"
					class="btn btn-primary btn-block"
					id="modalPopupId"
					data-toggle="modal"
					data-target="#myModal2"
					onClick="modalPopup('modalPopupId')"
				>신규 버전 등록하기</button>`;

	for (let i = 0; i < menu.length; i++) {
		data += `
			   <div class="panel">
				   <div class="panel-heading">
					   <a class="accordion-toggle collapsed" data-toggle="collapse" href="" onclick="versionClick(${menu[i].c_id}); return false;">
						   ${menu[i].c_title}
					   </a>
				   </div>
			   </div>`;
	}

	main.html(data);
}

//버전 클릭할 때 동작하는 함수
//1. 상세보기 데이터 바인딩
//2. 편집하기 데이터 바인딩
function versionClick(c_id) {
	selectVersion = c_id;
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
		data: { c_id: c_id }, // HTTP 요청과 함께 서버로 보낼 데이터
		method: "GET", // HTTP 요청 메소드(GET, POST 등)
		dataType: "json", // 서버에서 보내줄 데이터의 타입
	})
		// HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
		.done(function (json) {
			console.log(" -> " + json.c_contents);
			$("#pdServiceName").text($(".list-group-item").text());
			$("#pdServiceVersion").text(json.c_title);
			$("#versionStartDate").text(json.c_start_date);
			$("#versionEndDate").text(json.c_end_date);
			$("#versionContents").html(json.c_contents);

			$("#input_pdserviceName").val($(".list-group-item").text());
			$("#input_pdserviceVersion").val(json.c_title);
			$("#input_pdservice_start_date").val(json.c_start_date);
			$("#input_pdservice_end_date").val(json.c_end_date);
			CKEDITOR.instances.input_pdservice_editor.setData(json.c_contents);

			makeDatePicker($("#btn-select-calendar"));
			makeDatePicker($("#btn-end-calendar"));
			makeDatePicker($("#btn-select-calendar-popup"));
			makeDatePicker($("#btn-end-calendar-popup"));

		})
		// HTTP 요청이 실패하면 오류와 상태에 관한 정보가 fail() 메소드로 전달됨.
		.fail(function (xhr, status, errorThrown) {
			console.log(xhr + status + errorThrown);
		})
		//
		.always(function (xhr, status) {
			$("#text").html("요청이 완료되었습니다!");
			console.log(xhr + status);
		});
}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(){

}