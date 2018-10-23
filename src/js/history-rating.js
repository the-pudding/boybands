const $section = d3.select('#history');
const $rating = $section.select('.history__rating');
const $button = $rating.selectAll('button');

let clickCallback = null;

function preset(value) {
	console.log(value);
	$button.classed('is-selected', false);
	if (value) {
		$button.at('disabled', true);
		$rating.select(`.rating__${value}`).classed('is-selected', true);
	} else {
		$button.at('disabled', null);
	}
}

function handleButtonClick() {
	const $btn = d3.select(this);
	const value = $btn.at('data-value');
	clickCallback(value);
}

function init(cbClick) {
	clickCallback = cbClick;
	$button.on('click', handleButtonClick);
}

export default { init, preset };
