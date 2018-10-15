import { Howl, Howler } from 'howler';

const FADE_DUR = 500;
const bands = {};
let current = null;

function slugify(str) {
	return str.toLowerCase().replace(/[^\w]/g, '_');
}

function pause() {
	const v = bands[current].volume();
	bands[current].fade(v, 0, FADE_DUR);
}

function play(band) {
	const name = slugify(band);
	// pause previous
	if (current && bands[current] && bands[current].playing()) pause();
	// update current
	current = name;
	// if exist, play it
	const next = bands[name];
	if (next) {
		next.volume(0);
		next.play();
		next.fade(0, 1, FADE_DUR * 4);
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
			onend: () => {
				// todo
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
	const filenames = data.map(d => slugify(d.band));
	load(filenames);
}
export default { init, play };
