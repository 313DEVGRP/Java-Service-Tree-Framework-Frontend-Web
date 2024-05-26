var DashboardApi = (function () {
	"use strict";

	var dashboard_pdServiceId;
	var dashboard_pdServiceVersionLinks;

	// 버전정보 - gauge, timeLine
	var version_info = [];

	// MySQL - 요구사항(DB)의 상태
	var req_state_data = {
		"total" : 0,    // 총합
		"folder" : 0,   // 폴더타입
		"not-open" : 0, // 열림 제외(진행중, 해결됨, 닫힘)
		"resolved-and-closed" : 0, // 해결됨+닫힘
		"open" : 0,        // 열림
		"in-progress" : 0, // 진행중
		"resolved" : 0,    // 해결됨
		"closed" : 0       // 닫힘
	};

	// 요구사항등록으로 생성된 요구사항 이슈 (req)
	// 생성된 요구사항이슈에 연결한 연결이슈 또는 생성한 하위이슈(subtask)
	var issue = {
		"total": null,
		"req" : null,
		"subtask" : null
	};


	var resource = {
		"resource" : 0,   // 총 작업자수
		"req_total" : 0,  // 요구사항 이슈 총수
		"sub_total" : 0,  // 하위작업 이슈 총수
		"req_max" : null, // 1명이 맡은 가장 많은 요구사항 이슈 수
		"req_avg" : null, // 평균 맡고 있는 요구사항 이슈 ( req_total / resource)
		"req_min" : null, // 1명이 맡은 가장 적은 요구사항 이슈 수
		"sub_max" : null, // 1명이 가장 많은 하위작업 이슈를 갖는 정도
		"sub_avg" : null, // 평균 맡고 있는 하위작업 이슈 ( sub_total / resource)
		"sub_min" : null  // 1명이 맡은 가장 적은 하위작업 이슈 수
	};

	var setVersionInfo = function (result) {
		version_info = result;
	}

	var getVersionInfo = function () {
		return version_info;
	}

	var versionPeriod = function (pdServiceVersionLinks) {
		return new Promise((resolve, reject) => {
			if(pdServiceVersionLinks && pdServiceVersionLinks.length > 0) {
				$.ajax({
					url: "/auth-user/api/arms/pdServiceVersion/getVersionListBy.do",
					data: {c_ids: pdServiceVersionLinks},
					type: "GET",
					contentType: "application/json;charset=UTF-8",
					dataType: "json",
					progress: true,
					async:false,
					statusCode: {
						200: function (result) {
							console.log("[ dashboardApi :: versionPeriod ] :: result");
							console.log(result);
							setVersionInfo(result); // 버전 정보 세팅 -> 게이지 & 타임라인 차트 이용위해.
							checkTimeStatus(result); // 일정 현황
							resolve();
						}
					}
				});
			}
		});
	};

	// 타임일정 세팅
	function checkTimeStatus (version_infos) {
			const currentDate = new Date();
			if(version_infos && version_infos.length !== 0) {
				timeStatusInit();
				timeStatus["total_version"] = version_infos.length;
				version_infos.forEach(version => {
					const startDate = version.c_pds_version_start_date === "start" ? "start" : new Date(version.c_pds_version_start_date);
					const endDate = version.c_pds_version_end_date === "end" ? "end" : new Date(version.c_pds_version_end_date);
					if (startDate === "start" || endDate === "end") {
						timeStatus["unknown_version"]++;
					} else if (isDateInRange(currentDate, startDate, endDate)) {
						timeStatus["current_version"]++;
					} else if (currentDate > endDate) {
						timeStatus["past_version"]++;
					} else if (currentDate < startDate) {
						timeStatus["upcoming_version"]++;
					}
				});
			} else {
				console.log("[ dashboardApi :: checkTimeStatus ] :: 버전 정보가 없거나 유효하지 않습니다.");
			}
	}

	function isDateInRange(date, start, end) {
		return date >= start && date <= end;
	}

	let timeStatus = {
			"total_version" : 0,
			"past_version" : 0,
			"current_version" : 0,
		  "upcoming_version": 0,
		  "unknown_version" : 0 // 일정 정보가 날짜가 아님("start" ,"end" 일 경우.)
	};

	function timeStatusInit() {
		timeStatus["total_version"] = 0;
		timeStatus["past_version"] = 0;
		timeStatus["current_version"] = 0;
		timeStatus["current_version"] = 0;
		timeStatus["upcoming_version"] = 0;
	}

	var getTimeStatus = function () {
		return timeStatus;
	}

	//////////////////////////////////
	// 요구사항(DB)의 상태 - Application
	//////////////////////////////////
	var setReqStateData = function (result) {
		req_state_data["total"] = (result["total"] ? result["total"] : 0);
		req_state_data["folder"] = (result["folder"] ? result["folder"] : 0);
		req_state_data["open"] = (result["open"] ? result["open"] : 0);
		req_state_data["in-progress"] = (result["in-progress"]  ? result["in-progress"] : 0);
		req_state_data["resolved"] = (result["resolved"] ? result["resolved"] : 0);
		req_state_data["closed"] = (result["closed"] ? result["closed"] : 0);
		req_state_data["not-open"] = result["total"] - req_state_data["open"];
		req_state_data["resolved-and-closed"] = req_state_data["resolved"] + req_state_data["closed"];
	};

	var getReqStateData = function () {
		return req_state_data;
	};

	//요구사항 진척도
	var getReqProgress = function () {
		let state_data = getReqStateData();
		if (state_data["total"] !== 0 && !isNaN(state_data["total"])) {
			return (( state_data["resolved-and-closed"] / state_data["total"] ) * 100 ).toFixed(1);
		} else {
			return "0";
		}
	};
	
	var reqStateData = function (pdService_id, pdServiceVersionLinks) {
		return new Promise((resolve, reject) => {
			let reqAddUrl = "/T_ARMS_REQADD_"+ pdService_id +"/getReqAddListByFilter.do?";

			$.ajax({
				url: "/auth-user/api/arms/analysis/top-menu" +reqAddUrl,
				type: "GET",
				data: {	pdServiceId: pdService_id, pdServiceVersionLinks: pdServiceVersionLinks },
				contentType: "application/json;charset=UTF-8",
				dataType: "json",
				progress: true,
				async:false,
				statusCode: {
					200: function (result) {
						console.log("[ DashboardApi :: reqStateData ] :: result");
						console.log(result);
						setReqStateData(result);
						resolve();
					}
				}
			});
		});
	};

	///////////////////////////////////////
	// 요구사항 및 연결&하위 이슈 - Application
	///////////////////////////////////////
	var reqAndSubtaskIssue = function (pdService_id, pdServiceVersionLinks) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: "/auth-user/api/arms/analysis/top-menu/issue/reqAndSubtask/" + pdService_id,
				type: "GET",
				data: { pdServiceVersionLinks: pdServiceVersionLinks },
				contentType: "application/json;charset=UTF-8",
				dataType: "json",
				progress: true,
				async:false,
				statusCode: {
					200: function(result) {
						console.log("[ DashboardApi :: reqAndSubtaskIssue ] :: result");
						console.log(result);
						setReqAndSubtaskIssue(result);
						resolve();
					}
				}
			});
		});
	};
	var setReqAndSubtaskIssue = function (result) {
		issue["total"] = (result["total"] !== null ? result["total"] : 0);
		issue["req"] = (result["req"] !== null ? result["req"] : 0);
		issue["subtask"] = (result["subtask"] !== null ? result["subtask"] : 0);
	};

	var getReqAndSubtaskIssue = function () {
		return issue;
	};

	var resourceInfo = function (pdservice_id, pdServiceVersionLinks) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: "/auth-user/api/arms/analysis/top-menu/resourceInfo/" + pdservice_id,
				type: "GET",
				data: { pdServiceVersionLinks: pdServiceVersionLinks },
				contentType: "application/json;charset=UTF-8",
				dataType: "json",
				progress: true,
				async:false,
				statusCode: {
					200: function(result) {
						console.log("[ DashboardApi :: resourceInfo ] :: result");
						console.log(result);
						setResourceInfo(result);
						resolve();
					}
				}
			});
		});
	};

	var setResourceInfo = function (result) {
		resource["resource"] = result["resource"];
		resource["req_total"] = result["req"];
		resource["sub_total"] = result["subtask"];
		resource["req_max"] = result["req_max"];
		resource["req_avg"] = (result["resource"] !== 0 ? (result["req"] / result["resource"]).toFixed(1) : " - ");
		resource["req_min"] = result["req_min"];
		resource["sub_max"] = result["sub_max"];
		resource["sub_avg"] = (result["resource"] !== 0 ? (result["subtask"] / result["resource"]).toFixed(1) : " - ");
		resource["sub_min"] = result["sub_min"];
	};

	var getResourceInfo = function() {
		return resource;
	};

	var pullTotalApi = function (pdService_id, pdServiceVersionLinks) {
		return versionPeriod(pdServiceVersionLinks)
			.then(() => {
				return reqStateData(pdService_id, pdServiceVersionLinks);
			})
			.then(() => {
				return reqAndSubtaskIssue(pdService_id, pdServiceVersionLinks);
			})
			.then(() => {
				return resourceInfo(pdService_id, pdServiceVersionLinks);
			});
	};

	function 대시보드_톱메뉴_세팅(pdService_id, pdServiceVersionLinks) {
		dashboard_pdServiceId = pdService_id;
		dashboard_pdServiceVersionLinks = pdServiceVersionLinks;

		DashboardApi.pullTotalApi(dashboard_pdServiceId, dashboard_pdServiceVersionLinks)
			.then(() => {
				req_state = DashboardApi.getReqStateData();
				timeStatus_info = DashboardApi.getTimeStatus();
				issue_info = DashboardApi.getReqAndSubtaskIssue();
				resource_info = DashboardApi.getResourceInfo();
				// 일정 현황
				$("#total_version").text(timeStatus_info["total_version"]);
				$("#past_version").text(timeStatus_info["past_version"]);
				$("#current_version").text(timeStatus_info["current_version"]);
				$("#upcoming_version").text(timeStatus_info["upcoming_version"]);
				if(timeStatus_info["unknown_version"] > 0) { // 보여줄 방법 세팅해야함.
					$("#unknown_version").text(timeStatus_info["unknown_version"]); // 일정이 정해지지 않은 버전 수
				}
				// 범위 현황
				$("#total_req_count").text((req_state["total"]));
				let progress_per = DashboardApi.getReqProgress() +"%";
				$("#req_progress").text(progress_per); // 진척도
				$("#req_progress_bar").text(progress_per);
				$("#req_progress_bar").css("width",progress_per);
				$("#req_completed").text(req_state["resolved-and-closed"]);
				$("#req_total2").text("("+req_state["total"]+")");

				$("#total_req_issue_count").text(issue_info["req"]);  // 생성된 요구사항 이슈
				$("#no_assigned_req_issue_count").text(issue_info["req"]-resource_info["req_total"]); // 생성된 요구사항 이슈(미할당)
				$("#total_linkedIssue_subtask_count").text(issue_info["subtask"]); //생성한 연결이슈
				$("#no_assigned_linkedIssue_subtask_count").text(issue_info["subtask"]-resource_info["sub_total"]); //생성한 연결이슈(미할당)

				// 자원 현황
				$("#resource_count").text(resource_info["resource"]); //작업자수
				if (resource_info["resource"] === 0 || isNaN(resource_info["resource"])) {
					$("#avg_req_count").text(" - ");
				} else {
					$("#avg_req_count").text((req_state["total"]/resource_info["resource"]).toFixed(1)); // 인원별 평균 요구사항 수
				}

			})
			.then(() => {
				대시보드_도넛차트("donut-chart");
				대시보드_콤비네이션차트("combination-chart");
			})
			.catch((error) => {
			console.error('Error occurred:', error);
		});

	} //.대시보드_톱메뉴_세팅

	function 대시보드_톱메뉴_초기화() {
		//일정 현황
		$("#total_version").text(" - ");
		$("#past_version").text(" - ");
		$("#current_version").text(" - ");
		$("#upcoming_version").text(" - ");
		$("#unknown_version").text(" - ");
		//범위 현황
		$("#total_req_count").text(" - ");
		$("#req_progress").text(""); // 진척도
		$("#req_progress_bar").text("");
		$("#req_progress_bar").css("width","0%");
		$("#req_completed").text(" - "); // 완료된_요구사항(resolved+closed)
		$("#req_total2").text("");
		//자원 현황
		$("#total_req_issue_count").text(" - ");  // 생성된 요구사항 이슈
		$("#no_assigned_req_issue_count").text(" - "); // 생성된 요구사항 이슈(미할당)
		$("#total_linkedIssue_subtask_count").text(" - "); //생성한 연결이슈
		$("#no_assigned_linkedIssue_subtask_count").text(" - "); //생성한 연결이슈(미할당)
	}

	function 대시보드_변수_초기화() {
		// 선언 예정
	}
	function 대시보드_도넛차트(targetElementId) {
		if(!targetElementId) {
			donutChartNoData();
			return false;
		}
		let $targetId = "#"+targetElementId; // "#donut-chart"

		let reqStateData = getReqStateData();
		let reqStateKey = ["open", "in-progress", "resolved", "closed"];

		console.log("[ dashboardApi :: 대시보드_도넛차트 ] total => " + reqStateData["total"]);

		function donutChartNoData() {
			c3.generate({
				bindto: $targetId,
				data: {
					columns: [],
					type: 'donut',
				},
				donut: {
					title: "Total : 0"
				},
			});
		}

		if(reqStateData.total === 0) {
			donutChartNoData();
			return;
		}

		const columnsData = [];

		reqStateKey.forEach( key => {
			if(reqStateData.hasOwnProperty(key)) {
				columnsData.push([key,reqStateData[key]]);
			}
		});

		let totalDocCount = reqStateData["total"];

		const chart = c3.generate({
			bindto: $targetId,
			data: {
				columns: columnsData,
				type: 'donut',
			},
			donut: {
				title: "Total : " + totalDocCount
			},
			color: {
				pattern: dashboardColor.reqStateColor
			},
			tooltip: {
				format: {
					value: function (value, ratio, id, index) {
						return value;
					}
				},
			},
		});

		$(document).on('click', $targetId +' .c3-legend-item', function () {
			const id = $(this).text();
			let isHidden = false;

			if($(this).hasClass('c3-legend-item-hidden')) {
				isHidden = false;
				$(this).removeClass('c3-legend-item-hidden');
			} else {
				isHidden = true;
				$(this).addClass('c3-legend-item-hidden');
			}
			let docCount = 0;

			for (const key of reqStateKey) {
				if (key === id) {
					docCount = reqStateData[key];
					break;
				}
			}
			if (docCount) {
				if (isHidden) {
					totalDocCount -= docCount;
				} else {
					totalDocCount += docCount;
				}
			}
			$($targetId +' .c3-chart-arcs-title').text("Total : " + totalDocCount);
		});
	}

	function 대시보드_콤비네이션차트(targetElementId) {
		let $targetId = "#"+targetElementId; // "#combination-chart"


		function combinationChartNoData() {
			c3.generate({
				bindto: $targetId,
				data: {
					x: 'x',
					columns: [],
					type: 'bar',
					types: {},
				},
			});
		}

		if(!targetElementId) {
			combinationChartNoData();
			return false;
		}

		if(dashboard_pdServiceId === "" || dashboard_pdServiceVersionLinks === "") {
			combinationChartNoData();
			return false;
		}

		const url = new UrlBuilder()
			.setBaseUrl('/auth-user/api/arms/dashboard/requirements-jira-issue-statuses')
			.addQueryParam('pdServiceLink', dashboard_pdServiceId)
			.addQueryParam('pdServiceVersionLinks', dashboard_pdServiceVersionLinks)
			.addQueryParam('메인그룹필드', "pdServiceVersion")
			.addQueryParam('하위그룹필드들', "assignee.assignee_accountId.keyword,assignee.assignee_displayName.keyword")
			.addQueryParam('크기', 1000)
			.addQueryParam('하위크기', 1000)
			.addQueryParam('컨텐츠보기여부', false)
			.build();

		$.ajax({
			url: url,
			type: "GET",
			contentType: "application/json;charset=UTF-8",
			dataType: "json",
			progress: true,
			statusCode: {
				200: function (apiResponse) {
					const data = apiResponse.response;
					if ((Array.isArray(data) && data.length === 0) ||
						(typeof data === 'object' && Object.keys(data).length === 0) ||
						(typeof data === 'string' && data === "{}")) {
						combinationChartNoData();
						return;
					}

					const issueStatusTypesSet = new Set();
					for (const month in data) {
						for (const status in data[month].statuses) {
							issueStatusTypesSet.add(status);
						}
					}
					const issueStatusTypes = [...issueStatusTypesSet];

					let columnsData = [];

					issueStatusTypes.forEach((status) => {
						const columnData = [status];
						for (const month in data) {
							const count = data[month].statuses[status] || 0;
							columnData.push(count);
						}
						columnsData.push(columnData);
					});

					const requirementCounts = ['요구사항'];
					for (const month in data) {
						requirementCounts.push(data[month].totalRequirements);
					}
					columnsData.push(requirementCounts);

					let monthlyTotals = {};

					for (const month in data) {
						monthlyTotals[month] = data[month].totalIssues + data[month].totalRequirements;
					}


					const chart = c3.generate({
						bindto: $targetId,
						data: {
							x: 'x',
							columns: [
								['x', ...Object.keys(data)],
								...columnsData,
							],
							type: 'bar',
							types: {
								'요구사항': 'area',
							},
							groups: [issueStatusTypes]
						},
						color: {
							pattern: dashboardColor.combinationChartColor,
						},
						onrendered: function() {
							d3.selectAll('.c3-line, .c3-bar, .c3-arc')
								.style('stroke', 'white')
								.style('stroke-width', '0.3px');
						},
						axis: {
							x: {
								type: 'category',
							},
						},
						tooltip: {
							format: {
								title: function (index) {
									const month = Object.keys(data)[index];
									const total = monthlyTotals[month];
									return `${month} | Total : ${total}`;
								},
							},
						}
					});

					$(document).on('click', $targetId+' .c3-legend-item', function () {
						let id = this.__data__;
						let isHidden = false;

						if($(this).hasClass('c3-legend-item-hidden')) {
							isHidden = false;
							$(this).removeClass('c3-legend-item-hidden');
						} else {
							isHidden = true;
							$(this).addClass('c3-legend-item-hidden');
						}

						let docCount = 0;

						for (const month in data) {
							if (data[month].statuses.hasOwnProperty(id)) {
								docCount = data[month].statuses[id];
							} else if (id === '요구사항') {
								docCount = data[month].totalRequirements;
							}
						}

						// 월별 통계 값 업데이트
						for (const month in data) {
							if (isHidden) {
								monthlyTotals[month] -= docCount;
							} else {
								monthlyTotals[month] += docCount;
							}
						}
					});
				}
			}
		});

	}

	return {
		대시보드_톱메뉴_세팅, 대시보드_톱메뉴_초기화,
		pullTotalApi,
		versionPeriod, getVersionInfo, getTimeStatus,  // 버전정보
		reqStateData, getReqStateData, // 요구사항 상태
		reqAndSubtaskIssue, getReqAndSubtaskIssue, // 요구사항 이슈, 연결이슈
		resourceInfo, getResourceInfo, // 작업자 수
		getReqProgress, // 진척도
	}
})(); //즉시실행 함수