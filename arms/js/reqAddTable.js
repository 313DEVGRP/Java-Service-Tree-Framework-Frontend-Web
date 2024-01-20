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
				$col.innerHTML = cur[key];

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

	removeInput(input, node) {
		const { origin } = this.$data.find((item) => item.id === Number(node.parentElement.dataset.id));
		origin.data = input.value;
		node.textContent = input.value;

		console.log("#### update ", origin);
	}

	addInput(node) {
		const uuid = crypto.randomUUID();
		const text = node.textContent;
		const $input = document.createElement("input");
		$input.id = uuid;
		$input.addEventListener("blur", () => this.removeInput($input, node));

		node.textContent = "";
		node.appendChild($input);
		document.getElementById(uuid).value = text;
		document.getElementById(uuid).focus();
	}

	makeSection(rowData, name, col) {
		const $el = this.makeElement(name);
		$el.className = name;
		this.makeRow(rowData, col).forEach((r) => $el.append(r));

		$el.addEventListener("click", (e) => {
			if (e.target.tagName !== "TD") return;
			if (e.target.classList.contains("content")) {
				this.addInput(e.target);
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

const getMonitorData = async (id) => {
	return await $.ajax({
		url: `/auth-user/api/arms/reqAdd/T_ARMS_REQADD_${id}/getMonitor.do`,
		type: "GET",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				if (!isEmpty(data)) {
					return data;
				}
			}
		}
	});
};

const makeTable = async (id, wrapper, options) => {
	const res = await getMonitorData(id);
	const $wrapper = document.getElementById(wrapper);
	const table = new Table(options, setTableData(res));

	$wrapper.appendChild(table.template);
};
