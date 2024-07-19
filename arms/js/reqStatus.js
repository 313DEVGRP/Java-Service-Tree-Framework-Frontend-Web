////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
var selectedPdServiceId; // 제품(서비스) 아이디
var selectedVersionId; // 선택된 버전 아이디
var reqStatusDataTable;
var dataTableRef;

var selectedIssue;    //선택한 이슈
var selectedIssueKey; //선택한 이슈 키

var pdServiceListData;
var versionListData;

var jiraServerTypeMap;

function execDocReady() {


	var pluginGroups = [ 
		[	"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
			"../reference/light-blue/lib/jquery.iframe-transport.js",
			"../reference/light-blue/lib/jquery.fileupload.js",
			"../reference/light-blue/lib/jquery.fileupload-fp.js",
			"../reference/light-blue/lib/jquery.fileupload-ui.js"],

		[	"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"],

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
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

		[
			"../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowGroup.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"
		],
		[
			"js/reqStatus/batchManualControlApi.js"
		]
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function() {

			console.log('모든 플러그인 로드 완료');

			//vfs_fonts 파일이 커서 defer 처리 함.
			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 5000); // 5초 후에 실행됩니다.

			//pdfmake 파일이 커서 defer 처리 함.
			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 5000); // 5초 후에 실행됩니다.

			// 높이 조정
			$('.status-top').matchHeight({
				target: $('.status-top-statistics')
			});

			//사이드 메뉴 처리
			$('.widget').widgster();
			setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_status");

			BatchManualControlApi.stepEventListenerStart();

			//제품(서비스) 셀렉트 박스 이니시에이터
			makePdServiceSelectBox();
			//버전 멀티 셀렉트 박스 이니시에이터
			makeVersionMultiSelectBox();

			getServerTypeMap();

			reqIssueAndItsSubtasksEvent();

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

			$("#assign_status").slimScroll({
				height: "195px",
				railVisible: true,
				railColor: "#222",
				railOpacity: 0.3,
				wheelStep: 10,
				allowPageScroll: false,
				disableFadeOut: false
			});

		})
		.catch(function() {
			console.error('플러그인 로드 중 오류 발생');
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
				pdServiceListData = [];
				for (var k in data.response) {
					var obj = data.response[k];
					pdServiceListData.push({ "pdServiceId": obj.c_id, "pdServiceName": obj.c_title });
					var newOption = new Option(obj.c_title, obj.c_id, false, false);
					$("#selected_pdService").append(newOption).trigger("change");
				}
				//////////////////////////////////////////////////////////
				console.log("[reqStatus :: makePdServiceSelectBox] :: pdServiceListData => " );
				console.table(pdServiceListData);
			}
		}
	});


	$("#selected_pdService").on("select2:open", function () {
		//슬림스크롤
		makeSlimScroll(".select2-results__options");
	});

	// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
	$("#selected_pdService").on("select2:select", function (e) {
		selectedPdServiceId = $("#selected_pdService").val();
		// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
		// 디폴트는 base version 을 선택하게 하고 ( select all )
		//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
		bind_VersionData_By_PdService();

	});
} // end makePdServiceSelectBox()


function resourceLoad(pdservice_id, pdservice_version_id){

	$('#assign_status').empty(); // 모든 자식 요소 삭제

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/dashboard/jira-issue-assignee?pdServiceId=" + pdservice_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (apiResponse) {
				const data = apiResponse.response;

				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);

					var html_piece = 	"<div	class=\"controls form-group darkBack\"\n" +
						"		style=\"margin-bottom: 5px !important; padding-top: 5px !important;\">\n" +
						"<span>✡ " + key + " : <a id=\"alm_server_count\" style=\"font-weight: bold;\"> " + value + "</a> 개</span>\n" +
						"</div>";
					$('#assign_status').append(html_piece);
				}

			}
		}
	});
}

function progressLoad(pdservice_id, pdservice_version_id){

	$('#progress_status').empty(); // 모든 자식 요소 삭제

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + pdservice_id + "/getProgress.do?version=" + pdservice_version_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {

				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);

					var html_piece = 	"<div	class=\"controls form-group darkBack\"\n" +
										"		style=\"margin-bottom: 5px !important; padding-top: 5px !important;\">\n" +
										"<span>✡ " + key + " : <a id=\"alm_server_count\" style=\"font-weight: bold;\"> " + value + "</a> 개</span>\n" +
										"</div>";
					$('#progress_status').append(html_piece);
				}

			}
		}
	});
}

function statisticsLoad(pdservice_id, pdservice_version_id){

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" + pdservice_id + "/getStatistics.do?version=" + pdservice_version_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				console.log(data);
				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);
				}

				$('#version_count').text(data["version"]); 		   	 // 버전수
				$('#req_count').text(data["req"]);			   			 	 // 요구사항 이슈 개수
				$('#alm_server_count').text(data["jiraServer"]); 	 // 서버 수
				$('#alm_project_count').text(data["jiraProject"]); // 연결된 프로젝트 수
				$('#alm_issue_count').text(data["issue"]); 				 // 연결된 ALM 이슈 수
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
			console.log("[ reqStatus :: makeVersionMultiSelectBox ] :: versionTag");
			console.log(versionTag);
			selectedVersionId = versionTag.join(",");

			if (versionTag === null || versionTag == "") {
				alert("버전이 선택되지 않았습니다.");ㅔㅇ
				return;
			}

			// 통계로드
			statisticsLoad($("#selected_pdService").val(), selectedVersionId);
			// 진행상태 가져오기
			progressLoad($("#selected_pdService").val(), selectedVersionId);
			// 작업자 정보
			resourceLoad($("#selected_pdService").val(), selectedVersionId);

			var endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/requirement-linkedissue.do?version="+selectedVersionId;
			// 이슈리스트 데이터테이블
			dataTableLoad($("#selected_pdService").val(), endPointUrl);
			$(".ms-parent").css("z-index", 1000);
		},
		onOpen: function() {
			console.log("open event");
			$(".ms-parent").css("z-index", 9999);
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
				var pdServiceVersionIds = [];
				versionListData = [];
				for (var k in data.response) {
					var obj = data.response[k];
					pdServiceVersionIds.push(obj.c_id);
					versionListData.push(obj);
					var newOption = new Option(obj.c_title, obj.c_id, true, false);
					$(".multiple-select").append(newOption);
				}

				if (data.length > 0) {
					console.log("display 재설정.");
				}

				console.log(pdServiceVersionIds);
				selectedVersionId = pdServiceVersionIds.join(",");
				console.log("bind_VersionData_By_PdService :: selectedVersionId");
				console.log(selectedVersionId);

				// 통계로드
				statisticsLoad($("#selected_pdService").val(), selectedVersionId);
				// 진행상태 가져오기
				progressLoad($("#selected_pdService").val(), selectedVersionId);
				// 작업자 정보
				resourceLoad($("#selected_pdService").val(), selectedVersionId);

				var endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/requirement-linkedissue.do?version="+selectedVersionId;
				// 이슈리스트 데이터테이블
				setReqStatusTable(endPointUrl);

                $("#deleted_issue_report_modal").on("shown.bs.modal", function(event) {
                    endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/deletedIssueList.do?version="+selectedVersionId;
                    getDeletedIssueData($("#selected_pdService").val(), endPointUrl)
                });


				$(".multiple-select").multipleSelect("refresh");
				//////////////////////////////////////////////////////////
			}
		}
	});
}

function setReqStatusTable(endPointUrl) {
   $.ajax({
      url: "/auth-user/api/arms/reqStatus" + endPointUrl,
      type: "GET",
      contentType: "application/json;charset=UTF-8",
      dataType: "json",
      progress: true,
      statusCode: {
         200: function (apiResponse) {

            let data = apiResponse.body;
            let tableData = processData(data);
            dataTableLoad("#reqstatustable", tableData);
         }
      }
   });
}

function processData(data) {

  const nodes = {};
  data.forEach(item => {
    nodes[item.key] = { ...item, children: [] };
  });

  // 트리 구성
  data.forEach(item => {
    if (!item.isReq && item.parentReqKey !== item.upperKey) {
      // 상위 항목의 children에 추가
      let parent = nodes[item.upperKey];
      while (parent && parent.upperKey !== parent.parentReqKey) {
        parent = nodes[parent.upperKey];
      }
      if (parent) {
        parent.children.push(nodes[item.key]);
      }
    }
  });

  // 상위 항목만 필터링
  return data.filter(item => item.isReq || (item.isReq === false && item.parentReqKey === item.upperKey)).map(item => nodes[item.key]);
}

function format(d) {
    return '<div class="child-table-container"><table class="display child-table" style="width:100%"><thead><tr><th>요구사항 구분</th><th>ALM Issue Key</th><th>Version</th><th>ALM Issue Title</th><th>ALM project</th><th>ALM Issue Type</th><th>ALM Assignee</th><th>ALM Priority</th><th>ALM Status</th><th>ALM Created</th><th>ALM Updated</th><th>ALM Resolution</th></tr></thead><tbody></tbody></table></div>';
}

function initializeChildTable(childrenData, container) {
    var columnList = [
        {
            name: "isReq",
            title: "요구사항 구분",
            data: "isReq",
            render: function (data, type, row, meta) {
                if (row.connectType === "subtask") {
                    return "<div style='color: #f8f8f8'>" + row.upperKey + "의 하위 이슈</div>";
                } else {
                    return "<div style='color: #f8f8f8'>" + row.upperKey + "의 연결 이슈</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "key",
            title: "ALM Issue Key",
            data: "key",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "pdServiceVersions",
            title: "Version",
            data: "pdServiceVersions",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    let verNameList = [];
                    let verHtml =``;
                        data.forEach(version_id => {
                        let versionInfo = versionListData.find(version => version["c_id"] === version_id);
                        if(versionInfo) {
                            verNameList.push(versionInfo["c_title"]);
                            verHtml+= versionInfo["c_title"]+`<br/>`;
                        }
                    });
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + verHtml + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "summary",
            title: "ALM Issue Title",
            data: "summary",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    let displayText = data;
                    if (row.deleted) {
                        displayText = "<s>" + data + "</s>";
                    }
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "project.project_key",
            title: "ALM project",
            data: "project.project_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "issuetype.issuetype_name",
            title: "ALM Issue Type",
            data: "issuetype.issuetype_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "assignee.assignee_displayName",
            title: "ALM Assignee",
            data: "assignee.assignee_displayName",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
                }
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "priority.priority_name",
            title: "ALM Priority",
            data: "priority.priority_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "status.status_name",
            title: "ALM Status",
            data: "status.status_name",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "created",
            title: "ALM Created",
            data: "created",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + dateFormat(data) + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "updated",
            title: "ALM Updated",
            data: "updated",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + dateFormat(data) + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        },
        {
            name: "resolutiondate",
            title: "ALM Resolution",
            data: "resolutiondate",
            render: function (data, type, row, meta) {
                if (isEmpty(data) || data === "false") {
                    return "<div style='color: #808080'>N/A</div>";
                } else {
                    return "<div style='white-space: nowrap; color: #f8f8f8'>" + dateFormat(data) + "</div>";
                }
                return data;
            },
            className: "dt-body-left",
            visible: true
        }
    ];

    var columnDefList = [{
        "defaultContent": "<div style='color: #808080'>N/A</div>",
        "targets": "_all"
    }];
    var orderList = [[2, "asc"]];
    var rowsGroupList = [];
    var buttonList = [];

    var childTable = container.find('table.child-table').DataTable({
        data: childrenData,
        columns: columnList,
        columnDefs: columnDefList,
        order: orderList,
        rowsGroup: rowsGroupList,
        buttons: buttonList,
        paging: false,
        searching: false,
        info: false,
        responsive: true,
        autoWidth: false
    });

    container.find('tbody').on('click', 'td.details-control', function() {
        var tr = $(this).closest('tr');
        var row = childTable.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        } else {
            row.child(format(row.data())).show();
            tr.addClass('shown');
            initializeChildTable(row.data().children, tr.next('tr').find('div.child-table-container'));
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////
//데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //
function dataTableLoad(table, tableData) {
	var columnList = [
		{ name: "parentReqKey", title: "부모 요구사항 키", data: "parentReqKey", visible: false },
		{
		    className: "details-control",
            orderable: false,
            data: null,
            title: '',
            defaultContent: '',
            render: function(data, type, row) {
                return row.children && row.children.length > 0 ? '<i class="fa fa-angle-down"></i>' : '';
            },
            visible: true
        },
		{
			name: "isReq",
			title: "요구사항 구분",
			data: "isReq",
			render: function (data, type, row, meta) {
                let parentReqKey = row.parentReqKey+"의 연결 이슈";
                let key = row.key;
                if (row.deleted) {
                    parentReqKey = "<s style='color: #808080'>" + parentReqKey + "</s>";
                    key = "<s style='color: #808080'>" + key + "</s>";
                }
				if (isEmpty(data) || data == false) {
					return "<div style='color: #f8f8f8'>" + parentReqKey + "</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + key + "</div>";
/*

					let btn_data_row = {
						pdServiceVersions : row.pdServiceVersions.join(","),
						jiraServerId : row.jira_server_id,
						issueKey : row.key
					};

					return ("<div style='white-space: nowrap; color: #a4c6ff'>" + row.key +
						$("<button class='btn btn-transparent btn-xs' />")
							.append($('<i class="fa fa-list-alt"></i>'))
							.attr("data-toggle", "modal")
							.attr("data-target","#subtask_linkedissue_modal")
							.attr("data-row", JSON.stringify(btn_data_row)).prop("outerHTML") +
						"</div>");

*/
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "key",
			title: "ALM Issue Key",
			data: "key",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
		            let displayText = data;
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					// data-row 에 API에 맞는 param 설정 예정.

					let btn_data_row1 = {
						pdServiceVersions : row.pdServiceVersions.join(","),
						cReqLink : row.creqLink
					};
					return ("<div style='white-space: nowrap; color: #a4c6ff'>" + displayText +
						$("<button class='btn btn-transparent btn-xs' style='margin-left:5px'/>")
							.append($('<i class="fa fa-list-alt"></i>'))
							.attr("data-toggle", "modal")
							.attr("data-target","#reqIssue_alongWith_modal")
							.attr("data-row", JSON.stringify(btn_data_row1)).prop("outerHTML") +
						"</div>");

				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "pdServiceVersions",
			title: "Version",
			data: "pdServiceVersions",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					let verNameList = [];
					let verHtml =``;
						data.forEach(version_id => {
						let versionInfo = versionListData.find(version => version["c_id"] === version_id);
						if(versionInfo) {
							verNameList.push(versionInfo["c_title"]);
							verHtml+= versionInfo["c_title"]+`<br/>`;
						}
					});
                    if (row.deleted) {
                        verHtml = "<s style='color: #808080'>" + verHtml + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + verHtml + "</div>";
					} else {
						return "<div style='white-space: nowrap; color: #a4c6ff'>" + verHtml + "</div>";
					}

				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "summary",
			title: "ALM Issue Title",
			data: "summary",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
		            let displayText = data;
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "project.project_key",
			title: "ALM project",
			data: "project.project_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
				    let displayText = data;
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "issuetype.issuetype_name",
			title: "ALM Issue Type",
			data: "issuetype.issuetype_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
				    let displayText = data;
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "assignee.assignee_displayName",
			title: "ALM Assignee",
			data: "assignee.assignee_displayName",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
				    let displayText = data;
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					} else {
						return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
					}

				}
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "priority.priority_name",
			title: "ALM Priority",
			data: "priority.priority_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
				    let displayText = data;
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "status.status_name",
			title: "ALM Status",
			data: "status.status_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
                    let displayText = data;
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "created",
			title: "ALM Created",
			data: "created",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
                    let displayText = dateFormat(data);
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + dateFormat(data) + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){

						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "updated",
			title: "ALM Updated",
			data: "updated",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
                    let displayText = dateFormat(data);
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" + dateFormat(data) + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
        {
			name: "deleted",
			title: "ALM Deleted",
			data: "deleted",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
                    let displayText = dateFormat(data);
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" +data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "resolutiondate",
			title: "ALM Resolution",
			data: "resolutiondate",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
                    let displayText = dateFormat(data);
                    if (row.deleted) {
                        displayText = "<s style='color: #808080'>" +data + "</s>";
                    }
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + displayText + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + displayText + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];

	var rowsGroupList = [];
	var columnDefList = [{
		"defaultContent": "<div style='color: #808080'>N/A</div>",
		"targets": "_all"
	}];
	var orderList = [[2, "asc"]];
	var jquerySelector = table;
	var ajaxUrl = "";
	var jsonRoot = "";
	var buttonList = [
		"copy",
		"excel",
		"print",
		{
			extend: "csv",
			text: "Export csv",
			charset: "utf-8",
			extension: ".csv",
			fieldSeparator: ",",
			fieldBoundary: "",
			bom: true
		},
		{
			extend: "pdfHtml5",
			orientation: "landscape",
			pageSize: "LEGAL"
		}
	];
	var selectList = {};
	var isServerSide = false;
	var isAjax = false;

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
		isServerSide,
		700,
		tableData,
		isAjax
	);

	$("#reqstatustable").on('page.dt', function() {
		scrollPos = $(window).scrollTop();
		$(window).scrollTop(scrollPos);
	});
}
// -------------------- 데이터 테이블을 만드는 템플릿으로 쓰기에 적당하게 리팩토링 함. ------------------ //

// 데이터 테이블 구성 이후 꼭 구현해야 할 메소드 : 열 클릭시 이벤트
function dataTableClick(tempDataTable, selectedData) {
	console.log(selectedData);
	selectedIssue = selectedData;
}

// 데이터 테이블 데이터 렌더링 이후 콜백 함수.
function dataTableCallBack(settings, json) {
	console.log("check");

    // 테이블 행 클릭 이벤트 (하위 이슈 조회)
	$('#reqstatustable tbody').on('click', 'td.details-control', function() {
          const tr = $(this).closest('tr');
          const row = reqStatusDataTable.row(tr);
          const icon = $(this).find('i');
          if (icon.length === 0) {
            return;
          }

          if (row.child.isShown()) {
             row.child.hide();
             tr.removeClass('shown');
             icon.removeClass('fa-angle-up').addClass('fa-angle-down');
          } else {
             row.child(format(row.data())).show();
             tr.addClass('shown');
             icon.removeClass('fa-angle-down').addClass('fa-angle-up');
             initializeChildTable(row.data().children, tr.next('tr').find('div.child-table-container'));
          }
       });
}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();
}

$("#copychecker").on("click", function () {
	reqStatusDataTable.button(".buttons-copy").trigger();
});
$("#printchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-print").trigger();
});
$("#csvchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-csv").trigger();
});
$("#excelchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-excel").trigger();
});
$("#pdfchecker").on("click", function () {
	reqStatusDataTable.button(".buttons-pdf").trigger();
});


function getLinkedIssueAndSubtask(notUse, endPointUrl) {
	var columnList = [
		{
			name: "issueID",
			title: "이슈아이디",
			data: "issueID",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "key",
			title: "ALM Issue Key",
			data: "key",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "parentReqKey",
			title: "부모이슈 키",
			data: "parentReqKey",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "summary",
			title: "ALM Issue Title ",
			data: "summary",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "issuetype.issuetype_name",
			title: "ALM Issue Type",
			data: "issuetype.issuetype_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "priority",
			title: "이슈 우선순위",
			data: "priority.priority_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "status.status_name",
			title: "이슈 상태",
			data: "status.status_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "reporter",
			title: "이슈 보고자",
			data: "reporter.reporter_displayName",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "assignee",
			title: "이슈 할당자",
			data: "assignee.assignee_displayName",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "created",
			title: "이슈 생성일자",
			data: "created",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "updated",
			title: "이슈 최근 업데이트 일자",
			data: "updated",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];

	var rowsGroupList = [];
	var columnDefList = [
		{
			orderable: false,
			className: "select-checkbox",
			targets: 0
		}
	];
	var orderList = [[1, "asc"]];
	var jquerySelector = "#linkedIssueAndSubtaskTable";
	var ajaxUrl = "/auth-user/api/arms/reqStatus" + endPointUrl;
	var jsonRoot = "";
	var buttonList = [];
	var selectList = {};
	var isServerSide = false;

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

function reqIssueAndItsSubtasksEvent() {
	let $modalBtn;
	let $modalBtn_alongWith;
	$("#subtask_linkedissue_modal").on("shown.bs.modal", function(event) {
		 $modalBtn = $(event.relatedTarget);
		 var selectedRow = $modalBtn.data("row");

		var endPointUrl = "/T_ARMS_REQSTATUS_" + selectedPdServiceId
			+ "/getIssueAndItsSubtasks.do?"
			+ "pdServiceVersions=" + selectedRow.pdServiceVersions
			+ "&jiraServerId=" + selectedRow.jiraServerId
			+ "&issueKey=" + selectedRow.issueKey;
		getReqIssueAndItsSubtasks(endPointUrl); // 데이터테이블 그리기
	});

	$("#reqIssue_alongWith_modal").on("shown.bs.modal", function(event) {
		$modalBtn_alongWith = $(event.relatedTarget);
		var selectedRow2 = $modalBtn_alongWith.data("row");
		var endPointUrl_2 = "/T_ARMS_REQSTATUS_" + selectedPdServiceId
			+ "/reqIssues-created-together.do?"
			+ "pdServiceVersions=" + selectedRow2.pdServiceVersions
			+ "&cReqLink=" + selectedRow2.cReqLink;
		getReqIssuesCreatedTogether(endPointUrl_2);
	});
}

function getReqIssueAndItsSubtasks(endPointUrl) {

	var columnList = [
		{
			name: "isReq",
			title: "요구사항 구분",
			data: "isReq",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data == false) {
					return "<div style='color: #808080'> 연결 이슈</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'> 요구사항 이슈</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "issueID",
			title: "이슈아이디",
			data: "issueID",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "key",
			title: "ALM Issue Key",
			data: "key",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					let serverType = getServerType(row.jira_server_id);
					let alm_link = makeALMIssueLink(serverType, row.self, data);

					return ("<div style='white-space: nowrap; color: #a4c6ff'>" + data +
						$("<button class='btn btn-transparent btn-xs' />")
							.append($('<i class="fa fa-link" style="transform: rotate(90deg)"></i>'))
							.attr("onclick", alm_link ? `window.open('${alm_link}', '_blank')` : "#")
							.prop("outerHTML") +
						"</div>");
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "parentReqKey",
			title: "부모이슈 키",
			data: "parentReqKey",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "summary",
			title: "ALM Issue Title ",
			data: "summary",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "issuetype.issuetype_name",
			title: "Issue Type",
			data: "issuetype.issuetype_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #808080'>" + data + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "priority",
			title: "Issue Priority",
			data: "priority.priority_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "status.status_name",
			title: "Issue Status",
			data: "status.status_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "reporter.reporter_displayName",
			title: "Issue Reporter",
			data: "reporter.reporter_displayName",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "assignee.assignee_displayName",
			title: "Issue Assignee",
			data: function (row, type, set, meta) {
				return row.assignee ? row.assignee.assignee_displayName : null;
			},
			render: function (data, type, row, meta) {
				//if (isEmpty(data) || data === "unknown") {
				if ([null, undefined, ""].includes(data)) {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "created",
			title: "ALM Created",
			data: "created",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "updated",
			title: "ALM Updated",
			data: "updated",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];

	var rowsGroupList = [];
	var columnDefList = [];
	var orderList = [[1, "asc"]];
	var jquerySelector = "#reqIssueAndItsSubtasksTable";
	var ajaxUrl = "/auth-user/api/arms/reqStatus" + endPointUrl;
	var jsonRoot = "response";
	var buttonList = [];
	var selectList = {};
	var isServerSide = false;
	var errorMode = false;

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
		isServerSide,
		errorMode
	);
}
function getReqIssuesCreatedTogether(endPointUrl) {
	var columnList = [
		{
			name: "summary",
			title: "ALM Issue Title ",
			data: "summary",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "key",
			title: "ALM Issue Key",
			data: "key",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					let serverType = getServerType(row.jira_server_id);
					let alm_link = makeALMIssueLink(serverType, row.self, data);

					return ("<div style='white-space: nowrap; color: #a4c6ff'>" + data +
						$("<button class='btn btn-transparent btn-xs' />")
							.append($('<i class="fa fa-link" style="transform: rotate(90deg)"></i>'))
							.attr("onclick", alm_link ? `window.open('${alm_link}', '_blank')` : "#")
							.prop("outerHTML") +
						"</div>");
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		///////////////// 지라프로젝트 정보 /////////////
		{
			name: "project.project_name",
			title: "ALM Project",
			data: "project.project_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #808080'>" + data + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "parentReqKey",
			title: "부모이슈 키",
			data: function (row, type, set, meta) {
				return row.parentReqKey ? row.parentReqKey : null;
			},
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "issuetype.issuetype_name",
			title: "Issue Type",
			data: "issuetype.issuetype_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #808080'>" + data + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "status.status_name",
			title: "Issue Status",
			data: "status.status_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "priority",
			title: "Issue Priority",
			data: "priority.priority_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "assignee.assignee_displayName",
			title: "Issue Assignee",
			data: function (row, type, set, meta) {
				return row.assignee ? row.assignee.assignee_displayName : null;
			},
			render: function (data, type, row, meta) {
				//if (isEmpty(data) || data === "unknown") {
				if ([null, undefined, ""].includes(data)) {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "reporter.reporter_displayName",
			title: "Issue Reporter",
			data: "reporter.reporter_displayName",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "created",
			title: "ALM Created",
			data: "created",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "updated",
			title: "ALM Updated",
			data: "updated",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + dateFormat(data) + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "isReq",
			title: "요구사항 구분",
			data: "isReq",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data == false) {
					return "<div style='color: #808080'> 연결 이슈</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'> 요구사항 이슈</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
		{
			name: "issueID",
			title: "이슈아이디",
			data: "issueID",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "unknown") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: false
		},
	];

	var rowsGroupList = [0];
	var columnDefList = [];
	var orderList = [[1, "asc"]];
	var jquerySelector = "#reqIssue_alongWith_table";
	var ajaxUrl = "/auth-user/api/arms/reqStatus" + endPointUrl;
	var jsonRoot = "response";
	var buttonList = [];
	var selectList = {};
	var isServerSide = false;
	var errorMode = false;

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
		isServerSide,
		errorMode
	);
}
function getDeletedIssueData(selectId, endPointUrl) {
    console.log(endPointUrl);
    console.log(selectId);
    var columnList = [
		{ name: "parentReqKey", title: "부모 요구사항 키", data: "parentReqKey", visible: false },
		{
			name: "isReq",
			title: "요구사항 구분",
			data: "isReq",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data == false) {
					return "<div style='color: #f8f8f8'>" + row.parentReqKey + "의 연결 이슈</div>";
				} else {
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + row.key + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "key",
			title: "ALM Issue Key",
			data: "key",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #808080'>N/A</div>";
				} else {
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
					}

					return ("<div style='white-space: nowrap; color: #a4c6ff'>" + data +"</div>");

				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "pdServiceVersions",
			title: "Version",
			data: "pdServiceVersions",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #f8f8f8'>N/A</div>";
				} else {
					let verNameList = [];
					let verHtml =``;
						data.forEach(version_id => {
						let versionInfo = versionListData.find(version => version["c_id"] === version_id);
						if(versionInfo) {
							verNameList.push(versionInfo["c_title"]);
							verHtml+= versionInfo["c_title"]+`<br/>`;
						}
					});
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + verHtml + "</div>";
					} else {
						return "<div style='white-space: nowrap; color: #a4c6ff'>" + verHtml + "</div>";
					}

				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "summary",
			title: "ALM Issue Title",
			data: "summary",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #f8f8f8'>N/A</div>";
				} else {
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "project.project_key",
			title: "ALM project",
			data: "project.project_name",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #f8f8f8'>N/A</div>";
				} else {
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
		{
			name: "assignee.assignee_displayName",
			title: "ALM Assignee",
			data: "assignee.assignee_displayName",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #f8f8f8'>N/A</div>";
				} else {
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" + data + "</div>";
					} else {
						return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
					}

				}
			},
			className: "dt-body-left",
			visible: true
		},
        {
			name: "deleted",
			title: "ALM Deleted",
			data: "deleted",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #f8f8f8'>N/A</div>";
				} else {
					if( isEmpty(row.isReq) || row.isReq == false){

						return "<div style='white-space: nowrap; color: #f8f8f8'>" + data+ "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + data + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		},
        {
			name: "deleted",
			title: "삭제 예정일",
			data: "deleted",
			render: function (data, type, row, meta) {
				if (isEmpty(data) || data === "false") {
					return "<div style='color: #f8f8f8'>N/A</div>";
				} else {
                    var date = new Date(data);
                    date.setDate(date.getDate()+2);
                    let year = date.getFullYear();
                    let month = String(date.getMonth() + 1).padStart(2, '0');
                    let day = String(date.getDate()).padStart(2, '0');

                    let newDateString = `${year}-${month}-${day}`;
					if( isEmpty(row.isReq) || row.isReq == false){
						return "<div style='white-space: nowrap; color: #f8f8f8'>" +newDateString + "</div>";
					}
					return "<div style='white-space: nowrap; color: #a4c6ff'>" + newDateString + "</div>";
				}
				return data;
			},
			className: "dt-body-left",
			visible: true
		}
	];

	var rowsGroupList = [];
	var columnDefList = [{
		"defaultContent": "<div style='color: #f8f8f8'>N/A</div>",
		"targets": "_all"
	}];
	var orderList = [[1, "asc"]];
	var jquerySelector = "#deletedIssueTable";
	var ajaxUrl = "/auth-user/api/arms/reqStatus" + endPointUrl;
	var jsonRoot = "body";
	var buttonList = [];
	var selectList = {};
	var isServerSide = false;

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

function getServerTypeMap() {
	$.ajax({
		url: "/auth-user/api/arms/jiraServerPure/serverTypeMap.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
		method: "GET",
		dataType: "json", // 서버에서 보내줄 데이터의 타입
		success: function(response) {
			console.log(response);
			jiraServerTypeMap = response;
		}
	});
}

var getServerType = function (server_id) {
	console.log("[ reqStatus :: getServerType ] :: server_id => " + server_id);
	if (jiraServerTypeMap.hasOwnProperty(server_id)) {
		let value = jiraServerTypeMap[server_id];
		console.log("[ reqStatus :: getServerType ] :: value => " + value);
		return value;
	} else {
		return "NO-TYPE";
	}
};


var makeALMIssueLink = function (server_type, self_link, issue_key) {
	let alm_link ="";
	switch (server_type) {
		case "클라우드" : // JIRA
			// "https://ABCDEFG.ABCDEFG.net/rest/api/3/issue/10187" => "https://ABCDEFG.ABCDEFG.net"
			let match_jc = self_link.match(/^(https?:\/\/[^\/]+)/);
			if (match_jc) {
				match_jc[1];
				alm_link = match_jc[1]+"/browse/"+issue_key;
			} else {
				console.log("makeALMIssueLink[JIRA_CLOUD] :: 링크 형식이 올바르지 않습니다. " +
					"link => " + self_link +", issue_key => " +issue_key);
			}
			break;
		case "온프레미스": // JIRA
			// "http://www.ABCDEFG.co.kr/jira/rest/api/latest/issue/24708" => "www.ABCDEFG.co.kr/jira"
			let match_jop = self_link.match(/^(https?:\/\/)?(www\.[^\/]+\/jira)/);
			if (match_jop) {
				match_jop[1];
				alm_link = match_jop[1]+"/browse/"+issue_key;
			} else {
				console.log("makeALMIssueLink[JIRA_ON_PREMISE] :: 링크 형식이 올바르지 않습니다. " +
					"link => " + self_link + ", issue_key => " +issue_key);
			}
			break;
		case "레드마인_온프레미스":
			alm_link = self_link.replace(/\.json$/, "");
			break;
		case "NO-TYPE" :
			console.log("makeALMIssueLink[NO-TYPE] :: 서버 타입이 없습니다. link => " + self_link +", issue_key => " +issue_key);
			alm_link = "";
			break;
	}
	console.log(alm_link);
	return alm_link;
}