"use strict";

var Timeline = (function () {
	var fn, target, data, viewData, fontWidth, colors;
	fontWidth = 11;

	// 화면을 그리는데 필요한 기본 데이터
	viewData = {
		startYear: null,
		endYear: null,
		yearLength: 0,
		maxWidth: 1080,
		width: 0,
		lastWidth: 0,
		lastStart: {
			index: 0,
			year: 0
		}
	};

	colors = [
		"#4E79A7",
		"#F18E2C",
		"#E15759",
		"#76B6B2",
		"#58A14E",
		"#EDC849",
		"#AF7AA1",
		"#FE9DA6",
		"#9C755E",
		"#BAAFAB"
	];

	fn = {
		init: function init(_target, _data) {
			var t = [];
			if (!_target) throw new Error("타임라인을 그릴 타겟을 입력하세요.");

			target = _target;
			data = _data;

			if (!data || data.length === 0) return; // 데이터가 전혀 없는 경우

			data = data.sort(function (a, b) {
				return new Date(a.startDate) - new Date(b.startDate) + (new Date(a.endDate) - new Date(b.endDate));
			});

			// 데이터 정리
			fn.updateViewData();
			fn.updateRealData();

			// 템플릿 생성 후 바로 삽입
			t.push(
				'<div class="infographic basic"><div data-type="timeline" class="timeline">'.concat(fn.draw(), "</div></div>")
			);
			$(target).html(t.join(""));
		},
		// viewData를 업데이트한다.
		updateViewData: function updateViewData() {
			var v, i, d, titleWidth, yearWidth, yearGap;
			v = viewData;
			for (i = 0; i < data.length; i++) {
				d = data[i];
				if (i === 0 || v.startYear > d.startDate) v.startYear = d.startDate;
				if (i === 0 || v.endYear < d.endDate) v.endYear = d.endDate;
				if (i === 0 || v.lastStart.year < d.startDate) {
					v.lastStart.index = i;
					v.lastStart.year = d.startDate;
				}
			}

			/********************************************
			 * 출력할 년도를 정리하는 코드
			 * *****************************************/
			v.startYear = Number(D.date(v.startYear, "yyyy")); // 데이터상의 시작년도
			v.endYear = Number(D.date(v.endYear, "yyyy")); // 데이터상의 마지막년도
			v.lastStart.year = Number(D.date(v.lastStart.year, "yyyy")); // 마지막 항목이 시작하는 연도

			v.yearLength = v.endYear - v.startYear + 1; // 해당 년도까지 포함하기 때문에 1을 더함

			data[v.lastStart.index].title = data[v.lastStart.index].title || ""; //title이 없는 항목이 있을 수 있기 때문에 처리

			/********************************************
			 * 년도별 width를 정리하는 코드
			 * *****************************************/
			yearWidth = v.maxWidth / v.yearLength; // 일단 단순하게 나누어서 가로를 구함
			titleWidth = data[v.lastStart.index].title.length * fontWidth; // 마지막 항목 글자 개수만큼 가로를 구함
			yearGap =
				Number(D.date(data[v.lastStart.index].endDate, "yyyy")) -
				Number(D.date(data[v.lastStart.index].startDate, "yyyy"));
			if (titleWidth > yearGap * yearWidth) {
				// 마지막 타이틀이 해당년도 길이보다 짧으면 년도를 1년 추가한다
				v.endYear++;
				v.yearLength++;
				yearWidth = v.maxWidth / v.yearLength;
			}

			// 소숫점이 0.5보다 크면 올려서, 작으면 버려서 년도별 가로를 정한다.
			if (yearWidth - parseInt(yearWidth) > 0.5) v.width = Math.ceil(yearWidth);
			else v.width = Math.floor(yearWidth);

			// 버리거나 올려서 남거나 모자란 픽셀은 마지막 년도에 배정한다.
			v.lastWidth = v.maxWidth - v.width * v.yearLength + v.width;
		},
		// 실제로 뿌릴 데이터를 정리하는 함수
		updateRealData: function updateRealData() {
			var v, i, d, startYear, endYear, startMonth, endMonth, fullYear;
			v = viewData;

			for (i = 0; i < data.length; i++) {
				d = data[i];

				startYear = Number(D.date(d.startDate, "yyyy"));
				endYear = Number(D.date(d.endDate, "yyyy"));
				startMonth = Number(D.date(d.startDate, "MM"));
				endMonth = Number(D.date(d.endDate, "MM"));
				fullYear = endYear - startYear > 1 ? endYear - startYear - 1 : 0; // 1월부터 12월까지 꽉찬 해가 몇 해인지 산출

				// 가로 위치를 구한다.
				d.left = (function () {
					var left = 0;
					left += (startYear - v.startYear) * v.width;
					left += (startMonth - 1) * (v.width / 12);
					return left + 1; // 투명때문에 라벨 막대가 겹치면 선이 있는 것처럼 보여서 1픽셀 옮김
				})();

				// 실제 길이를 구한다.
				d.width = (function () {
					var width = 0;

					if (startYear === endYear) {
						// 시작과 마감해가 같다면
						width += (endMonth - startMonth + 1) * (v.width / 12); // 시작년도 월계산
					} else {
						width += (12 - startMonth + 1) * (v.width / 12); // 시작년도 월계산
						width += fullYear * v.width; // 중간년도 년계산
						width += endMonth * (v.width / 12); // 종료년도 월계산
					}

					return width - 1; // 투명때문에 라벨 막대가 겹치면 선이 있는 것처럼 보여서 1픽셀 옮김
				})();

				// 색상을 정한다
				d.color = colors[i % colors.length].concat("80");

				// 높이 레벨을 정한다
				d.height = (function () {
					if (i === 0) return 20;

					if (d.startDate <= data[i - 1].endDate) {
						return data[i - 1].height + 10;
					}

					return 20;
				})();

				// 타임라인 z-index
				d.zIndex = (function () {
					if (i === 0) return 9999;

					if (d.startDate <= data[i - 1].endDate) {
						return data[i - 1].zIndex - 1;
					}

					return 9999;
				})();

				// 라벨 높이 레벨을 정한다
				d.labelHeight = d.height * 2 + 20;
			}
		},
		draw: function draw() {
			var t = [],
				i,
				d,
				v,
				year;
			v = viewData;
			t.push('<div class="graph">');
			for (i = 0; i < data.length; i++) {
				d = data[i];
				t.push(
					'<div class="block" style="left:'
						.concat(d.left, "px;z-index:")
						.concat(d.zIndex, ";width:")
						.concat(d.width, "px;border-top-width:")
						.concat(d.height, "px;border-top-color:")
						.concat(d.color, ';" title="')
						.concat(d.title, ", ")
						.concat(D.date(d.startDate, "yyyy.MM"), " ~ ")
						.concat(D.date(d.endDate, "yyyy.MM"), '">')
				);
				t.push(
					'\t<span class="label" style="height:'
						.concat(d.labelHeight, "px;border-left-color:")
						.concat(d.color, '"><span class="ellipsis">')
						.concat(d.title, "</span></span>")
				);
				t.push("</div>");
			}
			t.push("</div>");
			t.push('<div class="yearList clearfix">');
			for (i = v.startYear; i <= v.endYear; i++) {
				year = "'".concat(i.toString().substring(2, 4)); // 앞에 두 자리는 없앤다.
				t.push('<div class="year" style="width:'.concat(i < v.endYear ? v.width : v.lastWidth, 'px">'));
				t.push(year);
				t.push("</div>");
			}
			t.push("</div>");
			return t.join("");
		}
	};
	return {
		init: fn.init
	};
})();
//# sourceMappingURL=timeline.js.map
