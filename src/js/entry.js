/* global d3 */
import debounce from 'lodash.debounce';
import NoSleep from 'nosleep.js';
import isMobile from './utils/is-mobile';
import loadBoys from './load-boys';
import Animation from './animation';
import Audio from './audio';
import GraphicHistory from './graphic-history';

const ns = new NoSleep();

const $body = d3.select('body');
const $intro = $body.select('.intro');
const $choice = $body.selectAll('.intro__choice button');
const $loading = $body.select('.choice__loading');
let previousWidth = 0;

function resize() {
	// only do resize on width changes, not height
	// (remove the conditional if you want to trigger on height change)
	const width = $body.node().offsetWidth;
	if (previousWidth !== width) {
		previousWidth = width;
		GraphicHistory.resize();
	}
}

function setupStickyHeader() {
	const $header = $body.select('header');
	if ($header.classed('is-sticky')) {
		const $menu = $body.select('.header__menu');
		const $toggle = $body.select('.header__toggle');
		$toggle.on('click', () => {
			const visible = $menu.classed('is-visible');
			$menu.classed('is-visible', !visible);
			$toggle.classed('is-visible', !visible);
		});
	}
}

function handleChoiceClick() {
	const $btn = d3.select(this);
	const value = $btn.at('data-value');
	$body.select(`#${value}`).classed('is-selected', true);
	if (value === 'history') GraphicHistory.start();
	$intro.classed('is-hidden', true);
	ns.enable();
}

function onReady() {
	$choice.classed('is-visible', true).on('click', handleChoiceClick);
	$loading.classed('is-hidden', true);
}

function init() {
	// add mobile class to body tag
	$body.classed('is-mobile', isMobile.any());
	// setup resize event
	window.addEventListener('resize', debounce(resize, 150));
	// setup sticky header menu
	setupStickyHeader();
	// kick off graphic code
	Animation.load()
		.then(loadBoys)
		.then(boyData => {
			Audio.init(boyData);
			GraphicHistory.init({ data: boyData, cb: onReady });
		});
}

init();
