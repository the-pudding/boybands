const $section = d3.select('#history');
const $rating = $section.select('.history__rating');
const $button = $rating.selectAll('button');
const $tomato = d3.select('.tomato');

let clickCallback = null;
let ratingData = [];

function update({ slug, rating }) {
	$button.classed('is-selected', false);
	if (rating) {
		$button.at('disabled', true);
		$rating.select(`.rating__${rating}`).classed('is-selected', true);
	} else {
		$button.at('disabled', null);
	}
	// update all ratings text
	const match = ratingData.find(d => d.slug === slug);
	const love = match ? match.lovePercent : '0%';
	const hate = match ? match.hatePercent : '0%';
	$rating.select('.rating__love span').text(love);
	$rating.select('.rating__hate span').text(hate);
}

function handleButtonClick() {
	const $btn = d3.select(this);
	const value = $btn.at('data-value');
	$tomato
		.classed('is-thrown', true)
		.st('top', '75%')
		.st('left', '75%');
	clickCallback(value);
}

function loadRatings() {
	const getCount = (values, rating) => {
		const match = values.find(v => v.rating === rating);
		return match ? +match.count : 0;
	};

	const v = Date.now();
	const url = `https://pudding.cool/2018/11/boybands-data/user-ratings.json?v=${v}`;
	d3.loadData(url, (err, response) => {
		if (err) console.log(err);
		else {
			console.log(new Date(response[0].timestamp));
			ratingData = response[0].data.map(d => {
				const slug = d.key;
				const love = getCount(d.values, 'love');
				const hate = getCount(d.values, 'hate');
				const total = love + hate;
				const lovePercent = d3.format('.0%')(love / total);
				const hatePercent = d3.format('.0%')(hate / total);
				return {
					slug,
					love,
					hate,
					total,
					lovePercent,
					hatePercent
				};
			});
		}
	});
}

function init(cbClick) {
	clickCallback = cbClick;
	$button.on('click', handleButtonClick);
	loadRatings();
}

export default { init, update };
