import DB from './db';
import db from './db';

function slugify(str) {
	return str.toLowerCase().replace(/[^\w]/g, '_');
}

function clean([bands, boys]) {
	const nestedBoys = d3
		.nest()
		.key(d => d.band)
		.entries(boys);

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
	// TODO remove clear
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
