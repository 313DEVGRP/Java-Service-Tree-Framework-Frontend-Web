////////////////////////////////////////////////////////////////////////////////////////
//Const
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//인증관련 공통 변수
////////////////////////////////////////////////////////////////////////////////////////
let userName;
let fullName;
let userApplicationRoles;
let userAttributes;
let userEnabled;
let userGroups;
let userID;
let userRealmRoles;
let permissions;
let userEmail;
let scrollPos = 0;
////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
$(function () {
	var str = window.location.href;
	if (str.indexOf("php") > 0) {
		console.table("313DEVGRP 커뮤니티에 오신것을 환영합니다.");
		runScript();
	} else {
		authUserCheck();
	}
});

function runScript() {
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
	var onlyContents = urlParams.get("withoutLayer");
	if (isEmpty(onlyContents)) {
		$("body").removeAttr("class");
	} else {
		$("body").addClass("sidebar-hidden");
		$("header.page-header").hide();
	}

	$(document).on("shown.bs.tab", "a[data-toggle='tab']", function () {
		window.dispatchEvent(new Event("resize"));
	});

	if (ajax_setup()) {
		$(".loader").removeClass("hide");

		var page = urlParams.get("page");
		if (isEmpty(page)) {
			page = "index";
		}
		if (includeLayout(page)) {
			$.getScript("js/" + page + ".js", function () {
				/* 로그인 인증 여부 체크 함수 */
				execDocReady();
				dwr_login(userName, userName);
				menu_setting();
			});
		}
	}
}

function menu_setting() {

	console.log("롤에 의한 메뉴를 설정합니다.");

	var role_user = "ROLE_USER";
	var role_manager = "ROLE_MANAGER";
	var role_admin = "ROLE_ADMIN";

	if( isEmpty(permissions) == false && permissions.indexOf(role_user) != -1){
		console.log("user 권한의 메뉴를 표현합니다.");
		$("#menu_login").addClass("hide");
		$("#menu_dashboard").removeClass("hide");
		$("#menu_detail").removeClass("hide");
	}
	if( isEmpty(permissions) == false && permissions.indexOf(role_manager) != -1){
		console.log("manager 권한의 메뉴를 표현합니다.");
		$("#menu_login").addClass("hide");
		$("#menu_dashboard").removeClass("hide");
		$("#menu_detail").addClass("hide");
		$("#menu_product").removeClass("hide");
		$("#menu_alm").removeClass("hide");
		$("#menu_requirement").removeClass("hide");
	}
	if( isEmpty(permissions) == false && permissions.indexOf(role_admin) != -1){
		console.log("admin 권한의 메뉴를 표현합니다.");
		$("#menu_login").addClass("hide");
		$("#menu_dashboard").removeClass("hide");
		$("#menu_detail").addClass("hide");
		$("#menu_product").removeClass("hide");
		$("#menu_alm").removeClass("hide");
		$("#menu_requirement").removeClass("hide");
		$("#menu_analysis").removeClass("hide");
	}
	
	

}

function widgsterWrapper() {
	var height;

	$.fn.widgster.Constructor.prototype.fullscreen = function () {
		var e = $.Event("fullscreen.widgster");

		this.$element.trigger(e);

		if (e.isDefaultPrevented()) return;

		this.$element.css({
			position: "fixed",
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			margin: 0,
			overflow: "auto",
			"z-index": 10000
		});

		var body = this.$element.find(".body");
		var siblingsHeight = body
			.siblings()
			.toArray()
			.reduce(function (acc, cur) {
				return (acc += cur.clientHeight);
			}, 0);
		var margin =
			parseInt(body.css("margin-top")) +
			parseInt(body.css("margin-bottom")) +
			parseInt(this.$element.css("padding-top")) +
			parseInt(this.$element.css("padding-bottom")) +
			parseInt(this.$element.css("margin-top")) +
			parseInt(this.$element.css("margin-bottom"));

		// height = body.css("height");
		body.css("height", "calc(100% - " + (siblingsHeight + margin) + "px)");

		$("body").css("overflow", "hidden");

		this.wasCollapsed = this.collapsed;
		this.expand(false);

		this.$fullscreen.hide();
		this.$restore.show();

		this.$collapse.hide();
		this.$expand.hide();

		this.$element.addClass("fullscreened");

		this.$element.addClass("modalDarkBack");

		this.$element.trigger($.Event("fullscreened.widgster"));

		return false;
	};

	$.fn.widgster.Constructor.prototype.restore = function () {
		var e = $.Event("restore.widgster");

		this.$element.trigger(e);

		if (e.isDefaultPrevented()) return;

		this.$element.css({
			position: "",
			top: "",
			right: "",
			bottom: "",
			left: "",
			margin: "",
			overflow: "",
			"z-index": ""
		});

		this.$element.find(".body").css("height", height);
		$("body").css("overflow", "");

		this.$fullscreen.show();
		this.$restore.hide();

		if (this.collapsed) {
			this.$collapse.hide();
			this.$expand.show();
		} else {
			this.$collapse.show();
			this.$expand.hide();
		}

		this.wasCollapsed && this.collapse(false);

		this.$element.removeClass("fullscreened");

		this.$element.removeClass("modalDarkBack");

		this.$element.trigger($.Event("restored.widgster"));

		return false;
	};
}

function 로드_완료_이후_실행_함수() {
	톱니바퀴_초기설정();
	loadLocale();
	widgsterWrapper();
	검색_이벤트_트리거();

	우측_상단_사용자_정보_설정();
}

////////////////////////////////////////////////////////////////////////////////////////
// 우측_상단_사용자_정보_설정
////////////////////////////////////////////////////////////////////////////////////////
function 우측_상단_사용자_정보_설정() {

	var str = window.location.href;
	if (str.indexOf("php") > 0) {
		var account_html = "<span style='color:#a4c6ff;'>not supported</span>";
		$("#login_id").append(account_html);
	}else {
		var account_html = "<span style='color:#a4c6ff;'>\"" + userName + "\"</span>";
		$("#login_id").append(account_html);
	}
}


////////////////////////////////////////////////////////////////////////////////////////
// 플러그인 로드 모듈 ( 병렬 시퀀스 )
////////////////////////////////////////////////////////////////////////////////////////
function loadPlugin(url) {
	return new Promise(function (resolve, reject) {
		if (isJavaScriptFile(url)) {
			$(".spinner").html(
				'<img src="./img/loading.gif" alt="로딩" style="width: 16px;"> ' +
					getFileNameFromURL(url) +
					" 자바스크립트를 다운로드 중입니다..."
			);
			$.ajax({
				url: url,
				dataType: "script",
				cache: true,
				success: function () {
					// The request was successful

					console.log("[ common :: loadPlugin ] :: url = " + url + " 자바 스크립트 플러그인 로드 성공");
					resolve(); // Promise를 성공 상태로 변경
				},
				error: function () {
					// The request failed
					console.error("[ common :: loadPlugin ] :: url = " + url + " 플러그인 로드 실패");
					reject(); // Promise를 실패 상태로 변경
				}
			});
		} else {
			$(".spinner").html(
				'<img src="./img/loading.gif" alt="로딩" style="width: 16px;"> ' +
					getFileNameFromURL(url) +
					" 스타일시트를 다운로드 중입니다..."
			);
			$("<link/>", {
				rel: "stylesheet",
				type: "text/css",
				href: url
			}).appendTo("head");
			console.log("[ common :: loadPlugin ] :: url = " + url + " 스타일시트 플러그인 로드 성공");
			resolve();
		}
	});
}

function getFileNameFromURL(url) {
	var parts = url.split("/");
	return parts[parts.length - 1];
}

function isJavaScriptFile(filename) {
	return filename.endsWith(".js");
}

function loadPluginGroupSequentially(group) {
	return group.reduce(function (promise, url) {
		return promise.then(function () {
			return loadPlugin(url);
		});
	}, Promise.resolve());
}

function loadPluginGroupsParallelAndSequential(groups) {
	var promises = groups.map(function (group) {
		return loadPluginGroupSequentially(group);
	});
	return Promise.all(promises).then(function () {
		로드_완료_이후_실행_함수();
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// include 레이아웃 html 파일을 로드하는 함수
////////////////////////////////////////////////////////////////////////////////////////
function includeLayout(page) {
	var includeArea = $("[data-include]");
	var self, url;
	var str = window.location.href;

	$.each(includeArea, function () {
		self = $(this);
		url = self.data("include");
		console.log("[ common :: includeLayout ] url = " + url);

		var hrefLink = window.location.href;
		var urlParams = new URL(location.href).searchParams;
		var mode = urlParams.get("mode");

		if (url.indexOf("content-header") !== -1) {
			url = "html/" + page + "/content-header.html";
			self.load(url, function () {
				self.removeAttr("data-include");
			});
		} else if (url.indexOf("content-container") !== -1) {
			url = "html/" + page + "/content-container.html";
			self.load(url, function () {
				self.removeAttr("data-include");
			});
		} else if (url.indexOf("page-sidebar") !== -1) {
			if (mode == "detail" || hrefLink.indexOf("detail.html") > 0) {
				url = "/arms/html/detail/page-sidebar.html";
				self.load(url, function () {
					self.removeAttr("data-include");
				});
			} else if (str.indexOf("controltower") > 0) {
				url = "/controltower/html/template/page-sidebar.html";
				self.load(url, function () {
					self.removeAttr("data-include");
				});
			} else {
				url = "/arms/html/template/page-sidebar.html";
				self.load(url, function () {
					self.removeAttr("data-include");
				});
			}
		} else {
			self.load(url, function () {
				self.removeAttr("data-include");
			});
		}
	});

	return true;
}


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
			"1.0": "rgba(211, 84,  0,   .9)"
		},
		shadowBlur: 10,
		shadowColor: "rgba(0,   0,   0,   .6)"
	});
}

////////////////////////////////////////////////////////////////////////////////////////
//슬림스크롤
////////////////////////////////////////////////////////////////////////////////////////
function makeSlimScroll(targetElement) {
	$(targetElement).slimScroll({
		height: "250px",
		railVisible: true,
		railColor: "#222",
		railOpacity: 0.3,
		wheelStep: 10,
		allowPageScroll: false,
		disableFadeOut: false
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// 맨위로 아이콘
////////////////////////////////////////////////////////////////////////////////////////
function rightBottomTopForwardIcon() {
	$("#topicon").click(function () {
		$("html, body").animate({ scrollTop: 0 }, 400);
		return false;
	});
}

////////////////////////////////////////////////////////////////////////////////////////
// 로그인 인증 여부 체크 함수
////////////////////////////////////////////////////////////////////////////////////////
function authUserCheck() {
	var str = window.location.href;
	if (str.indexOf("community") > 0) {
		runScript();
	} else {
		$.ajax({
			url: "/auth-user/me",
			type: "GET",
			timeout: 7313,
			global: false,
			statusCode: {
				200: function (json) {
					console.log("[ common :: authUserCheck ] userName = " + json.preferred_username);
					console.log("[ common :: authUserCheck ] sub = " + json.sub);
					console.log("[ common :: authUserCheck ] roles = " + json.realm_access.roles);
					console.log("[ common :: authUserCheck ] email = " + json.email);
					console.log("[ common :: authUserCheck ] name = " + json.name);
					userName = json.preferred_username;
					permissions = json.realm_access.roles;
					userID = json.sub;
					userEmail = json.email;
					fullName = json.name;

					runScript();
				},
				401: function (json) {
					$(".loader").addClass("hide");
					jError("클라이언트가 인증되지 않았거나, 유효한 인증 정보가 부족하여 요청이 거부되었습니다.");
					location.href = "/oauth2/authorization/middle-proxy";
					return false;
				},
				403: function (json) {
					jError("서버가 해당 요청을 이해했지만, 권한이 없어 요청이 거부되었습니다.");
					return false;
				}
			}
		});

		return true;
	}
}

////////////////////////////////////////////////////////////////////////////////////////
// 사용자 정보 로드 함수
////////////////////////////////////////////////////////////////////////////////////////
function getUserInfo() {
	$.ajax({
		url: "/auth-user/search-user/" + userName,
		data: {
			sendData: ""
		},
		type: "GET",
		progress: true,
		statusCode: {
			200: function (json) {
				console.log("authUserCheck length = :: " + json.length);
				if (json.length > 1) {
					jError("중복된 사용자가 있습니다.");
				} else if (json.length == 0) {
					jError("사용자 정보가 조회되지 않습니다.");
				} else {
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
function getStrLimit(inputStr, limitCnt) {
	if (isEmpty(inputStr)) {
		return "";
	} else if (inputStr.length >= limitCnt) {
		return inputStr.substr(0, limitCnt) + "...";
	} else {
		return inputStr;
	}
}

////////////////////////////////////////////////////////////////////////////////////////
//서버 바인딩 할 수가 없어서 프로토타입 목적으로 json 을 만들어서 로드하는 함수
////////////////////////////////////////////////////////////////////////////////////////
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
			}
		}
	});

function dateFormat(timestamp) {
	var d = new Date(timestamp), // Convert the passed timestamp to milliseconds
		yyyy = d.getFullYear(),
		mm = ("0" + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
		dd = ("0" + d.getDate()).slice(-2), // Add leading 0.
		hh = d.getHours(),
		h = hh,
		min = ("0" + d.getMinutes()).slice(-2), // Add leading 0.
		ampm = "AM",
		time;

	if (hh > 12) {
		h = hh - 12;
		ampm = "PM";
	} else if (hh === 12) {
		h = 12;
		ampm = "PM";
	} else if (hh == 0) {
		h = 12;
	}

	// ie: 2013-02-18, 8:35 AM
	time = yyyy + "년" + mm + "월" + dd + "일 - " + h + ":" + min + " " + ampm;

	return time;
}

function getToday() {
	var date = new Date();
	return date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
}

// 최대값, 최소값
function maxValue(arr) {
	if (isEmpty(arr)) {
		return [];
	} else {
		return arr.reduce((max, val) => (max > val ? max : val));
	}
}

function minValue(arr) {
	if (isEmpty(arr)) {
		return [];
	} else {
		return arr.reduce((min, val) => (min < val ? min : val));
	}
}

////////////////////////////////////////////////////////////////////////////////////////
// --- 왼쪽 사이드 메뉴 설정 --- //
////////////////////////////////////////////////////////////////////////////////////////
function setSideMenu(categoryName, listName, collapse) {
	console.log("[ common :: setSideMenu ] :: categoryName → " + categoryName + ", listName → " + listName);

	setTimeout(function () {
		//jira_icon
		if (categoryName === "sidebar_menu_jira") {
			$("#side_jira_neutral_icon").removeClass("hidden");
			$("#side_jira_white_icon").addClass("hidden");
		} else {
			$("#side_jira_neutral_icon").addClass("hidden");
			$("#side_jira_white_icon").removeClass("hidden");
		} //.jira_icon

		$(`#${categoryName}`).css({ color: "#a4c6ff" });
		$(`#${categoryName}`).css({ "font-weight": "900" });

		if (isEmpty(listName)) {
			console.log("[ common :: setSideMenu ] :: listName → is null");
		} else {
			$(`#${listName}`).addClass("active");
			$(`#${listName}`).css({ color: "#a4c6ff" });
			$(`#${listName}`).css({ "font-weight": "900" });
		}
		$(".spinner").html(
			"<img src=\"./img/loading.gif\" width='20px' height='20px' style='margin-bottom: 3px;'/> 어플리케이션 API Data를 가져오는 중입니다..."
		);
	}, 1000);
}

////////////////////////////////////////////////////////////////////////////////////////
// -- jstree build 설정 -- //
////////////////////////////////////////////////////////////////////////////////////////
function jsTreeBuild(jQueryElementID, serviceNameForURL) {
	console.log("common :: jsTreeBuild : ( jQueryElementID ) → " + jQueryElementID);
	console.log("common :: jsTreeBuild : ( serviceNameForURL ) → " + serviceNameForURL);

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
			plugins: ["themes", "json_data", "ui", "crrm", "dnd", "search", "types"],
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
											rel: "default"
										}
									});
								}
							},
							create_folder: {
								seperator_before: false,
								seperator_after: false,
								label: "Folder",
								action: function (obj) {
									this.create(obj, "last", {
										attr: {
											rel: "folder"
										}
									});
								}
							}
						}
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
											rel: "default"
										}
									});
								}
							},
							paste: {
								seperator_before: false,
								seperator_after: false,
								label: "Paste",
								action: function (obj) {
									this.paste(obj, "last", {
										attr: {
											rel: "folder"
										}
									});
								}
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
										}
									},
									toFolder: {
										seperator_before: false,
										seperator_after: false,
										label: "toFolder",
										action: function (obj) {
											this.set_type("folder");
										}
									}
								}
							}
						}
					}
				}
			},

			// I usually configure the plugin that handles the data first
			// This example uses JSON as it is most common
			json_data: {
				// This tree is ajax enabled - as this is most common, and maybe a bit more complex
				// All the options are almost the same as jQuery's AJAX (read the docs)
				ajax: {
					// the URL to fetch the data
					url: serviceNameForURL + "/getChildNode.do",
					cache: false,
					// the `data` function is executed in the instance's scope
					// the parameter is the node being loaded
					// (may be -1, 0, or undefined when loading the root nodes)
					data: function (n) {
						// the result is fed to the AJAX request `data` option
						console.log("[ common :: jsTreeBuild ] :: json data load = " + JSON.stringify(n));
						return {
							c_id: n.attr ? n.attr("id").replace("node_", "").replace("copy_", "") : 1
						};
					},
					success: function (n) {
					    n.forEach(item => {
					        let type = item.attr.rel;
					        if(type !== "folder"){
                                if (item.reqStateEntity && item.reqStateEntity.c_title) {
                                    let state = item.reqStateEntity.c_title;
                                    item.data = mappingStateIcon(state) +" "+item.data;
                                }
					        }
                        });
						jSuccess("Product(service) Data Load Complete");
						$(jQueryElementID).jstree("search", $("#text").val());
					}
				}
			},
			// Configuring the search plugin
			search: {
				// As this has been a common question - async search
				// Same as above - the `ajax` config option is actually jQuery's AJAX object

				/**
				 * v1 : 검색 버튼 클릭 시 API 호출 후 응답 데이터를 jstree 에 바인딩
				ajax: {
					url: serviceNameForURL + "/searchNode.do",
					// You get the search string as a parameter
					data: function (str) {
						return {
							searchString: str
						};
					},
					success: function (n) {
						jSuccess("search data complete");
					}
				}
				*/

				/**
				 * v2 : 검색 버튼 클릭 시 jstree 노드 필터링을 통해 검색
				 */
				show_only_matches: true,
				search_callback: function (str, node) {
					return node.data().search(str);
				}
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
							image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/attibutes.png"
						}
					},
					// The `folder` type
					folder: {
						// can have files and other folders inside of it, but NOT `drive` nodes
						valid_children: ["default", "folder"],
						icon: {
							image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/ic_explorer.png"
						}
					},
					// The `drive` nodes
					drive: {
						// can have files and folders inside, but NOT other `drive` nodes
						valid_children: ["default", "folder"],
						icon: {
							image: "../reference/jquery-plugins/jstree-v.pre1.0/themes/home.png"
						},
						// those prevent the functions with the same name to be used on `drive` nodes
						// internally the `before` event is used
						start_drag: false,
						move_node: false,
						delete_node: false,
						remove: false
					}
				}
			},
			// UI & core - the nodes to initially select and open will be overwritten by the cookie plugin

			// the UI plugin - it handles selecting/deselecting/hovering nodes
			ui: {
				// this makes the node with ID node_4 selected onload
				initially_select: ["node_4"]
			},
			// the core plugin - not many options here
			core: {
				// just open those two nodes up
				// as this is an AJAX enabled tree, both will be downloaded from the server
				initially_open: ["node_2", "node_3"]
			}
		})
		.bind("create.jstree", function (e, data) {
			$.post(
				serviceNameForURL + "/addNode.do",
				{
					ref: data.rslt.parent.attr("id").replace("node_", "").replace("copy_", ""),
					c_position: data.rslt.position,
					c_title: data.rslt.name,
					c_type: data.rslt.obj.attr("rel")
				},
				function (r) {
					if (r.status) {
						$(data.rslt.obj).attr("id", "node_" + r.id);
						jNotify("Notification : <strong>Add Node</strong>, Complete !");
					} else {
						$.jstree.rollback(data.rlbk);
					}
					$(jQueryElementID).jstree("refresh");
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
						c_id: this.id.replace("node_", "").replace("copy_", "")
					},
					success: function (r) {
						jNotify("Notification : <strong>Remove Node</strong>, Complete !");
						$(jQueryElementID).jstree("refresh");
					}
				});
			});
		})
		.bind("rename.jstree", function (e, data) {
			$.post(
				serviceNameForURL + "/alterNode.do",
				{
					c_id: data.rslt.obj.attr("id").replace("node_", "").replace("copy_", ""),
					c_title: data.rslt.new_name,
					c_type: data.rslt.obj.attr("rel")
				},
				function (r) {
					if (!r.status) {
						$.jstree.rollback(data.rlbk);
					}
					jSuccess("Rename Node Complete");
					$(jQueryElementID).jstree("refresh");
				}
			);
		})
		.bind("set_type.jstree", function (e, data) {
			$.post(
				serviceNameForURL + "/alterNodeType.do",
				{
					c_id: data.rslt.obj.attr("id").replace("node_", "").replace("copy_", ""),
					c_title: data.rslt.new_name,
					c_type: data.rslt.obj.attr("rel")
				},
				function (r) {
					jSuccess("Node Type Change");
					$(jQueryElementID).jstree("refresh");
				}
			);
		})
		.bind("move_node.jstree", function (e, data) {
			data.rslt.o.each(function (i) {
				console.log("##### move :::", data);
				$.ajax({
					async: false,
					type: "POST",
					url: serviceNameForURL + "/moveNode.do",
					data: {
						c_id: $(this).attr("id").replace("node_", "").replace("copy_", ""),
						ref: data.rslt.cr === -1 ? 1 : data.rslt.np.attr("id").replace("node_", "").replace("copy_", ""),
						c_position: data.rslt.cp + i,
						c_title: data.rslt.name,
						copy: data.rslt.cy ? 1 : 0,
						multiCounter: i
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

						$(jQueryElementID).jstree("refresh");
					}
				});
			});
		})
		.bind("select_node.jstree", function (event, data) {
			// `data.rslt.obj` is the jquery extended node that was clicked
			if ($.isFunction(jsTreeClick)) {
				console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.data('id')" + data.rslt.obj.attr("id"));
				console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.data('rel')" + data.rslt.obj.attr("rel"));
				console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.data('class')" + data.rslt.obj.attr("class"));
				console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.children('a')" + data.rslt.obj.children("a"));
				console.log("[ jsTreeBuild :: select_node ] :: data.rslt.obj.children('ul')" + data.rslt.obj.children("ul"));
				jsTreeClick(data.rslt.obj);
			}
		})
		.bind("loaded.jstree", function (event, data) {
			// 성능 이슈로 자동으로 전부 펼치기 닫음.
			// setTimeout(function () {
			// 	$(jQueryElementID).jstree("open_all");
			// }, 1500);

			$(jQueryElementID).slimscroll({
				height: "545px"
			});
		});

	$("#mmenu input, #mmenu button").click(function () {
		switch (this.id) {
			case "add_default":
			case "add_folder":
				$(jQueryElementID).jstree("create", null, "last", {
					attr: {
						rel: this.id.toString().replace("add_", "")
					}
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

	$("#mmenu .form-search").submit(function (event) {
		event.preventDefault();

		$(jQueryElementID).jstree("search", document.getElementById("text").value);
	});

    function mappingStateIcon(key) {
        if (key === "열림") {
            return '<i class="fa fa-folder-o text-danger"></i>';
        } else if (key === "진행중") {
            return '<i class="fa fa-fire text-danger" style="color: #E49400;"></i>';
        } else if (key === "해결됨") {
            return '<i class="fa fa-fire-extinguisher text-success"></i>';
        } else if (key === "닫힘") {
            return '<i class="fa fa-folder text-primary"></i>';
        }
        return ''; // 기본적으로 빈 문자열 반환
    }
}

////////////////////////////////////////////////////////////////////////////////////////
// UTIL : 널 체크
////////////////////////////////////////////////////////////////////////////////////////
var isEmpty = function (value) {
	if (
		typeof value === "undefined" ||
		value == "" ||
		value == null ||
		value == undefined ||
		(value != null && typeof value == "object" && !Object.keys(value).length)
	) {
		return true;
	} else {
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
	buttonList,
	isServerSide,
	scrollY,
	data,
	isAjax = true
) {
	var jQueryElementID = jquerySelector;
	var reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
	var jQueryElementStr = jQueryElementID.replace(reg, "");

	var responsiveRender = {
		details: {
			renderer: function (api, rowIdx, columns) {
				var outer = "<tr data-dt-row=" + rowIdx + " data-dt-column='0'><td>";
				var data = $.map(columns, function (col, i) {
					return col.hidden
						? "<div class='gradient_bottom_border' style='margin-bottom: 5px;float:left;width:180px;'>" +
								"<div style='text-align: center;padding:3px;background: #3b3d40'><strong>" +
								col.title +
								"</strong></div>" +
								"<div style='padding:3px;text-align: center;color: #a4c6ff;'>" +
								col.data +
								"</div>" +
								"</div>"
						: "";
				}).join("");
				outer += data;
				outer += "</td></tr>";
				data = outer;

				return data ? $("<table/>").append(data) : false;
			}
		}
	};

	console.log("[ common :: dataTableBuild ] :: jQueryElementStr → " + jQueryElementStr);
	console.log("[ common :: dataTableBuild ] :: jQueryElementID → " + jQueryElementID);
	console.log("[ common :: dataTableBuild ] :: columnList → " + columnList);
	console.log("[ common :: dataTableBuild ] :: rowsGroupList → " + rowsGroupList);
	console.log("[ common :: dataTableBuild ] :: href → " + $(location).attr("href"));
	console.log("[ common :: dataTableBuild ] :: protocol → " + $(location).attr("protocol"));
	console.log("[ common :: dataTableBuild ] :: host → " + $(location).attr("host"));
	console.log("[ common :: dataTableBuild ] :: pathname → " + $(location).attr("pathname"));
	console.log("[ common :: dataTableBuild ] :: search → " + $(location).attr("search"));
	console.log("[ common :: dataTableBuild ] :: hostname → " + $(location).attr("hostname"));
	console.log("[ common :: dataTableBuild ] :: port → " + $(location).attr("port"));
	console.log("[ common :: dataTableBuild ] :: ajaxUrl → " + ajaxUrl);

	var options = {
		serverSide: isServerSide,
		stateSave: false,
		stateDuration: -1,
		destroy: true,
		processing: true,
		responsive: false,
		columns: columnList,
		rowsGroup: rowsGroupList,
		columnDefs: columnDefList,
		select: selectList,
		order: orderList,
		buttons: buttonList,
		scrollX: true,
		scrollY: scrollY,
		// lengthMenu: [[3, 5, 7, 10], [3, 5, 7, 10]],
		language: {
			processing: "",
			loadingRecords:
				'<span class="spinner" style="font-size: 13px !important;"><i class="fa fa-spinner fa-spin"></i> 데이터를 처리 중입니다.</span>'
		},
		initComplete: function (settings, json) {
			console.log("dataTableBuild :: drawCallmakeSlimScrollback");
			if ($.isFunction(dataTableCallBack)) {
				//데이터 테이블 그리고 난 후 시퀀스 이벤트
				dataTableCallBack(settings, json);
			}
		},
		drawCallback: function (tableInfo) {
			console.log("dataTableBuild :: drawCallback");
			if ($.isFunction(dataTableDrawCallback)) {
				//데이터 테이블 그리고 난 후 시퀀스 이벤트
				dataTableDrawCallback(tableInfo);
			}
		}
	};

	if (isAjax) {
		options.ajax = {
			url: ajaxUrl,
			dataSrc: jsonRoot
		};
	} else {
		options.data = data;
	}

	var tempDataTable = $(jQueryElementID).DataTable(options);

	$(jQueryElementID).on('page.dt', function() {
		scrollPos = $(window).scrollTop();
		$(window).scrollTop(scrollPos);
	});

	/*var tempDataTable = $(jQueryElementID).DataTable({
		ajax: {
			url: ajaxUrl,
			dataSrc: jsonRoot
		},
		serverSide: isServerSide,
		stateSave: false,
		stateDuration: -1,
		destroy: true,
		processing: true,
		responsive: false,
		columns: columnList,
		rowsGroup: rowsGroupList,
		columnDefs: columnDefList,
		select: selectList,
		order: orderList,
		buttons: buttonList,
		scrollX: true,
		scrollY: scrollY,
		language: {
			processing: "",
			loadingRecords:
				'<span class="spinner" style="font-size: 13px !important;"><i class="fa fa-spinner fa-spin"></i> 데이터를 처리 중입니다.</span>'
		},
		initComplete: function (settings, json) {
			console.log("dataTableBuild :: drawCallmakeSlimScrollback");
			if ($.isFunction(dataTableCallBack)) {
				//데이터 테이블 그리고 난 후 시퀀스 이벤트
				dataTableCallBack(settings, json);
			}
		},
		drawCallback: function (tableInfo) {
			console.log("dataTableBuild :: drawCallback");
			if ($.isFunction(dataTableDrawCallback)) {
				//데이터 테이블 그리고 난 후 시퀀스 이벤트
				dataTableDrawCallback(tableInfo);
			}
		}
	});*/

	$(jQueryElementID + " tbody").on("click", "tr", function () {
		if ($(this).hasClass("selected")) {
			$(this).removeClass("selected");
		} else {
			tempDataTable.$("tr.selected").removeClass("selected");
			$(this).addClass("selected");
		}

		var selectedData = tempDataTable.row(this).data();
		selectedData.selectedIndex = $(this).closest("tr").index();

		var info = tempDataTable.page.info();
		selectedData.selectedPage = info.page;

		dataTableClick(tempDataTable, selectedData);
	});

	// ----- 데이터 테이블 빌드 이후 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$(".dataTables_length").find("select:eq(0)").addClass("darkBack");
	$(".dataTables_length").find("select:eq(0)").css("min-height", "30px");
	//min-height: 30px;

	// ----- 데이터 테이블 빌드 이후 별도 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$("body")
		.find("[aria-controls='" + jQueryElementStr + "']")
		.css("width", "50px");
	$(".dataTables_filter input[type=search]").css("width", "100px");
	$("select[name=" + jQueryElementStr + "]").css("width", "50px");

	$.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
		console.log(message);
		jError("Notification : <strong>Ajax Error</strong>, retry plz !");
	};

	return tempDataTable;
}

////////////////////////////////////////////////////////////////////////////////////////
//공통 AJAX setup 처리
////////////////////////////////////////////////////////////////////////////////////////
function ajax_setup() {
	$(document)
		.ajaxStart(function () {
			$(".loader").removeClass("hide");
		})
		.ajaxSend(function (event, jqXHR, ajaxOptions) {
			//$(".loader").addClass("hide");
		})
		.ajaxSuccess(function (event, jqXHR, ajaxOptions, data) {
			//$(".loader").addClass("hide");
		})
		.ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
			$(".loader").addClass("hide");
			if (jqXHR.status == 401) {
				jError("클라이언트가 인증되지 않았거나, 유효한 인증 정보가 부족하여 요청이 거부되었습니다.", {
					/**
					 * [options]
					 * autoHide / Boolean            Default : true - jNotify closed after TimeShown ms or by clicking on it
					 * clickOverlay / Boolean         Default : false - If false, disables closing jNotify by clicking on the background overlay.
					 * MinWidth / Integer             Default : 200 - In pixel, the min-width css property of the boxes.
					 * TimeShown / Integer             Default : 1500 - In ms, time of the boxes appearances.
					 * ShowTimeEffect / Integer     Default : 200 - In ms, duration of the Show effect
					 * HideTimeEffect / Integer     Default : 200 - In ms, duration of the Hide effect
					 * LongTrip / Integer            Default : 15 - Length of the move effect ('top' and 'bottom' verticals positions only)
					 * HorizontalPosition / String    Default : right - Horizontal position. Can be set to 'left', 'center', 'right'
					 * VerticalPosition / String    Default : top - Vertical position. Can be set to 'top', 'center', 'bottom'.
					 * ShowOverlay / Boolean        Default : true - If true, a background overlay appears behind the jNotify boxes
					 * ColorOverlay / String        Default : #000 - Color of the overlay background (only Hex. color code)
					 * OpacityOverlay / Integer        Default : 0.3 - Opacity CSS property of the overlay background. From 0 to 1 max.
					 */
					autoHide: true, // added in v2.0
					TimeShown: 3000,
					HorizontalPosition: "center",
					VerticalPosition: "top"
					//    onCompleted : function(){ // added in v2.0
					//    alert('jNofity is completed !');
					// }
				});
				location.href = "/oauth2/authorization/middle-proxy";
			} else if (jqXHR.status == 403) {
				jError("서버가 해당 요청을 이해했지만, 권한이 없어 요청이 거부되었습니다.", {
					/**
					 * [options]
					 * autoHide / Boolean            Default : true - jNotify closed after TimeShown ms or by clicking on it
					 * clickOverlay / Boolean         Default : false - If false, disables closing jNotify by clicking on the background overlay.
					 * MinWidth / Integer             Default : 200 - In pixel, the min-width css property of the boxes.
					 * TimeShown / Integer             Default : 1500 - In ms, time of the boxes appearances.
					 * ShowTimeEffect / Integer     Default : 200 - In ms, duration of the Show effect
					 * HideTimeEffect / Integer     Default : 200 - In ms, duration of the Hide effect
					 * LongTrip / Integer            Default : 15 - Length of the move effect ('top' and 'bottom' verticals positions only)
					 * HorizontalPosition / String    Default : right - Horizontal position. Can be set to 'left', 'center', 'right'
					 * VerticalPosition / String    Default : top - Vertical position. Can be set to 'top', 'center', 'bottom'.
					 * ShowOverlay / Boolean        Default : true - If true, a background overlay appears behind the jNotify boxes
					 * ColorOverlay / String        Default : #000 - Color of the overlay background (only Hex. color code)
					 * OpacityOverlay / Integer        Default : 0.3 - Opacity CSS property of the overlay background. From 0 to 1 max.
					 */
					autoHide: true, // added in v2.0
					TimeShown: 3000,
					HorizontalPosition: "center",
					VerticalPosition: "top"
					//    onCompleted : function(){ // added in v2.0
					//    alert('jNofity is completed !');
					// }
				});
				location.href = "/oauth2/authorization/middle-proxy";
			} else if (jqXHR.status == 500) {
				jError("서버가 해당 요청을 이해했지만, 실행 할 수 없습니다.");
			}
		})
		.ajaxComplete(function (event, jqXHR, ajaxOptions) {
			Ladda.stopAll();
		})
		.ajaxStop(function () {
			$(".loader").addClass("hide");
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
			200: function (data) {
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
			}
		},
		beforeSend: function () {
			//$("#regist_pdservice").hide(); 버튼 감추기
		},
		complete: function () {
			//$("#regist_pdservice").show(); 버튼 보이기
		},
		error: function (e) {
			jError("신규 제품 등록 중 에러가 발생했습니다.");
		}
	});
}

//데이터 테이블 하위에 상세 리스트 보이는거 지우기
function hideDetail_Datagrid() {
	$("#hostTable")
		.DataTable()
		.rows()
		.every(function () {
			// If row has details expanded
			if (this.child.isShown()) {
				// Collapse row details
				this.child.hide();
				$(this.node()).removeClass("shown");
			}
		});
}

//////////////////////////////////////////
// 페이지 이동 처리
//////////////////////////////////////////
function goToTemplatePage(pageName) {
	let current_page = getPageName(this.location.search);
	console.log("[common :: goToTemplatePage] :: current_page => " + current_page);
	if(current_page === "searchEngine") {
		console.log("[common :: goToTemplatePage] :: 검색페이지");
	} else {
		console.log("[common :: goToTemplatePage] :: pageName => " + pageName);
		window.location.href = "template.html?page=" + pageName;
	}
}

//////////////////////////////////////////
// 검색어 포함 페이지 이동 처리
//////////////////////////////////////////
function goToTemplatePageWithSearchString(pageName, searchString) {
	console.log("[common :: goToTemplatePageWithSearchString] :: pageName => " + pageName+", 검색어 => " + searchString);
	let current_page = getPageName(this.location.search);

	if(current_page === "searchEngine") {
		console.log("[common :: goToTemplatePageWithSearchString] :: current_page => " + current_page);
		console.log("[common :: goToTemplatePageWithSearchString] :: 검색페이지");
		$("#search-input").val(searchString);
		$("#search-button").click();
	} else {
		console.log("[common :: goToTemplatePageWithSearchString] :: 검색어와 함께 페이지 이동");
		window.location.href = "/arms/template.html?page=" + pageName+"&searchString="+searchString;
	}
}

function laddaBtnSetting(라따적용_클래스이름_배열) {
	for (i = 0; i < 라따적용_클래스이름_배열.length; i++) {
		// add css
		$(라따적용_클래스이름_배열[i]).addClass("ladda-button");

		// Bind progress buttons and simulate loading progress
		Ladda.bind(라따적용_클래스이름_배열[i], {
			callback: function (instance) {
				var progress = 0;
				var interval = setInterval(function () {
					progress = Math.min(progress + 0.1, 1);
					instance.setProgress(progress);

					if (progress === 1) {
						instance.stop();
						clearInterval(interval);
					}
				}, 250);
			}
		});
	}
}

class UrlBuilder {
	constructor() {
		this.baseUrl = "";
		this.queryParams = {};
	}

	setBaseUrl(url) {
		this.baseUrl = url;
		return this;
	}

	addQueryParam(key, value) {
		this.queryParams[key] = value;
		return this;
	}

	build() {
		const queryString = new URLSearchParams(this.queryParams).toString();
		return `${this.baseUrl}?${queryString}`;
	}
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(";");
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

/////////////////////////////////
//투어가이드모드 쿠키 - 가져오기
/////////////////////////////////
function getTourGuideMode() {
	let tourGuideMode = getCookie("tourGuideMode");
	if (tourGuideMode) {
		return tourGuideMode;
	} else {
		//쿠키가 없을 때, "on"으로 체크
		setTourGuideMode("on");
		return getCookie("tourGuideMode");
	}
}

/////////////////////////////////
//투어가이드 쿠키 저장/수정
/////////////////////////////////
function setTourGuideMode(mode) {
	console.log("[ common :: setTourGuideMode ] :: mode → " + mode);
	$.cookie("tourGuideMode", mode, { expires: 7 });
	return mode;
}

function tourGuideStart() {
	let pageName = getPageName(this.location.search);
	console.log("[ common :: tourGuideStart ] :: pageName → " + pageName);
	let tg = TourGuideApi.makeInstance(pageName);
	tg.start();
}

function checkTourGuideMode() {
	let tourGuideMode = getTourGuideMode();

	if (!checkMobileDevice()) {
		if (tourGuideMode === "off") {
			console.log("common :: checkTourGuideMode : tourGuideMode is Off");
		} else {
			//mode 가 없거나 on 일때
			console.log("common :: checkTourGuideMode : tourGuideMode is On");
			setTourGuideMode("on");
			setTimeout(function () {
				tourGuideStart();
			}, 1200);
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////
//톱니바퀴(config) 투어가이드 이벤트리스너
////////////////////////////////////////////////////////////////////////////////////////
function tourGuideEventListener() {
	console.log("common :: tourGuideEventListener : tourGuideEventListener 시작");
	let tgm = getCookie("tourGuideMode");
	if (tgm === "off") {
		$("#tourGuideButtons #tour_guide_off").addClass("active");
	} else {
		$("#tourGuideButtons #tour_guide_on").addClass("active");
	}

	$("#tourGuideButtons button").click(function () {
		let $active_label = $(this).text().toLowerCase();
		console.log($active_label);
		if ($active_label === "on") {
			setTourGuideMode("on");
		} else {
			setTourGuideMode("off");
		}
	});
}

function getPageName() {
	const queryString = location.search;
	const params = new URLSearchParams(queryString);
	const page = params.get("page");

	if (!isEmpty(page)) { // page param의 위치
		return page;
	}
	return "페이지 이름 없음"; //페이지 이름이 없을 경우.
}

////////////////////////////////////////////////////////////////////////
// 모바일 디바이스인지 확인
////////////////////////////////////////////////////////////////////////
function checkMobileDevice() {
	// 모바일 기기에서 접근했는지 확인
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	console.log("[ common :: checkMobileDevice] isMobile → " + isMobile);
	return isMobile;
}

////////////////////////////////////////////////////////////////////////////////////////
// 헤더 :: 톱니바퀴 대응함수
////////////////////////////////////////////////////////////////////////////////////////
function 톱니바퀴_초기설정() {
	//settings
	var $settings = $("#settings"),
		$sidebarSettings = $("#sidebar-settings"),
		settingsState = {
			sidebar: "left",
			sidebarState: "auto",
			displaySidebar: true
		},
		$pageHeader = $(".page-header"),
		$body = $("body"),
		popoverReallyHide = function () {
			$settings.data("bs.popover").hoverState = "out"; //yeah. cool BS3 fix. popover programmatic APi works only on HOVER
			$settings.popover("hide");
		},
		popoverClose = function (e) {
			var $popover = $settings.siblings(".popover");
			if ($popover.length && !$.contains($popover[0], e.target)) {
				popoverReallyHide();
				$(document).off("click", popoverClose);
			}
		},
		sidebarSide = function (side) {
			if (side == "right") {
				$body.addClass("sidebar-on-right");
			} else {
				$body.removeClass("sidebar-on-right");
			}
		},
		sidebarState = function (state, triggerResize) {
			var $template = $("#sidebar-settings-template");
			triggerResize = triggerResize == undefined ? true : false;
			if (!$template[0]) {
				return;
			}
			$sidebarSettings.html(_.template($template.html())({ sidebarState: state }));
			if (state == "auto") {
				$(".sidebar, .side-nav, .wrap, .logo").removeClass("sidebar-icons");
			} else {
				$(".sidebar, .side-nav, .wrap, .logo").addClass("sidebar-icons");
			}
			if (triggerResize) {
				triggerChartsResize();
			}
		},
		displaySidebar = function (display, triggerResize) {
			triggerResize = triggerResize == undefined ? true : false;
			if (display == true) {
				$body.removeClass("sidebar-hidden");
			} else {
				$body.addClass("sidebar-hidden");
			}
			if (triggerResize) {
				triggerChartsResize();
			}
		};

	sidebarSide(settingsState.sidebar);
	sidebarState(settingsState.sidebarState, false);
	displaySidebar(settingsState.displaySidebar, false);

	if (!$settings[0]) {
		return;
	}

	$settings
		.popover({
			template:
				'<div class="popover settings-popover">' +
				'<div class="arrow"></div>' +
				'<div class="popover-inner">' +
				'<div class="popover-content"></div>' +
				"</div>" +
				"</div>",
			html: true,
			animation: false,
			placement: "bottom",
			content: function () {
				if (typeof _ === "undefined") {
					return "미지원";
				}
				return _.template($("#settings-template").html())(settingsState);
			}
		})
		.click(function (e) {
			//close all open dropdowns
			$(".page-header .dropdown.open .dropdown-toggle").dropdown("toggle");
			// need to remove popover on anywhere-click
			$(document).on("click", popoverClose);
			$(this).focus();
			tourGuideEventListener(); // 투어가이드 이벤트리스너 설정.
			return false;
		});

	$(".page-header .dropdown-toggle").click(function () {
		popoverReallyHide();
		$(document).off("click", popoverClose);
	});
	//sidevar left/right
	$pageHeader.on("click", ".popover #sidebar-toggle .btn", function () {
		var $this = $(this),
			side = $this.data("value");
		sidebarSide(side);
		settingsState.sidebar = side;
		localStorage.setItem("settings-state", JSON.stringify(settingsState));
	});

	//sidebar visibility
	$pageHeader.on("click", ".popover #display-sidebar-toggle .btn", function () {
		var $this = $(this),
			display = $this.data("value");
		displaySidebar(display);
		settingsState.displaySidebar = display;
		localStorage.setItem("settings-state", JSON.stringify(settingsState));
	});

	//sidebar state {active, icons}
	$sidebarSettings.on("click", ".btn", function () {
		var $this = $(this),
			state = $this.data("value");
		if (state == "icons") {
			closeNavigation();
		}
		sidebarState(state);
		settingsState.sidebarState = state;
		localStorage.setItem("settings-state", JSON.stringify(settingsState));
	});

	//close navigation if sidebar in icons state
	if (($("#sidebar").is(".sidebar-icons") || $(window).width() < 1049) && $(window).width() > 767) {
		closeNavigation();
	}

	//imitate buttons radio behavior
	$pageHeader.on("click", ".popover [data-toggle='buttons-radio'] .btn:not(.active)", function () {
		var $this = $(this),
			$buttons = $this.parent().find(".btn");
		$buttons.removeClass("active");
		setTimeout(function () {
			$this.addClass("active");
		}, 0);
	});
}

/**
 * A global object containing theme specific colors, screen variables & color functions.
 * @type Object
 */
window.LightBlue = {
	screens: {
		"xs-max": 767,
		"sm-min": 768,
		"sm-max": 991,
		"md-min": 992,
		"md-max": 1199,
		"lg-min": 1200
	},

	isScreen: function (size) {
		var screenPx = window.innerWidth;
		return (
			(screenPx >= this.screens[size + "-min"] || size == "xs") &&
			(screenPx <= this.screens[size + "-max"] || size == "lg")
		);
	},

	getScreenSize: function () {
		var screenPx = window.innerWidth;
		if (screenPx <= this.screens["xs-max"]) return "xs";
		if (screenPx >= this.screens["sm-min"] && screenPx <= this.screens["sm-max"]) return "sm";
		if (screenPx >= this.screens["md-min"] && screenPx <= this.screens["md-max"]) return "md";
		if (screenPx >= this.screens["lg-min"]) return "lg";
	},

	//credit http://stackoverflow.com/questions/1507931/generate-lighter-darker-color-in-css-using-javascript
	changeColor: function (color, ratio, darker) {
		var pad = function (num, totalChars) {
			var pad = "0";
			num = num + "";
			while (num.length < totalChars) {
				num = pad + num;
			}
			return num;
		};
		// Trim trailing/leading whitespace
		color = color.replace(/^\s*|\s*$/, "");

		// Expand three-digit hex
		color = color.replace(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i, "#$1$1$2$2$3$3");

		// Calculate ratio
		var difference = Math.round(ratio * 256) * (darker ? -1 : 1),
			// Determine if input is RGB(A)
			rgb = color.match(
				new RegExp(
					"^rgba?\\(\\s*" +
						"(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])" +
						"\\s*,\\s*" +
						"(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])" +
						"\\s*,\\s*" +
						"(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])" +
						"(?:\\s*,\\s*" +
						"(0|1|0?\\.\\d+))?" +
						"\\s*\\)$",
					"i"
				)
			),
			alpha = !!rgb && rgb[4] != null ? rgb[4] : null,
			// Convert hex to decimal
			decimal = !!rgb
				? [rgb[1], rgb[2], rgb[3]]
				: color
						.replace(/^#?([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])/i, function () {
							return parseInt(arguments[1], 16) + "," + parseInt(arguments[2], 16) + "," + parseInt(arguments[3], 16);
						})
						.split(/,/),
			returnValue;

		// Return RGB(A)
		return !!rgb
			? "rgb" +
					(alpha !== null ? "a" : "") +
					"(" +
					Math[darker ? "max" : "min"](parseInt(decimal[0], 10) + difference, darker ? 0 : 255) +
					", " +
					Math[darker ? "max" : "min"](parseInt(decimal[1], 10) + difference, darker ? 0 : 255) +
					", " +
					Math[darker ? "max" : "min"](parseInt(decimal[2], 10) + difference, darker ? 0 : 255) +
					(alpha !== null ? ", " + alpha : "") +
					")"
			: // Return hex
			  [
					"#",
					pad(Math[darker ? "max" : "min"](parseInt(decimal[0], 10) + difference, darker ? 0 : 255).toString(16), 2),
					pad(Math[darker ? "max" : "min"](parseInt(decimal[1], 10) + difference, darker ? 0 : 255).toString(16), 2),
					pad(Math[darker ? "max" : "min"](parseInt(decimal[2], 10) + difference, darker ? 0 : 255).toString(16), 2)
			  ].join("");
	},
	lighten: function (color, ratio) {
		return this.changeColor(color, ratio, false);
	},
	darken: function (color, ratio) {
		return this.changeColor(color, ratio, true);
	}
};
function triggerChartsResize() {
	try {
		if (window.onresize) {
			window.onresize();
		}
	} catch (e) {
		//just swallow it
	}
	$(window).trigger("resize");
}

function targetLink(path) {
	const params = {};

	window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (str, key, value) => {
		if (!isEmpty(path) && key === "page") {
			params[key] = path;
		} else {
			params[key] = value;
		}
	});
	params["mode"] = "detail";

	location.href = `/arms/detail.html?${new URLSearchParams(params).toString()}`;
}

function gnuboardLink(bo_table) {
	const params = {};

	window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (str, key, value) => {
		if (!isEmpty(bo_table) && key === "page") {
			params[key] = "index";
		} else {
			if (key == "wr_id") {
				console.log("skip");
			} else {
				params[key] = value;
			}
		}
	});

	delete params["wr_id"];
	params["bo_table"] = bo_table;
	params["mode"] = "detail";

	location.href = `/php/gnuboard5/bbs/board.php?${new URLSearchParams(params).toString()}`;
}

function gnuboardList(param) {
	const params = {};
	var userMode = false;
	window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (str, key, value) => {
		if (key == "mode") {
			if (value == "detail") {
				userMode = true;
			}
		}
		params[key] = value;
	});

	if (userMode) {
		params["mode"] = "detail";
		location.href = param + `&${new URLSearchParams(params).toString()}`;
	} else {
		location.href = param;
	}
}

function gnuboardIndex() {
	const params = {};

	window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (str, key, value) => {
		if (key == "wr_id") {
			console.log("skip");
		} else {
			params[key] = value;
		}
	});
	params["page"] = "index";
	params["mode"] = "detail";

	location.href = `/php/gnuboard5/index.php?${new URLSearchParams(params).toString()}`;
}
////////////////////////////////////////////////////////////////////////////////////////
// 국제화 설정
////////////////////////////////////////////////////////////////////////////////////////
function loadLocale() {
	const locale = getCookie("locale");
	changeLocale(locale || "ko");
}

function changeLocale(locale) {
	const allowedLocale = ["ko", "jp", "en"];
	const selectedLocale = allowedLocale.includes(locale) ? locale : "ko";
	const $localeMenu = $(".locale-menu");
	$localeMenu.find(".locale-item").removeClass("active");
	$localeMenu.find(".locale-selector[data-key=" + selectedLocale + "]").closest(".locale-item").addClass("active");
	setCookie("locale", selectedLocale, 365);
	setLocale(selectedLocale);
}

function setLocale(locale = "ko") {
	$.ajax({
		url: `/arms/locales/${locale}.json`,
		async: false,
		dataType: "json"
	}).done(function (data) {
		bindLocaleText(flattenObject(data));
	});
}

function bindLocaleText(locales) {
	const targets = document.querySelectorAll("[data-locale]");

	targets.forEach((tag) => {
		const content = locales[tag.dataset.locale];
		if (content === undefined) {
			console.warn("해당 키에 대한 국제화 문자열이 없습니다.", tag.dataset.locale);
			return;
		}
		if (isIncludeHTMLTag(content)) {
			tag.innerHTML = sanitizeHTML(content);
		} else {
			tag.textContent = content;
		}
	});
}

function isIncludeHTMLTag(content) {
	return /<\/?[a-z][\s\S]*>/i.test(content);
}

function sanitizeHTML(content) {
	const allowedTags = ['span', 'small', 'strong', 'p', 'b', 'ul', 'li', 'br'];
	return content.replace(/<(\w+)[^>]*>|<\/(\w+)>/g, (match, openTag, closeTag) => {
		const tagName = (openTag || closeTag).toLowerCase();
		if (allowedTags.includes(tagName)) {
			return match.replace(/ on\w+="[^"]*"| on\w+='[^']*'/g, ''); // 이벤트 핸들러 속성 제거
		}
		return ''; // 허용되지 않은 태그 제거
	});
}

function flattenObject(obj, parentKey) {
	let result = {};

	Object.entries(obj).forEach(([key, value]) => {
		const _key = parentKey ? parentKey + "." + key : key;
		if (typeof value === "object") {
			result = { ...result, ...flattenObject(value, _key) };
		} else {
			result[_key] = value;
		}
	});

	return result;
}

/////////////////////////////////////
// 쿠키 설정
/////////////////////////////////////
function setCookie(name, value, exp = 1) {
	const path = "/arms";
	const date = new Date();
	date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${value};expires=${date.toUTCString()};path=${path}`;
}

/////////////////////////////////////
// 검색_이벤트_트리거
/////////////////////////////////////
function 검색_이벤트_트리거() {
	$("#nav-search-input").on("focus", function(event) {
		$("#nav-search-button").addClass("highlight");
	});

	$("#nav-search-input").on("blur", function(event) {
		$("#nav-search-button").removeClass("highlight");
	});
	// nav 검색창
	$("#search_form").on("submit", function (event) {
		event.preventDefault();

		let 검색어 = $("#nav-search-input").val().trim();
		if (검색어) {
			console.log("[page-header :: nav-search-start] :: 검색어 입력 값 => " + 검색어);
			setParameter("searchString", 검색어);
			goToTemplatePageWithSearchString("searchEngine", 검색어);
		} else {
			console.log("[page-header :: nav-search-start] :: 검색어가 없습니다. 검색페이지로 이동합니다");
			goToTemplatePage("searchEngine");
		}
	});

	$("#nav-search-button").on("click", function (event) {
		$("#search_form").trigger("submit");
	});
}

/////////////////////////////////////////////
// URL 파라미터값 찾기
/////////////////////////////////////////////
function getParameter(param) {
	param = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	let regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/////////////////////////////////////////////
// URL 파라미터값 수정
/////////////////////////////////////////////
function setParameter(param, value) {
	var url = new URL(window.location.href);
	url.searchParams.set(param, value);
	// Replace the currnt URL without reloading the page
	window.history.pushState({path:url.href}, '', url.href);
}