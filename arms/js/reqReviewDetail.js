////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
// --- 사이드 메뉴 -- //
function execDocReady() {
	setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_review");

	//getJsonForPrototype("./js/reviewDetailHistory.json", makeHistory);

	//includeDiff();

	getReqReviewHistory();

	getReqAdd();

	getReqComment();

	setDetailAndEditViewTab();
}

///////////////////////////////////////////////////////////////////////////////
// pdService 정보 가져오기
///////////////////////////////////////////////////////////////////////////////
function getPdServiceInfo() {
	//정보 셋팅
	var searchParams = new URLSearchParams(location.search);
	var c_review_pdservice_link = searchParams.get("c_review_pdservice_link");
	var c_review_req_link = searchParams.get("c_review_req_link");

	$.ajax({
		url: "/auth-user/api/arms/pdService/getNode.do",
		data: {
			c_id: c_review_pdservice_link
		},
		type: "GET",
		progress: true
	})
		.done(function (data) {
			var selectedPdServiceText = data.c_title;
			if (isEmpty(selectedPdServiceText)) {
				$("#detailview_req_pdservice_name").text("");
			} else {
				$("#detailview_req_pdservice_name").text(selectedPdServiceText);
			}
		})
		.fail(function (e) {})
		.always(function () {});
}

///////////////////////////////////////////////////////////////////////////////
// version 정보 가져오기
///////////////////////////////////////////////////////////////////////////////
function getVersionInfo(c_version_link) {
	//정보 셋팅
	//특수 문자 중에 콤마는 빼고 지움
	var reg = /[\{\}\[\]\/?.;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
	c_version_link_str = c_version_link.replace(reg, "");

	$.ajax({
		url: "/auth-user/api/arms/pdServiceVersion/getVersionListByCids.do",
		data: {
			c_ids: c_version_link_str
		},
		type: "GET",
		progress: true
	})
		.done(function (data) {
			// for(var key in data){
			// 	var value = data[key];
			// 	console.log(key + "=" + value);
			// }

			var list = "";
			for (var i = 0; i < data.length; i++) {
				console.log("loop check i = " + i);
				list = list + data[i].c_title;
				if (i == data.length - 1) {
				} else {
					list = list + " , ";
				}
			}

			$("#detailview_req_pdservice_version").text(list);
		})
		.fail(function (e) {})
		.always(function () {});
}

////////////////////////////////////////////////////////////////////////////////////////
//상세 보기 탭 & 편집 탭
////////////////////////////////////////////////////////////////////////////////////////
function setDetailAndEditViewTab() {
	//정보 셋팅
	var searchParams = new URLSearchParams(location.search);
	var c_id = searchParams.get("c_id");
	var c_review_pdservice_link = searchParams.get("c_review_pdservice_link");
	var c_review_req_link = searchParams.get("c_review_req_link");

	var tableName = "T_ARMS_REQADD_" + c_review_pdservice_link;
	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/getNode.do?c_id=" + c_review_req_link,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true
	})
		.done(function (data) {
			// ------------------ 상세보기 ------------------ //
			bindDataDetailTab(data);
		})
		.fail(function (e) {})
		.always(function () {});
}

// ------------------ 상세보기 ------------------ //
function bindDataDetailTab(ajaxData) {
	//제품(서비스) 데이터 바인딩
	getPdServiceInfo();

	//Version 데이터 바인딩
	if (isEmpty(ajaxData.c_version_link)) {
		$("#detailview_req_pdservice_version").text("요구사항에 등록된 버전이 없습니다.");
	} else {
		getVersionInfo(ajaxData.c_version_link);
	}

	$("#detailview_req_id").text(ajaxData.c_id);
	$("#detailview_req_name").text(ajaxData.c_title);

	//우선순위 셋팅
	$("#detailview_req_priority").children(".btn.active").removeClass("active");
	var slectReqPriorityID = "detailView-req-priority-option" + ajaxData.c_priority;
	$("#" + slectReqPriorityID)
		.parent()
		.addClass("active");

	$("#detailview_req_status").text(ajaxData.c_req_status);
	$("#detailview_req_writer").text(ajaxData.c_writer);
	$("#detailview_req_write_date").text(`${getStrLimit(ajaxData.c_writer_date, 35)}`);

	if (ajaxData.c_reviewer01 == null || ajaxData.c_reviewer01 == "none") {
		$("#detailview_req_reviewer01").text("리뷰어(연대책임자)가 존재하지 않습니다.");
	} else {
		$("#detailview_req_reviewer01").text(`${getStrLimit(ajaxData.c_reviewer01, 40)}`);
	}
	if (ajaxData.c_reviewer02 == null || ajaxData.c_reviewer02 == "none") {
		$("#detailview_req_reviewer02").text("");
	} else {
		$("#detailview_req_reviewer02").text(`${getStrLimit(ajaxData.c_reviewer02, 40)}`);
	}
	if (ajaxData.c_reviewer03 == null || ajaxData.c_reviewer03 == "none") {
		$("#detailview_req_reviewer03").text("");
	} else {
		$("#detailview_req_reviewer03").text(`${getStrLimit(ajaxData.c_reviewer03, 40)}`);
	}
	if (ajaxData.c_reviewer04 == null || ajaxData.c_reviewer04 == "none") {
		$("#detailview_req_reviewer04").text("");
	} else {
		$("#detailview_req_reviewer04").text(`${getStrLimit(ajaxData.c_reviewer04, 40)}`);
	}
	if (ajaxData.c_reviewer05 == null || ajaxData.c_reviewer05 == "none") {
		$("#detailview_req_reviewer05").text("");
	} else {
		$("#detailview_req_reviewer05").text(`${getStrLimit(ajaxData.c_reviewer05, 40)}`);
	}
	$("#detailview_req_contents").html(ajaxData.c_contents);
}

///////////////////////////////////////////////////////////////////////////////
// 커멘트 조회
///////////////////////////////////////////////////////////////////////////////
function getReqComment() {
	//정보 셋팅
	var searchParams = new URLSearchParams(location.search);
	var c_id = searchParams.get("c_id");
	var c_review_pdservice_link = searchParams.get("c_review_pdservice_link");
	var c_review_req_link = searchParams.get("c_review_req_link");

	$.ajax({
		url: "/auth-user/api/arms/reqComment/getComment.do",
		data: {
			c_id: c_id,
			c_review_pdservice_link: c_review_pdservice_link,
			c_review_req_link: c_review_req_link
		},
		type: "GET",
		progress: true
	})
		.done(function (data) {
			console.log(data);

			//////////////////////////////////////////////////////////////////////////////////
			var history = document.querySelector(".chat-messages");

			history.innerHTML = "";

			let lists =
				'<div class="chat-message">\n' +
				'\t\t\t\t\t\t\t\t\t\t<div class="sender pull-right">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t<div class="icon">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t<img src="../reference/lightblue4/docs/img/avatars/5.png" class="img-circle" alt="">\n' +
				"\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
				'\t\t\t\t\t\t\t\t\t\t\t<div class="time">\n' +
				"\t\t\t\t\t\t\t\t\t\t\t\t3 min\n" +
				"\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t\t\t\t\t\t</div>\n" +
				'\t\t\t\t\t\t\t\t\t\t<div class="chat-message-body on-left">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t<span class="arrow"></span>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t<div class="sender"><a href="#">Cenhelm Houston</a></div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t<div class="text">\n' +
				"\t\t\t\t\t\t\t\t\t\t\t\tPretty good. Doing my homework.. No one rejects, dislikes, or avoids\n" +
				"\t\t\t\t\t\t\t\t\t\t\t\tpleasure itself, because it is pleasure, but because\n" +
				"\t\t\t\t\t\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t\t\t\t\t</div>";
			data.forEach((item, index) => {
				lists += `
							<div class="chat-message">
								<div class="sender pull-left">
									<div class="icon">
										<img src="../reference/light-blue/img/15.jpg" class="img-circle" alt="" />
									</div>
							</div>
							<div class="chat-message-body">
								<span class="arrow"></span>
								<div class="sender"><a href="#">${getStrLimit(item.c_sender, 30)}</a> ( ${item.c_comment_date} )</div>
							<div class="text">${item.c_comment}</div>
							</div>
							</div>
		`;
			});

			history.innerHTML = `${lists}`;
			//////////////////////////////////////////////////////////////////////////////////
		})
		.fail(function (e) {})
		.always(function () {});
}

function getReqAdd() {
	var searchParams = new URLSearchParams(location.search);
	console.log(searchParams.get("c_id"));

	$.ajax({
		url: "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" + searchParams.get("c_review_pdservice_link") + "/getNode.do",
		data: {
			c_id: searchParams.get("c_review_req_link")
		},
		type: "GET",
		progress: true,
		statusCode: {
			200: function (json) {
				getReqStatus(json.c_issue_link);

				//////////////////////////////////////////////////////////////////////////
				var history = document.querySelector(".pdServiceInfo");

				history.innerHTML = "";

				let lists = "";
				lists += `
							<h4 class="details-title">Review Information</h4>
							<address>
									<strong style="color: #a4c6ff">요구사항 명</strong> : ${json.c_title}<br />
									<strong style="color: #a4c6ff">요구사항 상태</strong> : ${json.c_req_status}<br />
							</address>
							<li class="history-profile">
								<span class="history-profile--name"><i class="fa fa-sliders"></i> 리뷰어의 리뷰상황</span>
							</li>
							<li class="history-profile">
								<span class="history-profile--image"><i class="fa fa-user"></i></span>
								<span class="history-profile--name">${getStrLimit(json.c_reviewer01, 30)}</span>
								${historyReviewerStatus(json.c_reviewer01_status)}
							</li>
							<li class="history-profile">
								<span class="history-profile--image"><i class="fa fa-user"></i></span>
								<span class="history-profile--name">${getStrLimit(json.c_reviewer02, 30)}</span>
								${historyReviewerStatus(json.c_reviewer02_status)}
							</li>
							<li class="history-profile">
								<span class="history-profile--image"><i class="fa fa-user"></i></span>
								<span class="history-profile--name">${getStrLimit(json.c_reviewer03, 30)}</span>
								${historyReviewerStatus(json.c_reviewer03_status)}
							</li>
							<li class="history-profile">
								<span class="history-profile--image"><i class="fa fa-user"></i></span>
								<span class="history-profile--name">${getStrLimit(json.c_reviewer04, 30)}</span>
								${historyReviewerStatus(json.c_reviewer04_status)}
							</li>
							<li class="history-profile">
								<span class="history-profile--image"><i class="fa fa-user"></i></span>
								<span class="history-profile--name">${getStrLimit(json.c_reviewer05, 30)}</span>
								${historyReviewerStatus(json.c_reviewer05_status)}
							</li>
		`;

				history.innerHTML = `${lists}`;
				//////////////////////////////////////////////////////////////////////////
			},
			401: function (n) {
				location.href = "/sso/login";
			}
		}
	})
		.done(function (data) {
			for (var key in data) {
				var value = data[key];
				console.log(key + "=" + value);
			}

			var loopCount = 3;
			for (var i = 0; i < loopCount; i++) {
				console.log("loop check i = " + i);
			}
		})
		.fail(function (e) {})
		.always(function () {});
}

function getReqStatus(c_issue_link) {
	var searchParams = new URLSearchParams(location.search);

	$.ajax({
		url:
			"/auth-user/api/arms/reqStatus/T_ARMS_REQSTATUS_" +
			searchParams.get("c_review_pdservice_link") +
			"/getStatusChildNode.do",
		data: {
			c_ids: c_issue_link
		},
		type: "GET",
		progress: true,
		statusCode: {
			200: function (json) {
				console.log(json);
				//////////////////////////////////////////////////////////////////////////////////
				var history = document.querySelector(".Review-Detail-Div");

				history.innerHTML = "";

				let lists = "<h4 class='details-title'>Review - Jira Issue</h4>";
				json.forEach((item, index) => {
					lists += `
							<div class="darkBack font12">
								<span title="Work c_pdservice_name" style="color: #a4c6ff">제품(서비스)</span>: ${getStrLimit(
									item.c_pdservice_name,
									20
								)}<br />
								<span title="Work c_pdservice_name" style="color: #a4c6ff">버전</span>: ${getStrLimit(item.c_version_name, 20)}<br />
								<span title="Work c_pdservice_name" style="color: #a4c6ff">지라 프로젝트</span>: ${getStrLimit(
									item.c_jira_project_name,
									20
								)}<br />
								<span title="Work c_pdservice_name" style="color: #a4c6ff">지라 버전</span>: ${getStrLimit(
									item.c_jira_version_name,
									20
								)}<br />
								<span title="Work c_pdservice_name" style="color: #a4c6ff">지라 이슈</span>: ${getStrLimit(
									item.c_jira_req_issue_key,
									20
								)}<br />
							</div>
							<br>
		`;
				});

				history.innerHTML = `${lists}`;
				//////////////////////////////////////////////////////////////////////////////////
			},
			401: function (n) {
				location.href = "/sso/login";
			}
		}
	})
		.done(function (data) {
			for (var key in data) {
				var value = data[key];
				console.log(key + "=" + value);
			}

			var loopCount = 3;
			for (var i = 0; i < loopCount; i++) {
				console.log("loop check i = " + i);
			}
		})
		.fail(function (e) {})
		.always(function () {});
}

function getReqReviewHistory() {
	var searchParams = new URLSearchParams(location.search);
	console.log(searchParams.get("c_id"));
	var c_id = searchParams.get("c_id");
	var c_review_pdservice_link = searchParams.get("c_review_pdservice_link");
	var c_review_req_link = searchParams.get("c_review_req_link");

	var param =
		"?c_id=" + c_id + "&c_review_pdservice_link=" + c_review_pdservice_link + "&c_review_req_link=" + c_review_req_link;

	getJsonForPrototype("/auth-user/api/arms/reqReviewLog/getHistory.do" + param, buildHistory);
}

var buildHistory = function (data) {
	var history = document.querySelector(".review-history");

	history.innerHTML = "";

	let lists = "";
	data.forEach((item, index) => {
		lists += `
			<li class="timeline-item" data-value="${item.c_id}">
				<span class="timeline-icon label label-${historyLabel(item.c_method)}">
					${item.c_method}
				</span>
				<h5 class="fw-bold">${item.c_state}</h5>
				<time class="text-muted">${dateFormat(item.c_date)}</time>
				<div class="text-muted timeline-item-summary">
				 <strong style="color: #a4c6ff">STATE:</strong> ${item.c_review_result_state}<br>
					<strong style="color: #a4c6ff">ID:</strong> [${item.c_review_req_link}]-${item.c_review_req_name}<br>
					<strong style="color: #a4c6ff">RES:</strong> ${getStrLimit(item.c_review_responder, 15)} - (${historyReviewerStatus(
			item.c_review_result_state
		)})<br>
					<strong style="color: #a4c6ff">REQ:</strong> ${getStrLimit(item.c_review_sender, 15)}
				</div>
			</li>
		`;
	});

	history.innerHTML = `<ul class="timeline-with-icons">${lists}</ul>`;
};

const makeHistory = function (data) {
	const historys = document.querySelector(".review-history");

	let lists = "";
	data.history.forEach((item, index) => {
		lists += `
			<li class="timeline-item" data-value="${item.value}">
				<span class="timeline-icon label label-${historyLabel(item.status)}">
					${item.status}
				</span>
				<h5 class="fw-bold">${item.title}</h5>
				<time class="text-muted">${dateFormat(item.upd_dt)}</time>
				<div class="text-muted timeline-item--summary">
					${historySummary(item.summary)}
				</div>
			</li>
		`;
	});

	historys.innerHTML = `<ul class="timeline-with-icons">${lists}</ul>`;
};

const historySummary = (summary) => {
	let content = "";

	switch (true) {
		case !summary:
			break;
		case !!summary.desc:
			content = `<p>${summary.desc}</p>`;
			break;
		case !!summary.progress:
			content = `<p>진행률: ${summary.progress}%</p>`;
			break;
		case !!summary.modifier:
			content = `<ul>${historyProfile(summary.modifier)}</ul>`;
			break;
		case !!summary.reviewers:
			content = `<ul>${summary.reviewers.reduce((acc, cur) => {
				return (acc += historyProfile(cur));
			}, [])}</ul>`;
			break;
	}

	return content;
};

const historyReviewerStatus = (status) => {
	let icon = "fa-spinner";
	switch (status) {
		case "Reject":
			icon = "fa-ban";
			break;
		case "Accept":
			icon = "fa-check";
			break;
		default:
			break;
	}
	return `<i class="fa ${icon}"></i>`;
};
const historyProfile = (profile) => {
	return `
		<li class="history-profile">
			<span class="history-profile--image"><img src="${profile.image}" /></span>
			<span class="history-profile--name">${profile.name}</span>
			${!!profile.confirm ? historyReviewerStatus(profile.confirm) : ""}
		</li>
	`;
};

var historyLabel = (name) => {
	var label = "inverse";

	switch (name) {
		case "close":
			label = "success";
			break;
		case "reject":
			label = "important";
			break;
		case "modify":
			label = "warning";
			break;
		case "review":
		case "work":
			label = "info";
			break;
		case "insert":
			label = "success";
			break;
		case "update":
			label = "warning";
			break;
		case "delete":
			label = "important";
			break;
		default:
			break;
	}

	return label;
};

const includeDiff = function () {
	const diffString = `diff --git a/sample.js b/sample.js
index 0000001..0ddf2ba
--- a/sample.js
+++ b/sample.js
@@ -1 +1 @@
-console.log("Hello World!")
+console.log("Hello from Diff2Html!")`;

	const targetElement = document.getElementById("diff");
	const configuration = {
		drawFileList: true,
		fileListToggle: false,
		fileListStartVisible: false,
		fileContentToggle: false,
		matching: "lines",
		outputFormat: "side-by-side",
		synchronisedScroll: true,
		highlight: true,
		renderNothingWhenEmpty: false
	};
	const diff2htmlUi = new Diff2HtmlUI(targetElement, diffString, configuration);

	diff2htmlUi.draw();
	diff2htmlUi.highlightCode();
	diff2htmlUi.fileListToggle(false);
};

///////////////////////////////////////////////////////////////////////////////
// 요구사항 - 승인 클릭
///////////////////////////////////////////////////////////////////////////////
$("#show_info_accept").click(function () {
	set_Review_Result("Accept");
});

$("#show_info_reject").click(function () {
	set_Review_Result("Reject");
});

$("#show_info_delay").click(function () {
	set_Review_Result("Delay");
});

function set_Review_Result(reviewResult) {
	//정보 셋팅
	var searchParams = new URLSearchParams(location.search);
	var c_id = searchParams.get("c_id");
	var c_review_pdservice_link = searchParams.get("c_review_pdservice_link");
	var c_review_req_link = searchParams.get("c_review_req_link");

	//반영할 테이블 네임 값 셋팅
	var tableName = "T_ARMS_REQADD_" + c_review_pdservice_link;

	$.ajax({
		url: "/auth-user/api/arms/reqAdd/" + tableName + "/withReqReview/updateNode.do",
		data: {
			c_id: c_id,
			c_review_pdservice_link: c_review_pdservice_link,
			c_review_req_link: c_review_req_link,
			c_review_result_state: reviewResult
		},
		type: "POST",
		progress: true
	})
		.done(function (data) {
			//includeDiff();

			getReqReviewHistory();

			getReqAdd();
		})
		.fail(function (e) {})
		.always(function () {});
}

///////////////////////////////////////////////////////////////////////////////
// 요구사항 - 커멘트 등록
///////////////////////////////////////////////////////////////////////////////
$("#new_message_btn").click(function () {
	//정보 셋팅
	var searchParams = new URLSearchParams(location.search);
	var c_id = searchParams.get("c_id");
	var c_review_pdservice_link = searchParams.get("c_review_pdservice_link");
	var c_review_req_link = searchParams.get("c_review_req_link");

	$.ajax({
		url: "/auth-user/api/arms/reqReview/setComment.do",
		data: {
			c_id: c_id,
			c_review_pdservice_link: c_review_pdservice_link,
			c_review_req_link: c_review_req_link,
			reviewer: "[" + userName + "]" + " - " + userID,
			comment: $("#new_message").val()
		},
		type: "POST",
		progress: true
	})
		.done(function (data) {
			jSuccess("커멘트가 입력되었습니다.");

			//includeDiff();

			getReqReviewHistory();

			getReqAdd();

			getReqComment();
		})
		.fail(function (e) {})
		.always(function () {});
});
