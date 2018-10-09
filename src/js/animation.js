import lottie from 'lottie-web';

let animationData = null;
let animations = [];

function create(nodes) {
	animations = nodes.map(n => {
		const options = {
			animationData,
			container: n,
			loop: true,
			autoplay: false
		};
		return lottie.loadAnimation(options);
	});
}

function load() {
	return new Promise((resolve, reject) => {
		d3.loadData('assets/animation/data.json', (err, response) => {
			if (err) reject(err);
			else {
				animationData = response[0];
				resolve();
			}
		});
	});
}

export default { load, create };
