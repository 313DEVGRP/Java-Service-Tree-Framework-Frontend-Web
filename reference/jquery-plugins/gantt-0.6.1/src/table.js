import { $ } from './svg_utils';

export default class Table {
    constructor(contents) {
        this.setup_contents(contents);
    }

    setup_contents(contents) {
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
        const $tbody = document.createElement('tbody');

        tasks.forEach((task) => {
            const $tr = document.createElement('tr');
            $.style($tr, attr);

            Object.keys(this.contents).forEach((content) => {
                const $td = document.createElement('td');
                $td.textContent = task[content];

                if (content === 'name' && task.level > 2) {
                    $td.className = `indent-${task.level}`;
                }

                $tr.append($td);
            });

            $tbody.append($tr);
        });

        $tbody.classList.add('table-body');

        return $tbody;
    }
}
