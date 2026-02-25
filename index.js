import { loadSettings, initSettingsUI } from './src/settings.js';
import { registerSlashCommands } from './src/commands.js';
import { registerFunctionTools } from './src/functions.js';

jQuery(async () => {
    loadSettings();
    initSettingsUI();
    registerSlashCommands();
    registerFunctionTools();
});
