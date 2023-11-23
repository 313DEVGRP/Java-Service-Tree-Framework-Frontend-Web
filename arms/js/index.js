gsap.registerPlugin(Observer);

const sections = document.querySelectorAll('section');
const images = document.querySelectorAll('.bg');
const dots = document.querySelectorAll('.dot');
const outerWrappers = gsap.utils.toArray('.outer');
const innerWrappers = gsap.utils.toArray('.inner');

let animating;
let currentIndex = -1;

gsap.set(outerWrappers, { yPercent: 100 });
gsap.set(innerWrappers, { yPercent: -100 });

function gotoSection(index, direction) {
	animating = true;

	const fromTop = direction === -1;
	const dFactor = fromTop ? -1 : 1;
	const tl = gsap.timeline({
		defaults: { duration: 1, ease: 'power1.inOut' },
		onComplete: () => (animating = false),
	});

	if (currentIndex >= 0) {
		gsap.set(sections[currentIndex], { zIndex: 0 });

		tl.to(images[currentIndex], { yPercent: -15 * dFactor })
			.set(sections[currentIndex], { autoAlpha: 0 })
			.fromTo(
				images[currentIndex],
				{ scale: 1, autoAlpha: 1 },
				{ scale: 0.5, autoAlpha: 0 },
				0
			);

		dots[currentIndex].classList.remove('active');
	}

	gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
	gsap.set(images[index], { scale: 1, autoAlpha: 1 });

	tl.fromTo(
		[outerWrappers[index], innerWrappers[index]],
		{
			yPercent: (i) => (i ? -100 * dFactor : 100 * dFactor),
		},
		{
			yPercent: 0,
		},
		0
	).fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0);

	dots[index].classList.add('active');

	currentIndex = index;
}

Observer.create({
	type: 'wheel,touch,pointer',
	wheelSpeed: -1,
	onDown: () => {
		if (animating) return;
		if (currentIndex - 1 < 0) return;

		gotoSection(currentIndex - 1, -1);
	},
	onUp: () => {
		if (animating) return;
		if (currentIndex + 1 >= sections.length) return;

		gotoSection(currentIndex + 1, 1);
	},
	tolerance: 10,
	preventDefault: true,
});

[].forEach.call(document.querySelectorAll('.btn'), (btn, i) => {
	btn.addEventListener('click', () =>
		gotoSection(i, currentIndex > i ? -1 : 1)
	);
});

gotoSection(0, 1);

// original: https://codepen.io/BrianCross/pen/PoWapLP
// horizontal version: https://codepen.io/GreenSock/pen/xxWdeMK
