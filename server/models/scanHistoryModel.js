import { db } from '../config/database.js';

export const createScanHistoryTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS scan_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      document_id INTEGER NOT NULL,
      matched_docs TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating scan_history table:', err.message);
    } else {
      console.log('Scan history table created or already exists');
    }
  });
};
