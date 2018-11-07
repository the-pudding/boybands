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
	if (!c) console.log('no color', val);
	return c || colors.black;
}

function getItem(val) {
	const match = crosswalk.find(d => d.value === val);
	if (!match) console.log('no item', val);
	return match;
}

function skin({ $svg, d }) {
	const col = getColor(d.skin);
	$svg.selectAll('.skin g path').st({ fill: col, stroke: col });
}

function hair({ $svg, d }) {
	const item = getItem(d.hair_style);
	const col = getColor(d.hair_color);

	const $base = $svg.select(`.hair-front--${item.layer_base}`);
	if ($base.size()) $base.st('display', 'block');

	// check side count and show front and/or back of style
	item.layer_extra.forEach(layer => {
		const $f = $svg.select(`.hair-front--${layer}-${d.hair_length}`);
		if ($f.size())
			$f.st('display', 'block')
				.selectAll('g path')
				.st({ fill: col, stroke: col });
		if (item.sides === 2) {
			const $b = $svg.select(`.hair-back--${layer}-${d.hair_length}`);
			if ($b.size())
				$b.st('display', 'block')
					.selectAll('g path')
					.st({ fill: col, stroke: col });
		}
	});
}

function accessories({ $svg, d }) {
	d.accessories.forEach(accessory => {
		const item = getItem(accessory);

		// check side count and show front and/or back of style
		item.layer_extra.forEach(layer => {
			const $f = $svg.select(`.accessories-front--${layer}`);
			if ($f.size()) $f.st('display', 'block');
			if (item.sides === 2) {
				const $b = $svg.select(`.accessories-back--${layer}`);
				if ($b.size()) $b.st('display', 'block');
			}
		});
	});
}

function top({ $svg, d }) {
	d.top_style.forEach(t => {
		const item = getItem(t);
		const col = ['jacket', 'vest'].includes(t)
			? getColor(d.jacket_color)
			: getColor(d.shirt_color);

		const $base = $svg.select(`.top--${item.layer_base}`);
		if ($base.size()) $base.st('display', 'block');

		item.layer_extra.forEach(layer => {
			const $t = $svg.select(`.top--${layer}`);
			if ($t.size())
				$t.st('display', 'block')
					.selectAll('g path')
					.st({ fill: col, stroke: col });
		});
	});
}

function bottom({ $svg, d }) {
	const item = getItem(d.bottom_style);
	const col = getColor(d.bottom_color);

	const $base = $svg.select(`.bottom--${item.layer_base}`);
	if ($base.size()) $base.st('display', 'block');

	item.layer_extra.forEach(layer => {
		const $b = $svg.select(`.bottom--${layer}`);
		if ($b.size())
			$b.st('display', 'block')
				.selectAll('g path')
				.st({ fill: col, stroke: col });
	});
}

function facialHair({ $svg, d }) {
	d.facial_hair.forEach(f => {
		const item = getItem(f);
		const col = getColor(d.hair_color);

		item.layer_extra.forEach(layer => {
			const $f = $svg.select(`.facial-hair--${layer}`);
			if ($f.size())
				$f.st('display', 'block')
					.selectAll('g path')
					.st({ fill: col, stroke: col });
		});
	});
}

function instrument({ $svg, d }) {
	const $i = $svg.select(`.instrument--${d.instrument}`);
	if ($i.size()) $i.st('display', 'block');
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
	accessories({ $svg, d });
	top({ $svg, d });
	bottom({ $svg, d });
	facialHair({ $svg, d });
	instrument({ $svg, d });
}

function init() {}

export default { init, change };
