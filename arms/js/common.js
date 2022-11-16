// Page load & 상단 페이지 로드 프로그래스바
topbarConfig();
topbar.show();
setTimeout(function () {
	$(".container").fadeIn("slow");
	topbar.hide();
}, 2000);

// 상단 페이지 로드 프로그래스바 설정
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


// jQuery Document ready
$(function () {

	/* 로그인 인증 여부 체크 함수 */
	authUserCheck();

	/* include 레이아웃 html 파일을 로드하는 함수 */
	includeLayout();

	/* 맨위로 아이콘 */
	rightBottomTopForwardIcon();

});

// 맨위로 아이콘
function rightBottomTopForwardIcon(){
	$("#topicon").click(function () {
		$("html, body").animate({ scrollTop: 0 }, 400);
		return false;
	});
}

// 로그인 인증 여부 체크 함수
function authUserCheck() {
	$.ajax({
		url: "/auth-check" + "/identity",
		type: "GET",
		timeout: 7313,
		global: false,
		statusCode: {
			200: function (n) {
				console.log("authUserCheck :: " + n);
			},
			401: function (n) {
				location.href = "/sso/login";
			},
		},
	});
}

// include 레이아웃 html 파일을 로드하는 함수
function includeLayout() {
	var includeArea = $("[data-include]");
	var self, url;
	$.each(includeArea, function () {
		self = $(this);
		url = self.data("include");
		self.load(url, function () {
			self.removeAttr("data-include");
		});
	});
}


//서버 바인딩 할 수가 없어서 프로토타입 목적으로 json 을 만들어서 로드하는 함수
const getJsonForPrototype = function (url, bindTemplate) {
	ajaxGet(url).then(function (data) {
		bindTemplate(data);
	});
};


const dateFormat = (time = 0) => {
	let date = time ? new Date(time).toISOString() : new Date().toISOString();
	return date.split("T")[0];
};

const ajaxGet = (url) =>
	$.ajax({
		url,
		type: "GET",
		timeout: 7313,
		global: false,
		statusCode: {
			200: function (data) {
				return data.responseJSON;
			},
			401: function (n) {
				location.href = "/sso/login";
			},
		},
	});


// --- 왼쪽 사이드 메뉴 설정 --- //
function setSideMenu( categoryName, listName, collapse = "product-elements-collapse") {
	console.log("setSideMenu :: categoryName -> " + categoryName + ", listName -> " + listName);
	setTimeout(function () {
		$(`#${categoryName}`).css({ color: "lightblue" });
		$(`#${categoryName}`).css({ "font-weight": "900" });

		$(`#${listName}`).addClass("active");
		$(`#${listName}`).css({ color: "lightblue" });
		$(`#${listName}`).css({ "font-weight": "900" });
	}, 1000);
}

// --- 데이터 테이블 설정 ( 곧 삭제 대상 ) --- //
function setTable(tableDataUrl, dataList, options = null, selectedView = null) {
	jstreeDataTableReload(tableDataUrl, dataList, options, selectedView);

	//datatable 좌상단 datarow combobox style
	$(".dataTables_length").find("select:eq(0)").addClass("darkBack");
	$(".dataTables_length").find("select:eq(0)").css("min-height", "30px");
}

// --- 데이터 테이블 설정 ( 곧 삭제 대상 ) --- //
function jstreeDataTableReload(tableDataUrl, dataList, options, selectedView) {
	console.log("href: " + $(location).attr("href"));
	console.log("protocol: " + $(location).attr("protocol"));
	console.log("host: " + $(location).attr("host"));
	console.log("pathname: " + $(location).attr("pathname"));
	console.log("search: " + $(location).attr("search"));
	console.log("hostname: " + $(location).attr("hostname"));
	console.log("port: " + $(location).attr("port"));

	var isDevelopingToRoute = "/auth-user";
	var tableOptions = options
		? options
		: {
				ajax: {
					url: isDevelopingToRoute + tableDataUrl,
					dataSrc: "",
				},
				destroy: true,
				processing: true,
				responsive: true,
				select: true,
				columns: dataList,
		  };

	var tempDataTable = $("#jstreeTable").DataTable({
		...tableOptions,
	});

	$("#jstreeTable tbody").on("click", "tr", function () {
		var data = tempDataTable.row(this).data();
		console.log(data);
		//alert( 'You clicked on '+ data.c_title +'\'s row' );
	});

	$("#jstreeTable").css("width", "100%");

	selectedView &&
		$("#selectView").click(function () {
			var selectedItem = tempDataTable.rows(".selected").data()[0].c_id;
			console.log(selectedItem);
			location.href = `${selectedView}.html?c_id=${selectedItem}`;
		});
}

// --- dataTable build 설정 --- //
function dataTableBuild(jQueryElementID, serviceNameForURL, endPointUrl="/getMonitor.do", columnList, rowsGroupList = null){

	console.log("dataTableBuild :: jQueryElementID -> " + jQueryElementID + ", serviceNameForURL -> " + serviceNameForURL);
	console.log("dataTableBuild :: columnList -> " + columnList + ", rowsGroupList -> " + rowsGroupList);

	console.log("dataTableBuild :: href: " + $(location).attr("href"));
	console.log("dataTableBuild :: protocol: " + $(location).attr("protocol"));
	console.log("dataTableBuild :: host: " + $(location).attr("host"));
	console.log("dataTableBuild :: pathname: " + $(location).attr("pathname"));
	console.log("dataTableBuild :: search: " + $(location).attr("search"));
	console.log("dataTableBuild :: hostname: " + $(location).attr("hostname"));
	console.log("dataTableBuild :: port: " + $(location).attr("port"));

	var authCheckURL = "/auth-user";

	var tempDataTable = $(jQueryElementID).DataTable({
		ajax: {
			url: authCheckURL + "/api/arms/" + serviceNameForURL + endPointUrl,
			dataSrc: "",
		},
		destroy: true,
		processing: true,
		responsive: false,
		columns: columnList,
		rowsGroup: rowsGroupList,
		columnDefs: [
			{
				targets: -1,
				className: "dt-body-left",
			},
		],
		drawCallback: function() {
			dataTableCallBack();
		}
	});

	$(jQueryElementID + " tbody").on("click", "tr", function () {

		if ($(this).hasClass("selected")) {
			$(this).removeClass("selected");
		} else {
			tempDataTable.$("tr.selected").removeClass("selected");
			$(this).addClass("selected");
		}

		var selectedData = tempDataTable.row(this).data();
		selectedData.selectedIndex = $(this).closest('tr').index();

		var info = tempDataTable.page.info();
		console.log( 'Showing page: '+info.page+' of '+info.pages );
		selectedData.selectedPage = info.page;

		dataTableClick(selectedData);
	});

	// ----- 데이터 테이블 빌드 이후 스타일 구성 ------ //
	//datatable 좌상단 datarow combobox style
	$(".dataTables_length").find("select:eq(0)").addClass("darkBack");
	$(".dataTables_length").find("select:eq(0)").css("min-height", "30px");
	//min-height: 30px;

	return tempDataTable;
}

// --- jstree build 설정 -- //
function jsTreeBuild(jQueryElementID, serviceNameForURL) {

	console.log("jsTreeBuild :: jQueryElementID -> " + jQueryElementID + ", serviceNameForURL -> "+ serviceNameForURL);

	console.log("jsTreeBuild :: href: " + $(location).attr("href"));
	console.log("jsTreeBuild :: protocol: " + $(location).attr("protocol"));
	console.log("jsTreeBuild :: host: " + $(location).attr("host"));
	console.log("jsTreeBuild :: pathname: " + $(location).attr("pathname"));
	console.log("jsTreeBuild :: search: " + $(location).attr("search"));
	console.log("jsTreeBuild :: hostname: " + $(location).attr("hostname"));
	console.log("jsTreeBuild :: port: " + $(location).attr("port"));

	var authCheckURL = "/auth-user";

	$(jQueryElementID)
		.bind("before.jstree", function (e, data) {
			$("#alog").append(data.func + "<br />");
			$("li:not([rel='drive']).jstree-open > a > .jstree-icon").css(
				"background-image",
				"url(http://www.a-rms.net/313devgrp/reference/jquery-plugins/jstree-v.pre1.0/themes/toolbar_open.png)"
			);
			$("li:not([rel='drive']).jstree-closed > a > .jstree-icon").css(
				"background-image",
				"url(http://www.a-rms.net/313devgrp/reference/jquery-plugins/jstree-v.pre1.0/themes/ic_explorer.png)"
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
				"checkbox",
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
					url:
						authCheckURL + "/api/arms/" + serviceNameForURL + "/getChildNode.do",
					// the `data` function is executed in the instance's scope
					// the parameter is the node being loaded
					// (may be -1, 0, or undefined when loading the root nodes)
					data: function (n) {
						// the result is fed to the AJAX request `data` option
						console.log(n);
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
					url:
						authCheckURL + "/api/arms/" + serviceNameForURL + "/searchNode.do",
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
			$.post(
				authCheckURL + "/api/arms/" + serviceNameForURL + "/addNode.do",
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
								console.log(data);
							}
						);
					}
					jsTreeBuild(jQueryElementID, serviceNameForURL);
				}
			);
		})
		.bind("remove.jstree", function (e, data) {
			data.rslt.obj.each(function () {
				$.ajax({
					async: false,
					type: "POST",
					url:
						authCheckURL + "/api/arms/" + serviceNameForURL + "/removeNode.do",
					data: {
						c_id: this.id.replace("node_", "").replace("copy_", ""),
					},
					success: function (r) {
						jNotify("Notification : <strong>Remove Node</strong>, Complete !");
						if (typeof Chat != "undefined") {
							Chat.sendMessage(
								"노드를 삭제했습니다. 삭제된 노드의 아이디는 " + r.c_id,
								function (data) {
									console.log(data);
								}
							);
						}
						jsTreeBuild(jQueryElementID, serviceNameForURL);
					},
				});
			});
		})
		.bind("rename.jstree", function (e, data) {
			$.post(
				authCheckURL + "/api/arms/" + serviceNameForURL + "/alterNode.do",
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
							"노드를 변경했습니다. 변경된 노드의 아이디는 " + r.c_id,
							function (data) {
								console.log(data);
							}
						);
					}
					jsTreeBuild(jQueryElementID, serviceNameForURL);
				}
			);
		})
		.bind("set_type.jstree", function (e, data) {
			$.post(
				authCheckURL + "/api/arms/" + serviceNameForURL + "/alterNodeType.do",
				{
					c_id: data.rslt.obj.attr("id").replace("node_", "").replace("copy_", ""),
					c_title: data.rslt.new_name,
					c_type: data.rslt.obj.attr("rel"),
				},
				function (r) {
					jSuccess("Node Type Change");
					if (typeof Chat != "undefined") {
						Chat.sendMessage(
							"노드를 변경했습니다. 변경된 노드의 아이디는 " + r.c_id,
							function (data) {
								console.log(data);
							}
						);
					}
					jsTreeBuild(jQueryElementID, serviceNameForURL);
				}
			);
		})
		.bind("move_node.jstree", function (e, data) {
			data.rslt.o.each(function (i) {
				$.ajax({
					async: false,
					type: "POST",
					url: authCheckURL + "/api/arms/" + serviceNameForURL + "/moveNode.do",
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
						if (typeof Chat != "undefined") {
							Chat.sendMessage(
								"노드가 이동되었습니다. 이동된 노드의 아이디는 " + r.c_id,
								function (data) {
									console.log(data);
								}
							);
						}
						jsTreeBuild(jQueryElementID, serviceNameForURL);
					},
				});
			});
		})
		.bind("select_node.jstree", function (event, data) {
			// `data.rslt.obj` is the jquery extended node that was clicked
			if ($.isFunction(jsTreeClick)) {
				console.log(data.rslt.obj);
				jsTreeClick(data.rslt.obj);
			}
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
