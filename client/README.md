# Document Matching System

## Overview
This project is a document matching system with user authentication, credit-based scanning, and an admin dashboard. It allows users to upload plain text documents, compare them against stored documents, and retrieve matching results. Admins can manage user credits and view analytics.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript (No frameworks)
- **Backend**: Node.js (Express)
- **Database**: SQLite (or JSON files for small-scale storage)
- **Authentication**: Basic username-password authentication (hashed passwords)
- **File Storage**: Local storage for documents
- **Text Matching**: Levenshtein distance, word frequency analysis

## Features
### 1. User Management & Authentication
- User Registration & Login
- User Roles: Regular Users & Admins
- Profile Section with credit balance, past scans, and requests

### 2. Credit System
- 20 free scans per user per day (resets at midnight)
- Users can request additional credits
- Admins approve/deny credit requests
- Each scan deducts 1 credit

### 3. Document Scanning & Matching
- Users upload plain text files
- System compares them with stored documents
- Returns similar documents based on text similarity algorithms
- **Bonus**: AI-based document matching (GPT, Gemini, DeepSeek)

### 4. Smart Analytics Dashboard
- Track scans per user per day
- Identify common scanned document topics
- View top users by scan and credit usage
- Admin credit usage statistics

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | /auth/register | User registration |
| POST | /auth/login | User login (Session-based) |
| GET | /user/profile | Get user profile & credits |
| POST | /scan | Upload document for scanning (uses 1 credit) |
| GET | /matches/:docId | Get matching documents |
| POST | /credits/request | Request admin to add credits |
| GET | /admin/analytics | Get analytics for admins |

## Installation & Setup
### Prerequisites
- Node.js installed
- SQLite installed (or use JSON files for storage)

### Steps
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd document-matching-system
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the server:
   ```sh
   node server.js
   ```

## Security Considerations
- Passwords are hashed before storing.
- Session-based authentication is used.
- Prevents unauthorized access to admin endpoints.
- Implements input validation to prevent injections.

## Bonus Features (Optional)
- AI-powered document matching (GPT, Gemini, DeepSeek)
- Automated credit reset at midnight
- User activity logs
- Export scan history as a text file

## Submission Guidelines
- Ensure functionality meets requirements.
- Maintain clean, modular, and well-documented code.
- Do not copy from online sources; plagiarism checks will be performed.

---
Made with ❤️ using Node.js & Express 🚀
