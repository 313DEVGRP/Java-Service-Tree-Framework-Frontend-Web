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

    if (message.indexOf("Engine]") >= 0){
        Messenger().post({
            message: message,
            type: 'success',
            showCloseButton: true
        });
    }

    if (message.indexOf("Server]") >= 0){
        $(".notifications.pull-right").addClass("alert-created");
        const alertDiv = $('<div/>').addClass('alert pull-right');
        const closeButton = $('<a/>').addClass('close').attr('data-dismiss', 'alert').text('×');
        const infoIcon = $('<i/>').addClass('fa fa-info-circle').css("color","#a4c6ff").css('margin-right', '5px').css('vertical-align','middle');
        alertDiv.append(closeButton, infoIcon, lastMessage.message);
        $(".notifications.pull-right .alert").remove();
        $(".notifications.pull-right").append(alertDiv);
    }

}

function dwr_login(userId,username){
    dwr.engine.setActiveReverseAjax(true);
    dwr.engine.setNotifyServerOnPageUnload(true);
    dwr.engine.setErrorHandler(function () {
        Messenger().post({
            message: "서버와의 실시간 네트워크 통신에 문제를 감지했습니다. ( 재시도 합니다 )",
            type: 'error',
            showCloseButton: true
        });
    });
    Chat.login(userId,username);

    buildMessage();
}

function buildMessage() {
    var theme = 'air';

    $.globalMessenger({ theme: theme });
    Messenger.options = { theme: theme  };

    //Messenger().post("Thanks for checking out Messenger!");


    var loc = ['bottom', 'right'];

    var $lsel = $('.location-selector');

    var update = function(){
        var classes = 'messenger-fixed';

        for (var i=0; i < loc.length; i++)
            classes += ' messenger-on-' + loc[i];

        $.globalMessenger({ extraClasses: classes, theme: theme  });
        Messenger.options = { extraClasses: classes, theme: theme };
    };

    update();

}