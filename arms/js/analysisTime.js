///////////////////
//Page 전역 변수
///////////////////
var dashboardColor;
var selectedPdServiceId;
var selectedVersionId;
var versionListData;
var globalDeadline;
// 최상단 메뉴 변수
var req_state, resource_info, issue_info, period_info, total_days_progress;
// 필요시 작성

////////////////////////////////////////////////////////////////////////////////////////
//Document Ready
////////////////////////////////////////////////////////////////////////////////////////
function execDocReady() {
	var pluginGroups = [
		[
			"../reference/light-blue/lib/vendor/jquery.ui.widget.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
			"../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
			"../reference/light-blue/lib/jquery.iframe-transport.js",
			// echarts
			"../reference/jquery-plugins/echarts-5.4.3/dist/echarts.min.js",
			// d3(게이지 차트 사용)
			"../reference/jquery-plugins/d3-5.16.0/d3.min.js",
			// chart Colors
			"./js/common/colorPalette.js",
			// 최상단 메뉴
			"js/analysis/topmenu/topMenuApi.js",
			"js/analysis/topmenu/basicRadar.js",
			// 버전 timeline js, css
			"./js/analysis/time/D_analysisTime.js",
			"./js/analysis/time/timeline_analysisTime.js",
			"./js/dashboard/chart/infographic_custom.css",
			// 히트맵 사용 js, css
			"./js/analysis/time/calendar_yearview_blocks_analysisTime.js",
			"../reference/jquery-plugins/github-calendar-heatmap/css/calendar_yearview_blocks.css",
		],

		[
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
			"../reference/jquery-plugins/unityping-0.1.0/dist/jquery.unityping.min.js",
			"../reference/light-blue/lib/bootstrap-datepicker.js",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.min.css",
			"../reference/jquery-plugins/datetimepicker-2.5.20/build/jquery.datetimepicker.full.min.js",
			"../reference/lightblue4/docs/lib/widgster/widgster.js"
		],

		[
			"../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
			"../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
			"../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
			"../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
		],

		[
			"../reference/jquery-plugins/dataTables-1.10.16/media/css/jquery.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/css/responsive.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/css/select.dataTables_lightblue4.css",
			"../reference/jquery-plugins/dataTables-1.10.16/media/js/jquery.dataTables.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Responsive/js/dataTables.responsive.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Select/js/dataTables.select.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/RowGroup/js/dataTables.rowsGroup.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/dataTables.buttons.min.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.html5.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/buttons.print.js",
			"../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/jszip.min.js"
		]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			console.log("모든 플러그인 로드 완료");

			//vfs_fonts 파일이 커서 defer 처리 함.
			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/vfs_fonts.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 5000); // 5초 후에 실행됩니다.

			//pdfmake 파일이 커서 defer 처리 함.
			setTimeout(function () {
				var script = document.createElement("script");
				script.src = "../reference/jquery-plugins/dataTables-1.10.16/extensions/Buttons/js/pdfmake.min.js";
				script.defer = true; // defer 속성 설정
				document.head.appendChild(script);
			}, 5000); // 5초 후에 실행됩니다.

			// 사이드 메뉴 처리
			$(".widget").widgster();
			setSideMenu("sidebar_menu_analysis", "sidebar_menu_analysis_time");

			//제품(서비스) 셀렉트 박스 이니시에이터
			makePdServiceSelectBox();

			//버전 멀티 셀렉트 박스 이니시에이터
			makeVersionMultiSelectBox();

			// 높이 조정
			$('.top-menu-div').matchHeight({
				target: $('.top-menu-div-scope')
			});

			// candleStickChart();
			dashboardColor = dashboardPalette.dashboardPalette01;

		})
		.catch(function (error) {
			console.error("플러그인 로드 중 오류 발생" + error);
		});
}

///////////////////////
//제품 서비스 셀렉트 박스
//////////////////////
function makePdServiceSelectBox() {
	//제품 서비스 셀렉트 박스 이니시에이터
	$(".chzn-select").each(function () {
		$(this).select2($(this).data());
	});

	//제품 서비스 셀렉트 박스 데이터 바인딩
	$.ajax({
		url: "/auth-user/api/arms/pdService/getPdServiceMonitor.do",
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				//////////////////////////////////////////////////////////
				for (let k in data.response) {
					let obj = data.response[k];
					let newOption = new Option(obj.c_title, obj.c_id, false, false);
					$("#selected_pdService").append(newOption).trigger("change");
				}
			}
		}
	});

	$("#selected_pdService").on("select2:open", function () {
		//슬림스크롤
		makeSlimScroll(".select2-results__options");
	});

	// --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
	$("#selected_pdService").on("select2:select", function (e) {
		// 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
		// 디폴트는 base version 을 선택하게 하고 ( select all )
		//~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
		dateTimePickerBinding();

		dailyChartDataSearchEvent();

		baseDateReset();

		bind_VersionData_By_PdService();

		let checked = $("#checkbox1").is(":checked");
		let endPointUrl = "";

		//        if (checked) {
		//            endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=true";
		//        } else {
		//            endPointUrl = "/T_ARMS_REQSTATUS_" + $("#selected_pdService").val() + "/getStatusMonitor.do?disable=false";
		//        }
		console.log("[ analysisTime :: makePdServiceSelectBox ] :: 선택된 제품(서비스) c_id = " + $("#selected_pdService").val());

	});
} // end makePdServiceSelectBox()

function bind_VersionData_By_PdService() {
	$(".multiple-select option").remove();
	$.ajax({
		url: "/auth-user/api/arms/pdService/getVersionList.do?c_id=" + $("#selected_pdService").val(),
		type: "GET",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				console.log("[ analysisTime :: bind_VersionData_By_PdService ] :: 선택된 버전 데이터  = ");
				console.log(data.response); // versionData

				versionListData = data.response.reduce((obj, item) => {
					obj[item.c_id] = item;
					return obj;
				}, {});

				let pdServiceVersionIds = [];
				for (let k in data.response) {
					let obj = data.response[k];
					pdServiceVersionIds.push(obj.c_id);
					let newOption = new Option(obj.c_title, obj.c_id, true, false);
					$(".multiple-select").append(newOption);
				}

				selectedPdServiceId = $("#selected_pdService").val();
				selectedVersionId = pdServiceVersionIds.join(",");

				if (!selectedPdServiceId || selectedPdServiceId === null || selectedPdServiceId === undefined || selectedPdServiceId === "") {
					return;
				}
				baseDateReset();

				// 최상단 메뉴 세팅
				TopMenuApi.톱메뉴_초기화();
				TopMenuApi.톱메뉴_세팅();


				// 버전 및 게이지차트, 버전 타임라인 차트 초기화
				statisticsMonitor(selectedPdServiceId, selectedVersionId);

				// 히트맵 차트 초기화
				calendarHeatMap(selectedPdServiceId, selectedVersionId);

				// 요구사항 및 연결된 이슈 생성 누적 개수 및 업데이트 상태 현황 멀티 스택바 차트
				dailyUpdatedStatusScatterChart(selectedPdServiceId, selectedVersionId);
				dailyCreatedCountAndUpdatedStatusesMultiStackCombinationChart(selectedPdServiceId, selectedVersionId);

				// vertical timeline chart
				//verticalTimeLineChart(selectedPdServiceId, selectedVersionId, 1);

				timeLineChart(selectedPdServiceId, selectedVersionId);

				if (data.length > 0) {
					console.log("display 재설정.");
				}
				//$('#multiversion').multipleSelect('refresh');
				//$('#edit_multi_version').multipleSelect('refresh');
				$(".multiple-select").multipleSelect("refresh");
				//////////////////////////////////////////////////////////
			}
		}
	});
}

////////////////////
//버전 멀티 셀렉트 박스
////////////////////
function makeVersionMultiSelectBox() {
	//버전 선택시 셀렉트 박스 이니시에이터
	$(".multiple-select").multipleSelect({
		filter: true,
		onClose: function () {
			console.log("[ analysisTime :: makeVersionMultiSelectBox ] :: onOpen event fire!\n");

			let checked = $("#checkbox1").is(":checked");
			let endPointUrl = "";
			let versionTag = $(".multiple-select").val();

			if (!versionTag || versionTag === null || versionTag === undefined || versionTag === "" || versionTag.length === 0) {
				alert("버전이 선택되지 않았습니다.");
				return;
			}

			selectedPdServiceId = $("#selected_pdService").val();
			selectedVersionId = versionTag.join(",");

			if (selectedPdServiceId === null || selectedPdServiceId === undefined || selectedPdServiceId === "") {
				return;
			}

			baseDateReset();

			// 최상단 메뉴 통계
			TopMenuApi.톱메뉴_초기화();
			TopMenuApi.톱메뉴_세팅();

			// 버전 및 게이지차트, 버전 타임라인 차트 초기화
			statisticsMonitor(selectedPdServiceId, selectedVersionId);

			// 히트맵 차트 초기화
			calendarHeatMap(selectedPdServiceId, selectedVersionId);

			// 요구사항 및 연결된 이슈 생성 누적 개수 및 업데이트 상태 현황 멀티 스택바 차트
			dailyUpdatedStatusScatterChart(selectedPdServiceId, selectedVersionId);
			dailyCreatedCountAndUpdatedStatusesMultiStackCombinationChart(selectedPdServiceId, selectedVersionId);

			// getRelationJiraIssueByPdServiceAndVersions(selectedPdServiceId, selectedVersionId);

			// timeline chart
			timeLineChart(selectedPdServiceId, selectedVersionId);

		}
	});
}

function dateTimePickerBinding() {
	let today = new Date();
	$('#scatter_start_date').datetimepicker({
		theme:'dark',
		onShow: function(ct) {
			this.setOptions({
				maxDate: $('#scatter_end_date').val()?$('#scatter_end_date').datetimepicker('getValue'):false
			})
		},
		timepicker: false,
		format: 'Y-m-d',
		onSelectDate: function(ct, $i) {
			var startDate = $('#scatter_start_date').datetimepicker('getValue');
			var endDate = $('#scatter_end_date').datetimepicker('getValue');
			var dayDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);

			if (dayDifference > 31) {
				alert('시작일과 종료일의 차이는 최대 30일입니다.');
				var newDate = new Date(endDate);
				newDate.setDate(endDate.getDate() - 30);
				$i.val(formatDate(newDate));
			}
		},
	});

	$('#scatter_end_date').datetimepicker({
		theme:'dark',
		onShow: function(ct) {
			this.setOptions({
				// minDate: $('#scatter_start_date').val()?$('#scatter_start_date').datetimepicker('getValue'):false,
				maxDate: today
			})
		},
		timepicker: false,
		format: 'Y-m-d',
		onSelectDate: function(ct, $i) {
			var startDate = $('#scatter_start_date').datetimepicker('getValue');
			var endDate = $('#scatter_end_date').datetimepicker('getValue');
			var dayDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);

			if (dayDifference > 31) {
				alert('시작일과 종료일의 차이는 최대 30일입니다.');
				var newDate = new Date(startDate);
				newDate.setDate(startDate.getDate() + 30);
				$i.val(formatDate(newDate));
			}
		},
		// onClose: onScatterChartDateEndChanged
	});

	$('#multi_stack_start_date').datetimepicker({
		theme:'dark',
		onShow: function(ct) {
			this.setOptions({
				maxDate: $('#multi_stack_end_date').val()?$('#multi_stack_end_date').datetimepicker('getValue'):false
			})
		},
		timepicker: false,
		format: 'Y-m-d',
		onSelectDate: function(ct, $i) {
			var startDate = $('#multi_stack_start_date').datetimepicker('getValue');
			var endDate = $('#multi_stack_end_date').datetimepicker('getValue');
			var dayDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);

			if (dayDifference > 31) {
				alert('시작일과 종료일의 차이는 최대 30일입니다.');
				var newDate = new Date(endDate);
				newDate.setDate(endDate.getDate() - 30);
				$i.val(formatDate(newDate));
			}
		}
	});

	$('#multi_stack_end_date').datetimepicker({
		theme:'dark',
		onShow: function(ct) {
			this.setOptions({
				// minDate: $('#multi_stack_start_date').val()?$('#multi_stack_start_date').datetimepicker('getValue'):false,
				maxDate: today
			})
		},
		timepicker: false,
		format: 'Y-m-d',
		onSelectDate: function(ct, $i) {
			var startDate = $('#multi_stack_start_date').datetimepicker('getValue');
			var endDate = $('#multi_stack_end_date').datetimepicker('getValue');
			var dayDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);

			if (dayDifference > 31) {
				alert('시작일과 종료일의 차이는 최대 30일입니다.');
				var newDate = new Date(startDate);
				newDate.setDate(startDate.getDate() + 30);
				$i.val(formatDate(newDate));
			}
		},
		// onClose: onMultiStackChartDateEndChanged
	});

    $('#timeline_start_date').datetimepicker({
		theme:'dark',
		onShow: function(ct) {
			this.setOptions({
				maxDate: $('#timeline_end_date').val()?$('#timeline_end_date').datetimepicker('getValue'):false
			})
		},
		timepicker: false,
		format: 'Y-m-d',
		onSelectDate: function(ct, $i) {
			var startDate = $('#timeline_start_date').datetimepicker('getValue');
			var endDate = $('#timeline_end_date').datetimepicker('getValue');
			//var dayDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);
            var monthDifference = endDate.getMonth() - startDate.getMonth() +
                     (12 * (endDate.getFullYear() - startDate.getFullYear()));


			if (monthDifference > 6) {
				alert('시작일과 종료일의 차이는 최대 6개월입니다.');
				var newDate = new Date(endDate);
				//newDate.setDate(endDate.getDate() - 30);
				newDate.setMonth(endDate.getMonth() - 6);
				$i.val(formatDate(newDate));
			}
		}
	});

	$('#timeline_end_date').datetimepicker({
		theme:'dark',
		onShow: function(ct) {
			this.setOptions({
				// minDate: $('#timeline_start_date').val()?$('#timeline_start_date').datetimepicker('getValue'):false,
				maxDate: today
			})
		},
		timepicker: false,
		format: 'Y-m-d',
		onSelectDate: function(ct, $i) {
			var startDate = $('#timeline_start_date').datetimepicker('getValue');
			var endDate = $('#timeline_end_date').datetimepicker('getValue');
			//var dayDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);
            var monthDifference = endDate.getMonth() - startDate.getMonth() +
                     (12 * (endDate.getFullYear() - startDate.getFullYear()));
			if (monthDifference > 6) {
				alert('시작일과 종료일의 차이는 최대 6개월입니다.');
				var newDate = new Date(startDate);
				newDate.setMonth(startDate.getMonth() + 6);
				$i.val(formatDate(newDate));
			}
		},
		// onClose: onMultiStackChartDateEndChanged
	});
}

function baseDateReset() {
	globalDeadline = undefined;

	let today = new Date();

    $("#scatter_end_date").val(formatDate(today));
    $("#multi_stack_end_date").val(formatDate(today));
    $("#timeline_end_date").val(formatDate(today));

    let aMonthAgo = new Date();
    aMonthAgo.setDate(today.getDate() - 30);

    $("#scatter_start_date").val(formatDate(aMonthAgo));
    $("#multi_stack_start_date").val(formatDate(aMonthAgo));
    $("#timeline_start_date").val(formatDate(aMonthAgo));
}

function waitForGlobalDeadline() {
	return new Promise(resolve => {
		let intervalId = setInterval(() => {
			if (globalDeadline !== undefined) {
				clearInterval(intervalId);
				resolve(globalDeadline);
			}
		}, 100);  // 100ms마다 globalDeadline 값 확인
	});
}

function formatDate(date) {
	var year = date.getFullYear();
	var month = (date.getMonth() + 1).toString().padStart(2, "0");
	var day = date.getDate().toString().padStart(2, "0");
	return year + "-" + month + "-" + day;
}

function statisticsMonitor(pdservice_id, pdservice_version_id) {
	console.log("[ analysisTime :: statisticsMonitor ] :: 선택된 서비스 ===> " + pdservice_id);
	console.log("[ analysisTime :: statisticsMonitor ] :: 선택된 버전 리스트 ===> " + pdservice_version_id);

	//1. 좌상 게이지 차트 및 타임라인
	//2. Time ( 작업일정 ) - 버전 개수 삽입
	$.ajax({
		url: "/auth-user/api/arms/pdService/getNodeWithVersionOrderByCidDesc.do?c_id=" + pdservice_id,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (json) {
				let versionData = json.pdServiceVersionEntities;
				versionData.sort((a, b) => a.c_id - b.c_id);
				let version_count = versionData.length;

				console.log("[ analysisTime :: statisticsMonitor ] :: 등록된 버전 개수 = " + version_count);

				if (version_count !== undefined) {
					$("#version_prgress").text(version_count);

					if (version_count >= 0) {
						let today = new Date();

						$("#notifyNoVersion").slideUp();
						$("#project-start").show();
						$("#project-end").show();

                        $("#versionGaugeChart").html(""); //게이지 차트 초기화
                        var versionGauge = [];
                        var versionTimeline = [];
                        var versionCustomTimeline = [];
                        versionData.forEach(function (versionElement, idx) {
                            if (pdservice_version_id.includes(versionElement.c_id)) {
                                var gaugeElement = {
                                    "current_date": today.toString(),
                                    "version_name": versionElement.c_title,
                                    "version_id": versionElement.c_id,
                                    "start_date": (versionElement.c_pds_version_start_date === "start" ? today : versionElement.c_pds_version_start_date),
                                    "end_date": (versionElement.c_pds_version_end_date === "end" ? today : versionElement.c_pds_version_end_date)
                                }
                                versionGauge.push(gaugeElement);
                            }
                            var timelineElement = {
                                "id" : versionElement.c_id,
                                "title" : "버전: "+versionElement.c_title,
                                "startDate" : (versionElement.c_pds_version_start_date === "start" ? today : versionElement.c_pds_version_start_date),
                                "endDate" : (versionElement.c_pds_version_end_date === "end" ? today : versionElement.c_pds_version_end_date)
                            };

                            versionTimeline.push(timelineElement);
                            var versionTimelineCustomData = {
                                "title" : versionElement.c_title,
                                "startDate" : (versionElement.c_pds_version_start_date === "start" ? today : versionElement.c_pds_version_start_date),
                                "endDate" : (versionElement.c_pds_version_end_date === "end" ? today : versionElement.c_pds_version_end_date)
                            };
                            versionCustomTimeline.push(versionTimelineCustomData);
                        });

						drawVersionProgress(versionGauge); // 버전 게이지
						// 이번 달의 첫째 날 구하기
						var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
						// 이번 달의 마지막 날 구하기
						var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
						// 이번달 일수 구하기
						var daysCount = lastDay.getDate();
						// 오늘 일자 구하기
						var day = today.getDate();

						var today_flag = {
							title: "오늘",
							startDate: formatDate(firstDay),
							endDate: formatDate(lastDay),
							id: "today_flag"
						};
						versionTimeline.push(today_flag);

                        $("#version-timeline-bar").show();
                        Timeline.init($("#version-timeline-bar"), versionTimeline);

						var basePosition = $("#today_flag").css("left");
						var baseWidth = $(".month").css("width");
						var calFlagPosition = (parseFloat(baseWidth) / daysCount) * day;
						var flagPosition = parseFloat(basePosition) + calFlagPosition + "px";

                        $("#today_flag").removeAttr("style");
                        $("#today_flag").removeClass("block");
                        $("#today_flag").css("position", "absolute");

						$("#today_flag").css("height", "170px");
                        $("#today_flag").css("bottom", "-35px");
						$("#today_flag span").remove();
						$(".block .label").css("text-align", "left");
						$("#today_flag").css("left", flagPosition);

                        $("#today_flag").css("position", "relative");
                        $("#today_flag").prepend("<div class='today_flag_text'>오늘</div>");

						 $("#today_flag").css("text-align", "center");

                        // 박스 위치 수정
						versionData.forEach(function(version) {
                            var id = version.c_id;
                            var start = new Date(version.c_pds_version_start_date);
                            var startDate = start.getDate();
                            var daysCount = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
                            var end = new Date(version.c_pds_version_end_date);

                            var pos = $("#"+id).css("left");
                            var baseWidth =(parseFloat($(".month").css("width")))/daysCount;
                            var diffTime = Math.abs(end - start);
                            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            var realWidth = baseWidth*diffDays
                            var realPos = parseFloat(pos)+ startDate*baseWidth;
                            $("#"+id).css("left",realPos+"px");
                            $("#"+id).css("width",realWidth+"px");
                        });
                        window.addEventListener("resize", $("#version-timeline-bar").width);
					}
				}
			}
		}
	});
}

////////////////////
// 두번째 박스
////////////////////
async function drawVersionProgress(data) {
	var Needle,
		arc,
		arcEndRad,
		arcStartRad,
		barWidth, // 색션의 두께
		chart,
		chartInset, // 가운데로 들어간 정도
		el,
		endPadRad,
		height,
		i,
		margin, // 차트가 그려지는 위치 마진
		needle, // 침
		numSections, // 색션의 수
		padRad,
		percToDeg,
		percToRad,
		degToRad, // 고정
		percent,
		radius, // 반지름
		ref,
		sectionIndx, // 색션 인덱스
		sectionPerc, // 색션의 퍼센트
		startPadRad,
		svg,
		totalPercent,
		width,
		versionId,
		versionName,
		waveName;

	// percent = 0.55;
	barWidth = 25;
	padRad = 0;
	chartInset = 11;
	totalPercent = 0.75;

	margin = {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};

	width = 220;
	height = width;
	radius = Math.min(width, height) / 2.5;

	// percToDeg percToRad degToRad 고정
	percToDeg = function (perc) {
		return perc * 360;
	};

	percToRad = function (perc) {
		return degToRad(percToDeg(perc));
	};

	degToRad = function (deg) {
		return (deg * Math.PI) / 180;
	};

	svg = d3
		.select("#versionGaugeChart")
		.append("svg")
		.attr("viewBox", [70, 10, width - 150, height - 100])
		.append("g");

	chart = svg
		.append("g")
		.attr("transform", "translate(" + (width + margin.left) / 2 + ", " + (height + margin.top) / 2 + ")");

	var tooltip = d3
		.select("#versionGaugeChart")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("color", "black")
		.style("padding", "10px");

	var arc = d3
		.arc()
		.innerRadius(radius * 0.6)
		.outerRadius(radius);

	var outerArc = d3
		.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	var totalDate;

	numSections = data.length; // 전체 색션의 수(버전의 수)
	sectionPerc = 1 / numSections / 2; //  '/ 2' for Half-circle

	var fastestStartDate;
	var latestEndDate;
	// 가장 빠른날짜, 가장 느린날짜 세팅
	for (var idx = 0; idx < data.length; idx++) {
		if (idx === 0) {
			fastestStartDate = data[idx].start_date;
			latestEndDate = data[idx].end_date;
		} else {
			if (data[idx].start_date < fastestStartDate) {
				fastestStartDate = data[idx].start_date;
			}
			if (data[idx].end_date > latestEndDate) {
				latestEndDate = data[idx].end_date;
			}
		}
	}

	globalDeadline = formatDate(new Date(latestEndDate));
	console.log("[ analysisTime :: globalDeadline ] :: globalDeadline = " + globalDeadline);

	$("#fastestStartDate").text(new Date(fastestStartDate).toLocaleDateString());
	$("#latestEndDate").text(new Date(latestEndDate).toLocaleDateString());

	const today = new Date(data[0].current_date);
	today.setHours(0, 0, 0, 0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

	// 시작일과 종료일은 'YYYY-MM-DD' 형식의 문자열로 가정
	const startDate = new Date(fastestStartDate);
	startDate.setHours(0, 0, 0, 0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

	const endDate = new Date(latestEndDate);
	endDate.setHours(0, 0, 0, 0); //시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

	var diffStart = (today - startDate) / (1000 * 60 * 60 * 24); // 오늘 날짜와 시작일 사이의 차이를 일 단위로 계산
	var diffEnd = (today - endDate) / (1000 * 60 * 60 * 24); // 오늘 날짜와 종료일 사이의 차이를 일 단위로 계산

	$("#startDDay").css("color", "");
	$("#endDDay").css("color", "");

	if (diffStart > 0) {
		$("#startDDay").text("D + " + diffStart);
	} else if (diffStart === 0) {
		$("#startDDay").text("D - day");
	} else {
		diffStart *= -1;
		$("#startDDay").text("D - " + diffStart);
	}

	if (diffEnd > 0) {
		$("#endDDay")
			.css("color", "#FF4D4D")
			.css("font-weight", "bold")
			.text("D + " + diffEnd)
			.append(" 초과");
	} else if (diffEnd === 0) {
		$("#endDDay").text("D - day");
	} else {
		diffEnd *= -1;
		$("#endDDay").text("D - " + diffEnd);
	}

	totalDate = Math.floor(Math.abs((new Date(latestEndDate) - new Date(fastestStartDate)) / (1000 * 60 * 60 * 24)) + 1);

    var mouseover = function (d) {
        var hoverData = d;
        var subgroupId = hoverData.version_id;
        var subgroupName = hoverData.version_name;
        var subgroupValue = new Date(hoverData.start_date).toLocaleDateString() + " ~ " + new Date(hoverData.end_date).toLocaleDateString();
        tooltip.html("버전명: " + subgroupName + "<br>" + "기간: " + subgroupValue).style("opacity", 1);

		d3.selectAll(".myWave").style("opacity", 0.2);
		d3.selectAll(".myStr").style("opacity", 0.2);
		d3.selectAll(".wave-" + subgroupId).style("opacity", 1);
	};

	var mousemove = function (d) {
		var [x, y] = d3.mouse(this);
		tooltip.style("left", (x + 120) + "px").style("top", (y + 150) + "px");
	};

	var mouseleave = function (d) {
		tooltip.style("opacity", 0);
		d3.selectAll(".myStr").style("opacity", 1);
		d3.selectAll(".myWave").style("opacity", 1);
	};

	for (sectionIndx = i = 1, ref = numSections; 1 <= ref ? i <= ref : i >= ref; sectionIndx = 1 <= ref ? ++i : --i) {
		arcStartRad = percToRad(totalPercent);
		arcEndRad = arcStartRad + percToRad(sectionPerc);
		totalPercent += sectionPerc;
		startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
		endPadRad = sectionIndx === numSections ? 0 : padRad / 2;
		versionId = data[sectionIndx - 1].version_id;
		versionName = data[sectionIndx - 1].version_name;

		var sectionData = data[sectionIndx - 1];

		var arc = d3
			.arc()
			.outerRadius(radius - chartInset)
			.innerRadius(radius - chartInset - barWidth)
			.startAngle(arcStartRad + startPadRad)
			.endAngle(arcEndRad - endPadRad);

		var section = chart.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionId);

		section
			.data([sectionData])
			.enter()
			.append("g")
			.attr("class", "arc chart-color" + sectionIndx + " myWave wave-" + versionId)
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave)
			.append("path")
			.attr("fill", function (d) {
				return dashboardColor.projectProgressColor[(sectionIndx - 1) % data.length];
			})
			.attr("stroke", "white")
			.style("stroke-width", "0.4px")
			.attr("d", arc);

		chart
			.selectAll(".arc.chart-color" + sectionIndx + ".myWave.wave-" + versionId)
			.append("text")
			.attr("class", "no-select")
			.text(function (d) {
				return getStrLimit(d.version_name, 9);
			})
			.attr("x", function (d) {
				return arc.centroid(d)[0];
			})
			.attr("y", function (d) {
				return arc.centroid(d)[1] + 2;
			})
			.style("font-size", "10px")
			.style("font-weight", "700")
			.attr("text-anchor", "middle");
	}

	Needle = (function () {
		function Needle(len, radius1) {
			this.len = len;
			this.radius = radius1;
		}

		Needle.prototype.drawOn = function (el, perc) {
			el.append("circle")
				.attr("class", "needle-center")
				.attr("cx", 0)
				.attr("cy", -10)
				.attr("r", this.radius)
				.attr("stroke", "white")
				.style("stroke-width", "0.3px");
			return el
				.append("path")
				.attr("class", "needle")
				.attr("d", this.mkCmd(perc))
				.attr("stroke", "white")
				.style("stroke-width", "0.3px");
		};

		Needle.prototype.animateOn = function (el, perc) {
			var self;
			self = this;
			return el
				.selectAll(".needle")
				.transition()
				.delay(500)
				.ease(d3.easeElasticOut)
				.duration(3000)
				.attrTween("progress", function () {
					return function (percentOfPercent) {
						var progress;
						progress = percentOfPercent * perc;
						return d3.select(".needle").attr("d", self.mkCmd(progress));
					};
				});
		};

		Needle.prototype.mkCmd = function (perc) {
			var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
			thetaRad = percToRad(perc / 2);
			centerX = 0;
			centerY = -10;
			topX = centerX - this.len * Math.cos(thetaRad);
			topY = centerY - this.len * Math.sin(thetaRad);
			leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
			leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
			rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
			rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
			return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
		};

		return Needle;
	})();

	needle = new Needle(35, 3);

	needle.drawOn(chart, 0);

	var needleAngle = (diffStart + 1) / totalDate;

	if (needleAngle > 1) {
		needleAngle = 1;
	} else if (needleAngle < 0) {
		needleAngle = 0;
	}

	needle.animateOn(chart, needleAngle);
}

////////////////////
// 히트맵 차트
////////////////////
function calendarHeatMap(pdServiceLink, pdServiceVersions) {
	$("#calendar_yearview_blocks_chart_1 svg").remove();
	$("#calendar_yearview_blocks_chart_2 svg").remove();

	$.ajax({
		url: "/auth-user/api/arms/analysis/time/heatmap",
		type: "GET",
		data: { pdServiceLink: pdServiceLink, pdServiceVersionLinks: pdServiceVersions },
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		async: true,
		statusCode: {
			200: function (data) {
				console.log("[ analysisTime :: calendarHeatMap ] :: 누적 업데이트 히트맵 차트데이터 = ");
				console.log(data);
				$(".update-title").show();

				$("#calendar_yearview_blocks_chart_1").calendar_yearview_blocks({
					data: JSON.stringify(data.requirement),
					start_monday: true,
					always_show_tooltip: true,
					month_names: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sept", "oct", "nov", "dec"],
					day_names: ["mon", "wed", "fri", "sun"]
					//colors: data.requirementColors
				});

				$("#calendar_yearview_blocks_chart_2").calendar_yearview_blocks({
					data: JSON.stringify(data.relationIssue),
					start_monday: true,
					always_show_tooltip: true,
					month_names: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
					day_names: ["mon", "wed", "fri", "sun"]
					//colors: data.relationIssueColors
				});

				// d3.select("#heatmap-body").style("overflow-x","scroll");
			}
		}
	});
}

////////////////////
// 스캐터 차트
////////////////////
async function dailyUpdatedStatusScatterChart(pdServiceLink, pdServiceVersionLinks) {

	let deadline = await waitForGlobalDeadline();

	let startDate = $("#scatter_start_date").val();
	let endDate = $("#scatter_end_date").val();

	if (!validateSearchDateWithChart(startDate, endDate)) {
		return;
	}

	const url = new UrlBuilder()
		.setBaseUrl("/auth-user/api/arms/analysis/time/standard-daily/jira-issue")
		.addQueryParam("pdServiceLink", pdServiceLink)
		.addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
		.addQueryParam("일자기준", "updated")
		.addQueryParam("메인그룹필드", "isReq")
		.addQueryParam("시작일", startDate)
		.addQueryParam("종료일", endDate)
		.addQueryParam("크기", 1000)
		.addQueryParam("하위크기", 1000)
		.addQueryParam("컨텐츠보기여부", true)
		.build();

	$.ajax({
		url: url,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				console.log("[ analysisTime :: dailyUpdatedStatusScatterChart ] :: 일별 업데이트 상태 스캐터 차트데이터 = ");
				console.log(data);

				let result = Object.keys(data).reduce(
					(acc, date) => {

						if (data[date].totalRequirements !== 0 || data[date].totalRelationIssues !== 0) {
							acc.dates.push(date);

							acc.totalRequirements.push(data[date].totalRequirements);
							acc.totalRelationIssues.push(data[date].totalRelationIssues);
						}

						return acc;
					},
					{
						dates: [],
						totalRelationIssues: [],
						totalRequirements: [],
					}
				);

				let dates = result.dates;
				let totalRelationIssues = result.totalRelationIssues;
				let totalRequirements = result.totalRequirements;

				let deadlineSeries = createDeadlineSeries(dates, totalRequirements, totalRelationIssues, globalDeadline, false, 2);

				var dom = document.getElementById("scatter-chart-container");

				var myChart = echarts.init(dom, "dark", {
					renderer: "canvas",
					useDirtyRect: false
				});

				var option;

				if ((totalRequirements && totalRequirements.length > 0) || (totalRelationIssues && totalRelationIssues.length > 0)) {

					option = {
						aria: {
							show: true
						},
						legend: {
							data: ["요구사항", "연결된 이슈"],
							textStyle: {
								color: "white"
							}
						},
						xAxis: {
							type: "category",
							axisTick: { show: false },
							data: dates,
							axisLabel: {
								textStyle: {
									color: "white"
								}
							}
						},
						yAxis: {
							type: "value",
							splitLine: {
								show: true,
								lineStyle: {
									color: "rgba(255,255,255,0.2)",
									width: 1,
									type: "dashed"
								}
							},
							axisLabel: {
								textStyle: {
									color: "white"
								}
							}
						},
						series: [
							{
								name: "요구사항",
								data: totalRequirements,
								type: "scatter",
								symbol: "diamond",
								clip: false,
								label: {
									normal: {
										show: false,
										color: "#FFFFFF"
									},
									emphasis: {
										show: true,
										color: "#FFFFFF"
									}
								},
								symbolSize: function (val) {
									var sbSize = 10;
									if (val > 10) {
										sbSize = val * 1.1;
									} else if (val === 0) {
										sbSize = 0;
									}
									return sbSize;
								}
							},
							{
								name: "연결된 이슈",
								data: totalRelationIssues,
								type: "scatter",
								clip: false,
								label: {
									normal: {
										show: false,
										color: "#FFFFFF"
									},
									emphasis: {
										show: true,
										color: "#FFFFFF"
									}
								},
								symbolSize: function (val) {
									var sbSize = 10;
									if (val > 10) {
										sbSize = val * 1.1;
									} else if (val === 0) {
										sbSize = 0;
									}
									return sbSize;
								},
								itemStyle: {
									color: "#13de57"
								}
							},
							...deadlineSeries
						],
						tooltip: {
							trigger: "axis",
							position: "top",
							borderWidth: 1,
							axisPointer: {
								type: "line",
								label: {
									formatter: function (params) {
										return formatDate(new Date(params.value));
									}
								}
							}
						},
						backgroundColor: "rgba(255,255,255,0)",
						animationDelay: function (idx) {
							return idx * 20;
						},
						animationDelayUpdate: function (idx) {
							return idx * 20;
						}
					};

					myChart.on("click", function (params) {
						// console.log(params.data);
					});

					myChart.on("mouseover", function (params) {
						// if (params.seriesType === 'line') {
						var option = myChart.getOption();
						option.series[params.seriesIndex].label.color = 'white';
						option.series[params.seriesIndex].label.show = true;

						myChart.setOption(option);
						// }
					});

					myChart.on("mouseout", function (params) {
						// if (params.seriesType === 'line') {
						var option = myChart.getOption();
						option.series[params.seriesIndex].label.show = false;
						myChart.setOption(option);
						// }
					});

				}
				else {
					option = {
						title: {
							text: "데이터가 없습니다",
							left: "center",
							top: "middle",
							textStyle: {
								color: "#fff"
							}
						},
						backgroundColor: "rgba(255,255,255,0)"
					};
				}

				if (option && typeof option === "object") {
					myChart.setOption(option, true);
				}

				window.addEventListener("resize", myChart.resize);
			}
		}
	});
}

////////////////
// 멀티 콤비네이션 차트
///////////////
async function dailyCreatedCountAndUpdatedStatusesMultiStackCombinationChart(pdServiceLink, pdServiceVersionLinks) {
	let deadline = await waitForGlobalDeadline();

	let startDate = $("#multi_stack_start_date").val();
	let endDate = $("#multi_stack_end_date").val();

	if (!validateSearchDateWithChart(startDate, endDate)) {
		return;
	}

	const url = new UrlBuilder()
		.setBaseUrl("/auth-user/api/arms/analysis/time/standard-daily/jira-issue")
		.addQueryParam("pdServiceLink", pdServiceLink)
		.addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
		.addQueryParam("일자기준", "updated")
		.addQueryParam("메인그룹필드", "isReq")
		.addQueryParam("하위그룹필드들", "status.status_name.keyword")
		.addQueryParam("시작일", startDate)
		.addQueryParam("종료일", endDate)
		.addQueryParam("크기", 1000)
		.addQueryParam("하위크기", 1000)
		.addQueryParam("컨텐츠보기여부", true)
		.build();

	$.ajax({
		url: url,
		type: "GET",
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		statusCode: {
			200: function (data) {
				console.log("[ analysisTime :: dailyCreatedCountAndUpdatedStatusesMultiStackCombinationChart ] :: 일별 이슈 생성 개수 및 업데이트 현황 데이터 = ");
				console.log(data);

				var accumulateRequirementCount = 0;
				var accumulateRelationIssueCount = 0;

				let result = Object.keys(data).reduce(
					(acc, date) => {

							if (data[date].totalRequirements !== 0 || data[date].totalRelationIssues !== 0) {
								acc.dates.push(date);

								accumulateRequirementCount += data[date].totalRequirements;
								accumulateRelationIssueCount += data[date].totalRelationIssues;

								acc.totalRequirements.push(accumulateRequirementCount);
								acc.totalRelationIssues.push(accumulateRelationIssueCount);
							}

							if (data[date].requirementStatuses !== null) {
								Object.keys(data[date].requirementStatuses).forEach((status) => {
									if (!acc.statusKeys.includes(status)) {
										acc.statusKeys.push(status);
									}
								});
							}

							if (data[date].relationIssueStatuses !== null) {
								Object.keys(data[date].relationIssueStatuses).forEach((status) => {
									if (!acc.statusKeys.includes(status)) {
										acc.statusKeys.push(status);
									}
								});
							}

						return acc;
					},
					{
						dates: [],
						totalRelationIssues: [],
						totalRequirements: [],
						statusKeys: []
					}
				);

				var dom = document.getElementById("multi-chart-container");
				var myChart = echarts.init(dom, null, {
					renderer: "canvas",
					useDirtyRect: false
				});
				var option;

				if (result.dates.length > 0) {
					var labelOption = {
						show: false,
						position: "top",
						distance: 0,
						align: "center",
						verticalAlign: "top",
						rotate: 0,
						formatter: "{c}",
						fontSize: 14,
						rich: {
							name: {}
						}
					};

					let dates = result.dates;
					let totalRelationIssues = result.totalRelationIssues;
					let totalRequirements = result.totalRequirements;
					let statusKeys = result.statusKeys;

					let deadlineSeries = createDeadlineSeries(dates, totalRequirements, totalRelationIssues, globalDeadline, true, 4);

					let requirementStatusSeries = statusKeys.map((key, i) => {
						let stackType = "요구사항";

						return {
							name: key,
							type: "bar",
							stack: stackType,
							label: labelOption,
							emphasis: {
								focus: "series"
							},
							data: dates.map((date) => {
								if (data[date] && data[date].requirementStatuses && Object.keys(data[date].requirementStatuses).length > 0) {
									return { value: data[date].requirementStatuses[key] || 0, stackType: stackType };
								} else {
									return { value: 0, stackType: stackType };
								}
							})
						};
					});

					let relationIssueStatusSeries = statusKeys.map((key, i) => {
						let stackType = "연결된 이슈";

						return {
							name: key,
							type: "bar",
							stack: stackType,
							label: labelOption,
							emphasis: {
								focus: "series"
							},
							data: dates.map((date) => {
								if (data[date] && data[date].relationIssueStatuses && Object.keys(data[date].relationIssueStatuses).length > 0) {
									return { value: data[date].relationIssueStatuses[key] || 0, stackType: stackType };
								} else {
									return { value: 0, stackType: stackType };
								}
							})
						};
					});

					// let stackIndex = statusKeys.map((value, index) => index);

					statusKeys.push("요구사항");
					statusKeys.push("연결된 이슈");

					let multiCombinationChartSeries = [
						...requirementStatusSeries,
						...relationIssueStatusSeries,
						{
							name: "요구사항",
							type: "line",
							// yAxisIndex: 1,
							emphasis: {
								focus: "series"
							},
							symbolSize: 10,
							data: totalRequirements
						},
						{
							name: "연결된 이슈",
							type: "line",
							// yAxisIndex: 1,
							emphasis: {
								focus: "series"
							},
							symbolSize: 10,
							data: totalRelationIssues
						},
						...deadlineSeries
					];

					var legendData = statusKeys;
					var xAiasData = dates;

					option = {
						tooltip: {
							trigger: "axis",
							axisPointer: {
								type: "shadow"
							},
							formatter: function (params) {
								var tooltipText = "";
								tooltipText += params[0].axisValue + "<br/>";
								params.forEach(function (item) {
									if (item.value !== 0) {
										// 0인 데이터는 무시
										if (item.seriesType === "bar") {
											var stackType = item.data.stackType; // 추가 정보에 접근
											tooltipText +=
												item.marker +
												item.seriesName +
												"[" +
												stackType +
												"]" +
												'<span>&nbsp;&nbsp;&nbsp;</span><span style="float: right;">' +
												item.value +
												"</span>" +
												"<br/>";
										} else if (item.seriesType === "line") {
											tooltipText +=
												item.marker +
												item.seriesName +
												'<span>&nbsp;&nbsp;&nbsp;</span><span style="float: right;">' +
												item.value +
												"</span>" +
												"<br/>";
										}
									}
								});
								return tooltipText;
							}
						},
						legend: {
							data: legendData,
							textStyle: {
								color: "white"
							},
							tooltip: {
								show: true
							}
						},
						grid: {
							top: "20%",
							containLabel: false
						},
						toolbox: {
							show: true,
							orient: "vertical",
							left: "right",
							bottom: "50px",
							feature: {
								mark: { show: true },
								// dataView: {show: true, readOnly: true},
								/*magicType: {
                                    show: true,
                                    type: ['stack'],
                                    seriesIndex: {
                                        stack: stackIndex
                                    }
                                },*/
								dataZoom: {
									show: true
								}
								// restore: { show: true },
								//saveAsImage: { show: true }
								// myTool: {
								//       show: true,
								//       title: '상태 그룹화',
								//       icon: 'image://http://echarts.baidu.com/images/favicon.png',
								//       onclick: toggleStack
								// },
							},
							iconStyle: {
								borderColor: "white"
							}
						},
						xAxis: [
							{
								type: "category",
								axisTick: { show: false },
								data: xAiasData,
								axisLabel: {
									textStyle: {
										color: "white"
									}
								}
							}
						],
						yAxis: [
							{
								type: "value",
								axisLabel: {
									textStyle: {
										color: "white"
									}
								},
								splitLine: {
									show: true,
									lineStyle: {
										color: "rgba(255,255,255,0.2)",
										width: 1,
										type: "dashed"
									}
								}
							},
							{
								type: "value",
								position: "right",
								axisLabel: {
									textStyle: {
										color: "white"
									}
								}
							}
						],
						series: multiCombinationChartSeries,
						backgroundColor: "rgba(255,255,255,0)",
						animationDelay: function (idx) {
							return idx * 20;
						},
						animationDelayUpdate: function (idx) {
							return idx * 20;
						}
					};
				} else {
					option = {
						title: {
							text: "데이터가 없습니다",
							left: "center",
							top: "middle",
							textStyle: {
								color: "#fff" // 제목 색상을 검은색으로 변경
							}
						},
						backgroundColor: "rgba(255,255,255,0)"
					};
				}

				if (option && typeof option === "object") {
					myChart.setOption(option, true);
				}

				window.addEventListener("resize", function () {
					myChart.resize();
				});

				myChart.on("mouseover", function (params) {
					var option = myChart.getOption();
					option.series[params.seriesIndex].label.show = true;
					myChart.setOption(option);
				});

				myChart.on("mouseout", function (params) {
					var option = myChart.getOption();
					option.series[params.seriesIndex].label.show = false;
					myChart.setOption(option);
				});
			}
		}
	});
}

// 마감일 함수
function createDeadlineSeries(dates, totalRelationIssues, totalRequirements, deadline, usePreviousValue, lineWidth) {
	var chartStart = dates.reduce((earliest, date) => (date < earliest ? date : earliest), dates[0]);
	var chartEnd = dates.reduce((latest, date) => (date > latest ? date : latest), dates[0]);

	chartStart = new Date(chartStart);
	chartEnd = new Date(chartEnd);

	var deadlineSeries = [];

	if (new Date(deadline) <= chartEnd) {

		if (!dates.includes(deadline)) {
			dates.push(deadline);
			dates.sort((a, b) => new Date(a) - new Date(b));
			let dateIndex = dates.indexOf(deadline);

			if (dateIndex > 0 && usePreviousValue) {
				totalRequirements.splice(dateIndex, 0, totalRequirements[dateIndex-1]);
				totalRelationIssues.splice(dateIndex, 0, totalRelationIssues[dateIndex-1]);
			}
			else {
				totalRequirements.splice(dateIndex, 0, 0);
				totalRelationIssues.splice(dateIndex, 0, 0);
			}
		}

		// 데이터 추가
		var vs = {
			name: "마감일",
			type: "line",
			data: [
				[deadline, 0],
				[deadline, 1]
			],
			tooltip: {
				show: false
			},
			markLine: {
				silent: true,
				symbol: "none",
				data: [
					{
						xAxis: deadline
					}
				],
				lineStyle: {
					color: "red",
					width: lineWidth,
					type: "dashed"
				},
				label: {
					formatter: "마감일 : {c}",
					color: "white",
					fontSize: 14,
					fontWeight: "bold"
				}
			},
			lineStyle: {
				color: "red",
				type: "dashed"
			},
			symbol: "none"
		};

		deadlineSeries.push(vs);
	}

	return deadlineSeries;
}

function dailyChartDataSearchEvent() {
	$("#scatter-search").on("click", function (params) {
		dailyUpdatedStatusScatterChart(selectedPdServiceId, selectedVersionId);
	});

	$("#multi-stack-search").on("click", function (params) {
		dailyCreatedCountAndUpdatedStatusesMultiStackCombinationChart(selectedPdServiceId, selectedVersionId);
	});

	$("#timeline-search").on("click", function (params) {
		timeLineChart(selectedPdServiceId, selectedVersionId);
	});
}

function validateSearchDateWithChart(startDate, endDate) {
	let result = true;
	if(!selectedPdServiceId || !selectedVersionId) {
		alert("제품(서비스) 혹은 버전 선택이 되지 않았습니다.");
		result = false;
	}

	if (!startDate || !endDate) {
		alert("일자를 지정하지 않았습니다.");
		result = false;
	}

	return result;
}

function onScatterChartDateEndChanged() {
	dailyUpdatedStatusScatterChart(selectedPdServiceId, selectedVersionId);
}

function onMultiStackChartDateEndChanged() {
	dailyCreatedCountAndUpdatedStatusesMultiStackCombinationChart(selectedPdServiceId, selectedVersionId);
}

function convertVersionIdToTitle(versionId) {
	if (versionListData.hasOwnProperty(versionId)) {
		var version = versionListData[versionId];
		return version.c_title;
	}
}

function verticalTimeLineChart(data) {

	let contentSet = {}; // 객체로 선언

	let items = Object.values(data).reduce((acc, versionData) => {
		versionData.forEach(item => {
			if (!contentSet[item.summary]) { // 중복 체크
				contentSet[item.summary] = {
					version: item.pdServiceVersion,
					summary: item.summary,
					issuekey: [item.key],
					date: formatDateTime(item.updated)
				};
			} else {
				// issuekey에 item.key가 없는 경우에만 추가
				if (!contentSet[item.summary].issuekey.includes(item.key)) {
					contentSet[item.summary].issuekey.push(item.key);
					contentSet[item.summary].issuekey.sort();
				}
			}
		});

		return acc;
	}, []);

	items = Object.values(contentSet).map(item => ({
		...item,
		issuekey: item.issuekey.join('  |  ')
	}));

	// 날짜를 기준으로 오름차순 정렬
	items.sort((a, b) => new Date(b.date) - new Date(a.date));

	makeVerticalTimeline(items);

	// mock data
	/*
	makeVerticalTimeline([
		{
			title: "BaseVersion",
			content: "요구 사항 이슈 1",
			type: "Presentation",
			date: "2023-11-08"
		},
		{
			title: "",
			content: "요구 사항 이슈 2",
			type: "Presentation",
			date: "2023-11-29"
		},
		{
			title: "1.0",
			content: "요구 사항 이슈 3",
			type: "Review",
			date: "2023-12-01"
		},
		{
			title: "1.1",
			content: "요구 사항 이슈 4",
			type: "Review",
			date: "2023-12-11"
		}
	]);
	 */
}

function makeVerticalTimeline(data) {

	// 데이터 세팅
	const $container = document.querySelector(".timeline-container");
	$container.innerHTML = '';

	// const upIcon = document.createElement("i");
	// upIcon.className = "fa fa-chevron-up vertical-chevron-up";
	// $container.append(upIcon);

	if (data.length == 0) {
		const noDataMessage = document.createElement('p');
		noDataMessage.textContent = '데이터가 없습니다.';
		noDataMessage.style.position = 'absolute';
		noDataMessage.style.top = '50%';
		noDataMessage.style.left = '50%';
		noDataMessage.style.transform = 'translate(-50%, -50%)';

		$container.appendChild(noDataMessage);
	} else {
		// 날짜별로 데이터 그룹화
		let groupedData = data.reduce((group, item) => {
			let date = item.date;
			if (!group[date]) group[date] = [];
			group[date].push(item);
			return group;
		}, {});

		const $ul = document.createElement("ul");

		Object.entries(groupedData).forEach(([date, items]) => {
			items.forEach(({version, summary, issuekey}, index) => {
				const $li = document.createElement("li");
				$li.className = "session";

				if (index === 0) {
					$li.innerHTML += `
                    <span class="time-range">
                      <span class="date">${date}</span>
                    </span>
                    `;
				}
				$li.innerHTML += `
                <div class="session-content">
                  <div class="version" style="color: ${getColorByVersion(version)}">${convertVersionIdToTitle(version)}</div>
                  <div class="summary">${summary}</div>
                  <div class="issuekey">${issuekey}</div>
                </div>
                `;

				$ul.append($li);
			});
		});

		$container.append($ul);
	}

	adjustHeight();

	// const downIcon = document.createElement("i");
	// downIcon.className = "fa fa-chevron-down vertical-chevron-down";
	// $container.append(downIcon);

	// 버튼 클릭 이벤트
	// $('.fa-chevron-up').on('click', function() {
	// 	verticalTimeLineChart(pdServiceLink, pdServiceVersions, week+1);
	// });
	//
	// $('.fa-chevron-down').on('click', function() {
	// 	if (week - 1 > 0) {
	// 		verticalTimeLineChart(pdServiceLink, pdServiceVersions, week-1);
	// 	}
	// });
}

function formatDateTime(dateTime) {
	var date = dateTime.split('T')[0];
	return date;
}

async function timeLineChart(pdServiceLink, pdServiceVersionLinks) {
	let deadline = await waitForGlobalDeadline();

	let startDate = $("#timeline_start_date").val();
	let endDate = $("#timeline_end_date").val();

	if (!validateSearchDateWithChart(startDate, endDate)) {
		return;
	}
	const verticalUrl = new UrlBuilder()
    		.setBaseUrl("/auth-user/api/arms/analysis/time/standard-daily/updated-jira-issue")
    		.addQueryParam("pdServiceLink", pdServiceLink)
    		.addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
    		.addQueryParam("일자기준", "updated")
			.addQueryParam("isReqType", "REQUIREMENT")
    		.addQueryParam("시작일", startDate)
    		.addQueryParam("종료일", endDate)
    		.addQueryParam("크기", 1000)
    		.addQueryParam("하위크기", 1000)
    		.addQueryParam("컨텐츠보기여부", true)
    		.build();
    $.ajax({
            url: verticalUrl,
            type: "GET",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (data) {
                    console.log("[ analysisTime :: TimeLineData ] :: = ");
                    console.log(data);
                    verticalTimeLineChart(data);
                }
            }
        });

	const ridgeLineUrl = new UrlBuilder()
		.setBaseUrl("/auth-user/api/arms/analysis/time/standard-daily/updated-ridgeline")
		.addQueryParam("pdServiceLink", pdServiceLink)
		.addQueryParam("pdServiceVersionLinks", pdServiceVersionLinks)
		.addQueryParam("일자기준", "updated")
		.addQueryParam("isReqType", "ISSUE")
		.addQueryParam("시작일", startDate)
		.addQueryParam("종료일", endDate)
		.addQueryParam("크기", 1000)
		.addQueryParam("하위크기", 1000)
		.addQueryParam("컨텐츠보기여부", true)
		.build();

    function executeAjaxCall(url) {
        $.ajax({
            url: url,
            type: "GET",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            progress: true,
            statusCode: {
                200: function (data) {
                console.log("[ analysisTime :: ridgeLineData ] :: = ");
                console.log(data);
                updateRidgeLine(data);
                }
            }
        });
    }
    executeAjaxCall(ridgeLineUrl);

	window.addEventListener("resize", function() {
		adjustHeight();
	});
}

function getColorByVersion(version) {

    var colorPalette = [ //e chart 컬러 팔레트
        '#c23531','#2f4554','#61a0a8','#d48265','#91c7ae',
        '#749f83','#ca8622','#bda29a','#6e7074','#546570',
        '#c4ccd3'
    ];
    var versionNumber = parseInt(version);

    return colorPalette[versionNumber % colorPalette.length];
}
function updateRidgeLine(traffic){
    // 데이터가 없을 경우
    if (!traffic || traffic.length === 0) {
        document.getElementById("overlapInputDiv").style.display = "none";
        document.getElementById("updateRidgeLine").innerHTML = "<p style='text-align: center; position: absolute; top: 48%; left:50%;'>" +
            "데이터가 없습니다.</p>";
        return;
    } else {

        document.getElementById("overlapInputDiv").style.display = "flex";
    }

        function setOverlapInputListener() {
            var overlap = this.value;
            overlapNumberInput.value = overlap;
            drawGraph(traffic, overlap);
        }

        function setOverlapNumberInputListener() {
            var overlap = this.value;
            overlapInput.value = overlap;
            drawGraph(traffic, overlap);
        }

        overlapInput.removeEventListener('input', setOverlapInputListener);
        overlapNumberInput.removeEventListener('input', setOverlapNumberInputListener);

        overlapInput.addEventListener('input', setOverlapInputListener);
        overlapNumberInput.addEventListener('input', setOverlapNumberInputListener);

    var initialOverlap = traffic.length > 30 ? 5 : 2;
    document.getElementById("overlapInput").value = initialOverlap;
    document.getElementById("overlapNumberInput").value = initialOverlap;
    drawGraph(traffic, initialOverlap);
}


function drawGraph(traffic, overlap){
document.getElementById("updateRidgeLine").innerHTML = "";
        var nestedDataByDate = d3.nest()
                .key(function(d) { return +new Date(d.date); })
        		.entries(traffic);
        var dates = nestedDataByDate.map(function(d) { return +d.key; }).sort(d3.ascending);

        var nestedDataByName = d3.nest()
            .key(function(d) { return d.name; })
            .entries(traffic);

        var series = nestedDataByName.map(function(d) {
        var valuesMap = d3.map(d.values, function(e) { return String(+new Date(e.date)); });
        var values = dates.map(function(date) {
            var valueObj = valuesMap.get(String(date));
        	return valueObj ? valueObj.value : null;
        	});
        	var version = d.values[0] ? d.values[0].version : null;  // version 필드 추가
        	var summary = d.values[0] ? d.values[0].summary : null;  // version 필드 추가
        	var key = d.values[0] ? d.values[0].name : null;  // version 필드 추가
            return { name: key+": "+summary, values: values, version: version ,key:key};  // version 값 포함하여 반환
        });

        //const overlap = 4;
        const width = 900;
        //const height = series.length * 30;
        const minHeight = 600;
        const maxHeight = 650;
        const height = Math.max(minHeight, Math.min(maxHeight, series.length * 16));
        const marginTop = 100;
        const marginRight = 0;
        const marginBottom = 0;
        const marginLeft = 280;
        		// Create the scales.
        const x = d3.scaleTime()
            .domain(d3.extent(dates))
            .range([marginLeft, width - marginRight]);

        const y = d3.scalePoint()
            .domain(series.map(d => d.name))
            .range([marginTop, height - marginBottom]);

         const z = d3.scaleLinear()
                .domain([0, d3.max(series, d => d3.max(d.values))]).nice()
                .range([0, -overlap * y.step()]);

        		// Create the area generator and its top-line generator.
        const area = d3.area()
            .curve(d3.curveBasis)
            .defined(d => !isNaN(d))
            .x((d, i) => x(dates[i]))
            .y0(0)
            .y1(d => z(d));

        const line = area.lineY1();

        		// Create the SVG container.
        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", maxHeight)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        		// Append the axes.
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0));

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call(g => g.select(".domain").remove())
           .selectAll(".tick text")
           .text(function(d) {
            return d.length > 42 ? d.slice(0, 35) + ' . . .' : d; // 긴 레이블은 축약
                          })
           .style("font-size", "10px");

        		// Append a layer for each series.
        const group = svg.append("g")
            .selectAll("g")
            .data(series)
            .join("g")
            .attr("transform", d => `translate(0,${y(d.name) + 1})`);

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        group.append("path")
            .attr("fill", d => getColorByVersion(d.version))
            .attr("d", d => area(d.values))
            .on("mouseover", function(d) {
                    var event = d3.event;
                    d3.select(this)
                        .transition()
                        .duration(20)
                        .style("opacity", 0.4);
                    div.transition()
                        .duration(20)
                        .style("opacity", .9);
                    div.html("버전 정보: " + convertVersionIdToTitle(d.version) +
                             "<br>요구사항 키: " + d.key +
                             "<br>요구사항 제목: " + d.name)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition()
                        .duration(20)
                        .style("opacity", 1);
                    div.transition()
                        .duration(20)
                        .style("opacity", 0);
                });
        group.append("path")
            .attr("fill", "none")
            .attr("stroke","#EBEDF0") //.attr("stroke", d => getColorByVersion(d.version))
            .attr("stroke-width", 0.5)
            .attr("d", d => line(d.values));

        $("#overlapInputDiv").css("display", "flex");
        $('#updateRidgeLine').append(svg.node());

		adjustHeight();
}

// 차트 높이 조정
function adjustHeight() {
	var verticalTimeline = $('#vertical-timeline');
	var updateRidgeLine = $('#updateRidgeLine');

	if (verticalTimeline && updateRidgeLine) {
		verticalTimeline.height(updateRidgeLine.height() + 20);
	}
}

// 주식차트
function candleStickChart() {
	var dom = document.getElementById("candlestick-chart-container");
	var myChart = echarts.init(dom, "dark", {
		renderer: "canvas",
		useDirtyRect: false
	});

	var option;

	option = {
		xAxis: {
			data: ["2017-10-24", "2017-10-25", "2017-10-26", "2017-10-27"]
		},
		yAxis: {},
		series: [
			{
				type: "candlestick",
				data: [
					[20, 34, 10, 38],
					[40, 35, 30, 50],
					[31, 38, 33, 44],
					[38, 15, 5, 42]
				]
			}
		],
		tooltip: {
			trigger: "axis",
			position: "top",
			borderWidth: 1,
			axisPointer: {
				type: "cross"
			}
		},
		backgroundColor: "rgba(255,255,255,0)"
	};

	if (option && typeof option === "object") {
		myChart.setOption(option, true);
	}

	window.addEventListener("resize", myChart.resize);
}

function versionTimelineChart(versionData) {


	var yVersionData = [];
	var xVesrionStartEndData = [];
	var yearData = new Set();
	versionData.forEach(version => {
		yVersionData.push(version.title);
		var arrayData = [version.title, +new Date(version.startDate), +new Date(version.endDate)];
		yearData.add(new Date(version.startDate).getFullYear());
		yearData.add(new Date(version.endDate).getFullYear());
		xVesrionStartEndData.push(arrayData);
	});

	var dom = document.getElementById('version-timeline-chart-container');

	var myChart = echarts.init(dom, null, {
		renderer: 'canvas',
		useDirtyRect: false
	});

	var colorList = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'];
	var versionData = ['v1.0', 'v1.1', 'v1.2', 'v1.3', 'v1.4', 'v1.5', 'v1.6', 'v1.7', 'v1.8', 'v1.9'];
	var startEndData= [
		['v1.0', +new Date(2023, 0, 1), +new Date(2023, 0, 15)],
		['v1.1', +new Date(2023, 0, 10), +new Date(2023, 0, 25)],
		['v1.2', +new Date(2023, 1, 1), +new Date(2023, 1, 15)],
		['v1.3', +new Date(2023, 3, 1), +new Date(2023, 4, 15)],
		['v1.4', +new Date(2023, 2, 1), +new Date(2024, 3, 15)],
		['v1.5', +new Date(2023, 6, 1), +new Date(2023, 6, 15)],
		['v1.6', +new Date(2023, 5, 1), +new Date(2023, 11, 15)],
		['v1.7', +new Date(2024, 2, 1), +new Date(2024, 3, 15)],
		['v1.8', +new Date(2024, 5, 1), +new Date(2024, 6, 15)],
		['v1.9', +new Date(2024, 1, 1), +new Date(2024, 11, 15)],
	];

	var today = new Date();
	var todayLine =  {
		name: '오늘',
		type: 'line',
		data: [[formatDate(today), 0], [formatDate(today), 1]], // y축 전체에 걸쳐 라인을 그립니다.
		tooltip: {
			show: false
		},
		markLine : {
			silent: true,
			symbol: 'none',
			data : [{
				xAxis : formatDate(today)
			}],
			lineStyle: {
				color: 'red',
				width: 2,
				type: 'dashed'
			},
			label: {
				formatter: '오늘 : {c}',
				color: 'white',
				fontSize: 12,
				fontWeight: 'bold',
				position: 'start'
			}
		},
		lineStyle: {
			color: 'red',
			type: 'dashed'
		},
		symbol: 'none'
	};

	let yearsArray = Array.from(yearData);

	let minYear = Math.min(...yearsArray);
	let maxYear = Math.max(...yearsArray);

	if (maxYear.valueOf() < today.getFullYear()) {
		maxYear = today.getFullYear();
	}

	var option = {
		xAxis: {
			type: 'time',
			min: minYear + '-01-01',
			max: maxYear + '-12-31',
			axisLabel: {
				textStyle: {
					color: "white"
				},
				rotate: 45
			},
			axisTick: { show: false },
			splitLine: {
				show: true,
				lineStyle: {
					color: "rgba(255,255,255,0.2)",
					width: 1,
					type: "dashed"
				}
			},
		},
		yAxis: {
			data: yVersionData,
			inverse: true,
			axisLabel: {
				textStyle: {
					color: "white"
				}
			}
		},
		series: [
			{
				name: 'Versions',
				type: 'custom',
				itemStyle: {
					color: function(params) {
						return colorList[params.dataIndex % colorList.length];
					}
				},
				renderItem: function(params, api) {
					var categoryIndex = api.value(0);
					var start = api.coord([api.value(1), categoryIndex]);
					var end = api.coord([api.value(2), categoryIndex]);
					var height = params.coordSys.height / yVersionData.length;

					return {
						type: 'rect',
						shape: {
							x: start[0],
							y: start[1] - height / 2,
							width: end[0] - start[0],
							height: height
						},
						style: api.style(params.dataIndex) // apply color here
					};
				},
				encode: {
					x: [1, 2],
					y: 0
				},
				data: xVesrionStartEndData
			},
			todayLine,
		],
		tooltip: {
			trigger: 'axis',
			position: 'top',
			borderWidth: 1,
			axisPointer: {
				type: 'cross',
				axis: 'y'
			},
			formatter: function (params) {
				var tooltipText = '';
				tooltipText += params[0].marker + params[0].data[0] + '<br/><span style="float: right;">' + new Date(params[0].data[1]).toLocaleDateString()+ " ~ " + new Date(params[0].data[2]).toLocaleDateString() + '</span>' + '<br/>';
				return tooltipText;
			}
		},
		grid: {
			left: '15%',
			containLabel: false
		}
	};

	if (option && typeof option === 'object') {
		myChart.setOption(option, true);
	}

	window.addEventListener('resize', myChart.resize);
}

////////////////////
//서비스, 버전으로 연결된 이슈 전체 호출
////////////////////
function getRelationJiraIssueByPdServiceAndVersions(pdServiceLink, pdServiceVersions) {
	$.ajax({
		url: "/auth-user/api/arms/analysis/time/pdService/pdServiceVersions",
		type: "GET",
		data: { pdServiceLink: pdServiceLink, pdServiceVersionLinks: pdServiceVersions },
		contentType: "application/json;charset=UTF-8",
		dataType: "json",
		progress: true,
		async: true,
		statusCode: {
			200: function (data) {
				//sevenTimeline(data);
			}
		}
	});
}

//톱 메뉴 세팅
function top_menu_setting() {

}