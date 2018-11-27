import checkStorage from './check-storage';

const hasStorage = checkStorage('localStorage');

function clear(slug) {
	if (hasStorage) window.localStorage.removeItem(`pudding_boybands_${slug}`);
}

function get(slug) {
	if (hasStorage)
		return window.localStorage.getItem(`pudding_boybands_${slug}`);
	return null;
}

function set({ key, value }) {
	if (hasStorage) window.localStorage.setItem(`pudding_boybands_${key}`, value);
}

export default { get, set, clear };
