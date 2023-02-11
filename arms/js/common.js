////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
$(function () {

	// Page load & 상단 페이지 로드 프로그래스바
	topbarConfig();
	topbar.show();
	setTimeout(function () {
		$(".container").fadeIn("slow");
		topbar.hide();
	}, 2000);

	/* 맨위로 아이콘 */
	rightBottomTopForwardIcon();

	var urlParams = new URL(location.href).searchParams;
	var page = urlParams.get('page');

	if(ajax_setup()){
		if(includeLayout(page)) {
			if(authUserCheck()){
				$.getScript('js/' + page + ".js", function(){
					setTimeout(function(){
						/* 로그인 인증 여부 체크 함수 */
							execDocReady();
					},500);
				});
			}
		}
	}


	var onlyContents = urlParams.get('withoutLayer');
	if(isEmpty(onlyContents)){
		$("body").removeAttr('class');
	}else{
		$("body").addClass('sidebar-hidden');
		$("header.page-header").hide();
	}

});

// include 레이아웃 html 파일을 로드하는 함수
function includeLayout(page) {
	var includeArea = $("[data-include]");
	var self, url;
	$.each(includeArea, function () {

		self = $(this);
		url = self.data("include");
		console.log(url);

		if( url.indexOf( "content-header" ) !== -1 ){

			url = "html/" + page + "/content-header.html";
			self.load(url, function () {
				self.removeAttr("data-include");
			});

		}else if( url.indexOf( "content-container" ) !== -1 ){

			url = "html/" + page + "/content-container.html";
			self.load(url, function () {
				self.removeAttr("data-include");
			});

		}else{
			self.load(url, function () {
				self.removeAttr("data-include");
			});
		}

	});

	return true;
}

////////////////////////////////////////////////////////////////////////////////////////
//인증관련 공통 변수
////////////////////////////////////////////////////////////////////////////////////////
var userName;
var userApplicationRoles;
var userAttributes;
var userEnabled;
var userGroups;
var userID;
var userRealmRoles;
var permissions;

////////////////////////////////////////////////////////////////////////////////////////
// 상단 페이지 로드 프로그래스바 설정
////////////////////////////////////////////////////////////////////////////////////////
function topbarConfig() {
	topbar.config({
		autoRun: true,
		barThickness: 3,
		barColors: {
			0: "rgba(26,  188, 156, .9)",
			".25": "rgba(52,  152, 219, .9)",
			".50": "rgba(241, 196, 15,  .9)",
			".75": "rgba(230, 126, 34,  .9)",
			"1.0": "rgba(211, 84,  0,   .9)",
		},
		shadowBlur: 10,
		shadowColor: "rgba(0,   0,   0,   .6)",
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
// 맨위로 아이콘
////////////////////////////////////////////////////////////////////////////////////////
function rightBottomTopForwardIcon(){
	$("#topicon").click(function () {
		$("html, body").animate({ scrollTop: 0 }, 400);
		return false;
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// 로그인 인증 여부 체크 함수
////////////////////////////////////////////////////////////////////////////////////////
function authUserCheck() {
	$.ajax({
		url: "/auth-check" + "/identity",
		type: "GET",
		timeout: 7313,
		global: false,
		statusCode: {
			200: function (json) {
				console.log("authUserCheck :: userName = " + json.name);
				console.log("authUserCheck :: permissions = " + json.permissions);
				userName = json.name;
				permissions = json.permissions;

				getUserInfo();
			}
		},
	});

	return true;
}

////////////////////////////////////////////////////////////////////////////////////////
// 사용자 정보 로드 함수
////////////////////////////////////////////////////////////////////////////////////////
function getUserInfo() {
	$.ajax({
		url: "/auth-check/getUsers/"+userName,
		data: {
			sendData: ""
		},
		type: "GET",
		progress: true,
		statusCode: {
			200: function (json) {
				console.log("authUserCheck length = :: " + json.length);
				if( json.length > 1 ){
					jError("중복된 사용자가 있습니다.");
				}else if( json.length == 0 ){
					jError("사용자 정보가 조회되지 않습니다.");
				}else {
					userApplicationRoles = json[0].applicationRoles;
					userAttributes = json[0].attributes;
					userEnabled = json[0].enabled;
					userGroups = json[0].groups;
					userID = json[0].id;
					userRealmRoles = json[0].realmRoles;
					console.log("authUserCheck :: userApplicationRoles = " + userApplicationRoles);
					console.log("authUserCheck :: userAttributes = " + userAttributes);
					console.log("authUserCheck :: userEnabled = " + userEnabled);
					console.log("authUserCheck :: userGroups = " + userGroups);
					console.log("authUserCheck :: userID = " + userID);
					console.log("authUserCheck :: userRealmRoles = " + userRealmRoles);
				}
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// 유틸 : 말줄임표
////////////////////////////////////////////////////////////////////////////////////////
function getStrLimit(inputStr, limitCnt){
	if(isEmpty(inputStr)){
		return "";
	}else if(inputStr.length >= limitCnt){
		return inputStr.substr(0,limitCnt)+"...";
	}else{
		return inputStr;
	}
}

//서버 바인딩 할 수가 없어서 프로토타입 목적으로 json 을 만들어서 로드하는 함수
var getJsonForPrototype = function (url, bindTemplate) {
	ajaxGet(url).then(function (data) {
		bindTemplate(data);
	});
};
var ajaxGet = (url) =>
	$.ajax({
		url,
		type: "GET",
		global: false,
		statusCode: {
			200: function (data) {
				return data.responseJSON;
			},
		},
	});

function dateFormat(timestamp) {
	var d = new Date(timestamp ), // Convert the passed timestamp to milliseconds
		yyyy = d.getFullYear(),
		mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
		dd = ('0' + d.getDate()).slice(-2),         // Add leading 0.
		hh = d.getHours(),
		h = hh,
		min = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
		ampm = 'AM',
		time;

	if (hh > 12) {
		h = hh - 12;
		ampm = 'PM';
	} else if (hh === 12) {
		h = 12;
		ampm = 'PM';
	} else if (hh == 0) {
		h = 12;
	}

	// ie: 2013-02-18, 8:35 AM
	time = yyyy + '년' + mm + '월' + dd + '일 - ' + h + ':' + min + ' ' + ampm;

	return time;
}

function getToday() {
	var date = new Date();
	return date.getFullYear() + "/" + ("0" + (date.getMonth() + 1) ).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
}

////////////////////////////////////////////////////////////////////////////////////////
// --- 왼쪽 사이드 메뉴 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function setSideMenu( categoryName, listName, collapse) {
	console.log("setSideMenu :: categoryName → " + categoryName + ", listName → " + listName);
	setTimeout(function () {
		$(`#${categoryName}`).css({ color: "#a4c6ff" });
		$(`#${categoryName}`).css({ "font-weight": "900" });

		$(`#${listName}`).addClass("active");
		$(`#${listName}`).css({ color: "#a4c6ff" });
		$(`#${listName}`).css({ "font-weight": "900" });
	}, 1000);
}


////////////////////////////////////////////////////////////////////////////////////////
// -- jstree build 설정 -- //
////////////////////////////////////////////////////////////////////////////////////////
function jsTreeBuild(jQueryElementID, serviceNameForURL) {

	console.log("common :: jsTreeBuild : ( jQueryElementID ) → " + jQueryElementID);
	console.log("common :: jsTreeBuild : ( serviceNameForURL ) → "+ serviceNameForURL);

	console.log("common :: jsTreeBuild : ( href ) → " + $(location).attr("href"));
	console.log("common :: jsTreeBuild : ( protocol ) → " + $(location).attr("protocol"));
	console.log("common :: jsTreeBuild : ( host ) → " + $(location).attr("host"));
	console.log("common :: jsTreeBuild : ( pathname ) → " + $(location).attr("pathname"));
	console.log("common :: jsTreeBuild : ( search ) → " + $(location).attr("search"));
	console.log("common :: jsTreeBuild : ( hostname ) → " + $(location).attr("hostname"));
	console.log("common :: jsTreeBuild : ( port ) → " + $(location).attr("port"));

	$(jQueryElementID)
		.bind("before.jstree", function (e, data) {
			$("#alog").append(data.func + "<br />");
			$("li:not([rel='drive']).jstree-open > a > .jstree-icon").css(
				"background-image",
				"url(../reference/jquery-plugins/jstree-v.pre1.0/themes/toolbar_open.png)"
			);
			$("li:not([rel='drive']).jstree-closed > a > .jstree-icon").css(
				"background-image",
				"url(../reference/jquery-plugins/jstree-v.pre1.0/themes/ic_explorer.png)"
			);
		})
		.jstree({
			// List of active plugins
			plugins: [
				"themes",
				"json_data",
				"ui",
				"crrm",
				"cookies",
				"dnd",
				"search",
				"types",
				"hotkeys",
				"contextmenu",
			],
			themes: { theme: ["lightblue4"] },
			//contextmenu
			contextmenu: {
				items: {
					// Could be a function that should return an object like this one
					create: {
						separator_before: true,
						separator_after: true,
						label: "Create",
						action: false,
						submenu: {
							create_file: {
								seperator_before: false,
								seperator_after: false,
								label: "File",
								action: function (obj) {
									this.create(obj, "last", {
										attr: {
											rel: "default",
										},
									});
								},
							},
							create_folder: {
								seperator_before: false,
								seperator_after: false,
								label: "Folder",
								action: function (obj) {
									this.create(obj, "last", {
										attr: {
											rel: "folder",
										},
									});
								},
							},
						},
					},
					ccp: {
						separator_before: false,
						separator_after: true,
						label: "Edit",
						action: false,
						submenu: {
							cut: {
								seperator_before: false,
								seperator_after: false,
								label: "Cut",
								action: function (obj) {
									this.cut(obj, "last", {
										attr: {
											rel: "default",
										},
									});
								},
							},
							paste: {
								seperator_before: false,
								seperator_after: false,
								label: "Paste",
								action: function (obj) {
									this.paste(obj, "last", {
										attr: {
											rel: "folder",
										},
									});
								},
							},

							changeType: {
								seperator_before: false,
								seperator_after: false,
								label: "Change Type",
								submenu: {
									toFile: {
										seperator_before: false,
										seperator_after: false,
										label: "toFile",
										action: function (obj) {
											this.set_type("default");
										},
									},
									toFolder: {
										seperator_before: false,
										seperator_after: false,
										label: "toFolder",
										action: function (obj) {
											this.set_type("folder");
										},
									},
								},
							},
						},
					},
				},
			},

			// I usually configure the plugin that handles the data first
			// This example uses JSON as it is most common
			json_data: {
				// This tree is ajax enabled - as this is most common, and maybe a bit more complex
				// All the options are almost the same as jQuery's AJAX (read the docs)
				ajax: {
					// the URL to fetch the data
					url: serviceNameForURL + "/getChildNode.do",
					cache : false,
					// the `data` function is executed in the instance's scope
					// the parameter is the node being loaded
					// (may be -1, 0, or undefined when loading the root nodes)
					data: function (n) {
						// the result is fed to the AJAX request `data` option
						console.log("jsTreeBuild :: json data load :: data = " + JSON.stringify(n));
						return {
							c_id: n.attr
								? n.attr("id").replace("node_", "").replace("copy_", "")
								: 1,
						};
					},
					success: function (n) {
						jSuccess("Product(service) Data Load Complete");
					},
				},
			},
			// Configuring the search plugin
			search: {
				// As this has been a common question - async search
				// Same as above - the `ajax` config option is actually jQuery's AJAX object
				ajax: {
					url: serviceNameForURL + "/searchNode.do",
					// You get the search string as a parameter
					data: function (str) {
						return {
							searchString: str,
						};
					},
					success: function (n) {
						jSuccess("search data complete");
					},
				},
			},
			// Using types - most of the time this is an overkill
			// read the docs carefully to decide whether you need types
			types: {
				// I set both options to -2, as I do not need depth and children count checking
				// Those two checks may slow jstree a lot, so use only when needed
				max_depth: -2,
				max_children: -2,
				// I want only `drive` nodes to be root nodes
				// This will prevent moving or creating any other type as a root node
				valid_children: ["drive"],
				types: {
					// The default type
					default: {
						// I want this type to have no children (so only leaf nodes)
						// In my case - those are files
						valid_children: "none",
						// If we specify an icon for the default type it WILL OVERRIDE the theme icons
						icon: {
							image:
								"../reference/jquery-plugins/jstree-v.pre1.0/themes/attibutes.png",
						},
					},
					// The `folder` type
					folder: {
						// can have files and other folders inside of it, but NOT `drive` nodes
						valid_children: ["default", "folder"],
						icon: {
							image:
								"../reference/jquery-plugins/jstree-v.pre1.0/themes/ic_explorer.png",
						},
					},
					// The `drive` nodes
					drive: {
						// can have files and folders inside, but NOT other `drive` nodes
						valid_children: ["default", "folder"],
						icon: {
							image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/home.png",
						},
						// those prevent the functions with the same name to be used on `drive` nodes
						// internally the `before` event is used
						start_drag: false,
						move_node: false,
						delete_node: false,
						remove: false,
					},
				},
			},
			// UI & core - the nodes to initially select and open will be overwritten by the cookie plugin

			// the UI plugin - it handles selecting/deselecting/hovering nodes
			ui: {
				// this makes the node with ID node_4 selected onload
				initially_select: ["node_4"],
			},
			// the core plugin - not many options here
			core: {
				// just open those two nodes up
				// as this is an AJAX enabled tree, both will be downloaded from the server
				initially_open: ["node_2", "node_3"],
			},
		})
		.bind("create.jstree", function (e, data) {
			$.post( serviceNameForURL + "/addNode.do",
				{
					ref: data.rslt.parent.attr("id").replace("node_", "").replace("copy_", ""),
					c_position: data.rslt.position,
					c_title: data.rslt.name,
					c_type: data.rslt.obj.attr("rel"),
				},
				function (r) {
					if (r.status) {
						$(data.rslt.obj).attr("id", "node_" + r.id);
						jNotify("Notification : <strong>Add Node</strong>, Complete !");
					} else {
						$.jstree.rollback(data.rlbk);
					}
					if (typeof Chat != "undefined") {
						Chat.sendMessage(
							"노드를 추가했습니다. 추가된 노드의 아이디는 " + r.id,
							function (data) {
								console.log("jsTreeBuild :: create :: data = " + data);
							}
						);
					}
					//jsTreeBuild(jQueryElementID, serviceNameForURL);
					$(jQueryElementID).jstree('refresh');
				}
			);
		})
		.bind("remove.jstree", function (e, data) {
			data.rslt.obj.each(function () {
				$.ajax({
					async: false,
					type: "POST",
					url: serviceNameForURL + "/removeNode.do",
					data: {
						c_id: this.id.replace("node_", "").replace("copy_", ""),
					},
					success: function (r) {
						jNotify("Notification : <strong>Remove Node</strong>, Complete !");
						if (typeof Chat != "undefined") {
							Chat.sendMessage(
								"노드를 삭제했습니다. 삭제된 노드의 아이디는 " + r.c_id,
								function (data) {
									console.log("jsTreeBuild :: remove :: data = " + data);
								}
							);
						}
						//jsTreeBuild(jQueryElementID, serviceNameForURL);
						$(jQueryElementID).jstree('refresh');
					},
				});
			});
		})
		.bind("rename.jstree", function (e, data) {
			$.post( serviceNameForURL + "/alterNode.do",
				{
					c_id: data.rslt.obj.attr("id").replace("node_", "").replace("copy_", ""),
					c_title: data.rslt.new_name,
					c_type: data.rslt.obj.attr("rel"),
				},
				function (r) {
					if (!r.status) {
						$.jstree.rollback(data.rlbk);
					}
					jSuccess("Rename Node Complete");
					if (typeof Chat != "undefined") {
						Chat.sendMessage(
							"노드의 이름을 변경했습니다. 변경된 노드의 아이디는 " + r.c_id,
							function (data) {
								console.log("jsTreeBuild :: rename :: data = " + data);
							}
						);
					}
					//jsTreeBuild(jQueryElementID, serviceNameForURL);
					$(jQueryElementID).jstree('refresh');
				}
			);
		})
		.bind("set_type.jstree", function (e, data) {
			$.post( serviceNameForURL + "/alterNodeType.do",
				{
					c_id: data.rslt.obj.attr("id").replace("node_", "").replace("copy_", ""),
					c_title: data.rslt.new_name,
					c_type: data.rslt.obj.attr("rel"),
				},
				function (r) {
					jSuccess("Node Type Change");
					if (typeof Chat != "undefined") {
						Chat.sendMessage(
							"노드의 타입을 변경했습니다. 변경된 노드의 아이디는 " + r.c_id,
							function (data) {
								console.log("jsTreeBuild :: set_type :: data = " + data);
							}
						);
					}
					//jsTreeBuild(jQueryElementID, serviceNameForURL);
					$(jQueryElementID).jstree('refresh');
				}
			);
		})
		.bind("move_node.jstree", function (e, data) {
			data.rslt.o.each(function (i) {
				$.ajax({
					async: false,
					type: "POST",
					url: serviceNameForURL + "/moveNode.do",
					data: {
						c_id: $(this).attr("id").replace("node_", "").replace("copy_", ""),
						ref:
							data.rslt.cr === -1
								? 1
								: data.rslt.np.attr("id").replace("node_", "").replace("copy_", ""),
						c_position: data.rslt.cp + i,
						c_title: data.rslt.name,
						copy: data.rslt.cy ? 1 : 0,
						multiCounter: i,
					},
					success: function (r) {
						if (r.status) {
							$.jstree.rollback(data.rlbk);
						} else {
							$(data.rslt.oc).attr("id", "node_" + r.id);
							if (data.rslt.cy && $(data.rslt.oc).children("UL").length) {
								data.inst.refresh(data.inst._get_parent(data.rslt.oc));
							}
						}

						jNotify("Notification : <strong>Move Node</strong> Complete !");

						$(jQueryElementID).jstree('refresh');

						if (typeof Chat != "undefined") {
							Chat.sendMessage(
								"노드가 이동되었습니다. 이동된 노드의 아이디는 " + r.c_id,
								function (data) {
									console.log("jsTreeBuild :: move_node :: data = " + data);
								}
							);
						}

					},
				});
			});
		})
		.bind("select_node.jstree", function (event, data) {
			// `data.rslt.obj` is the jquery extended node that was clicked
			if ($.isFunction(jsTreeClick)) {
				console.log("jsTreeBuild :: select_node :: data.rslt.obj.data('id')" + data.rslt.obj.attr("id"));
				console.log("jsTreeBuild :: select_node :: data.rslt.obj.data('rel')" + data.rslt.obj.attr("rel"));
				console.log("jsTreeBuild :: select_node :: data.rslt.obj.data('class')" + data.rslt.obj.attr("class"));
				console.log("jsTreeBuild :: select_node :: data.rslt.obj.children('a')" + data.rslt.obj.children("a"));
				console.log("jsTreeBuild :: select_node :: data.rslt.obj.children('ul')" + data.rslt.obj.children("ul"));
				jsTreeClick(data.rslt.obj);
			}
		})
		.bind("loaded.jstree", function (event, data) {
			setTimeout(function(){
				$(jQueryElementID).jstree('open_all');
			},1500);
		});

	$("#mmenu input, #mmenu button").click(function () {
		switch (this.id) {
			case "add_default":
			case "add_folder":
				$(jQueryElementID).jstree("create", null, "last", {
					attr: {
						rel: this.id.toString().replace("add_", ""),
					},
				});
				break;
			case "search":
				$(jQueryElementID).jstree("search", document.getElementById("text").value);
				break;
			case "text":
				break;
			default:
				$(jQueryElementID).jstree(this.id);
				break;
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// UTIL : 널 체크
////////////////////////////////////////////////////////////////////////////////////////
var isEmpty = function(value){
	if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){
		return true;
	}else{
		return false;
	}
};


////////////////////////////////////////////////////////////////////////////////////////
//데이터 테이블
////////////////////////////////////////////////////////////////////////////////////////
function dataTable_build(
	jquerySelector,
	ajaxUrl,
	jsonRoot,
	columnList,
	rowsGroupList,
	columnDefList,
	selectList,
	orderList,
	buttonList
) {
	var jQueryElementID = jquerySelector;
	var reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
	var jQueryElementStr = jQueryElementID.replace(reg, '');
	console.log('dataTableBuild :: jQueryElementStr → ' + jQueryElementStr);
	console.log('dataTableBuild :: jQueryElementID → ' + jQueryElementID);
	console.log('dataTableBuild :: columnList → ' + columnList);
	console.log('dataTableBuild :: rowsGroupList → ' + rowsGroupList);

	console.log('dataTableBuild :: href: ' + $(location).attr('href'));
	console.log('dataTableBuild :: protocol: ' + $(location).attr('protocol'));
	console.log('dataTableBuild :: host: ' + $(location).attr('host'));
	console.log('dataTableBuild :: pathname: ' + $(location).attr('pathname'));
	console.log('dataTableBuild :: search: ' + $(location).attr('search'));
	console.log('dataTableBuild :: hostname: ' + $(location).attr('hostname'));
	console.log('dataTableBuild :: port: ' + $(location).attr('port'));
	console.log('dataTableBuild :: ajaxUrl: ' + ajaxUrl);

	var tempDataTable = $(jQueryElementID).DataTable({
		ajax: {
			url: ajaxUrl,
			dataSrc: jsonRoot,
		},
		stateSave: true,
		stateDuration: -1,
		destroy: true,
		processing: true,
		responsive: true,
		columns: columnList,
		rowsGroup: rowsGroupList,
		columnDefs: columnDefList,
		select: selectList,
		order: orderList,
		buttons: buttonList,
		language: {
			processing: '',
			loadingRecords:
				'<span class="spinner" style="font-size: 13px !important;"><i class="fa fa-spinner fa-spin"></i> 데이터를 처리 중입니다.</span>',
		},
		initComplete: function (settings, json) {
			console.log('dataTableBuild :: drawCallback');
			if ($.isFunction(dataTableCallBack)) {
				//데이터 테이블 그리고 난 후 시퀀스 이벤트
				dataTableCallBack(settings, json);
			}
		},
		drawCallback: function(tableInfo) {
			console.log("dataTableBuild :: drawCallback");
			if ($.isFunction(dataTableDrawCallback)) {
				//데이터 테이블 그리고 난 후 시퀀스 이벤트
				dataTableDrawCallback(tableInfo);
			}
		}
	});

	$(jQueryElementID + ' tbody').on('click', 'tr', function () {
		if ($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		} else {
			tempDataTable.$('tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}

		var selectedData = tempDataTable.row(this).data();
		selectedData.selectedIndex = $(this).closest('tr').index();

		var info = tempDataTable.page.info();
		selectedData.selectedPage = info.page;

		dataTableClick(tempDataTable, selectedData);
	});

	// ----- 데이터 테이블 빌드 이후 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$('.dataTables_length').find('select:eq(0)').addClass('darkBack');
	$('.dataTables_length').find('select:eq(0)').css('min-height', '30px');
	$(jQueryElementID + "_wrapper").css("border-top", "1px solid rgba(51, 51, 51, 0.3)");
	$(jQueryElementID + "_wrapper").css("padding-top", "5px");
	//min-height: 30px;

	// ----- 데이터 테이블 빌드 이후 별도 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$('body')
		.find("[aria-controls='" + jQueryElementStr + "']")
		.css('width', '50px');
	$("input[type=search]").css('width', '100px');
	$('select[name=' + jQueryElementStr + ']').css('width', '50px');

	$.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
		console.log(message);
		jError('Notification : <strong>Ajax Error</strong>, retry plz !');
	};

	return tempDataTable;
}

////////////////////////////////////////////////////////////////////////////////////////
//공통 AJAX setup 처리
////////////////////////////////////////////////////////////////////////////////////////
function ajax_setup() {

	$(document)
		.ajaxStart(function () {
			$('.loader').removeClass('hide');
		})
		.ajaxSend(function (event, jqXHR, ajaxOptions) {

		})
		.ajaxSuccess(function (event, jqXHR, ajaxOptions, data) {

		})
		.ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
			$('.loader').addClass('hide');
			if ( jqXHR.status== 401 ) {
				jError("클라이언트가 인증되지 않았거나, 유효한 인증 정보가 부족하여 요청이 거부되었습니다.");
				location.href = "/sso/login";
			}
			else if ( jqXHR.status== 403 ) {
				jError("서버가 해당 요청을 이해했지만, 권한이 없어 요청이 거부되었습니다.");
			}
		})
		.ajaxComplete(function (event, jqXHR, ajaxOptions) {
			$('.loader').addClass('hide');
		})
		.ajaxStop(function () {
			$('.loader').addClass('hide');
		});


	return true;

}

////////////////////////////////////////////////////////////////////////////////////////
//공통 AJAX SAMPLE
////////////////////////////////////////////////////////////////////////////////////////
function ajax_sample() {

	$.ajax({
		url: "요청을 보낼 URL",
		type: "요청 type(GET 혹은 POST)을 명시",
		data: "서버로 보내지는 데이터",
		contentType: "서버로 보내지는 데이터의 content-type, 기본값은 application/x-www-form-urlencoded",
		dataType: "서버 응답으로 받는 데이터 타입",
		statusCode: {
			200: function(data) {

				//////////////////////////////////////////////////////////
				console.log("ajax_build :: url = " + ajaxUrl);
				for (var key in data) {
					var value = data[key];
					console.log(key + "=" + value);
				}

				var loopCount = 3;
				for (var i = 0; i < loopCount; i++) {
					console.log("loop check i = " + i);
				}
				//////////////////////////////////////////////////////////
				jSuccess("신규 제품 등록이 완료 되었습니다.");

			},
		},
		beforeSend:function(){
			//$("#regist_pdService").hide(); 버튼 감추기
		},
		complete:function(){
			//$("#regist_pdService").show(); 버튼 보이기
		},
		error:function(e){
			jError("신규 제품 등록 중 에러가 발생했습니다.");
		}
	});

}