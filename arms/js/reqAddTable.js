let versionList,
	tableData,
	pivotTableData,
	tableOptions,
	TableInstance,
	pivotType = "normal",
	editContents = {},
	folderDepth = {},
	res,
	maxDepth;
const ContentType = {
	normal: {
	},
	version: {
	},
	owner: {
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

const setDepth = (data, parentId, titles = []) => {
    const node = data.find((task) => task.c_id === parentId);
    if (!node || node.c_parentid < 2) {
        // 동적으로 깊이 정보 생성
        const depths = {};
        titles.reverse().forEach((title, index) => {
            depths[`depth${index + 1}`] = title;
        });

        for (let i = 1; i <= maxDepth; i++) {
            if (!depths[`depth${i}`]) {
                depths[`depth${i}`] = "";
            }
        }
        return depths;
    }

    if (node.c_type === 'folder') {
        titles.push(node.c_title);
    }
  return setDepth(data, node.c_parentid, titles);
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
         .filter(({ c_type }) => c_type === 'default') // 'default' 타입만 필터링
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

                const depthInfo = setDepth(data, c_parentid);
                acc.push({
                    version: getVersionTitle(vid),
                    id: c_id,
                    category: CategoryName[c_type],
                    assignee: assigneeNames ,
                    status: c_type !== "folder" ? reqStateEntity?.data ?? "" : "",
                    ...depthInfo,
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
                const depthInfo = setDepth(data, c_parentid);
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
                    ...depthInfo,
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
                        const depthInfo = setDepth(data, c_parentid);
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
                            ...depthInfo,
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

            for (let i = 1; i <= maxDepth; i++) {
                folderDepth[`depth${i}`] = `Depth${i}`;
            }
            ContentType["normal"] = {
                version: "버전",
                assignee: "담당자",
                ...folderDepth,
        		content: "요구사항 제목",
        		status: "상태",
        		priority: "우선순위",
        		difficulty: "난이도",
        		createDate: "생성일",
        		startDate: "시작일",
        		endDate: "종료일"
            };

			return tableData
			.filter((item) => item.category !== "Group") // 폴더 제거
			.sort((a, b) =>  a._version - b._version || a.c_parentid - b.c_parentid);; // 정렬
		}

		if (pivotType === "version") {
		    for (let i = 1; i <= maxDepth; i++) {
                folderDepth[`depth${i}`] = `Depth${i}`;
            }
            ContentType["version"] = {
                version: "버전",
                assignee: "담당자",
                ...folderDepth,
                content: "요구사항 제목",
                open: "열림",
                investigation: "진행중",
                resolved: "해결됨",
                closeStatus: "닫힘",
                statusTotal: "총계"
            };
            console.log(folderDepth.length);
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
								colSpan: 2+maxDepth,
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
					colSpan: 3+maxDepth,
					root: "version",
					origin: version,
					node:"root",
					children: childrenItem,
					...calcStatus(filterItems)
				};
			});
		}

		if (pivotType === "owner") {
		    for (let i = 1; i <= maxDepth; i++) {
                folderDepth[`depth${i}`] = `Depth${i}`;
            }
            ContentType["owner"] = {
                assignee: "담당자",
                version: "버전",
                ...folderDepth,
                content: "요구사항 제목",
                open: "열림",
                investigation: "진행중",
                resolved: "해결됨",
                closeStatus: "닫힘",
                statusTotal: "총계"
            };
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
				colSpan: 3+maxDepth,
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
								col: 0,
								colSpan: 3+maxDepth,
								...calcStatus(cur),
							    node:"leaf"
							},
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
                const keys = Object.keys(folderDepth);
                keys.forEach(key => {
                    this.unmergeRoot(key,el);
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

            const keys = Object.keys(folderDepth);
			if (btn.classList.contains("active")) {
				this.insertElement(this.getElement(e.target, "TR"), rows);
                keys.forEach(key => {
                    this.mergeRowsByClassName(key);
                });
			} else {
				keys.forEach(key => {
                    this.unmergeRowsByClassName(key,this.getElement(e.target, "TR"));
                });
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
			$tr.className ="reqItems";
			$tr.setAttribute("data-id", cur.id ?? "");
			$tr.setAttribute("data-version", cur._version ?? "");
			$tr.setAttribute("data-assignee", cur._assignee ?? "");
            const radioButtonName = `status_${cur.id}`;
			Object.keys(ContentType[pivotType]).forEach((key, index) => {
				const $col = this.makeElement(tag);
				$col.className = key;

                if(['content'].includes($col.className) && (tag !== "th")){
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
                    if(cur.node ==="leaf"){
                        $tr.style.backgroundColor  ="#4a4a4a";
                    }

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
				    if (cur.children.length !== 0) {
                        $col.prepend(this.makePivotButton($tr, cur));
                    }

					$col.classList.add("root");
				}
                if(['assignee', 'version'].includes($col.className) && !cur.colSpan){
                    $col.innerHTML = ``;
                }

				!$col.classList.contains("remove") && $tr.appendChild($col);
			});

			return [...acc, $tr];
		}, []);
	}

	makeRow(rows, tag) {
		return rows.reduce((acc, cur) => {
			const $tr = this.makeElement("tr");
			$tr.className ="reqItems";
			$tr.setAttribute("data-id", cur.id);
            $tr.setAttribute("data-version", cur._version ?? "");
			Object.keys(ContentType[pivotType]).forEach((key) => {
				if ([`_${key}`].includes(key)) return;

				const $col = this.makeElement(tag);
				$col.className = key;
				if (tag === "td") {
					if ((["status"].includes(key) && cur.category !== "Group")) {
					    const iconData = this.mappingStateIcon(cur[key]);
						$col.innerHTML = `
                        <a href="#" class="dropdown-toggle ${!cur[key] ? "empty" : ""}" data-toggle="dropdown" aria-expanded="false">
                            ${iconData}
                            <i class="fa fa-caret-down"></i>
                        </a>`;
                       $col.style = "text-align:left";

					}
                    else if( ["priority"].includes(key)){
                        const iconData = this.mappingPriorityIcon(cur[key]);
						$col.innerHTML = `
                        <a href="#" class="dropdown-toggle ${!cur[key] ? "empty" : ""}" data-toggle="dropdown" aria-expanded="false">
                             ${iconData}
                        <i class="fa fa-caret-down"></i>
                        </a>`;
                        $col.style = "text-align:left";

					}
					else if( ["difficulty"].includes(key)){
					    const iconData = this.mappingDifficultyIcon(cur[key]);
						$col.innerHTML = `
                        <a href="#" class="dropdown-toggle ${!cur[key] ? "empty" : ""}" data-toggle="dropdown" aria-expanded="false">
                            ${iconData}
                        <i class="fa fa-caret-down"></i>
                        </a>`;
                        $col.style = "text-align:left";

					}
					else if(['content'].includes($col.className)){
					    $col.prepend(this.makeEditableButton(cur,  key));
					}else if(['assignee'].includes($col.className) ){
					    let 전체_담당자 = cur[key];
                        전체_담당자 = 전체_담당자.split(', ').sort();

                        전체_담당자 = Array.from(new Set(전체_담당자));

					    $col.innerHTML = 전체_담당자;
					    $col.style = "text-align:left";
					}else {
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
	mappingStateIcon(key){
        if(key ==="열림"){
        return '<i class="fa  fa-folder-o text-danger"></i> 열림';
        }else if(key ==="진행중"){
        return '<i class="fa fa-fire text-danger" style="color: #E49400;"></i> 진행중';
        }else if(key ==="해결됨"){
        return '<i class="fa fa-fire-extinguisher text-success"></i> 해결됨';
        }else if(key ==="닫힘"){
        return '<i class="fa fa-folder text-primary"></i> 닫힘';
        }
	}
	mappingPriorityIcon(key){
        if(key ==="매우 높음"){
            return '<i class="fa  fa-angle-double-up text-danger"></i> 매우 높음';
        }else if(key ==="높음"){
            return '<i class="fa fa-angle-up text-danger"></i> 높음';
        }else if(key ==="중간"){
            return '<i class="fa fa-minus text-primary"  style="color: #E49400;"></i> 중간';
        }else if(key ==="낮음"){
            return '<i class="fa  fa-angle-down text-primary"></i> 낮음';
        }else if(key ==="매우 낮음"){
            return '<i class="fa  fa-angle-double-down text-primary"></i> 매우 낮음';
        }
    }
    mappingDifficultyIcon(key){
        if(key ==="매우 어려움"){
            return '<i class="fa  fa-angle-double-up text-danger"></i> 매우 어려움';
        }else if(key ==="어려움"){
            return '<i class="fa fa-angle-up text-danger"></i> 어려움';
        }else if(key ==="보통"){
            return '<i class="fa   fa-minus text-primary"  style="color: #E49400;"></i> 보통';
        }else if(key ==="쉬움"){
            return '<i class="fa  fa-angle-down text-primary"></i> 쉬움';
        }else if(key ==="매우 쉬움"){
            return '<i class="fa  fa-angle-double-down text-primary"></i> 매우 쉬움';
        }
    }
	updateData(reqId, editContents) {
        // 초기 데이터 객체 생성
        let dataToSend = {
            c_id: reqId,
            c_req_update_date: new Date()
        };

        // 조건 검사 후 조건을 만족하는 경우에만 프로퍼티 추가
        if(editContents.statusId) {
            const reqData = res.find(item => item.c_id == reqId);
            const c_req_pdservice_versionset_link = reqData ? reqData.c_req_pdservice_versionset_link : null;
            dataToSend.c_req_state_link = editContents.statusId;
            dataToSend.c_req_pdservice_versionset_link = c_req_pdservice_versionset_link;
            dataToSend.c_title = reqData.c_title;
        }if(editContents.priorityId) dataToSend.c_req_priority_link = editContents.priorityId;
        if(editContents.difficultyId) dataToSend.c_req_difficulty_link = editContents.difficultyId;
        if(editContents.content) dataToSend.c_title = editContents.content;

        // startDate와 endDate 값 검증 후 객체에 추가
        if(editContents.startDate && !isNaN(new Date(editContents.startDate).getTime())) {
            dataToSend.c_req_start_date = new Date(editContents.startDate);
        }
        if(editContents.endDate && !isNaN(new Date(editContents.endDate).getTime())) {
            dataToSend.c_req_end_date = new Date(editContents.endDate);
        }

        if( dataToSend.c_req_state_link || dataToSend.c_req_priority_link || dataToSend.c_req_difficulty_link || dataToSend.c_req_start_date || dataToSend.c_req_end_date) {
            // DB까지만 변경 필요한 경우
            tableOptions.onDBUpdate(tableOptions.id, dataToSend);
        } else {
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
			let dropdownIconData ="";
			$li.className = text.trim() === label ? "active" : "";
			$li.innerHTML = `<a href="#resSelectOption" data-toggle="tab">${label}</a>`;
			$li.addEventListener("click", (e) => {
				if(keyname === "_status"){
                    editContents.statusId = value;
                    dropdownIconData = this.mappingStateIcon(e.target.textContent);
                }else if(keyname === "_priority"){
                    editContents.priorityId = value;
                     dropdownIconData = this.mappingPriorityIcon(e.target.textContent);
                }else if(keyname === "_difficulty"){
                    editContents.difficultyId = value;
                    dropdownIconData = this.mappingDifficultyIcon(e.target.textContent);
                }
                this.updateData($li.parentElement.parentElement.parentElement.dataset.id,editContents);

				$li.parentElement.previousElementSibling.innerHTML = `${dropdownIconData} <i class="fa fa-caret-down"></i>`;

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
	}
    unmergeRowsByClassName(className,element) {
        const tables = document.querySelectorAll('.reqTable');

        const dataVersion = element.getAttribute('data-version');
        const dataAssignee = element.getAttribute('data-assignee');

        tables.forEach((table) => {
            Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
                const rowDataVersion = row.getAttribute('data-version');
                const rowDataAssignee = row.getAttribute('data-assignee');
                const cell = row.querySelector(`.${className}`);
                if (rowDataVersion === dataVersion && rowDataAssignee === dataAssignee) {
                const cell = row.querySelector(`.${className}`);
                    if (cell) {
                        // 숨겼던 셀을 다시 보이게 함
                        cell.style.display = '';
                        // 적용했던 배경색 제거
                        cell.style.backgroundColor = '';
                        // rowSpan 값을 기본값으로 재설정
                        cell.rowSpan = 1;
                    }
                }
            });
        });
    }
    unmergeRoot(className,element) {
        console.log(className);console.log(element);
        const tables = document.querySelectorAll('.reqTable');

        const dataVersion = element.getAttribute('data-version');
        const dataAssignee = element.getAttribute('data-assignee');

        tables.forEach((table) => {
            Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
            const rowDataVersion = row.getAttribute('data-version');
            const rowDataAssignee = row.getAttribute('data-assignee');
            const cell = row.querySelector(`.${className}`);
            if (rowDataVersion === dataVersion || rowDataAssignee === dataAssignee) {
                const cell = row.querySelector(`.${className}`);
                        if (cell) {
                            cell.style.display = '';
                            cell.style.backgroundColor = '';
                            cell.rowSpan = 1;
                        }
                    }
                });
            });
        }
    mergeRowsByClassName(className) {
        const tables = document.querySelectorAll('.reqTable');

        tables.forEach((table) => {
            let lastValue = null;
            let lastRow = null;
            let lastDataVersion = null;
            let lastDataAssignee = null;
            let rowspan = 1;
            let groupIndex = 0; // 그룹 인덱스 추가
            Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
                const cell = row.querySelector(`.${className}`);
                const value = cell ? cell.textContent : '';
                const dataVersion = row.getAttribute('data-version');
                const dataAssignee = row.getAttribute('data-assignee');
                if (cell) {
                    if (value === lastValue  && dataVersion === lastDataVersion && dataAssignee === lastDataAssignee) {
                        cell.style.display = 'none'; // 셀 병합 시 숨김 처리
                        if (lastRow) {
                            const cellInLastRow = lastRow.querySelector(`.${className}`);
                            if (cellInLastRow) {
                                cellInLastRow.rowSpan = rowspan + 1;
                                // 병합되는 첫 번째 셀에만 배경색 적용
                                if (groupIndex % 2 === 0) { // 짝수 그룹에 대해 배경색 적용
                                    cellInLastRow.style.backgroundColor = 'rgba(51, 51, 51, 0.325)';
                                }
                            }
                        }
                        rowspan++;
                    } else {
                        rowspan = 1;
                        lastValue = value;
                        lastDataVersion = dataVersion;
                        lastDataAssignee = dataAssignee;
                        lastRow = row;
                        groupIndex++; // 새 그룹이 시작될 때마다 그룹 인덱스 증가
                    }
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
    // 선택옵션
	tableOptions = options;
	// 버전 정보
	const data = await tableOptions.onGetVersion(tableOptions.id);

	 // 요구사항 담당자 정보
	const assigneeData  =await tableOptions.onGetReqAssignee(tableOptions.id);
	const assigneeResponse = assigneeData.response;

	// 요구사항 정보
	res = await tableOptions.onGetData(tableOptions.id);

	// 담당자 정보 + 요구사항 정보
    res = mergeData(res,assigneeResponse);
	versionList = data.response.sort((a, b) => a.c_id - b.c_id);

    // 최대 깊이 조회
	const maxLevel = Math.max(...res.map(task => task.c_level));
    maxDepth = maxLevel - 2;

    // 테이블 데이터 생성
	tableData = mapperTableData([...res]);
	pivotTableData = mapperPivotTableData([...res]);

	TableInstance = new Table();

	TableInstance.rendering();

	TableInstance.mergeRowsByClassName('version');
    const keys = Object.keys(folderDepth);

    keys.forEach(key => {
        TableInstance.mergeRowsByClassName(key);
    });


};

const changeTableType = (type) => {
	pivotType = type;
	TableInstance.rerenderTable();
	tableSelect(tableOptions.id);

	TableInstance.mergeRowsByClassName('version');
    const keys = Object.keys(folderDepth);

    keys.forEach(key => {
        TableInstance.mergeRowsByClassName(key);
    });
};

const mergeData = (res, assigneeResponse) =>{
  return res.map(res => {
    const matchedAssignees = assigneeResponse.filter(assignee => assignee.요구사항_아이디 == res.c_id);
    return { ...res, assignee: matchedAssignees };
  });
}
