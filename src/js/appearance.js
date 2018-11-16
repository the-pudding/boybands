import colors from './colors';
import crosswalkRaw from './crosswalk';

const layerClasses = [
	'hair-front',
	'hair-back',
	'accessories-front',
	'accessories-back',
	'top',
	'bottom',
	'facial-hair',
	'instrument'
];

const crosswalk = crosswalkRaw.map(d => ({
	...d,
	sides: +d.sides,
	layer_extra: d.layer_extra
		.split(',')
		.map(v => v.trim())
		.filter(v => v)
}));

function getColor(val) {
	const c = colors[val];
	if (!c) console.log(`no color: ${val}`);
	return c || colors.black;
}

function getItem(val) {
	const match = crosswalk.find(d => d.value === val);
	if (!match) console.log(`no item in crosswalk: ${val}`);
	return match;
}

function activateLayer({ $svg, selector, col }) {
	// console.log(`activate: ${selector}`);
	const $el = $svg.select(selector);
	if ($el.size()) {
		$el.st('display', 'block');
		if (col) $el.selectAll('g path').st({ fill: col, stroke: col });
	} else console.log(`no svg: ${selector}`);
}

function skin({ $svg, d }) {
	const col = getColor(d.skin);
	$svg.selectAll('.skin g path').st({ fill: col, stroke: col });
}

function hair({ $svg, d }) {
	const styles = d.hair_style.split(',').map(v => v.trim());
	styles.forEach(s => {
		const item = getItem(s);
		const col = getColor(d.hair_color);
		$svg.select('.skin--bald').st('display', 'none');
		$svg.select('.skin--general').st('display', 'none');
		// if no item, do bald
		const base = `.skin--${item ? item.layer_base : 'bald'}`;
		activateLayer({ $svg, selector: base });

		// check side count and show front and/or back of style
		if (item) {
			item.layer_extra.forEach(layer => {
				const front = `.hair-front--${layer}-${d.hair_length}`;
				const back = `.hair-back--${layer}-${d.hair_length}`;
				activateLayer({ $svg, selector: front, col });
				if (item.sides === 2) activateLayer({ $svg, selector: back, col });
			});
		}
	});
}

function accessories({ $svg, d }) {
	d.accessories.forEach(accessory => {
		const item = getItem(accessory);

		const front = `.accessories-front--${item.value}`;
		const back = `.accessories-back--${item.value}`;
		activateLayer({ $svg, selector: front });
		if (item.sides === 2) activateLayer({ $svg, selector: back });
	});
}

function top({ $svg, d }) {
	d.top_style.forEach(t => {
		const item = getItem(t);
		const col = ['jacket', 'vest'].includes(t)
			? getColor(d.jacket_color)
			: getColor(d.shirt_color);

		const base = `.top--${item.layer_base}`;
		activateLayer({ $svg, selector: base, col });

		$svg.select('.skin--sleeveless').st('display', 'none');
		$svg.select('.skin--chest').st('display', 'none')

		item.layer_extra.forEach(layer => {
			activateLayer({ $svg, selector: `.${layer}`, col });
		});
	});
}

function bottom({ $svg, d }) {
	const item = getItem(d.bottom_style);
	const col = getColor(d.bottom_color);

	const baseR = `.bottom--right-base-${item.layer_base}`;
	const baseL = `.bottom--left-base-${item.layer_base}`;
	const baseW = '.bottom--waist';
	activateLayer({ $svg, selector: baseR, col });
	activateLayer({ $svg, selector: baseL, col });
	activateLayer({ $svg, selector: baseW, col });

	item.layer_extra.forEach(layer => {
		activateLayer({ $svg, selector: `.${layer}`, col });
	});
}

function facialHair({ $svg, d }) {
	d.facial_hair.forEach(f => {
		const item = getItem(f);
		const col = getColor(d.hair_color);

		item.layer_extra.forEach(layer => {
			const selector = `.facial-hair--${layer}`;
			activateLayer({ $svg, selector, col });
		});
	});
}

function instrument({ $svg, d }) {
	if (d.instrument) {
		const selector = `.instrument--${d.instrument}`;
		activateLayer({ $svg, selector });
	}
}

function disable($svg) {
	layerClasses.forEach(layer => {
		$svg.selectAll(`.${layer}`).st('display', 'none');
	});
}

function change({ $svg, d }) {
	disable($svg);
	skin({ $svg, d });
	hair({ $svg, d });
	// accessories({ $svg, d });
	top({ $svg, d });
	bottom({ $svg, d });
	facialHair({ $svg, d });
	instrument({ $svg, d });
}

function init() {}

export default { init, change };
