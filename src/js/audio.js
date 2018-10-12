import { Howl, Howler } from 'howler';

const bands = {};

function slugify(str) {
	return str.toLowerCase().replace(/[^\w]/g, '_');
}

function play(band) {
	const name = slugify(band);
	const audio = bands[name];
	console.log({bands})
	if (audio) {
		// Find if any are playing
		const currentlyPlaying = Object.values(bands).map(d => {
			const playing = d.playing()
			if (playing == true) d.stop()
		})

		// todo: if previous song playing, fade it out / stop
		// play new one
		audio.play();
	} else {
		// todo
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
			onloaderror: advance
			// onfade: () => {
			// 	tracks[f].stop();
			// }
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
