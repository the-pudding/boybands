import transitionEvent from './utils/transition-event';

const $section = d3.select('#history');
const $rating = $section.select('.history__rating');
const $button = $rating.selectAll('button');
const $reactions = $section.select('.history__reactions');

const REM = 16;
let reactionWidth = 0;
let maxEmojiSize = 0;

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

function removeReaction() {
	d3.select(this).remove();
}

function createReaction(value) {
	const left = `${maxEmojiSize * REM +
		Math.random() * (reactionWidth - maxEmojiSize * REM * 3)}px`;
	const bottom = `${maxEmojiSize + Math.random() * 10}rem`;
	const fontSize = `${Math.max(1, maxEmojiSize - 3 + Math.random() * 3)}rem`;

	const v = Math.ceil(Math.random() * 3);

	$reactions
		.append('div.reaction__item')
		.text(value === 'love' ? '💜' : '💩')
		.st({ left, bottom, fontSize, width: fontSize })
		.classed(`is-float${v}`, true)
		.on(transitionEvent, removeReaction);
}

function handleButtonClick() {
	const $btn = d3.select(this);
	const value = $btn.at('data-value');

	reactionWidth = $reactions.node().offsetWidth;
	maxEmojiSize = reactionWidth < 600 ? 3 : 5;

	// trigger heart (love) or poop (hate)
	const count = Math.floor(15 + Math.random() * 10);
	d3.range(count).forEach(() => createReaction(value));

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
			console.log('Ratings updated: ', new Date(response[0].timestamp));
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
