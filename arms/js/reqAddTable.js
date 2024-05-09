let versionList,
	tableData,
	pivotTableData,
	tableOptions,
	TableInstance,
	pivotType = "normal",
	editContents = {},
	res;
const ContentType = {
	normal: {
		version: "버전",
		assignee: "요구사항 담당자",
		depth1: "Depth 1",
		depth2: "Depth 2",
		depth3: "Depth 3",
		content: "요구사항 제목",
		status: "요구사항 상태",
		priority: "우선순위",
		difficulty: "난이도",
		createDate: "생성일",
		startDate: "시작일",
		endDate: "종료일"
	},
	version: {
		version: "버전",
		assignee: "요구사항 담당자",
		depth1: "Depth 1",
		content: "요구사항 제목",
		open: "열림",
		investigation: "진행중",
		resolved: "해결됨",
		closeStatus: "닫힘",
		statusTotal: "총계"
	},
	owner: {
		assignee: "요구사항 담당자",
		version: "버전",
		depth1: "Depth 1",
		content: "요구사항 제목",
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
	해결됨: 12,
	닫힘: 13
};

const ReqStatusEnglish = {
	open: 10,
	investigation: 11,
	resolved: 12,
	closeStatus: 13
};

const getReqWriterName = (writerId) =>{
    let writer = writerId.match(/\[(.*?)\]/);
    return writer[1];
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
                assignee,
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

            const versions = (c_req_pdservice_versionset_link !== null) ? JSON.parse(c_req_pdservice_versionset_link) : [];
            versions.forEach((vid) => {
                const assigneeNames = assignee.length > 0 ? assignee.map(a => a.담당자_이름).join(', ') : "담당자 미배정";

                acc.push({
                  version: getVersionTitle(vid),
                  id: c_id,
                  category: CategoryName[c_type],
                  assignee: assigneeNames ,
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
                });
             });
      return acc;
    }, []);
};

const mapperPivotTableData = (data) => {
	return data.reduce((acc, cur) => {
		const {
			c_id,
			c_parentid,
			c_title,
			c_req_writer,
			assignee,
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

		if (assignee.length === 0) { // 담당자 데이터가 없는 경우 처리
	        const versions = c_req_pdservice_versionset_link ? JSON.parse(c_req_pdservice_versionset_link) : [""];
            versions.forEach((version) => {
                acc.push({
                    id: c_id,
                    version: version,
                    assignee: "담당자 미배정",
                    _assignee: "담당자 미배정",
                    open: reqStateEntity?.c_id === 10 ? 1 : "",
                    investigation: reqStateEntity?.c_id === 11 ? 1 : "",
                    resolved: reqStateEntity?.c_id === 12 ? 1 : "",
                    closeStatus: reqStateEntity?.c_id === 13 ? 1 : "",
                    statusTotal: "",
                    ...Object.assign({ depth1: "", depth2: "", depth3: "" }, setDepth(data, c_parentid, [c_title])),
                    content: c_title,
                    origin: cur,
                    c_parentid: c_parentid
                });
            });

        }
        else{
            assignee.forEach(({ 담당자_아이디, 담당자_이름,요구사항_여부 }) => { // 담당자 별로 데이터 생성
                const versions = c_req_pdservice_versionset_link ? JSON.parse(c_req_pdservice_versionset_link) : [""];
                if(요구사항_여부){
                    versions.forEach((version) => {// 각 버전별로 데이터 생성
                        acc.push({
                            id: c_id,
                            version: version,
                            assignee:  담당자_이름, //getReqWriterName(c_req_writer),
                            _assignee: 담당자_아이디,
                            open: reqStateEntity?.c_id === 10 ? 1 : "",
                            investigation: reqStateEntity?.c_id === 11 ? 1 : "",
                            resolved: reqStateEntity?.c_id === 12 ? 1 : "",
                            closeStatus: reqStateEntity?.c_id === 13 ? 1 : "",
                            statusTotal: "",
                            ...Object.assign({ depth1: "", depth2: "", depth3: "" }, setDepth(data, c_parentid, [c_title])),
                            content: c_title,
                            origin: cur,
                            c_parentid: c_parentid
                        });
                    });
                }

            });
        }



        return acc;
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
			return tableData
			.filter((item) => item.category !== "Group") // 폴더 제거
			.sort((a, b) =>  a._version - b._version || a.c_parentid - b.c_parentid);; // 정렬
		}

		if (pivotType === "version") {
			return versionList.map((version) => {
				const filterItems = pivotTableData
					.filter((item) => item.origin && item.origin.attr && item.origin.attr.rel !== "folder") // 폴더 제거
					.filter((item) => item.version?.includes(`${version.c_id}`))
					.sort((a, b) => a.assignee?.localeCompare(b.assignee) ||
                    				    a.c_parentid - b.c_parentid); // 데이터 정렬

				const childrenItem = rearrangement(filterItems, "assignee", "assignee", {
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
								assignee: `${cur[0].assignee} 총계`,
								_assignee: cur[0]._assignee,
								col: 1,
								colSpan: 3,
								node:"leaf",
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
					node:"root",
					children: childrenItem,
					...calcStatus(filterItems)
				};
			});
		}

		if (pivotType === "owner") {
			// Task Owner
			const 모든_요구사항데이터 = pivotTableData
				.filter((item) => item.origin && item.origin.attr && item.origin.attr.rel !== "folder") // 폴더 제외(요구사항만 포함)
				.flatMap(task => {
                    const versions = Array.isArray(task.version) ? task.version : [task.version];
                    return versions.reduce((acc, cur) => {
                    const versionItem = versionList.find(item => item.c_id === Number(cur));
                    return [...acc, { ...task, _version: versionItem.c_id, version: versionItem.c_title }];
                    }, []);
                })
				.sort((a, b) => a.assignee?.localeCompare(b.assignee) ||
				    a._version - b._version ||
				    a.c_parentid - b.c_parentid); // 데이터 정렬

			return rearrangement(모든_요구사항데이터, "assignee", "assignee").map((group) => ({
				assignee: `${group[0].assignee} 총계`,
				_assignee: group[0]._assignee,
				col: 0,
				colSpan: 4,
				root: "assignee",
				node:"root",
				children: rearrangement(group, "version", "version").reduce((acc, cur) => {
					return [
						...acc,
						{
							...cur[0],
							children: cur.slice(1, cur.length),
							lastChild: {
								assignee: `${cur[0].version}의 총계`,
								_assignee: group[0]._assignee,
								col: 1,
								colSpan: 3,
								...calcStatus(cur)
							},
							node:"leaf"
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

	removeElement(data) {
	    let selector;
	    if(data.node === "root"){
	        selector = `[data-${data.root}="${data[`_${[data.root]}`]}"]`;

	    }else{
	        const assignee = `[data-assignee="${data._assignee}"]`;
        	const version = `[data-version="${data._version}"]`;
            selector = `${assignee}${version}`;
	    }
	    const elements = document.querySelectorAll(selector);
        if (data.node === "root") {
            elements.forEach((el) => {
                const buttons = el.querySelectorAll('.btn.pivot-toggle.active');
                buttons.forEach((button) => {
                    button.classList.remove('active');
                });
            });
        }

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
				this.removeElement(data);
			}
		});

		return btn;
	}
    makeEditableButton(cur, key) {
        const uuid = createUUID(); // Ensure a unique ID for each input element
        const that = this;
        const btn = this.makeElement("button");
        const editIcon = this.makeElement("i");
        btn.className = "btn pivot-toggle";
        editIcon.className = "fa fa-pencil";
        editIcon.style.marginRight = "10px";
        btn.appendChild(editIcon);
        const text = document.createTextNode(cur[key] ?? "");
        btn.appendChild(text);
        const tempText = cur[key] ;
        btn.addEventListener("click", function(e) {
            const input = that.makeElement("input");
            input.id = uuid;
            input.type = "text";
            input.value = cur[key] ?? "";
            input.className = "edit-input";
            btn.parentNode.replaceChild(input, btn); // 버튼을 입력 필드로 바꿈
            input.focus(); // 입력 필드에 자동으로 포커스를 줌

            input.addEventListener("blur", () => {
                console.log(input.value);
                if (tempText !==  input.value){
                    cur[key] = input.value;
                    const updatedBtn = that.makeEditableButton(cur, key);
                    input.parentNode.replaceChild(updatedBtn, input);
                    editContents.content = cur[key];
                    that.updateData(cur['id'],editContents);
                }else{
                    cur[key] = input.value;
                    const updatedBtn = that.makeEditableButton(cur, key);
                    input.parentNode.replaceChild(updatedBtn, input);
                }
            });

            input.addEventListener("keyup", function(e) {
                if (e.key === "Enter") {
                    input.blur(); // 엔터 키를 누르면 blur 이벤트를 강제로 호출하여 업데이트 처리를 함
                }
            });
        });

        return btn;
    }

	makePivotRow(rows, tag) {
		return rows.reduce((acc, cur) => {
			const $tr = this.makeElement("tr");
			$tr.setAttribute("data-id", cur.id ?? "");
			$tr.setAttribute("data-version", cur._version ?? "");
			$tr.setAttribute("data-assignee", cur._assignee ?? "");
            const radioButtonName = `status_${cur.id}`;
			Object.keys(ContentType[pivotType]).forEach((key, index) => {
				const $col = this.makeElement(tag);
				$col.className = key;


                if(['content'].includes($col.className) && tag === "tr"){
                        $col.prepend(this.makeEditableButton(cur,  key));
                }else if (cur[key]) {
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
					if (pivotType === "version"){
					    $tr.removeAttribute('data-assignee');
					}
				}else{
                    if(['open', 'investigation', 'resolved', 'closeStatus'].includes($col.className)){
                        const checkedAttribute = $col.innerHTML === "1" ? " checked" : "";
                        $col.innerHTML = `<input type="radio" name="${radioButtonName}"${checkedAttribute}>`;
                    }

				}

				if (['assignee'].includes($col.className) && $col.innerHTML === "담당자 미배정") {
                    $col.style.color = "red";
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
            $tr.setAttribute("data-version", cur._version ?? "");
			Object.keys(ContentType[pivotType]).forEach((key) => {
				if ([`_${key}`].includes(key)) return;

				const $col = this.makeElement(tag);
				$col.className = key;
				if (tag === "td") {

					if ((["status"].includes(key) && cur.category !== "Group") || ["priority", "difficulty"].includes(key)) {
						$col.innerHTML = `
					<a href="#" class="dropdown-toggle ${!cur[key] ? "empty" : ""}" data-toggle="dropdown" aria-expanded="false">
						${cur[key]}
						<i class="fa fa-caret-down"></i>
					</a>`;
					}else if(['content'].includes($col.className)){
					    $col.prepend(this.makeEditableButton(cur,  key));
					}else{
					    $col.innerHTML = cur[key];
					}

				} else {
					$col.innerHTML = cur[key];
				}

	            // 담당자 미지정일 경우 빨간색으로 표시
                if (['assignee'].includes($col.className) && $col.innerHTML === "담당자 미배정") {
                    $col.style.color = "red";
                }

				$tr.appendChild($col);
			});

			return [...acc, $tr];
		}, []);
	}

	updateData(reqId, editContents) {
        // 초기 데이터 객체 생성
        let dataToSend = {
            c_id: reqId,
            c_req_update_date: new Date()
        };

        // 조건 검사 후 조건을 만족하는 경우에만 프로퍼티 추가
        if(editContents.statusId) dataToSend.c_req_state_link = editContents.statusId;
        if(editContents.priorityId) dataToSend.c_req_priority_link = editContents.priorityId;
        if(editContents.difficultyId) dataToSend.c_req_difficulty_link = editContents.difficultyId;
        if(editContents.content) dataToSend.c_title = editContents.content;

        // startDate와 endDate 값 검증 후 객체에 추가
        if(editContents.startDate && !isNaN(new Date(editContents.startDate).getTime())) {
            dataToSend.c_req_start_date = new Date(editContents.startDate);
        }
        if(editContents.endDate && !isNaN(new Date(editContents.endDate).getTime())) {
            dataToSend.c_req_end_date = new Date(editContents.endDate);
        }

        if(dataToSend.c_req_state_link || dataToSend.c_req_priority_link || dataToSend.c_req_difficulty_link || dataToSend.c_req_start_date || dataToSend.c_req_end_date) {
            // DB까지만 변경 필요한 경우
            tableOptions.onDBUpdate(tableOptions.id, dataToSend);
        } else {
           // ALM까지 데이터 변경 필요
           const versionSetLink = res.find(item => item.c_id === reqId);
           tableOptions.onUpdate(tableOptions.id, {
                c_id: reqId,
                c_title: editContents.content ?? null,
                c_req_pdservice_versionset_link : versionSetLink ? versionSetLink.c_req_pdservice_versionset_link : null
           });
        }
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
	addDateInput(node, updateKey) {
        const uuid = createUUID();
    	const text = node.textContent;

    	const version = this.getElement(node, "TR").dataset.version

    	const versionData = versionList.find(item => item.c_id === Number(version));
    	const versionStartDate = getDate(versionData.c_pds_version_start_date);
    	const versionEndDate   = getDate(versionData.c_pds_version_end_date);

        const $input = this.makeElement("input");


        $input.setAttribute("type", "date");
        $input.setAttribute("min",versionStartDate);
        $input.setAttribute("max",versionEndDate);

        $input.id = uuid;

        $input.addEventListener("blur", () => {
            if(updateKey === "startDate"){
                editContents.startDate = $input.value; // 요구사항 시작일
            }else if(updateKey === "endDate"){
                editContents.endDate = $input.value;
            }
    	    this.updateData(this.getElement(node, "TR").dataset.id, editContents);
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
				if(keyname === "_status"){
                    editContents.statusId = value;
                }else if(keyname === "_priority"){
                    editContents.priorityId = value;
                }else if(keyname === "_difficulty"){
                    editContents.difficultyId = value;
                }
                this.updateData($li.parentElement.parentElement.parentElement.dataset.id,editContents);

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
			!["assignee", "depth1", "depth2", "depth3", "content"].includes(e.target.className) &&
				this.handleSorting(e, e.target.classList.item(0));
		});
	}

	bindBodyEvent($el) {
		$el.addEventListener("click", (e) => {
			const { tagName, classList, parentElement } = e.target;

			const $assignee = this.getElement(e.target, "TD", "assignee");
			const $content = this.getElement(e.target, "TD", "content");
			const $progress = this.getElement(e.target, "TD", "progress");
			const $createDate = this.getElement(e.target, "TD", "createDate");
			const $startDate = this.getElement(e.target, "TD", "startDate");
			const $endDate = this.getElement(e.target, "TD", "endDate");
            const tdElement = e.target.closest("td");
            const trElement = e.target.closest("tr");

            if ($startDate) {
				this.addDateInput($startDate, "startDate");
				return;
			}

			if ($endDate) {
			    console.log($endDate);
				this.addDateInput($endDate, "endDate");
				return;
			}

            if (e.target.type === "radio") {
                editContents.statusId =ReqStatusEnglish[tdElement.className];
                this.updateData(trElement.dataset.id,editContents);
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

		this.mergeVersionRows();
	}
	mergeVersionRows() {
        const tables = document.querySelectorAll('.reqTable');
        tables.forEach((table) => {
            let lastVersion = null;
            let lastRow = null;
            let rowspan = 1
            Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
                const versionCell = row.querySelector('.version');
                const version = versionCell.textContent;

                if (version === lastVersion) {
                    versionCell.style.display = 'none';
                    if (lastRow) {
                        const versionCellInLastRow = lastRow.querySelector('.version');
                        if (versionCellInLastRow) {
                            versionCellInLastRow.rowSpan = rowspan + 1;
                        }
                    }
                    rowspan++;
                } else {
                    rowspan = 1;
                    lastVersion = version;
                    lastRow = row;
                }
            });
        });
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
	const assigneeData  =await tableOptions.onGetReqAssignee(tableOptions.id);
	const assigneeResponse = assigneeData.response;
	res = await tableOptions.onGetData(tableOptions.id);
    res = mergeData(res,assigneeResponse);
	versionList = data.response.sort((a, b) => a.c_id - b.c_id);

	tableData = mapperTableData([...res]);
	pivotTableData = mapperPivotTableData([...res]);

	TableInstance = new Table();

	TableInstance.rendering();
};

const changeTableType = (type) => {
	pivotType = type;
	TableInstance.rerenderTable();
	tableSelect(tableOptions.id);
};

const mergeData = (res, assigneeResponse) =>{
  return res.map(res => {
    const matchedAssignees = assigneeResponse.filter(assignee => assignee.요구사항_아이디 == res.c_id);
    return { ...res, assignee: matchedAssignees };
  });
}
