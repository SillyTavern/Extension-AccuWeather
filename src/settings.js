import { extension_settings } from '../../../../extensions.js';
import { saveSettingsDebounced } from '../../../../../script.js';
import { registerFunctionTools } from './functions.js';

export const WEATHER_PROVIDERS = {
    'accuweather': 'AccuWeather',
    'openweathermap': 'OpenWeatherMap',
    'open-meteo': 'Open-Meteo',
    'wttr.in': 'wttr.in',
    'met-norway': 'MET Norway',
};

export const defaultSettings = {
    provider: 'accuweather',
    apiKey: '',
    openWeatherMapApiKey: '',
    preferredLocation: '',
    units: 'metric',
};

export function loadSettings() {
    if (extension_settings.accuweather === undefined) {
        extension_settings.accuweather = defaultSettings;
    }

    for (const key in defaultSettings) {
        if (extension_settings.accuweather[key] === undefined) {
            extension_settings.accuweather[key] = defaultSettings[key];
        }
    }
}

export function updateApiKeyVisibility() {
    const provider = extension_settings.accuweather.provider || 'accuweather';
    $('#accuweather_api_key_block').toggle(provider === 'accuweather');
    $('#openweathermap_api_key_block').toggle(provider === 'openweathermap');
}

export function initSettingsUI() {
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
                        <option value="open-meteo">🆓 Open-Meteo</option>
                        <option value="wttr.in">🆓 wttr.in</option>
                        <option value="met-norway">🆓 MET Norway</option>
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
                    <input id="accuweather_preferred_location" class="text_pole" type="text" placeholder="e.g. Bucharest, Romania" />
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
}
