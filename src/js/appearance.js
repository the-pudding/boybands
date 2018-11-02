import colors from './colors';
import head from './head';

const hairClass = [
	'hair-front',
	'hair-back'
];
const skinClass = [
	'leg-right',
	'leg-left',
	'torso-sleeveless',
	'arm-right',
	'arm-left',
	'head-bald'
];

function skin({ $svg, val }) {
	skinClass.forEach(c => {
		$svg.selectAll(`.${c}-skin g path`).st({fill: colors[val], stroke: colors[val]});
	});
}

function hair({ $svg, val }) {
	hairClass.forEach(c => {
		$svg.selectAll(`.${c} g path`).st({fill: colors[val], stroke: colors[val]});
	});
}

function change({ $svg, d }) {
	skin({ $svg, val: d.skin });
	hair({ $svg, val: d.hair_color})
}

export default { change };
