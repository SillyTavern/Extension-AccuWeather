import { extension_settings } from '../../../../extensions.js';
import { isTrueBoolean } from '../../../../utils.js';
import { SlashCommand } from '../../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandEnumValue, enumTypes } from '../../../../slash-commands/SlashCommandEnumValue.js';
import { commonEnumProviders } from '../../../../slash-commands/SlashCommandCommonEnumsProvider.js';
import { SlashCommandParser } from '../../../../slash-commands/SlashCommandParser.js';
import { saveSettingsDebounced } from '../../../../../script.js';
import { WEATHER_PROVIDERS, updateApiKeyVisibility } from './settings.js';
import { getWeatherByProvider, getForecastByProvider } from './providers/index.js';

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

async function getWeatherCallback(args, location) {
    if (!location && !extension_settings.accuweather.preferredLocation) {
        throw new Error('No location provided, and no preferred location set.');
    }
    return await getWeatherByProvider(location, args);
}

export function registerSlashCommands() {
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
}
