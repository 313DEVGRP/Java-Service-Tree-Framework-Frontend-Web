import { $ } from './svg_utils';

export default class Split {
    constructor(wrapper) {
        this.draw_split_bar(wrapper);
    }

    draw_split_bar(elem) {
        const $split_bar = document.createElement('div');
        $split_bar.classList.add('split-bar');

        let x = 0;

        const mouseDownHandler = function (e) {
            x = e.clientX;

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function (e) {
            const $table = $split_bar.previousElementSibling;
            const $gantt = $split_bar.nextSibling;

            const dx = e.clientX - x;
            const left = Math.max(
                0,
                Math.min($split_bar.offsetLeft + dx, elem.clientWidth)
            );

            $.style($split_bar, { left: `${left}px` });
            $.style($table, { 'flex-basis': `${left}px` });
            $.style($gantt, { 'flex-basis': `${elem.clientWidth - left}px` });

            x = e.clientX;
        };

        const mouseUpHandler = function () {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        $split_bar.addEventListener('mousedown', mouseDownHandler);

        elem.prepend($split_bar);
    }
}
