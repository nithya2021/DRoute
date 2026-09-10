# DRoute Deployment Guide

This guide covers deploying DRoute to production environments.

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd DRoute

# Install dependencies
npm install

# Start development servers
npm run dev
```

This starts:
- **API Server**: http://localhost:3001
- **Frontend App**: http://localhost:5173

## Docker Deployment

### Build Docker Image

```bash
docker build -t droute:latest .
```

### Run with Docker

```bash
# Run server
docker run -p 3001:3001 droute:latest npm run start --workspace=@droute/server

# Run in development mode with docker-compose
docker-compose up
```

### Docker Compose Development

```bash
# Start all services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Cloud Deployment

### AWS Deployment (Elastic Beanstalk)

1. **Prepare application**
   ```bash
   npm run build
   ```

2. **Create `.ebextensions/nodecommand.config`**
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       ProxyServer: nginx
   ```

3. **Deploy**
   ```bash
   eb init -p node.js-20 droute
   eb create droute-env
   eb deploy
   ```

### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create and deploy**
   ```bash
   heroku create droute-app
   git push heroku main
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   ```

### Vercel Deployment (Frontend)

1. **Connect GitHub repository**
   - Go to https://vercel.com
   - Import your repository

2. **Configure build settings**
   - Build command: `npm run build --workspace=@droute/client`
   - Output directory: `packages/client/dist`

3. **Set environment variables**
   ```
   REACT_APP_API_URL=https://api.droute.com
   ```

### DigitalOcean App Platform

1. **Create app.yaml**
   ```yaml
   name: droute
   services:
     - name: server
       github:
         branch: main
         repo: username/DRoute
       build_command: npm install && npm run build --workspace=@droute/server
       run_command: npm run start --workspace=@droute/server
       envs:
         - key: PORT
           value: "3001"
   ```

2. **Deploy**
   ```bash
   doctl apps create --spec app.yaml
   ```

## Database Setup (PostgreSQL)

### Local Development

```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Start server
brew services start postgresql

# Create database
createdb droute

# Run migrations (when available)
npm run migrate --workspace=@droute/server
```

### Production Database

#### AWS RDS
```bash
# Create RDS instance via AWS Console
# Update connection string in environment variables:
DATABASE_URL=postgresql://user:password@host:5432/droute
```

#### DigitalOcean Managed Database
```bash
# Create via DigitalOcean Console
# Connection string provided automatically
```

## Environment Variables

### Server (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/droute
GOOGLE_MAPS_API_KEY=your_key_here
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Client (.env)
```
REACT_APP_API_URL=https://api.droute.com
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
```

## SSL/TLS Certificate

### Let's Encrypt (Free)
```bash
# Using Certbot
sudo certbot certonly --standalone -d droute.com

# Renew automatically
sudo certbot renew --quiet --no-self-upgrade
```

## Monitoring & Logging

### Application Monitoring
- Set up error tracking (Sentry, Rollbar)
- Enable performance monitoring (New Relic, DataDog)
- Use application insights (Application Insights)

### Log Aggregation
- CloudWatch (AWS)
- Stackdriver (GCP)
- Papertrail (cross-platform)

## Scaling

### Horizontal Scaling
1. **Load Balancer Setup**
   - Use AWS ELB, Nginx, or HAProxy
   - Route traffic across multiple server instances

2. **Session Management**
   - Store sessions in Redis/Memcached
   - Share across instances

3. **Database Connection Pooling**
   - Use PgBouncer for PostgreSQL
   - Optimize pool size (max_connections / num_servers)

### Vertical Scaling
- Increase server RAM
- Upgrade to faster CPU
- Optimize database indices

## Performance Optimization

### Frontend
```bash
# Build optimization
npm run build --workspace=@droute/client

# Output will be minified and optimized
# Gzip enabled by default on most hosting platforms
```

### Backend
- Enable Redis caching for frequently accessed data
- Implement database query optimization
- Use connection pooling
- Enable gzip compression

## Backup & Recovery

### Database Backups
```bash
# Automated backups with RDS/Managed databases
# Manual backup
pg_dump droute > backup.sql

# Restore
psql droute < backup.sql
```

### Application Files
- Version control (Git) for code
- Cloud storage (S3) for user-uploaded files
- Regular backups of configuration

## Security Checklist

- [ ] Environment variables secured (no secrets in code)
- [ ] HTTPS/SSL enabled
- [ ] CORS configured properly
- [ ] Input validation implemented
- [ ] Database credentials rotated
- [ ] API rate limiting enabled
- [ ] CSRF protection enabled
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] Security headers configured

## CI/CD Pipeline

See `.github/workflows/ci.yml` for automated testing and deployment.

### Automated Workflow
1. Push to repository
2. GitHub Actions runs tests
3. Build Docker image
4. Deploy to staging (if tests pass)
5. Manual approval for production
6. Deploy to production

## Troubleshooting

### Server won't start
```bash
# Check port availability
lsof -i :3001

# Check logs
journalctl -u droute -n 50
```

### Database connection issues
```bash
# Test connection
psql -h host -U user -d droute

# Check connection string
echo $DATABASE_URL
```

### Memory issues
```bash
# Monitor memory usage
free -h
ps aux | grep node

# Increase heap size
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

## Support

For deployment issues:
1. Check application logs
2. Review error tracking service
3. Contact DevOps team
4. File an issue in repository

---

**Last Updated**: 2024
