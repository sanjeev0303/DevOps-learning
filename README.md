# DevOps Learning Application

A Node.js Express application with authentication, rate limiting, and database integration using Neon Database. This application supports both development (with Neon Local) and production (with Neon Cloud) environments.

## 🏗️ Architecture

- **Framework**: Node.js with Express
- **Database**: PostgreSQL via Neon Database
- **Authentication**: JWT with bcrypt
- **Security**: Arcjet rate limiting and bot protection
- **ORM**: Drizzle ORM
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Development Setup (with Neon Local)

1. **Clone the repository**

   ```bash
   git clone https://github.com/sanjeev0303/DevOps-learning.git
   cd DevOps-learning
   ```

2. **Configure Neon API credentials**

   ```bash
   # Copy the example environment file
   cp .env.example .env.development

   # Edit .env.development and add your Neon credentials:
   # NEON_API_KEY=your_neon_api_key
   # NEON_PROJECT_ID=your_neon_project_id
   # PARENT_BRANCH_ID=your_parent_branch_id (usually 'main')
   ```

3. **Start the development environment**

   ```bash
   npm run dev:docker
   ```

   This command will:
   - Build the application Docker image
   - Start Neon Local proxy with ephemeral branch creation
   - Start the application connected to Neon Local
   - Automatically create/destroy database branches per container lifecycle

4. **Access the services**
   - Application: http://localhost:5000
   - Health Check: http://localhost:5000/health
   - Database Connection: `postgres://neon:npg@localhost:5432/neondb`

5. **Stop the development environment**
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

### Production Setup (with Neon Cloud)

1. **Set environment variables**

   ```bash
   export DATABASE_URL="your-neon-cloud-database-url"
   export ARCJET_KEY="your-arcjet-key"
   export JWT_SECRET="your-secure-jwt-secret"
   ```

2. **Start production environment**

   ```bash
   npm run docker:prod
   ```

3. **Stop production environment**
   ```bash
   npm run docker:prod:down
   ```

## 🗂️ Project Structure

```
DevOps-learning/
├── src/
│   ├── config/          # Database and service configurations
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Database models (Drizzle)
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── validation/     # Input validation schemas
├── drizzle/            # Database migrations
├── logs/               # Application logs
├── docker-compose.dev.yml   # Development Docker setup
├── docker-compose.prod.yml  # Production Docker setup
├── Dockerfile          # Application container definition
├── .env.development    # Development environment variables
├── .env.production     # Production environment variables
└── nginx.conf          # Nginx configuration for production
```

## 🔧 Environment Configuration

### Development (.env.development)

- Uses Neon Local proxy at `postgres://neon:npg@neon-local:5432/neondb`
- Requires Neon API credentials for branch management
- Debug logging enabled
- Development-friendly security settings
- Automatic ephemeral branch creation/cleanup

### Production (.env.production)

- Uses Neon Cloud Database URL
- Info-level logging
- Production security configuration
- Environment variables injected at runtime

## 📊 Database Setup

### Development with Neon Local

Neon Local automatically provides:

- Ephemeral database branches for testing
- Local proxy to your Neon Cloud database
- Branch management for feature development
- Automatic cleanup of ephemeral branches
- Connection to real Neon data through local interface

**How it works:**

1. Neon Local creates an ephemeral branch from your parent branch
2. Your app connects to `localhost:5432` but data flows to/from Neon Cloud
3. When the container stops, the ephemeral branch is automatically deleted
4. Perfect for development without affecting production data

### Production with Neon Cloud

Production uses:

- Managed Neon Cloud PostgreSQL
- Automatic backups and point-in-time recovery
- Connection pooling
- Global edge locations

### Running Migrations

```bash
# Generate new migration
npm run db:generate

# Apply migrations (development)
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Apply migrations (production)
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

## 🔒 API Endpoints

### Authentication

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout

### Health & Monitoring

- `GET /health` - Application health check
- `GET /` - Welcome message

### Example Usage

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "user"
  }'

# Sign in
curl -X POST http://localhost:5000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

## 🛡️ Security Features

- **Rate Limiting**: Arcjet-powered rate limiting by user role
- **Bot Protection**: Automated request filtering
- **Input Validation**: Zod schema validation
- **Authentication**: JWT tokens with HTTP-only cookies
- **Password Security**: bcrypt hashing
- **CORS Protection**: Configurable CORS policies

## 🔧 Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run docker:dev          # Start full development stack
npm run docker:dev:down     # Stop development stack

# Production
npm run docker:prod         # Start production stack
npm run docker:prod:down    # Stop production stack

# Database
npm run db:generate         # Generate new migration
npm run db:migrate          # Apply migrations
npm run db:studio          # Open Drizzle Studio

# Docker Management
npm run docker:build        # Build application image
npm run docker:clean        # Clean up Docker resources

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run format             # Format code with Prettier
```

## 🚀 Deployment

### Local Development

1. Ensure Docker is running
2. Run `npm run docker:dev`
3. Access application at http://localhost:5000

### Production Deployment

1. Set required environment variables
2. Run `npm run docker:prod`
3. Configure reverse proxy (nginx included)
4. Set up SSL certificates for HTTPS

### Environment Variables for Production

```bash
# Required
DATABASE_URL=postgresql://username:password@host:port/database
ARCJET_KEY=your_arcjet_api_key
JWT_SECRET=your_secure_jwt_secret

# Optional
PORT=5000
NODE_ENV=production
LOG_LEVEL=info
```

## 🔍 Monitoring & Logging

- Application logs are written to `logs/` directory
- Health check endpoint available at `/health`
- Structured logging with Winston
- Request logging with Morgan

## 🚀 CI/CD with GitHub Actions

This project includes three GitHub Actions workflows for continuous integration and deployment:

### 📋 Available Workflows

1. **Lint and Format** (`lint-and-format.yml`)
   - Triggers: Push/PR to `main` and `staging` branches
   - Runs ESLint and Prettier checks
   - Provides clear feedback and fix suggestions

2. **Tests** (`tests.yml`)
   - Triggers: Push/PR to `main` and `staging` branches
   - Runs Jest test suite with experimental VM modules
   - Uploads coverage reports as artifacts (30-day retention)
   - Generates detailed test summaries

3. **Docker Build and Push** (`docker-build-and-push.yml`)
   - Triggers: Push to `main` branch or manual workflow dispatch
   - Builds multi-platform Docker images (linux/amd64, linux/arm64)
   - Pushes to Docker Hub with multiple tags
   - Uses GitHub Actions cache for efficiency

### 🔐 Required Secrets

To use the Docker workflow, configure these repository secrets:

```
DOCKER_USERNAME     # Your Docker Hub username
DOCKER_PASSWORD     # Your Docker Hub password or access token
```

Optionally for tests:

```
TEST_DATABASE_URL   # Test database connection string
```

### 🏷️ Docker Image Tags

The Docker workflow creates the following tags:

- `latest` (for main branch)
- `main-<commit-sha>` (branch with commit SHA)
- `prod-YYYYMMDD-HHmmss` (production timestamp)

### 📊 Workflow Features

- **Caching**: Node.js dependencies and Docker layers are cached
- **Multi-platform**: Docker images built for AMD64 and ARM64
- **Annotations**: Clear success/failure messages with actionable suggestions
- **Artifacts**: Test coverage reports available for download
- **Summaries**: Detailed GitHub step summaries for each workflow

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure Neon Local is running (development)

2. **Port Already in Use**
   - Stop existing processes on ports 5000, 5432, 8080
   - Use `docker-compose down` to stop containers

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check ARCJET_KEY configuration
   - Ensure cookies are enabled in browser

### Debug Commands

```bash
# View application logs
docker-compose -f docker-compose.dev.yml logs app

# Access application container
docker-compose -f docker-compose.dev.yml exec app sh

# View database logs
docker-compose -f docker-compose.dev.yml logs neon-local
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
