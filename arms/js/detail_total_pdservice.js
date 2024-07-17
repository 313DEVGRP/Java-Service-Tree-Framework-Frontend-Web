////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedPdServiceDetail;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디
/* 요구사항 전체목록 전역변수 */

var getFiles = [];
var prefix = "./img/winTypeFileIcons/";
var iconsMap = {
	"application/vnd.ms-htmlhelp": prefix + "CHM.File.png",
	"application/vnd.ms-excel": prefix + "XLS.File.png",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": prefix + "XLS.File.png",
	"application/vnd.ms-powerpoint": prefix + "PPT.File.png",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": prefix + "PPT.File.png",
	"application/msword": prefix + "DOC.File.png",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": prefix + "DOC.File.png",
	"application/haansoftpptx": prefix + "PPT.File.png",
	"application/haansoftdocx": prefix + "DOC.File.png",
	"application/pdf": prefix + "PDF.File.png",
	"application/x-rar-compressed": prefix + "RAR.File.png",
	"application/zip": prefix + "ZIP.File.png",
	"application/x-gzip": prefix + "ZIP.File.png",
	"application/x-msdownload": prefix + "DLL.File.png",
	"application/javascript": prefix + "JS.File.png",
	"application/x-shockwave-flash": prefix + "SWF.File.png",
	"application/xml": prefix + "XML.File.png",
	"image/bmp": prefix + "BMP.File.png",
	"image/gif": prefix + "GIF.File.png",
	"image/jpeg": prefix + "JPG1.File.png",
	"image/png": prefix + "PNG.File.png",
	"image/tiff": prefix + "TIFF.File.png",
	"text/html": prefix + "HTML.File.png",
	"text/plain": prefix + "TXT.File.png",
	"text/richtext": prefix + "RTF.File.png",
	"text/xml": prefix + "XML.File.png",
	"text/yaml": "YAML.svg",
	"video/mp4": prefix + "MP4.File.png",
	"audio/mpeg": prefix + "MP3.File.png",
	"audio/x-wav": prefix + "WAV.File.png",
	"application/java-archive": prefix + "JAR.File.png"
	// 추가 타입 여기에 추가
};

function execDocReady() {
	var pluginGroups = [
		[
            "../reference/light-blue/lib/vendor/jquery.ui.widget.js",
            "../reference/lightblue4/docs/lib/widgster/widgster.js",
            "../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Templates_js_tmpl.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Load-Image_js_load-image.js",
            "../reference/light-blue/lib/vendor/http_blueimp.github.io_JavaScript-Canvas-to-Blob_js_canvas-to-blob.js",
            "../reference/light-blue/lib/jquery.iframe-transport.js",
            "../reference/light-blue/lib/jquery.fileupload.js",
            "../reference/light-blue/lib/jquery.fileupload-fp.js",
            "../reference/light-blue/lib/jquery.fileupload-ui.js",
						"../reference/jquery-plugins/swiper-11.1.4/swiper-bundle.min.js",
						"../reference/jquery-plugins/swiper-11.1.4/swiper-bundle.min.css",
						"./js/common/swiperHelper.js",
						"./css/customSwiper.css"
		]
		// 추가적인 플러그인 그룹들을 이곳에 추가하면 됩니다.
	];

	loadPluginGroupsParallelAndSequential(pluginGroups)
		.then(function () {
			console.log("모든 플러그인 로드 완료");

			setUrlParams();

			//좌측 메뉴
			$(".widget").widgster();
			setSideMenu("sidebar_menu_product", "sidebar_menu_total_pdservice");

            // 파일 업로드 관련 레이어 숨김 처리
            $(".body-middle").hide();

			file_upload_setting();
			init_pdDetailList();
			dataLoad();
			// --- 에디터 설정 --- //
			var waitCKEDITOR = setInterval(function () {
				try {
					if (window.CKEDITOR) {
						if(window.CKEDITOR.status == "loaded"){
							CKEDITOR.replace("pdservice_detail_contents",{ skin: "office2013" });//상세보기
							clearInterval(waitCKEDITOR);
						}
					}
				} catch (err) {
					console.log("CKEDITOR 로드가 완료되지 않아서 초기화 재시도 중...");
				}
			}, 313 /*milli*/);
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

function setUrlParams() {
	urlParams = new URL(location.href).searchParams;
	selectedPdService = urlParams.get("pdService");
	selectedPdServiceVersion = urlParams.get("pdServiceVersion");
	selectedJsTreeId = urlParams.get("reqAdd");
	selectedJiraServer = urlParams.get("jiraServer");
	selectedJiraProject = urlParams.get("jiraProject");
}

function file_upload_setting() {
	var $fileupload = $("#fileupload");
	$fileupload.fileupload({
		autoUpload: false,
		sequentialUploads: true,
		url: "/auth-user/api/arms/pdServiceDetail/uploadFileToNode.do",
		dropZone: $("#dropzone")
	});

	$("#fileupload").bind("fileuploadsubmit", function (e, data) {
		var input = $("#fileIdlink");
		data.formData = { pdServiceDetailId: input.val() };
		if (!data.formData.pdServiceDetailId) {
			data.context.find("button").prop("disabled", false);
			input.focus();
			return false;
		}
	});
}

function hideDropzoneArea() {
   $(".pdservice-detail-file").hide();
   $("table tbody.files").empty();
   $(".file-delete-btn").hide();

   if (selectedPdService == undefined) {
      $(".body-middle").hide();
   } else {
      $(".body-middle").show();
   }
}

function init_pdDetailList() {
	var menu;
	$.fn.jsonMenu = function (action, items, options) {
		$(this).addClass("json-menu");
		if (action == "add") {
			menu.body.push(items);
			draw($(this), menu);
		} else if (action == "set") {
			menu = items;
			draw($(this), menu);
		}
		return this;
	};
}

function dataLoad() {
    console.log("dataLoad :: getSelectedID → " + selectedPdService);
    $.ajax({
        url: "/auth-user/api/arms/pdServicePure/getNode.do",
        data: { c_id: selectedPdService },
        method: "GET",
        dataType: "json",
    }).done(function (json) {
        $("#selected_pdservice").text(json.c_title); // sender 이름 바인딩
    });

	$.ajax("/auth-user/api/arms/pdServiceDetail/getNodes.do/" + selectedPdService).done(function (json) {
		console.log("dataLoad :: success → ", json);
		$("#pdservice_detail_accordion").jsonMenu("set", json.response, { speed: 5000 });
	});
}

function draw(main, menu) {
	main.html("");

	var data = "";
	for (var i = 0; i < menu.length; i++) {
		data += `
           <div class="panel">
               <div class="panel-heading">
                   <a class="accordion-toggle collapsed"
                            data-toggle="collapse"
                            id="pdservice_detail_link_${menu[i].c_id}"
                            style="color: #a4c6ff; text-decoration: none; cursor: pointer;"
                            onclick="detailClick(this, ${menu[i].c_id});
                            return false;">
                       ${menu[i].c_title}
                   </a>
               </div>
           </div>`;
	}

	main.html(data);
}

function detailClick(element, c_id) {
	console.log("detailClick:: c_id  -> ", c_id);
	hideDropzoneArea();

	$("a[id^='pdservice_detail_link_']").each(function() {
		this.style.background = "";
		if (c_id == this.id.split("_")[3]) {
			this.style.background = "rgba(229, 96, 59, 0.3)";
			this.style.color = "rgb(164, 198, 255)";
			this.style.textDecoration = "none";
			this.style.cursor = "pointer";
		}
	});

	$.ajax({
		url: "/auth-user/api/arms/pdServiceDetail/getNode.do",
		data: { c_id: c_id },
		method: "GET",
		dataType: "json"
	}).done(function (json) {
			console.log(json);

			selectedDetailId = json.c_id;
			selectedDetailName = json.c_title;

			$("#fileIdlink").val(selectedDetailId);

			$("#selected_pdservice_detail").text(selectedDetailName);

			CKEDITOR.instances.pdservice_detail_contents.setData(json.c_contents); // 상세 보기

			if (json.c_drawio_image_raw != null && json.c_drawio_image_raw != "") {
				var imageSrcArray = Array(1).fill(json.c_drawio_image_raw);
				addImageToSwiper(imageSrcArray, "pdservice_detail_drawio_swiper_container");
				$("#pdservice_detail_drawio_swiper").show();
				$("#pdservice_detail_drawio_div").show();
				selectedPdServiceDetail = json.c_id;
			} else {
				$("#pdservice_detail_drawio_swiper").hide();
				$("#pdservice_detail_drawio_div").hide();
			}

			var $fileupload = $("#fileupload");

			$.ajax({
				url: "/auth-user/api/arms/pdServiceDetail/getFilesByNode.do",
				data: { fileIdLink: selectedDetailId },
				dataType: "json",
				context: $fileupload[0]
			}).done(function(result) {
				$(this).fileupload("option", "done").call(this, null, { result: result.response });
				$(".file-delete-btn").hide();

			    jSuccess("기획서 조회가 완료 되었습니다.");
			});

	}).fail(function(xhr, status, errorThrown) {
		console.log(xhr + status + errorThrown);
	}).always(function(xhr, status) {
		$("#text").html("요청이 완료되었습니다!");
		console.log(xhr + status);
	});
}

function viewDrawIO() {
	if(selectedPdServiceDetail) {
		window.open('/reference/drawio?id='+selectedPdServiceDetail+ '&type=view&splash=0&armsType=product', '_blank');
	}
	return false;
}