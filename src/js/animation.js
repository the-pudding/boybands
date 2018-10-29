import lottie from 'lottie-web';

let animationData = null;
let animations = [];

function create(nodes) {
	animations = nodes.map(n => {
		const options = {
			animationData,
			container: n,
			loop: true,
			autoplay: true
		};
		return lottie.loadAnimation(options);
	});

	animations.forEach(a => {
		a.setSubframe(false);
		a.playSegments([0, 48], true);
	});

	setTimeout(() => {
		animations.forEach(a => {
			a.playSegments([48, 144], true);
		});
	}, 5000);
}

function load() {
	return new Promise((resolve, reject) => {
		d3.loadData('assets/animation/data3.json', (err, response) => {
			if (err) reject(err);
			else {
				animationData = response[0];
				resolve();
			}
		});
	});
}

export default { load, create };
