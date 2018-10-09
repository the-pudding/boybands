/* global d3 */
let animationData = null;
const $container = d3.select('#bodymovin');

function resize() {}

function loadAnimation() {
	console.time('data');
	d3.loadData('assets/animation/data.json', (err, response) => {
		if (err) console.log(err);
		else {
			console.timeEnd('data');
			animationData = response[0];
			setupAnimation();
		}
	});
}

function setupAnimation() {
	console.time('animation');
	const data = d3.range(5).map(d => ({
		animationData,
		container: null,
		// autoplay: true,
		loop: true
	}));

	$container
		.selectAll('.person')
		.data(data)
		.enter()
		.append('div.person');

	const anims = data.map((d, i) => {
		d.container = $container.selectAll('.person').nodes()[i];
		return lottie.loadAnimation(d);
	});

	anims.forEach((a, i) => {
		a.goToAndStop(i % 24, true);
	});
	console.timeEnd('animation');
	// let hair = d3.select('.hair').select('g').select('path')

	$container.selectAll('.person').on('click', (d, i) => {
		anims[i].play();
	});

	// console.log({hair})
}

function init() {
	loadAnimation();
}

export default { init, resize };
