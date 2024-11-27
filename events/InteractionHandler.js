const AnonReportCommand = require('../commands/AnonReportCommand');
const CaseManager = require('../util/CaseManager');

class InteractionHandler {
  constructor(client, db) {
    this.client = client;
    this.caseManager = new CaseManager(db);
    this.anonReportCommand = new AnonReportCommand(client, this.caseManager);
  }

  async handle(interaction) {
    if (interaction.isCommand() && interaction.commandName === 'anonreport') {
      await this.anonReportCommand.execute(interaction);
    } else if (interaction.isButton() && interaction.customId === 'close-case') {
      const userId = interaction.user.id;
      const userCase = await this.caseManager.getCaseByUserId(userId);

      if (userCase) {
        const guild = this.client.guilds.cache.get(userCase.guild_id);
        const channel = guild.channels.cache.get(userCase.channel_id);

        if (channel) {
          await channel.permissionOverwrites.edit(guild.id, { VIEW_CHANNEL: false });
          await channel.send('This case has been closed.');
          await this.caseManager.closeCase(userId);
          interaction.reply({ content: 'Your case has been closed.', ephemeral: true });
        }
      }
    }
  }
}

module.exports = InteractionHandler;
