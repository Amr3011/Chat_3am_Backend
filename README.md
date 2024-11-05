# Real-Time Chat Application (Backend)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A **Node.js/Express backend** for a real-time chat application. This backend handles user authentication, chat rooms, message storage, file uploads, and real-time communication using Socket.io.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Frontend Repository](#frontend-repository)
- [Contributing](#contributing)
- [License](#license)

## Features

- JWT-based user authentication
- Real-time messaging with Socket.io
- Group and private chats
- File uploads (avatars, PDFs)
- Password reset and email verification
- User and message management
- MongoDB database integration

## Technologies Used

- **Node.js & Express**: Backend framework
- **Mongoose**: MongoDB ODM
- **Socket.io**: Real-time communication
- **JWT**: Authentication
- **Bcryptjs**: Password hashing
- **Nodemailer**: Email sending
- **Express-validator**: Input validation

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (Node package manager, comes with Node.js)
- **MongoDB** (local or cloud)
- **Git**

## Installation

1. **Clone the backend repository**:
   ```bash
   git clone https://github.com/mostafa2113/nodejs-chat.io.git
   ```
2. **Navigate to the project directory**:

   ```bash
   cd nodejs-chat.io
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**: Create a `.env` file in the root directory and configure the following:

```makefile
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
SALT=your_salt_value
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
COOKIE_EXPIRE=30*24*60*60*1000
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
RESET_TOKEN_EXPIRE=3600
CLIENT_URL=http://127.0.0.1:5173
```

## Usage

1. **Run the backend:**:

   ```bash
   npm run dev
   ```

2. **The server will run on http://localhost:5000**

## Frontend Repository

To fully run the application, you need to set up the frontend. You can find the frontend repository and instructions [here](https://github.com/mostafa2113/reactjs-chat.io.git).

## Contributing

1. **Fork the repo**:

2. **Create a new branch for your feature**:

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Make your changes and commit them**:
   ```bash
   git add .
   git commit -m "Add your message here"
   ```
4. **Push to your forked repository**:
   ```bash
   git push origin feature/YourFeatureName
   ```
5. **Create a pull request**

## License

This project is licensed under the **MIT** License. See the [LICENSE](https://opensource.org/license/mit) file for details.
