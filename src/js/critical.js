import Promise from 'promise-polyfill';
import './polyfills/startsWith';
import './polyfills/endsWith';
import './polyfills/findIndex';
import './polyfills/find';
import './polyfills/includes';
import { loadFontGroup } from './utils/load-font';

const dosis = [
	{ family: 'Dosis', weight: 500 },
	{ family: 'Dosis', weight: 700 },
	{ family: 'Dosis', weight: 800 }
];

// const atlas = [
// 	{ family: 'Atlas Grotesk Web', weight: 400 },
// 	{ family: 'Atlas Grotesk Web', weight: 500 },
// 	{ family: 'Atlas Grotesk Web', weight: 600 }
// ];

// polyfill promise
if (!window.Promise) window.Promise = Promise;

// load fonts
loadFontGroup(dosis);
