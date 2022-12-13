// make review classify menu
var makeClassifyMenus = function (data) {
	var reviewClassify = document.getElementById("review-classify");
	var menus = "";
	data.forEach(
		(item) =>
			(menus += `
		<li class="${item.current ? "active" : ""}" data-order="${item.order}">
			<a href="#">${item.name}</a>
		</li>
	`)
	);
	reviewClassify.innerHTML = menus;
};

// make review list
var makeReviewList = function (data) {
	var reviewList = document.getElementById("review-list");
	var list = "";
	data.forEach(
		(item) =>
			(list += `
		<tr data-id="${item.c_id}">
		<td class="tiny-column"><i class="fa fa-star"></i></td>
		<td class="name">${item.c_review_pdservice_name}</td>
		<td class="name">${item.c_review_sender}</td>
		<td class="name">${item.c_review_responder}</td>
		<td>${item.c_review_req_name}</td>
		<td class="date">${item.c_review_result_state}</td>
		<td class="date">${dateFormat(item.c_review_creat_date)}</td>
		</tr>
	`)
	);

	reviewList.innerHTML = list;
};

// --- 사이드 메뉴 -- //
$(function () {
	setSideMenu(
		"sidebar_menu_requirement",
		"sidebar_menu_requirement_review",
		"requirement-elements-collapse"
	);

	getJsonForPrototype("./js/reviewClassify.json", makeClassifyMenus);
	getJsonForPrototype("/auth-user/api/arms/reqReview/getMonitor_Without_Root.do?searchReviewer=admin", makeReviewList);
});

// reviwe click
$("#review-list").click(function (ev) {
	var row = ev.target.parentNode.dataset;
	location.href = `reqReviewDetail.html?id=${row.id}`;
});

// side menu click
$("#review-classify").click(async function (ev) {
	var li = ev.target.parentNode;
	for (var item of ev.currentTarget.children) {
		item.classList.remove("active");
	}

	li.classList.add("active");

	// 서버에서 필터 될 때 사용
	// getJsonForPrototype("./js/reviewList.json", makeReviewList);

	// 분류 예제 코드
	var data = await ajaxGet("./js/reviewList.json");
	var order = Number(li.dataset.order);
	makeReviewList(
		order ? data.filter((item) => item.order === Number(li.dataset.order)) : data
	);
});
