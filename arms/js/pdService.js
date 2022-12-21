let selectId; // 제품 아이디
let selectName; // 제품 이름
let selectedIndex; // 데이터테이블 선택한 인덱스
let selectedPage; // 데이터테이블 선택한 인덱스
let selectVersion; // 선택한 버전 아이디
let dataTableRef; // 데이터테이블 참조 변수

// --- 에디터 설정 --- //
CKEDITOR.replace("input_pdservice_editor");
CKEDITOR.replace("extendModalEditor");
CKEDITOR.replace("modal-editor");

// --- 팝업 띄울때 사이즈 조정 -- //
$("#modalPopupId").click(function () {
	var height = $(document).height() - 600;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");
});
$("#extendModalPopupId").click(function () {
	var height = $(document).height() - 1000;
	$(".modal-body")
		.find(".cke_contents:eq(0)")
		.css("height", height + "px");

	// 데이터 셋팅
	var editorData = CKEDITOR.instances["input_pdservice_editor"].getData();
	CKEDITOR.instances.extendModalEditor.setData(editorData);

	var selectedId = $('#pdserviceTable').DataTable().rows('.selected').data()[0].c_id;
	console.log("selectedId ->" + selectedId);

	// 제품(서비스) 이름
	$("#extend-editView-pdService-name").val($("#editView-pdService-name").val());

	// 오너
	// clear
	$('#extend-editView-pdService-owner').val(null).trigger('change');

	// 부모 페이지에서 데이터 로드
	var owner = "none";
	if ($('#editView-pdService-owner').select2('data')[0] != undefined) {
		owner = $('#editView-pdService-owner').select2('data')[0].text;
	}

	// Modal 창에 데이터 셋팅
	if (owner == null || owner == "none") {
		console.log("pdServiceDataTableClick :: json.c_owner empty");
	} else {
		var newOption = new Option(owner, owner, true, true);
		$('#extend-editView-pdService-owner').append(newOption).trigger('change');
	}

	// 리뷰어
	//clear
	$('#extend-editView-pdService-reviewers').val(null).trigger('change');

	var reviewer01 = "none";
	var reviewer02 = "none";
	var reviewer03 = "none";
	var reviewer04 = "none";
	var reviewer05 = "none";

	if ($('#editView-pdService-reviewers').select2('data')[0] != undefined) {
		reviewer01 = $('#editView-pdService-reviewers').select2('data')[0].text;
	}
	if ($('#editView-pdService-reviewers').select2('data')[1] != undefined) {
		reviewer02 = $('#editView-pdService-reviewers').select2('data')[1].text;
	}
	if ($('#editView-pdService-reviewers').select2('data')[2] != undefined) {
		reviewer03 = $('#editView-pdService-reviewers').select2('data')[2].text;
	}
	if ($('#editView-pdService-reviewers').select2('data')[3] != undefined) {
		reviewer04 = $('#editView-pdService-reviewers').select2('data')[3].text;
	}
	if ($('#editView-pdService-reviewers').select2('data')[4] != undefined) {
		reviewer05 = $('#editView-pdService-reviewers').select2('data')[4].text;
	}

	var reviewer01Option = new Option(reviewer01, reviewer01, true, true);
	var reviewer02Option = new Option(reviewer02, reviewer02, true, true);
	var reviewer03Option = new Option(reviewer03, reviewer03, true, true);
	var reviewer04Option = new Option(reviewer04, reviewer04, true, true);
	var reviewer05Option = new Option(reviewer05, reviewer05, true, true);

	var multifyValue = 1;
	if (reviewer01 == null || reviewer01 == "none") {
		console.log("extendModalPopupId Click :: reviewer01 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend-editView-pdService-reviewers').append(reviewer01Option);
	}
	if (reviewer02 == null || reviewer02 == "none") {
		console.log("extendModalPopupId Click :: reviewer02 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend-editView-pdService-reviewers').append(reviewer02Option);
	}
	if (reviewer03 == null || reviewer03 == "none") {
		console.log("extendModalPopupId Click :: reviewer03 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend-editView-pdService-reviewers').append(reviewer03Option);
	}
	if (reviewer04 == null || reviewer04 == "none") {
		console.log("extendModalPopupId Click :: reviewer04 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend-editView-pdService-reviewers').append(reviewer04Option);
	}
	if (reviewer05 == null || reviewer05 == "none") {
		console.log("extendModalPopupId Click :: reviewer05 empty");
	} else {
		multifyValue = multifyValue + 1;
		$('#extend-editView-pdService-reviewers').append(reviewer05Option);
	}

	$('#extend-editView-pdService-reviewers').trigger('change');

	$('#extend-editView-pdService-reviewer').css('height', '20px');
	setTimeout(function () {
		var heightValue = $('#extend-editView-pdService-reviewer').height();
		var resultValue = heightValue + (20 * multifyValue);
		$('#extend-editView-pdService-reviewer').css('height', resultValue + 'px');
	}, 250);

});

// --- select2 (사용자 자동완성 검색 ) 설정 --- //
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
	$container
		.find(".select2-result-jsonData__id")
		.text(jsonData.id);

	return $container;
}

// --- select2 (사용자 자동완성 검색 ) templateSelection 설정 --- //
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

// --- select2 (사용자 자동완성 검색 ) 선택하고 나면 선택된 데이터 공간을 벌리기위한 설정 --- //
$('#popup-editView-pdService-reviewer').on('select2:select', function (e) {
	var heightValue = $('#popup-editView-pdService-reviewer').height();
	var resultValue = heightValue + 20;
	$('#popup-editView-pdService-reviewer').css('height', resultValue + 'px');
});

$('#editView-pdService-reviewers').on('select2:select', function (e) {
	var heightValue = $('#editView-pdService-reviewer').height();
	var resultValue = heightValue + 20;
	$('#editView-pdService-reviewer').css('height', resultValue + 'px');
});


// document ready
function execArmsDocReady () {

	// 사이드 메뉴 색상 설정
	setSideMenu("sidebar_menu_product", "sidebar_menu_product_manage");

	// 파일 업로드 관련 레이어 숨김 처리
	$('.body-middle').hide();

	// 데이터 테이블 로드 함수
	dataTableLoad();

	// 탭 클릭 이벤트
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		var target = $(e.target).attr("href"); // activated tab

		if (target == "#dropdown1") {
			$('.body-middle').hide();
		} else {
			if (selectId == undefined) {
				$('.body-middle').hide();
			} else {
				$('.body-middle').show();
			}
		}
	});
};

/** file upload **/
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

// --- 데이터 테이블 설정 --- //
function dataTableLoad() {
	// 데이터 테이블 컬럼 및 열그룹 구성
	var columnList = [
		{ data: "c_id" },
		{ data: "c_title" },
	];
	var rowsGroupList = [];
	dataTableRef = dataTableBuild("#pdserviceTable", "pdService", "/getPdServiceMonitor.do", columnList, rowsGroupList);

	// ----- 데이터 테이블 빌드 이후 별도 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$("body").find("[aria-controls='pdserviceTable']").css("width", "100px");
	$("select[name=pdserviceTable_length]").css("width", "50px");
}

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(selectedData) {
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

//제품(서비스) 클릭할 때 동작하는 함수
//1. 상세보기 데이터 바인딩
//2. 편집하기 데이터 바인딩
function pdServiceDataTableClick(c_id) {

	selectVersion = c_id;

	$.ajax({
		url: "/auth-user/api/arms/pdService/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
		data: { c_id: c_id }, // HTTP 요청과 함께 서버로 보낼 데이터
		method: "GET", // HTTP 요청 메소드(GET, POST 등)
		dataType: "json", // 서버에서 보내줄 데이터의 타입
	})
		// HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
		.done(function (json) {

			$("#detailView-pdService-name").text(json.c_title);
			if (json.c_owner == null || json.c_owner == "none") {
				$("#detailView-pdService-owner").text("책임자가 존재하지 않습니다.");
			} else {
				$("#detailView-pdService-owner").text(json.c_owner);
			}

			if (json.c_reviewer01 == null || json.c_reviewer01 == "none") {
				$("#detailView-pdService-reviewer01").text("리뷰어(연대책임자)가 존재하지 않습니다.");
			} else {
				$("#detailView-pdService-reviewer01").text(json.c_reviewer01);
			}

			if (json.c_reviewer02 == null || json.c_reviewer02 == "none") {
			} else {
				$("#detailView-pdService-reviewer02").text(json.c_reviewer02);
			}

			if (json.c_reviewer03 == null || json.c_reviewer03 == "none") {
			} else {
				$("#detailView-pdService-reviewer03").text(json.c_reviewer03);
			}

			if (json.c_reviewer04 == null || json.c_reviewer04 == "none") {
			} else {
				$("#detailView-pdService-reviewer04").text(json.c_reviewer04);
			}

			if (json.c_reviewer05 == null || json.c_reviewer05 == "none") {
			} else {
				$("#detailView-pdService-reviewer05").text(json.c_reviewer05);
			}
			$("#detailView-pdService-contents").html(json.c_contents);

			$("#editView-pdService-name").val(json.c_title);

			//clear
			$('#editView-pdService-owner').val(null).trigger('change');

			if (json.c_owner == null || json.c_owner == "none") {
				console.log("pdServiceDataTableClick :: json.c_owner empty");
			} else {
				var newOption = new Option(json.c_owner, json.c_owner, true, true);
				$('#editView-pdService-owner').append(newOption).trigger('change');
			}
			// -------------------- reviewer setting -------------------- //
			//reviewer clear
			$('#editView-pdService-reviewers').val(null).trigger('change');

			var selectedReviewerArr = [];
			if (json.c_reviewer01 == null || json.c_reviewer01 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer01 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer01);
				// Set the value, creating a new option if necessary
				if ($('#editView-pdService-reviewers').find("option[value='" + json.c_reviewer01 + "']").length) {
					console.log("option[value='\" + json.c_reviewer01 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption01 = new Option(json.c_reviewer01, json.c_reviewer01, true, true);
					// Append it to the select
					$('#editView-pdService-reviewers').append(newOption01).trigger('change');
				}

			}
			if (json.c_reviewer02 == null || json.c_reviewer02 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer02 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer02);
				// Set the value, creating a new option if necessary
				if ($('#editView-pdService-reviewers').find("option[value='" + json.c_reviewer02 + "']").length) {
					console.log("option[value='\" + json.c_reviewer02 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption02 = new Option(json.c_reviewer02, json.c_reviewer02, true, true);
					// Append it to the select
					$('#editView-pdService-reviewers').append(newOption02).trigger('change');
				}

			}
			if (json.c_reviewer03 == null || json.c_reviewer03 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer03 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer03);
				// Set the value, creating a new option if necessary
				if ($('#editView-pdService-reviewers').find("option[value='" + json.c_reviewer03 + "']").length) {
					console.log("option[value='\" + json.c_reviewer03 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption03 = new Option(json.c_reviewer03, json.c_reviewer03, true, true);
					// Append it to the select
					$('#editView-pdService-reviewers').append(newOption03).trigger('change');
				}

			}
			if (json.c_reviewer04 == null || json.c_reviewer04 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer04 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer04);
				// Set the value, creating a new option if necessary
				if ($('#editView-pdService-reviewers').find("option[value='" + json.c_reviewer04 + "']").length) {
					console.log("option[value='\" + json.c_reviewer04 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption04 = new Option(json.c_reviewer04, json.c_reviewer04, true, true);
					// Append it to the select
					$('#editView-pdService-reviewers').append(newOption04).trigger('change');
				}

			}
			if (json.c_reviewer05 == null || json.c_reviewer05 == "none") {
				console.log("pdServiceDataTableClick :: json.c_reviewer05 empty");
			} else {

				selectedReviewerArr.push(json.c_reviewer05);
				// Set the value, creating a new option if necessary
				if ($('#editView-pdService-reviewers').find("option[value='" + json.c_reviewer05 + "']").length) {
					console.log("option[value='\" + json.c_reviewer05 + \"']\"" + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption05 = new Option(json.c_reviewer05, json.c_reviewer05, true, true);
					// Append it to the select
					$('#editView-pdService-reviewers').append(newOption05).trigger('change');
				}

			}
			$('#editView-pdService-reviewers').val(selectedReviewerArr).trigger('change');

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
		});
}

// 신규 제품(서비스) 등록 버튼
$("#regist-pdService").click(function () {
	var reviewers01 = "none";
	var reviewers02 = "none";
	var reviewers03 = "none";
	var reviewers04 = "none";
	var reviewers05 = "none";
	if ($('#popup-editView-pdService-reviewers').select2('data')[0] != undefined) {
		reviewers01 = $('#popup-editView-pdService-reviewers').select2('data')[0].text;
	}
	if ($('#popup-editView-pdService-reviewers').select2('data')[1] != undefined) {
		reviewers02 = $('#popup-editView-pdService-reviewers').select2('data')[1].text;
	}
	if ($('#popup-editView-pdService-reviewers').select2('data')[2] != undefined) {
		reviewers03 = $('#popup-editView-pdService-reviewers').select2('data')[2].text;
	}
	if ($('#popup-editView-pdService-reviewers').select2('data')[3] != undefined) {
		reviewers04 = $('#popup-editView-pdService-reviewers').select2('data')[3].text;
	}
	if ($('#popup-editView-pdService-reviewers').select2('data')[4] != undefined) {
		reviewers05 = $('#popup-editView-pdService-reviewers').select2('data')[4].text;
	}

	$.ajax({
		url: "/auth-user/api/arms/pdService/addPdServiceNode.do",
		type: "POST",
		data: {
			ref: 2,
			c_title: $("#popup-editView-pdService-name").val(),
			c_type: "default",
			c_owner: $('#popup-editView-pdService-owner').select2('data')[0].text,
			c_reviewer01: reviewers01,
			c_reviewer02: reviewers02,
			c_reviewer03: reviewers03,
			c_reviewer04: reviewers04,
			c_reviewer05: reviewers05,
			c_contents: CKEDITOR.instances["modal-editor"].getData(),
		},
		statusCode: {
			200: function () {
				//모달 팝업 끝내고
				$('#close-pdService').trigger('click');
				//데이터 테이블 데이터 재 로드
				dataTableRef.ajax.reload();
			},
		},
	});
});

// 신규 제품(서비스) 삭제 버튼
$("#delete-pdService").click(function () {
	$.ajax({
		url: "/auth-user/api/arms/pdService/removeNode.do",
		type: "POST",
		data: {
			c_id: $('#pdserviceTable').DataTable().rows('.selected').data()[0].c_id,
		},
		statusCode: {
			200: function () {
				jError($("#editView-pdService-name").val() + "데이터가 삭제되었습니다.");
				//데이터 테이블 데이터 재 로드
				dataTableRef.ajax.reload(function (json) {
					$('#pdserviceTable tbody tr:eq(0)').click();
				});
			},
		},
	});
});

// 제품(서비스) 변경 저장 버튼
$("#pdServiceUpdate").click(function () {

	var owner = "none";
	if ($('#editView-pdService-owner').select2('data')[0] != undefined) {
		owner = $('#editView-pdService-owner').select2('data')[0].text;
	}

	var reviewers01 = "none";
	var reviewers02 = "none";
	var reviewers03 = "none";
	var reviewers04 = "none";
	var reviewers05 = "none";
	if ($('#editView-pdService-reviewers').select2('data')[0] != undefined) {
		reviewers01 = $('#editView-pdService-reviewers').select2('data')[0].text;
	}
	if ($('#editView-pdService-reviewers').select2('data')[1] != undefined) {
		reviewers02 = $('#editView-pdService-reviewers').select2('data')[1].text;
	}
	if ($('#editView-pdService-reviewers').select2('data')[2] != undefined) {
		reviewers03 = $('#editView-pdService-reviewers').select2('data')[2].text;
	}
	if ($('#editView-pdService-reviewers').select2('data')[3] != undefined) {
		reviewers04 = $('#editView-pdService-reviewers').select2('data')[3].text;
	}
	if ($('#editView-pdService-reviewers').select2('data')[4] != undefined) {
		reviewers05 = $('#editView-pdService-reviewers').select2('data')[4].text;
	}

	$.ajax({
		url: "/auth-user/api/arms/pdService/updatePdServiceNode.do",
		type: "POST",
		data: {
			c_id: $('#pdserviceTable').DataTable().rows('.selected').data()[0].c_id,
			c_title: $("#editView-pdService-name").val(),
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
				jSuccess($("#editView-pdService-name").val() + "의 데이터가 변경되었습니다.");
			},
		},
	});
});


// 팝업에서 제품(서비스) 변경 저장 버튼
$("#extendUpdate-pdService").click(function () {

	var owner = "none";
	if ($('#extend-editView-pdService-owner').select2('data')[0] != undefined) {
		owner = $('#extend-editView-pdService-owner').select2('data')[0].text;
	}

	var reviewers01 = "none";
	var reviewers02 = "none";
	var reviewers03 = "none";
	var reviewers04 = "none";
	var reviewers05 = "none";
	if ($('#extend-editView-pdService-reviewers').select2('data')[0] != undefined) {
		reviewers01 = $('#extend-editView-pdService-reviewers').select2('data')[0].text;
	}
	if ($('#extend-editView-pdService-reviewers').select2('data')[1] != undefined) {
		reviewers02 = $('#extend-editView-pdService-reviewers').select2('data')[1].text;
	}
	if ($('#extend-editView-pdService-reviewers').select2('data')[2] != undefined) {
		reviewers03 = $('#extend-editView-pdService-reviewers').select2('data')[2].text;
	}
	if ($('#extend-editView-pdService-reviewers').select2('data')[3] != undefined) {
		reviewers04 = $('#extend-editView-pdService-reviewers').select2('data')[3].text;
	}
	if ($('#extend-editView-pdService-reviewers').select2('data')[4] != undefined) {
		reviewers05 = $('#extend-editView-pdService-reviewers').select2('data')[4].text;
	}

	$.ajax({
		url: "/auth-user/api/arms/pdService/updatePdServiceNode.do",
		type: "POST",
		data: {
			c_id: $('#pdserviceTable').DataTable().rows('.selected').data()[0].c_id,
			c_title: $("#extend-editView-pdService-name").val(),
			c_owner: owner,
			c_reviewer01: reviewers01,
			c_reviewer02: reviewers02,
			c_reviewer03: reviewers03,
			c_reviewer04: reviewers04,
			c_reviewer05: reviewers05,
			c_contents: CKEDITOR.instances["extendModalEditor"].getData(),
		},
		statusCode: {
			200: function () {
				//모달 팝업 끝내고
				$('#extendClose-pdService').trigger('click');

				jSuccess($("#extend-editView-pdService-name").val() + "의 데이터가 변경되었습니다.");

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

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(){

}