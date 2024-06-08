////////////////////////////////////////////////////////////////////////////////////////
//Page 전역 변수
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디

////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {
	var pluginGroups = [
		["../reference/lightblue4/docs/lib/widgster/widgster.js"]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			setUrlParams();
			$(".widget").widgster();
			setSideMenu("sidebar_menu_product", "sidebar_menu_per_version");
			init_versionList();
			dataLoad();

			// --- 에디터 설정 --- //
			var waitCKEDITOR = setInterval(function () {
				try {
					if (window.CKEDITOR) {
						if (window.CKEDITOR.status === "loaded") {
							CKEDITOR.replace("version_contents", { skin: "office2013" });
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

function setUrlParams() {
	urlParams = new URL(location.href).searchParams;
	selectedPdService = urlParams.get("pdService");
	selectedPdServiceVersion = urlParams.get("pdServiceVersion");
	selectedJsTreeId = urlParams.get("reqAdd");
	selectedJiraServer = urlParams.get("jiraServer");
	selectedJiraProject = urlParams.get("jiraProject");
}

////////////////////////////////////////////////////////////////////////////////////////
//버전 리스트를 재로드하는 함수 ( 버전 추가, 갱신, 삭제 시 호출 )
////////////////////////////////////////////////////////////////////////////////////////
function dataLoad() {
	// ajax 처리 후 에디터 바인딩.
	console.log("dataLoad :: getSelectedID → " + selectedPdService);
	$.ajax("/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + selectedPdService).done(function (
		json
	) {
		console.log("dataLoad :: success → ", json);
		$("#version_accordion").jsonMenu("set", json.pdServiceVersionEntities, { speed: 5000 });
		//version text setting

		$("#select_Service").text(json.c_title); // sender 이름 바인딩
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// versionlist 이니셜라이즈
////////////////////////////////////////////////////////////////////////////////////////
function init_versionList() {
	var menu;
	$.fn.jsonMenu = function (action, items, options) {
		$(this).addClass("json-menu");
		if (action == "add") {
			menu.body.push(items);
			draw($(this), menu);
		} else if (action == "set") {
			menu = items;
			// $("#select_Version").text(items[0].c_title);  // 로드시 첫번째 버전
			draw($(this), menu);
		}
		return this;
	};
}

////////////////////////////////////////////////////////////////////////////////////////
//version list html 삽입
////////////////////////////////////////////////////////////////////////////////////////
function draw(main, menu) {
	main.html("");

	var data = "";
	for (var i = 0; i < menu.length; i++) {
		if (i == 0) {
			data += `
			   <div class="panel">
				   <div class="panel-heading">
					   <a class="accordion-toggle collapsed"
					   			data-toggle="collapse"
					   			name="versionLink_List"
					   			style="color: #a4c6ff; text-decoration: none; cursor: pointer;  "
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

////////////////////////////////////////////////////////////////////////////////////////
//버전 클릭할 때 동작하는 함수
//1. 상세보기 데이터 바인딩
//2. 편집하기 데이터 바인딩
////////////////////////////////////////////////////////////////////////////////////////
function versionClick(element, c_id) {
	console.log("versionClick:: c_id  -> ", c_id);
	$("a[name='versionLink_List']").each(function () {
		this.style.background = "";
	});
	element.style.background = "rgba(229, 96, 59, 0.3)";
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
			console.log(json);

			$("#select_Version").val(json.c_title);
			$("#version_start_date").val(json.c_pds_version_start_date);
			$("#version_end_date").val(json.c_pds_version_end_date);

			CKEDITOR.instances.version_contents.setData(json.c_pds_version_contents);
			CKEDITOR.instances.version_contents.setReadOnly(true);

			// sender 데이터 바인딩 및 선택 색상 표기
			$("#select_Version").text(json.c_title);
			$(".list-item1 .chat-message-body").css({ "border-left": "" });
			$(".list-item1 .arrow").css({ "border-right": "" });
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
