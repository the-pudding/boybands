import Animation from './animation';
import Audio from './audio';
import Player from './history-player';
import Rating from './history-rating';
import tracker from './utils/tracker';

const $section = d3.select('#history');
const $figure = $section.select('.history__figure');
const $boys = $figure.select('.figure__boys');
const $bandInfo = $section.select('.figure__info');
const $songYear = $bandInfo.select('.info__year');
const $songName = $bandInfo.select('.info__song');
const $bandName = $bandInfo.select('.info__band');

let $boy = null;

let bandData = [];
let currentBandIndex = -1;

const layers = ['hair'];

function handleAudioProgress({ seek, duration }) {
	Player.progress({ seek, duration });
}

function handleAudioEnd() {
	swapBoys(1);
}

function handleRatingClick(value) {
	const b = bandData[currentBandIndex];
	b.rating = value;
	const { slug, rating } = b;
	tracker.send({ category: slug, action: value, once: true });
	Rating.update({ slug, rating });
}

function handlePlayerClick({ control, state }) {
	switch (control) {
	case 'toggle':
		if (state === 'play') Audio.play();
		else Audio.pause();
		break;

	case 'back':
		swapBoys(-1);
		break;
	case 'forward':
		swapBoys(1);
		break;
	case 'volume':
		Audio.mute(state === 'on');
		break;
	default:
		break;
	}
}

function updateAppearance({ boys }) {
	boys.forEach((b, index) => {
		const $b = $boy.filter((d, i) => i === index);
		// Update name
		$b.select('.boy__name').text(b.name);
		layers.forEach(l => {
			// $b.selectAll(`.${l}`).st('opacity', 0);
			// $b.select(`.${l}--${b[l]}`)
			$b.select(`.${l}--fade-high path`)
				.st('opacity', 1)
				.st('fill', b[`${l}_color`]);

			$b.select(`.${l}--swept-long`).st('display', 'none');
		});
	});
}

function updateInfo({ band, highest_pos_date, highest_song }) {
	const parseTime = d3.timeParse('%Y-%m-%d');
	const getYear = d3.timeFormat('%Y');
	$songYear.text(getYear(parseTime(highest_pos_date)));
	$songName.text(highest_song);
	$bandName.text(band);
}

function swapBoys(dir) {
	currentBandIndex += dir;
	currentBandIndex = Math.min(
		bandData.length - 1,
		Math.max(0, currentBandIndex)
	);
	const band = bandData[currentBandIndex];

	// change arrangement
	$boy.classed('is-visible', (d, i) => i < band.boys.length);

	// change layer style
	updateAppearance(band);
	updateInfo(band);

	// change music
	Player.queue(currentBandIndex);
	Player.progress({ seek: 0, duration: 1 });
	Audio.play(band.slug);

	// change rating button state
	const { slug, rating } = band;
	Rating.update({ slug, rating });
}

function setupBoys() {
	const max = d3.max(bandData, d => d.boys.length);
	const data = d3.range(max);

	$boy = $boys
		.selectAll('.boy')
		.data(data)
		.enter()
		.append('div.boy');

	const boyName = $boy
		.append('text')
		.attr('class', 'boy__name')
		.text('name');

	Animation.create($boy.nodes());
}

function resize() {}

function start() {
	swapBoys(1);
}

function init(data) {
	Audio.init({ data, cbEnd: handleAudioEnd, cbProgress: handleAudioProgress });
	Player.init(handlePlayerClick);
	Rating.init(handleRatingClick);
	bandData = data;
	setupBoys();
}

export default { init, start, resize };
