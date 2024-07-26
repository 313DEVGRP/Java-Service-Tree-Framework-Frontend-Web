function addImageToSwiper(imageSrcArray, swiperContainerId) {
	console.log("setDrawioImage" +swiperContainerId);
	var swiperInstance = document.getElementById(swiperContainerId).swiper;
	var thumbsSwiperInstance = document.getElementById(swiperContainerId + '_thumbs').swiper;
	var mainSwiperContainer = document.querySelector('#' + swiperContainerId + ' .swiper-wrapper');
	var thumbsSwiperContainer = document.querySelector('#' + swiperContainerId + '_thumbs' + ' .swiper-wrapper');
	if (swiperInstance) {
		console.log("setDrawioImage swiperInstance.removeAllSlides");
		mainSwiperContainer.innerHTML = '';
	}

	if (thumbsSwiperInstance) {
		console.log("setDrawioImage thumbsSwiperInstance.removeAllSlides");
		thumbsSwiperContainer.innerHTML = '';
	}

	for (var i = 0; i < imageSrcArray.length; i++) {
		var mainSlide = document.createElement('div');
		mainSlide.className = 'swiper-slide';
		var mainImage = document.createElement('img');
		mainImage.src = imageSrcArray[i];
		mainSlide.appendChild(mainImage);
		mainSwiperContainer.appendChild(mainSlide);

		var thumbsSlide = document.createElement('div');
		thumbsSlide.className = 'swiper-slide';
		var thumbsImage = document.createElement('img');
		thumbsImage.src = imageSrcArray[i];
		thumbsSlide.appendChild(thumbsImage);
		thumbsSwiperContainer.appendChild(thumbsSlide);
	}

	thumbsSwiperInstance = new Swiper('#' + swiperContainerId + '_thumbs', {
		spaceBetween: 0,
		// slidesPerView: imageSrcArray.length,
		slidesPerView: 4,
		freeMode: true,
		watchSlidesVisibility: true,
		watchSlidesProgress: true,
	});

	swiperInstance = new Swiper('#' + swiperContainerId, {
		spaceBetween: 10,
		pagination: {
			el: '.swiper-pagination',
			// clickable: true,
			type: "fraction",
		},
		slidesPerView: 1,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		thumbs: {
			swiper: thumbsSwiperInstance,
		},
	});

	var slides = document.querySelectorAll("#" + swiperContainerId + " .swiper-slide");
	if (slides.length === 1) {
		document.querySelector("#" + swiperContainerId + " .swiper-pagination").style.display = "block";
		document.querySelector("#" + swiperContainerId + " .swiper-button-next").style.display = "block";
		document.querySelector("#" + swiperContainerId + " .swiper-button-prev").style.display = "block";
		swiperInstance.navigation.nextEl.classList.add("swiper-button-disabled");
		swiperInstance.navigation.prevEl.classList.add("swiper-button-disabled");
	}
}

function changeBtnText(btn, msg) {
	$(btn).text(msg);
}

function removeDrawIOConfig() {
	localStorage.removeItem('.drawio-config');
}

function convertToSeoulTime(utcDateTime) {
	var date = new Date(utcDateTime);

	var options = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZone: "Asia/Seoul"
	};

	var formatter = new Intl.DateTimeFormat("ko-KR", options);
	var formattedDate = formatter.format(date);

	formattedDate = formattedDate.replace(/(\d{4})\.(\d{2})\.(\d{2})\.\s(\d{2}):(\d{2}):(\d{2})/, "$1-$2-$3 $4:$5:$6");

	return formattedDate;
}

function convertToSeoulTimeWithMeridiem(utcDateTime) {
	var date = new Date(utcDateTime);

	var options = {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
		timeZone: 'Asia/Seoul'
	};

	var formatter = new Intl.DateTimeFormat('ko-KR', options);
	var formattedTime = formatter.format(date);

	// 포맷된 문자열을 원하는 형식으로 변환
	formattedTime = formattedTime.replace(/(오전|오후)\s(\d{2}):(\d{2}):(\d{2})/, '$1 $2:$3:$4');

	return formattedTime;
}
