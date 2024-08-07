var ModalTabFunction = (function(){
	"use strict";

	// Modal Chart / Modal Exce의 Tab 메뉴별 동작 설정

	let $tabFunction_data;   // 엑셀 데이터
	let $tabFunction_columns;// 엑셀 컬럼
	let $tabFunction_options;// 엑셀 (커스텀)옵션 :: 정의 안할 경우 default
	// 엑셀 데이터 높이 고정을 위한, 계산
	let chart_height = $("#chart_data").height();
	let chart_width = $("#chart_data").width();
	let jexcel_content_height;
	console.log("tabFunction :: chart_height");
	console.log(chart_height);

	var setExcelData = function(data) {
		$tabFunction_data = data;
	}
	var getExcelData = function () {
		return $tabFunction_data;
	}
	var setColumns = function(columns) {
		$tabFunction_columns = columns;
	}
	var getColumns = function () {
		return $tabFunction_columns;
	}
	var setOptions = function(options) {
		$tabFunction_options = options;
	}
	var getOptions = function() {
		return $tabFunction_options ? $tabFunction_options : null;
	}

	var setColumnWidth = function (width) {
		console.log("setColumnWidth");
		$tabFunction_columns = $tabFunction_columns.map(column => ({
			...column, width: width * column.wRatio
		}));
	}

	// chart_height 고정
	if(chart_height) {
		console.log("엑셀 데이터 높이 고정");
		$('#excel_data').height(chart_height);
		console.log("엑셀 높이 =>" + $("#chart_data").height());
	}

	// TAB Click 시
	$('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
		var target = $(e.target).attr("href"); // activated tab

		if(target === "#chart_data") {
			let tarId = "modal_chart";

			if (selectedVersionId) {
				$("#modal_chart").html("");
				//drawProductToManSankeyChart(selectedPdServiceId, selectedVersionId, tarId, 10000);
			} else {
				console.log("서비스 및 버전 선택이 안되어있습니다.");
				$("#modal_chart").html(`<span style="margin: auto">
					※ Notification ※
					<br/>
					전체 데이터 렌더링 영역 입니다.
					<br/>
					이 영역의 화면(차트 등)을 개발 진행 중입니다.
					<br/>
					<br/>
					첫번째 탭은 전체 데이터를 활용한 차트 렌더링 영역입니다.
					<br/>
					두번째 탭은 전체 데이터를 엑셀 형태로 제공하고 있습니다.
					</span>`);
				//jError("서비스 및 버전을 설정 후 선택해주세요.");
			}
		}
		else if (target === "#excel_data") {
			console.log("excel_data");
			console.log(chart_width);
			let tarId = "modal_excel";
			drawExcel(tarId);
		}
		else if (target === "#option_toggle") {
			$(".option_tab").removeClass("active");
			e.preventDefault();
			if ($(".fullscreen-body-main").hasClass("col-lg-12")) {
				$(".fullscreen-body-main").removeClass("col-lg-12").addClass("col-lg-9");
				$(".fullscreen-body-option").removeClass("hidden");
			} else {
				$(".fullscreen-body-main").removeClass("col-lg-9").addClass("col-lg-12");
				$(".fullscreen-body-option").addClass("hidden");
			}

		}
	});

	var resizeObserver = new ResizeObserver(function(entries) {
		for (let entry of entries) {
			var width = entry.contentRect.width;
			var height = entry.contentRect.height;
			handleResize(entry.target.id, width, height);
		}
	});

	// 모달요소 크리 변화 관찰
	resizeObserver.observe(document.getElementById('chart_data'));
	resizeObserver.observe(document.getElementById('excel_data'));

	function handleResize(id,width, height) {
		console.log('id: '+ id +' Modal resized to: ' + width + 'x' + height);
		if (id ==="excel_data" && height !== 0) {
			chart_height = height;
			chart_width = width;
			if(chart_height > 70) {
				drawExcel("modal_excel");
			} else {
				console.log("엑셀 데이터를 그릴 영역의 넓이가 너무 작습니다.");
			}
		} else if (id ==="chart_data" && height !== 0) {
			chart_height = height;
			chart_width = width;
		}
	}

	function drawExcel(targetId) {
		let $targetId = "#"+targetId;
		
		if($($targetId)[0].jexcel) {
			$($targetId)[0].jexcel.destroy();
		}

		setColumnWidth(chart_width-50); // ∵ 열 번호(jexcel_row) 때문에

		$($targetId).spreadsheet($.extend({}, {
			columns: getColumns(),
			data: getExcelData()
		}, getOptions()));

		jexcel_content_height = chart_height -40-30-35-34; // 도구모음(34), row번호(50)
		console.log("chart_height=> " + chart_height);
		console.log("jexcel_content_height=> "+ jexcel_content_height);
		$("#modal_excel .jexcel_content").css("max-height",jexcel_content_height);
		$("#modal_excel .jexcel_content").css("width","100%");
	}

	function excelEventListener() {
		// Theme 변경
		$("#toggle-excel-theme").on("click", function() {
			if($(".jexcel_container").hasClass("dark-theme")) {
				$(".jexcel_container").removeClass("dark-theme");
			} else {
				$(".jexcel_container").addClass("dark-theme");
			}
		});
	}
	return {
		setExcelData, getExcelData,
		setColumns, getColumns,
		setOptions, getOptions,
		drawExcel
	}
})(jQuery);