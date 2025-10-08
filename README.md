# Acquisitions App - Docker Setup with Neon Database

This application is dockerized to work seamlessly with both **Neon Local** (for development) and **Neon Cloud** (for production) databases.

## 🏗️ Architecture Overview

- **Development**: Uses Neon Local proxy via Docker to create ephemeral database branches
- **Production**: Connects directly to Neon Cloud database
- **Application**: Node.js/Express app with Drizzle ORM and Neon serverless driver

## 📁 Project Structure

```
acquisitions/
├── src/                     # Application source code
├── Dockerfile              # Production-ready container image
├── docker-compose.dev.yml  # Development with Neon Local
├── docker-compose.prod.yml # Production with Neon Cloud
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
├── .env                    # Current environment file
└── README.md              # This documentation
```

## 🔧 Prerequisites

1. **Docker & Docker Compose** installed
2. **Neon Account** with a project created
3. **Neon API Key** from your Neon console

## 🚀 Development Setup (Neon Local)

### 1. Configure Environment Variables

Copy and update the development environment file:

```bash
# Copy the development template
cp .env.development .env

# Edit .env and update these values:
# NEON_API_KEY=your_actual_neon_api_key
# NEON_PROJECT_ID=your_actual_project_id
# PARENT_BRANCH_ID=your_main_branch_id
```

### 2. Get Your Neon Credentials

From your [Neon Console](https://console.neon.tech):

- **API Key**: Go to Account Settings → API Keys → Create new key
- **Project ID**: Found in your project URL or project settings
- **Branch ID**: Use your main branch ID as the parent branch

### 3. Start Development Environment

```bash
# Start both Neon Local and your application
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up --build -d
```

### 4. Development Workflow

The development setup includes:
- ✅ **Neon Local proxy** at `localhost:5432`
- ✅ **Ephemeral database branch** (auto-created/destroyed)
- ✅ **Hot reload** for code changes
- ✅ **Application** at `http://localhost:3000`

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build
```

### 5. Database Operations in Development

```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## 🌐 Production Setup (Neon Cloud)

### 1. Configure Production Environment

```bash
# Set production environment variables (use your deployment platform's method)
export NODE_ENV=production
export JWT_SECRET="your_super_secure_jwt_secret"
export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
export ARCJET_API_KEY="your_production_arcjet_key"
```

### 2. Deploy with Production Compose

```bash
# Build and start production container
docker-compose -f docker-compose.prod.yml up --build -d

# Check health and logs
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Production Environment Variables

Create a `.env.prod` file or use your deployment platform's environment variable management:

```env
# Production Database (Neon Cloud)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require

# Security
JWT_SECRET=your_production_jwt_secret_here
ARCJET_API_KEY=your_production_arcjet_api_key

# App Config
NODE_ENV=production
PORT=3000
```

## 🔄 Environment Switching

### Development vs Production Comparison

| Feature | Development | Production |
|---------|-------------|------------|
| **Database** | Neon Local (ephemeral branches) | Neon Cloud (persistent) |
| **Connection** | `postgres://neon:npg@neon-local:5432/neondb` | Your Neon Cloud URL |
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Docker Compose** | `docker-compose.dev.yml` | `docker-compose.prod.yml` |
| **Environment** | `.env.development` | `.env.production` |

### Switching Between Environments

```bash
# Development
cp .env.development .env
docker-compose -f docker-compose.dev.yml up --build

# Production
cp .env.production .env
docker-compose -f docker-compose.prod.yml up --build
```

## 📊 Database Connection Details

### Development (Neon Local)
```javascript
// Your app automatically connects to:
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require

// Neon Local proxy handles:
// - Branch creation/deletion
// - Authentication with Neon Cloud
// - SSL termination
```

### Production (Neon Cloud)
```javascript
// Direct connection to Neon Cloud:
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require

// Features:
// - Connection pooling
// - Auto-scaling
// - Global read replicas (if configured)
```

## 🐛 Troubleshooting

### Common Issues

1. **Neon Local won't start**
   ```bash
   # Check your API credentials
   docker-compose -f docker-compose.dev.yml logs neon-local
   
   # Verify environment variables
   docker-compose -f docker-compose.dev.yml config
   ```

2. **App can't connect to database**
   ```bash
   # Check if Neon Local is running
   docker-compose -f docker-compose.dev.yml ps
   
   # Test connection
   docker-compose -f docker-compose.dev.yml exec app node -e "console.log(process.env.DATABASE_URL)"
   ```

3. **Hot reload not working**
   ```bash
   # Ensure volumes are mounted correctly
   docker-compose -f docker-compose.dev.yml exec app ls -la /app/src
   ```

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check container status
docker-compose -f docker-compose.prod.yml ps
```

## 🔐 Security Notes

1. **Never commit production secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Enable SSL** for all database connections
5. **Use strong JWT secrets** in production

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start with hot reload
npm run start        # Start production server
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio

# Docker Development
docker-compose -f docker-compose.dev.yml up --build    # Start dev environment
docker-compose -f docker-compose.dev.yml down          # Stop dev environment

# Docker Production
docker-compose -f docker-compose.prod.yml up --build   # Start prod environment
docker-compose -f docker-compose.prod.yml down         # Stop prod environment
```

## 📚 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Cloud Documentation](https://neon.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Start development environment: `docker-compose -f docker-compose.dev.yml up`
4. Make your changes
5. Test with both development and production setups
6. Submit a pull request

---

*This setup ensures your application works consistently across development and production environments while leveraging Neon's powerful branching capabilities for development.*