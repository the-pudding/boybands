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
	const styles = d.hair_style.split(',').map(v => v.trim());
	styles.forEach(s => {
		const item = getItem(s);
		const col = getColor(d.hair_color);
		$svg.select('.skin--bald').st('display', 'none');
		$svg.select('.skin--general').st('display', 'none');
		// if no item, do bald
		const $base = $svg.select(`.skin--${item ? item.layer_base : 'bald'}`);
		if ($base.size()) $base.st('display', 'block');

		// check side count and show front and/or back of style
		if (item) {
			item.layer_extra.forEach(layer => {
				// TODO add -${d.hair_length}
				const $f = $svg.select(`.hair-front--${layer}`);
				if ($f.size())
					$f.st('display', 'block')
						.selectAll('g path')
						.st({ fill: col, stroke: col });
				if (item.sides === 2) {
					const $b = $svg.select(`.hair-back--${layer}`);
					if ($b.size())
						$b.st('display', 'block')
							.selectAll('g path')
							.st({ fill: col, stroke: col });
				}
			});
		}
	});
}

function accessories({ $svg, d }) {
	d.accessories.forEach(accessory => {
		const item = getItem(accessory);
		// check side count and show front and/or back of style
		const $f = $svg.select(`.accessories-front--${item.value}`);
		if ($f.size()) $f.st('display', 'block');
		if (item.sides === 2) {
			const $b = $svg.select(`.accessories-back--${item.value}`);
			if ($b.size()) $b.st('display', 'block');
		}
	});
}

function top({ $svg, d }) {
	d.top_style.forEach(t => {
		// console.log(t);
		const item = getItem(t);
		// console.log(item);
		const col = ['jacket', 'vest'].includes(t)
			? getColor(d.jacket_color)
			: getColor(d.shirt_color);

		const $base = $svg.select(`.top--${item.layer_base}`);
		if ($base.size()) $base.st('display', 'block');

		$base.selectAll('g path').st({ fill: col, stroke: col });

		// TODO handle skin--sleeveless
		$svg.select('.skin--sleeveless').st('display', 'none');

		item.layer_extra.forEach(layer => {
			const $t = $svg.select(`.${layer}`);
			if ($t.size())
				$t.st('display', 'block')
					.selectAll('g path')
					.st({ fill: col, stroke: col });
		});
	});
}

function bottom({ $svg, d }) {
	console.log(d.bottom_style);
	const item = getItem(d.bottom_style);
	const col = getColor(d.bottom_color);
	console.log(item);

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
	// skin({ $svg, d });
	// hair({ $svg, d });
	// accessories({ $svg, d });
	// top({ $svg, d });
	// bottom({ $svg, d });
	// facialHair({ $svg, d });
	// instrument({ $svg, d });
}

function init() {}

export default { init, change };
