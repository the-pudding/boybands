const DISABLE_DURATION = 250;

const $section = d3.select('#history');
const $player = $section.select('.history__player');
const $progressBar = $player.select('.progress__bar');
const $button = $player.selectAll('button');
const $queueCurrent = $player.select('.queue__current');

let clickCallback = null;

function formatPercent(d) {
	return d3.format('%')(d);
}

function queue(val) {
	$queueCurrent.text(val + 1);
}

function progress({ seek, duration }) {
	const percent = formatPercent(1 - seek / duration);
	$progressBar.st('width', percent);
}

function setToggle(control) {
	if (['back', 'forward'].includes(control)) {
		$player.select('[data-state="play"]').classed('is-visible', false);
		$player.select('[data-state="pause"]').classed('is-visible', true);
	}
}

function play() {
	setToggle('forward');
}

function disable(control) {
	if (['back', 'forward'].includes(control)) {
		$button.at('disabled', true);
		setTimeout(() => {
			$button.at('disabled', null);
		}, DISABLE_DURATION);
	}
}

function swapSpan() {
	const $s = d3.select(this);
	const visible = $s.classed('is-visible');
	$s.classed('is-visible', !visible);
}

function handleButtonClick() {
	const $btn = d3.select(this);
	const control = $btn.at('data-control');

	// swap to other state if it has states (spans)
	const $span = $btn.selectAll('span');
	let state = null;
	if ($span.size()) {
		state = $btn.select('span.is-visible').at('data-state');
		$span.each(swapSpan);
	}

	// set to play if forward/back
	setToggle(control);
	// temporary disable buttons so they can't advance to quickly
	disable(control);

	clickCallback({ control, state });
}

function init(cbClick) {
	clickCallback = cbClick;
	$button.on('click', handleButtonClick);
}

export default { init, progress, queue, play };
