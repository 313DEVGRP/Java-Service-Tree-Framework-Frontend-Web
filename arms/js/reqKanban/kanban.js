const KanbanBoard = (() => {

    let kanban = null;

    // 칸반 보드 초기화
    const initKanban = (elementId, data) => {

        $('#' + elementId).empty();

        kanban = new jKanban({
            element: '#' + elementId,       // 보드 아이디
            gutter  : '15px',               // 보드 간 간격
            responsivePercentage: true,     // 반응형 여부
            dragBoards: false,              // 보드 drag 가능 여부
            boards: data                    // 보드 데이터
        });
    };

    return {
        init: (elementId, data) => {
            initKanban(elementId, data);
        }
    }

})();