////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var reqStatusDataTable;
var dataTableRef;

var selectedIssue; //선택한 이슈
var selectedIssueKey; //선택한 이슈 키

var gantt;

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
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
			"../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js",
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
		],

		[
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
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js"
		],
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
		[
			"../reference/jquery-plugins/gantt-0.6.1/dist/frappe-gantt.js",
			"../reference/jquery-plugins/gantt-0.6.1/dist/frappe-gantt.css"
		]
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			//vfs_fonts 파일이 커서 defer 처리 함.
			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 3000); // 2초 후에 실행됩니다.
			console.log("모든 플러그인 로드 완료");

			//사이드 메뉴 처리
			$(".widget").widgster();
			setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_gantt");

			//제품(서비스) 셀렉트 박스 이니시에이터
			makePdServiceSelectBox();
			//버전 멀티 셀렉트 박스 이니시에이터
			makeVersionMultiSelectBox();

			popup_size_setting();
			// 스크립트 실행 로직을 이곳에 추가합니다.

			$("#progress_status").slimScroll({
				height: "195px",
				railVisible: true,
				railColor: "#222",
				railOpacity: 0.3,
				wheelStep: 10,
				allowPageScroll: false,
				disableFadeOut: false
			});
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
					var newOption = new Option(obj.c_title, obj.c_id, false, false);
					$("#selected_pdService").append(newOption).trigger("change");
				}
				//////////////////////////////////////////////////////////
			}
		}
	});

	$("#selected_pdService").on("select2:open", function () {
		//슬림스크롤
		makeSlimScroll(".select2-results__options");
	});

	// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
	$("#selected_pdService").on("select2:select", function (e) {
		// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
		// 디폴트는 base version 을 선택하게 하고 ( select all )
		//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
		bind_VersionData_By_PdService();

		var checked = $("#checkbox1").is(":checked");
		var endPointUrl = "";

		if (checked) {
			endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true";
		} else {
			endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false";
		}
		//
		getStatusMonitorData($("#selected_pdService").val(), endPointUrl);
		//통계로드
		statisticsLoad($("#selected_pdService").val(), null);
		//진행상태 가져오기
		progressLoad($("#selected_pdService").val(), null);
	});
} // end makePdServiceSelectBox()

function progressLoad(pdservice_id, pdservice_version_id) {
	$("#progress_status").empty(); // 모든 자식 요소 삭제

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url:
			"/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" +
			pdservice_id +
			"/getProgress.do?version=" +
			pdservice_version_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);

					var html_piece =
						'<div	class="controls form-group darkBack"\n' +
						'		style="margin-bottom: 5px !important; padding-top: 5px !important;">\n' +
						"<span>✡ " +
						key +
						' : <a id="alm_server_count" style="font-weight: bold;"> ' +
						value +
						"</a> 개</span>\n" +
						"</div>";
					$("#progress_status").append(html_piece);
				}
			}
		}
	});
}

function statisticsLoad(pdservice_id, pdservice_version_id) {
	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url:
			"/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" +
			pdservice_id +
			"/getStatistics.do?version=" +
			pdservice_version_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);
				}

				$("#version_count").text(data["version"]);
				$("#req_count").text(data["req"]);
				$("#alm_server_count").text(data["jiraServer"]);
				$("#alm_project_count").text(data["jiraProject"]);
				$("#alm_issue_count").text(data["issue"]);
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////////////////////////////////////////////////////
function makeVersionMultiSelectBox() {
	//버전 선택 셀렉트 박스 이니시에이터
	$(".multiple-select").multipleSelect({
		filter: true,
		onClose: function () {
			console.log("onOpen event fire!\n");

			var checked = $("#checkbox1").is(":checked");
			var endPointUrl = "";
			var versionTag = $(".multiple-select").val();

			if (checked) {
				endPointUrl =
					"/T_ARMS_REQSTATUS_" +
					$("#selected_pdService").val() +
					"/getStatusMonitor.do?disable=true&versionTag=" +
					versionTag;
				getStatusMonitorData($("#selected_pdService").val(), endPointUrl);
			} else {
				endPointUrl =
					"/T_ARMS_REQSTATUS_" +
					$("#selected_pdService").val() +
					"/getStatusMonitor.do?disable=false&versionTag=" +
					versionTag;
				getStatusMonitorData($("#selected_pdService").val(), endPointUrl);
			}
		}
	});
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
					console.log("display 재설정.");
				}
				//$('#multiversion').multipleSelect('refresh');
				//$('#edit_multi_version').multipleSelect('refresh');
				$(".multiple-select").multipleSelect("refresh");
				//////////////////////////////////////////////////////////
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //
function getStatusMonitorData(selectId, endPointUrl) {
	$("#gantt-target").empty();

	$.ajax({
		url: "/auth-user/api/arms/reqStatus" + endPointUrl,
		type: "GET",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				if (!isEmpty(data)) {
					const tasks = setGanttTasks(data);
					gantt = new Gantt("#gantt-target", tasks);
				}
			}
		}
	});
}
function popup_size_setting() {
	$("#modal_popup_id").click(function () {
		console.log("modal_popup_id clicked");
		var height = $(document).height() - 600;

		$("#my_modal2").on("hidden.bs.modal", function (e) {
			console.log("modal close");
			console.log($(this).find("form")[0]);
			$(this).find("form")[0].reset();
		});

		$(".modal-body")
			.find(".cke_contents:eq(0)")
			.css("height", height + "px");
	});
}

function setGanttTasks(data) {
	return data.reduce((acc, cur) => {
		acc.push({
			id: cur.c_id,
			name: cur.c_title,
			start: getDate(cur.c_issue_create_date),
			end: getDate(
				new Date(new Date(cur.c_issue_create_date).setDate(new Date(cur.c_issue_create_date).getDate() + 10)).getTime()
			),
			progress: 20,
			dependencies: "",
			custom_class: cur.c_issue_priority_name // optional
		});

		return acc;
	}, []);
}

function getDate(stamp) {
	const time = new Date(stamp);
	return `${time.getFullYear()}-${addZero(time.getMonth() + 1)}-${addZero(time.getDate())}`;
}

function addZero(n) {
	return n < 10 ? `0${n}` : n;
}
