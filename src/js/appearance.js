import colors from './colors';
import head from './head';

import Skin from './class/skin';
import Hair from './class/hair';
import HairFront from './class/hair-front';
import HairBack from './class/hair-back';
import Clothes from './class/clothes';
import Accessories from './class/accessories';
import AccessoriesFront from './class/accessories-front';
import AccessoriesBack from './class/accessories-back';
import Instrument from './class/instrument';

let $boy = null;
let $skin = null;
let $hair = null;
let $hairBack = null;
let $hairFront = null;
let $clothes = null;
let $accessories = null;
let $accessoriesFront = null;
let $accessoriesBack = null;
let $instrument = null;

const $layers = [
	$boy,
	$skin,
	$hair,
	$hairBack,
	$hairFront,
	$clothes,
	$accessories,
	$accessoriesFront,
	$accessoriesBack,
	$instrument
];

function getColor(val) {
	const c = colors[val];
	if (!c) console.log(val);
	return c || colors.black;
}

function skin({ $svg, val }) {
	const col = getColor(val);
	$skin.st('display', 'none');
	Skin.forEach(c => {
		$svg.selectAll(`.${c}-skin g path`).st({ fill: col, stroke: col });
	});
}

function hair({ $svg, val }) {
	const col = getColor(val);
	$hair.st('display', 'none');
	Hair.forEach(c => {
		$svg.selectAll(`.${c} g path`).st({ fill: col, stroke: col });
	});
}

function disable() {
	$layers.forEach($l => $l.st('display', 'none'));
}

function change({ $svg, d }) {
	disable();
	skin({ $svg, val: d.skin });
	hair({ $svg, val: d.hair_color });
}

function init() {
	$boy = d3.selectAll('.boy');
	$skin = $boy.selectAll('.skin');
	$hair = $boy.selectAll('.hair');
	$hairBack = $boy.selectAll('.hair-back');
	$hairFront = $boy.selectAll('.hair-front');
	$clothes = $boy.selectAll('.clothes');
	$accessories = $boy.selectAll('.accessories');
	$accessoriesFront = $boy.selectAll('.accessories-front');
	$accessoriesBack = $boy.selectAll('.accessories-back');
	$instrument = $boy.selectAll('.instrument');
}

export default { init, change };
