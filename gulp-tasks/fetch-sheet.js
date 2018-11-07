const gulp = require('gulp');
const request = require('request');
const fs = require('fs');
const dsv = require('d3-dsv');

const configPath = `${process.cwd()}/config.json`;
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const { id, gid, filepath } = config.google.sheet;

const base = 'https://docs.google.com/spreadsheets/u/1/d';
const url = `${base}/${id}/export?format=csv&id=${id}&gid=${gid}`;

const makeRequest = cb => {
	request(url, (error, response, body) => {
		const data = dsv.csvParse(body);
		const basePath = `${process.cwd()}`;
		const file = `${basePath}/${filepath || 'template-data/sheet.json'}`;

		const str = JSON.stringify(data);
		fs.writeFile(file, str, err => {
			if (err) console.error(err);
			cb();
		});
	});
};

gulp.task('fetch-sheet', cb => {
	if (id && gid) makeRequest(cb);
	else {
		console.error('No google sheet');
		cb();
	}
});
