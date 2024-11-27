const { ChannelType, PermissionFlagsBits } = require('discord.js');

class GuildManager {
  constructor(db) {
    this.db = db;
  }

  async getOrCreateCategory(guild) {
    const existingCategory = guild.channels.cache.find(
      (channel) => channel.type === ChannelType.GuildCategory && channel.name === 'Anonymous Reports'
    );

    if (existingCategory) {
      return existingCategory;
    }

    const category = await guild.channels.create({
      name: 'Anonymous Reports',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: guild.roles.cache.find((role) => role.permissions.has(PermissionFlagsBits.BanMembers))?.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });

    console.log(`Created "Anonymous Reports" category in guild: ${guild.name}`);
    return category;
  }

  async createAnonymousChannel(guild, userId, caseNumber) {
    const category = await this.getOrCreateCategory(guild);

    const channel = await guild.channels.create({
      name: `case-${caseNumber}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: guild.roles.cache.find((role) => role.permissions.has(PermissionFlagsBits.BanMembers))?.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });

    console.log(`Created anonymous report channel: ${channel.name} in guild: ${guild.name}`);
    return channel;
  }

  async incrementCaseCounter(guildId, guildName) {
    let guild = await this.db.get('SELECT * FROM guilds WHERE guild_id = ?', [guildId]);

    if (!guild) {
      console.log(`Guild with ID ${guildId} not found. Initializing...`);
      await this.db.run(
        'INSERT INTO guilds (guild_id, guild_name, category_channel_id, case_counter) VALUES (?, ?, NULL, 1)',
        [guildId, guildName]
      );
      guild = await this.db.get('SELECT * FROM guilds WHERE guild_id = ?', [guildId]);
    }

    const newCount = guild.case_counter + 1;
    await this.db.run('UPDATE guilds SET case_counter = ? WHERE guild_id = ?', [newCount, guildId]);
    return newCount;
  }
}

module.exports = GuildManager;
