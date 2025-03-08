import { db } from '../config/database.js';

export const createCreditRequestTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS credit_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      credits_requested INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating credit_requests table:', err.message);
    } else {
      console.log('Credit requests table created or already exists');
    }
  });
};
