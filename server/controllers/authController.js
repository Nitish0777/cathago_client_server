// /controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

// Secret key for JWT
const JWT_SECRET = 'your-secret-key'; // You should store this securely in environment variables


export const signup = (req, res) => {
    let { username, password, role } = req.body;
  
    // Check if username, password, and role are provided
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }
  
    // Convert the username to lowercase
    username = username.toLowerCase();
  
    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password' });
      }
  
      // Insert the new user into the database
      const query = `INSERT INTO users (username, password, role, credits) VALUES (?, ?, ?, 20)`; // default credits set to 20
      db.run(query, [username, hashedPassword, role], function (err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating user', error: err.message });
        }
  
        // Respond with a success message and the new user's ID
        return res.status(201).json({ message: 'User created successfully', userId: this.lastID });
      });
    });
  };
  
  const resetDailyCredits = (userId) => {
    return new Promise((resolve, reject) => {
      // Check the current date and the last reset date in the database
      const query = 'SELECT last_reset_date FROM users WHERE id = ?';
      db.get(query, [userId], (err, user) => {
        if (err) {
          console.error('Error fetching user data:', err);
          return reject('Error fetching user data');
        }
    
        // Get the current date in YYYY-MM-DD format
        const currentDate = new Date().toISOString().split('T')[0];
    
        // If the last reset date is not today's date, reset the credits
        if (user && user.last_reset_date !== currentDate) {
          const updateQuery = `
            UPDATE users 
            SET credits = 20, last_reset_date = ? 
            WHERE id = ?
          `;
          
          db.run(updateQuery, [currentDate, userId], (err) => {
            if (err) {
              console.error('Error updating credits:', err);
              return reject('Error updating credits');
            }
            console.log(`Credits for user ${userId} have been reset to 20.`);
            resolve();
          });
        } else {
          resolve(); // No need to reset if the date hasn't changed
        }
      });
    });
  };
  
  

// Login Controller (User Authentication)
export const login = async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Convert username to lowercase before querying the database
  username = username.toLowerCase();

  try {
    // Check if the user exists
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Compare password with hashed password stored in DB
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Reset credits if a new day has started
      await resetDailyCredits(user.id);

      // Generate a JWT token
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
      });

      // Respond with the token and user info
      return res.status(200).json({
        message: 'Login successful',
        token,
        role: user.role,
        username: user.username,
        credits: user.credits,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred during login', error: error.message });
  }
};


/* export const deleteUser = (req, res) => {
  const { userId } = req.params;

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // SQL query to check if the user exists in the database
  const checkQuery = `SELECT * FROM users WHERE id = ?`;

  db.get(checkQuery, [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking user', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user exists, delete the user
    const deleteQuery = `DELETE FROM users WHERE id = ?`;

    db.run(deleteQuery, [userId], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting user', error: err.message });
      }

      return res.status(200).json({ message: 'User deleted successfully' });
    });
  });
}; */
// controllers/userController.js





// Controller function to fetch user details (username and credits)
export const getUserDetails = (req, res) => {
  const userId = req.user.id; // Get the user ID from the decoded token

  // Query to fetch user details from the database
  const userQuery = `SELECT username, credits FROM users WHERE id = ?`;
  db.get(userQuery, [userId], (err, userRow) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user details' });
    }

    if (userRow) {
      // Query to fetch documents uploaded by the user from the documents table
      const documentsQuery = `SELECT id, filename, filepath FROM documents WHERE user_id = ?`;
      db.all(documentsQuery, [userId], (err, documents) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching user documents' });
        }

        const formattedDocuments = documents.map(doc => ({
          ...doc,
          filepath: doc.filepath.replace(/\\+/g, '/')  // Format the file path
        }));

        // Query to fetch all credit requests for the user
        const creditRequestsQuery = `SELECT * FROM credit_requests WHERE user_id = ?`;
        db.all(creditRequestsQuery, [userId], (err, creditRequests) => {
          if (err) {
            console.error('Error fetching credit requests:', err);
            return res.status(500).json({ message: 'Error fetching credit requests' });
          }

          // Query to fetch the latest credit request for the user
          const latestCreditRequestQuery = `
            SELECT * FROM credit_requests WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1
          `;
          db.get(latestCreditRequestQuery, [userId], (err, latestRequest) => {
            if (err) {
              console.error('Error fetching latest credit request:', err);
              return res.status(500).json({ message: 'Error fetching latest credit request' });
            }

            // Send back the user details, documents, and the most recent credit request
            return res.status(200).json({
              username: userRow.username,  // Return the username
              remainingCredits: userRow.credits,  // Return the remaining credits
              totalCredits: 20,  // Return total available credits (can be dynamically updated if needed)
              documents: formattedDocuments,  // Return all documents uploaded by the user
              creditRequests: creditRequests,  // Return all credit requests for the user
              latestCreditRequest: latestRequest ? {
                id: latestRequest.id,
                status: latestRequest.status,
                credits_requested: latestRequest.credits_requested,
                timestamp: latestRequest.timestamp
              } : null  // If no credit requests exist, return null
            });
          });
        });
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  });
};


export const sendCreditRequest = (req, res) => {
  const userId = req.user.id; // Get the user ID from the decoded token
  const { creditsRequested } = req.body; // Get the number of credits requested from the request body

  // Check if the number of credits requested is a valid number
  if (!creditsRequested || creditsRequested <= 0) {
    return res.status(400).json({ message: 'Invalid number of credits requested' });
  }

  // Query to insert the credit request into the database
  const query = `INSERT INTO credit_requests (user_id, credits_requested) VALUES (?, ?)`;
  db.run(query, [userId, creditsRequested], function (err) {
    if (err) {
      console.error('Error submitting credit request:', err.message);
      return res.status(500).json({ message: 'Error submitting credit request' });
    }

    return res.status(200).json({ message: 'Credit request submitted successfully' });
  });
};

/* export const getUserCreditRequests = (req, res) => {
  const userId = req.user.id;  // Assuming userId is extracted from the token

  // Query to fetch all credit requests for the logged-in user
  const query = 'SELECT * FROM credit_requests WHERE user_id = ?';

  db.all(query, [userId], (err, requests) => {
    if (err) {
      console.error('Error fetching credit requests:', err);
      return res.status(500).json({ message: 'Error fetching credit requests' });
    }

    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: 'No credit requests found for this user' });
    }

    // Send back the credit request details
    return res.status(200).json({ creditRequests: requests });
  });
};
 */