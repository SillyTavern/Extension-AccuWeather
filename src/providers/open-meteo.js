import { extension_settings } from '../../../../../extensions.js';
import { isTrueBoolean, isFalseBoolean } from '../../../../../utils.js';
import { degreesToDirection } from '../utils.js';

const openMeteoGeoCache = new Map();

const WMO_WEATHER_CODES = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
};

async function getOpenMeteoGeocode(location) {
    if (openMeteoGeoCache.has(location)) return openMeteoGeoCache.get(location);
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.append('name', location);
    url.searchParams.append('count', '1');
    url.searchParams.append('language', 'en');
    url.searchParams.append('format', 'json');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to geocode "${location}" via Open-Meteo`);
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error(`No location found for "${location}"`);
    const result = { lat: data.results[0].latitude, lon: data.results[0].longitude };
    openMeteoGeoCache.set(location, result);
    return result;
}

async function getOpenMeteoCurrentWeather(location, units) {
    const { lat, lon } = await getOpenMeteoGeocode(location);
    const isImperial = String(units).trim().toLowerCase() === 'imperial';
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.append('latitude', lat);
    url.searchParams.append('longitude', lon);
    url.searchParams.append('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m');
    url.searchParams.append('temperature_unit', isImperial ? 'fahrenheit' : 'celsius');
    url.searchParams.append('wind_speed_unit', isImperial ? 'mph' : 'kmh');
    url.searchParams.append('precipitation_unit', isImperial ? 'inch' : 'mm');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to get weather from Open-Meteo');
    return await response.json();
}

async function getOpenMeteoForecast(location, units) {
    const { lat, lon } = await getOpenMeteoGeocode(location);
    const isImperial = String(units).trim().toLowerCase() === 'imperial';
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.append('latitude', lat);
    url.searchParams.append('longitude', lon);
    url.searchParams.append('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant');
    url.searchParams.append('temperature_unit', isImperial ? 'fahrenheit' : 'celsius');
    url.searchParams.append('wind_speed_unit', isImperial ? 'mph' : 'kmh');
    url.searchParams.append('precipitation_unit', isImperial ? 'inch' : 'mm');
    url.searchParams.append('forecast_days', '5');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to get forecast from Open-Meteo');
    return await response.json();
}

function parseOpenMeteoWeatherData(data, args) {
    const parts = [];
    const current = data.current;
    const units = data.current_units;

    if (!isFalseBoolean(args.condition)) {
        parts.push(WMO_WEATHER_CODES[current.weather_code] || 'Unknown');
    }
    if (!isFalseBoolean(args.temperature)) {
        let temp = `${Math.round(current.temperature_2m)}${units.temperature_2m}`;
        if (isTrueBoolean(args.feelslike)) {
            temp += ` (feels like ${Math.round(current.apparent_temperature)}${units.apparent_temperature})`;
        }
        parts.push(temp);
    }
    if (isTrueBoolean(args.wind)) {
        parts.push(`Wind: ${current.wind_speed_10m} ${units.wind_speed_10m} ${degreesToDirection(current.wind_direction_10m)}`);
    }
    if (isTrueBoolean(args.humidity)) {
        parts.push(`Humidity: ${current.relative_humidity_2m}%`);
    }
    if (isTrueBoolean(args.pressure)) {
        parts.push(`Pressure: ${current.pressure_msl} ${units.pressure_msl}`);
    }
    if (isTrueBoolean(args.precipitation)) {
        parts.push(`Precipitation: ${current.precipitation} ${units.precipitation}`);
    }
    return parts.join(', ');
}

function parseOpenMeteoForecastData(data) {
    const daily = data.daily;
    const dailyUnits = data.daily_units;
    if (!daily || !daily.time || daily.time.length === 0) throw new Error('No forecast data available');
    const start = new Date(daily.time[0]);
    const end = new Date(daily.time[daily.time.length - 1]);
    const parts = [];
    parts.push(`Weather forecast for ${start.toLocaleDateString()}-${end.toLocaleDateString()}:`);
    for (let i = 0; i < daily.time.length; i++) {
        const dayDate = new Date(daily.time[i]);
        const description = WMO_WEATHER_CODES[daily.weather_code[i]] || 'Unknown';
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const tempUnit = dailyUnits.temperature_2m_max;
        parts.push(`${dayDate.toLocaleDateString()}: ${description}. Temperature: ${minTemp}${tempUnit} - ${maxTemp}${tempUnit}`);
    }
    return parts.join('\n');
}

/**
 * Get current weather for a location using Open-Meteo.
 * @param {string} location - The location to get weather for
 * @param {import('../commands.js').WeatherArguments} args - Weather display arguments
 * @returns {Promise<string>} Formatted weather string
 */
export async function getWeather(location, args) {
    const units = args.units || extension_settings.accuweather.units;
    const data = await getOpenMeteoCurrentWeather(location, units);
    return parseOpenMeteoWeatherData(data, args);
}

/**
 * Get weather forecast for a location using Open-Meteo.
 * @param {string} location - The location to get forecast for
 * @param {string} units - The units to use ('metric' or 'imperial')
 * @returns {Promise<string>} Formatted forecast string
 */
export async function getForecast(location, units) {
    const data = await getOpenMeteoForecast(location, units);
    return parseOpenMeteoForecastData(data);
}
