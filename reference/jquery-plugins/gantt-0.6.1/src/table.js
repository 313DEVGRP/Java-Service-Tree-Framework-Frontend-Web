import { $ } from './svg_utils';

export default class Table {
    dragStartY = 0;
    constructor(gantt, contents) {
        this.set_defaults(gantt, contents);
    }

    set_defaults(gantt, contents) {
        this.gantt = gantt;
        this.contents = contents;
    }

    draw_table_header(attr) {
        const $thead = document.createElement('thead');
        const $tr = document.createElement('tr');

        Object.values(this.contents).forEach((content) => {
            const $th = document.createElement('th');
            $th.textContent = content;

            $tr.appendChild($th);
        });

        $thead.appendChild($tr);
        $thead.classList.add('table-header');

        $.style($tr, attr);

        return $thead;
    }

    draw_table_body(tasks, attr) {
        this.tasks = tasks;
        const $tbody = document.createElement('tbody');
        $tbody.classList.add('table-body');

        this.make_table_row(attr).forEach((row) => $tbody.append(row));

        this.bind_draggable_event($tbody);

        return $tbody;
    }

    make_table_row(attr) {
        return this.tasks.map((task) => {
            const $tr = document.createElement('tr');
            $tr.setAttribute('draggable', 'true');
            $tr.setAttribute('data-id', task.id);
            $.style($tr, attr);

            Object.keys(this.contents).forEach((content) => {
                const $td = document.createElement('td');

                if (content === 'name' && task.level > 1) {
                    if (task.has_children) {
                        const expand_btn = document.createElement('button');
                        expand_btn.className = 'expand_btn';

                        $td.append(expand_btn);
                    }

                    $td.className = `indent-${task.level - 1}`;
                }

                const text = document.createTextNode(task[content] ?? '');
                $td.append(text);
                $tr.append($td);
            });

            $tr.addEventListener('dragstart', (e) => {
                e.target.classList.add('dragging');
            });
            $tr.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });

            return $tr;
        });
    }

    get_drag_after_element(container, y) {
        const draggableElements = [
            ...container.querySelectorAll('tr:not(.dragging)'),
        ];

        return draggableElements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY }
        ).element;
    }

    find_task_item(id) {
        return this.tasks.find((t) => t.id === id);
    }

    bind_draggable_event($tbody) {
        $tbody.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!this.dragStartY) this.dragStartY = e.clientY;

            this.draggableEl = document.querySelector('.dragging');
            this.afterElement = this.get_drag_after_element($tbody, e.clientY);

            $tbody.insertBefore(this.draggableEl, this.afterElement);
        });

        $tbody.addEventListener('drop', async (e) => {
            e.preventDefault();
            const targetItem = this.find_task_item(
                e.target.parentNode.getAttribute('data-id')
            );
            const dragItem = this.find_task_item(
                this.draggableEl.getAttribute('data-id')
            );
            const afterItem = this.find_task_item(
                this.afterElement.getAttribute('data-id')
            );

            const params = {
                c_id: dragItem.id,
                ref: afterItem.parentId,
                c_position:
                    e.clientY > this.dragStartY
                        ? afterItem.position - 1
                        : afterItem.position,
                level: afterItem.level,
                p_position: dragItem.position,
                p_parentId: dragItem.parentId,
            };

            if (targetItem.type !== 'default') {
                const arr = this.tasks.filter(
                    (t) => t.parentId === Number(targetItem.id)
                ).length;
                params.ref = targetItem.id;
                params.level = targetItem.level + 1;
                params.c_position = arr ? arr : 0;
            }

            this.dragStartY = 0;
            this.gantt.draggble_rerender(params);
            this.gantt.trigger_event('drag_row', [params]);
        });
    }
}
