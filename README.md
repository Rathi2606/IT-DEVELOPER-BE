- Link to the *live frontend* : "https://it-developer-rathi.netlify.app"
- Link to the *live backend* : "https://it-developer-be-rathi.onrender.com"
- Link to the *Frontend GitHub*: "https://github.com/Rathi2606/IT-DEVELOPER"

# TaskLane Backend

A robust Express.js backend API for TaskLane, a collaborative task management and kanban board application. Built with TypeScript, MongoDB, and Clerk authentication.

## Overview

TaskLane Backend provides RESTful APIs for managing kanban boards, tasks, comments, notifications, and team collaboration features. It handles authentication via Clerk, manages database operations with MongoDB, and implements comprehensive error handling and authorization middleware.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: MongoDB with Mongoose 8.15.1
- **Authentication**: Clerk SDK for Node.js
- **Validation**: Zod 3.25.32
- **Development**: Nodemon, ts-node

## Project Structure

```
be/
├── src/
│   ├── api/
│   │   ├── kanban.ts              # Kanban board routes
│   │   └── middlewares/
│   │       ├── authentication-middleware.ts
│   │       ├── authorization-middleware.ts
│   │       └── global-error-handling-middleware.ts
│   ├── application/
│   │   ├── boardMember.ts         # Board member business logic
│   │   ├── comment.ts             # Comment management
│   │   ├── kanban.ts              # Kanban board operations
│   │   └── notification.ts        # Notification handling
│   ├── domain/
│   │   ├── dto/                   # Data Transfer Objects
│   │   │   ├── category.ts
│   │   │   └── kanban.ts
│   │   └── errors/                # Custom error classes
│   │       ├── forbidden-error.ts
│   │       ├── not-found-error.ts
│   │       ├── unauthorized-error.ts
│   │       └── validation-error.ts
│   ├── infrastructure/
│   │   ├── db.ts                  # MongoDB connection
│   │   └── schemas/               # Mongoose schemas
│   │       ├── Board.ts
│   │       ├── Card.ts
│   │       ├── Column.ts
│   │       ├── Comment.ts
│   │       ├── Items.ts
│   │       └── Notification.ts
│   └── index.ts                   # Application entry point
├── types/
│   └── clerk.d.ts                 # Clerk type definitions
├── package.json
├── tsconfig.json
├── nodemon.json
└── .env                           # Environment variables
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (local or cloud)
- Clerk account for authentication

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `be` directory:
   ```env
   PORT=8000
   MONGODB_URI=<your-mongodb-connection-string>
   CLERK_SECRET_KEY=<your-clerk-secret-key>
   CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:8000`

## Available Scripts

- **`npm run dev`** - Start development server with hot reload (uses Nodemon)
- **`npm run build`** - Install dependencies and compile TypeScript to JavaScript
- **`npm start`** - Run the compiled JavaScript application

## API Endpoints

### Kanban Board Routes
All routes are prefixed with `/api/kanban`

- **GET** `/` - Retrieve all kanban boards
- **POST** `/` - Create a new kanban board
- **GET** `/:id` - Get a specific board by ID
- **PUT** `/:id` - Update a board
- **DELETE** `/:id` - Delete a board

### Board Members
- Manage team members on boards
- Handle member permissions and roles

### Comments
- Add, edit, and delete comments on cards
- Retrieve comments for specific cards

### Notifications
- Real-time notifications for board activities
- Notification preferences management

## Middleware

### Authentication Middleware
Validates Clerk JWT tokens and attaches user information to requests.

### Authorization Middleware
Ensures users have appropriate permissions for board operations.

### Global Error Handling Middleware
Catches and formats all errors with appropriate HTTP status codes.

## Database Schema

### Board
- Board metadata and configuration
- Owner and member information

### Card
- Task/card details
- Status, priority, and due dates
- Assigned members

### Column
- Kanban board columns
- Column ordering and configuration

### Comment
- Comments on cards
- Author and timestamp information

### Notification
- User notifications
- Read/unread status

## Error Handling

The API implements custom error classes for different scenarios:

- **ValidationError** - Invalid input data
- **UnauthorizedError** - Missing or invalid authentication
- **ForbiddenError** - Insufficient permissions
- **NotFoundError** - Resource not found

All errors are caught by the global error handling middleware and returned with appropriate HTTP status codes.

## CORS Configuration

Currently configured to accept requests from:
- `https://it-developer-rathi.netlify.app`

Update the CORS origin in [`be/src/index.ts`](be/src/index.ts:16) for different deployment environments.

## Development

### Code Organization

- **API Layer** (`src/api/`) - Route handlers and HTTP logic
- **Application Layer** (`src/application/`) - Business logic
- **Domain Layer** (`src/domain/`) - DTOs and custom errors
- **Infrastructure Layer** (`src/infrastructure/`) - Database and external services

### Adding New Features

1. Create schema in `src/infrastructure/schemas/`
2. Implement business logic in `src/application/`
3. Add routes in `src/api/`
4. Define DTOs in `src/domain/dto/`

## Deployment

### Build for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Run Production Build

```bash
npm start
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
