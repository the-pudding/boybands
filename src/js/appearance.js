import colors from './colors';
import head from './head';

const layers = ['hair'];

function change({ $b, d }) {
	// color

	// layers
	layers.forEach(l => {
		// $b.selectAll(`.${l}`).st('opacity', 0);
		// $b.select(`.${l}--${b[l]}`)
		// $b.select(`.${l}--fade-high path`)
		// 	.st('opacity', 1)
		// 	.st('fill', b[`${l}_color`]);
		// $b.select(`.${l}--swept-long`).st('display', 'none');
	});
}

export default { change };
