import lottie from 'lottie-web';

let animationData = null;
const animations = {};
let current = null;

function create({ nodes, group }) {
	animations[group] = nodes.map(n => {
		const options = {
			animationData,
			container: n,
			loop: true,
			autoplay: false
		};
		return lottie.loadAnimation(options);
	});
}

function pause() {
	animations[current].forEach(a => {
		a.goToAndStop(0, true);
	});
}

function play(group) {
	if (current) pause();
	current = group;
	animations[group].forEach(a => {
		a.playSegments([48, 144], true);
	});
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

export default { load, create, play };
