const layers = ['hair'];

function updateAppearance({ boys, subset }) {
	let index = subset.start;
	boys.forEach(b => {
		const $b = $boy.filter((d, i) => i === index);
		// Update name
		$b.select('.boy__name').text(b.name);
		layers.forEach(l => {
			// $b.selectAll(`.${l}`).st('opacity', 0);
			// $b.select(`.${l}--${b[l]}`)
			$b.select(`.${l}--fade-high path`)
				.st('opacity', 1)
				.st('fill', b[`${l}_color`]);

			$b.select(`.${l}--swept-long`).st('display', 'none');
		});

		index += 1;
	});
}
