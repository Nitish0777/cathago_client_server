// controllers/adminController.js

import { db } from '../config/database.js';

// Function to delete a user by their ID
export const deleteUser = (req, res) => {
  const { userId } = req.params;

  // Query to delete the user from the database
  const query = `DELETE FROM users WHERE id = ?`;
  db.run(query, [userId], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting user', error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  });
};



export const getAdminAnalytics = (req, res) => {
  // Query to fetch the total number of scans
  const totalScansQuery = `
    SELECT COUNT(*) AS total_scans 
    FROM scan_history
  `;
  
  // Query to fetch the most common topics (this assumes you've stored topics in the scan_history table or have a method to identify them)
  const mostCommonTopicsQuery = `
    SELECT most_common_topics 
    FROM admin_analytics 
    ORDER BY timestamp DESC LIMIT 1
  `;
  
  // Query to fetch the top users by scans (users who have scanned the most)
  const topUsersQuery = `
    SELECT user_id, COUNT(*) AS total_scans 
    FROM scan_history 
    GROUP BY user_id 
    ORDER BY total_scans DESC 
    LIMIT 10
  `;

  // Query to fetch credit usage stats for users
  const creditUsageQuery = `
    SELECT username, credits 
    FROM users 
    ORDER BY credits DESC
  `;

  // Execute the queries and return the results
  db.all(totalScansQuery, [], (err, totalScansData) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching total scans', error: err.message });
    }
    
    db.get(mostCommonTopicsQuery, [], (err, commonTopicsData) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching most common topics', error: err.message });
      }

      db.all(topUsersQuery, [], (err, topUsersData) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching top users by scans', error: err.message });
        }

        db.all(creditUsageQuery, [], (err, creditUsageData) => {
          if (err) {
            return res.status(500).json({ message: 'Error fetching credit usage data', error: err.message });
          }

          // Combine all results into a single response object
          const analytics = {
            total_scans: totalScansData[0]?.total_scans || 0,
            most_common_topics: commonTopicsData ? commonTopicsData.most_common_topics : 'N/A',
            top_users: topUsersData,
            credit_usage: creditUsageData,
          };

          return res.status(200).json({ analytics });
        });
      });
    });
  });
};

export const handleCreditRequest = (req, res) => {
  const { userId, action } = req.body; // Action can be 'approve' or 'deny'

  if (action !== 'approve' && action !== 'deny') {
    return res.status(400).json({ message: 'Invalid action. Action must be "approve" or "deny".' });
  }

  // Fetch the latest credit request for the user (status should be 'pending')
  const query = 'SELECT * FROM credit_requests WHERE user_id = ? AND status = "pending" ORDER BY timestamp DESC LIMIT 1';
  db.get(query, [userId], (err, request) => {
    if (err) {
      console.error('Error fetching credit request:', err);
      return res.status(500).json({ message: 'Error fetching credit request' });
    }

    if (!request) {
      return res.status(404).json({ message: 'No pending credit request found for this user' });
    }

    // Proceed with approval or denial based on the action
    if (action === 'approve') {
      // If approved, update the user's credits and set request status to 'approved'
      const updateCreditsQuery = 'UPDATE users SET credits = credits + ? WHERE id = ?';
      db.run(updateCreditsQuery, [request.credits_requested, request.user_id], (err) => {
        if (err) {
          console.error('Error updating user credits:', err);
          return res.status(500).json({ message: 'Error updating user credits' });
        }

        // Update the credit request status to 'approved'
        const updateRequestQuery = 'UPDATE credit_requests SET status = "approved" WHERE id = ?';
        db.run(updateRequestQuery, [request.id], (err) => {
          if (err) {
            console.error('Error updating credit request status:', err);
            return res.status(500).json({ message: 'Error updating credit request status' });
          }

          return res.status(200).json({ message: `Credit request approved and ${request.credits_requested} credits added to the user` });
        });
      });
    } else {
      // If denied, just set the status of the request to 'denied'
      const updateRequestQuery = 'UPDATE credit_requests SET status = "denied" WHERE id = ?';
      db.run(updateRequestQuery, [request.id], (err) => {
        if (err) {
          console.error('Error denying credit request:', err);
          return res.status(500).json({ message: 'Error denying credit request' });
        }

        return res.status(200).json({ message: 'Credit request denied' });
      });
    }
  });
};



export const getAllUsers = (req, res) => {
  // Query to fetch username, credits, and id from the users table
  const query = `SELECT id, username, credits FROM users`;

  // Run the query
  db.all(query, [], (err, rows) => {
    if (err) {
      // Handle error and send response
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    // Send the retrieved users as a response
    return res.status(200).json({ users: rows });
  });
};

export const getAllCreditRequests = (req, res) => {
  const query = `SELECT cr.id, cr.user_id, cr.credits_requested, cr.status, cr.timestamp, u.username
                 FROM credit_requests cr
                 JOIN users u ON cr.user_id = u.id
                 WHERE cr.status = 'pending'`; // Show only pending requests

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching credit requests:', err.message);
      return res.status(500).json({ message: 'Error fetching credit requests' });
    }

    return res.status(200).json({ creditRequests: rows });
  });
};
