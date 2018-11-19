import Animation from './animation';
import Appearance from './appearance';
import transitionEvent from './utils/transition-event';

const BOY_W = 170;
const BOY_H = 320;
const IDEAL_BOY_SIZE = 100;
const BOY_RATIO = BOY_W / BOY_H;
const MIN_BOYS_WIDE = 4;
const $section = d3.select('#history');
const $figure = $section.select('figure');
const $info = $figure.select('.figure__info');
const $boys = $figure.select('.figure__boys');

let $boy = null;
let maxBoys = 0;
let boyWidth = 0;
let prevBoyCount = 0;
let bp = 0;
let margin = 0;

function resize() {
	const w = $figure.node().offsetWidth;
	const widthA = Math.floor(w / (maxBoys + 1));
	const widthB = Math.floor(w / (MIN_BOYS_WIDE + 1));
	const width = widthA >= IDEAL_BOY_SIZE ? widthA : widthB;
	console.log({ widthA, widthB, width });
	margin = width / 2;
	// width = 100
	const height = width / BOY_RATIO;
	// height = 68
	const infoH = $info.node().offsetHeight;
	bp = w * maxBoys + margin * 2;
	// bp = 100 * 7 = 700
	const mult = w < bp ? 2 : 1;
	$boys.st('padding', `0 ${margin}px`);

	// mult = 2
	if ($boy) {
		$figure.st('height', height * mult + infoH);
		$boy.st({ width, height });
		$boys.st({ height });
	}

	boyWidth = width;
}

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

function update({ boys, danceSpeed }) {
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
	const cat = danceSpeed;
	const instruments = boys.map(b => b.instrument);
	Animation.transition({ shift, cat, instruments, start });
	prevBoyCount = total;
}

function init({ bandData, cb }) {
	maxBoys = d3.max(bandData, d => d.boys.length);
	const data = d3.range(maxBoys);
	prevBoyCount = bandData[0].boys.length;

	$boy = $boys.selectAll('.boy').data(data);

	const $boyEnter = $boy.enter().append('div.boy');

	$boyEnter.append('p').attr('class', 'boy__name');

	$boy = $boyEnter.merge($boy);
	Animation.create({ nodes: $boy.nodes(), group: 'all', cb });
	Animation.play({});
	Appearance.init();
	resize();
}

export default { init, update, resize };
