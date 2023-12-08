////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////

// 절대로 armsDetailExceptTemplate 폴더안에 있는 파일 사용하지 마세요
// armsDetailExceptTemplate 폴더를 삭제할 예정입니다.

function execDocReady() {
	var pluginGroups = [
		[
			"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js",
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js"
		]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			console.log("모든 플러그인 로드 완료");

			//좌측 메뉴
			$(".widget").widgster();
			setSideMenu("sidebar_menu_product", "sidebar_menu_qna");
			// 스크립트 실행 로직을 이곳에 추가합니다.

			$(".slimScrollDiv").slimScroll({
				height: "550px",
				railVisible: true,
				railColor: "#222",
				railOpacity: 0.3,
				wheelStep: 10,
				allowPageScroll: false,
				disableFadeOut: false
			});

			init();
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

function init() {
	const chatList = [
		{
			type: true,
			imageUrl: "img/313.png",
			regDt: "2",
			name: "313",
			content: "무엇을 도와 드릴까요?"
		},
		{
			type: false,
			imageUrl: "img/community_devtool/github.png",
			regDt: "3",
			name: "User name",
			content: "user input caht message content"
		},
		{
			type: true,
			imageUrl: "img/313.png",
			regDt: "4",
			name: "313",
			content: "answer caht message content"
		},
		{
			type: false,
			imageUrl: "img/community_devtool/github.png",
			regDt: "5",
			name: "User name",
			content: "user input caht message content"
		},
		{
			type: true,
			imageUrl: "img/313.png",
			regDt: "6",
			name: "313",
			content: "answer caht message content"
		},
		{
			type: false,
			imageUrl: "img/community_devtool/github.png",
			regDt: "7",
			name: "User name",
			content: "user input caht message content"
		},
		{
			type: true,
			imageUrl: "img/313.png",
			regDt: "8",
			name: "313",
			content: "answer caht message content"
		},
		{
			type: false,
			imageUrl: "img/community_devtool/github.png",
			regDt: "9",
			name: "User name",
			content: "user input caht message content"
		},
		{
			type: true,
			imageUrl: "img/313.png",
			regDt: "10",
			name: "313",
			content: "문의 사항을 얘기해 주세요"
		}
	];

	chatList.forEach((message) => makeTemplate(message));
}

function makeTemplate(item) {
	const wrap = document.getElementById("chat_messages");
	const message = document.createElement("div");
	message.className = "chat-message";
	message.innerHTML = `
      <div class="sender ${item.type ? "pull-left" : "pull-right"}">
        <div class="icon">
          <img src="${item.imageUrl}" class="img-circle" alt="" />
        </div>
        <div class="time">${item.regDt}</div>
      </div>
      <div class="chat-message-body ${item.type ? "" : "on-left"}">
        <span class="arrow"></span>
        <div class="sender"><a href="#">${item.name}</a></div>
        <div class="text">${item.content}</div>
      </div>
    `;

	wrap.append(message);
}

function sendMessage(e) {
	const message = document.getElementById("new_message").value;

	if (!message) return;

	makeTemplate({
		type: false,
		imageUrl: "img/community_devtool/github.png",
		regDt: "9999",
		name: userName,
		content: message
	});
}
