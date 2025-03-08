import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  // Check if authorization header is present
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Verify the token
  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Attach the user data to the request object
    req.user = decoded;  // Decoded contains user information from the token
    next();  // Move to the next middleware or route handler
  });
};



export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Permission denied. Admins only' });
  }
  next(); // Proceed to the next middleware or route handler
};
