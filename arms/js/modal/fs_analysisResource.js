(function(){
	$('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
		var target = $(e.target).attr("href"); // activated tab

		if(target === "#chart_data") {
			let tarId = "modal_chart";
			if (selectedVersionId) {
				drawProductToManSankeyChart(selectedPdServiceId, selectedVersionId, tarId, 10000);
			} else {
				jError("서비스 및 버전을 설정 후 선택해주세요.");
			}
		} else if (target === "#excel_data") {
			console.log("excel_data");
			// $("#btn_modal_excel").click();
			let tarId = "modal_excel";
			JspreadsheetApi.getSheetData();
			JspreadsheetApi.sheetRender(tarId);

		} else if (target === "#option_toggle") {
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

	$("#fullscreen_modal_close").on("click", function() {
		$(".fullscreen-header>.widget-controls>a[data-widgster='restore']").click();
	});
})(); // 이벤트 리스너 등록 및 즉시실행.