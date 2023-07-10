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

	$.when(
		$.getJavascript("../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js"),

		$.getJavascript("../reference/lightblue4/docs/lib/d3/d3.min.js"),
		$.getJavascript("../reference/lightblue4/docs/lib/nvd3/build/nv.d3.min.js"),

		$.getJavascript("../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js"),

		$.getStylesheet("../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css"),
		$.getJavascript("../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js"),
		$.getStylesheet("../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css"),
		$.getJavascript("../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js"),
		$.getJavascript("../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js"),
		$.getStylesheet("../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css"),
		$.getJavascript("../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"),

		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css"),
		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css"),
		$.getStylesheet("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"),
		$.getJavascript("../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js")
	).done(function() {

		setSideMenu("sidebar_menu_product", "sidebar_menu_product_jira_connect");

		dataTableLoad();

		$.getScript("./js/pdServiceVersion/initd3chart.js").done(function (script, textStatus) {
			console.log("트리 차트 생성");
		});
	});

}

// --- 데이터 테이블 설정 --- //
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
	var jsonRoot = "response";
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
	selectedIndex = selectedData.selectedIndex;
	selectedPage = selectedData.selectedPage;
	selectId = selectedData.c_id;
	selectName = selectedData.c_title;
	$("#version_contents").html("");

	$(".searchable").multiSelect("deselect_all");
	$("#pdservice_connect").removeClass("btn-success");
	$("#pdservice_connect").addClass("btn-primary");
	$("#pdservice_connect").text("제품(서비스) Jira 연결 등록");

	//버전 리스트 로드
	dataLoad(selectedData.c_id, selectedData.c_title);

	// D3 업데이트
	updateD3ByDataTable();
}

function dataTableDrawCallback(tableInfo) {
	$("#" + tableInfo.sInstance)
		.DataTable()
		.columns.adjust()
		.responsive.recalc();
}

// 버전 리스트를 재로드하는 함수 ( 버전 추가, 갱신, 삭제 시 호출 )
function dataLoad(getSelectedText, selectedText) {
	// ajax 처리 후 에디터 바인딩.
	console.log("dataLoad :: getSelectedID → " + getSelectedText);
	$.ajax("/auth-user/api/arms/pdService/getVersionList.do?c_id=" + getSelectedText).done(function (json) {
		console.log("dataLoad :: success → ", json);
		versionList = json.response;
		$("#version_accordion").jsonMenu("set", json.response, { speed: 5000 });

		//version text setting
		var selectedHtml =
			`<div class="chat-message">
			<div class="chat-message-body" style="margin-left: 0px !important;">
				<span class="arrow"></span>
				<div class="sender" style="padding-bottom: 5px; padding-top: 3px;"> 제품(서비스) : </div>
			<div class="text" style="color: #a4c6ff;">
			` +  selectedText +
			`
			</div>
			</div>
			</div>
			<div class="gradient_bottom_border" style="width: 100%; height: 2px; padding-top: 10px;"></div>`;
		$(".list-group-item").html(selectedHtml);
		$("#tooltip_enabled_service_name").val(selectedText);

		updateD3ByVersionList();

		setTimeout(function () {
			$("#pdService_Version_First_Child").trigger("click");
		}, 500);
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

// version list html 삽입
function draw(main, menu) {
	main.html("");

	var data = `
			   <li class='list-group-item json-menu-header' style="padding: 0px; margin-bottom: 10px;">
				   <strong>product service name</strong>
			   </li>`;

	for (let i = 0; i < menu.length; i++) {
		if (i == 0) {
			data += `
			   <div class="panel">
				   <div class="panel-heading">
					   <a class="accordion-toggle collapsed"
					   			data-toggle="collapse"
					   			id="pdService_Version_First_Child"
					   			name="versionLink_List"
					   			style="color: #a4c6ff; text-decoration: none; cursor: pointer; background: rgba(229, 96, 59, 0.20);"
					   			onclick="versionClick(this, ${menu[i].c_id});">
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
					   			onclick="versionClick(this, ${menu[i].c_id});">
						   ${menu[i].c_title}
					   </a>
				   </div>
			   </div>`;
		}
	}

	main.html(data);
}

//버전 클릭할 때 동작하는 함수
function versionClick(element, c_id) {
	$("a[name='versionLink_List']").each(function () {
		this.style.background = "";
	});

	if (element == null) {
		console.log("element is empty");
	} else {
		element.style.background = "rgba(229, 96, 59, 0.20)";
		console.log("element is = " + element);
	}

	selectVersion = c_id;
	console.log("selectVersion" + selectVersion);
	$(".searchable").multiSelect("deselect_all");

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

			var multiSelectData = [];
			for (var k in data.response) {
				var obj = data.response[k];
				//var jira_name = obj.c_title;
				selectConnectID = obj.c_id;
				multiSelectData.push(obj.jiraproject_link);
				versionClickData.push(obj);
			}

			if (versionClickData.length == 0) {
				$("#pdservice_connect").removeClass("btn-success");
				$("#pdservice_connect").addClass("btn-primary");
				$("#pdservice_connect").text("제품(서비스) Jira 연결 등록");
				updateD3ByMultiSelect();
			} else {
				$("#pdservice_connect").removeClass("btn-primary");
				$("#pdservice_connect").addClass("btn-success");
				$("#pdservice_connect").text("제품(서비스) Jira 연결 변경");

				console.log("multiSelectData - " + multiSelectData.toString());
				$("#multiselect").multiSelect("select", multiSelectData.toString().split(","));
				updateD3ByMultiSelect();
			}
		})
		.fail(function (e) {
			console.log("fail call");
		})
		.always(function () {
			console.log("always call");
		});
}

// 제품(서비스)-버전-지라 저장
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
			.always(function () {
				console.log("always call");
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
			})
			.fail(function (e) {
				console.log("fail call");
			})
			.always(function () {
				console.log("always call");
			});
	} else {
		jError("who are you?");
	}
});


////////////////////////////////////////////////////////////////////////////////////////
// JIRA 프로젝트 데이터 로드 후 멀티 셀렉트 빌드 하고 슬림스크롤 적용
////////////////////////////////////////////////////////////////////////////////////////
/* --------------------------- multi select & slim scroll ---------------------------------- */
$(function () {
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

	//slim scroll
	$(".ms-list").slimscroll();
});

// 멀티 셀렉트 초기화 함수
function buildMultiSelect() {
	//multiselect
	$(".searchable").multiSelect({
		selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='try \"12\"'>",
		selectionHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='try \"4\"'>",
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

/* ----------------------- click action ------------------------- */
// var treeData = {
// 	name: "product service name",
// 	type: "Product(service)",
// 	children: [
// 		{
// 			name: "Visualization",
// 			type: "Jira JQL",
// 			children: [
// 				{
// 					name: "test",
// 					type: "Jira JQL",
// 				},
// 			],
// 		},
// 	],
// };
function updateD3ByDataTable() {
	treeData.children = [];

	treeData.name = selectName;
	treeData.type = "product(service)";

	update(treeData);
}

function updateD3ByVersionList() {
	console.log("versionList - " + versionList);

	treeData.children = [];
	for (var k in versionList) {
		var obj = versionList[k];
		var item = {};
		item["name"] = obj.c_title;
		item["type"] = "version";
		item.children = [];
		treeData.children.push(item);
	}
	console.log("==== updateD3ByVersionList :: treeData :: start ===");
	console.log(treeData);
	console.log("==== updateD3ByVersionList :: treeData :: end ===");
	update(treeData);
}

function updateD3ByMultiSelect() {
	treeData.children = [];
	var item = {};
	item["name"] = selectVersionName;
	item["type"] = "version";
	item.children = [];
	treeData.children.push(item);

	var test = $("#multiselect :selected").val();
	console.log("test-----" + test);
	if ($("#multiselect :selected").val() == undefined) {
		console.log("test-----");
		item.children = [];
	}
	$("#multiselect :selected").each(function (i, sel) {
		var temp = {};
		temp["name"] = $(sel).text();
		temp["type"] = "jira";
		item.children.push(temp);
	});

	update(treeData);
}

function d3Update() {
	if (typeof treeData.children == "undefined" || treeData.children == "" || treeData.children == null) {
		console.log("it is not inner element");
		treeData.children = [];
	} else {
		treeData.children.splice(0, treeData.children.length);
	}

	$("#sampleMultiTest :selected").each(function () {
		item = {};
		item["name"] = this.text;
		item["type"] = "Jira JQL";
		treeData.children.push(item);
	});
	update(root);
}

//데이터 테이블 ajax load 이후 콜백.
function dataTableCallBack(settings, json) {}
