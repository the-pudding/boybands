import colors from './colors';
import head from './head';

const layers = ['hair'];
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
		$svg.select(`.${c}-skin`).st('fill', colors[val]);
	});
}

function change({ $svg, d }) {
	skin({ $svg, val: d.skin });
}

export default { change };
