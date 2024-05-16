var DashboardApi = (function () {
	"use strict";

	// 버전정보 - gauge, timeLine
	var version_info;

	var setVersionInfo = function (result) {
		version_info = result;
	}

	var getVersionInfo = function () {
		return version_info;
	}

	var versionPeriod = function (pdServiceVersionLinks) {
		return new Promise((resolve, reject) => {
			if(pdServiceVersionLinks && pdServiceVersionLinks.length > 0) {
				$.ajax({
					url: "/auth-user/api/arms/pdServiceVersion/getVersionListBy.do",
					data: {c_ids: pdServiceVersionLinks},
					type: "GET",
					contentType: "application/json;charset=UTF-8",
					dataType: "json",
					progress: true,
					async:false,
					statusCode: {
						200: function (result) {
							console.log("[ dashboardApi :: versionPeriod ] :: result");
							console.log(result);
							setVersionInfo(result); // 버전 정보 세팅 -> 게이지 & 타임라인 차트 이용위해.
							checkTimeStatus(result); // 일정 현황
							resolve();
						}
					}
				});
			}
		});
	};

	// 타임일정 세팅
	function checkTimeStatus (version_infos) {
			const currentDate = new date();
			if(version_infos && version_infos.length !== 0) {
				timeStatus["total_version"] = version_infos.length;

				version_infos.forEach(version => {
					const startDate = version.c_pds_version_start_date === "start" ? "start" : new Date(version.c_pds_version_start_date);
					const endDate = version.c_pds_version_end_date === "end" ? "end" : new Date(version.c_pds_version_end_date);
					if (startDate === "start" || endDate === "end") {
						timeStatus["unknown_version"]++;
					} else if (isDateInRange(currentDate, startDate, endDate)) {
						timeStatus["current_version"]++;
					} else if (currentDate > endDate) {
						timeStatus["past_version"]++;
					} else if (currentDate < startDate) {
						timeStatus["upcoming_version"]++;
					}
				});
			} else {
				console.log("[ dashboardApi :: checkTimeStatus ] :: 버전 정보가 없거나 유효하지 않습니다.");
			}
	}

	function isDateInRange(date, start, end) {
		return date >= start && date <= end;
	}

	let timeStatus = {
			"total_version" : 0,
			"past_version" : 0,
			"current_version" : 0,
		  "upcoming_version": 0,
		  "unknown_version" : 0 // 일정 정보가 날짜가 아님("start" ,"end" 일 경우.)
	}
	
	function 대시보드_톱메뉴_세팅() {
		// 일정 현황
		$("#total_version").val(timeStatus["total_version"]);
		$("#past_version").val(timeStatus["past_version"]);
		$("#current_version").val(timeStatus["current_version"]);
		$("#upcoming_version").val(timeStatus["upcoming_version"]);
		if(timeStatus["unknown_version"] > 0) { // 보여줄 방법 세팅해야함.
			$("#unknown_version").val(timeStatus["unknown_version"]); // 일정이 정해지지 않은 버전 수
		}
		
		// 범휘 현황


		// 자원 현황

	}

	return {
		getVersionInfo, // 버전정보
		대시보드_톱메뉴_세팅
	}
})(); //즉시실행 함수