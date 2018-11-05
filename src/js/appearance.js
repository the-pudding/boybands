import colors from './colors';
import head from './head';

const hairClass = ['hair-front', 'hair-back'];
const skinClass = [
	'leg-right',
	'leg-left',
	'torso-sleeveless',
	'arm-right',
	'arm-left',
	'head-bald'
];

function getColor(val) {
	const c = colors[val];
	if (!c) console.log(val);
	return c || colors.black;
}
function skin({ $svg, val }) {
	const col = getColor(val);
	skinClass.forEach(c => {
		$svg.selectAll(`.${c}-skin g path`).st({ fill: col, stroke: col });
	});
}

function hair({ $svg, val }) {
	const col = getColor(val);
	hairClass.forEach(c => {
		$svg.selectAll(`.${c} g path`).st({ fill: col, stroke: col });
	});
}

function change({ $svg, d }) {
	skin({ $svg, val: d.skin });
	hair({ $svg, val: d.hair_color });
}

export default { change };
