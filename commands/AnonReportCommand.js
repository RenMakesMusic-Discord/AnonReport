const { ChannelType } = require('discord.js');
class AnonReportCommand {
    constructor(client, caseManager, guildManager) {
        this.client = client;
        this.caseManager = caseManager;
        this.guildManager = guildManager;
    }

    async execute(interaction) {
        // Acknowledge the interaction immediately
        await interaction.deferReply({ ephemeral: true });

        try {
            const user = interaction.user;
            const guild = interaction.guild;
            if(interaction.channel.type === ChannelType.DM ) {
                await interaction.editReply(`# Anonymous reports are for guild usage only. \n Please use /anonreport in a guild channel, only you can see when you create an anonymous report.`);
                return;
            }
            const existingCase = await this.caseManager.getCaseByUserId(user.id);
            if (existingCase) {
                await interaction.editReply('You already have an open case!');
                return;
            }

            const caseNumber = await this.guildManager.incrementCaseCounter(guild.id, guild.name);
            
            try {
                await user.send(`Your anonymous report has been created. Moderators will respond in the private channel.`);            
                const channel = await this.guildManager.createAnonymousChannel(guild, user.id, caseNumber);
                await this.caseManager.createCase(user.id, guild.id, channel.id, caseNumber);
                
            } catch (error) {
                if (error.code === 50007) { // Cannot send messages to this user
                  console.warn(`Could not DM user ${user.tag}: ${error.message}`);
                  await interaction.editReply(
                    `Oops, I can't DM you right now. Your permissions disallow others from sending you a message.`
                  );
                } else {
                  throw error; // Re-throw unexpected errors
                }
              }
              
           
        } catch (error) {
            console.error('Error executing anonreport command:', error);
            await interaction.editReply('An error occurred while creating your report. Please try again later.');
        }
    }
}

module.exports = AnonReportCommand;
