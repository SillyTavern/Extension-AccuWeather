import { extension_settings } from '../../../../../extensions.js';
import * as accuweather from './accuweather.js';
import * as openweathermap from './openweathermap.js';
import * as openMeteo from './open-meteo.js';
import * as wttrIn from './wttr-in.js';

/**
 * @typedef {Object} WeatherProvider
 * @property {function(string, import('../commands.js').WeatherArguments): Promise<string>} getWeather
 * @property {function(string, string): Promise<string>} getForecast
 */

/** @type {Record<string, WeatherProvider>} */
const providers = {
    'accuweather': accuweather,
    'openweathermap': openweathermap,
    'open-meteo': openMeteo,
    'wttr.in': wttrIn,
};

/**
 * Get current weather using the configured provider.
 * @param {string} location - The location to get weather for
 * @param {import('../commands.js').WeatherArguments} args - Weather display arguments
 * @returns {Promise<string>} Formatted weather string
 */
export async function getWeatherByProvider(location, args) {
    const providerKey = extension_settings.accuweather.provider || 'accuweather';
    const currentLocation = location || extension_settings.accuweather.preferredLocation;
    const provider = providers[providerKey] || providers['accuweather'];
    return await provider.getWeather(currentLocation, args);
}

/**
 * Get weather forecast using the configured provider.
 * @param {string} location - The location to get forecast for
 * @param {string} units - The units to use ('metric' or 'imperial')
 * @returns {Promise<string>} Formatted forecast string
 */
export async function getForecastByProvider(location, units) {
    const providerKey = extension_settings.accuweather.provider || 'accuweather';
    const currentLocation = location || extension_settings.accuweather.preferredLocation;
    const currentUnits = units || extension_settings.accuweather.units;
    const provider = providers[providerKey] || providers['accuweather'];
    return await provider.getForecast(currentLocation, currentUnits);
}
