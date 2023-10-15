import { $ } from './svg_utils';

export default class Table {
    constructor(gantt, contents, handler) {
        this.gantt = gantt;
        this.contents = contents;
        this.handler = handler;
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

    draw_table_bodys(tasks, attr) {
        return tasks.reduce(
            (acc, cur) => (acc.push(this.make_table_body(cur, attr)), acc),
            []
        );
    }

    make_table_body(tasks, attr) {
        const $tbody = document.createElement('tbody');

        tasks.forEach((task) => {
            const $tr = document.createElement('tr');
            $tr.setAttribute('draggable', 'true');
            $tr.setAttribute('data-id', task.id);
            $.style($tr, attr);

            Object.keys(this.contents).forEach((content) => {
                const $td = document.createElement('td');
                $td.textContent = task[content];

                if (content === 'name' && task.level > 2) {
                    $td.className = `indent-${task.level - 2}`;
                }

                $tr.append($td);
            });

            if (task.parentId === 2) $tbody.setAttribute('data-id', task.id);

            $tr.addEventListener('dragstart', (e) => {
                e.target.classList.add('dragging');
            });
            $tr.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });

            $tbody.append($tr);
        });

        $tbody.classList.add('table-body');

        $tbody.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        $tbody.addEventListener('drop', async (e) => {
            e.preventDefault();
            let afterElement = null;
            let position = tasks.length;
            const targetEl = this.gantt.get_task(
                e.target.parentNode.getAttribute('data-id')
            );
            const draggable = document.querySelector('.dragging');
            const dragEl = this.gantt.get_task(
                document.querySelector('.dragging').getAttribute('data-id')
            );

            if (targetEl.parentId !== 2) {
                afterElement = this.get_drag_after_element($tbody, e.clientY);
                position = this.gantt.get_task(
                    afterElement.getAttribute('data-id')
                ).position;
            }

            await this.handler({
                c_id: dragEl.id,
                ref: $tbody.getAttribute('data-id'),
                c_position: position,
                p_position: dragEl.position,
                p_parentId: dragEl.parentId,
            });

            $tbody.insertBefore(draggable, afterElement);
        });

        return $tbody;
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
}
