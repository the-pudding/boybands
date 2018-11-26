import Audio from './audio';
import Animation from './animation';
import DB from './db';
import Player from './history-player';
import Rating from './history-rating';
import Stage from './history-stage';
import Tracker from './utils/tracker';

const $section = d3.select('#history');
const $bandInfo = $section.select('.figure__info');
const $songYear = $bandInfo.select('.info__year span');
const $songName = $bandInfo.select('.info__song span');
const $bandName = $bandInfo.select('.info__band span');
const $position = $bandInfo.select('.info__position span');
const $bandYoutube = $bandInfo.select('.info__band .band__youtube');
const $ratingTip = $section.select('.rating__tip');
const $drawer = $section.select('.history__drawer');
const $drawerMenu = $drawer.select('.drawer__menu');
const $drawerTab = $drawer.select('.drawer__tab');

let bandData = [];
let currentBandIndex = -1;

function updateInfo(d) {
	const parseTime = d3.timeParse('%Y-%m-%d');
	const getYear = d3.timeFormat('%Y');
	$songYear.text(getYear(parseTime(d.highest_pos_date)));
	$songName.text(d.highest_song);
	$bandName.text(d.band);
	$position.text(d.highest_pos);
	$bandYoutube.attr('href', d.highest_song_vid);
}

function swapBoys(dir, jump) {
	currentBandIndex = jump ? dir : currentBandIndex + dir;
	if (currentBandIndex >= bandData.length) currentBandIndex = 0;
	else if (currentBandIndex < 0) currentBandIndex = bandData.length - 1;
	const band = bandData[currentBandIndex];

	updateInfo(band);
	Stage.update(band);

	// change music
	Player.queue(currentBandIndex);
	Player.progress({ seek: 0, duration: 1 });
	Player.play();
	Audio.play(band.slug);

	// change rating button state
	const { slug, rating } = band;
	Rating.update({ slug, rating });
}

// *** EVENTS ***
function handleMainClick() {
	$drawerTab.classed('is-hidden', false);
	$drawerMenu.classed('is-visible', false);
}

function handleFindBand(d) {
	d3.event.stopPropagation();
	$drawerTab.classed('is-hidden', false);
	$drawerMenu.classed('is-visible', false);
	swapBoys(d.index, true);
}

function handleToggleDrawer() {
	d3.event.stopPropagation();
	const visible = $drawer.classed('is-visible');
	$drawerMenu.classed('is-visible', !visible);
	$drawerTab.classed('is-hidden', !visible);
}

function handleYoutubeClick() {
	Tracker.send({ category: 'youtube', action: 'click', once: true });
}

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
	$ratingTip.classed('is-hidden', true);
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
	swapBoys(1);
	d3.select('body').on('keyup', handleKeyUp);
}

function setupDrawer() {
	$drawerTab.on('click', handleToggleDrawer);
	const bands = bandData.map((d, i) => ({
		index: i,
		slug: d.slug,
		band: d.band
	}));
	bands.sort((a, b) =>
		d3.ascending(a.band.toLowerCase(), b.band.toLowerCase())
	);
	const $li = $drawerMenu
		.select('.drawer__bands')
		.selectAll('li')
		.data(bands)
		.enter()
		.append('li');
	$li.text(d => d.band).on('click', handleFindBand);
}

function init({ data, cb }) {
	bandData = data;
	Player.init(handlePlayerClick);
	Rating.init(handleRatingClick);
	Stage.init({ bandData, cb });
	Audio.setCallbacks({
		cbEnd: handleAudioEnd,
		cbProgress: handleAudioProgress
	});
	$bandYoutube.on('click', handleYoutubeClick);
	d3.select('main').on('click', handleMainClick);
	setupDrawer();
}

export default { init, start, resize };
