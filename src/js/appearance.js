import colors from './colors';
import crosswalkRaw from './crosswalk';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

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

function checkForHat(d) {
	let hasHat = false;
	d.accessories.forEach(a => {
		if (
			[
				'baseballcap',
				'beanie',
				'beret',
				'dorag',
				'fedora',
				'flathat',
				'tophat',
				'newsboycap',
				'ushanka'
			].includes(getItem(a))
		)
			hasHat = true;
	});
	return hasHat;
}

function frostTips({ $svg, col, layer }) {
	// add gradient for future frosted tips
	// Append a defs (for definition) element to your SVG
	$svg.select('defs').remove();
	const defs = $svg.append('defs');

	// Append a radialGradient element to the defs and give it a unique id
	const id = d3
		.range(5)
		.map(() => ALPHABET[Math.floor(Math.random() * ALPHABET.length)])
		.join('');

	const linearGradient = defs.append('linearGradient').at({
		id,
		x1: '0%',
		x2: '0%',
		y1: layer.includes('swept') ? '0%' : '100%',
		y2: layer.includes('swept') ? '100%' : '0%'
	});
	linearGradient
		.append('stop')
		.at('offset', '0%')
		.at('stop-color', col);
	linearGradient
		.append('stop')
		.at('offset', '60%')
		.at('stop-color', col);
	linearGradient
		.append('stop')
		.at('offset', '100%')
		.at('stop-color', getColor('blonde'));

	return `url(#${id})`;
}

function getDark(col) {
	if (col === colors.black) return colors['dark gray'];
	return d3
		.color(col)
		.darker()
		.toString();
}

function getLight(col) {
	if (col === colors.white) return colors['light gray'];
	if (col === colors.black) return colors.gray;
	return d3
		.color(col)
		.brighter()
		.toString();
}

function activateLayer({ $svg, selector, col, base }) {
	// console.log(`activate: ${selector}`);
	const baseColor = base || col;
	const $el = $svg.select(selector);
	if ($el.size()) {
		$el.st('display', 'block');
		const $g = $el.selectAll('g');
		if (col) $g.selectAll('path').st({ fill: col, stroke: col });
		if (baseColor) {
			const dark = getDark(baseColor);
			const light = getLight(baseColor);
			$g.selectAll('g.dark path').st({ fill: dark, stroke: dark });
			$g.selectAll('g.light path').st({ fill: light, stroke: light });
		}

		$g.selectAll('g.white path').st({
			fill: colors.white,
			stroke: colors.white
		});
		$g.selectAll('g.gray path').st({
			fill: colors.gray,
			stroke: colors.gray
		});
		$g.selectAll('g.red path').st({
			fill: colors.red,
			stroke: colors.red
		});
	} else console.log(`no svg: ${selector}`);
}

function skin({ $svg, d }) {
	const col = getColor(d.skin);
	$svg.selectAll('.skin g path').st({ fill: col, stroke: col });
}

function hair({ $svg, d }) {
	const styles = d.hair_style
		.split(',')
		.map(v => v.trim())
		.filter(v => v);

	$svg.select('.skin--bald').st('display', 'block');

	styles.forEach(s => {
		const item = getItem(s);
		const shouldFrost = d.hair_frosted && d.hair_frosted !== 'no';
		const c = getColor(d.hair_color);

		$svg.select('.skin--bald').st('display', 'none');
		$svg.select('.skin--general').st('display', 'none');
		// if no item, do bald
		const base = `.skin--${item ? item.layer_base : 'bald'}`;
		activateLayer({ $svg, selector: base });

		// check side count and show front and/or back of style
		if (item) {
			item.layer_extra.forEach(layer => {
				if (layer === 'rattail')
					activateLayer({
						$svg,
						selector: '.hair-back--rattail',
						col: c,
						base: c
					});
				else {
					const front = `.hair-front--${layer}-${d.hair_length}`;
					const back = `.hair-back--${layer}-${d.hair_length}`;
					const hasHat = checkForHat(d);
					const col = shouldFrost ? frostTips({ $svg, col: c, layer }) : c;
					if (item.sides < 3 && !hasHat)
						activateLayer({
							$svg,
							selector: front,
							col: !layer.includes('curly') ? col : c,
							base: c
						});

					if (item.sides > 1)
						activateLayer({ $svg, selector: back, col, base: c });
				}

				// pony
				if (layer === 'ponytail') {
					activateLayer({
						$svg,
						selector: '.hair-front--crew-short',
						col: c,
						base: c
					});
					activateLayer({
						$svg,
						selector: '.hair-back--crew-short',
						col: c,
						base: c
					});
				}
			});
		}
	});
}

function accessories({ $svg, d }) {
	d.accessories.forEach(accessory => {
		const item = getItem(accessory);

		item.layer_extra.forEach(layer => {
			const front = `.accessories-front--${layer}`;
			const back = `.accessories-back--${layer}`;
			activateLayer({ $svg, selector: front });
			if (item.sides === 2) activateLayer({ $svg, selector: back });
		});
	});
}

function top({ $svg, d }) {
	d.top_style.filter(v => v.trim()).forEach(t => {
		const item = getItem(t);
		const col = [
			'jacket',
			'vest',
			'leather jacket',
			'other jacket',
			'suit jacket',
			'windbreaker'
		].includes(t)
			? getColor(d.jacket_color)
			: getColor(d.shirt_color);

		const base = `.top--${item.layer_base}`;
		activateLayer({ $svg, selector: base, col });

		$svg.select('.skin--sleeveless').st('display', 'none');
		$svg.select('.skin--chest').st('display', 'none');

		item.layer_extra.forEach(layer => {
			if (layer.includes('skin')) {
				const skinCol = getColor(d.skin);
				activateLayer({ $svg, selector: `.${layer}`, skinCol });
			} else {
				activateLayer({ $svg, selector: `.${layer}`, col });
			}
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
	accessories({ $svg, d });
	top({ $svg, d });
	bottom({ $svg, d });
	facialHair({ $svg, d });
	instrument({ $svg, d });
}

function init() {}

export default { init, change };
