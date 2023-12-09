////////////////////////////////////////////////////////////////////////////////////////
//Document Ready ( execArmsDocReady )
////////////////////////////////////////////////////////////////////////////////////////
var urlParams;
var selectedPdService;
var selectedPdServiceVersion;
var selectedJiraServer;
var selectedJiraProject;
var selectedJsTreeId; // 요구사항 아이디
var calledAPIs = {};
var totalReqCommentCount;
/* 요구사항 전체목록 전역변수 */
var reqTreeList;
var visibilityStatus = {
	"#stats": false,
	"#detail": false,
	"#version": false,
	"#allreq": false,
	"#files": false,
	"#question": false
};

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
			"../reference/lightblue4/docs/lib/slimScroll/jquery.slimscroll.min.js"
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
			// 스크립트 실행 로직을 이곳에 추가합니다.
			fileLoadByPdService();
		})
		.catch(function () {
			console.error("플러그인 로드 중 오류 발생");
		});
}

function callAPI(apiName) {
	if (calledAPIs[apiName]) {
		console.log("This API has already been called: " + apiName);
		return true;
	}

	return false;
}

function setUrlParams() {
	urlParams = new URL(location.href).searchParams;
	selectedPdService = urlParams.get("pdService");
	selectedPdServiceVersion = urlParams.get("pdServiceVersion");
	selectedJsTreeId = urlParams.get("reqAdd");
	selectedJiraServer = urlParams.get("jiraServer");
	selectedJiraProject = urlParams.get("jiraProject");
}

function fileLoadByPdService() {
	console.log("File Tab ::::");

	if (callAPI("fileAPI")) {
		return;
	}

	// $("#fileIdlink").val(selectedPdService);
	$(".spinner").html('<i class="fa fa-spinner fa-spin"></i> 데이터를 로드 중입니다...');
	$.ajax({
		url: "/auth-user/api/arms/fileRepository/getFilesByNode.do",
		data: { fileIdLink: selectedPdService },
		async: false,
		dataType: "json"
	}).done(function (result) {
		console.log(result.files);
		calledAPIs["fileAPI"] = true;

		bindFileList(result);

		jSuccess("기획서 조회가 완료 되었습니다.");
	});
}

function bindFileList(result) {
	if (result.files.length === 0) {
		noFileMessage();
		return;
	}

	getFiles = result.files;

	createFileList(result.files);
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function noFileMessage() {
	let $container = $("#files-container");

	var $noDataHtml = $(`<p style="width: 100%; text-align: center; font-size: 20px;">
                                    <i class="bi bi-file-earmark-x" style="font-size:50px;"></i><br>
                                    등록된 파일이 없습니다.
                                  </p>`);
	$container.append($noDataHtml);
}

function filteredFiles(type) {
	if (!type) return getFiles;
	return getFiles.filter((file) => type.some((t) => file.contentType.includes(type)));
}

function createFileList(files) {
	const $portfolioContainer = $("#filter-files");
	$portfolioContainer.empty();

	files.forEach(function (file) {
		var filterClass;
		if (file.contentType.includes("image")) {
			filterClass = "filter-image";
		} else if (file.contentType.includes("text")) {
			filterClass = "filter-doc";
		} else if (file.contentType.includes("application")) {
			filterClass = "filter-doc";
		} else {
			filterClass = "filter-etc";
		}

		var imgSrc = iconsMap[file.contentType] || prefix + "Default.png";
		var title = file.fileName;
		var downloadUrl = file.url;
		var thumbnailUrl = file.thumbnailUrl;
		var fileSize = formatBytes(file.size, 3);
		var imageLinkHtml = "";

		var $newHtml = $(`
				<div class="col-lg-2 col-md-3 col-sm-3 portfolio-item ${filterClass}">
					<div class="portfolio-item-wrap">
						<img src="${imgSrc}" class="img-fluid" alt="" style="margin:auto;">
						<div class="portfolio-info">
							<h4>${title}</h4>
							<p>${fileSize}</p>
							<div class="portfolio-links">
									<a href="${downloadUrl}" class="portfolio-details-lightbox" data-glightbox="type: external" title="${title}"><i class="fa fa-download"></i></a>
								${imageLinkHtml}
							</div>
						</div>
					</div>
				</div>
			`);

		const imgLoadCheck = new Image();
		imgLoadCheck.src = imgSrc;

		imgLoadCheck.onload = function () {
			$portfolioContainer.append($newHtml);
		};
	});
}

$(".filter-option").click(function () {
	$(this).siblings().removeClass("filter-active");
	$(this).addClass("filter-active");

	console.log($(this).data("filter"));

	createFileList(filteredFiles($(this).data("filter").split(",")));
});
