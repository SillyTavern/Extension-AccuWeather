import { extension_settings } from '../../../../extensions.js';
import { getWeatherByProvider, getForecastByProvider } from './providers/index.js';

export function registerFunctionTools() {
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
