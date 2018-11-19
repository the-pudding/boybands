import Audio from './audio';
import Animation from './animation';
import DB from './db';
import Player from './history-player';
import Rating from './history-rating';
import Stage from './history-stage';
import Tracker from './utils/tracker';

const $section = d3.select('#history');
const $bandInfo = $section.select('.figure__info');
const $songYear = $bandInfo.select('.info__year');
const $songName = $bandInfo.select('.info__song');
const $bandName = $bandInfo.select('.info__band');

let bandData = [];
let currentBandIndex = -1;

function updateInfo({ band, highest_pos_date, highest_song }) {
	const parseTime = d3.timeParse('%Y-%m-%d');
	const getYear = d3.timeFormat('%Y');
	$songYear.text(getYear(parseTime(highest_pos_date)));
	$songName.text(highest_song);
	$bandName.text(band);
}

function swapBoys(dir) {
	currentBandIndex += dir;
	if (currentBandIndex >= bandData.length) currentBandIndex = 0;
	else if (currentBandIndex < 0) currentBandIndex = bandData.length - 1;
	const band = bandData[currentBandIndex];

	updateInfo(band);
	Stage.update(band);

	// change music
	Player.queue(currentBandIndex);
	Player.progress({ seek: 0, duration: 1 });
	Audio.play(band.slug);

	// change rating button state
	const { slug, rating } = band;
	Rating.update({ slug, rating });
}

// *** EVENTS ***
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

	DB.set({ key: slug, value: rating });
	Tracker.send({ category: slug, action: value, once: true });
	Rating.update({ slug, rating });
}

function handlePlayerClick({ control, state }) {
	switch (control) {
	case 'toggle':
		if (state === 'play') {
			Audio.play();
			Animation.play({});
		} else {
			Animation.pause();
			Audio.pause();
		}
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

function handleKeyUp() {
	const { keyCode } = d3.event;
	if (keyCode === 37) handlePlayerClick({ control: 'back' });
	else if (keyCode === 39) handlePlayerClick({ control: 'forward' });
}

function resize() {
	Stage.resize();
}

function start() {
	Stage.init(bandData);
	Audio.setCallbacks({
		cbEnd: handleAudioEnd,
		cbProgress: handleAudioProgress
	});
	swapBoys(1);
	d3.select('body').on('keyup', handleKeyUp);
}

function init(data) {
	bandData = data;
	Player.init(handlePlayerClick);
	Rating.init(handleRatingClick);
}

export default { init, start, resize };
