import Animation from './animation';
import Appearance from './appearance';
import transitionEvent from './utils/transition-event';

const BOY_W = 170;
const BOY_H = 320;
const BOY_RATIO = BOY_W / BOY_H;
const MIN_BOY_SIZE = 96;
const MARGIN = 20;
const $section = d3.select('#history');
const $figure = $section.select('figure');
const $info = $figure.select('.figure__info');
const $boys = $figure.select('.figure__boys');

let $boy = null;
let maxBoys = 0;
let boyWidth = 0;
let stacked = false;
let prevBoyCount = 0;

function updatePosition({ start, end }) {
	// center out
	$boy.classed('is-visible', (d, i) => i >= start && i < end);
	const offset = (end - start) % 2 === 0 ? boyWidth / 2 : 0;
	$boys.st('left', offset);
	$boys.on(transitionEvent, () => {
		Animation.transitionEnd();
	});
}

function updateBoy({ boys, subset }) {
	boys.forEach((b, index) => {
		const $b = $boy.filter((d, i) => i === index + subset.start);
		Appearance.change({ $svg: $b.select('svg'), d: b });
		// Update name
		$b.select('.boy__name').text(b.name);
	});
}

function resize() {
	const w = $figure.node().offsetWidth - MARGIN * 2;
	const width = Math.max(Math.floor(w / maxBoys), MIN_BOY_SIZE);
	const height = width / BOY_RATIO;
	const infoH = $info.node().offsetHeight;
	stacked = width === MIN_BOY_SIZE;

	if ($boy) {
		$figure.st('height', height + infoH);
		$boy.st({ width, height });
		$boys.st({ height });
	}

	boyWidth = width;
}

function update({ boys }) {
	resize();
	const mid = Math.floor(maxBoys / 2);
	const total = boys.length;
	const half = Math.floor(total / 2);
	const start = Math.floor(mid) - half;
	const end = start + total;
	const subset = { start, end };

	updatePosition(subset);
	updateBoy({ boys, subset });
	// styles - pop, slow, instrument
	const shift = Math.abs(prevBoyCount - total) % 2 === 1;
	const cat = 'pop';
	Animation.transition({ shift, cat });

	prevBoyCount = total;
}

function init(bandData) {
	maxBoys = d3.max(bandData, d => d.boys.length);
	const data = d3.range(maxBoys);
	prevBoyCount = bandData[0].boys.length;

	$boy = $boys.selectAll('.boy').data(data);

	const $boyEnter = $boy.enter().append('div.boy');

	$boyEnter.append('p').attr('class', 'boy__name');

	$boy = $boyEnter.merge($boy);

	Animation.create({ nodes: $boy.nodes(), group: 'all' });
	Animation.play({});
	Appearance.init();
	resize();
}

export default { init, update, resize };
