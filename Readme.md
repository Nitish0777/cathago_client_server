# Cathago

## Introduction

Cathago is a client-server application designed to provide efficient and scalable solutions for your needs.

## Installation

To install the application, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/Nitish0777/cathago_client_server
   ```
2. Navigate to the project directory:
   ```sh
   cd cathago_client_server
   ```
3. Install the dependencies for both client and server:
   ```sh
   cd client
   npm install
   cd ../server
   npm install
   ```

## Usage

To start the application, use the following commands:

1. Start the server:
   ```sh
   cd server
   npm start
   ```
2. Start the client:
   ```sh
   cd ../client
   npx live-server
   ```

## Routing

The application uses the following routes:

### Client

- `/` - Home page
- `/registration/registration.html` - Registration page
- `/login/login.html` - Login page
- `/dashboard/dashboard.html` - User dashboard
- `/adminDashboard/dashboard.html` - Admin dashboard
- `/document/document.html` - Document upload and list page
- `/document/matching_documents.html` - Matching documents page

### Server

- `/auth/signup` - Endpoint for user signup
- `/auth/login` - Endpoint for user login
- `/auth/user` - Endpoint to get user details
- `/admin/deleteUser/:userId` - Endpoint to delete a user (admin only)
- `/admin/analytics` - Endpoint to get admin analytics
- `/admin/creditRequests` - Endpoint to handle credit requests (admin only)
- `/document/upload` - Endpoint to upload a document
- `/document/matches/:docId` - Endpoint to get matching documents
- `/document/documents` - Endpoint to get user documents

### Images
![image](https://github.com/user-attachments/assets/fe2d4e30-6f2f-4c3a-a940-c949152b288d)


![image](https://github.com/user-attachments/assets/4fa2ab2d-00d6-4d6e-8acd-535d9398967b)


