# Almuetasim API - Project Instructions

This document provides a comprehensive guide to understanding and working with the Almuetasim API project. It covers the project overview, technical stack, setup instructions, folder structure, key components, and development guidelines.

## Project Overview

Almuetasim is a minimal e-commerce API designed for a company selling water filters, replacement parts, and offering installation/maintenance services. The project is built with NestJS (Node.js), PostgreSQL, and TypeORM, with plans to integrate with Redis for caching and queues, S3-compatible object storage for images/receipts, and SMTP for emails.

## Tech Stack

- **Backend Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (access + refresh tokens)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Security**: Helmet, CORS
- **Package Manager**: pnpm

## Setup Instructions

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file from `.env.example` and fill in the required environment variables:

   ```bash
   cp .env.example .env
   ```

3. Run the development server:

   ```bash
   pnpm run start:dev
   ```

4. Access the API at `http://localhost:8000` (default port)
5. Access Swagger documentation at `http://localhost:8000/docs`

## Available Commands

- `pnpm install` - Install dependencies
- `pnpm run build` - Build the project
- `pnpm run start` - Start the production server
- `pnpm run start:dev` - Start the development server with hot reload
- `pnpm run start:debug` - Start the development server with debug mode
- `pnpm run start:prod` - Start the production server from dist files
- `pnpm run lint` - Lint the codebase
- `pnpm run lint:fix` - Fix linting errors
- `pnpm run format` - Format code with Prettier
- `pnpm run typeorm` - Run TypeORM CLI commands
- `pnpm run migration:generate` - Generate database migrations
- `pnpm run migration:run` - Run database migrations
- `pnpm run migration:revert` - Revert the last database migration

## Folder Structure

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── auth/           # Authentication module
├── products/       # Products module
├── analytics/      # Analytics module
├── common/         # Shared utilities, constants, filters
├── config/         # Configuration files (TypeORM, etc.)
└── migrations/     # Database migration files
```

## Key Components

### Authentication System

The authentication system implements JWT-based authentication with access and refresh tokens:

- **Access Token**: Short-lived (15 minutes by default)
- **Refresh Token**: Longer-lived (30 days by default)
- **Endpoints**:
  - `POST /auth/login` - User login
  - `POST /auth/refresh` - Refresh access token
  - `POST /auth/logout` - User logout

Tokens are secured with bcrypt hashing and stored in the database for revocation capability.

### Data Models

Currently implemented entities:

1. **Product**:
   - Fields: id, name, description, price, image_url, status, created_at, updated_at, deleted_at
   - Status options: AVAILABLE, OUT_OF_STOCK

2. **User** (referenced but not fully implemented in current codebase):
   - Fields: id, email, password, refresh_token

### API Endpoints

1. **Authentication**:
   - `POST /auth/login` - Login with email and password
   - `POST /auth/refresh` - Refresh access token
   - `POST /auth/logout` - Logout and revoke refresh token

2. **Products**:
   - `GET /products` - Get all products with pagination and filtering
   - `GET /products/:id` - Get a specific product
   - `POST /products` - Create a new product (admin only)
   - `PATCH /products/:id` - Update a product (admin only)
   - `DELETE /products/:id` - Delete a product (admin only)

3. **Documentation**:
   - `GET /docs` - Swagger API documentation

## Development Guidelines

### Coding Standards

- Use TypeScript for all backend code
- Follow NestJS module architecture patterns
- Implement DTOs for data validation using class-validator
- Use TypeORM entities for database models
- Apply proper error handling with custom exception filters
- Write clean, well-documented code with meaningful comments

### Database Migrations

- Always generate migrations for schema changes:
  ```bash
  pnpm run migration:generate -- src/migrations/MigrationName
  ```
- Run migrations before deploying:
  ```bash
  pnpm run migration:run
  ```

### Environment Configuration

- Use `.env` files for environment-specific configurations
- Never commit sensitive information to the repository
- Use ConfigModule from @nestjs/config for accessing environment variables

### Security Best Practices

- Validate all inputs with DTOs and class-validator
- Use HTTPS in production
- Implement proper CORS configuration
- Use Helmet for security headers
- Hash passwords with bcrypt
- Implement rate limiting for public endpoints

## Testing

Testing is an important part of development. Use the following commands for testing:

- Unit tests: Implementation pending
- Integration tests: Implementation pending
- End-to-end tests: Implementation pending

## Deployment Considerations

1. **Database**: Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. **Caching**: Implement Redis for caching and queues
3. **File Storage**: Use S3-compatible storage for images and receipts
4. **Email**: Configure SMTP for sending emails
5. **Monitoring**: Implement logging with Pino and error tracking with Sentry
6. **CI/CD**: Set up continuous integration and deployment pipeline

## Future Development Roadmap

1. Implement user registration endpoint
2. Complete user entity and related services
3. Implement cart and checkout functionality
4. Add order management system
5. Implement warranty activation features
6. Add installation/maintenance booking system
7. Implement admin panel endpoints
8. Add payment integration
9. Implement subscription system

## ESLint Configuration and Common Issues

The project uses ESLint with several plugins including SonarJS and security rules to ensure code quality and identify potential vulnerabilities.

### Plugins Used

1. **SonarJS**: Detects bugs, vulnerabilities, and code smells
2. **Security**: Identifies potential security vulnerabilities
3. **TypeScript ESLint**: TypeScript-specific linting rules
4. **Prettier**: Code formatting rules

### Common Linting Issues and Solutions

1. **"Unsafe assignment of an `any` value"**:
   - Solution: Add proper type annotations to variables and function returns
   - Example: `const request = ctx.switchToHttp().getRequest<Request>();`

2. **"Unsafe member access ... on an `any` value"**:
   - Solution: Ensure objects are properly typed before accessing their properties
   - Example: Use type guards or type assertions when accessing properties of external objects

3. **Unused imports**:
   - Solution: Remove unused imports or use them in the code
   - SonarJS specifically flags unused imports with the rule `sonarjs/unused-import`

4. **Security-related issues**:
   - Solution: Review flagged code for potential vulnerabilities like object injection, eval usage, etc.

### Running Linting

- Run `pnpm run lint` to check for linting issues
- Run `pnpm run lint:fix` to automatically fix fixable issues

### Adding New ESLint Rules

1. Modify `eslint.config.mjs` to add or modify rules
2. Install any required plugins with `pnpm add -D <plugin-name>`
3. Test the configuration with `pnpm run lint`

## Common Issues and Solutions

1. **Port already in use**: Change the PORT environment variable
2. **Database connection issues**: Verify database credentials in .env file
3. **Migration errors**: Ensure migrations are run in the correct order
4. **Authentication issues**: Check JWT secrets in environment variables

## Useful Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT Documentation](https://jwt.io/)
- [Swagger Documentation](https://swagger.io/)
- [ESLint Documentation](https://eslint.org/)
- [SonarJS Rules](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
