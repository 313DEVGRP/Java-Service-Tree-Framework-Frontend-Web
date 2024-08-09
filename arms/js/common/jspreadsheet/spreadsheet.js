!(function ($) {
	"use strict";

	$.when(
		$.getJavascript("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jsuites.js"),
		$.getJavascript("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/index.js"),
		$.getStylesheet("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jsuites.css"),
		$.getStylesheet("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jspreadsheet.css"),
		$.getStylesheet("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jspreadsheet.theme.css"),
		$.getStylesheet("./css/jspreadsheet/custom_sheet.css"),
		$.getStylesheet("./css/jspreadsheet/custom_icon.css")
	).done(function() {

			$.fn.spreadsheet = function (option) {
				var $this = $(this);
				var spreadsheet = $this.data("arms.spreadsheet");

				if (typeof option === "string") {
					if (!spreadsheet) { return false; }
					return spreadsheet[option]();
				}
				if (!spreadsheet || (typeof option === "object" && option !== null)) {
					var options = $.extend( {}, $.fn.spreadsheet.defaults,
						{
							toolbar: [
								{
									type: "i",
									k: "undo",
									onclick: function () {
										spreadsheet.undo();
									}
								},
								{
									type: "i",
									k: "redo",
									onclick: function () {
										spreadsheet.redo();
									}
								},
								{
									type: "i",
									k: "save",
									onclick: function () {
										spreadsheet.download();
									}
								},
								{
									type: "select",
									k: "font-family",
									v: ["Arial", "Verdana"]
								},
								{
									type: "select",
									k: "font-size",
									v: ["9px", "10px", "11px", "12px", "13px", "14px", "15px", "16px", "17px", "18px", "19px", "20px"]
								},
								{
									type: "i",
									k: "text-align",
									v: "left"
								},
								{
									type: "i",
									k: "text-align",
									v: "center"
								},
								{
									type: "i",
									k: "text-align",
									v: "right"
								},
								{
									type: "i",
									k: "font-weight",
									v: "bold"
								},
								{
									type: "i",
									k: "font-style",
									v: "italic"
								},
								{
									type: "i",
									k: "text-decoration",
									v: "underline"
								},
								{
									type: "i",
									k: "text-decoration",
									v: "line-through"
								},
								{
									type: "color",
									k: "color"
								},
								{
									type: "color",
									k: "background-color"
								},
								{
									type: "i",
									k: "search-box",
									v: []

								}
							]
						},
						option
					);

					$this.data("arms.spreadsheet", (spreadsheet = $this.jspreadsheet(options)));
				}

				return spreadsheet;
			};

			$.fn.spreadsheet.defaults = {
				contextMenu: function(o, x, y, e, items) {
					var items = [];

					// Save
					items.push({
						title: jSuites.translate("Save as"),
						shortcut: "Ctrl + S",
						icon: "save",
						onclick: function () {
							o.download();
						}
					});

					return [];
				},
				search: true,
				pagination: 30,
				tableOverflow: true,
				textOverflow: true,
				tableWidth: "100%",
				onchange: function (instance, cell, x, y, value) {
					console.log(cell);
				},
				onload: function(element) {
					var $jexcel = $(element);
					var $searchInput =
						$('<span style="margin-left: 2px;display: flex;flex-direction: ' +
						'row;align-items: center; font-style: normal; height: 100%; width:100% !important;"><i class="fa fa-search"></i>' +
							' <input class="jexcel_search" placeholder="시트에서 검색" style="margin-left: 5px;background-color: transparent;border: none; width: 100%; color: #FFF">' +
							'</span>');
					$jexcel.find(".jexcel_toolbar_item[data-k='undo']").addClass("fa fa-mail-reply ");
					$jexcel.find(".jexcel_toolbar_item[data-k='redo']").addClass("fa fa-mail-forward ");
					$jexcel.find(".jexcel_toolbar_item[data-k='save']").addClass("fa fa-save");
					$jexcel.find(".jexcel_toolbar_item[data-k='text-align'][data-v='left']").addClass("fa fa-align-left fa-flip-vertical");
					$jexcel.find(".jexcel_toolbar_item[data-k='text-align'][data-v='center']").addClass("fa fa-align-center fa-flip-vertical");
					$jexcel.find(".jexcel_toolbar_item[data-k='text-align'][data-v='right']").addClass("fa fa-align-right fa-flip-vertical");
					$jexcel.find(".jexcel_toolbar_item[data-k='font-weight'][data-v='bold']").addClass("fa fa-bold");
					$jexcel.find(".jexcel_toolbar_item[data-k='font-style'][data-v='italic']").addClass("fa fa-italic");
					$jexcel.find(".jexcel_toolbar_item[data-k='text-decoration'][data-v='underline']").addClass("fa fa-underline");
					$jexcel.find(".jexcel_toolbar_item[data-k='text-decoration'][data-v='line-through']").addClass("fa fa-strikethrough");
					$jexcel.find(".jexcel_toolbar_item[data-k='color']").addClass("fa fa-font");
					$jexcel.find(".jexcel_toolbar_item[data-k='background-color']").addClass("fa fa-font fa-background");
					$jexcel.find(".jexcel_filter").addClass("hidden");
					$jexcel.find(".jexcel_toolbar_item[data-k='search-box']").addClass("search-box").append($searchInput);

					// 검색 input 에 focus 일때, 선택 초기화
					var $inputField = $searchInput.find('input.jexcel_search');
					if ($inputField.length) {
						$inputField.on('focus', function() {
							if (element.jexcel) {
								element.jexcel.resetSelection();
							}
						});
					}
				}
			};

	});
})(jQuery);