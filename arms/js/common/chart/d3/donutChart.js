// 도넛차트_백업(c3-0.7.20)
function donutChart(pdServiceLink, pdServiceVersionLinks) {
	function donutChartNoData() {
		c3.generate({
			bindto: '#donut-chart', // targetElement
			data: {
				columns: [],
				type: 'donut',
			},
			donut: {
				title: "Total : 0"
			},
		});
	}

	if(pdServiceLink === "" || pdServiceVersionLinks === "") {
		donutChartNoData();
		return;
	}

	const url = new UrlBuilder()
		.setBaseUrl('/auth-user/api/arms/dashboard/aggregation/flat')
		.addQueryParam('pdServiceLink', pdServiceLink)
		.addQueryParam('pdServiceVersionLinks', pdServiceVersionLinks)
		.addQueryParam('메인_그룹_필드', "status.status_name.keyword")
		.addQueryParam('하위_그룹_필드들', "")
		.addQueryParam('크기', 1000)
		.addQueryParam('하위_크기', 1000)
		.addQueryParam('컨텐츠_보기_여부', true)
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
				let 검색결과 = data.검색결과['group_by_status.status_name.keyword'];
				if ((Array.isArray(data) && data.length === 0) ||
					(typeof data === 'object' && Object.keys(data).length === 0) ||
					(typeof data === 'string' && data === "{}")) {
					donutChartNoData();
					return;
				}

				const columnsData = [];

				검색결과.forEach(status => {
					columnsData.push([status.필드명, status.개수]);
				});

				let totalDocCount = data.전체합계;

				const chart = c3.generate({
					bindto: '#donut-chart',
					data: {
						columns: columnsData,
						type: 'donut',
					},
					donut: {
						title: "Total : " + totalDocCount
					},
					color: {
						pattern: ColorPalette.common.reqStateColor
					},
					tooltip: {
						format: {
							value: function (value, ratio, id, index) {
								return value;
							}
						},
					},
				});

				$(document).on('click', '#donut-chart .c3-legend-item', function () {
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

					for (const status of 검색결과) {
						if (status.필드명 === id) {
							docCount = status.개수;
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
					$('#donut-chart .c3-chart-arcs-title').text("Total : " + totalDocCount);
				});
			}
		}
	});
}

/*
* fullDataSheet - 사용. 페이지를 위한 별도 API 분리 가능성 검토.
*/
function drawDonutChart_report(targetElement, data, cardWidth) {
	let $targetElementId =  "#" + targetElement;

	let stateData = data;
	let stateKey = ["open", "in-progress", "resolved", "closed"];

	function donutChartNoData() {
		c3.generate({
			bindto: $targetElementId, // targetElement
			data: {
				columns: [],
				type: 'donut',
			},
			donut: {
				title: "Total : 0"
			},
		});
	}

	if(stateData === undefined || stateData === null || Object.keys(stateData).length === 0) {
		donutChartNoData();
		return false;
	}

	let totalDocCount = stateData.total; // data.전체합계;
	const columnsData = [];
	// data.검색결과['group_by_status.status_name.keyword'];

	stateKey.forEach( key => {
		if(stateData.hasOwnProperty(key)) {
			columnsData.push([key,stateData[key]]);
		}
	});

	let size = {
		width: cardWidth * 0.7,   // 가로 크기
		height: cardWidth * 0.7   // 세로 크기
	}
	console.log(size);
	const chart = c3.generate({
		bindto: $targetElementId,
		data: {
			columns: columnsData,
			type: 'donut'
		},
		donut: {
			title: "Total : " + totalDocCount,
			width: cardWidth * 0.06
		},
		size: size,
		color: {
			pattern: ColorPalette.common.reqStateColor
		},
		tooltip: {
			format: {
				value: function (value, ratio, id, index) {
					return value;
				}
			},
		},
	});

	$(document).on('click', $targetElementId + ' .c3-legend-item', function () {
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

		for (const key of stateKey) {
			if (key === id) {
				docCount = stateData[key];
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
		$($targetElementId+' .c3-chart-arcs-title').text("Total : " + totalDocCount);
	});
}