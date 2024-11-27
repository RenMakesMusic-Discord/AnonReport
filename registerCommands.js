const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('./config.json'); // Token and client ID

const commands = [
  {
    name: 'anonreport',
    description: 'Create an anonymous report',
  },
  {
    name: 'closereport',
    description: 'Close an active anonymous report',
  },
];


(async () => {
  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log('Registering application (/) commands globally...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log('Commands registered successfully.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();
