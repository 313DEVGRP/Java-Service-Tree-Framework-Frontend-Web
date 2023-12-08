////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디
var selectId; // 제품 아이디
var selectName; // 제품 이름
var selectedIndex; // 데이터테이블 선택한 인덱스
var selectedPage; // 데이터테이블 선택한 인덱스
var selectVersion; // 선택한 버전 아이디

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

			//좌측 메뉴
			$(".widget").widgster();
			setSideMenu("sidebar_menu_product", "sidebar_menu_qna");
			// 스크립트 실행 로직을 이곳에 추가합니다.

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

				console.log(data.response);

				if (data.response.length === 0) {
					/* 게시글이 없을 경우 처리 필요 */
					noReqCommentMessage();
					return;
				}

				data.response.forEach((comment) => makeTemplate(comment));

				// data.response.forEach(function (comment) {
				// 	var result = createReqCommentList(comment, previousDate);
				// 	var commentHtml = result.$newHtml;
				// 	previousDate = result.date;
				// 	$chatMessages.append(commentHtml);
				// });

				// reqCommentRegisterEventHandlers();
			}
		},
		beforeSend: function () {},
		complete: function () {},
		error: function (e) {
			jError("QnA 게시물 조회 중 에러가 발생했습니다.");
		}
	});
}

function addReqComment() {
	const content = document.getElementById("new_message").value;

	if (!content) {
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
			c_req_comment_contents: content
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
			}
		},
		beforeSend: function () {},
		complete: function () {},
		error: function (e) {
			jError("신규 게시물 등록 중 에러가 발생했습니다.");
		}
	});
}

function makeTemplate(comment) {
	const wrap = document.getElementById("chat_messages");
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
      </div>
      <div class="chat-message-body ${isSender ? "on-left" : ""}">
        <span class="arrow"></span>
        <div class="sender"><a href="#">${comment.c_req_comment_sender}</a></div>
        <div class="text">${comment.c_req_comment_contents}</div>
      </div>
    `;

	wrap.append(message);
}
