import { db } from '../config/database.js';

export const createDocumentTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating documents table:', err.message);
    } else {
      console.log('Documents table created or already exists');
    }
  });
};
