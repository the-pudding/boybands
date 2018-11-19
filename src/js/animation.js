// import lottie from 'lottie-web';
import danceData from './dance';

const animations = {};
let animationData = null;
let currentGroup = 'all';
let currentCat = 'default';
let nextCat = null;
let currentSubset = [];
let currentInstruments = [];
let domLoaded = false;

function getInstrumentFrames(val) {
	const match = danceData.find(d => d.cat === 'instrument' && d.name === val);
	if (match) return match.frames;
	return danceData[0].frames;
}

function setFrames(frames) {
	animations[currentGroup].forEach((a, i) => {
		const instrument = currentInstruments[i];
		const f = instrument ? getInstrumentFrames(instrument) : frames;
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

function play({ group = currentGroup, cat = currentCat }) {
	if (currentGroup) pause();
	currentGroup = group;
	currentCat = cat;
	if (currentCat !== 'default') change();
}

function transition({ shift, cat = 'pop', instruments = [], subset = [] }) {
	nextCat = cat;
	const prevCat = currentCat;
	currentCat = shift ? 'transition' : nextCat;
	currentInstruments = instruments;
	currentSubset = subset;
	if (shift) {
		const { frames } = danceData.find(
			d => d.cat === currentCat && d.name === 'Shuffle'
		);
		setFrames(frames);
	} else if (prevCat === 'default') change();
}

function transitionEnd() {
	currentCat = nextCat;
}

function onComplete() {
	change();
}

function create({ nodes, group, cb }) {
	animations[group] = nodes.map(n => {
		const options = {
			animationData,
			container: n,
			// loop: true,
			autoplay: false
		};
		const anim = lottie.loadAnimation(options);
		anim.addEventListener('complete', onComplete);
		anim.addEventListener('DOMLoaded', () => {
			if (!domLoaded) cb();
			domLoaded = true;
		});
		return anim;
	});
}

function cleanData(data) {
	const dev = [];
	const layers = data.layers.map(d => {
		const broad = d.cl.split('--')[0];
		let cl = null;
		if (d.cl.includes('facial-features')) cl = 'facial-features';
		else cl = `${broad} ${d.cl}`;
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
