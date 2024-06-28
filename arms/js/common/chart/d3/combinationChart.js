// 콤비네이션차트_백업(c3-0.7.20)
function combinationChart(pdServiceLink, pdServiceVersionLinks) {
	function combinationChartNoData() {
		c3.generate({
			bindto: '#combination-chart',
			data: {
				x: 'x',
				columns: [],
				type: 'bar',
				types: {},
			},
		});
	}

	if(pdServiceLink === "" || pdServiceVersionLinks === "") {
		combinationChartNoData();
		return;
	}

	const url = new UrlBuilder()
		.setBaseUrl('/auth-user/api/arms/dashboard/requirements-jira-issue-statuses')
		.addQueryParam('pdServiceLink', pdServiceLink)
		.addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
		.addQueryParam('메인_그룹_필드', "pdServiceVersion")
		.addQueryParam('하위_그룹_필드들', "assignee.assignee_accountId.keyword,assignee.assignee_displayName.keyword")
		.addQueryParam('크기', 1000)
		.addQueryParam('하위_크기', 1000)
		.addQueryParam('컨텐츠_보기_여부', false)
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
					bindto: '#combination-chart',
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
						pattern: ColorPalette.d3Chart.combinationChart,
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

				$(document).on('click', '#combination-chart .c3-legend-item', function () {
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