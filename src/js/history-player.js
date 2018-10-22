const $section = d3.select('#history');
const $player = $section.select('.history__player');
const $progressBar = $player.select('.progress__bar');
const $button = $player.selectAll('button');

function formatPercent(d) {
	return d3.format('%')(d);
}

function progress({ seek, duration }) {
	const percent = formatPercent(1 - seek / duration);
	$progressBar.st('width', percent);
}

function toggleSpan() {
	const $s = d3.select(this);
	const visible = $s.classed('is-visible');
	$s.classed('is-visible', !visible);
}

function handleButtonClick() {
	const $btn = d3.select(this);
	const control = $btn.at('data-control');

	// toggle to other state if it has states (spans)
	const $span = $btn.selectAll('span');
	let state = null;
	if ($span.size()) {
		state = $btn.select('span.is-visible').at('data-state');
		$span.each(toggleSpan);
	}

	console.log({ control, state });
}

function init() {
	$button.on('click', handleButtonClick);
}

export default { init, progress };
