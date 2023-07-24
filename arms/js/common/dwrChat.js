document.write('<script type="text/javascript" src="/dwr/engine.js"></script>');
document.write('<script type="text/javascript" src="/dwr/util.js"></script>');
document.write('<script type="text/javascript" src="/dwr/interface/Chat.js"></script>');

const makeSaveChatHistory = () => {
    const chat_history = [];
    return (userId, username, message, time) => {
        chat_history.push({ userId, username, message, time });
        if (chat_history.length > 10) {
            chat_history.shift(); // 첫 번째 요소 제거 (가장 오래된 메시지)
        }
        console.log("chatHistory -> " + JSON.stringify(chat_history));
        return chat_history;
    };
};

const saveChatHistory = makeSaveChatHistory();

function dwr_callback(userId, username, message, time) {
    const lastMessage = { userId, username, message, time };
    saveChatHistory(userId, username, message, time);

    $(".notifications.pull-right").addClass("alert-created");
    const alertDiv = $('<div/>').addClass('alert pull-right');
    const closeButton = $('<a/>').addClass('close').attr('data-dismiss', 'alert').text('×');
    const infoIcon = $('<i/>').addClass('fa fa-info-circle').css('margin-right', '5px');
    alertDiv.append(closeButton, infoIcon, lastMessage.message);
    $(".notifications.pull-right .alert").remove();
    $(".notifications.pull-right").append(alertDiv);
}

function dwr_login(userId,username){
    dwr.engine.setActiveReverseAjax(true);
    dwr.engine.setNotifyServerOnPageUnload(true);
    dwr.engine.setErrorHandler(function () {
        console.log("DWR Error");
    });
    Chat.login(userId,username);

}
