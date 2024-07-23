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