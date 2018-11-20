import { Howl, Howler } from 'howler';

const FADE_DUR = 500;
window.bands = {};
let timer = null;
let current = null;
let progressCallback = null;
let endCallback = null;

// Howler.volume(0);

function setCallbacks({ cbEnd, cbProgress }) {
	progressCallback = cbProgress;
	endCallback = cbEnd;
}

function mute(shouldMote) {
	Howler.mute(shouldMote);
}

function pause() {
	if (current && bands[current]) bands[current].pause();
}

function fade() {
	const v = bands[current].volume();
	bands[current].fade(v, 0, FADE_DUR);
}

function timerTick() {
	if (bands[current] && bands[current].playing()) {
		const seek = bands[current].seek();
		const duration = bands[current].duration();
		if (progressCallback) progressCallback({ seek, duration });
	}
}

function play(slug) {
	const prev = bands[current];

	if (!slug) {
		// resume play
		if (prev && !prev.playing()) prev.play();
	} else {
		// swap - fade previous
		if (current && current !== slug && prev && prev.playing()) fade();
		// update current
		current = slug;
		// if exist, play it
		const next = bands[slug];
		if (next) {
			next.on('end', endCallback);
			next.volume(0);
			next.play();
			next.fade(0, 1, FADE_DUR * 4);
		}
	}
}

function load(filenames) {
	let i = 0;
	const path = 'assets/audio';
	const loadNext = () => {
		const f = filenames[i];

		const t = new Howl({
			src: `${path}/${f}.mp3`,
			onload: () => {
				bands[f] = t;
				advance();
			},
			onloaderror: advance,
			onfade: () => {
				if (f !== current) bands[f].stop();
			}
		});
	};

	const advance = err => {
		i += 1;
		if (i < filenames.length) loadNext();
	};

	loadNext();
}

function init(data) {
	const filenames = data.map(d => d.slug);
	load(filenames);
	timer = d3.interval(timerTick, 250);
}
export default { init, play, pause, mute, setCallbacks };
