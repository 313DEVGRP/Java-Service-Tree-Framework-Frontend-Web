"use strict";

function addZeroToFront(number) {
	return (number < 10 ? "0" : "") + number;
}

var Timeline = (function () {
	var fn, target, data, viewData, fontWidth, colors;
	fontWidth = 11;



	fn = {
		init: function init(_target, _data) {
			var widgetWidth = $("#version-timeline-bar")[0].offsetWidth;

			// 화면을 그리는데 필요한 기본 데이터
			viewData = {
				startYear: null,
				endYear: null,
				startMonth: null,
				endMonth: null,
				totalStartMonth: null,
				totalEndMonth: null,
				monthLength: 0,
				yearLength: 0,
				maxWidth: widgetWidth - 10,
				width: 30,
				widthForMonth: 30,
				lastWidth: 0,
				lastWidthForMonth: 0,
				currentDate: null,
				lastStart: {
					index: 0,
					year: 0
				},
				allMonthArray: []
			};
			// 컬러 테스트 by 장지윤
			colors = [
				'#f8f4ff',
				'#B15EFF',
				'#FFA33C',
				'#FFFB73'
			];

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
				'<div class="infographic basic"><div data-type="timeline" class="timeline" style="overflow-x:scroll">'.concat(fn.draw(), "</div></div>")
			);
			$(target).html(t.join(""));
		},
		// viewData를 업데이트한다.
		updateViewData: function updateViewData() {
			var v, i, d, titleWidth, yearWidth, yearGap, monthWidth;
			v = viewData;
			for (i = 0; i < data.length; i++) {
				d = data[i];
				if (i === 0 || v.startYear > d.startDate) v.startYear = d.startDate;
				if (i === 0 || v.endYear < d.endDate) v.endYear = d.endDate;
				var startMonthTemp = new Date(d.startDate).getMonth();
				var endMonthTemp = new Date(d.endDate).getMonth();
				if (i === 0 || v.totalStartMonth > startMonthTemp) v.totalStartMonth = startMonthTemp;
				if (i === 0 || v.totalEndMonth < endMonthTemp) v.totalEndMonth = endMonthTemp;
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

			var arrayYear = v.startYear;
			var arrayMonth = 1;
			for (i = 0; i < v.yearLength * 12; i++) {
				v.allMonthArray.push(arrayYear.toString().substring(2) + addZeroToFront(arrayMonth));
				if (arrayMonth == 12) {
					arrayMonth = 1;
					arrayYear++;
				} else {
					arrayMonth = arrayMonth + 1;
				}
			}

			// 월 계산
			var yearToMonth = v.yearLength * 12;
			var tempStartMonth = v.totalStartMonth.toString().substring(2);
			var tempEndMonth = v.totalEndMonth.toString().substring(2);
			var tempMonthLength = tempEndMonth - tempStartMonth;

			v.monthLength = yearToMonth + tempMonthLength + 1;

			data[v.lastStart.index].title = data[v.lastStart.index].title || ""; //title이 없는 항목이 있을 수 있기 때문에 처리

			/********************************************
			 * 년도별 width를 정리하는 코드
			 * *****************************************/
			yearWidth = v.maxWidth / v.yearLength; // 일단 단순하게 나누어서 가로를 구함
			monthWidth = v.maxWidth / v.monthLength;
			titleWidth = data[v.lastStart.index].title.length * fontWidth; // 마지막 항목 글자 개수만큼 가로를 구함
			yearGap =
				Number(D.date(data[v.lastStart.index].endDate, "yyyy")) -
				Number(D.date(data[v.lastStart.index].startDate, "yyyy"));

			// 소숫점이 0.5보다 크면 올려서, 작으면 버려서 년도별 가로를 정한다.
			if (yearWidth - parseInt(yearWidth) > 0.5) {
				v.width = Math.ceil(yearWidth);
			} else {
				v.width = Math.floor(yearWidth);
			}
			if (monthWidth - parseInt(monthWidth) > 0.5) {
				v.widthForMonth = Math.ceil(monthWidth);
			} else {
				v.widthForMonth = Math.floor(monthWidth);
			}

			// 버리거나 올려서 남거나 모자란 픽셀은 마지막 년도에 배정한다.
			v.lastWidth = v.maxWidth - v.width * v.yearLength + v.width;
			v.lastWidthForMonth = v.maxWidth - v.widthForMonth * v.monthLength + v.widthForMonth;
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
				d.color = colors[i % colors.length].concat("c7");

				// 높이 레벨을 정한다
				d.height = (function () {
					if (i === 0) return 10;

					if (d.startDate <= data[i - 1].endDate) {
						return data[i - 1].height + 10;
					} else {
						return data[i - 1].height + 20;
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
				//d.labelHeight = d.height * 2 + 20;
			}
		},
		draw: function draw() {
			var t = [],
				i,
				d,
				v,
				year,
				month;
			v = viewData;

			t.push('<div class="graph" style="width: '.concat(v.maxWidth).concat('px">'));

			for (i = 0; i < data.length; i++) {
				d = data[i];
				t.push(
                    '<div id="'.concat(d.id, '" class="block" style="left:')
                        .concat(d.left, 'px;z-index:')
                        .concat(d.zIndex, ';width:')
                        .concat(d.width, 'px;border-top-width:')
                        .concat(d.height, 'px;border-top-color:')
                        .concat(d.color,  '";>')
                );

				t.push('\t<span class="label" data-toggle="tooltip" data-placement="top" title="'
                  .concat(d.title, ' ')
                  .concat(D.date(d.startDate, "yyyy.MM.dd"), ' ~ ')
                  .concat(D.date(d.endDate, "yyyy.MM.dd"), '" style="height:')
                  .concat(d.labelHeight, 'px;border-left-color:')
                  .concat(d.color, '"><span class="ellipsis">')
                  .concat(d.title, '</span></span>')
                );


                t.push("</div>");

			}
			t.push("</div>");
			t.push('<div class="monthList clearfix" style="width: '.concat(v.maxWidth).concat('px">'));
			month = 1;
			for (i = 0; i < v.yearLength * 12; i++) {
				t.push('<div class="month" style="width:'.concat(v.width / 12, "px;"));
				t.push('">');
				t.push(month);
				t.push("</div>");
				if (month == 12) {
					month = 1;
				} else {
					month = month + 1;
				}
			}
			t.push("</div>");
			t.push('<div class="yearList clearfix" style="width: '.concat(v.maxWidth).concat('px">'));
			for (i = v.startYear; i <= v.endYear; i++) {
				year = "".concat(i.toString().substring(0, 4)); // 앞에 두 자리는 없앤다.
				t.push('<div class="year" style="width:'.concat(i < v.endYear ? v.width : v.width, "px;"));
				// t.push("border-left: 1px solid #ddd;");
				t.push('">');
				t.push(year);
				t.push("</div>");
			}
			t.push("</div>");

			$(".loader").addClass("hide");

			return t.join("");
		}
	};
	return {
		init: fn.init
	};
})();
//# sourceMappingURL=timeline.js.map
