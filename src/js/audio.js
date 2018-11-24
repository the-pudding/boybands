import { Howl, Howler } from 'howler';

const FADE_DUR = 500;
const bands = {};
let current = null;
let progressCallback = null;
let endCallback = null;
let queue = [];

// Howler.volume(0);

function setCallbacks({ cbEnd, cbProgress }) {
	progressCallback = cbProgress;
	endCallback = cbEnd;
}

function mute(shouldMute) {
	Howler.mute(shouldMute);
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
		} else {
			// hasn't loaded, move it up in the queue
			queue.push(queue.splice(queue.indexOf(slug), 1)[0]);
		}
	}
}

function load() {
	const path = 'assets/audio-20-fade';
	const loadNext = () => {
		const f = queue.pop();
		const t = new Howl({
			src: `${path}/${f}.mp3`,
			onload: () => {
				bands[f] = t;
				if (current === f) play(f);
				advance();
			},
			onloaderror: advance,
			onfade: () => {
				if (f !== current) bands[f].stop();
			}
		});
	};

	const advance = err => {
		if (queue.length) loadNext();
	};

	loadNext();
}

function init(data) {
	queue = data.map(d => d.slug);
	queue.reverse();
	load();
	d3.interval(timerTick, 250);
}

export default { init, play, pause, mute, setCallbacks };
