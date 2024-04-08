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
            "../reference/light-blue/lib/jquery.fileupload.js",
            "../reference/light-blue/lib/jquery.fileupload-fp.js",
            "../reference/light-blue/lib/jquery.fileupload-ui.js"
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
            "../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.cookie.js",
            "../reference/jquery-plugins/jstree-v.pre1.0/_lib/jquery.hotkeys.js",
            "../reference/jquery-plugins/jstree-v.pre1.0/jquery.jstree.js",
            "../reference/jquery-plugins/select2-4.0.2/dist/css/select2_lightblue4.css",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/css/multiselect-lightblue4.css",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select-bluelight.css",
            "../reference/jquery-plugins/select2-4.0.2/dist/js/select2.min.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.quicksearch.js",
            "../reference/jquery-plugins/lou-multi-select-0.9.12/js/jquery.multi-select.js",
            "../reference/jquery-plugins/multiple-select-1.5.2/dist/multiple-select.min.js"
        ],
        [
            "../reference/jquery-plugins/jkanban-1.3.1/dist/jkanban.css",
            "../reference/jquery-plugins/jkanban-1.3.1/dist/jkanban.js"
        ]
        // 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
    ];

    loadPluginGroupsParallelAndSequential(pluginGroups)
        .then(function () {
            //사이드 메뉴 처리
            $(".widget").widgster();
            setSideMenu("sidebar_menu_requirement", "sidebar_menu_requirement_kanban");

            //제품(서비스) 셀렉트 박스 이니시에이터
            makePdServiceSelectBox();

            //버전 멀티 셀렉트 박스 이니시에이터
            makeVersionMultiSelectBox();

            // 칸반 보드 띄우기
            loadKanban();

        })
        .catch(function (e) {
            console.error("플러그인 로드 중 오류 발생");
            console.error(e);
        });
}

///////////////////////
//제품 서비스 셀렉트 박스
//////////////////////
function makePdServiceSelectBox() {
    //제품 서비스 셀렉트 박스 이니시에이터
    $(".chzn-select").each(function() {
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
            200: function(data) {
                //////////////////////////////////////////////////////////
                pdServiceListData = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceListData.push({ "pdServiceId": obj.c_id, "pdServiceName": obj.c_title });
                    var newOption = new Option(obj.c_title, obj.c_id, false, false);
                    $("#selected_pdService").append(newOption).trigger("change");
                }
                //////////////////////////////////////////////////////////
                console.log("[analysisCost :: makePdServiceSelectBox] :: pdServiceListData => ");
                console.log(pdServiceListData);
            }
        }
    });

    $("#selected_pdService").on("select2:open", function() {
        //슬림스크롤
        makeSlimScroll(".select2-results__options");
    });

    // --- select2 ( 제품(서비스) 검색 및 선택 ) 이벤트 --- //
    $("#selected_pdService").on("select2:select", function(e) {
        selectedPdServiceId = $("#selected_pdService").val();
        //refreshDetailChart(); 변수값_초기화();
        // 제품( 서비스 ) 선택했으니까 자동으로 버전을 선택할 수 있게 유도
        // 디폴트는 base version 을 선택하게 하고 ( select all )
        //~> 이벤트 연계 함수 :: Version 표시 jsTree 빌드
        bind_VersionData_By_PdService();
    });
} // end makePdServiceSelectBox()

////////////////////////////////////////
//버전 멀티 셀렉트 박스
////////////////////////////////////////
function makeVersionMultiSelectBox() {
    //버전 선택시 셀렉트 박스 이니시에이터
    $(".multiple-select").multipleSelect({
        filter: true,
        onClose: function() {
            console.log("onOpen event fire!\n");

            var checked = $("#checkbox1").is(":checked");
            var endPointUrl = "";
            var versionTag = $(".multiple-select").val();
            console.log("[ analysisCost :: makeVersionMultiSelectBox ] :: versionTag");
            console.log(versionTag);
            selectedVersionId = versionTag.join(",");

            if (versionTag === null || versionTag == "") {
                jError("버전이 선택되지 않았습니다.");
                return;
            }
        }
    });
}

function bind_VersionData_By_PdService() {
    $(".multiple-select option").remove();
    $.ajax({
        url: "/auth-user/api/arms/pdService/getVersionList.do?c_id=" + $("#selected_pdService").val(),
        type: "GET",
        dataType: "json",
        progress: true,
        statusCode: {
            200: function (data) {
                //////////////////////////////////////////////////////////
                var pdServiceVersionIds = [];
                for (var k in data.response) {
                    var obj = data.response[k];
                    pdServiceVersionIds.push(obj.c_id);
                    var newOption = new Option(obj.c_title, obj.c_id, true, false);
                    $(".multiple-select").append(newOption);
                }

                if (data.length > 0) {
                    console.log("[ reqAdd :: bind_VersionData_By_PdService ] :: result = display 재설정.");
                }
                $(".multiple-select").multipleSelect("refresh");
                //////////////////////////////////////////////////////////
            }
        },
        error: function (e) {
            jError("버전 조회 중 에러가 발생했습니다.");
        }
    });
}

function loadKanban() {

    var kanban = new jKanban({
        element : '#myKanban',
        gutter  : '15px',
        click : function(el){
            alert(el.innerHTML);
        },
        boards  :[
            {
                'id' : 'kanban_open',
                'title'  : '열림',
                'class' : 'info',
                'item'  : [
                    {
                        'title': 'open'
                    }
                ]
            },
            {
                'id' : 'kanban_progress',
                'title'  : '진행 중',
                'class' : 'warning',
                'item'  : [
                    {
                        'title':'Do Something!',
                    },
                    {
                        'title':'Run?',
                    }
                ]
            },
            {
                'id' : 'kanban_resolved',
                'title'  : '해결됨',
                'class' : 'warning',
                'item'  : [
                    {
                        'title':'Resolve Issue!',
                    },
                    {
                        'title':'Good',
                    }
                ]
            },
            {
                'id' : 'kanban_closed',
                'title'  : '닫힘',
                'class' : 'warning',
                'item'  : [
                    {
                        'title':'All right',
                    },
                    {
                        'title':'Ok!',
                    }
                ]
            }
        ]
    });
}

function adjustHeight() {
	var verticalTimeline = $('#vertical-timeline');
	var updateRidgeLine = $('#updateRidgeLine');

	if (verticalTimeline && updateRidgeLine) {
		verticalTimeline.height(updateRidgeLine.height() + 20);
	}
}