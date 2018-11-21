import DB from './db';
import crosswalkRaw from './crosswalk';

const crosswalk = crosswalkRaw.map(d => ({
	...d,
	sides: +d.sides,
	layer_extra: d.layer_extra
		.split(',')
		.map(v => v.trim())
		.filter(v => v)
}));

function getItem(val) {
	const match = crosswalk.find(d => d.value === val);
	if (!match) console.log(`no item in crosswalk: ${val}`);
	return match;
}

function slugify(str) {
	return str.toLowerCase().replace(/[^\w]/g, '_');
}

function itemize(values) {
	return values
		.split(',')
		.map(v => v.trim())
		.filter(v => v)
		.map(getItem);
}

function clean([bands, boys]) {
	const cleanBoys = boys.map(d => ({
		...d,
		accessories: itemize(d.accessories),
		top_style: itemize(d.top_style),
		bottom_style: itemize(d.bottom_style),
		hair_style: itemize(d.hair_style),
		facial_hair: itemize(d.facial_hair)
	}));

	const nestedBoys = d3
		.nest()
		.key(d => d.band)
		.entries(cleanBoys);

	const getBoys = band => {
		const match = nestedBoys.find(b => b.key === band);
		if (!match) console.log(band);
		return match ? match.values : [];
	};

	const withBoys = bands.map(d => ({
		...d,
		boys: getBoys(d.band)
	}));

	withBoys.sort((a, b) => d3.ascending(a.highest_pos_date, b.highest_pos_date));

	const filtered = withBoys.filter(d => d.boys.length);
	const withSlug = filtered.map(d => ({
		...d,
		slug: slugify(d.band)
	}));

	return withSlug;
}

function addRating(d) {
	DB.clear(d.slug);
	const rating = DB.get(d.slug);
	return {
		...d,
		rating
	};
}

export default function() {
	return new Promise((resolve, reject) => {
		d3.loadData(
			'assets/data/bands.csv',
			'assets/data/boys.csv',
			(err, response) => {
				if (err) reject(err);
				else {
					const cleanData = clean(response);
					const withRating = cleanData.map(addRating);
					resolve(withRating);
				}
			}
		);
	});
}
