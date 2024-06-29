var JspreadsheetAPI = ( function() {
		"use strict";

		var sheetData;

		var mock_data = [
			{
				"id": "22-product",
				"name": "313 SOFT - 요구사항 관리 시스템 - ALM RMS",
				"type": "제품",
				"parent": ""
			},
			{
				"id": "33-version",
				"name": "BaseVersion",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "35-version",
				"name": "1.0.0",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "36-version",
				"name": "1.0.1",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "37-version",
				"name": "24.01",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "46-version",
				"name": "24.02",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "55-version",
				"name": "24.03",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "59-version",
				"name": "24.04",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "61-version",
				"name": "24.05",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "74-version",
				"name": "24.06",
				"type": "버전",
				"parent": ""
			},
			{
				"id": "5f18ccb5ce15e800268d224d",
				"name": "양형석",
				"type": "작업자",
				"parent": "37"
			},
			{
				"id": "626551d434b9b70068796c1e",
				"name": "moon",
				"type": "작업자",
				"parent": "37,35,74"
			},
			{
				"id": "712020:4fc33a35-859f-4ac8-8956-b22581115623",
				"name": "gkfn185",
				"type": "작업자",
				"parent": "37,36,55"
			},
			{
				"id": "619ae743b43d5b006adef72c",
				"name": "김찬호",
				"type": "작업자",
				"parent": "37,36,55"
			},
			{
				"id": "hsyang",
				"name": "hsyang",
				"type": "작업자",
				"parent": "37,33,55,59"
			},
			{
				"id": "5ffe4999f7ea2a0107f8c6f6",
				"name": "최수현",
				"type": "작업자",
				"parent": "37,36,55"
			},
			{
				"id": "dumbbelloper",
				"name": "dumbbelloper",
				"type": "작업자",
				"parent": "33,35"
			},
			{
				"id": "gkfn185",
				"name": "gkfn185",
				"type": "작업자",
				"parent": "33"
			},
			{
				"id": "1",
				"name": "Redmine Admin",
				"type": "작업자",
				"parent": "55"
			},
			{
				"id": "admin",
				"name": "admin",
				"type": "작업자",
				"parent": "55"
			},
			{
				"id": "63b2a039159df2c252e826e9",
				"name": "이동민",
				"type": "작업자",
				"parent": "61"
			},
			{
				"id": "No-Worker",
				"name": "No-Worker",
				"type": "No-Worker",
				"parent": ""
			}
		];
		var modifyData = function() {
			let products = {};
			let versions = {};
			let workers = [];
			let result = [];

			console.log(mock_data);
			mock_data.forEach(item => {
				if (item.type === "제품") {
					let itemId = item.id.split("-")[0];
					products[itemId] = { id: itemId, name: item.name };
					//products[item.id] = { id: item.id, name: item.name };
				} else if (item.type === "버전") {
					let itemId = item.id.split("-")[0];
					versions[itemId] = { id: itemId, name: item.name, product: products["22"] };
				} else if(item.type ==="작업자") {
					item.parent.split(',').forEach(parentId => {
						if (versions[parentId]) {
							workers.push({
								product: versions[parentId].product,
								version: versions[parentId],
								worker: { id: item.id, name: item.name }
							});
						}
					});
				}
			});

			console.log(products);
			console.log(versions);
			console.log(workers);
			workers.forEach(worker => {
				result.push({
					"제품(서비스) 키": worker.product.id,
					"제품(서비스) 명": worker.product.name,
					"버전 키": worker.version.id,
					"버전 명": worker.version.name,
					"작업자 키": worker.worker.id,
					"작업자 명": worker.worker.name
				});
			});

			console.log(result);
			setSheetData(result);
			return result;
		};

		var setSheetData = function (fetchedData) {

			// 여기서 fetchedData 를 sheetData 로 변경해야힘.


			sheetData = fetchedData;
		};
		var getSheetData = function () {
			if (sheetData) {
				console.log("getSheetData :: sheetData 존재 :: 목데이터 반환");
				console.log(sheetData);
				return sheetData;
			} else {
				console.log("getSheetData :: sheetData 미존재 :: 목데이터 파싱 및 반환");
				return modifyData();
			}
		};


	var columnList = [
		{ type: "text", title: "제품(서비스) 키", width:100},
		{ type: "text", title: "제품(서비스) 명", width:300},
		{ type: "text", title: "버전 키", width:100},
		{ type: "text", title: "버전 명", width:100},
		{ type: "text", title: "작업자 키", width:200},
		{ type: "text", title: "작업자", width:100}
	];



	// default options 과 따로 옵션 지정할 수 있게 해야한다.

		var sheetRender = function(targetElementId) {
			var spreadsheetElement = document.getElementById(targetElementId);

			if (spreadsheetElement.jexcel) {
				spreadsheetElement.jexcel.destroy();
			}

			console.log("sheetRender");
			console.log(sheetData);
			//var sheet = jspreadsheet(spreadsheetElement, sheetOptions);
			var sheet = jspreadsheet(spreadsheetElement, {

				// allowComments: true,
				contextMenu: function(o, x, y, e, items) {
					var items = [];

					// Save
					items.push({
						title: jSuites.translate('Save as'),
						shortcut: 'Ctrl + S',
						icon: 'save',
						onclick: function () {
							o.download();
						}
					});

					return items;
				},
				search:true,
				pagination:10,
				// data: getSheetData(),
				data: sheetData,
				//columns: columnList,
				columns: [
					{ type: "text", title: "제품(서비스) 키", width: spreadsheetElement.clientWidth * 0.1},
					{ type: "text", title: "제품(서비스) 명", width: spreadsheetElement.clientWidth * 0.25},
					{ type: "text", title: "버전 키", width: spreadsheetElement.clientWidth * 0.1},
					{ type: "text", title: "버전 명", width: spreadsheetElement.clientWidth * 0.15},
					{ type: "text", title: "작업자 키", width: spreadsheetElement.clientWidth * 0.3},
					{ type: "text", title: "작업자", width: spreadsheetElement.clientWidth * 0.1}
				],
				onbeforechange: function(instance, cell, x, y, value) {
					var cellName = jspreadsheet.getColumnNameFromId([x,y]);
					console.log('The cell ' + cellName + ' will be changed' + '\n');
				},
				oninsertcolumn: function(instance) {
					console.log('Column added' + '\n');
				},
				/*onchange: function(instance, cell, x, y, value) {
					var cellName = jspreadsheet.getColumnNameFromId([x,y]);
					console.log('onchange :: ' + cell + " :;  x :: " + x + " :: y :: " + y +" :: cellName ::" + cellName + ' to: ' + value + '\n');
					if (x == 2) {
						var key = instance.jexcel.getValueFromCoords(1, y);
						if (!modifiedRows[key]) {
							modifiedRows[key] = {};
						}
						modifiedRows[key].이름 = instance.jexcel.getValueFromCoords(0, y);
						modifiedRows[key].키 = instance.jexcel.getValueFromCoords(1, y);
						modifiedRows[key].연봉 = value;
					}
				},*/
				oninsertrow: function(instance, rowNumber) {
					console.log('Row added' + rowNumber);
				},
				ondeleterow: function(instance, rowNumber) {
					console.log('Row deleted' + rowNumber);
				},
				ondeletecolumn: function(instance) {
					console.log('Column deleted' +'\n');
				},
				onselection: function(instance, x1, y1, x2, y2, origin) {
					var cellName1 = jspreadsheet.getColumnNameFromId([x1, y1]);
					var cellName2 = jspreadsheet.getColumnNameFromId([x2, y2]);
					console.log('The selection from ' + cellName1 + ' to ' + cellName2 + '' + '\n');
				},
				onsort: function(instance, cellNum, order) {
					var order = (order) ? 'desc' : 'asc';
					console.log('The column  ' + cellNum + ' sorted by ' + order + '\n');
				},
				onresizerow: function(instance, cell, height) {
					console.log('The row  ' + cell + ' resized to height ' + height + ' px' + '\n');
				},
				onresizecolumn: function(instance, cell, width) {
					console.log('The column  ' + cell + ' resized to width ' + width + ' px' + '\n');
				},
				onmoverow: function(instance, from, to) {
					console.log('The row ' + from + ' was move to the position of ' + to + ' ' + '\n');
				},
				onmovecolumn: function(instance, from, to) {
					console.log('The col ' + from + ' was move to the position of ' + to + ' ' + '\n');
				},
				onload: function(instance) {
					console.log('New data is loaded' + '\n');
				},
				onblur: function(instance) {
					console.log('The table ' + $(instance).prop('id') + ' is blur' + '\n');
				},
				onfocus: function(instance) {
					console.log('The table ' + $(instance).prop('id') + ' is focus' + '\n');
				},
				onpaste: function(data) {
					console.log('Paste on the table ' + $(instance).prop('id') + '' + '\n');
				},
			});

		};



		var sheetOptions = {
			// allowComments: true,
			contextMenu: function(o, x, y, e, items) {
				var items = [];

				// Save
				items.push({
					title: jSuites.translate('Save as'),
					shortcut: 'Ctrl + S',
					icon: 'save',
					onclick: function () {
						o.download();
					}
				});

				return items;
			},
			search:true,
			pagination:10,
			// data: getSheetData(),
			data: sheetData,
			columns: columnList,
			// columns: [
			// 	{ type: "text", title: "이름", readOnly: true },
			// 	{ type: "text", title: "키",  readOnly: true  },
			// 	{ type: "text", title: "연봉"  }
			// ],
			onbeforechange: function(instance, cell, x, y, value) {
				var cellName = jspreadsheet.getColumnNameFromId([x,y]);
				console.log('The cell ' + cellName + ' will be changed' + '\n');
			},
			oninsertcolumn: function(instance) {
				console.log('Column added' + '\n');
			},
			/*onchange: function(instance, cell, x, y, value) {
				var cellName = jspreadsheet.getColumnNameFromId([x,y]);
				console.log('onchange :: ' + cell + " :;  x :: " + x + " :: y :: " + y +" :: cellName ::" + cellName + ' to: ' + value + '\n');
				if (x == 2) {
					var key = instance.jexcel.getValueFromCoords(1, y);
					if (!modifiedRows[key]) {
						modifiedRows[key] = {};
					}
					modifiedRows[key].이름 = instance.jexcel.getValueFromCoords(0, y);
					modifiedRows[key].키 = instance.jexcel.getValueFromCoords(1, y);
					modifiedRows[key].연봉 = value;
				}
			},*/
			oninsertrow: function(instance, rowNumber) {
				console.log('Row added' + rowNumber);
			},
			ondeleterow: function(instance, rowNumber) {
				console.log('Row deleted' + rowNumber);
			},
			ondeletecolumn: function(instance) {
				console.log('Column deleted' +'\n');
			},
			onselection: function(instance, x1, y1, x2, y2, origin) {
				var cellName1 = jspreadsheet.getColumnNameFromId([x1, y1]);
				var cellName2 = jspreadsheet.getColumnNameFromId([x2, y2]);
				console.log('The selection from ' + cellName1 + ' to ' + cellName2 + '' + '\n');
			},
			onsort: function(instance, cellNum, order) {
				var order = (order) ? 'desc' : 'asc';
				console.log('The column  ' + cellNum + ' sorted by ' + order + '\n');
			},
			onresizerow: function(instance, cell, height) {
				console.log('The row  ' + cell + ' resized to height ' + height + ' px' + '\n');
			},
			onresizecolumn: function(instance, cell, width) {
				console.log('The column  ' + cell + ' resized to width ' + width + ' px' + '\n');
			},
			onmoverow: function(instance, from, to) {
				console.log('The row ' + from + ' was move to the position of ' + to + ' ' + '\n');
			},
			onmovecolumn: function(instance, from, to) {
				console.log('The col ' + from + ' was move to the position of ' + to + ' ' + '\n');
			},
			onload: function(instance) {
				console.log('New data is loaded' + '\n');
			},
			onblur: function(instance) {
				console.log('The table ' + $(instance).prop('id') + ' is blur' + '\n');
			},
			onfocus: function(instance) {
				console.log('The table ' + $(instance).prop('id') + ' is focus' + '\n');
			},
			onpaste: function(data) {
				console.log('Paste on the table ' + $(instance).prop('id') + '' + '\n');
			},
		};

		return {
			setSheetData,
			getSheetData,
			sheetRender
		}
})(); //즉시실행함수