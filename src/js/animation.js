import lottie from 'lottie-web';
import danceJSON from './dance';

const danceData = danceJSON.map(d => ({
	...d,
	repeat: +d.repeat,
	frames: [+d.frame_start, +d.frame_end]
}));

let animations = [];
let animationData = null;
let domLoaded = false;
let currentSequence = [];
let prevHasInstruments = false;

const TRANS_FRAMES = danceData.find(
	d => d.cat === 'transition' && d.name === 'shuffle'
).frames;

function getInstrumentFrames(val) {
	const match = danceData.find(d => d.cat === 'instrument' && d.name === val);
	if (match) return match.frames;
	return danceData[0].frames;
}

function setFrames({ frames, index }) {
	const a = animations[index];
	a.playSegments(frames, true);
}

function change(a, index) {
	const seq = currentSequence[index];
	const frames = seq.frames[seq.current];
	seq.current += 1;
	if (seq.current >= seq.frames.length) seq.current = 0;
	setFrames({ frames, index });
}

function generateSequence({ cat = 'default', instruments = [] }) {
	// TODO start/stop matching, repeat / keep track of basics, weighted basic/complex randomization
	const useBoth = ['pop', 'slow'].includes(cat);
	const choices = danceData.filter(
		d => d.cat === cat || (useBoth && d.cat === 'both')
	);
	let prevPosEnd = Math.random() < 0.5 || cat === 'default' ? 'a' : 'b';

	const target = 20;
	const seq = [];

	while (seq.length < target) {
		const posChoices = choices.filter(c => c.pos_start === prevPosEnd);
		const r = Math.floor(Math.random() * posChoices.length);
		const { frames, repeat, pos_start, pos_end, name } = posChoices[r];
		prevPosEnd = pos_end;

		seq.push(frames);

		if (repeat) {
			const rep = Math.ceil(Math.random() * repeat);
			d3.range(rep).forEach(() => {
				const choice = choices.find(
					c => c.name === name && c.pos_start === pos_end
				);
				seq.push(choice.frames);
				prevPosEnd = choice.pos_end;
			});
		}
	}

	currentSequence = animations.map((a, i) => {
		const instrument = instruments[i];
		const frames = instrument
			? seq.map(() => getInstrumentFrames(instrument))
			: seq.map(s => s);
		return {
			current: 0,
			frames
		};
	});
}

function pause() {
	animations.forEach(a => {
		a.goToAndStop(0, true);
	});
}

function play() {
	pause();
	if (!currentSequence.length) generateSequence({});
	animations.forEach(change);
}

function transition({ shift, cat = 'pop', instruments = [] }) {
	generateSequence({ cat, instruments });
	animations.forEach((a, index) => {
		if (shift) {
			if (instruments[index]) change(a, index);
			else setFrames({ frames: TRANS_FRAMES, index });
		} else if (prevHasInstruments) change(a, index);
		else change(a, index);
	});

	prevHasInstruments = !!instruments.filter(d => d).length;
}

function transitionEnd() {
	animations.forEach(change);
}

function onComplete(index) {
	change(animations[index], index);
}

function create({ nodes, cb }) {
	animations = nodes.map((n, i) => {
		const options = {
			animationData,
			container: n,
			// loop: true,
			autoplay: false
		};
		const anim = lottie.loadAnimation(options);
		anim.addEventListener('complete', () => onComplete(i));
		// anim.addEventListener('loopComplete', onLoopComplete);

		anim.addEventListener('DOMLoaded', () => {
			if (!domLoaded) cb();
			domLoaded = true;
		});
		return anim;
	});
}

function cleanData(data) {
	// const dev = [];
	const layers = data.layers.map(d => {
		const broad = d.cl.split('--')[0];
		const cl = `${broad} ${d.cl}`;
		// dev.push(`${broad} | ${d.cl}`);
		return { ...d, cl };
	});
	// dev.sort(d3.ascending);
	// window.dev = dev.join('\n');
	return { ...data, layers };
}

function load() {
	return new Promise((resolve, reject) => {
		d3.loadData('assets/data/animation.json', (err, response) => {
			if (err) reject(err);
			else {
				animationData = cleanData(response[0]);
				resolve();
			}
		});
	});
}

export default { load, create, play, pause, transition, transitionEnd };
