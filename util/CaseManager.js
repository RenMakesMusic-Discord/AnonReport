class CaseManager {
    constructor(db) {
      this.db = db;
    }
  
    // Create a new case
    async createCase(userId, guildId, channelId, caseNumber) {
      await this.db.run(
        'INSERT INTO cases (user_id, guild_id, channel_id, case_number) VALUES (?, ?, ?, ?)',
        [userId, guildId, channelId, caseNumber]
      );
    }
  
    // Close a case by deleting it from the database
    async closeCase(userId) {
      await this.db.run('DELETE FROM cases WHERE user_id = ?', [userId]);
    }
  
    // Retrieve a case by the user's ID
    async getCaseByUserId(userId) {
      return await this.db.get('SELECT * FROM cases WHERE user_id = ?', [userId]);
    }
  
    // Retrieve a case by the channel ID
    async getCaseByChannelId(channelId) {
      return await this.db.get('SELECT * FROM cases WHERE channel_id = ?', [channelId]);
    }
  }
  
  module.exports = CaseManager;
  