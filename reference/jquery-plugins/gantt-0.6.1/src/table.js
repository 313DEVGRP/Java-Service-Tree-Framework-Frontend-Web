import { $ } from './svg_utils';

export default class Table {
    constructor(wrapper) {
        this.setup_wrapper(wrapper);
    }

    setup_wrapper(element) {
        if (typeof element === 'string') {
            element = $(element);
        }

        if (element instanceof HTMLElement) {
            this.$wrapper = element;
        } else {
            throw new TypeError(
                'Frappé Gantt only supports usage of a string CSS selector,' +
                    " HTML DOM element or SVG DOM element for the 'element' parameter"
            );
        }
    }

    draw() {
        this.$table = document.createElement('table');
        this.$table.classList.add('table-wrapper');

        this.$table_head = document.createElement('thead');
        this.$table_head.classList.add('table-header');

        this.$table_body = document.createElement('tbody');
        this.$table_body.classList.add('table-body');

        this.$table.append(this.$table_head);
        this.$table.append(this.$table_body);
        this.$wrapper.append(this.$table);
    }
}
