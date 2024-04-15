let versionList,
	tableData,
	pivotTableData,
	tableOptions,
	TableInstance,
	pivotType = "normal";
const ContentType = {
	normal: {
		version: "Version",
		category: "구분",
		id: "TASK NO",
		writer: "TASK OWNER",
		status: "Status",
		depth1: "Depth 1",
		depth2: "Depth 2",
		depth3: "Depth 3",
		content: "기능",
		priority: "우선순위",
		difficulty: "난이도",
		createDate: "생성일",
		startDate: "시작일",
		endDate: "종료일",
		progress: "진행률"
	},
	version: {
		version: "Version",
		writer: "TASK OWNER",
		depth1: "Depth 1",
		content: "기능",
		open: "열림",
		investigation: "진행중",
		resolved: "해결됨",
		closeStatus: "닫힘",
		statusTotal: "총계"
	},
	owner: {
		writer: "TASK OWNER",
		version: "Version",
		depth1: "Depth 1",
		content: "기능",
		open: "열림",
		investigation: "진행중",
		resolved: "해결됨",
		closeStatus: "닫힘",
		statusTotal: "총계"
	}
};

const ReqPriority = {
	매우_높음: 7,
	높음: 6,
	중간: 5,
	낮음: 4,
	매우_낮음: 3
};

const ReqDifficulty = {
	매우_어려움: 3,
	어려움: 4,
	보통: 5,
	쉬움: 6,
	매우_쉬움: 7
};

const ReqStatus = {
	열림: 10,
	진행중: 11,
	해결됨: 12
};

const createUUID = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

const calcStatus = (arr) =>
	arr.reduce((acc, cur) => {
		const open = Number(acc?.open ?? 0) + Number(cur.open),
			investigation = Number(acc?.investigation ?? 0) + Number(cur.investigation),
			resolved = Number(acc?.resolved ?? 0) + Number(cur.resolved),
			closeStatus = Number(acc?.closeStatus ?? 0) + Number(cur.closeStatus),
			statusTotal = open + investigation + resolved + closeStatus;

		return {
			open,
			investigation,
			resolved,
			closeStatus,
			statusTotal
		};
	}, {});

const getDate = (stamp) => {
	if (!stamp || stamp < 0) return "";
	const time = new Date(stamp);
	return `${time.getFullYear()}-${addZero(time.getMonth() + 1)}-${addZero(time.getDate())}`;
};

const addZero = (n) => {
	return n < 10 ? `0${n}` : n;
};

const setDepth = (data, parentId, titles) => {
	if (parentId === 2) return { depth1: titles[0] };

	const node = data.find((task) => task.c_id === parentId);

	if (node.c_parentid <= 2) {
		const reulst = {};

		titles
			.concat(node.c_title)
			.reverse()
			.forEach((title, index) => (reulst[`depth${index + 1}`] = title));

		return reulst;
	}

	return setDepth(data, node.c_parentid, titles.concat(node.c_title));
};

const getVersionTitle = (id) => {
	if (!id) return "";
	return versionList.find((v) => v.c_id === Number(id))?.c_title ?? "";
};

const CategoryName = {
	folder: "Group",
	default: "요구사항"
};

const mapperTableData = (data) => {
	return data
		?.sort((a, b) => a.c_parentid - b.c_parentid)
		.reduce((acc, cur) => {
			const {
				c_id,
				c_parentid,
				c_title,
				c_req_writer,
				c_req_contents,
				reqStateEntity,
				reqPriorityEntity,
				reqDifficultyEntity,
				c_req_create_date,
				c_req_start_date,
				c_req_end_date,
				c_req_plan_progress,
				c_req_pdservice_versionset_link,
				c_type
			} = cur;
			if (cur.c_parentid < 2) return acc;

			const vid = JSON.parse(c_req_pdservice_versionset_link)[0] ?? "";

			return [
				...acc,
				{
					version: getVersionTitle(vid),
					id: c_id,
					category: CategoryName[c_type],
					writer: c_type !== "folder" ? c_req_writer : "",
					status: c_type !== "folder" ? reqStateEntity?.data ?? "" : "",
					...Object.assign({ depth1: "", depth2: "", depth3: "" }, setDepth(data, c_parentid, [c_title])),
					content: c_title,
					priority: reqPriorityEntity?.data ?? "",
					difficulty: reqDifficultyEntity?.data ?? "",
					createDate: getDate(c_req_create_date),
					startDate: getDate(c_req_start_date),
					endDate: getDate(c_req_end_date),
					progress: c_req_plan_progress || 0,
					origin: cur,
					_status: reqStateEntity?.c_id,
					_priority: reqPriorityEntity?.c_id,
					_difficulty: reqDifficultyEntity?.c_id,
					_version: Number(vid)
				}
			];
		}, []);
};

const mapperPivotTableData = (data) => {
	return data.reduce((acc, cur) => {
		const {
			c_id,
			c_parentid,
			c_title,
			c_req_writer,
			c_req_contents,
			reqStateEntity,
			reqPriorityEntity,
			reqDifficultyEntity,
			c_req_create_date,
			c_req_start_date,
			c_req_end_date,
			c_req_plan_progress,
			c_req_pdservice_versionset_link
		} = cur;
		if (cur.c_parentid < 2) return acc;

		return [
			...acc,
			{
				id: c_id,
				version: JSON.parse(c_req_pdservice_versionset_link) ?? "",
				writer: c_req_writer,
				_writer: c_req_writer,
				open: reqStateEntity?.c_id === 10 ? 1 : "",
				investigation: "",
				resolved: reqStateEntity?.c_id === 11 ? 1 : "",
				closeStatus: reqStateEntity?.c_id === 12 ? 1 : "",
				statusTotal: "",
				...Object.assign({ depth1: "", depth2: "", depth3: "" }, setDepth(data, c_parentid, [c_title])),
				content: c_title,
				origin: cur
			}
		];
	}, []);
};

const rearrangement = (
	arr,
	key,
	root,
	data // arr를 key 기준으로 그룹화 첫번째 한테는 root 속성을 넣어줌
) =>
	arr.reduce((acc, cur) => {
		const result = { ...cur, ...data };
		const index = acc?.findIndex((item) => item.some((task) => task[key] === result[key]));

		if (index >= 0) {
			acc[index].push(result);
		} else {
			acc?.push([{ ...result, root }]);
		}

		return acc;
	}, []);

class Table {
	constructor() {
		this.$table = this.makeElement("table");
		this.$data = this.setTableData();
	}

	setTableData(data) {
		if (pivotType === "normal") {
			return tableData;
		}

		if (pivotType === "version") {
			return versionList.map((version) => {
				const filterItems = pivotTableData
					.filter((item) => item.origin && item.origin.attr && item.origin.attr.rel !== "folder") // 폴더 제거
					.filter((item) => item.version?.includes(`${version.c_id}`));

				const childrenItem = rearrangement(filterItems, "writer", "writer", {
					version: version.c_title,
					_version: version.c_id
				}).reduce((acc, cur) => {
					return [
						...acc,
						{
							...cur[0],
							children: cur.slice(1, cur.length),
							lastChild: {
								_version: version.c_id,
								writer: `${cur[0].writer} 총계`,
								_writer: cur[0].writer,
								col: 1,
								colSpan: 3,
								origin: version,
								...calcStatus(cur)
							}
						}
					];
				}, []);
				return {
					version: `${version.c_title} 총계`,
					_version: version.c_id,
					col: 0,
					colSpan: 4,
					root: "version",
					origin: version,
					children: childrenItem,
					...calcStatus(filterItems)
				};
			});
		}

		if (pivotType === "owner") {
			// Task Owner
			const 모든_요구사항데이터 = pivotTableData
				.filter((item) => item.origin && item.origin.attr && item.origin.attr.rel !== "folder") // 폴더 제외(요구사항만 포함)
				.flatMap((task) =>
					task.version.reduce((acc, cur) => {
						const versionItem = versionList.find((item) => item.c_id === Number(cur));
						return [...acc, { ...task, _version: versionItem.c_id, version: versionItem.c_title }];
					}, [])
				)
				.sort((a, b) => a.writer?.localeCompare(b.writer) || a._version - b._version); // 데이터 정렬
			return rearrangement(모든_요구사항데이터, "writer", "writer").map((group) => ({
				writer: `${group[0].writer} 총계`,
				_writer: group[0].writer,
				col: 0,
				colSpan: 4,
				root: "writer",
				children: rearrangement(group, "version", "version").reduce((acc, cur) => {
					return [
						...acc,
						{
							...cur[0],
							children: cur.slice(1, cur.length),
							lastChild: {
								writer: `${cur[0].version} 총계`,
								_writer: group[0].writer,
								col: 1,
								colSpan: 3,
								...calcStatus(cur)
							}
						}
					];
				}, []),
				...calcStatus(group)
			}));
		}
	}

	makeElement(name) {
		return document.createElement(name);
	}

	sortData(key, type) {
		if (key === "category") {
			type === "asc" && this.$data.sort((a, b) => a[key].localeCompare([key]));
			type === "desc" && this.$data.sort((a, b) => b[key].localeCompare(a[key]));
		} else if (["id", "progress"].includes(key)) {
			type === "asc" && this.$data.sort((a, b) => a[key] - b[key]);
			type === "desc" && this.$data.sort((a, b) => b[key] - a[key]);
		} else if (["createDate", "startDate", "endDate"].includes(key)) {
			type === "asc" && this.$data.sort((a, b) => (a[key] ? (b[key] ? new Date(a[key]) - new Date(b[key]) : -1) : 1));
			type === "desc" && this.$data.sort((a, b) => (a[key] ? (b[key] ? new Date(b[key]) - new Date(a[key]) : -1) : 1));
		} else {
			type === "asc" &&
				this.$data.sort((a, b) => (a[`_${key}`] ? (b[`_${key}`] ? a[`_${key}`] - b[`_${key}`] : -1) : 1));
			type === "desc" &&
				this.$data.sort((a, b) => (a[`_${key}`] ? (b[`_${key}`] ? b[`_${key}`] - a[`_${key}`] : -1) : 1));
		}

		const $tbody = document.getElementById("req_tbody");
		$tbody.replaceChildren();
		this.makeRow(this.$data, "td").forEach((r) => $tbody.append(r));
	}

	handleSorting(e, key) {
		[...e.target.parentNode.childNodes]
			.filter((node) => !node.classList.contains(key))
			.forEach((node) => {
				node.classList.remove("asc");
				node.classList.remove("desc");
			});

		if (e.target.classList.contains("asc")) {
			e.target.classList.remove("asc");
			e.target.classList.add("desc");

			this.sortData(key, "desc");
		} else {
			e.target.classList.remove("desc");
			e.target.classList.add("asc");

			this.sortData(key, "asc");
		}
	}

	insertElement(root, list) {
		list.forEach((row, index, arr) => {
			if (index) arr[index - 1].after(row);
			else root.after(row);
		});
	}

	removeElment(selector) {
		const elements = document.querySelectorAll(selector);

		Array.from(elements)
			.filter((el, index) => index)
			.forEach((row) => row.remove());
	}

	getElement(target, tag, className) {
		if (className) {
			return target.tagName === tag && target.classList.contains(className) && target;
		}
		return target.tagName !== tag ? this.getElement(target.parentElement, tag) : target;
	}

	makePivotButton($tr, data) {
		const rows = this.makePivotRow(
			data.children.flatMap((item) => {
				if (item.lastChild) return [item, item.lastChild];
				return item;
			}),
			"td"
		);
		const btn = this.makeElement("button");
		const plusIcon = this.makeElement("i");
		const minusIcon = this.makeElement("i");

		btn.className = "btn pivot-toggle";
		plusIcon.className = "fa fa-plus-square";
		minusIcon.className = "fa fa-minus-square";

		btn.appendChild(plusIcon);
		btn.appendChild(minusIcon);

		btn.addEventListener("click", (e) => {
			btn.classList.toggle("active");

			if (btn.classList.contains("active")) {
				this.insertElement(this.getElement(e.target, "TR"), rows);
			} else {
				this.removeElment(`[data-${data.root}="${data[`_${[data.root]}`]}"]`);
				console.log("##### delete", data);
			}
		});

		return btn;
	}

	makePivotRow(rows, tag) {
		return rows.reduce((acc, cur) => {
			const $tr = this.makeElement("tr");
			$tr.setAttribute("data-id", cur.id ?? "");
			$tr.setAttribute("data-version", cur._version ?? "");
			$tr.setAttribute("data-writer", cur._writer ?? "");
			Object.keys(ContentType[pivotType]).forEach((key, index) => {
				const $col = this.makeElement(tag);
				$col.className = key;

				if (cur[key]) {
					$col.innerHTML = cur[key];
				}

				if (tag === "th") {
					$tr.appendChild($col);
					return;
				}

				if (cur.col !== undefined && cur.col === index) {
					$col.setAttribute("colspan", cur.colSpan);
				}

				if (index > cur.col && index < cur.col + cur.colSpan) {
					$col.classList.add("remove");
				}

				if (cur.colSpan) {
					$tr.classList.add("highlight");
				}

				if (cur.root === key) {
					$col.prepend(this.makePivotButton($tr, cur));
					$col.classList.add("root");
				}

				!$col.classList.contains("remove") && $tr.appendChild($col);
			});

			return [...acc, $tr];
		}, []);
	}

	makeRow(rows, tag) {
		return rows.reduce((acc, cur) => {
			const $tr = this.makeElement("tr");
			$tr.setAttribute("data-id", cur.id);

			Object.keys(ContentType[pivotType]).forEach((key) => {
				if ([`_${key}`].includes(key)) return;

				const $col = this.makeElement(tag);
				$col.className = key;

				if (tag === "td") {
					$col.innerHTML = cur[key];

					if ((["status"].includes(key) && cur.category !== "Group") || ["priority", "difficulty"].includes(key)) {
						$col.innerHTML = `
					<a href="#" class="dropdown-toggle ${!cur[key] ? "empty" : ""}" data-toggle="dropdown" aria-expanded="false">
						${cur[key]}
						<i class="fa fa-caret-down"></i>
					</a>`;
					}
				} else {
					$col.innerHTML = cur[key];
				}

				$tr.appendChild($col);
			});

			return [...acc, $tr];
		}, []);
	}

	updateData(id, key, value) {
		const task = this.$data.find((item) => item.id === Number(id));

		if (task[key] === value) return;

		task[key] = value;

		tableOptions.onUpdate(tableOptions.id, {
			c_id: task.id,
			c_title: task.content,
			c_req_pdservice_versionset_link: task.origin.c_req_pdservice_versionset_link,
			c_req_priority_link: task._priority ?? null, // 5 - 중간
			c_req_difficulty_link: task._difficulty ?? null, // 5 - 보통
			c_req_state_link: task._status ?? null, //10 - 열림
			c_req_update_date: new Date(),
			c_req_reviewer01: task.origin.c_req_reviewer01,
			c_req_reviewer02: task.origin.c_req_reviewer02,
			c_req_reviewer03: task.origin.c_req_reviewer03,
			c_req_reviewer04: task.origin.c_req_reviewer04,
			c_req_reviewer05: task.origin.c_req_reviewer05,
			c_req_status: "ChangeReq",
			c_req_contents: task.origin.c_req_contents,
			c_req_plan_progress: task.progress,
			c_req_end_date: new Date(task.endDate)
		});
	}

	addInput(node, updateKey, type = text) {
		const uuid = createUUID();
		const text = node.textContent;
		const $input = this.makeElement("input");

		$input.setAttribute("type", type);
		$input.id = uuid;
		$input.addEventListener("blur", () => {
			this.updateData(this.getElement(node, "TR").dataset.id, updateKey, $input.value);
			node.textContent = $input.value;
		});

		node.textContent = "";
		node.appendChild($input);

		document.getElementById(uuid).value = text;
		document.getElementById(uuid).focus();
	}

	setOptions(name, text, uuid) {
		let options;
		let keyname;
		switch (name) {
			case "difficulty":
				options = ReqDifficulty;
				keyname = "_difficulty";
				break;
			case "priority":
				options = ReqPriority;
				keyname = "_priority";
				break;
			case "status":
			default:
				options = ReqStatus;
				keyname = "_status";
				break;
		}

		return Object.entries(options).reduce((acc, [name, value]) => {
			const $li = this.makeElement("li");
			const label = name.replace("_", " ");
			$li.className = text.trim() === label ? "active" : "";
			$li.innerHTML = `<a href="#resSelectOption" data-toggle="tab">${label}</a>`;
			$li.addEventListener("click", (e) => {
				this.updateData($li.parentElement.parentElement.parentElement.dataset.id, keyname, value);
				$li.parentElement.previousElementSibling.innerHTML = `${e.target.textContent} <i class="fa fa-caret-down"></i>`;

				document.getElementById(uuid).remove();
			});

			return [...acc, $li];
		}, []);
	}

	addSelect(node) {
		const uuid = createUUID();
		const $ul = this.makeElement("ul");
		$ul.id = uuid;
		$ul.className = "dropdown-menu req-select";
		this.setOptions(node.parentElement.className, node.textContent, uuid).forEach((item) => $ul.append(item));

		node.parentElement.appendChild($ul);
	}

	bindHeadEvent($el) {
		$el.addEventListener("click", (e) => {
			!["writer", "depth1", "depth2", "depth3", "content"].includes(e.target.className) &&
				this.handleSorting(e, e.target.classList.item(0));
		});
	}

	bindBodyEvent($el) {
		$el.addEventListener("click", (e) => {
			const { tagName, classList, parentElement } = e.target;

			const $writer = this.getElement(e.target, "TD", "writer");
			const $content = this.getElement(e.target, "TD", "content");
			const $progress = this.getElement(e.target, "TD", "progress");
			const $endDate = this.getElement(e.target, "TD", "endDate");

			if ($writer) {
				this.addInput($writer, "writer");
				return;
			}

			if ($content) {
				this.addInput($content, "content");
				return;
			}

			if ($progress) {
				this.addInput($progress, "progress", "number");
				return;
			}

			if ($endDate) {
				this.addInput($endDate, "endDate", "date");
				return;
			}

			// select
			if (["A", "I"].includes(tagName)) {
				classList.contains("dropdown-toggle") && this.addSelect(e.target);
				tagName === "I" && this.addSelect(parentElement);
			}
		});
	}

	makeSection(rowData, name, col) {
		const $el = this.makeElement(name);
		$el.id = `req_${name}`;
		$el.className = name;

		if (pivotType === "normal") this.makeRow(rowData, col).forEach((r) => $el.append(r));
		else this.makePivotRow(rowData, col).forEach((r) => $el.append(r));

		if ("thead" === name) this.bindHeadEvent($el);
		else this.bindBodyEvent($el);

		return $el;
	}

	makeTable() {
		this.$table.className = `reqTable ${pivotType !== "normal" ? "pivotTable" : ""}`;
		this.$table.appendChild(this.makeSection([ContentType[pivotType]], "thead", "th"));
		this.$table.appendChild(this.makeSection(this.$data, "tbody", "td"));
		return this.$table;
	}

	rendering() {
		const $wrapper = document.getElementById(tableOptions.wrapper);
		$wrapper.innerHTML = null;

		$wrapper.appendChild(this.makeTable());
	}

	rerenderTable() {
		this.$data = this.setTableData();

		this.$table.innerHTML = "";

		this.makeTable();
	}
}

const makeReqTable = async (options) => {
	tableOptions = options;
	const data = await tableOptions.onGetVersion(tableOptions.id);
	const res = await tableOptions.onGetData(tableOptions.id);
	versionList = data.response.sort((a, b) => a.c_id - b.c_id);

	tableData = mapperTableData([...res]);
	pivotTableData = mapperPivotTableData([...res]);
	TableInstance = new Table();

	TableInstance.rendering();
};

const changeTableType = (type) => {
	pivotType = type;
	TableInstance.rerenderTable();
};
