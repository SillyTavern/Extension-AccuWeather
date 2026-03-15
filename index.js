import { loadSettings, initSettingsUI, checkForExtensionConflicts } from './src/settings.js';
import { registerSlashCommands } from './src/commands.js';
import { registerFunctionTools } from './src/functions.js';

jQuery(async () => {
    checkForExtensionConflicts();
    loadSettings();
    initSettingsUI();
    registerSlashCommands();
    registerFunctionTools();
});
