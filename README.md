# TixMojo API Server

This is the backend API server for the TixMojo events platform. The server architecture has been enhanced using patterns from MatrixCMS.

## Features

- RESTful API for events and location data
- Custom events for different locations
- Spotlight events section
- Flyer carousel data
- Event details and filtering
- User authentication with JWT
- Advanced error handling
- Winston logging system
- File uploads with Multer
- MongoDB database integration
- Email notifications

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
# Server Config
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/tixmojo

# JWT Authentication (MatrixCMS Integration)
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_EMAIL_TOKEN_SECRET=your_email_token_secret
JWT_FORGOT_PASSWORD_TOKEN_SECRET=your_forgot_password_token_secret

# Email Settings (MatrixCMS Integration)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=no-reply@tixmojo.com

# Frontend URL (for email links)
FRONTEND_BASE_URL=http://localhost:3000
```

### Running the Server

#### Development mode (with nodemon)

To run the server with nodemon for automatic restarting during development:

```bash
npm run dev
```

This will start the server using nodemon, which will watch for file changes and automatically restart the server when files are modified.

#### Production mode

To run the server in production mode:

```bash
npm start
```

## API Endpoints

### Events

- `GET /api/events` - Get all events (filter by location with ?location=NAME)
- `GET /api/events/spotlight` - Get spotlight events
- `GET /api/events/flyers` - Get carousel flyers
- `GET /api/events/locations` - Get available locations
- `GET /api/events/locations/:location` - Get location details
- `GET /api/events/location/:location` - Get location-specific events
- `GET /api/events/server-data` - Get raw events data
- `GET /api/events/:id` - Get event by ID

### Users (MatrixCMS Integration)

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/logout` - Logout a user
- `POST /api/users/forgot-password` - Request password reset
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `POST /api/users/change-password` - Change user password (protected)

## MatrixCMS Architecture Integration

The backend has been enhanced with the following components from MatrixCMS:

### Authentication System
- JWT-based authentication with role-based access control
- Token generation with purpose-specific options (access, refresh, email verification)
- Protected route middleware

### Enhanced Error Handling
- Centralized error creation utilities
- Status code & message standardization
- HTTP-specific error factory functions

### Improved Logging
- Winston logger implementation
- File and console transports
- Different log levels based on environment

### File Uploads
- Multer integration for handling file uploads
- File type validation and filtering
- Secure file naming with UUID

### Email Notifications
- Transactional email templates
- Account verification
- Password reset functionality

## Development

### Nodemon Configuration

The server uses nodemon for development, which is configured in `nodemon.json`. Key configuration:

- Watches all .js and .json files in server directories
- Ignores node_modules and test files
- 500ms delay to prevent multiple restarts
- Verbose logging for better debugging

### Folder Structure

- `server.js` - Main application entry point
- `controllers/` - Request handlers for different endpoints
- `routes/` - API route definitions
- `middlewares/` - Custom Express middleware (MatrixCMS naming convention)
- `models/` - MongoDB schema definitions (MatrixCMS integration)
- `data/` - Static data for events and locations
- `utils/` - Utility functions
- `uploads/` - Storage for uploaded files (MatrixCMS integration)
- `logs/` - Application logs (MatrixCMS integration)
- `db/` - Database connection and configuration

## Contributing

Make sure to restart the server when making changes to:

- Database configurations
- Environment variables
- Package installations

Nodemon will automatically restart when you modify files that are being watched.