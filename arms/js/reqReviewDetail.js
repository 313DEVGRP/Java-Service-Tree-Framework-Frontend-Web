////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
// --- 사이드 메뉴 -- //
function execArmsDocReady() {
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_review",
		"requirement-elements-collapse"
	);

	//getJsonForPrototype("./js/reviewDetailHistory.json", makeHistory);

	includeDiff();

	getPdService();

	//getVersion();


	getReqReviewHistory();

	getReqAdd();

	getReqAddLog();

};

function getPdService() {

	var searchParams = new URLSearchParams(location.search);
	console.log(searchParams.get('c_id'));

	$.ajax({
		url: "/auth-user/api/arms/pdService/getNode.do",
		data: {
			c_id: searchParams.get('c_review_pdservice_link')
		},
		type: "GET",
		progress: true,
		statusCode: {
			200: function (json) {
				console.log(json);
			},
			401: function (n) {
				location.href = "/sso/login";
			},
		},
	}).done(function(data) {

		for(var key in data){
			var value = data[key];
			console.log(key + "=" + value);
		}

		var loopCount = 3;
		for (var i = 0; i < loopCount ; i++) {
			console.log( "loop check i = " + i );
		}

	}).fail(function(e) {
	}).always(function() {
	});
}

function getReqAddLog() {

	var searchParams = new URLSearchParams(location.search);
	console.log(searchParams.get('c_id'));

	$.ajax({
		url: "/auth-user/api/arms/reqAddLog/T_ARMS_REQADD_" + searchParams.get('c_review_pdservice_link') + "/getHistory.do",
		data: {
			c_id: searchParams.get('c_review_req_link')
		},
		type: "GET",
		progress: true,
		statusCode: {
			200: function (json) {
				console.log(json);
			},
			401: function (n) {
				location.href = "/sso/login";
			},
		},
	}).done(function(data) {

		for(var key in data){
			var value = data[key];
			console.log(key + "=" + value);
		}

		var loopCount = 3;
		for (var i = 0; i < loopCount ; i++) {
			console.log( "loop check i = " + i );
		}

	}).fail(function(e) {
	}).always(function() {
	});
}

function getReqAdd() {

	var searchParams = new URLSearchParams(location.search);
	console.log(searchParams.get('c_id'));

	$.ajax({
		url: "/auth-user/api/arms/reqAdd/T_ARMS_REQADD_" + searchParams.get('c_review_pdservice_link') + "/getNode.do",
		data: {
			c_id: searchParams.get('c_review_req_link')
		},
		type: "GET",
		progress: true,
		statusCode: {
			200: function (json) {
				console.log(json);
			},
			401: function (n) {
				location.href = "/sso/login";
			},
		},
	}).done(function(data) {

		for(var key in data){
			var value = data[key];
			console.log(key + "=" + value);
		}

		var loopCount = 3;
		for (var i = 0; i < loopCount ; i++) {
			console.log( "loop check i = " + i );
		}

	}).fail(function(e) {
	}).always(function() {
	});
}

function getReqReviewHistory() {

	var searchParams = new URLSearchParams(location.search);
	console.log(searchParams.get('c_id'));
	var c_id = searchParams.get('c_id');
	var c_review_pdservice_link = searchParams.get('c_review_pdservice_link');
	var c_review_req_link = searchParams.get('c_review_req_link');

	var param = "?c_id=" + c_id + "&c_review_pdservice_link=" + c_review_pdservice_link + "&c_review_req_link=" + c_review_req_link;

	getJsonForPrototype("/auth-user/api/arms/reqReviewLog/getHistory.do" + param, buildHistory);

	// $.ajax({
	// 	url: "/auth-user/api/arms/reqReviewLog/getHistory.do",
	// 	data: {
	// 		reqID: searchParams.get('c_id')
	// 	},
	// 	type: "GET",
	// 	progress: true,
	// 	statusCode: {
	// 		200: function (json) {
	// 			console.log(json);
	// 		},
	// 		401: function (n) {
	// 			location.href = "/sso/login";
	// 		},
	// 	},
	// }).done(function(data) {
	//
	// 	for(var key in data){
	// 		var value = data[key];
	// 		console.log(key + "=" + value);
	// 	}
	//
	// 	var loopCount = 3;
	// 	for (var i = 0; i < loopCount ; i++) {
	// 		console.log( "loop check i = " + i );
	// 	}
	//
	// }).fail(function(e) {
	// }).always(function() {
	// });
}

const buildHistory = function (data) {
	const historys = document.querySelector(".review-history");

	let lists = "";
	data.forEach((item, index) => {
		lists += `
			<li class="timeline-item" data-value="${item.c_id}">
				<span class="timeline-icon label label-${historyLabel(item.c_method)}">
					${item.c_method}
				</span>
				<h5 class="fw-bold">${item.c_state}</h5>
				<time class="text-muted">${item.c_review_creat_date}</time>
				<div class="text-muted timeline-item-summary">
				 <strong style="color: #a4c6ff">STATE:</strong> ${item.c_review_result_state}<br>
					<strong style="color: #a4c6ff">ID:</strong> [${item.c_review_req_link}]-${item.c_review_req_name}<br>
					<strong style="color: #a4c6ff">IN:</strong> ${item.c_review_responder}<br>
					<strong style="color: #a4c6ff">OUT:</strong> ${item.c_review_sender}
				</div>
			</li>
		`;
	});

	historys.innerHTML = `<ul class="timeline-with-icons">${lists}</ul>`;
};

const makeHistory = function (data) {
	const historys = document.querySelector(".review-history");

	let lists = "";
	data.forEach((item, index) => {
		lists += `
			<li class="timeline-item" data-value="${item.value}">
				<span class="timeline-icon label label-${historyLabel(item.status)}">
					${item.status}
				</span>
				<h5 class="fw-bold">${item.title}</h5>
				<time class="text-muted">${dateFormat(item.upd_dt)}</time>
				<div class="text-muted timeline-item-summary">
					${item.summary}
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
		case "reject":
			icon = "fa-ban";
			break;
		case "pass":
			icon = "fa-check";
			break;
		case "none":
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
		case "start":
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
		renderNothingWhenEmpty: false,
	};
	const diff2htmlUi = new Diff2HtmlUI(targetElement, diffString, configuration);

	diff2htmlUi.draw();
	diff2htmlUi.highlightCode();
	diff2htmlUi.fileListToggle(false);
};
