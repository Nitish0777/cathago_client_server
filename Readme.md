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
   npm install
   npm start
   ```
2. Start the client:
   Run Go Live on index.html

   ```

   ```

## Routing

The application uses the following routes:

### Client

- `/` - Home page
- `/about` - About page
- `/contact` - Contact page

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
