const { Client, GatewayIntentBits,  Partials, Events, ChannelType  } = require('discord.js');
const config = require('./config.json'); // Load configuration
const DatabaseManager = require('./db/Database');
const GuildManager = require('./util/GuildManager');
const CaseManager = require('./util/CaseManager');
const AnonReportCommand = require('./commands/AnonReportCommand');
const CloseReportCommand = require('./commands/CloseReportCommand');
const MessageHandler = require('./events/MessageHandler'); // Import MessageHandler

// Create bot client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // For handling slash commands
    GatewayIntentBits.GuildMessages, // For responding to guild messages
    GatewayIntentBits.DirectMessages, // For handling DMs
    GatewayIntentBits.MessageContent, // For accessing message content
  ],
  partials: [Partials.Channel, Partials.Message]
});

(async () => {
  // Initialize the database
  const db = new DatabaseManager('./db.sqlite');
  await db.initialize();

  // Create necessary managers
  const guildManager = new GuildManager(db);
  const caseManager = new CaseManager(db);
  const messageHandler = new MessageHandler(client, caseManager); // Initialize MessageHandler

  // Initialize the AnonReportCommand
  const anonReportCommand = new AnonReportCommand(client, caseManager, guildManager);
  const closeReportCommand = new CloseReportCommand(client, caseManager, guildManager); 
  // Register commands
  const registerCommands = async () => {
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v10');

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

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
      console.log('Registering application commands...');
      await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
      console.log('Commands registered successfully!');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  };

  await registerCommands();

  // Handle bot events
  client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
  });

  // Handle guild-specific setup when bot joins a server
  client.on('guildCreate', async (guild) => {
    console.log(`Joined guild: ${guild.name}`);
    await guildManager.initializeGuild(guild);
  });

  // Handle slash command interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'anonreport') {
        try {
          await anonReportCommand.execute(interaction);
        } catch (error) {
          console.error('Error executing anonreport command:', error);
          await interaction.reply({
            content: 'An error occurred while processing your request. Please try again later.',
            ephemeral: true,
          });
        }
      }
    
      if (interaction.commandName === 'closereport') {
        try {
          await closeReportCommand.execute(interaction);
        } catch (error) {
          console.error('Error executing closereport command:', error);
          await interaction.reply({
            content: 'An error occurred while processing your request. Please try again later.',
            ephemeral: true,
          });
        }
      }
  });

  // Handle messages
  client.on(Events.MessageCreate, async (message) => {
    try {  
      await messageHandler.handleMessage(message); // Delegate message handling to MessageHandler
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Login the bot
  client.login(config.token);
})();
