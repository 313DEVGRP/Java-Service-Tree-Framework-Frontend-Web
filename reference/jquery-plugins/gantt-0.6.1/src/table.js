import { $ } from './svg_utils';

export default class Table {
    constructor(contents) {
        this.setup_contents(contents);
    }

    setup_contents(contents) {
        const default_contents = {
            start: 'Start',
            end: 'End',
            name: 'Title',
        };
        this.contents = { ...default_contents, ...contents };
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

        $.style($thead, attr);

        return $thead;
    }
}
