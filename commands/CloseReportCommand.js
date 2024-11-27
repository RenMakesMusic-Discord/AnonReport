class CloseReportCommand {
    constructor(client, caseManager, guildManager) {
      this.client = client;
      this.caseManager = caseManager;
      this.guildManager = guildManager;
    }
  
    async execute(interaction) {
      const channel = interaction.channel;
      const user = interaction.user;
  
      // Defer reply to ensure interaction is acknowledged
      await interaction.deferReply({ ephemeral: true });
  
      try {
        // Handle if command is run in DMs
        if (channel.type === 'DM') {
          const userCase = await this.caseManager.getCaseByUserId(user.id);
          if (!userCase) {
            return interaction.editReply('You do not have an open case to close.');
          }
  
          const guild = this.client.guilds.cache.get(userCase.guild_id);
          const caseChannel = guild.channels.cache.get(userCase.channel_id);
          if (!caseChannel) {
            return interaction.editReply('The associated case channel could not be found.');
          }
  
          await this.closeCase(userCase, caseChannel);
          return interaction.editReply('Your case has been closed successfully.');
        }
  
        // Handle if command is run in a guild channel
        const userCase = await this.caseManager.getCaseByChannelId(channel.id);
        if (!userCase) {
          return interaction.editReply('This is not an active case channel.');
        }
  
        await this.closeCase(userCase, channel);
        return interaction.editReply('The case has been closed successfully.');
      } catch (error) {
        console.error('Error closing report:', error);
        interaction.editReply('An error occurred while closing the case. Please try again later.');
      }
    }
  
    async closeCase(userCase, caseChannel) {
      // Make the channel read-only for everyone
      await caseChannel.permissionOverwrites.edit(userCase.guild_id, {
        SendMessages: false,
      });
  
      // Remove the case from the database
      await this.caseManager.closeCase(userCase.user_id);
  
      // Notify moderators and user
      await caseChannel.send('This case has been closed and is now read-only.');
      const user = await this.client.users.fetch(userCase.user_id);
      if (user) {
        await user.send('Your case has been closed. Thank you!');
      }
    }
  }
  
  module.exports = CloseReportCommand;
  