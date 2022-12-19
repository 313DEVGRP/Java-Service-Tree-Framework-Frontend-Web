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

	getJsonForPrototype("./js/reviewDetailHistory.json", makeHistory);

	includeDiff();
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

const historyLabel = (name) => {
	let label = "inverse";

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
