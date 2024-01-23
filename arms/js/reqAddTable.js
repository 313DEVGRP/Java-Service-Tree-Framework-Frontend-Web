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

class Table {
	constructor(options, data) {
		this.options = options;
		this.$table = this.makeElement("table");
		this.$data = data;
	}

	makeElement(name) {
		return document.createElement(name);
	}

	makeRow(rows, tag) {
		return rows.reduce((acc, cur) => {
			const $tr = this.makeElement("tr");
			$tr.setAttribute("data-id", cur.id);

			Object.keys(this.options.content).forEach((key) => {
				const $col = this.makeElement(tag);
				$col.className = key;

				if (tag === "td" && ["status", "priority", "difficulty"].includes(key)) {
					!!cur[key] &&
						($col.innerHTML = `
					<a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
						${cur[key]}
						<i class="fa fa-caret-down"></i>
					</a>`);
				} else {
					$col.innerHTML = cur[key];
				}

				$tr.appendChild($col);
			});

			return [...acc, $tr];
		}, []);
	}
	makeHead() {
		const $thead = this.makeElement("thead");
		this.makeRow([this.options.content], "th").forEach((r) => $thead.append(r));

		return $thead;
	}
	makeBody() {
		const $tbody = this.makeElement("tbody");
		this.makeRow(this.$data, "td").forEach((r) => $tbody.append(r));

		return $tbody;
	}

	getOriginData(id) {
		return origin;
	}

	updateData(id, obj) {
		const {
			origin: {
				c_id,
				c_title,
				c_req_contents,
				c_req_pdservice_versionset_link,
				reqDifficultyEntity,
				reqPriorityEntity,
				reqStateEntity,
				c_req_reviewer01,
				c_req_reviewer02,
				c_req_reviewer03,
				c_req_reviewer04,
				c_req_reviewer05
			}
		} = this.$data.find((item) => item.id === Number(id));

		this.options.onUpdate(
			this.options.id,
			Object.assign(
				{
					c_id,
					c_title,
					c_req_pdservice_versionset_link,
					c_req_priority_link: reqPriorityEntity?.c_id ?? null, // 5 - 중간
					c_req_difficulty_link: reqDifficultyEntity?.c_id ?? null, // 5 - 보통
					c_req_state_link: reqStateEntity?.c_id ?? null, //10 - 열림
					c_req_update_date: new Date(),
					c_req_reviewer01,
					c_req_reviewer02,
					c_req_reviewer03,
					c_req_reviewer04,
					c_req_reviewer05,
					c_req_status: "ChangeReq",
					c_req_contents
				},
				obj
			)
		);
	}

	addInput(node) {
		const uuid = crypto.randomUUID();
		const text = node.textContent;
		const $input = this.makeElement("input");

		$input.id = uuid;
		$input.addEventListener("blur", () => {
			this.updateData(node.parentElement.dataset.id, { c_title: $input.value });
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
				keyname = "c_req_difficulty_link";
				break;
			case "priority":
				options = ReqPriority;
				keyname = "c_req_priority_link";
				break;
			case "status":
			default:
				options = ReqStatus;
				keyname = "c_req_state_link";
				break;
		}

		return Object.entries(options).reduce((acc, [name, value]) => {
			const $li = this.makeElement("li");
			const label = name.replace("_", " ");
			$li.className = text.trim() === label ? "active" : "";
			$li.innerHTML = `<a href="#resSelectOption" data-toggle="tab">${label}</a>`;
			$li.addEventListener("click", (e) => {
				const result = {};
				result[keyname] = value;
				this.updateData($li.parentElement.parentElement.parentElement.dataset.id, result);
				$li.parentElement.previousElementSibling.innerHTML = `${e.target.textContent} <i class="fa fa-caret-down"></i>`;

				document.getElementById(uuid).remove();
			});

			return [...acc, $li];
		}, []);
	}

	addSelect(node) {
		const uuid = crypto.randomUUID();
		const $ul = this.makeElement("ul");
		$ul.id = uuid;
		$ul.className = "dropdown-menu req-select";
		this.setOptions(node.parentElement.className, node.textContent, uuid).forEach((item) => $ul.append(item));

		node.parentElement.appendChild($ul);
	}

	makeSection(rowData, name, col) {
		const $el = this.makeElement(name);
		$el.className = name;
		this.makeRow(rowData, col).forEach((r) => $el.append(r));

		$el.addEventListener("click", (e) => {
			const { tagName, classList, parentElement } = e.target;
			// input
			if (tagName === "TD" && classList.contains("content")) {
				this.addInput(e.target);
			}

			// select
			if (["A", "I"].includes(tagName)) {
				classList.contains("dropdown-toggle") && this.addSelect(e.target);
				tagName === "I" && this.addSelect(parentElement);
			}
		});

		return $el;
	}

	get template() {
		this.$table.className = "reqTable";
		this.$table.appendChild(this.makeSection([this.options.content], "thead", "th"));
		this.$table.appendChild(this.makeSection(this.$data, "tbody", "td"));
		return this.$table;
	}
}

const getDate = (stamp) => {
	if (!stamp || stamp < 0) return "-";
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

const setTableData = (data) => {
	return data
		.sort((a, b) => a.c_parentid - b.c_parentid)
		.reduce((acc, cur) => {
			const {
				c_id,
				c_parentid,
				c_title,
				c_req_owner,
				c_req_contents,
				reqStateEntity,
				reqPriorityEntity,
				reqDifficultyEntity,
				c_req_create_date,
				c_req_start_date,
				c_req_end_date,
				c_req_plan_progress
			} = cur;
			if (cur.c_parentid < 2) return acc;

			return [
				...acc,
				{
					version: "",
					id: c_id,
					category: "",
					manager: c_req_owner,
					status: reqStateEntity?.data ?? "",
					...Object.assign({ depth1: "", depth2: "", depth3: "" }, setDepth(data, c_parentid, [c_title])),
					content: c_title,
					priority: reqPriorityEntity?.data ?? "",
					difficulty: reqDifficultyEntity?.data ?? "",
					createDate: getDate(c_req_create_date),
					startDate: getDate(c_req_start_date),
					endDate: getDate(c_req_end_date),
					progress: c_req_plan_progress || 0,
					origin: cur
				}
			];
		}, []);
};

// const getMonitorData = async (id) => {
// 	return await $.ajax({
// 		url: `/auth-user/api/arms/reqAdd/T_ARMS_REQADD_${id}/getMonitor.do`,
// 		type: "GET",
// 		dataType: "json",
// 		progress: true,
// 		statusCode: {
// 			200: function (data) {
// 				if (!isEmpty(data)) {
// 					return data;
// 				}
// 			}
// 		}
// 	});
// };

const makeTable = async (wrapper, options) => {
	const res = await options.onGetData(options.id);
	const $wrapper = document.getElementById(wrapper);
	const table = new Table(options, setTableData(res));

	$wrapper.appendChild(table.template);
};
