import lottie from 'lottie-web';
import danceData from './dance';

const animations = {};
let animationData = null;
let currentGroup = null;
let currentCat = null;
let nextCat = null;

function setFrames(frames) {
	animations[currentGroup].forEach(a => {
		a.playSegments(frames, true);
	});
}

function change() {
	// TODO start/stop matching, repeat / keep track of basics, weighted basic/complex randomization
	const choices = danceData.filter(d => d.cat === currentCat);
	const r = Math.floor(Math.random() * choices.length);
	const { frames } = choices[r];
	setFrames(frames);
}

function pause() {
	animations[currentGroup].forEach(a => {
		a.goToAndStop(0, true);
	});
}

function play({ group = 'all', cat = currentCat || 'pop' }) {
	if (currentGroup) pause();
	currentGroup = group;
	currentCat = cat;
	change();
}

function transition({ shift, cat = 'pop' }) {
	nextCat = cat;
	currentCat = shift ? 'transition' : nextCat;
	if (shift) {
		const { frames } = danceData.find(
			d => d.cat === currentCat && d.name === 'two step left'
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

function load() {
	return new Promise((resolve, reject) => {
		d3.loadData('assets/animation/data.json', (err, response) => {
			if (err) reject(err);
			else {
				animationData = response[0];
				resolve();
			}
		});
	});
}

export default { load, create, play, pause, transition, transitionEnd };
