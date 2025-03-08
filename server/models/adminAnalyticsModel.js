import { db } from '../config/database.js';

export const createAdminAnalyticsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS admin_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_scans INTEGER DEFAULT 0,
      most_common_topics TEXT,
      top_users TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating admin_analytics table:', err.message);
    } else {
      console.log('Admin analytics table created or already exists');
    }
  });
};
