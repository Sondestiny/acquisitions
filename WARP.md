# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js Express API server for an "acquisitions" system with authentication features. The project uses modern ES6 modules, PostgreSQL with Drizzle ORM, and follows a layered architecture pattern.

## Key Technologies

- **Runtime**: Node.js with ES6 modules (`"type": "module"`)
- **Framework**: Express.js v5.1.0
- **Database**: PostgreSQL via Neon serverless (`@neondatabase/serverless`)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schemas
- **Logging**: Winston with file and console transports
- **Security**: Helmet middleware, secure cookies

## Development Commands

### Core Development
- `npm run dev` - Start development server with watch mode
- `npm run lint` - Run ESLint code analysis
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database Operations
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Apply pending database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Architecture Overview

The project follows a layered MVC architecture with clear separation of concerns:

### Directory Structure
- **`src/config/`** - Configuration files (database, JWT, logging)
- **`src/models/`** - Drizzle ORM schema definitions
- **`src/routes/`** - Express route definitions
- **`src/controllers/`** - Request handling logic
- **`src/services/`** - Business logic and data operations
- **`src/validations/`** - Zod schema validators
- **`src/utils/`** - Helper utilities (cookies, formatting)
- **`src/middewares/`** - Custom middleware (note: directory has typo)

### Key Architecture Patterns

**Database Layer**: Uses Drizzle ORM with Neon serverless PostgreSQL. Database configuration in `src/config/database.js` exports both `sql` (raw connection) and `db` (Drizzle instance).

**Authentication Flow**: 
- Routes (`auth.router.js`) → Controllers (`auth.controller.js`) → Services (`auth.service.js`)
- JWT tokens stored in secure HTTP-only cookies
- Password hashing with bcrypt (saltRounds: 10)
- Role-based access (user/admin roles)

**Validation**: Zod schemas in `src/validations/` for request validation with detailed error formatting

**Logging**: Winston logger with:
- File logging (`logs/error.log`, `logs/combined.log`)
- Console logging in non-production
- Structured JSON format with timestamps

## Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration time (default: '1h')
- `LOG_LEVEL` - Logging level (default: 'info')
- `NODE_ENV` - Environment ('production' for secure cookies)
- `PORT` - Server port (default: 3000)

## Code Style & Standards

- **ES Modules**: All imports use ES6 module syntax
- **ESLint Config**: 2-space indentation, single quotes, semicolons required
- **Error Handling**: Centralized error handling with Winston logging
- **Async/Await**: Preferred over Promises for async operations
- **Validation**: All user input validated with Zod schemas

## Database Schema

The `users` table (defined in `src/models/user.model.js`) includes:
- `id` (serial primary key)
- `name` (varchar 255, not null)
- `email` (varchar 255, unique, not null)
- `password` (hashed varchar 255, not null)
- `role` (varchar 50, default 'user')
- `created_at` & `update_at` (timestamps)

**Note**: There are bugs in the schema definition where password and role fields incorrectly use `varchar('name')` instead of their actual column names.

## Current API Endpoints

- `GET /` - Basic health check
- `GET /api` - API health check
- `POST /api/auth/register` - User registration (implemented)
- `POST /api/auth/login` - User login (stub)
- `POST /api/auth/logout` - User logout (stub)

## Development Notes

- The project uses `node --watch` for development hot-reloading
- Logs are written to `logs/` directory
- Database migrations are stored in `drizzle/` directory
- The main entry point is `src/index.js` which imports `src/server.js`
- Server configuration is in `src/app.js` with middleware setup

## Known Issues to Address

1. Schema bug: `password` and `role` fields in user model incorrectly reference `varchar('name')`
2. Typo in directory name: `middewares` should be `middlewares`
3. Missing error handling middleware
4. Login and logout endpoints are not implemented
5. Missing authentication middleware for protected routes
6. Hash function not properly imported in `auth.service.js` (line 34)