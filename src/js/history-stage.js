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
let margin = 0;
let inRows = false;

function resize() {
	const w = $figure.node().offsetWidth;
	const widthA = Math.floor(w / (maxBoys + 1));
	const widthB = Math.floor(w / (MIN_BOYS_WIDE + 1));
	boyWidth = widthA >= IDEAL_BOY_SIZE ? widthA : widthB;

	margin = boyWidth / 2;
	const boyHeight = boyWidth / BOY_RATIO;
	const infoHeight = $info.node().offsetHeight;
	// const bp = w * maxBoys + margin * 2;
	inRows = boyWidth * maxBoys > w - margin * 2;

	$boys.st('padding', `0 ${margin}px`);

	if ($boy) {
		$figure.st('height', boyHeight * (inRows ? 2 : 1) + infoHeight);
		$boy.st({ width: boyWidth, height: boyHeight });
		$boys.st({ height: boyHeight });
	}
}
function updatePosition(subset) {
	// center out
	$boy.classed('is-visible', (d, i) => subset[i]);
	const total = subset.filter(s => s).length;
	const shouldOffset =
		inRows && total === 3 ? true : !inRows && total % 2 === 0;
	const offset = shouldOffset ? boyWidth / 2 : 0;
	$boys.st('left', offset);
	$boys.on(transitionEvent, () => {
		Animation.transitionEnd();
	});
}

function updateBoy({ boys, subset }) {
	const subsetIndex = subset.map((s, i) => (s ? i : null));
	const subsetActive = subsetIndex.filter(s => s !== null);
	boys.forEach((b, index) => {
		const $b = $boy.filter(
			(d, i) => i === subsetIndex.findIndex(s => s === subsetActive[index])
		);

		Appearance.change({ $svg: $b.select('svg'), d: b });
		// Update name
		$b.select('.boy__name').text(b.name);
	});
}

function getSubset(total) {
	const subset = d3.range(maxBoys).map(d => false);
	if (inRows) {
		const activate = d3.range(total);
		const top = activate.slice(0, 4);
		const bottom = activate.slice(4, maxBoys);
		top.forEach(a => (subset[a] = true));
		if (bottom.length === 1) subset[5] = true;
		else bottom.forEach(b => (subset[b] = true));
	} else {
		const mid = Math.floor(maxBoys / 2);
		const half = Math.floor(total / 2);
		const start = Math.floor(mid) - half;
		const end = start + total;
		d3.range(start, end).forEach(d => (subset[d] = true));
	}
	return subset;
}

function getShift(total) {
	if (inRows) return prevBoyCount === 3 && total !== 3;
	return Math.abs(prevBoyCount - total) % 2 === 1;
}

function update({ boys, danceSpeed }) {
	resize();
	const total = boys.length;
	const subset = getSubset(total);
	const shift = getShift(total);
	updatePosition(subset);
	updateBoy({ boys, subset });
	const cat = danceSpeed;
	const preInstruments = boys.map(b => b.instrument);

	preInstruments.reverse();
	const instruments = subset.map(s => {
		if (s) return preInstruments.pop();
		return null;
	});
	Animation.transition({ shift, cat, instruments, subset });
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
