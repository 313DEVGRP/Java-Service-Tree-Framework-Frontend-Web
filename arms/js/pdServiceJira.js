var selectId; // 제품 아이디
var selectName; // 제품 이름
var selectedIndex; // 데이터테이블 선택한 인덱스
var selectedPage; // 데이터테이블 선택한 인덱스
var selectVersion; // 선택한 버전 아이디
var selectVersionName; // 선택한 버전 이름
var dataTableRef; // 데이터테이블 참조 변수
var selectConnectID; // 제품(서비스) - 버전 - 지라 연결 정보 아이디
var versionList;

function execDocReady() {

	var pluginGroups = [
		[	"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/lightblue4/docs/lib/d3/d3.min.js",
			"../reference/lightblue4/docs/lib/nvd3/build/nv.d3.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"],

		[	"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"],

		[	"../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
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
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js",
			"../reference/jquery-plugins/html2canvas-1.4.1/html2canvas.js"
		]
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function() {

			//vfs_fonts 파일이 커서 defer 처리 함.
			setTimeout(function() {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 3000); // 2초 후에 실행됩니다.
			console.log('모든 플러그인 로드 완료');

			//사이드 메뉴 처리
			$('.widget').widgster();
			setSideMenu("sidebar_menu_jira", "sidebar_menu_product_jira_connect");

			// 데이터 테이블 로드 함수
			var waitDataTable = setInterval(function () {
				try {
					if (!$.fn.DataTable.isDataTable("#pdservice_table")) {
						dataTableLoad();
						clearInterval(waitDataTable);
					}
				} catch (err) {
					console.log("서비스 데이터 테이블 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);


			setdata_for_multiSelect();
			connect_pdservice_jira();
			init_versionList();
			downloadChartImage();

			$.getScript("./js/pdServiceVersion/initD3Chart.js").done(function (script, textStatus) {
				initD3Chart("/auth-user/api/arms/pdService/getD3ChartData.do");
			});

			//스크립트 실행 로직을 이곳에 추가합니다.



		})
		.catch(function() {
			console.error('플러그인 로드 중 오류 발생');
		});

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
				if (type === "display") { //// 렌더링 시 이름을 라벨로 감싸서 표시
					return '<label style="color: #a4c6ff">' + data + "</label>";
				}

				return data;
			},
			className: "dt-body-left",  // 좌측 정렬
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
	var jsonRoot = "response";
	var isServerSide = false;
	console.log("jsonRoot:", jsonRoot);

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

	selectedIndex = selectedData.selectedIndex;
	selectedPage = selectedData.selectedPage;
	selectId = selectedData.c_id;
	selectName = selectedData.c_title;
	pdServiceDataTableClick(selectedData.c_id);

	// console.log("selectedIndex:::::" + selectedIndex);
	// console.log("dataTableClick:: dataTableClick -> " + selectedData.c_id);

	$("#version_contents").html("");

	$(".searchable").multiSelect("deselect_all");  // // 멀티셀렉트에서 모든 선택 해제
	$("#pdservice_connect").removeClass("btn-success");
 	$("#pdservice_connect").addClass("btn-primary");
	$("#pdservice_connect").text("제품(서비스) Jira 연결 등록");

	//초기 태그 삭제
	$("#initDefaultVersion").remove();

	// //버전 리스트 로드
	dataLoad(selectedData.c_id, selectedData.c_title);



	// D3 업데이트
	// updateD3ByDataTable();

}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();
}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(settings, json) {}

////////////////////////////////////////////////////////////////////////////////////////
// 버전 리스트를 재로드하는 함수 ( 버전 추가, 갱신, 삭제 시 호출 )
////////////////////////////////////////////////////////////////////////////////////////
function dataLoad(getSelectedText, selectedText) {
	// ajax 처리 후 에디터 바인딩.
	console.log("dataLoad :: getSelectedID → " + getSelectedText);

	$.ajax("/auth-user/api/arms/pdService/getVersionList.do?c_id=" + getSelectedText).done(function (json) {
		console.log("dataLoad :: success → ", json);
		versionList = json.response;
		console.log("dataLoad :: versionList → ", versionList);
		$("#version_accordion").jsonMenu("set", json.response, { speed: 5000 });

		var selectedHtml =
			` 
 			<div class="chat-message">
				<div    class="chat-message-body"
						style="margin-left: 0px !important; padding:!important;  border-left: 2px solid #a4c6ff; border-right: 2px solid #e5603b;">
					 <span  id="toRight"
							class="arrow"
							style="top: 10px !important; right: -7px; border-top: 5px solid transparent;
							border-bottom: 5px solid transparent;
							border-left: 5px solid #e5603b; border-right: 0px; left:unset;"></span>
					<span   class="arrow"
							style="top: 10px !important; border-right: 5px solid #a4c6ff;"></span>
					<div    class="sender"
							style="padding-bottom: 5px; padding-top: 5px">
						선택된 제품(서비스) :
						<span style="color: #a4c6ff;">
							` +  selectedText + `
						</span>
					</div>
				</div>
			</div>
			`;

		$(".list-group-item").html(selectedHtml);

		$("#tooltip_enabled_service_name").val(selectedText);


		//updateD3ByVersionList();
		console.log("===========================================");

		setTimeout(function () {
			$("#pdService_Version_First_Child").trigger("click");
		}, 500);
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// versionlist 이니셜라이즈
////////////////////////////////////////////////////////////////////////////////////////
function init_versionList() {
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
}

////////////////////////////////////////////////////////////////////////////////////////
// version list html 삽입
////////////////////////////////////////////////////////////////////////////////////////
function draw(main, menu) {
	console.log("menu :: " + JSON.stringify(menu));
	console.table(menu);
	console.log("test data:: " + selectName);


	main.html("");
	var data ="";

	for (let i = 0; i < menu.length; i++) {

		if (i == 0) {  // select version\
			data += `
			   <div class="panel">
				   <div class="panel-heading">
					   <a class="accordion-toggle collapsed"
					   			data-toggle="collapse"
					   			id="pdService_Version_First_Child"
					   			name="versionLink_List"
					   			style="color: #a4c6ff; text-decoration: none; cursor: pointer;  "
           						onclick="versionClicks(this, ${menu[i].c_id}, '${menu[i].c_title}')">
						    ${menu[i].c_title}
 					   </a>
				   </div>
			   </div>`;
		} else {  // basic version
			data += `
			   <div class="panel">
				   <div class="panel-heading">
					   <a class="accordion-toggle collapsed"
					   			data-toggle="collapse"
					   			name="versionLink_List"
					   			style="color: #a4c6ff; text-decoration: none; cursor: pointer; "
           						onclick="versionClicks(this, ${menu[i].c_id}, '${menu[i].c_title}')">
						   ${menu[i].c_title}
					   </a>
				   </div>
			   </div>`;
		}
	}

	main.html(data);
}

////////////////////////////////////////////////////////////////////////////////////////
//버전 클릭할 때 동작하는 함수
////////////////////////////////////////////////////////////////////////////////////////
function versionClicks(element, c_id, c_title) {
	selectVersion = c_id;  // version c_id
	// console.log("versionClick:: c_id  -> ", c_id);
	// console.log("versionClick:: c_title  -> ", c_title);
	// console.log("versionClick:: element  -> ", element);

	var coloredTitleHtml =
		`<div class="chat-message">
				<div class="chat-message-body" style="margin-left: 0px !important; border-left: 2px solid #e5603b;  ">
					<span 	class="arrow"
							style="top: 17px !important; border-right: 5px solid #e5603b;">
					</span>
					 <div    class="sender"
							style="padding-bottom: 5px; padding-top: 3px">
						<i class="fa fa-check"></i>
						선택된 제품
						<sup>서비스</sup> :
						<span   id="select_PdService"
								style="color: #a4c6ff">
								 ` +  selectName + `
						</span>
					</div>
					<div    class="sender"
							style="padding-bottom: 5px; padding-top: 3px">
						<i class="fa fa-check"></i> 선택된 버전 :
						<span   id="select_Version"
								style="color: #a4c6ff">
							   ` +  c_title + `
						</span>
					</div>
				</div>
			</div>`;
	console.log("dataLoad :: coloredTitleHtml - >", coloredTitleHtml);

	$(".list-item").html(coloredTitleHtml);

	$("a[name='versionLink_List']").each(function () {
		this.style.background = "";
	});


	if (element == null) {
		console.log("element is empty");
	} else {
		element.style.background = "rgba(229, 96, 59, 0.20)";
		console.log("element is = " + element);
	}
	console.log("click :: C_ID ->  " + c_id);

	$(".searchable").multiSelect("deselect_all");  //선택된 항목들을 모두 선택 해제(해당 요소들에서 선택을 없애는)하는 코드
	// console.log("pdservice_link -> " +   $("#pdservice_table").DataTable().rows(".selected").data()[0].c_id);
	// console.log("pdserviceversion_link -> " +  c_id );

	// 이미 등록된 제품(서비스)-버전-지라 연결 정보가 있는지 확인
	$.ajax({
		url: "/auth-user/api/arms/globaltreemap/getConnectInfo/pdService/pdServiceVersion/jiraProject.do",
		type: "GET",
		data: {
			pdservice_link: $("#pdservice_table").DataTable().rows(".selected").data()[0].c_id,
			pdserviceversion_link: c_id
		},
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true
	})
		.done(function (data) {
			var versionClickData = [];
			// console.log("response data check::  " + data.response);
			// console.log("===============================111111===========");
			// console.table( $("#pdservice_table").DataTable().rows(".selected").data()[0]);

			// console.log("response data check:: data.response ->   " + JSON.stringify(data.response));
			// console.log("response data check:: data.response.pdServiceVersionEntities ->   " + JSON.stringify(data.response.pdServiceVersionEntities));
			// console.log("==========================================");



			var multiSelectData = [];
			for (var k in data.response) {

				var obj = data.response[k];
				console.log("response data check:: obj ->   " + JSON.stringify(obj));
				console.table(obj);
				console.log("push obj.jiraproject_link :: => " + obj.jiraproject_link);

				//var jira_name = obj.c_title;
				// selectConnectID = obj.c_id;
				// console.log("selectConnectID: " + selectConnectID);
				multiSelectData.push(obj.jiraproject_link);
				console.log("push jiraproject :: => " + multiSelectData.push(obj.jiraproject_link));

				versionClickData.push(obj);
			}

			if (versionClickData.length == 0) {
				$("#pdservice_connect").removeClass("btn-success");
				$("#pdservice_connect").addClass("btn-primary");
				$("#pdservice_connect").text("제품(서비스) Jira 연결 등록");
				console.log("versionClickData length 0 ==");
				// updateD3ByMultiSelect(obj);
			} else {
				$("#pdservice_connect").removeClass("btn-primary");
				$("#pdservice_connect").addClass("btn-success");
				$("#pdservice_connect").text("제품(서비스) Jira 연결 변경");

				console.log("multiSelectData - " + multiSelectData.toString());
				console.log("multiSelectData - " + multiSelectData);
				$("#multiselect").multiSelect("select", multiSelectData.toString().split(","));


				//updateD3ByMultiSelect();
			}
		})
		.fail(function (e) {
			console.log("fail call");
		})
		.always(function () {
			console.log("always call");
		});
}

////////////////////////////////////////////////////////////////////////////////////////
// 제품(서비스)-버전-지라 저장
////////////////////////////////////////////////////////////////////////////////////////
function connect_pdservice_jira(){
	// console.log("pdservice_jira::: pdservice_version_id -> " + selectVersion);
	$("#pdservice_connect").click(function () {
		if ($("#pdservice_connect").hasClass("btn-primary") == true) {
			// data가 존재하지 않음.
			$.ajax({
				url: "/auth-user/api/arms/globaltreemap/setConnectInfo/pdService/pdServiceVersion/jiraProject.do",
				type: "POST",
				data: {
					pdservice_link: $("#pdservice_table").DataTable().rows(".selected").data()[0].c_id,
					pdserviceversion_link: selectVersion,
					c_pdservice_jira_ids: JSON.stringify($("#multiselect").val())
				},
				progress: true
			})
				.done(function (data) {
					//versionClick(null, selectVersion);
					jSuccess("제품(서비스) - 버전 - JiraProject 가 연결되었습니다.");
				})
				.fail(function (e) {
					console.log("fail call");
				})
				.always(function (data) {
					console.log("always call");
					console.log("데이터 연결 등록  완료!");
					console.log('multiselect data -> ' + JSON.stringify($("#multiselect").val()));

				});
		} else if ($("#pdservice_connect").hasClass("btn-success") == true) {
			// data가 이미 있음
			$.ajax({
				url: "/auth-user/api/arms/globaltreemap/setConnectInfo/pdService/pdServiceVersion/jiraProject.do",
				type: "POST",
				data: {
					pdservice_link: $("#pdservice_table").DataTable().rows(".selected").data()[0].c_id,
					pdserviceversion_link: selectVersion,
					c_pdservice_jira_ids: JSON.stringify($("#multiselect").val())
				},
				progress: true
			})
				.done(function (data) {
					//versionClick(null, selectVersion);
					jSuccess("제품(서비스) - 버전 - JiraProject 가 연결되었습니다.");
					console.log('connect data -> ' + data);
				})
				.fail(function (e) {
					console.log("fail call");
				})
				.always(function (data) {
					console.log("always call");
					console.log("이미 있는데이터 변경 완료 !");
					console.table( data);

				});

		} else {
			jError("who are you?");
		}
	});
}


////////////////////////////////////////////////////////////////////////////////////////
// JIRA 프로젝트 데이터 로드 후 멀티 셀렉트 빌드 하고 슬림스크롤 적용
////////////////////////////////////////////////////////////////////////////////////////
/* --------------------------- multi select & slim scroll ---------------------------------- */
function setdata_for_multiSelect() {
	$.ajax({
		url: "/auth-user/api/arms/jiraProject/getChildNode.do?c_id=2",
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true
	})
		.done(function (data) {
			var optionData = [];
			for (var k in data) {
				var obj = data[k];
				var jira_name = obj.c_title;
				var jira_idx = obj.c_id;

				optionData.push("<option value='" + jira_idx + "'>" + jira_name + "</option>");
			}

			$(".searchable").html(optionData.join(""));

			////////////////////////////////////////////////
			// 멀티 셀렉트 빌드
			buildMultiSelect();
			////////////////////////////////////////////////
		})
		.fail(function (e) {
			console.log("fail call");
		})
		.always(function () {
			console.log("always call");
		});

}

////////////////////////////////////////////////////////////////////////////////////////
// 멀티 셀렉트 초기화 함수
////////////////////////////////////////////////////////////////////////////////////////
function buildMultiSelect() {
	//multiselect
	$(".searchable").multiSelect({
		selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='Search Jira Project'>",
		selectionHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='Selected Jira Project'>",
		afterInit: function (ms) {
			var that = this,
				$selectableSearch = that.$selectableUl.prev(),
				$selectionSearch = that.$selectionUl.prev(),
				selectableSearchString = "#" + that.$container.attr("id") + " .ms-elem-selectable:not(.ms-selected)",
				selectionSearchString = "#" + that.$container.attr("id") + " .ms-elem-selection.ms-selected";

			that.qs1 = $selectableSearch.quicksearch(selectableSearchString).on("keydown", function (e) {
				if (e.which === 40) {
					that.$selectableUl.focus();
					return false;
				}
			});

			that.qs2 = $selectionSearch.quicksearch(selectionSearchString).on("keydown", function (e) {
				if (e.which == 40) {
					that.$selectionUl.focus();
					return false;
				}
			});

			//slim scroll
			$(".ms-list").slimscroll({
				//size: '8px',
				//width: '100%',
				//height: 'fit-content',
				height: "450px"
				//color: '#ff4800',
				//allowPageScroll: true,
				//alwaysVisible: false,
				//railVisible: true,
				// scroll amount applied to each mouse wheel step
				//wheelStep: 20,
				// scroll amount applied when user is using gestures
				//touchScrollStep: 200,
				// distance in pixels between the side edge and the scrollbar
				//distance: '10px',
			});
		},
		afterSelect: function (value, text) {
			this.qs1.cache();
			this.qs2.cache();
			//d3Update();
		},
		afterDeselect: function (value, text) {
			this.qs1.cache();
			this.qs2.cache();
			//d3Update();
		}
	});
}


////////////////////////////////////////////////////////////////////////////////////////
//제품(서비스) 클릭할 때 동작하는 함수
//1. 상세보기 데이터 바인딩
//2. 편집하기 데이터 바인딩
////////////////////////////////////////////////////////////////////////////////////////
function pdServiceDataTableClick(c_id) {
	// selectVersion = c_id;
	// console.log("pdSerivceDataTableClick:: selectVersion -> " + selectVersion);
	// console.log("pdSerivceDataTableClick:: c_id -> " + c_id);

	$.ajax({
		url: "/auth-user/api/arms/pdService/getNode.do", // 클라이언트가 HTTP 요청을 보낼 서버의 URL 주소
		data: { c_id: c_id }, // HTTP 요청과 함께 서버로 보낼 데이터
		method: "GET", // HTTP 요청 메소드(GET, POST 등)
		dataType: "json", // 서버에서 보내줄 데이터의 타입
		beforeSend: function () {
			$(".loader").removeClass("hide");
		}
	})
		// HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
		.done(function (json) {
			$("#detailview_pdservice_name").val(json.c_title);

			var selectedHtml =
				` <div class="chat-message">
					<div    class="chat-message-body"
							style="margin-left: 0px !important; padding:!important;  border-left: 2px solid #a4c6ff; border-right: 2px solid #e5603b;">
						 <span  id="toRight"
								class="arrow"
								style="top: 10px !important; right: -7px; border-top: 5px solid transparent;
								border-bottom: 5px solid transparent;
								border-left: 5px solid #e5603b; border-right: 0px; left:unset;"></span>
						<span   class="arrow"
								style="top: 10px !important; border-right: 5px solid #a4c6ff;"></span>
						<div    class="sender"
								style="padding-bottom: 5px; padding-top: 5px">
							선택된 제품(서비스) :
							<span style="color: #a4c6ff;">
								` + json.c_title + `
							</span>
						</div>
					</div>
				</div>`;

			$(".list-group-item").html(selectedHtml);

			$("#detailview_pdservice_name").val(json.c_title);
			if (isEmpty(json.c_pdservice_owner) || json.c_pdservice_owner == "none") {
				$("#detailview_pdservice_owner").val("책임자가 존재하지 않습니다.");
			} else {
				$("#detailview_pdservice_owner").val(json.c_pdservice_owner);
			}

			if (isEmpty(json.c_pdservice_reviewer01) || json.c_pdservice_reviewer01 == "none") {
				$("#detailview_pdservice_reviewer01").val("리뷰어(연대책임자)가 존재하지 않습니다.");
			} else {
				$("#detailview_pdservice_reviewer01").val(json.c_pdservice_reviewer01);
			}

			if (isEmpty(json.c_pdservice_reviewer02) || json.c_pdservice_reviewer02 == "none") {
				$("#detailview_pdservice_reviewer02").val("2번째 리뷰어(연대책임자) 없음");
			} else {
				$("#detailview_pdservice_reviewer02").val(json.c_pdservice_reviewer02);
			}

			if (isEmpty(json.c_pdservice_reviewer03) || json.c_pdservice_reviewer03 == "none") {
				$("#detailview_pdservice_reviewer03").val("3번째 리뷰어(연대책임자) 없음");
			} else {
				$("#detailview_pdservice_reviewer03").val(json.c_pdservice_reviewer03);
			}

			if (isEmpty(json.c_pdservice_reviewer04) || json.c_pdservice_reviewer04 == "none") {
				$("#detailview_pdservice_reviewer04").val("4번째 리뷰어(연대책임자) 없음");
			} else {
				$("#detailview_pdservice_reviewer04").val(json.c_pdservice_reviewer04);
			}

			if (isEmpty(json.c_pdservice_reviewer05) || json.c_pdservice_reviewer05 == "none") {
				$("#detailview_pdservice_reviewer05").val("5번째 리뷰어(연대책임자) 없음");
			} else {
				$("#detailview_pdservice_reviewer05").val(json.c_pdservice_reviewer05);
			}
			$("#detailview_pdservice_contents").html(json.c_pdservice_contents);

			$("#editview_pdservice_name").val(json.c_title);

			//clear
			$("#editview_pdservice_owner").val(null).trigger("change");

			if (json.c_pdservice_owner == null || json.c_pdservice_owner == "none") {
				console.log("pdServiceDataTableClick :: json.c_pdservice_owner empty");
			} else {
				var newOption = new Option(json.c_pdservice_owner, json.c_pdservice_owner, true, true);
				$("#editview_pdservice_owner").append(newOption).trigger("change");
			}
			// -------------------- reviewer setting -------------------- //
			//reviewer clear
			$("#editview_pdservice_reviewers").val(null).trigger("change");

			var selectedReviewerArr = [];
			if (json.c_pdservice_reviewer01 == null || json.c_pdservice_reviewer01 == "none") {
				console.log("pdServiceDataTableClick :: json.c_pdservice_reviewer01 empty");
			} else {
				selectedReviewerArr.push(json.c_pdservice_reviewer01);
				// Set the value, creating a new option if necessary
				if ($("#editview_pdservice_reviewers").find("option[value='" + json.c_pdservice_reviewer01 + "']").length) {
					console.log('option[value=\'" + json.c_pdservice_reviewer01 + "\']"' + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption01 = new Option(json.c_pdservice_reviewer01, json.c_pdservice_reviewer01, true, true);
					// Append it to the select
					$("#editview_pdservice_reviewers").append(newOption01).trigger("change");
				}
			}
			if (json.c_pdservice_reviewer02 == null || json.c_pdservice_reviewer02 == "none") {
				console.log("pdServiceDataTableClick :: json.c_pdservice_reviewer02 empty");
			} else {
				selectedReviewerArr.push(json.c_pdservice_reviewer02);
				// Set the value, creating a new option if necessary
				if ($("#editview_pdservice_reviewers").find("option[value='" + json.c_pdservice_reviewer02 + "']").length) {
					console.log('option[value=\'" + json.c_pdservice_reviewer02 + "\']"' + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption02 = new Option(json.c_pdservice_reviewer02, json.c_pdservice_reviewer02, true, true);
					// Append it to the select
					$("#editview_pdservice_reviewers").append(newOption02).trigger("change");
				}
			}
			if (json.c_pdservice_reviewer03 == null || json.c_pdservice_reviewer03 == "none") {
				console.log("pdServiceDataTableClick :: json.c_pdservice_reviewer03 empty");
			} else {
				selectedReviewerArr.push(json.c_pdservice_reviewer03);
				// Set the value, creating a new option if necessary
				if ($("#editview_pdservice_reviewers").find("option[value='" + json.c_pdservice_reviewer03 + "']").length) {
					console.log('option[value=\'" + json.c_pdservice_reviewer03 + "\']"' + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption03 = new Option(json.c_pdservice_reviewer03, json.c_pdservice_reviewer03, true, true);
					// Append it to the select
					$("#editview_pdservice_reviewers").append(newOption03).trigger("change");
				}
			}
			if (json.c_pdservice_reviewer04 == null || json.c_pdservice_reviewer04 == "none") {
				console.log("pdServiceDataTableClick :: json.c_pdservice_reviewer04 empty");
			} else {
				selectedReviewerArr.push(json.c_pdservice_reviewer04);
				// Set the value, creating a new option if necessary
				if ($("#editview_pdservice_reviewers").find("option[value='" + json.c_pdservice_reviewer04 + "']").length) {
					console.log('option[value=\'" + json.c_pdservice_reviewer04 + "\']"' + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption04 = new Option(json.c_pdservice_reviewer04, json.c_pdservice_reviewer04, true, true);
					// Append it to the select
					$("#editview_pdservice_reviewers").append(newOption04).trigger("change");
				}
			}
			if (json.c_pdservice_reviewer05 == null || json.c_pdservice_reviewer05 == "none") {
				console.log("pdServiceDataTableClick :: json.c_pdservice_reviewer05 empty");
			} else {
				selectedReviewerArr.push(json.c_pdservice_reviewer05);
				// Set the value, creating a new option if necessary
				if ($("#editview_pdservice_reviewers").find("option[value='" + json.c_pdservice_reviewer05 + "']").length) {
					console.log('option[value=\'" + json.c_pdservice_reviewer05 + "\']"' + "already exist");
				} else {
					// Create a DOM Option and pre-select by default
					var newOption05 = new Option(json.c_pdservice_reviewer05, json.c_pdservice_reviewer05, true, true);
					// Append it to the select
					$("#editview_pdservice_reviewers").append(newOption05).trigger("change");
				}
			}
			$("#editview_pdservice_reviewers").val(selectedReviewerArr).trigger("change");

			// ------------------------- reviewer end --------------------------------//

			// CKEDITOR.instances.input_pdservice_editor.setData(json.c_pdservice_contents);
		})
		// HTTP 요청이 실패하면 오류와 상태에 관한 정보가 fail() 메소드로 전달됨.
		.fail(function (xhr, status, errorThrown) {
			console.log(xhr + status + errorThrown);
		})
		//
		.always(function (xhr, status) {
			console.log(xhr + status);
			$(".loader").addClass("hide");
		});

	$("#delete_text").text($("#pdservice_table").DataTable().rows(".selected").data()[0].c_title);
}

////////////////////////////////////////////////////////////////////////////////////////
// 이미지 다운로드
////////////////////////////////////////////////////////////////////////////////////////
function downloadChartImage() {
	$("#imageDownload").click( function () {
		// html2canvas 라이브러리를 사용하여 이미지로 렌더링
		html2canvas($(".darkBack")[0], {
			backgroundColor: null, // 기본 백그라운드 색상을 유지하기 위해 null로 설정
		}).then(function (canvas) {
			// 이미지 다운로드 링크 생성
			var downloadLink = document.createElement("a");
			downloadLink.download = "darkBack_image.png";
			downloadLink.href = canvas.toDataURL("image/png");

			// 이미지 다운로드
			downloadLink.click();
		});
	});
}



