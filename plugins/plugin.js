import fs from 'fs';
import axios from 'axios';
import { bot } from '../lib/client/plugins.js';
import { addPlugin, getPlugins, removePlugin } from '../lib/db/plugins.js';
import { dirname, basename, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

bot(
	{
		pattern: 'install ?(.*)',
		desc: 'Installs a Plugin',
		type: 'system',
	},
	async (message, match) => {
		const pluginUrl = match.trim();
		if (!pluginUrl.startsWith('https://gist.githubusercontent.com')) return message.sendReply('_Provide a valid Plugin URL_');

		const pluginName = basename(pluginUrl);
		const existingPlugins = await getPlugins();
		if (existingPlugins.some(plugin => plugin.name === pluginName)) return message.sendReply('_Plugin already installed_');

		const pluginPath = resolve(__dirname, '../plugins', pluginName);
		const response = await axios.get(pluginUrl, { responseType: 'arraybuffer' });
		fs.writeFileSync(pluginPath, response.data);
		await addPlugin(pluginName);
		message.sendReply(`_${pluginName} plugin installed_`);
	},
);

bot(
	{
		pattern: 'delplugin ?(.*)',
		desc: 'Deletes a Plugin',
		type: 'system',
	},
	async (message, match) => {
		const pluginName = match.trim();
		const deleted = await removePlugin(pluginName);
		if (!deleted) return message.sendReply('_Plugin not found_');

		const pluginPath = resolve(__dirname, '../plugins', pluginName);
		if (fs.existsSync(pluginPath)) fs.unlinkSync(pluginPath);
		message.sendReply(`_${pluginName} plugin uninstalled_`);
	},
);
