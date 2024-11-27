const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

class CommandRegistrar {
  constructor(clientId, token) {
    this.clientId = clientId;
    this.rest = new REST({ version: '9' }).setToken(token);
  }

  /**
   * Register commands globally.
   * @param {Array} commands - Array of command objects to register.
   */
  async registerGlobalCommands(commands) {
    try {
      console.log('Checking and refreshing global application (/) commands...');

      const existingCommands = await this.rest.get(Routes.applicationCommands(this.clientId));
      const commandsToRegister = commands.filter(
        (cmd) =>
          !existingCommands.some(
            (existingCmd) =>
              existingCmd.name === cmd.name && existingCmd.description === cmd.description
          )
      );

      if (commandsToRegister.length > 0) {
        console.log('Registering new or updated global commands...');
        await this.rest.put(Routes.applicationCommands(this.clientId), { body: commands });
        console.log('Global commands successfully registered.');
      } else {
        console.log('No changes to global commands. Commands are up-to-date.');
      }
    } catch (error) {
      console.error('Error registering global commands:', error);
    }
  }

  /**
   * Register commands for a specific guild.
   * @param {string} guildId - ID of the guild to register commands in.
   * @param {Array} commands - Array of command objects to register.
   */
  async registerGuildCommands(guildId, commands) {
    try {
      console.log(`Checking and refreshing application (/) commands for guild ${guildId}...`);

      const existingCommands = await this.rest.get(
        Routes.applicationGuildCommands(this.clientId, guildId)
      );
      const commandsToRegister = commands.filter(
        (cmd) =>
          !existingCommands.some(
            (existingCmd) =>
              existingCmd.name === cmd.name && existingCmd.description === cmd.description
          )
      );

      if (commandsToRegister.length > 0) {
        console.log('Registering new or updated guild commands...');
        await this.rest.put(Routes.applicationGuildCommands(this.clientId, guildId), {
          body: commands,
        });
        console.log(`Guild commands successfully registered for guild ${guildId}.`);
      } else {
        console.log('No changes to guild commands. Commands are up-to-date.');
      }
    } catch (error) {
      console.error(`Error registering commands for guild ${guildId}:`, error);
    }
  }
}

module.exports = CommandRegistrar;
