import Animation from './animation';

const MIN_BOY_SIZE = 72;
const MARGIN = 20;
const $section = d3.select('#wall');
const $figure = $section.select('figure');
let $band = null;
const width = 0;
const maxBoys = 0;
const boySize = 0;

function resize() {
	// width = $figure.node().offsetWidth - MARGIN * 2;
	// boySize = Math.floor(width / maxBoys);
	// boySize = Math.max(boySize, MIN_BOY_SIZE);
	// stacked = boySize === MIN_BOY_SIZE;
	// $boy.st('width', boySize);
}

function createAnimation(d) {
	const $boys = d3.select(this);
	const nodes = $boys.selectAll('.boy').nodes();
	Animation.create({ nodes, group: d.slug });
}

function init({ data, cbClick }) {
	$band = $figure.selectAll('.figure__boys').data(data);
	const $bandEnter = $band.enter().append('div.band');

	$bandEnter.on('click', cbClick);

	const $info = $bandEnter.append('div.band__info');
	$info.append('p.info__year').text(d => d.highest_pos_date.substring(0, 4));
	$info.append('p.info__band').text(d => d.band);
	$info.append('p.info__song').text(d => d.highest_song);

	const $boys = $bandEnter.append('div.band__boys');

	const $boy = $boys
		.selectAll('.boy')
		.data(d => d.boys)
		.enter()
		.append('div.boy');

	$boy
		.append('p')
		.attr('class', 'boy__name')
		.text(d => d.name);

	console.time('create');
	$boys.each(createAnimation);
	console.timeEnd('create');
	$band = $bandEnter.merge($band);

	// resize();
}

export default { init, resize };
