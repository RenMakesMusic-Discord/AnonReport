const { Database } = require('sqlite3');

class DatabaseManager {
  constructor(path) {
    this.db = new Database(path);
  }

  async initialize() {
    // Create `guilds` table
    await this.run(`
      CREATE TABLE IF NOT EXISTS guilds (
        guild_id TEXT PRIMARY KEY,
        guild_name TEXT,
        category_channel_id TEXT,
        case_counter INTEGER DEFAULT 1
      )
    `);

    // Create `cases` table
    await this.run(`
      CREATE TABLE IF NOT EXISTS cases (
        user_id TEXT PRIMARY KEY,
        guild_id TEXT,
        channel_id TEXT, -- Updated for text channel ID
        case_number INTEGER
      )
    `);

    // Create `meta` table
    await this.run(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value INTEGER
      )
    `);

    await this.initGlobalCaseCounter();
  }

  async initGlobalCaseCounter() {
    const existing = await this.get('SELECT value FROM meta WHERE key = "case_counter"');
    if (!existing) {
      await this.run('INSERT INTO meta (key, value) VALUES ("case_counter", 1)');
    }
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, (err) => (err ? reject(err) : resolve()));
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }
}

module.exports = DatabaseManager;
