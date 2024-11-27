const {  ChannelType  } = require('discord.js');
class MessageHandler {
    constructor(client, caseManager) {
      this.client = client;
      this.caseManager = caseManager;
    }
    
    async handleMessage(message) {
      if (message.author.bot) return; // Ignore bot messages
  
      if (message.channel.type === ChannelType.DM) {
        await this.handleDMMessage(message);
      } else {
        await this.handleGuildMessage(message);
      }
    }
    async handleDMMessage(message) {
        try {
            // Fetch the active case for the user
            const userCase = await this.caseManager.getCaseByUserId(message.author.id);
    
            if (!userCase) {
                // User does not have an active case
                return message.reply('You do not have an open case. Use /anonreport to create one.');
            }
    
            // Fetch the guild and channel from the database
            const guild = this.client.guilds.cache.get(userCase.guild_id);
            if (!guild) {
                console.error(`Guild not found: ${userCase.guild_id}`);
                return message.reply('An error occurred. The guild associated with your case could not be found.');
            }
    
            const caseChannel = guild.channels.cache.get(userCase.channel_id);
            if (!caseChannel) {
                console.error(`Case channel not found: ${userCase.channel_id}`);
                return message.reply('An error occurred. The channel associated with your case could not be found.');
            }
    
            // Send the user's message to the case channel
            await caseChannel.send(`Anonymous User: ${message.content}`);
        } catch (error) {
            console.error('Error handling DM message:', error);
            message.reply('An error occurred while processing your message. Please try again later.');
        }
    }
    async handleGuildMessage(message) {
      try {
        const userCase = await this.caseManager.getCaseByChannelId(message.channel.id);
        if (!userCase) return; // Message is not in a case channel
  
        const user = await this.client.users.fetch(userCase.user_id);
        if (user) {
          await user.send(`Moderator: ${message.content}`);
        } else {
          console.error('User not found:', userCase.user_id);
        }
      } catch (error) {
        console.error('Error handling guild message:', error);
      }
    }
  }
  
  module.exports = MessageHandler;
  