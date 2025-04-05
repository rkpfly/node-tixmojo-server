# TixMojo API Server

This is the backend API server for the TixMojo events platform.

## Features

- RESTful API for events and location data
- Custom events for different locations
- Spotlight events section
- Flyer carousel data
- Event details and filtering

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
PORT=5000
NODE_ENV=development
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
- `middleware/` - Custom Express middleware
- `data/` - Static data for events and locations
- `utils/` - Utility functions

## Contributing

Make sure to restart the server when making changes to:

- Database configurations
- Environment variables
- Package installations

Nodemon will automatically restart when you modify files that are being watched.