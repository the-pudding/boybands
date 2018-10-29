import Audio from './audio';
import Animation from './animation';
// import Rating from './history-rating';
import Stage from './wall-stage';
import tracker from './utils/tracker';

const $section = d3.select('#wall');

let bandData = [];

function updateInfo({ band, highest_pos_date, highest_song }) {
	const parseTime = d3.timeParse('%Y-%m-%d');
	const getYear = d3.timeFormat('%Y');
	$songYear.text(getYear(parseTime(highest_pos_date)));
	$songName.text(highest_song);
	$bandName.text(band);
}

function swapBoys(dir) {
	currentBandIndex += dir;
	currentBandIndex = Math.max(0, currentBandIndex);
	if (currentBandIndex >= bandData.length) currentBandIndex = 0;
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
function handleAudioProgress({ seek, duration }) {}

function handleAudioEnd() {}

function handleBandClick(d) {
	Audio.play(d.slug);
	Animation.play(d.slug);
}

function handleRatingClick(value) {
	const b = bandData[currentBandIndex];
	b.rating = value;
	const { slug, rating } = b;
	tracker.send({ category: slug, action: value, once: true });
	Rating.update({ slug, rating });
}

function resize() {}

function start() {
	Audio.setCallbacks({ cbEnd: handleAudioEnd });
	Stage.init({ data: bandData, cbClick: handleBandClick });
}

function init(data) {
	bandData = data;

	// Rating.init(handleRatingClick);
	// Stage.init(data);
}

export default { init, start, resize };
