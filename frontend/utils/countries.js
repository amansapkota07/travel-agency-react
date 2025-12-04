import axios from 'axios';

let cachedCountries = null;
let lastFetched = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const fullFallback = [
  { name: 'India', cca2: 'IN' },
  { name: 'United States', cca2: 'US' },
  { name: 'Germany', cca2: 'DE' },
];

export const fetchCountries = async () => {
  if (cachedCountries && lastFetched && (Date.now() - lastFetched < CACHE_DURATION)) {
    console.log('Countries: Using cache');
    return cachedCountries;
  }

  const url = 'https://restcountries.com/v3.1/all?fields=name,cca2,flags';

  try {
    console.log(`Fetching countries from: ${url}`);
    const response = await axios.get(url, { timeout: 20000 });

    const list = response.data
      .map(c => ({
        name: c.name?.common || c.name,
        cca2: c.cca2,
      }))
      .filter(c => c.name && c.cca2)
      .sort((a, b) => a.name.localeCompare(b.name));

    cachedCountries = list;
    lastFetched = Date.now();
    console.log(`Loaded ${list.length} countries from API`);
    return list;
  } catch (e) {
    console.log('Failed fetching countries:', e.message);
    cachedCountries = fullFallback;
    lastFetched = Date.now();
    console.log(`Using fallback: ${fullFallback.length} countries`);
    return fullFallback;
  }
};
