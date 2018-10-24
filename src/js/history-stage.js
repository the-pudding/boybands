import Animation from './animation';

const MIN_BOY_SIZE = 72;
const MARGIN = 20;
const $section = d3.select('#history');
const $figure = $section.select('.history__figure');
const $boys = $figure.select('.figure__boys');
let $boy = null;
let width = 0;
let maxBoys = 0;
let boySize = 0;
let stacked = false;

const layers = ['hair'];

function updateAppearance({ boys, subset }) {
	let index = subset.start;
	boys.forEach(b => {
		const $b = $boy.filter((d, i) => i === index);
		// Update name
		$b.select('.boy__name').text(b.name);
		layers.forEach(l => {
			// $b.selectAll(`.${l}`).st('opacity', 0);
			// $b.select(`.${l}--${b[l]}`)
			$b.select(`.${l}--fade-high path`)
				.st('opacity', 1)
				.st('fill', b[`${l}_color`]);

			$b.select(`.${l}--swept-long`).st('display', 'none');
		});

		index += 1;
	});
}

function updatePosition({ subset }) {
	// center out
	$boy.classed('is-visible', (d, i) => i >= subset.start && i < subset.end);
}

function resize() {
	width = $figure.node().offsetWidth - MARGIN * 2;
	boySize = Math.floor(width / maxBoys);
	boySize = Math.max(boySize, MIN_BOY_SIZE);
	stacked = boySize === MIN_BOY_SIZE;
	$boy.st('width', boySize);
}

function update({ boys }) {
	resize();
	const mid = Math.floor(maxBoys / 2);
	const total = boys.length;
	const half = Math.floor(total / 2);
	const start = Math.floor(mid) - half;
	const end = start + total;
	const subset = { start, end };

	updateAppearance({ boys, subset });
	updatePosition({ boys, subset });
}

function init(bandData) {
	maxBoys = d3.max(bandData, d => d.boys.length);
	const data = d3.range(maxBoys);

	$boy = $boys.selectAll('.boy').data(data);

	const $boyEnter = $boy.enter().append('div.boy');

	$boyEnter
		.append('p')
		.attr('class', 'boy__name')
		.text('name');

	$boy = $boyEnter.merge($boy);

	Animation.create($boy.nodes());
}

export default { init, update, resize };
