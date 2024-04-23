var BatchManualControlApi = (function () {
		"use strict";

		const base_url = "/auth-sche/schedule";

		var batch_url_list = [
			'/server_info_backup',
			'/reqissue_es_store',
			'/increment/reqissue_es_store',
			'/issue_es_load'
		];

	function getBatchNumFrom_id(id) {
		let match = id.match(/(\d+)$/);
		console.log("[BatchManualControlApi :: getStepNumFrom_id] :: match[1] => " + match[1]);

		if(match) {
			return match[1];
		}

	}

	function stepEventListenerStart() {
		$("#execute-btn-groups button").on("click", function (event) {
			console.log($(this));
			let btn_id = $(this).attr("id");
			let step_num = getBatchNumFrom_id(btn_id);
			executeBatch(step_num);
		});
	}

	function executeBatch(batch_num) {

		let request_url = base_url + batch_url_list[batch_num-1]; // index는 0 부터 시작이므로
		console.log("[BatchManualControlApi :: executeBatch] :: Batch"+(batch_num)+" 실행. requestUrl => "+ request_url);
		$.ajax({
			url: request_url,
			type: "get",
			contentType: "application/json;charset=utf-8",
			data: "json",
			statusCode: {
				200: function (data) {
					// url
					console.log("[BatchManualControlApi :: executeBatch] :: Batch"+(batch_num)+" 결과 => "+data);
					jSuccess("Batch "+(batch_num)+" 실행이 완료 되었습니다.");
				}
			},
			error: function (e) {
				console.error('[BatchManualControlApi :: executeBatch] :: Batch'+ (batch_num) +' 에러내용');
				console.error(e);
				jError("Batch "+(batch_num)+" 실행 중 에러가 발생했습니다.");
			}
		});
	}

	return {
		stepEventListenerStart
	}
})(); //즉시실행 함수