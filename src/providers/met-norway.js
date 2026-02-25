import { extension_settings } from '../../../../../extensions.js';
import { isTrueBoolean, isFalseBoolean } from '../../../../../utils.js';
import { degreesToDirection, cToF, msToMph, mmToIn } from '../utils.js';

const metNorwayGeoCache = new Map();

const SYMBOL_CODE_DESCRIPTIONS = {
    'clearsky': 'Clear sky',
    'cloudy': 'Cloudy',
    'fair': 'Fair',
    'fog': 'Fog',
    'heavyrain': 'Heavy rain',
    'heavyrainandthunder': 'Heavy rain and thunder',
    'heavyrainshowers': 'Heavy rain showers',
    'heavyrainshowersandthunder': 'Heavy rain showers and thunder',
    'heavysleet': 'Heavy sleet',
    'heavysleetandthunder': 'Heavy sleet and thunder',
    'heavysleetshowers': 'Heavy sleet showers',
    'heavysleetshowersandthunder': 'Heavy sleet showers and thunder',
    'heavysnow': 'Heavy snow',
    'heavysnowandthunder': 'Heavy snow and thunder',
    'heavysnowshowers': 'Heavy snow showers',
    'heavysnowshowersandthunder': 'Heavy snow showers and thunder',
    'lightrain': 'Light rain',
    'lightrainandthunder': 'Light rain and thunder',
    'lightrainshowers': 'Light rain showers',
    'lightrainshowersandthunder': 'Light rain showers and thunder',
    'lightsleet': 'Light sleet',
    'lightsleetandthunder': 'Light sleet and thunder',
    'lightsleetshowers': 'Light sleet showers',
    'lightsnow': 'Light snow',
    'lightsnowandthunder': 'Light snow and thunder',
    'lightsnowshowers': 'Light snow showers',
    'lightssleetshowersandthunder': 'Light sleet showers and thunder',
    'lightssnowshowersandthunder': 'Light snow showers and thunder',
    'partlycloudy': 'Partly cloudy',
    'rain': 'Rain',
    'rainandthunder': 'Rain and thunder',
    'rainshowers': 'Rain showers',
    'rainshowersandthunder': 'Rain showers and thunder',
    'sleet': 'Sleet',
    'sleetandthunder': 'Sleet and thunder',
    'sleetshowers': 'Sleet showers',
    'sleetshowersandthunder': 'Sleet showers and thunder',
    'snow': 'Snow',
    'snowandthunder': 'Snow and thunder',
    'snowshowers': 'Snow showers',
    'snowshowersandthunder': 'Snow showers and thunder',
};

/**
 * Convert a symbol_code from MET Norway to a human-readable description.
 * Symbol codes may have _day, _night, or _polartwilight suffixes.
 * @param {string} symbolCode - The symbol code from the API
 * @returns {string} Human-readable weather description
 */
function symbolCodeToDescription(symbolCode) {
    const base = symbolCode.replace(/_(day|night|polartwilight)$/, '');
    return SYMBOL_CODE_DESCRIPTIONS[base] || symbolCode;
}

async function getMetNorwayGeocode(location) {
    if (metNorwayGeoCache.has(location)) return metNorwayGeoCache.get(location);
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.append('name', location);
    url.searchParams.append('count', '1');
    url.searchParams.append('language', 'en');
    url.searchParams.append('format', 'json');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to geocode "${location}"`);
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error(`No location found for "${location}"`);
    const result = { lat: data.results[0].latitude, lon: data.results[0].longitude };
    metNorwayGeoCache.set(location, result);
    return result;
}

async function fetchMetNorwayForecast(location) {
    const { lat, lon } = await getMetNorwayGeocode(location);
    const url = new URL('https://api.met.no/weatherapi/locationforecast/2.0/complete');
    url.searchParams.append('lat', lat.toFixed(4));
    url.searchParams.append('lon', lon.toFixed(4));
    const response = await fetch(url, {
        headers: { 'User-Agent': 'SillyTavern-Weather-Extension github.com/SillyTavern/Extension-Weather' },
    });
    if (!response.ok) throw new Error('Failed to get weather from MET Norway');
    return await response.json();
}

function parseMetNorwayWeatherData(data, args) {
    const parts = [];
    const currentUnits = args.units || extension_settings.accuweather.units;
    const isImperial = String(currentUnits).trim().toLowerCase() === 'imperial';

    const timeseries = data.properties.timeseries;
    if (!timeseries || timeseries.length === 0) throw new Error('No weather data available');

    const current = timeseries[0];
    const details = current.data.instant.details;
    const next1h = current.data.next_1_hours;
    const next6h = current.data.next_6_hours;

    if (!isFalseBoolean(args.condition)) {
        const symbolCode = next1h?.summary?.symbol_code || next6h?.summary?.symbol_code || '';
        parts.push(symbolCodeToDescription(symbolCode));
    }
    if (!isFalseBoolean(args.temperature)) {
        const temp = isImperial ? Math.round(cToF(details.air_temperature)) : Math.round(details.air_temperature);
        const unit = isImperial ? '°F' : '°C';
        let tempStr = `${temp}${unit}`;
        if (isTrueBoolean(args.feelslike) && details.dew_point_temperature !== undefined) {
            // Use dew point as a proxy since MET Norway doesn't provide feels-like
            const dew = isImperial ? Math.round(cToF(details.dew_point_temperature)) : Math.round(details.dew_point_temperature);
            tempStr += ` (dew point ${dew}${unit})`;
        }
        parts.push(tempStr);
    }
    if (isTrueBoolean(args.wind)) {
        const speed = isImperial ? `${msToMph(details.wind_speed).toFixed(1)} mph` : `${details.wind_speed} m/s`;
        parts.push(`Wind: ${speed} ${degreesToDirection(details.wind_from_direction)}`);
    }
    if (isTrueBoolean(args.humidity)) {
        parts.push(`Humidity: ${details.relative_humidity}%`);
    }
    if (isTrueBoolean(args.pressure)) {
        parts.push(`Pressure: ${details.air_pressure_at_sea_level} hPa`);
    }
    if (isTrueBoolean(args.precipitation)) {
        const precipMm = next1h?.details?.precipitation_amount ?? next6h?.details?.precipitation_amount ?? 0;
        const precip = isImperial ? `${mmToIn(precipMm).toFixed(2)} in` : `${precipMm} mm`;
        parts.push(`Precipitation: ${precip}`);
    }
    return parts.join(', ');
}

function parseMetNorwayForecastData(data, units) {
    const timeseries = data.properties.timeseries;
    if (!timeseries || timeseries.length === 0) throw new Error('No forecast data available');

    const isImperial = String(units).trim().toLowerCase() === 'imperial';
    const tempUnit = isImperial ? '°F' : '°C';

    // Group timeseries entries by date
    const dailyMap = new Map();
    for (const entry of timeseries) {
        const date = entry.time.substring(0, 10); // YYYY-MM-DD
        if (!dailyMap.has(date)) {
            dailyMap.set(date, { date, temps: [], symbols: [], precipitations: [] });
        }
        const day = dailyMap.get(date);
        const details = entry.data.instant.details;
        day.temps.push(details.air_temperature);

        const symbolCode = entry.data.next_1_hours?.summary?.symbol_code
            || entry.data.next_6_hours?.summary?.symbol_code
            || entry.data.next_12_hours?.summary?.symbol_code;
        if (symbolCode) day.symbols.push(symbolCode);

        const precip = entry.data.next_1_hours?.details?.precipitation_amount
            ?? entry.data.next_6_hours?.details?.precipitation_amount;
        if (precip !== undefined) day.precipitations.push(precip);
    }

    const days = Array.from(dailyMap.values()).slice(0, 5);
    const start = new Date(days[0].date);
    const end = new Date(days[days.length - 1].date);
    const parts = [];
    parts.push(`Weather forecast for ${start.toLocaleDateString()}-${end.toLocaleDateString()}:`);

    for (const day of days) {
        const dayDate = new Date(day.date);
        const minTemp = Math.round(isImperial ? cToF(Math.min(...day.temps)) : Math.min(...day.temps));
        const maxTemp = Math.round(isImperial ? cToF(Math.max(...day.temps)) : Math.max(...day.temps));

        // Use the most common symbol code for the day
        const symbolCounts = {};
        for (const s of day.symbols) {
            const base = s.replace(/_(day|night|polartwilight)$/, '');
            symbolCounts[base] = (symbolCounts[base] || 0) + 1;
        }
        const topSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        const description = SYMBOL_CODE_DESCRIPTIONS[topSymbol] || topSymbol || 'No data';

        parts.push(`${dayDate.toLocaleDateString()}: ${description}. Temperature: ${minTemp}${tempUnit} - ${maxTemp}${tempUnit}`);
    }
    return parts.join('\n');
}

/**
 * Get current weather for a location using MET Norway.
 * @param {string} location - The location to get weather for
 * @param {import('../commands.js').WeatherArguments} args - Weather display arguments
 * @returns {Promise<string>} Formatted weather string
 */
export async function getWeather(location, args) {
    const data = await fetchMetNorwayForecast(location);
    return parseMetNorwayWeatherData(data, args);
}

/**
 * Get weather forecast for a location using MET Norway.
 * @param {string} location - The location to get forecast for
 * @param {string} units - The units to use ('metric' or 'imperial')
 * @returns {Promise<string>} Formatted forecast string
 */
export async function getForecast(location, units) {
    const data = await fetchMetNorwayForecast(location);
    return parseMetNorwayForecastData(data, units);
}
