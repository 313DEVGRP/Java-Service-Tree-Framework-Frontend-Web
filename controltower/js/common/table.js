(function ($) {
	"use strict";

	var Table = function (selector) {
		this.$selector = $(selector);
		this.selector = selector;
		this.table;
		this.selectedData;
		this.onDataTableClick;
		this.onInit;
	};

	Table.prototype.onToggleCheckAll = function (element) {
		if (!element) return;

		var tr = this.table.rows().nodes();
		var isChecked = $(element).prop("checked");
		console.log(isChecked);

		if (isChecked) {
			this.table.rows().select();
		} else {
			this.table.rows().deselect();
		}

		$.each(tr, function () {
			$(this).find('input[type="checkbox"]').prop("checked", isChecked);
		});
	};

	Table.prototype.onToggleCheckbox = function (element) {
		var tr = $(element);
		var checkbox = tr.find('input[type="checkbox"]');
		var isChecked = tr.hasClass("selected");

		checkbox.prop("checked", isChecked);
	};

	Table.prototype.onRowClick = function (element, multi) {
		var tr = $(element);
		this.selectedData = this.table.row(tr).data();

		if (tr.hasClass("selected")) {
			tr.removeClass("selected");

			if ($.isFunction(this.onDeselect)) {
				this.onDeselect(this.selectedData, element);
			}

			this.selectedData = null;
		} else {
			if (!multi) {
				this.table.$("tr.selected").removeClass("selected");
			}
			tr.addClass("selected");

			if ($.isFunction(this.onDataTableClick)) {
				this.onDataTableClick(this.selectedData, element);
			}
		}
	};

	Table.prototype.dataTableExtendBuild = function (params) {
		var responsive = {
			details: {
				renderer: function (api, rowIdx, columns) {
					var outer = "<tr data-dt-row=" + rowIdx + " data-dt-column='0'><td>";

					var data = $.map(columns, function (col, i) {
						return col.hidden
							? `<div class="gradient_bottom_border" style="margin-bottom: 5px;float:left;width:180px;">
							<div style="text-align: center;padding:3px;background: #3b3d40"><strong>
							${col.title}
							</strong></div>
							<div style="padding:3px;text-align: center;color: #a4c6ff;">
							${col.data}
							</div></div></div>`
							: ``;
					}).join(``);
					outer += data;
					outer += "</td></tr>";

					return outer ? $("<table/>").append(outer) : false;
				}
			}
		};
		var tableBuildParams = $.extend(true, {}, params, { responsive: responsive });

		this.dataTableBuild(tableBuildParams);
	};

	Table.prototype.dataTableBuild = function (params) {
		var self = this;
		var defaults = {
			data: [],
			stateSave: true,
			destroy: true,
			processing: true,
			serverSide: false,
			scrollX: true,
			responsive: false,
			columns: this.columns,
			rowsGroup: null,
			columnDefs: [],
			isAddCheckbox: false,
			isDeleteUtil: false,
			select: {},
			pagingType: "simple_numbers",
			oLanguage: {
				oPaginate: {
					sNext: '<i class="fa fa-chevron-right" ></i>',
					sPrevious: '<i class="fa fa-chevron-left" ></i>'
				}
			},
			order: [[0, "asc"]],
			buttons: [
				"copy",
				{
					extend: "csv",
					charset: "UTF-8",
					bom: true
				},
				"excel",
				"print",
				{
					extend: "pdfHtml5",
					orientation: "landscape",
					pageSize: "LEGAL"
				}
			],
			language: {
				processing: "",
				loadingRecords:
					'<span class="spinner" style="font-size: 14px !important;"><i class="fa fa-spinner fa-spin"></i> 데이터를 처리 중입니다.</span>'
			}
		};

		var tableBuildParams = $.extend({}, defaults, params);

		tableBuildParams.initComplete = function () {
			var dataTableLength = $(".dataTables_length").find("select:eq(0)");
			var tableWrapper = $(self.selector + "_wrapper");

			dataTableLength.addClass("darkBack");
			dataTableLength.children().css("background", "#3B3D40");
			dataTableLength.css("border-radius", "5px");
			dataTableLength.css("min-height", "30px");
			tableWrapper.css("border-top", "1px solid rgba(51, 51, 51, 0.3)");
			tableWrapper.css("padding-top", "5px");

			tableWrapper.find("input[type=search]").css("width", "80px");

			if (tableBuildParams.isDeleteUtil) {
				$(self.selector + "_length").remove();
				$(self.selector + "_filter").remove();
				$(self.selector + "_info").remove();
				$(self.selector + "_paginate").remove();
			}

			if ($.isFunction(self.onInit)) {
				self.onInit();
			}
		};

		if (tableBuildParams.isAddCheckbox) {
			tableBuildParams.columnDefs = [
				{
					targets: 0,
					orderable: false,
					searchable: false,
					data: null,
					defaultContent: "",
					className: "select-checkbox"
				},
				{ targets: 1, aDataSort: [1] }
			].concat(tableBuildParams.columnDefs);

			tableBuildParams.columns = [
				{
					data: null,
					title: '<input type="checkbox" name="checkall" />',
					render: function () {
						return '<input type="checkbox" class="editor-active" name="checkbox" />';
					},
					className: "dt-body-center"
				}
			].concat(tableBuildParams.columns);

			tableBuildParams.select = { style: "multi" };
		}

		this.table = this.$selector.DataTable(tableBuildParams);

		$(this.selector + " tbody").on("click", "tr", function () {
			self.onRowClick(this, tableBuildParams.isAddCheckbox);

			if (tableBuildParams.isAddCheckbox) {
				self.onToggleCheckbox(this);
			}
		});

		if (tableBuildParams.isAddCheckbox) {
			$(this.selector + "_wrapper .dataTables_scrollHead thead").on("change", 'input[name="checkall"]', function () {
				self.onToggleCheckAll(this);
			});
		}

		$.fn.dataTable.ext.errMode = function () {
			jError("Notification : <strong>Ajax Error</strong>, retry plz !");
		};
	};

	Table.prototype.clear = function () {
		this.table.clear();
	};

	Table.prototype.addRows = function (rows) {
		this.table.rows.add(rows).draw(false);
	};

	Table.prototype.reDraw = function (rows) {
		this.selectedData = null;
		this.clear();
		this.addRows(rows);
	};

	Table.prototype.empty = function () {
		this.table.destroy();
		this.$selector.empty();
	};

	Table.prototype.removeRows = function (callback) {
		var selectedRows = this.table.rows({ selected: true });
		var selectedDatas = selectedRows.data().toArray();

		selectedRows.remove().draw();

		if ($.isFunction(callback)) {
			callback(selectedDatas);
		}
	};

	Table.prototype.getSelectedDataList = function () {
		return this.table.rows({ selected: true }).data().toArray();
	};

	Table.prototype.getDatas = function () {
		return this.table.rows().data().toArray();
	};

	$.fn.Table = Table;
})(jQuery);
