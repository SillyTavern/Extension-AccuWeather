import { extension_settings } from '../../../extensions.js';
import { isTrueBoolean, isFalseBoolean } from '../../../utils.js';
import { saveSettingsDebounced } from '../../../../script.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
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

const defaultSettings = {
    apiKey: '',
    preferredLocation: '',
    units: 'metric',
};

async function getWeatherCallback(args, location) {
    if (!extension_settings.accuweather.apiKey) {
        throw new Error('No AccuWeather API key set.');
    }

    if (!location && !extension_settings.accuweather.preferredLocation) {
        throw new Error('No location provided, and no preferred location set.');
    }

    const currentLocation = location || extension_settings.accuweather.preferredLocation;
    const locationKey = await getLocationKey(currentLocation);
    const weatherData = await getWeatherForLocation(locationKey);
    const parsedWeather = parseWeatherData(weatherData, args);
    return parsedWeather;
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

async function registerFunctionTools() {
    try {
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
        const module = await import('../../../tool-calling.js');
        module.ToolManager.registerFunctionTool(
            'GetWeather',
            'Get the weather for a specific location. Call when the user is asking for weather conditions.',
            getWeatherSchema,
            async (args) => {
                if (!extension_settings.accuweather.apiKey) throw new Error('No AccuWeather API key set.');
                if (!args) throw new Error('No arguments provided');
                Object.keys(args).forEach((key) => args[key] = String(args[key]));
                const location = args.location || extension_settings.accuweather.preferredLocation;
                if (!location && !extension_settings.accuweather.preferredLocation) {
                    throw new Error('No location provided, and no preferred location set.');
                }
                const locationKey = await getLocationKey(location);
                const weatherData = await getWeatherForLocation(locationKey);
                const parsedWeather = parseWeatherData(weatherData, args);
                return parsedWeather;
            },
        );

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
                <b>AccuWeather</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div>
                    <label for="accuweather_api_key">API Key</label>
                    <input id="accuweather_api_key" class="text_pole" type="text" />
                </div>
                <div>
                    <label for="accuweather_preferred_location">Preferred Location</label>
                    <input id="accuweather_preferred_location" class="text_pole" type="text" placeholder="i.e. Bucharest, Romania" />
                </div>
                <div>
                    <label for="accuweather_units">Units</label>
                    <select id="accuweather_units">
                        <option value="metric">Metric</option>
                        <option value="imperial">Imperial</option>
                    </select>
                </div>
            </div>
        </div>
    </div>`;
    $('#extensions_settings2').append(html);

    $('#accuweather_api_key').val(extension_settings.accuweather.apiKey).on('input', function () {
        extension_settings.accuweather.apiKey = String($(this).val());
        saveSettingsDebounced();
    });

    $('#accuweather_preferred_location').val(extension_settings.accuweather.preferredLocation).on('input', function () {
        extension_settings.accuweather.preferredLocation = String($(this).val());
        saveSettingsDebounced();
    });

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

    await registerFunctionTools();
});
