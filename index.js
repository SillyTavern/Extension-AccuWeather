import { extension_settings } from '../../../extensions.js';
import { isTrueBoolean, isFalseBoolean } from '../../../utils.js';
import { saveSettingsDebounced } from '../../../../script.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandEnumValue, enumTypes } from '../../../slash-commands/SlashCommandEnumValue.js';
import { commonEnumProviders } from '../../../slash-commands/SlashCommandCommonEnumsProvider.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';

/**
 * @typedef {Object} WeatherData
 * @property {string} LocalObservationDateTime
 * @property {number} EpochTime
 * @property {string} WeatherText
 * @property {number} WeatherIcon
 * @property {boolean} HasPrecipitation
 * @property {string|null} PrecipitationType
 * @property {boolean} IsDayTime
 * @property {Object} Temperature
 * @property {Object} Temperature.Metric
 * @property {number} Temperature.Metric.Value
 * @property {string} Temperature.Metric.Unit
 * @property {number} Temperature.Metric.UnitType
 * @property {Object} Temperature.Imperial
 * @property {number} Temperature.Imperial.Value
 * @property {string} Temperature.Imperial.Unit
 * @property {number} Temperature.Imperial.UnitType
 * @property {Object} RealFeelTemperature
 * @property {Object} RealFeelTemperature.Metric
 * @property {number} RealFeelTemperature.Metric.Value
 * @property {string} RealFeelTemperature.Metric.Unit
 * @property {number} RealFeelTemperature.Metric.UnitType
 * @property {string} RealFeelTemperature.Metric.Phrase
 * @property {Object} RealFeelTemperature.Imperial
 * @property {number} RealFeelTemperature.Imperial.Value
 * @property {string} RealFeelTemperature.Imperial.Unit
 * @property {number} RealFeelTemperature.Imperial.UnitType
 * @property {string} RealFeelTemperature.Imperial.Phrase
 * @property {Object} RealFeelTemperatureShade
 * @property {Object} RealFeelTemperatureShade.Metric
 * @property {number} RealFeelTemperatureShade.Metric.Value
 * @property {string} RealFeelTemperatureShade.Metric.Unit
 * @property {number} RealFeelTemperatureShade.Metric.UnitType
 * @property {string} RealFeelTemperatureShade.Metric.Phrase
 * @property {Object} RealFeelTemperatureShade.Imperial
 * @property {number} RealFeelTemperatureShade.Imperial.Value
 * @property {string} RealFeelTemperatureShade.Imperial.Unit
 * @property {number} RealFeelTemperatureShade.Imperial.UnitType
 * @property {string} RealFeelTemperatureShade.Imperial.Phrase
 * @property {number} RelativeHumidity
 * @property {number} IndoorRelativeHumidity
 * @property {Object} DewPoint
 * @property {Object} DewPoint.Metric
 * @property {number} DewPoint.Metric.Value
 * @property {string} DewPoint.Metric.Unit
 * @property {number} DewPoint.Metric.UnitType
 * @property {Object} DewPoint.Imperial
 * @property {number} DewPoint.Imperial.Value
 * @property {string} DewPoint.Imperial.Unit
 * @property {number} DewPoint.Imperial.UnitType
 * @property {Object} Wind
 * @property {Object} Wind.Direction
 * @property {number} Wind.Direction.Degrees
 * @property {string} Wind.Direction.Localized
 * @property {string} Wind.Direction.English
 * @property {Object} Wind.Speed
 * @property {Object} Wind.Speed.Metric
 * @property {number} Wind.Speed.Metric.Value
 * @property {string} Wind.Speed.Metric.Unit
 * @property {number} Wind.Speed.Metric.UnitType
 * @property {Object} Wind.Speed.Imperial
 * @property {number} Wind.Speed.Imperial.Value
 * @property {string} Wind.Speed.Imperial.Unit
 * @property {number} Wind.Speed.Imperial.UnitType
 * @property {Object} WindGust
 * @property {Object} WindGust.Speed
 * @property {Object} WindGust.Speed.Metric
 * @property {number} WindGust.Speed.Metric.Value
 * @property {string} WindGust.Speed.Metric.Unit
 * @property {number} WindGust.Speed.Metric.UnitType
 * @property {Object} WindGust.Speed.Imperial
 * @property {number} WindGust.Speed.Imperial.Value
 * @property {string} WindGust.Speed.Imperial.Unit
 * @property {number} WindGust.Speed.Imperial.UnitType
 * @property {number} UVIndex
 * @property {string} UVIndexText
 * @property {Object} Visibility
 * @property {Object} Visibility.Metric
 * @property {number} Visibility.Metric.Value
 * @property {string} Visibility.Metric.Unit
 * @property {number} Visibility.Metric.UnitType
 * @property {Object} Visibility.Imperial
 * @property {number} Visibility.Imperial.Value
 * @property {string} Visibility.Imperial.Unit
 * @property {number} Visibility.Imperial.UnitType
 * @property {string} ObstructionsToVisibility
 * @property {number} CloudCover
 * @property {Object} Ceiling
 * @property {Object} Ceiling.Metric
 * @property {number} Ceiling.Metric.Value
 * @property {string} Ceiling.Metric.Unit
 * @property {number} Ceiling.Metric.UnitType
 * @property {Object} Ceiling.Imperial
 * @property {number} Ceiling.Imperial.Value
 * @property {string} Ceiling.Imperial.Unit
 * @property {number} Ceiling.Imperial.UnitType
 * @property {Object} Pressure
 * @property {Object} Pressure.Metric
 * @property {number} Pressure.Metric.Value
 * @property {string} Pressure.Metric.Unit
 * @property {number} Pressure.Metric.UnitType
 * @property {Object} Pressure.Imperial
 * @property {number} Pressure.Imperial.Value
 * @property {string} Pressure.Imperial.Unit
 * @property {number} Pressure.Imperial.UnitType
 * @property {Object} PressureTendency
 * @property {string} PressureTendency.LocalizedText
 * @property {string} PressureTendency.Code
 * @property {Object} Past24HourTemperatureDeparture
 * @property {Object} Past24HourTemperatureDeparture.Metric
 * @property {number} Past24HourTemperatureDeparture.Metric.Value
 * @property {string} Past24HourTemperatureDeparture.Metric.Unit
 * @property {number} Past24HourTemperatureDeparture.Metric.UnitType
 * @property {Object} Past24HourTemperatureDeparture.Imperial
 * @property {number} Past24HourTemperatureDeparture.Imperial.Value
 * @property {string} Past24HourTemperatureDeparture.Imperial.Unit
 * @property {number} Past24HourTemperatureDeparture.Imperial.UnitType
 * @property {Object} ApparentTemperature
 * @property {Object} ApparentTemperature.Metric
 * @property {number} ApparentTemperature.Metric.Value
 * @property {string} ApparentTemperature.Metric.Unit
 * @property {number} ApparentTemperature.Metric.UnitType
 * @property {Object} ApparentTemperature.Imperial
 * @property {number} ApparentTemperature.Imperial.Value
 * @property {string} ApparentTemperature.Imperial.Unit
 * @property {number} ApparentTemperature.Imperial.UnitType
 * @property {Object} WindChillTemperature
 * @property {Object} WindChillTemperature.Metric
 * @property {number} WindChillTemperature.Metric.Value
 * @property {string} WindChillTemperature.Metric.Unit
 * @property {number} WindChillTemperature.Metric.UnitType
 * @property {Object} WindChillTemperature.Imperial
 * @property {number} WindChillTemperature.Imperial.Value
 * @property {string} WindChillTemperature.Imperial.Unit
 * @property {number} WindChillTemperature.Imperial.UnitType
 * @property {Object} WetBulbTemperature
 * @property {Object} WetBulbTemperature.Metric
 * @property {number} WetBulbTemperature.Metric.Value
 * @property {string} WetBulbTemperature.Metric.Unit
 * @property {number} WetBulbTemperature.Metric.UnitType
 * @property {Object} WetBulbTemperature.Imperial
 * @property {number} WetBulbTemperature.Imperial.Value
 * @property {string} WetBulbTemperature.Imperial.Unit
 * @property {number} WetBulbTemperature.Imperial.UnitType
 * @property {Object} WetBulbGlobeTemperature
 * @property {Object} WetBulbGlobeTemperature.Metric
 * @property {number} WetBulbGlobeTemperature.Metric.Value
 * @property {string} WetBulbGlobeTemperature.Metric.Unit
 * @property {number} WetBulbGlobeTemperature.Metric.UnitType
 * @property {Object} WetBulbGlobeTemperature.Imperial
 * @property {number} WetBulbGlobeTemperature.Imperial.Value
 * @property {string} WetBulbGlobeTemperature.Imperial.Unit
 * @property {number} WetBulbGlobeTemperature.Imperial.UnitType
 * @property {Object} Precip1hr
 * @property {Object} Precip1hr.Metric
 * @property {number} Precip1hr.Metric.Value
 * @property {string} Precip1hr.Metric.Unit
 * @property {number} Precip1hr.Metric.UnitType
 * @property {Object} Precip1hr.Imperial
 * @property {number} Precip1hr.Imperial.Value
 * @property {string} Precip1hr.Imperial.Unit
 * @property {number} Precip1hr.Imperial.UnitType
 * @property {Object} PrecipitationSummary
 * @property {Object} PrecipitationSummary.Precipitation
 * @property {Object} PrecipitationSummary.Precipitation.Metric
 * @property {number} PrecipitationSummary.Precipitation.Metric.Value
 * @property {string} PrecipitationSummary.Precipitation.Metric.Unit
 * @property {number} PrecipitationSummary.Precipitation.Metric.UnitType
 * @property {Object} PrecipitationSummary.Precipitation.Imperial
 * @property {number} PrecipitationSummary.Precipitation.Imperial.Value
 * @property {string} PrecipitationSummary.Precipitation.Imperial.Unit
 * @property {number} PrecipitationSummary.Precipitation.Imperial.UnitType
 * @property {Object} PrecipitationSummary.PastHour
 * @property {Object} PrecipitationSummary.PastHour.Metric
 * @property {number} PrecipitationSummary.PastHour.Metric.Value
 * @property {string} PrecipitationSummary.PastHour.Metric.Unit
 * @property {number} PrecipitationSummary.PastHour.Metric.UnitType
 * @property {Object} PrecipitationSummary.PastHour.Imperial
 * @property {number} PrecipitationSummary.PastHour.Imperial.Value
 * @property {string} PrecipitationSummary.PastHour.Imperial.Unit
 * @property {number} PrecipitationSummary.PastHour.Imperial.UnitType
 * @property {Object} PrecipitationSummary.Past3Hours
 * @property {Object} PrecipitationSummary.Past3Hours.Metric
 * @property {number} PrecipitationSummary.Past3Hours.Metric.Value
 * @property {string} PrecipitationSummary.Past3Hours.Metric.Unit
 * @property {number} PrecipitationSummary.Past3Hours.Metric.UnitType
 * @property {Object} PrecipitationSummary.Past3Hours.Imperial
 * @property {number} PrecipitationSummary.Past3Hours.Imperial.Value
 * @property {string} PrecipitationSummary.Past3Hours.Imperial.Unit
 * @property {number} PrecipitationSummary.Past3Hours.Imperial.UnitType
 * @property {Object} PrecipitationSummary.Past6Hours
 * @property {Object} PrecipitationSummary.Past6Hours.Metric
 * @property {number} PrecipitationSummary.Past6Hours.Metric.Value
 * @property {string} PrecipitationSummary.Past6Hours.Metric.Unit
 * @property {number} PrecipitationSummary.Past6Hours.Metric.UnitType
 * @property {Object} PrecipitationSummary.Past6Hours.Imperial
 * @property {number} PrecipitationSummary.Past6Hours.Imperial.Value
 * @property {string} PrecipitationSummary.Past6Hours.Imperial.Unit
 * @property {number} PrecipitationSummary.Past6Hours.Imperial.UnitType
 * @property {Object} PrecipitationSummary.Past9Hours
 * @property {Object} PrecipitationSummary.Past9Hours.Metric
 * @property {number} PrecipitationSummary.Past9Hours.Metric.Value
 * @property {string} PrecipitationSummary.Past9Hours.Metric.Unit
 * @property {number} PrecipitationSummary.Past9Hours.Metric.UnitType
 * @property {Object} PrecipitationSummary.Past9Hours.Imperial
 * @property {number} PrecipitationSummary.Past9Hours.Imperial.Value
 * @property {string} PrecipitationSummary.Past9Hours.Imperial.Unit
 * @property {number} PrecipitationSummary.Past9Hours.Imperial.UnitType
 * @property {Object} PrecipitationSummary.Past12Hours
 * @property {Object} PrecipitationSummary.Past12Hours.Metric
 * @property {number} PrecipitationSummary.Past12Hours.Metric.Value
 * @property {string} PrecipitationSummary.Past12Hours.Metric.Unit
 * @property {number} PrecipitationSummary.Past12Hours.Metric.UnitType
 * @property {Object} PrecipitationSummary.Past12Hours.Imperial
 * @property {number} PrecipitationSummary.Past12Hours.Imperial.Value
 * @property {string} PrecipitationSummary.Past12Hours.Imperial.Unit
 * @property {number} PrecipitationSummary.Past12Hours.Imperial.UnitType
 * @property {Object} PrecipitationSummary.Past18Hours
 * @property {Object} PrecipitationSummary.Past18Hours.Metric
 * @property {number} PrecipitationSummary.Past18Hours.Metric.Value
 * @property {string} PrecipitationSummary.Past18Hours.Metric.Unit
 * @property {number} PrecipitationSummary.Past18Hours.Metric.UnitType
 * @property {Object} PrecipitationSummary.Past18Hours.Imperial
 * @property {number} PrecipitationSummary.Past18Hours.Imperial.Value
 * @property {string} PrecipitationSummary.Past18Hours.Imperial.Unit
 * @property {number} PrecipitationSummary.Past18Hours.Imperial.UnitType
 * @property {Object} PrecipitationSummary.Past24Hours
 * @property {Object} PrecipitationSummary.Past24Hours.Metric
 * @property {number} PrecipitationSummary.Past24Hours.Metric.Value
 * @property {string} PrecipitationSummary.Past24Hours.Metric.Unit
 * @property {number} PrecipitationSummary.Past24Hours.Metric.UnitType
 * @property {Object} PrecipitationSummary.Past24Hours.Imperial
 * @property {number} PrecipitationSummary.Past24Hours.Imperial.Value
 * @property {string} PrecipitationSummary.Past24Hours.Imperial.Unit
 * @property {number} PrecipitationSummary.Past24Hours.Imperial.UnitType
 * @property {string} MobileLink
 * @property {string} Link
 */

/**
 * @typedef {Object} WeatherArguments
 * @property {boolean} condition
 * @property {boolean} temperature
 * @property {boolean} feelslike
 * @property {boolean} wind
 * @property {boolean} humidity
 * @property {boolean} pressure
 * @property {boolean} visibility
 * @property {boolean} uvindex
 * @property {boolean} precipitation
 */

const locationCache = new Map();

const WEATHER_PROVIDERS = {
    'accuweather': 'AccuWeather',
    'openweathermap': 'OpenWeatherMap',
    'wttr.in': 'wttr.in',
};

const defaultSettings = {
    provider: 'accuweather',
    apiKey: '',
    openWeatherMapApiKey: '',
    preferredLocation: '',
    units: 'metric',
};

async function getWeatherCallback(args, location) {
    if (!location && !extension_settings.accuweather.preferredLocation) {
        throw new Error('No location provided, and no preferred location set.');
    }
    return await getWeatherByProvider(location, args);
}

function parseWeatherData(weatherData, args) {
    const parts = [];
    const currentUnits = args.units || extension_settings.accuweather.units;
    const unitKey = String(currentUnits).trim().toLowerCase() === 'imperial' ? 'Imperial' : 'Metric';

    if (!isFalseBoolean(args.condition)) {
        parts.push(weatherData.WeatherText);
    }

    if (!isFalseBoolean(args.temperature)) {
        let temp = `${weatherData.Temperature[unitKey].Value}°${weatherData.Temperature[unitKey].Unit}`;

        if (isTrueBoolean(args.feelslike)) {
            temp += ` (feels like ${weatherData.RealFeelTemperature[unitKey].Value}°${weatherData.RealFeelTemperature[unitKey].Unit})`;
        }

        parts.push(temp);
    }

    if (isTrueBoolean(args.wind)) {
        parts.push(`Wind: ${weatherData.Wind.Speed[unitKey].Value} ${weatherData.Wind.Speed[unitKey].Unit} ${weatherData.Wind.Direction.English}`);
    }

    if (isTrueBoolean(args.humidity)) {
        parts.push(`Humidity: ${weatherData.RelativeHumidity}%`);
    }

    if (isTrueBoolean(args.pressure)) {
        parts.push(`Pressure: ${weatherData.Pressure[unitKey].Value} ${weatherData.Pressure[unitKey].Unit}`);
    }

    if (isTrueBoolean(args.visibility)) {
        parts.push(`Visibility: ${weatherData.Visibility[unitKey].Value} ${weatherData.Visibility[unitKey].Unit}`);
    }

    if (isTrueBoolean(args.uvindex)) {
        parts.push(`UV Index: ${weatherData.UVIndexText}`);
    }

    if (isTrueBoolean(args.precipitation)) {
        parts.push(`Precipitation: ${weatherData.PrecipitationSummary.Precipitation[unitKey].Value} ${weatherData.PrecipitationSummary.Precipitation[unitKey].Unit}`);
    }

    return parts.join(', ');
}

function parseWeatherForecastData(weatherData) {
    const start = new Date(weatherData.DailyForecasts[0].Date);
    const end = new Date(weatherData.DailyForecasts[4].Date);
    const summary = weatherData.Headline.Text;
    const parts = [];

    parts.push(`Weather forecast for ${start.toLocaleDateString()}-${end.toLocaleDateString()}: ${summary}`);

    for (const day of weatherData.DailyForecasts) {
        const dayDate = new Date(day.Date);
        const daySummary = day.Day.LongPhrase;
        const nightSummary = day.Night.LongPhrase;
        const temperature = `${day.Temperature.Minimum.Value}°${day.Temperature.Minimum.Unit} - ${day.Temperature.Maximum.Value}°${day.Temperature.Maximum.Unit}`;
        parts.push(`${dayDate.toLocaleDateString()}: ${daySummary} during the day, ${nightSummary} at night. Temperature: ${temperature}`);
    }

    return parts.join('\n');
}

async function getLocationKey(location) {
    if (locationCache.has(location)) {
        return locationCache.get(location);
    }

    const baseUrl = new URL('http://dataservice.accuweather.com/locations/v1/search');
    const params = new URLSearchParams();
    params.append('apikey', extension_settings.accuweather.apiKey);
    params.append('q', location);
    baseUrl.search = params.toString();

    const response = await fetch(baseUrl);

    if (!response.ok) {
        throw new Error(`Failed to get location for "${location}"`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No location found for "${location}"`);
    }

    const locationKey = data[0].Key;
    locationCache.set(location, locationKey);
    return locationKey;
}

/**
 * Get the current weather for a location
 * @param {string} location - The location to get the weather for
 * @returns {Promise<WeatherData>} The weather information
 */
async function getWeatherForLocation(locationKey) {
    const baseUrl = new URL(`http://dataservice.accuweather.com/currentconditions/v1/${locationKey}`);
    const params = new URLSearchParams();
    params.append('apikey', extension_settings.accuweather.apiKey);
    params.append('details', 'true');
    baseUrl.search = params.toString();

    const response = await fetch(baseUrl);

    if (!response.ok) {
        throw new Error(`Failed to get weather for location key "${locationKey}"`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No weather data found for location key "${locationKey}"`);
    }

    return data[0];
}

async function getForecastForLocation(locationKey, units) {
    const baseUrl = new URL(`http://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}`);
    const params = new URLSearchParams();
    params.append('apikey', extension_settings.accuweather.apiKey);
    params.append('details', 'true');
    params.append('metric', units === 'metric');
    baseUrl.search = params.toString();

    const response = await fetch(baseUrl);

    if (!response.ok) {
        throw new Error(`Failed to get forecast for location key "${locationKey}"`);
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
        throw new Error(`No forecast data found for location key "${locationKey}"`);
    }

    return data;
}

// --- wttr.in provider ---

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

// --- OpenWeatherMap provider ---

const owmGeoCache = new Map();

function degreesToDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

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

// --- Provider routing ---

async function getWeatherByProvider(location, args) {
    const provider = extension_settings.accuweather.provider || 'accuweather';
    const currentLocation = location || extension_settings.accuweather.preferredLocation;
    const units = args.units || extension_settings.accuweather.units;

    switch (provider) {
        case 'wttr.in': {
            const data = await getWttrInWeather(currentLocation);
            return parseWttrInWeatherData(data, args);
        }
        case 'openweathermap': {
            if (!extension_settings.accuweather.openWeatherMapApiKey) {
                throw new Error('No OpenWeatherMap API key set.');
            }
            const data = await getOWMCurrentWeather(currentLocation, units);
            return parseOWMWeatherData(data, args);
        }
        case 'accuweather':
        default: {
            if (!extension_settings.accuweather.apiKey) {
                throw new Error('No AccuWeather API key set.');
            }
            const locationKey = await getLocationKey(currentLocation);
            const weatherData = await getWeatherForLocation(locationKey);
            return parseWeatherData(weatherData, args);
        }
    }
}

async function getForecastByProvider(location, units) {
    const provider = extension_settings.accuweather.provider || 'accuweather';
    const currentLocation = location || extension_settings.accuweather.preferredLocation;
    const currentUnits = units || extension_settings.accuweather.units;

    switch (provider) {
        case 'wttr.in': {
            const data = await getWttrInWeather(currentLocation);
            return parseWttrInForecastData(data, currentUnits);
        }
        case 'openweathermap': {
            if (!extension_settings.accuweather.openWeatherMapApiKey) {
                throw new Error('No OpenWeatherMap API key set.');
            }
            const data = await getOWMForecast(currentLocation, currentUnits);
            return parseOWMForecastData(data, currentUnits);
        }
        case 'accuweather':
        default: {
            if (!extension_settings.accuweather.apiKey) {
                throw new Error('No AccuWeather API key set.');
            }
            const locationKey = await getLocationKey(currentLocation);
            const weatherData = await getForecastForLocation(locationKey, currentUnits);
            return parseWeatherForecastData(weatherData);
        }
    }
}

function registerFunctionTools() {
    try {
        const { registerFunctionTool, unregisterFunctionTool } = SillyTavern.getContext();

        if (!registerFunctionTool || !unregisterFunctionTool) {
            console.debug('[AccuWeather] Tool calling is not supported.');
            return;
        }

        if (!extension_settings.accuweather.functionTool) {
            unregisterFunctionTool('GetCurrentWeather');
            unregisterFunctionTool('GetWeatherForecast');
            return;
        }

        const getWeatherSchema = Object.freeze({
            $schema: 'http://json-schema.org/draft-04/schema#',
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The location to get the weather for, e.g. "Bucharest, Romania" or "Los Angeles, CA".',
                },
                units: {
                    type: 'string',
                    description: 'The units to use for the weather data. Use "metric" or "imperial" depending on the location.',
                },
                condition: {
                    type: 'boolean',
                    description: 'The result should include the weather condition, e.g. "Clear".',
                },
                temperature: {
                    type: 'boolean',
                    description: 'The result should include the actual temperature.',
                },
                feelslike: {
                    type: 'boolean',
                    description: 'The result should include the "feels like" temperature.',
                },
                wind: {
                    type: 'boolean',
                    description: 'The result should include the wind speed and direction.',
                },
                humidity: {
                    type: 'boolean',
                    description: 'The result should include the relative humidity.',
                },
                pressure: {
                    type: 'boolean',
                    description: 'The result should include the pressure.',
                },
                visibility: {
                    type: 'boolean',
                    description: 'The result should include the visibility.',
                },
                uvindex: {
                    type: 'boolean',
                    description: 'The result should include the UV index.',
                },
                precipitation: {
                    type: 'boolean',
                    description: 'The result should include the precipitation.',
                },
            },
            required: [
                'location',
                'units',
                'condition',
                'temperature',
            ],
        });

        const getWeatherForecastSchema = Object.freeze({
            $schema: 'http://json-schema.org/draft-04/schema#',
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The location to get the weather for, e.g. "Bucharest, Romania" or "Los Angeles, CA".',
                },
                units: {
                    type: 'string',
                    description: 'The units to use for the weather data. Use "metric" or "imperial" depending on the location.',
                },
            },
            required: [
                'location',
                'units',
            ],
        });

        registerFunctionTool({
            name: 'GetCurrentWeather',
            displayName: 'Get Weather',
            description: 'Get the weather for a specific location. Call when the user is asking for current weather conditions.',
            parameters: getWeatherSchema,
            action: async (args) => {
                if (!args) throw new Error('No arguments provided');
                Object.keys(args).forEach((key) => args[key] = String(args[key]));
                const location = args.location || extension_settings.accuweather.preferredLocation;
                if (!location && !extension_settings.accuweather.preferredLocation) {
                    throw new Error('No location provided, and no preferred location set.');
                }
                return await getWeatherByProvider(location, args);
            },
            formatMessage: (args) => args?.location ? `Getting the weather for ${args.location}...` : '',
        });

        registerFunctionTool({
            name: 'GetWeatherForecast',
            displayName: 'Get Weather Forecast',
            description: 'Get the daily weather forecasts for the next 5 days for a specific location. Call when the user is asking for the weather forecast.',
            parameters: getWeatherForecastSchema,
            action: async (args) => {
                if (!args) throw new Error('No arguments provided');
                Object.keys(args).forEach((key) => args[key] = String(args[key]));
                const location = args.location || extension_settings.accuweather.preferredLocation;
                if (!location && !extension_settings.accuweather.preferredLocation) {
                    throw new Error('No location provided, and no preferred location set.');
                }
                const units = args.units || extension_settings.accuweather.units;
                return await getForecastByProvider(location, units);
            },
            formatMessage: (args) => args?.location ? `Getting the weather forecast for ${args.location}...` : '',
        });
    } catch (err) {
        console.error('AccuWeather function tools failed to register:', err);
    }
}

jQuery(async () => {
    if (extension_settings.accuweather === undefined) {
        extension_settings.accuweather = defaultSettings;
    }

    for (const key in defaultSettings) {
        if (extension_settings.accuweather[key] === undefined) {
            extension_settings.accuweather[key] = defaultSettings[key];
        }
    }

    const html = `
    <div class="accuweather_settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Weather</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div>
                    <label for="accuweather_provider">Weather Provider</label>
                    <select id="accuweather_provider" class="text_pole">
                        <option value="accuweather">🔐 AccuWeather</option>
                        <option value="openweathermap">🔐 OpenWeatherMap</option>
                        <option value="wttr.in">🆓 wttr.in</option>
                    </select>
                </div>
                <div id="accuweather_api_key_block">
                    <label for="accuweather_api_key">AccuWeather API Key</label>
                    <input id="accuweather_api_key" class="text_pole" type="text" />
                </div>
                <div id="openweathermap_api_key_block">
                    <label for="openweathermap_api_key">OpenWeatherMap API Key</label>
                    <input id="openweathermap_api_key" class="text_pole" type="text" />
                </div>
                <div>
                    <label for="accuweather_preferred_location">Preferred Location</label>
                    <input id="accuweather_preferred_location" class="text_pole" type="text" placeholder="i.e. Bucharest, Romania" />
                </div>
                <div>
                    <label for="accuweather_units">Units</label>
                    <select id="accuweather_units" class="text_pole">
                        <option value="metric">Metric</option>
                        <option value="imperial">Imperial</option>
                    </select>
                </div>
                <div>
                    <label class="checkbox_label" for="accuweather_function_tool">
                        <input id="accuweather_function_tool" type="checkbox" />
                        <span>Use function tool</span>
                        <a rel="noopener" href="https://docs.sillytavern.app/for-contributors/function-calling/" class="notes-link" target="_blank">
                            <span class="note-link-span">?</span>
                        </a>
                    </label>
                </div>
            </div>
        </div>
    </div>`;
    const extensionContainer = document.getElementById('accuweather_container') ?? document.getElementById('extensions_settings2');
    $(extensionContainer).append(html);

    function updateApiKeyVisibility() {
        const provider = extension_settings.accuweather.provider || 'accuweather';
        $('#accuweather_api_key_block').toggle(provider === 'accuweather');
        $('#openweathermap_api_key_block').toggle(provider === 'openweathermap');
    }

    $('#accuweather_provider').val(extension_settings.accuweather.provider || 'accuweather').on('change', function () {
        extension_settings.accuweather.provider = String($(this).val());
        saveSettingsDebounced();
        updateApiKeyVisibility();
    });

    $('#accuweather_api_key').val(extension_settings.accuweather.apiKey).on('input', function () {
        extension_settings.accuweather.apiKey = String($(this).val());
        saveSettingsDebounced();
    });

    $('#accuweather_preferred_location').val(extension_settings.accuweather.preferredLocation).on('input', function () {
        extension_settings.accuweather.preferredLocation = String($(this).val());
        saveSettingsDebounced();
    });

    $('#accuweather_units').val(extension_settings.accuweather.units).on('change', function () {
        extension_settings.accuweather.units = String($(this).val());
        saveSettingsDebounced();
    });

    $('#accuweather_function_tool').prop('checked', extension_settings.accuweather.functionTool).on('change', function () {
        extension_settings.accuweather.functionTool = !!$(this).prop('checked');
        saveSettingsDebounced();
        registerFunctionTools();
    });

    $('#openweathermap_api_key').val(extension_settings.accuweather.openWeatherMapApiKey).on('input', function () {
        extension_settings.accuweather.openWeatherMapApiKey = String($(this).val());
        saveSettingsDebounced();
    });

    updateApiKeyVisibility();

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'forecast',
        helpString: 'Get the weather forecast for the next 5 days for a location. Uses a preferred location if none is provided.',
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'location to get the weather forecast for',
                isRequired: false,
                acceptsMultiple: false,
                typeList: ARGUMENT_TYPE.STRING,
            }),
        ],
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'units',
                description: 'The units to use for the weather data. Uses a preferred unit if none is provided.',
                typeList: ARGUMENT_TYPE.STRING,
                isRequired: false,
                acceptsMultiple: false,
                enumList: ['metric', 'imperial'],
            }),
        ],
        callback: async (args, location) => {
            if (!location && !extension_settings.accuweather.preferredLocation) {
                throw new Error('No location provided, and no preferred location set.');
            }
            const currentLocation = location || extension_settings.accuweather.preferredLocation;
            const units = args.units || extension_settings.accuweather.units;
            return await getForecastByProvider(currentLocation, units);
        },
        returns: 'a string containing the weather forecast information',
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'weather',
        helpString: 'Get the current weather for a location. Uses a preferred location if none is provided.',
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'location to get the weather for',
                isRequired: false,
                acceptsMultiple: false,
                typeList: ARGUMENT_TYPE.STRING,
            }),
        ],
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'units',
                description: 'The units to use for the weather data. Uses a preferred unit if none is provided.',
                typeList: ARGUMENT_TYPE.STRING,
                isRequired: false,
                acceptsMultiple: false,
                enumList: ['metric', 'imperial'],
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'condition',
                description: 'The result should include the weather condition, e.g. "Clear".',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: true,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'temperature',
                description: 'The result should include the actual temperature.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: true,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'feelslike',
                description: 'The result should include the "feels like" temperature.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'wind',
                description: 'The result should include the wind speed and direction.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'humidity',
                description: 'The result should include the relative humidity.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'pressure',
                description: 'The result should include the pressure.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'visibility',
                description: 'The result should include the visibility.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'uvindex',
                description: 'The result should include the UV index.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'precipitation',
                description: 'The result should include the precipitation.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: false,
            }),
        ],
        callback: getWeatherCallback,
        returns: 'a string containing the weather information',
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'weather-provider',
        helpString: 'Get or set the current weather API provider. If no argument is provided, returns the current provider name.',
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'provider name to set',
                isRequired: false,
                acceptsMultiple: false,
                typeList: ARGUMENT_TYPE.STRING,
                enumProvider: () => Object.entries(WEATHER_PROVIDERS).map(([key, name]) => new SlashCommandEnumValue(key, name, enumTypes.enum)),
            }),
        ],
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'quiet',
                description: 'Suppress the success toast notification on provider update.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: 'false',
                enumList: commonEnumProviders.boolean('trueFalse')(),
            }),
        ],
        callback: (args, value) => {
            const input = value?.toString()?.trim();

            if (!input) {
                return extension_settings.accuweather.provider || 'accuweather';
            }

            const [providerKey, providerName] = Object.entries(WEATHER_PROVIDERS).find(([key, name]) =>
                key === input || name.toLowerCase() === input.toLowerCase(),
            ) || [null, null];

            if (!providerKey) {
                throw new Error(`Invalid weather provider: ${input}. Valid options are: ${Object.keys(WEATHER_PROVIDERS).join(', ')}`);
            }

            extension_settings.accuweather.provider = providerKey;
            saveSettingsDebounced();
            $('#accuweather_provider').val(providerKey);
            updateApiKeyVisibility();

            if (!isTrueBoolean(args.quiet)) {
                toastr.success(`Weather provider set to ${providerName}`);
            }

            return providerKey;
        },
        returns: 'the current weather provider name',
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'weather-location',
        helpString: 'Get or set the preferred weather location. If no argument is provided, returns the current preferred location.',
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'preferred location to set',
                isRequired: false,
                acceptsMultiple: false,
                typeList: ARGUMENT_TYPE.STRING,
            }),
        ],
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'quiet',
                description: 'Suppress the success toast notification on location update.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: 'false',
                enumList: commonEnumProviders.boolean('trueFalse')(),
            }),
        ],
        callback: (args, value) => {
            const input = value?.toString()?.trim();

            if (!input) {
                return extension_settings.accuweather.preferredLocation || '';
            }

            extension_settings.accuweather.preferredLocation = input;
            saveSettingsDebounced();
            $('#accuweather_preferred_location').val(input);

            if (!isTrueBoolean(args.quiet)) {
                toastr.success(`Preferred location set to ${input}`);
            }

            return input;
        },
        returns: 'the current preferred location',
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'weather-units',
        helpString: 'Get or set the preferred weather units. If no argument is provided, returns the current preferred units.',
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'preferred units to set',
                isRequired: false,
                acceptsMultiple: false,
                typeList: ARGUMENT_TYPE.STRING,
                enumList: [
                    new SlashCommandEnumValue('metric', 'Metric', enumTypes.enum),
                    new SlashCommandEnumValue('imperial', 'Imperial', enumTypes.enum),
                ],
            }),
        ],
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'quiet',
                description: 'Suppress the success toast notification on units update.',
                typeList: ARGUMENT_TYPE.BOOLEAN,
                isRequired: false,
                acceptsMultiple: false,
                defaultValue: 'false',
                enumList: commonEnumProviders.boolean('trueFalse')(),
            }),
        ],
        callback: (args, value) => {
            const input = value?.toString()?.trim()?.toLowerCase();

            if (!input) {
                return extension_settings.accuweather.units || 'metric';
            }

            const validUnits = ['metric', 'imperial'];
            if (!validUnits.includes(input)) {
                throw new Error(`Invalid units: ${input}. Valid options are: ${validUnits.join(', ')}`);
            }

            extension_settings.accuweather.units = input;
            saveSettingsDebounced();
            $('#accuweather_units').val(input);

            if (!isTrueBoolean(args.quiet)) {
                toastr.success(`Weather units set to ${input}`);
            }

            return input;
        },
        returns: 'the current preferred units',
    }));

    registerFunctionTools();
});
