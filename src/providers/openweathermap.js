import { extension_settings } from '../../../../../extensions.js';
import { isTrueBoolean, isFalseBoolean } from '../../../../../utils.js';
import { degreesToDirection } from '../utils.js';

const owmGeoCache = new Map();

async function getOWMGeocode(location) {
    if (owmGeoCache.has(location)) return owmGeoCache.get(location);
    const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
    url.searchParams.append('q', location);
    url.searchParams.append('limit', '1');
    url.searchParams.append('appid', extension_settings.accuweather.openWeatherMapApiKey);
    const response = await fetch(url);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || `Failed to geocode "${location}"`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error(`No location found for "${location}"`);
    const result = { lat: data[0].lat, lon: data[0].lon };
    owmGeoCache.set(location, result);
    return result;
}

async function getOWMCurrentWeather(location, units) {
    const { lat, lon } = await getOWMGeocode(location);
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.append('lat', lat);
    url.searchParams.append('lon', lon);
    url.searchParams.append('appid', extension_settings.accuweather.openWeatherMapApiKey);
    url.searchParams.append('units', units);
    const response = await fetch(url);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || 'Failed to get weather from OpenWeatherMap');
    }
    return await response.json();
}

async function getOWMForecast(location, units) {
    const { lat, lon } = await getOWMGeocode(location);
    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.append('lat', lat);
    url.searchParams.append('lon', lon);
    url.searchParams.append('appid', extension_settings.accuweather.openWeatherMapApiKey);
    url.searchParams.append('units', units);
    const response = await fetch(url);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || 'Failed to get forecast from OpenWeatherMap');
    }
    return await response.json();
}

function parseOWMWeatherData(data, args) {
    const parts = [];
    const currentUnits = args.units || extension_settings.accuweather.units;
    const isImperial = String(currentUnits).trim().toLowerCase() === 'imperial';
    const tempUnit = isImperial ? 'F' : 'C';
    const speedUnit = isImperial ? 'mph' : 'm/s';

    if (!isFalseBoolean(args.condition)) {
        parts.push(data.weather[0].description);
    }
    if (!isFalseBoolean(args.temperature)) {
        let temp = `${Math.round(data.main.temp)}°${tempUnit}`;
        if (isTrueBoolean(args.feelslike)) {
            temp += ` (feels like ${Math.round(data.main.feels_like)}°${tempUnit})`;
        }
        parts.push(temp);
    }
    if (isTrueBoolean(args.wind)) {
        parts.push(`Wind: ${data.wind.speed} ${speedUnit} ${degreesToDirection(data.wind.deg)}`);
    }
    if (isTrueBoolean(args.humidity)) {
        parts.push(`Humidity: ${data.main.humidity}%`);
    }
    if (isTrueBoolean(args.pressure)) {
        parts.push(`Pressure: ${data.main.pressure} hPa`);
    }
    if (isTrueBoolean(args.visibility)) {
        const vis = isImperial ? `${(data.visibility / 1609.34).toFixed(1)} miles` : `${(data.visibility / 1000).toFixed(1)} km`;
        parts.push(`Visibility: ${vis}`);
    }
    if (isTrueBoolean(args.precipitation)) {
        const rain = data.rain ? data.rain['1h'] || 0 : 0;
        const snow = data.snow ? data.snow['1h'] || 0 : 0;
        const totalPrecip = rain + snow;
        const precipStr = isImperial ? `${(totalPrecip / 25.4).toFixed(2)} in` : `${totalPrecip.toFixed(1)} mm`;
        parts.push(`Precipitation: ${precipStr}`);
    }
    return parts.join(', ');
}

function parseOWMForecastData(data, units) {
    const list = data.list;
    if (!list || list.length === 0) throw new Error('No forecast data available');
    const isImperial = String(units).trim().toLowerCase() === 'imperial';
    const tempUnit = isImperial ? 'F' : 'C';

    // Group 3-hour entries by date
    const dailyMap = new Map();
    for (const entry of list) {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        if (!dailyMap.has(date)) {
            dailyMap.set(date, { dt: entry.dt, temps: [], descriptions: [] });
        }
        const day = dailyMap.get(date);
        day.temps.push(entry.main.temp_min, entry.main.temp_max);
        day.descriptions.push(entry.weather[0].description);
    }

    const days = Array.from(dailyMap.values()).slice(0, 5);
    const start = new Date(days[0].dt * 1000);
    const end = new Date(days[days.length - 1].dt * 1000);
    const parts = [];
    parts.push(`Weather forecast for ${start.toLocaleDateString()}-${end.toLocaleDateString()}:`);
    for (const day of days) {
        const dayDate = new Date(day.dt * 1000);
        const minTemp = Math.round(Math.min(...day.temps));
        const maxTemp = Math.round(Math.max(...day.temps));
        // Use the most common description for the day
        const descCounts = {};
        for (const d of day.descriptions) {
            descCounts[d] = (descCounts[d] || 0) + 1;
        }
        const description = Object.entries(descCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';
        parts.push(`${dayDate.toLocaleDateString()}: ${description}. Temperature: ${minTemp}°${tempUnit} - ${maxTemp}°${tempUnit}`);
    }
    return parts.join('\n');
}

/**
 * Get current weather for a location using OpenWeatherMap.
 * @param {string} location - The location to get weather for
 * @param {import('../commands.js').WeatherArguments} args - Weather display arguments
 * @returns {Promise<string>} Formatted weather string
 */
export async function getWeather(location, args) {
    if (!extension_settings.accuweather.openWeatherMapApiKey) {
        throw new Error('No OpenWeatherMap API key set.');
    }
    const units = args.units || extension_settings.accuweather.units;
    const data = await getOWMCurrentWeather(location, units);
    return parseOWMWeatherData(data, args);
}

/**
 * Get weather forecast for a location using OpenWeatherMap.
 * @param {string} location - The location to get forecast for
 * @param {string} units - The units to use ('metric' or 'imperial')
 * @returns {Promise<string>} Formatted forecast string
 */
export async function getForecast(location, units) {
    if (!extension_settings.accuweather.openWeatherMapApiKey) {
        throw new Error('No OpenWeatherMap API key set.');
    }
    const data = await getOWMForecast(location, units);
    return parseOWMForecastData(data, units);
}
