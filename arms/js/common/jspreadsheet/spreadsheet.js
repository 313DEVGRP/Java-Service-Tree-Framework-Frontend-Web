!(function ($) {
	"use strict";

	$.when(
		$.getJavascript("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jsuites.js"),
		$.getJavascript("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/index.js"),
		$.getStylesheet("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jsuites.css"),
		$.getStylesheet("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jspreadsheet.css"),
		$.getStylesheet("../reference/jquery-plugins/jspreadsheet-ce-4.13.1/dist/jspreadsheet.theme.css"),
		$.getStylesheet("./css/jspreadsheet/custom_sheet.css")
	).done(function() {
			var Spreadsheet = function (element, options) {
				$.fn.jspreadsheet.call(element, options);
			};

			Spreadsheet.prototype = Object.create(window.jspreadsheet);
			Spreadsheet.prototype.constructor = Spreadsheet;
			//$("#hsh").show(); 에서 $.fn.show(); 와 동일하다.
			$.fn.spreadsheet = function (option) {
				var $this = $(this);
				var spreadsheet = $this.data("arms.spreadsheet"); // 검토
				var getSpreadsheet = function() {
					return spreadsheet;
				};

				if (typeof option === "string") {
					if (!spreadsheet) return false;
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
										getSpreadsheet().undo();
									}
								},
								{
									type: "i",
									k: "redo",
									onclick: function () {
										getSpreadsheet().redo();
									}
								},
								{
									type: "i",
									k: "save",
									onclick: function () {
										getSpreadsheet().download();
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
									type: "color",
									k: "color"
								},
								{
									type: "color",
									k: "background-color"
								}
							]
						},
						option
					);

					$this.data("arms.spreadsheet", (spreadsheet = new Spreadsheet(this, options)));
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

					return items;
				},
				search: true,
				pagination: 30,
				tableOverflow: true,
				textOverflow: true,
				tableWidth: "100%",
				onload: function(element) {
					var $jexcel = $(element);

					$jexcel.find(".jexcel_toolbar_item[data-k='undo']").addClass("fa fa-mail-reply ");
					$jexcel.find(".jexcel_toolbar_item[data-k='redo']").addClass("fa fa-mail-forward ");
					$jexcel.find(".jexcel_toolbar_item[data-k='save']").addClass("fa fa-save");
					$jexcel.find(".jexcel_toolbar_item[data-k='text-align'][data-v='left']").addClass("fa fa-align-left");
					$jexcel.find(".jexcel_toolbar_item[data-k='text-align'][data-v='center']").addClass("fa fa-align-center");
					$jexcel.find(".jexcel_toolbar_item[data-k='text-align'][data-v='right']").addClass("fa fa-align-right");
					$jexcel.find(".jexcel_toolbar_item[data-k='font-weight'][data-v='bold']").addClass("fa fa-bold");
					$jexcel.find(".jexcel_toolbar_item[data-k='color']").addClass("fa-solid fa-palette");
					$jexcel.find(".jexcel_toolbar_item[data-k='background-color']").addClass("fa-solid fa-fill-drip");
				}
			};

			$.fn.spreadsheet.Constructor = Spreadsheet;
	});
})(jQuery);