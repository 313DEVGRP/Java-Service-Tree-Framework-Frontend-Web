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
function execDocReady () {

	// 사이드 메뉴 색상 설정
	setSideMenu("sidebar_menu_product", "sidebar_menu_product_manage", "product-elements-collapse");

	// 파일 업로드 관련 레이어 숨김 처리
	$('.body-middle').hide();

	// 데이터 테이블 로드 함수
	dataTableLoad();

	// --- 에디터 설정 --- //
	CKEDITOR.replace("input_pdservice_editor");
	CKEDITOR.replace("extend_modal_editor");
	CKEDITOR.replace("modal_editor");

	$('#popup_editView_pdService_name').tooltip();

	select2_Setting();


}

////////////////////////////////////////////////////////////////////////////////////////
//탭 클릭 이벤트 처리
////////////////////////////////////////////////////////////////////////////////////////
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	var target = $(e.target).attr("href"); // activated tab
	console.log(target);

	if (target == '#dropdown1') {
		$('.body-middle').hide();

		if( isEmpty(selectId) ){
			jError("선택된 제품(서비스)가 없습니다. 오류는 무시됩니다.");
		}else{
			$('#delete_text').text($('#pdservice_table').DataTable().rows('.selected').data()[0].c_title);
		}
	} else {
		if (selectId == undefined) {
			$('.body-middle').hide();
		} else {
			$('.body-middle').show();
		}
	}
});

////////////////////////////////////////////////////////////////////////////////////////
// --- 신규 제품(서비스) 등록 팝업 및 팝업 띄울때 사이즈 조정 -- //
////////////////////////////////////////////////////////////////////////////////////////
$("#modal_popup_id").click(function () {
	var height = $(document).height() - 600;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");
});

$("#extend_modal_popup_id").click(function () {
	var height = $(document).height() - 1000;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");

	// 데이터 셋팅
	var editorData = CKEDITOR.instances["input_pdservice_editor"].getData();
	CKEDITOR.instances.extend_modal_editor.setData(editorData);

	var selectedId = $('#pdservice_table').DataTable().rows('.selected').data()[0].c_id;
	console.log("selectedId →" + selectedId);

	// 제품(서비스) 이름
	$("#extend_editView_pdService_name").val($("#editView_pdService_name").val());

	// 오너
	// clear
	$('#extend_editView_pdService_owner').val(null).trigger('change');

	// 부모 페이지에서 데이터 로드
	var owner = "none";
	if ($('#editView_pdService_owner').select2('data')[0] != undefined) {
		owner = $('#editView_pdService_owner').select2('data')[0].text;
	}

	// Modal 창에 데이터 셋팅
	if (owner == null || owner == "none") {
		console.log("pdServiceDataTableClick :: json.c_owner empty");
	} else {
		var newOption = new Option(owner, owner, true, true);
		$('#extend_editView_pdService_owner').append(newOption).trigger('change');
	}

	// 리뷰어
	//clear
	$('#extend_editView_pdService_reviewers').val(null).trigger('change');

	var reviewer01 = "none";
	var reviewer02 = "none";
	var reviewer03 = "none";
	var reviewer04 = "none";
	var reviewer05 = "none";

	if ($('#editView_pdService_reviewers').select2('data')[0] != undefined) {
		reviewer01 = $('#editView_pdService_reviewers').select2('data')[0].text;
	}
	if ($('#editView_pdService_reviewers').select2('data')[1] != undefined) {
		reviewer02 = $('#editView_pdService_reviewers').select2('data')[1].text;
	}
	if ($('#editView_pdService_reviewers').select2('data')[2] != undefined) {
		reviewer03 = $('#editView_pdService_reviewers').select2('data')[2].text;
	}
	if ($('#editView_pdService_reviewers').select2('data')[3] != undefined) {
		reviewer04 = $('#editView_pdService_reviewers').select2('data')[3].text;
	}
	if ($('#editView_pdService_reviewers').select2('data')[4] != undefined) {
		reviewer05 = $('#editView_pdService_reviewers').select2('data')[4].text;
	}

	var reviewer01Option = new Option(reviewer01, reviewer01, true, true);
	var reviewer02Option = new Option(reviewer02, reviewer02, true, true);
	var reviewer03Option = new Option(reviewer03, reviewer03, true, true);
	var reviewer04Option = new Option(reviewer04, reviewer04, true, true);
	var reviewer05Option = new Option(reviewer05, reviewer05, true, true);

	var multifyValue = 1;
	if (reviewer01 == null || reviewer01 == "none") {
		console.log("extend_modal_popup_id Click :: reviewer01 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend_editView_pdService_reviewers').append(reviewer01Option);
	}
	if (reviewer02 == null || reviewer02 == "none") {
		console.log("extend_modal_popup_id Click :: reviewer02 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend_editView_pdService_reviewers').append(reviewer02Option);
	}
	if (reviewer03 == null || reviewer03 == "none") {
		console.log("extend_modal_popup_id Click :: reviewer03 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend_editView_pdService_reviewers').append(reviewer03Option);
	}
	if (reviewer04 == null || reviewer04 == "none") {
		console.log("extend_modal_popup_id Click :: reviewer04 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend_editView_pdService_reviewers').append(reviewer04Option);
	}
	if (reviewer05 == null || reviewer05 == "none") {
		console.log("extend_modal_popup_id Click :: reviewer05 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend_editView_pdService_reviewers').append(reviewer05Option);
	}

	$('#extend_editView_pdService_reviewers').trigger('change');

	$('#extend_editView_pdService_reviewer').css('height', '20px');
	setTimeout(function () {
		var heightValue = $('#extend_editView_pdService_reviewer').height();
		var resultValue = heightValue + (20 * multifyValue);
		$('#extend_editView_pdService_reviewer').css('height', resultValue + 'px');
	}, 250);

});

////////////////////////////////////////////////////////////////////////////////////////
// --- select2 (사용자 자동완성 검색 ) 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function select2_Setting(){

	$(".js-data-example-ajax").select2({
		maximumSelectionLength: 5,
		width: 'resolve',
		ajax: {
			url: function (params) {
				return '/auth-check/getUsers/' + params.term;
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
						more: params.page * 30 < data.total_count,
					},
				};
			},
			cache: true,
		},
		placeholder: "리뷰어 설정을 위한 계정명을 입력해 주세요",
		minimumInputLength: 1,
		templateResult: formatUser,
		templateSelection: formatUserSelection,
	});

}

////////////////////////////////////////////////////////////////////////////////////////
// --- select2 (사용자 자동완성 검색 ) templateResult 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
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
	$container
		.find(".select2-result-jsonData__id")
		.text(jsonData.id);

	return $container;
}

////////////////////////////////////////////////////////////////////////////////////////
// --- select2 (사용자 자동완성 검색 ) templateSelection 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function formatUserSelection(jsonData) {

	if (jsonData.id == '') {
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


////////////////////////////////////////////////////////////////////////////////////////
// --- file upload --- //
////////////////////////////////////////////////////////////////////////////////////////
$(function () {
	'use strict';

	// Initialize the jQuery File Upload widget:
	var $fileupload = $('#fileupload');
	$fileupload.fileupload({
		// Uncomment the following to send cross-domain cookies:
		//xhrFields: {withCredentials: true},
		autoUpload: true,
		url: '/auth-user/api/arms/pdService/uploadFileToNode.do',
		dropZone: $('#dropzone')
	});

	// Enable iframe cross-domain access via redirect option:
	$fileupload.fileupload(
		'option',
		'redirect',
		window.location.href.replace(
			/\/[^\/]*$/,
			'/cors/result.html?%s'
		)
	);

	// Load existing files:
	$.ajax({
		// Uncomment the following to send cross-domain cookies:
		//xhrFields: {withCredentials: true},
		url: $fileupload.fileupload('option', 'url'),
		dataType: 'json',
		context: $fileupload[0]
	}).done(function (result) {
		$(this).fileupload('option', 'done').call(this, null, { result: result });
	});

});

$('#fileupload').bind('fileuploadsubmit', function (e, data) {
	// The example input, doesn't have to be part of the upload form:
	var input = $('#fileIdLink');
	data.formData = { fileIdLink: input.val() };
	if (!data.formData.fileIdLink) {
		data.context.find('button').prop('disabled', false);
		input.focus();
		return false;
	}
});

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
					return '<label style="color: #a4c6ff">' + data + '</label>';
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

	var jquerySelector = "#pdservice_table";
	var ajaxUrl = "/auth-user/api/arms/pdService/getPdServiceMonitor.do";
	var jsonRoot = "";

	dataTableRef = dataTable_build(jquerySelector, ajaxUrl, jsonRoot, columnList, rowsGroupList, columnDefList, selectList, orderList, buttonList);
}

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
	selectedIndex = selectedData.selectedIndex;
	selectedPage = selectedData.selectedPage;
	selectId = selectedData.c_id;
	$('#fileIdLink').val(selectedData.c_id);
	selectName = selectedData.c_title;
	pdServiceDataTableClick(selectedData.c_id);

	//파일 업로드 관련 레이어 보이기 처리
	$('.body-middle').show();

	//파일 리스트 초기화
	$("table tbody.files").empty();
	// Load existing files:
	var $fileupload = $('#fileupload');
	// Load existing files:

	$.ajax({
		// Uncomment the following to send cross-domain cookies:
		//xhrFields: {withCredentials: true},
		url: '/auth-user/api/arms/fileRepository/getFilesByNode.do',
		data: { fileIdLink: selectId, c_title: "pdService" },
		dataType: 'json',
		context: $fileupload[0]
	}).done(function (result) {
		$(this).fileupload('option', 'done').call(this, null, { result: result });
	});

}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(settings, json){

}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance).DataTable().columns.adjust().responsive.recalc();
}

////////////////////////////////////////////////////////////////////////////////////////
//제품(서비스) 클릭할 때 동작하는 함수
//1. 상세보기 데이터 바인딩
//2. 편집하기 데이터 바인딩
////////////////////////////////////////////////////////////////////////////////////////
function pdServiceDataTableClick(c_id) {

	selectVersion = c_id;

	$.ajax({
		url: "/auth-user/api/arms/pdService/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
		data: { c_id: c_id }, // HTTP 요청과 함께 서버로 보낼 데이터
		method: "GET", // HTTP 요청 메소드(GET, POST 등)
		dataType: "json", // 서버에서 보내줄 데이터의 타입
		beforeSend:function(){

			$('.loader').removeClass('hide');

		},
	})
		// HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
		.done(function (json) {

			//$("#detailView_pdService_name").val(json.c_title);
			$('#detailView_pdService_name').val(json.c_title);
			if ( isEmpty(json.c_owner) || json.c_owner == "none") {
				$('#detailView_pdService_owner').val("책임자가 존재하지 않습니다.");
			} else {
				$('#detailView_pdService_owner').val(json.c_owner);
			}

			if ( isEmpty(json.c_reviewer01) || json.c_reviewer01 == "none" ) {
				$('#detailView_pdService_reviewer01').val("리뷰어(연대책임자)가 존재하지 않습니다.");
			} else {
				$('#detailView_pdService_reviewer01').val(json.c_reviewer01);
			}

			if ( isEmpty(json.c_reviewer02) || json.c_reviewer02 == "none") {
				$('#detailView_pdService_reviewer02').val("2번째 리뷰어(연대책임자) 없음");
			} else {
				$("#detailView_pdService_reviewer02").val(json.c_reviewer02);
			}

			if ( isEmpty(json.c_reviewer03) || json.c_reviewer03 == "none") {
				$('#detailView_pdService_reviewer03').val("3번째 리뷰어(연대책임자) 없음");
			} else {
				$("#detailView_pdService_reviewer03").val(json.c_reviewer03);
			}

			if ( isEmpty(json.c_reviewer04) || json.c_reviewer04 == "none") {
				$('#detailView_pdService_reviewer04').val("4번째 리뷰어(연대책임자) 없음");
			} else {
				$("#detailView_pdService_reviewer04").val(json.c_reviewer04);
			}

			if ( isEmpty(json.c_reviewer05) || json.c_reviewer05 == "none") {
				$('#detailView_pdService_reviewer05').val("5번째 리뷰어(연대책임자) 없음");
			} else {
				$("#detailView_pdService_reviewer05").val(json.c_reviewer05);
			}
			$("#detailView_pdService_contents").html(json.c_contents);

			$("#editView_pdService_name").val(json.c_title);

			//clear
			$('#editView_pdService_owner').val(null).trigger('change');

			if (json.c_owner == null || json.c_owner == "none") {
				console.log("pdServiceDataTableClick :: json.c_owner empty");
			} else {
				var newOption = new Option(json.c_owner, json.c_owner, true, true);
				$('#editView_pdService_owner').append(newOption).trigger('change');
			}
			// -------------------- reviewer setting -------------------- //
			//reviewer clear
			$('#editView_pdService_reviewers').val(null).trigger('change');

			var selectedReviewerArr = [];
			if (json.c_reviewer01 == null || json.c_reviewer01 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer01 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer01);
				// Set the value, creating a new option if necessary
				if ($('#editView_pdService_reviewers').find("option[value='" + json.c_reviewer01 + "']").length) {
					console.log("option[value='\" + json.c_reviewer01 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption01 = new Option(json.c_reviewer01, json.c_reviewer01, true, true);
					// Append it to the select
					$('#editView_pdService_reviewers').append(newOption01).trigger('change');
				}

			}
			if (json.c_reviewer02 == null || json.c_reviewer02 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer02 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer02);
				// Set the value, creating a new option if necessary
				if ($('#editView_pdService_reviewers').find("option[value='" + json.c_reviewer02 + "']").length) {
					console.log("option[value='\" + json.c_reviewer02 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption02 = new Option(json.c_reviewer02, json.c_reviewer02, true, true);
					// Append it to the select
					$('#editView_pdService_reviewers').append(newOption02).trigger('change');
				}

			}
			if (json.c_reviewer03 == null || json.c_reviewer03 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer03 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer03);
				// Set the value, creating a new option if necessary
				if ($('#editView_pdService_reviewers').find("option[value='" + json.c_reviewer03 + "']").length) {
					console.log("option[value='\" + json.c_reviewer03 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption03 = new Option(json.c_reviewer03, json.c_reviewer03, true, true);
					// Append it to the select
					$('#editView_pdService_reviewers').append(newOption03).trigger('change');
				}

			}
			if (json.c_reviewer04 == null || json.c_reviewer04 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer04 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer04);
				// Set the value, creating a new option if necessary
				if ($('#editView_pdService_reviewers').find("option[value='" + json.c_reviewer04 + "']").length) {
					console.log("option[value='\" + json.c_reviewer04 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption04 = new Option(json.c_reviewer04, json.c_reviewer04, true, true);
					// Append it to the select
					$('#editView_pdService_reviewers').append(newOption04).trigger('change');
				}

			}
			if (json.c_reviewer05 == null || json.c_reviewer05 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer05 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer05);
				// Set the value, creating a new option if necessary
				if ($('#editView_pdService_reviewers').find("option[value='" + json.c_reviewer05 + "']").length) {
					console.log("option[value='\" + json.c_reviewer05 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption05 = new Option(json.c_reviewer05, json.c_reviewer05, true, true);
					// Append it to the select
					$('#editView_pdService_reviewers').append(newOption05).trigger('change');
				}

			}
			$('#editView_pdService_reviewers').val(selectedReviewerArr).trigger('change');

			// ------------------------- reviewer end --------------------------------//

			CKEDITOR.instances.input_pdservice_editor.setData(json.c_contents);

		})
		// HTTP 요청이 실패하면 오류와 상태에 관한 정보가 fail() 메소드로 전달됨.
		.fail(function (xhr, status, errorThrown) {
			console.log(xhr + status + errorThrown);
		})
		//
		.always(function (xhr, status) {
			console.log(xhr + status);
			$('.loader').addClass('hide');
		});

	$('#delete_text').text($('#pdservice_table').DataTable().rows('.selected').data()[0].c_title);
}

////////////////////////////////////////////////////////////////////////////////////////
// 신규 제품(서비스) 등록 버튼
////////////////////////////////////////////////////////////////////////////////////////
$("#regist_pdService").click(function () {
	var reviewers01 = "none";
	var reviewers02 = "none";
	var reviewers03 = "none";
	var reviewers04 = "none";
	var reviewers05 = "none";
	if ($('#popup_editView_pdService_reviewers').select2('data')[0] != undefined) {
		reviewers01 = $('#popup_editView_pdService_reviewers').select2('data')[0].text;
	}
	if ($('#popup_editView_pdService_reviewers').select2('data')[1] != undefined) {
		reviewers02 = $('#popup_editView_pdService_reviewers').select2('data')[1].text;
	}
	if ($('#popup_editView_pdService_reviewers').select2('data')[2] != undefined) {
		reviewers03 = $('#popup_editView_pdService_reviewers').select2('data')[2].text;
	}
	if ($('#popup_editView_pdService_reviewers').select2('data')[3] != undefined) {
		reviewers04 = $('#popup_editView_pdService_reviewers').select2('data')[3].text;
	}
	if ($('#popup_editView_pdService_reviewers').select2('data')[4] != undefined) {
		reviewers05 = $('#popup_editView_pdService_reviewers').select2('data')[4].text;
	}

	$.ajax({
		url: "/auth-user/api/arms/pdService/addPdServiceNode.do",
		type: "POST",
		data: {
			ref: 2,
			c_title: $("#popup_editView_pdService_name").val(),
			c_type: "default",
			c_owner: $('#popup_editView_pdService_owner').select2('data')[0].text,
			c_reviewer01: reviewers01,
			c_reviewer02: reviewers02,
			c_reviewer03: reviewers03,
			c_reviewer04: reviewers04,
			c_reviewer05: reviewers05,
			c_contents: CKEDITOR.instances["modal_editor"].getData(),
		},
		statusCode: {
			200: function () {
				//모달 팝업 끝내고
				$('#close_pdService').trigger('click');
				//데이터 테이블 데이터 재 로드
				dataTableRef.ajax.reload();
				jSuccess("신규 제품 등록이 완료 되었습니다.");
			},
		},
		beforeSend:function(){
			$("#regist_pdService").hide();
		},
		complete:function(){
			$("#regist_pdService").show();
		},
		error:function(e){
			jError("신규 제품 등록 중 에러가 발생했습니다.");
		}
	});
});

////////////////////////////////////////////////////////////////////////////////////////
// 신규 제품(서비스) 삭제 버튼
////////////////////////////////////////////////////////////////////////////////////////
$("#delete_pdservice").click(function () {
	$.ajax({
		url: "/auth-user/api/arms/pdService/removeNode.do",
		type: "POST",
		data: {
			c_id: $('#pdservice_table').DataTable().rows('.selected').data()[0].c_id,
		},
		statusCode: {
			200: function () {
				jError($("#editView_pdService_name").val() + "데이터가 삭제되었습니다.");
				//데이터 테이블 데이터 재 로드
				dataTableRef.ajax.reload(function (json) {
					$('#pdservice_table tbody tr:eq(0)').click();
				});
			},
		},
	});
});

////////////////////////////////////////////////////////////////////////////////////////
// 제품(서비스) 변경 저장 버튼
////////////////////////////////////////////////////////////////////////////////////////
$("#pd_service_update").click(function () {

	var owner = "none";
	if ($('#editView_pdService_owner').select2('data')[0] != undefined) {
		owner = $('#editView_pdService_owner').select2('data')[0].text;
	}

	var reviewers01 = "none";
	var reviewers02 = "none";
	var reviewers03 = "none";
	var reviewers04 = "none";
	var reviewers05 = "none";
	if ($('#editView_pdService_reviewers').select2('data')[0] != undefined) {
		reviewers01 = $('#editView_pdService_reviewers').select2('data')[0].text;
	}
	if ($('#editView_pdService_reviewers').select2('data')[1] != undefined) {
		reviewers02 = $('#editView_pdService_reviewers').select2('data')[1].text;
	}
	if ($('#editView_pdService_reviewers').select2('data')[2] != undefined) {
		reviewers03 = $('#editView_pdService_reviewers').select2('data')[2].text;
	}
	if ($('#editView_pdService_reviewers').select2('data')[3] != undefined) {
		reviewers04 = $('#editView_pdService_reviewers').select2('data')[3].text;
	}
	if ($('#editView_pdService_reviewers').select2('data')[4] != undefined) {
		reviewers05 = $('#editView_pdService_reviewers').select2('data')[4].text;
	}

	$.ajax({
		url: "/auth-user/api/arms/pdService/updatePdServiceNode.do",
		type: "POST",
		data: {
			c_id: $('#pdservice_table').DataTable().rows('.selected').data()[0].c_id,
			c_title: $("#editView_pdService_name").val(),
			c_owner: owner,
			c_reviewer01: reviewers01,
			c_reviewer02: reviewers02,
			c_reviewer03: reviewers03,
			c_reviewer04: reviewers04,
			c_reviewer05: reviewers05,
			c_contents: CKEDITOR.instances["input_pdservice_editor"].getData(),
		},
		statusCode: {
			200: function () {
				jSuccess($("#editView_pdService_name").val() + "의 데이터가 변경되었습니다.");
			},
		},
	});
});


////////////////////////////////////////////////////////////////////////////////////////
// 팝업에서 제품(서비스) 변경 저장 버튼
////////////////////////////////////////////////////////////////////////////////////////
$("#extendUpdate_pdService").click(function () {

	var owner = "none";
	if ($('#extend_editView_pdService_owner').select2('data')[0] != undefined) {
		owner = $('#extend_editView_pdService_owner').select2('data')[0].text;
	}

	var reviewers01 = "none";
	var reviewers02 = "none";
	var reviewers03 = "none";
	var reviewers04 = "none";
	var reviewers05 = "none";
	if ($('#extend_editView_pdService_reviewers').select2('data')[0] != undefined) {
		reviewers01 = $('#extend_editView_pdService_reviewers').select2('data')[0].text;
	}
	if ($('#extend_editView_pdService_reviewers').select2('data')[1] != undefined) {
		reviewers02 = $('#extend_editView_pdService_reviewers').select2('data')[1].text;
	}
	if ($('#extend_editView_pdService_reviewers').select2('data')[2] != undefined) {
		reviewers03 = $('#extend_editView_pdService_reviewers').select2('data')[2].text;
	}
	if ($('#extend_editView_pdService_reviewers').select2('data')[3] != undefined) {
		reviewers04 = $('#extend_editView_pdService_reviewers').select2('data')[3].text;
	}
	if ($('#extend_editView_pdService_reviewers').select2('data')[4] != undefined) {
		reviewers05 = $('#extend_editView_pdService_reviewers').select2('data')[4].text;
	}

	$.ajax({
		url: "/auth-user/api/arms/pdService/updatePdServiceNode.do",
		type: "POST",
		data: {
			c_id: $('#pdservice_table').DataTable().rows('.selected').data()[0].c_id,
			c_title: $("#extend_editView_pdService_name").val(),
			c_owner: owner,
			c_reviewer01: reviewers01,
			c_reviewer02: reviewers02,
			c_reviewer03: reviewers03,
			c_reviewer04: reviewers04,
			c_reviewer05: reviewers05,
			c_contents: CKEDITOR.instances["extend_modal_editor"].getData(),
		},
		statusCode: {
			200: function () {
				//모달 팝업 끝내고
				$('#extendClose_pdService').trigger('click');

				jSuccess($("#extend_editView_pdService_name").val() + "의 데이터가 변경되었습니다.");

				$('#fileIdLink').val(selectId);
				pdServiceDataTableClick(selectId);

				//파일 업로드 관련 레이어 보이기 처리
				$('.body-middle').show();

				//파일 리스트 초기화
				$("table tbody.files").empty();
				// Load existing files:
				var $fileupload = $('#fileupload');
				// Load existing files:
				$.ajax({
					// Uncomment the following to send cross-domain cookies:
					//xhrFields: {withCredentials: true},
					url: '/auth-user/api/arms/fileRepository/getFilesByNode.do',
					data: { fileIdLink: selectId },
					dataType: 'json',
					context: $fileupload[0]
				}).done(function (result) {
					$(this).fileupload('option', 'done').call(this, null, { result: result });
				});
			},
		},
	});
});