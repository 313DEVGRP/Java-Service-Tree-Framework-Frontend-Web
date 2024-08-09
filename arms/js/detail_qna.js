////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디

function execDocReady() {
	var pluginGroups = [
		[
			"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js",
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js"
		]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			console.log("모든 플러그인 로드 완료");
			setUrlParams();
			$(".widget").widgster();
			setSideMenu("sidebar_menu_product", "sidebar_menu_qna");
			$(".slimScrollDiv").slimScroll({
				height: "550px",
				railVisible: true,
				railColor: "#222",
				railOpacity: 0.3,
				wheelStep: 10,
				allowPageScroll: false,
				disableFadeOut: false
			});

			getTotalCount();
			getReqCommentList(0);
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

function getTotalCount() {
	console.log("ReqComment Total Count :::");

	$(".spinner").html('<i class="fa fa-spinner fa-spin"></i> 데이터를 로드 중입니다...');
	$.ajax({
		url: "/auth-user/api/arms/reqComment/getTotalCountReqComment.do",
		type: "GET",
		data: {
			c_pdservice_link: selectedPdService,
			c_req_link: selectedJsTreeId
		},
		async: false,
		statusCode: {
			200: function (data) {
				//모달 팝업 끝내고
				console.log(data.response);
				totalReqCommentCount = data.response;
			}
		},
		beforeSend: function () {},
		complete: function () {},
		error: function (e) {
			jError("QnA 게시물 조회 중 에러가 발생했습니다.");
		}
	});
}

function getReqCommentList(pageNum) {
	console.log("ReqList Tab ::::");

	var pageSize = 10;
	var totalPages = 0;
	var curPage = pageNum;
	var previousDate = null;
	if (totalReqCommentCount) {
		totalPages = Math.ceil(totalReqCommentCount / pageSize);
		console.log("totalPages : " + totalPages);

		// $(".pagination").empty();
		// var htmlStr = bindPagination(curPage, totalPages, "getReqCommentList");
		//
		// $(".pagination").append(htmlStr);
	} else {
		noReqCommentMessage();
		return;
	}

	$(".spinner").html('<i class="fa fa-spinner fa-spin"></i> 데이터를 로드 중입니다...');
	$.ajax({
		url: "/auth-user/api/arms/reqComment/getReqCommentPagingByPdService.do",
		type: "GET",
		data: {
			c_pdservice_link: selectedPdService,
			c_req_link: selectedJsTreeId,
			pageIndex: pageNum,
			pageUnit: pageSize
		},
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		statusCode: {
			200: function (data) {
				var $chatMessages = $("#chat_messages");
				$chatMessages.empty();

				if (data.response.length === 0) {
					/* 게시글이 없을 경우 처리 필요 */
					noReqCommentMessage();
					return;
				}

				makeTemplate(data.response);
			}
		},
		beforeSend: function () {},
		complete: function () {},
		error: function (e) {
			jError("QnA 게시물 조회 중 에러가 발생했습니다.");
		}
	});
}

function noReqCommentMessage() {
	var $chatMessages = $("#chat_messages");
	$chatMessages.empty();

	var $noDataHtml = $(`<p class="empty-message">
                                            등록된 글이 없습니다.
                                         </p>`);
	$chatMessages.append($noDataHtml);
}

function addReqComment() {
	const content = document.getElementById("new_message");

	if (!content.value) {
		alert("질문을 작성 후 등록해주세요.");
		return;
	}

	$(".spinner").html('<i class="fa fa-spinner fa-spin"></i> 데이터를 로드 중입니다...');
	$.ajax({
		url: "/auth-user/api/arms/reqComment/addReqComment.do",
		type: "POST",
		data: {
			ref: 2,
			c_pdservice_link: selectedPdService,
			c_req_link: selectedJsTreeId,
			c_type: "default",
			c_req_comment_sender: userName,
			c_req_comment_contents: content.value
		},
		statusCode: {
			200: function () {
				//모달 팝업 끝내고
				jSuccess("등록 되었습니다.");
				$("#comment-contents").val("");
				$("#comment-contents").css("height", "40px");
				getTotalCount();
				getReqCommentList(1);
				//데이터 테이블 데이터 재 로드
				content.value = "";
			}
		},
		beforeSend: function () {},
		complete: function () {},
		error: function (e) {
			jError("신규 게시물 등록 중 에러가 발생했습니다.");
		}
	});
}

function makeMessageList(wrap, comment, time) {
	const message = document.createElement("div");
	const isSender = comment.c_req_comment_sender === userName;

	message.className = "chat-message";
	message.innerHTML = `
      <div class="sender ${isSender ? "pull-right" : "pull-left"}">
        <div class="icon">
          <img src="${comment.imageUrl ?? "img/community_devtool/github.png"}" class="img-circle" alt="${
		comment.c_req_comment_sender
	} profile" />
        </div>
           <p class="text-align-center">${comment.c_req_comment_sender}</p>
      </div>
      <div class="chat-message-body ${isSender ? "on-left" : ""}">
        <span class="arrow"></span>
        <div id="${comment.c_id}-comment" class="text default">${comment.c_req_comment_contents}</div>
        <div class="text eidt-comment edit"><textarea id="${comment.c_id}-edit" class="edit-text-area">${
		comment.c_req_comment_contents
	}</textarea></div>
        <div class="text action-group">
        	<span class="handle-group default">
						${isSender ? `
						<button onclick="handleEditClick($(this), ${comment.c_id}, '${comment.c_req_comment_contents}')">
							<i style="color:gray;" class="fa fa-edit"></i>
						</button>
						<button onclick="handleDeleteClick(${comment.c_id})">
							<i style="color:gray;" class="fa fa-trash-o"></i>
						</button>
						` : ""}
					</span>
					<span class="edit-group edit">
						<button onclick="handleModify(${comment.c_id})">
							<i style="color:gray;" class="fa fa-check"></i>
						</button>
						<button onclick="handleCancel($(this))">
							<i style="color:gray;" class="fa fa-times"></i>
						</button>
					</span>
					<span style="color:gray">${time}</span>
				</div>
      </div>
    `;

	wrap.append(message);
}
function makeTemplate(comments) {
	const wrap = document.getElementById("chat_messages");
	let date = null;

	comments.forEach((comment) => {
		const fullDate = dateFormat(comment.c_req_comment_date).split(" - ");

		if (!date || date !== fullDate[0]) {
			date = fullDate[0];
			const dateEl = document.createElement("div");
			dateEl.className = "date-separator";
			dateEl.innerHTML = `<div class=><i class="bx bx-calendar"></i> ${
				dateFormat(comment.c_req_comment_date).split(" - ")[0]
			}</div>`;

			wrap.append(dateEl);
		}

		makeMessageList(wrap, comment, fullDate[1]);
	});
}

function handleEditClick(e, id, comment) {
	document.getElementById(`${id}-edit`).value = comment;
	const messageBody = e.closest(".chat-message-body");
	messageBody.find(".default").hide();
	messageBody.find(".edit").show();
}

function handleDeleteClick(c_id) {
	if (confirm("해당 글을 삭제하시겠습니까?")) {
		console.log("delete : " + c_id);
		$(".spinner").html('<i class="fa fa-spinner fa-spin"></i> 데이터를 로드 중입니다...');
		$.ajax({
			url: "/auth-user/api/arms/reqComment/removeNode.do",
			type: "DELETE",
			data: {
				c_id
			},
			statusCode: {
				200: function () {
					//모달 팝업 끝내고
					jSuccess("삭제 되었습니다.");
					getTotalCount();
					getReqCommentList(1);
				}
			},
			beforeSend: function () {},
			complete: function () {},
			error: function (e) {
				jError("게시물 삭제 중 에러가 발생했습니다.");
			}
		});
	}
}

function handleModify(id) {
	const comment = document.getElementById(`${id}-edit`).value;

	req_comment_edit_btn_click(id, comment);
}

function handleCancel(e) {
	const messageBody = e.closest(".chat-message-body");
	messageBody.find(".default").show();
	messageBody.find(".edit").hide();
}

function req_comment_edit_btn_click(c_id, commentText) {
	if (confirm("해당 글을 수정하시겠습니까?")) {
		console.log("edit : " + c_id + "\ncontents : " + commentText);
		console.log("edit : " + c_id);

		var content = commentText;
		if (content === null || content === "") {
			alert("질문을 작성 후 수정해주세요.");
			return;
		}

		$(".spinner").html('<i class="fa fa-spinner fa-spin"></i> 데이터를 로드 중입니다...');
		$.ajax({
			url: "/auth-user/api/arms/reqComment/updateNode.do",
			type: "PUT",
			data: {
				c_id,
				c_req_comment_contents: commentText
			},
			statusCode: {
				200: function () {
					//모달 팝업 끝내고
					jSuccess("수정 되었습니다.");
					getTotalCount();
					getReqCommentList(1);
				}
			},
			beforeSend: function () {},
			complete: function () {},
			error: function (e) {
				jError("게시물 수정 중 에러가 발생했습니다.");
			}
		});
	}
}
