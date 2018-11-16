// import lottie from 'lottie-web';
import danceData from './dance';

const animations = {};
let animationData = null;
let currentGroup = null;
let currentCat = null;
let nextCat = null;
let currentStart = 0;
let currentInstruments = [];

function getInstrumentFrames(val) {
	const match = danceData.find(d => d.cat === 'instrument' && d.name === val);
	if (match) return match.frames;
	return danceData[0].frames;
}

function setFrames(frames) {
	animations[currentGroup].forEach((a, i) => {
		const instrument = currentInstruments[i - currentStart];
		const f = instrument ? getInstrumentFrames(instrument) : frames;
		// console.log({ instrument, f });
		a.playSegments(f, true);
	});
}

function change() {
	// TODO start/stop matching, repeat / keep track of basics, weighted basic/complex randomization
	const choices = danceData.filter(
		d => d.cat === currentCat && d.name !== 'N/A'
	);
	const r = Math.floor(Math.random() * choices.length);
	const { frames } = choices[r];
	setFrames(frames);
}

function pause() {
	animations[currentGroup].forEach(a => {
		a.goToAndStop(0, true);
	});
}

function play({ group = 'all', cat = currentCat || 'default' }) {
	if (currentGroup) pause();
	currentGroup = group;
	currentCat = cat;
	change();
}

function transition({ shift, cat = 'pop', instruments = [], start = 0 }) {
	nextCat = cat;
	currentCat = shift ? 'transition' : nextCat;
	currentInstruments = instruments;
	currentStart = start;
	if (shift) {
		const { frames } = danceData.find(
			d => d.cat === currentCat && d.name === 'Shuffle'
		);
		setFrames(frames);
	}
}

function transitionEnd() {
	currentCat = nextCat;
}

function onComplete() {
	change();
}

function create({ nodes, group }) {
	animations[group] = nodes.map(n => {
		const options = {
			animationData,
			container: n,
			// loop: true,
			autoplay: false
		};
		const anim = lottie.loadAnimation(options);
		anim.addEventListener('complete', onComplete);
		return anim;
	});
}

function cleanData(data) {
	const dev = [];
	const layers = data.layers.map(d => {
		const broad = d.cl.split('--')[0];
		const cl = `${broad} ${d.cl}`;
		dev.push(`${broad} | ${d.cl}`);
		return { ...d, cl };
	});
	dev.sort(d3.ascending);
	window.dev = dev.join('\n');
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
