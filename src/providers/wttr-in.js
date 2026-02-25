import { extension_settings } from '../../../../../extensions.js';
import { isTrueBoolean, isFalseBoolean } from '../../../../../utils.js';

async function getWttrInWeather(location) {
    const url = new URL(`https://wttr.in/${encodeURIComponent(location)}`);
    url.searchParams.append('format', 'j1');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to get weather from wttr.in for "${location}"`);
    const data = await response.json();
    if (!data || !data.current_condition || data.current_condition.length === 0) {
        throw new Error(`No weather data found for "${location}"`);
    }
    return data;
}

function parseWttrInWeatherData(data, args) {
    const current = data.current_condition[0];
    const parts = [];
    const currentUnits = args.units || extension_settings.accuweather.units;
    const isImperial = String(currentUnits).trim().toLowerCase() === 'imperial';

    if (!isFalseBoolean(args.condition)) {
        parts.push(current.weatherDesc[0].value.trim());
    }
    if (!isFalseBoolean(args.temperature)) {
        let temp = isImperial ? `${current.temp_F}°F` : `${current.temp_C}°C`;
        if (isTrueBoolean(args.feelslike)) {
            temp += isImperial ? ` (feels like ${current.FeelsLikeF}°F)` : ` (feels like ${current.FeelsLikeC}°C)`;
        }
        parts.push(temp);
    }
    if (isTrueBoolean(args.wind)) {
        const speed = isImperial ? `${current.windspeedMiles} mph` : `${current.windspeedKmph} km/h`;
        parts.push(`Wind: ${speed} ${current.winddir16Point}`);
    }
    if (isTrueBoolean(args.humidity)) {
        parts.push(`Humidity: ${current.humidity}%`);
    }
    if (isTrueBoolean(args.pressure)) {
        const pressure = isImperial ? `${current.pressureInches} inHg` : `${current.pressure} mb`;
        parts.push(`Pressure: ${pressure}`);
    }
    if (isTrueBoolean(args.visibility)) {
        const vis = isImperial ? `${current.visibilityMiles} miles` : `${current.visibility} km`;
        parts.push(`Visibility: ${vis}`);
    }
    if (isTrueBoolean(args.uvindex)) {
        parts.push(`UV Index: ${current.uvIndex}`);
    }
    if (isTrueBoolean(args.precipitation)) {
        const precip = isImperial ? `${current.precipInches} in` : `${current.precipMM} mm`;
        parts.push(`Precipitation: ${precip}`);
    }
    return parts.join(', ');
}

function parseWttrInForecastData(data, units) {
    const days = data.weather;
    if (!days || days.length === 0) throw new Error('No forecast data available');
    const isImperial = String(units).trim().toLowerCase() === 'imperial';
    const start = new Date(days[0].date);
    const end = new Date(days[days.length - 1].date);
    const parts = [];
    parts.push(`Weather forecast for ${start.toLocaleDateString()}-${end.toLocaleDateString()}:`);
    for (const day of days) {
        const dayDate = new Date(day.date);
        const tempMin = isImperial ? `${day.mintempF}°F` : `${day.mintempC}°C`;
        const tempMax = isImperial ? `${day.maxtempF}°F` : `${day.maxtempC}°C`;
        // wttr.in hourly entries are 3-hour intervals: [0]=00:00, [4]=12:00, [7]=21:00
        const dayDesc = day.hourly && day.hourly[4] ? day.hourly[4].weatherDesc[0].value.trim() : '';
        const nightDesc = day.hourly && day.hourly[7] ? day.hourly[7].weatherDesc[0].value.trim() : '';
        parts.push(`${dayDate.toLocaleDateString()}: ${dayDesc} during the day, ${nightDesc} at night. Temperature: ${tempMin} - ${tempMax}`);
    }
    return parts.join('\n');
}

/**
 * Get current weather for a location using wttr.in.
 * @param {string} location - The location to get weather for
 * @param {import('../commands.js').WeatherArguments} args - Weather display arguments
 * @returns {Promise<string>} Formatted weather string
 */
export async function getWeather(location, args) {
    const data = await getWttrInWeather(location);
    return parseWttrInWeatherData(data, args);
}

/**
 * Get weather forecast for a location using wttr.in.
 * @param {string} location - The location to get forecast for
 * @param {string} units - The units to use ('metric' or 'imperial')
 * @returns {Promise<string>} Formatted forecast string
 */
export async function getForecast(location, units) {
    const data = await getWttrInWeather(location);
    return parseWttrInForecastData(data, units);
}
