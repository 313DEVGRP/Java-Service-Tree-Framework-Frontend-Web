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

	// DatePicker 처리 부분 ( 팝업 레이어 )
	$(".date-picker").datepicker({
		autoclose: true
	});

	// --- 에디터 설정 --- //
	CKEDITOR.replace("input_pdservice_editor");
	CKEDITOR.replace("extend_modal_editor");

	$("#input_pdservice_start_date").datetimepicker({
		allowTimes: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
	});

	$("#input_pdservice_end_date").datetimepicker({
		allowTimes: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
	});

	$("#btn_enabled_date").datetimepicker({
		allowTimes: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
	});

	$("#btn_end_date").datetimepicker({
		allowTimes: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
	});

	// --- 데이터 테이블 설정 --- //
	dataTableLoad();
}

////////////////////////////////////////////////////////////////////////////////////////
// --- 데이터 테이블 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function dataTableLoad() {
	// 데이터 테이블 컬럼 및 열그룹 구성
	var columnList = [
		{ name: "c_id", title: "제품(서비스) 아이디", data: "c_id", visible: false },
		{
			name: "c_title",
			title: "제품(서비스) 이름",
			data: "c_title",
			render: function (data, type, row, meta) {
				if (type === "display") {
					return '<label style="color: #a4c6ff">' + data + "</label>";
				}

				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];
	var rowsGroupList = [];
	var columnDefList = [];
	var selectList = {};
	var orderList = [[1, "asc"]];
	var buttonList = [];

	var jquerySelector = "#pdservice_table";
	var ajaxUrl = "/auth-user/api/arms/pdService/getPdServiceMonitor.do";
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

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
	$("#version_contents").html("");

	selectId = selectedData.c_id;
	selectName = selectedData.c_title;
	console.log("selectedData.c_id : ", selectedData.c_id);

	dataLoad(selectedData.c_id, selectedData.c_title);
}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(settings, json) {}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();
}

// --- 팝업 띄울때 사이즈 조정 -- //

function modalPopup(popupName) {
	if (popupName === "modal_popup_id") {
		// modalPopupId = 신규버전 등록하기
		$("#modal_title").text("제품(서비스) 신규 버전 등록 팝업");
		$("#modal_sub").text("선택한 제품(서비스)에 버전을 등록합니다.");
		$("#extendupdate_pdservice_version").attr("onClick", "modalPopupNewUpdate()");
		$("#extendupdate_pdservice_version").text("Save");

		$("#tooltip_enabled_service_version").val("");
		$("#btn_enabled_date").val("");
		$("#btn_end_date").val("");
		CKEDITOR.instances.extend_modal_editor.setData("");
	} else {
		// 편집하기 버튼의 팝업으로 보기
		$("#modal_title").text("제품(서비스) 버전 등록 / 변경");
		$("#modal_sub").text("선택한 제품(서비스)에 버전을 등록/변경 합니다.");
		$("#extendupdate_pdservice_version").attr("onClick", "modalPopupUpdate()");
		$("#extendupdate_pdservice_version").text("Save Changes");

		//팝업 데이터
		$("#tooltip_enabled_service_version").val($("#input_pdservice_version").val());
		$("#btn_enabled_date").val($("#input_pdservice_start_date").val());
		$("#btn_end_date").val($("#input_pdservice_end_date").val());
		var editorData = CKEDITOR.instances["input_pdservice_editor"].getData();
		CKEDITOR.instances.extend_modal_editor.setData(editorData);
	}

	var height = $(document).height() - 800;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");
}

// 버전 삭제 버튼
$("#del_version").click(function () {
	console.log("delete btn");
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/removeNode.do",
		type: "DELETE",
		data: {
			c_id: selectVersion
		},
		statusCode: {
			200: function () {
				console.log("성공!");
				//모달 팝업 끝내고
				$("#close_version").trigger("click");
				//버전 데이터 재 로드
				dataLoad(selectId, selectName);
			}
		}
	});
});

// 버전 업데이트 저장 버튼
$("#version_update").click(function () {
	console.log("update btn");
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/updateNode.do",
		type: "put",
		data: {
			c_id: selectVersion,
			c_title: $("#input_pdservice_version").val(),
			c_contents: CKEDITOR.instances.input_pdservice_editor.getData(),
			c_start_date: $("#input_pdservice_start_date").val(),
			c_end_date: $("#input_pdservice_end_date").val()
		},
		statusCode: {
			200: function () {
				console.log("성공!");
				jSuccess("데이터가 변경되었습니다.");
				//모달 팝업 끝내고
				$("#close_version").trigger("click");
				//버전 데이터 재 로드
				dataLoad(selectId, selectName);
			}
		}
	});
});

//버전 팝업 신규 업데이트
function modalPopupNewUpdate() {
	console.log("save btn");

	var send_data = {
		c_id: selectId,
		pdServiceVersionEntities: [
			{
				ref:2,
				c_type: 'default',
				c_title: $("#tooltip_enabled_service_version").val(),
				c_contents: CKEDITOR.instances.extend_modal_editor.getData(),
				c_start_date: $("#btn_enabled_date").val(),
				c_end_date: $("#btn_end_date").val()
			}
		]
	};

	$.ajax({
		url: "/auth-user/api/arms/pdService/addVersionToNode.do",
		type: "POST",
		contentType : 'application/json; charset=utf-8',
		data: JSON.stringify(send_data),
		statusCode: {
			200: function () {
				//모달 팝업 끝내고
				jSuccess("데이터가 저장되었습니다.");
				$("#close_version").trigger("click");
				//버전 데이터 재 로드
				dataLoad(selectId, selectName);
			}
		}
	});
}

// 버전 팝업 수정 업데이트
function modalPopupUpdate() {
	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/updateNode.do",
		type: "put",
		data: {
			c_id: selectVersion,
			c_title: $("#tooltip_enabled_service_version").val(),
			c_contents: CKEDITOR.instances.extend_modal_editor.getData(),
			c_start_date: $("#btn_enabled_date").val(),
			c_end_date: $("#btn_end_date").val()
		},
		statusCode: {
			200: function () {
				console.log("성공!");
				jSuccess("데이터가 변경되었습니다.");
				//모달 팝업 끝내고
				$("#close_version").trigger("click");
				//버전 데이터 재 로드
				dataLoad(selectId, selectName);
			}
		}
	});
}

//버전 리스트를 재로드하는 함수 ( 버전 추가, 갱신, 삭제 시 호출 )
function dataLoad(getSelectedText, selectedText) {
	// ajax 처리 후 에디터 바인딩.
	console.log("dataLoad :: getSelectedID → " + getSelectedText);
	$.ajax("/auth-user/api/arms/pdService/getNode.do?c_id=" + getSelectedText).done(function (json) {
		console.log("dataLoad :: success → ", json);
		$("#version_accordion").jsonMenu("set", json.pdServiceVersionEntities, { speed: 5000 });
		//version text setting

		var selectedHtml =
			`<div class="chat-message">
			<div class="chat-message-body" style="margin-left: 0px !important;">
				<span class="arrow"></span>
				<div class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 제품(서비스) : </div>
			<div class="text" style="color: #a4c6ff;">
			` +
			selectedText +
			`
			</div>
			</div>
			</div>
			<div class="gradient_bottom_border" style="width: 100%; height: 2px; padding-top: 10px;"></div>`;

		$(".list-group-item").html(selectedHtml);
		$("#tooltip_enabled_service_name").val(selectedText);

		if( !isEmpty(json.pdServiceVersionEntities) ){
			// 상세보기
			selectVersion = json.pdServiceVersionEntities[0].c_id;
			$("#pdservice_name").val(selectedText);
			$("#pdservice_version").val(json.pdServiceVersionEntities[0].c_title);

			$("#version_start_date").val(json.pdServiceVersionEntities[0].c_start_date);
			$("#version_end_date").val(json.pdServiceVersionEntities[0].c_end_date);

			$("#version_contents").html(json.pdServiceVersionEntities[0].c_contents);

			// 상세보기 편집하기
			$("#input_pdservice_name").val(selectedText);
			$("#input_pdservice_version").val(json.pdServiceVersionEntities[0].c_title);

			$("#input_pdservice_start_date").datetimepicker({ value: json.pdServiceVersionEntities[0].c_start_date + " 09:00", step: 10 });
			$("#input_pdservice_end_date").datetimepicker({ value: json.pdServiceVersionEntities[0].c_end_date + " 18:00", step: 10 });
			CKEDITOR.instances.input_pdservice_editor.setData(json.pdServiceVersionEntities[0].c_contents);

			//편집하기 팝업
			$("#tooltip_enabled_service_name").val(selectedText);
			$("#tooltip_enabled_service_version").val(json.pdServiceVersionEntities[0].c_title);
			$("#btn_enabled_date").datetimepicker({ value: json.pdServiceVersionEntities[0].c_start_date + " 09:00", step: 10 });
			$("#btn_end_date").datetimepicker({ value: json.pdServiceVersionEntities[0].c_end_date + " 18:00", step: 10 });
			CKEDITOR.instances.extend_modal_editor.setData(json.pdServiceVersionEntities[0].c_contents);
		}
	});
}

// versionlist 이니셜라이즈
(function ($) {
	var menu;
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

	var data = `
			   <li class='list-group-item json-menu-header' style="padding: 0px;">
				   <strong>product service name</strong>
			   </li>
			   <button type="button"
														class="btn btn-primary btn-block"
														id="modal_popup_id"
														data-toggle="modal"
														data-target="#my_modal2"
														style="margin-bottom: 10px !important; margin-top: 10px;"
														onClick="modalPopup('modal_popup_id')">
							신규 버전 등록하기
						</button>
						<div class="gradient_bottom_border" style="width: 100%; height: 2px; margin-bottom: 10px;"></div>`;

	for (var i = 0; i < menu.length; i++) {
		if (i == 0) {
			data += `
			   <div class="panel">
				   <div class="panel-heading">
					   <a class="accordion-toggle collapsed"
					   			data-toggle="collapse"
					   			name="versionLink_List"
					   			style="color: #a4c6ff; text-decoration: none; cursor: pointer; background: rgba(229, 96, 59, 0.20);"
					   			onclick="versionClick(this, ${menu[i].c_id});
					   			return false;">
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
					   			onclick="versionClick(this, ${menu[i].c_id});
					   			return false;">
						   ${menu[i].c_title}
					   </a>
				   </div>
			   </div>`;
		}
	}

	main.html(data);
}

//버전 클릭할 때 동작하는 함수
//1. 상세보기 데이터 바인딩
//2. 편집하기 데이터 바인딩
function versionClick(element, c_id) {
	$("a[name='versionLink_List']").each(function () {
		this.style.background = "";
	});
	element.style.background = "rgba(229, 96, 59, 0.20)";
	console.log(element);

	selectVersion = c_id;

	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
		data: { c_id: c_id }, // HTTP 요청과 함께 서버로 보낼 데이터
		method: "GET", // HTTP 요청 메소드(GET, POST 등)
		dataType: "json" // 서버에서 보내줄 데이터의 타입
	})
		// HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
		.done(function (json) {
			console.log(" → " + json.c_contents);

			$("#pdservice_name").text($("#pdservice_table").DataTable().rows(".selected").data()[0].c_title);

			$("#pdservice_version").val(json.c_title);
			$("#version_start_date").val(json.c_start_date);
			$("#version_end_date").val(json.c_end_date);
			$("#version_contents").html(json.c_contents);

			$("#input_pdservice_name").val($("#pdservice_table").DataTable().rows(".selected").data()[0].c_title);
			$("#input_pdservice_version").val(json.c_title);
			$("#input_pdservice_start_date").val(json.c_start_date);
			$("#input_pdservice_end_date").val(json.c_end_date);
			CKEDITOR.instances.input_pdservice_editor.setData(json.c_contents);

			$("#input_pdservice_start_date").datetimepicker({ value: json.c_start_date + " 09:00", step: 10 });
			$("#input_pdservice_end_date").datetimepicker({ value: json.c_end_date + " 18:00", step: 10 });
			$("#btn_enabled_date").datetimepicker({ value: json.c_start_date + " 09:00", step: 10 });
			$("#btn_end_date").datetimepicker({ value: json.c_end_date + " 18:00", step: 10 });
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
