import animation from './animation';
import audio from './audio';

const $section = d3.select('#history');
const $figure = $section.select('.history__figure');
const $boys = $figure.select('.figure__boys');
let $boy = null;

let bandData = [];
let currentBandIndex = -1;

const layers = ['hair'];

function updateAppearance({ boys }) {
	boys.forEach((b, index) => {
		const $b = $boy.filter((d, i) => i === index);
		layers.forEach(l => {
			// $b.selectAll(`.${l}`).st('opacity', 0);
			// $b.select(`.${l}--${b[l]}`)
			console.log(b[`${l}_color`]);
			$b.select(`.${l} path`)
				.st('opacity', 1)
				.st('fill', b[`${l}_color`]);
		});
	});
}

function swapBoys(dir) {
	currentBandIndex += dir;
	currentBandIndex = Math.min(
		bandData.length - 1,
		Math.max(0, currentBandIndex)
	);

	const data = bandData[currentBandIndex];

	// change arrangement
	$boy.classed('is-visible', (d, i) => i < data.boys.length);
	// change music

	// change layer style
	updateAppearance(data);
}

function setupBoys() {
	const max = d3.max(bandData, d => d.boys.length);
	const data = d3.range(max);

	$boy = $boys
		.selectAll('.boy')
		.data(data)
		.enter()
		.append('div.boy');

	animation.create($boy.nodes());
}

function resize(){}

function init(data) {
	bandData = data;
	setupBoys();
	swapBoys(1);
	$section.classed('is-selected', true);
	$section.on('click', () => swapBoys(1));
}

export default { init, resize };
