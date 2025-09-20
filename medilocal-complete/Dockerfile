# Multi-stage build for complete MediLocal AI system
FROM node:18-alpine AS frontend-builder

# Build Frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Python Backend Base
FROM python:3.11-slim AS backend-base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for n8n
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Backend Dependencies
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Final Production Image
FROM backend-base AS production

# Install n8n globally
RUN npm install -g n8n@latest

# Copy built frontend
COPY --from=frontend-builder /frontend/dist /app/static

# Copy workflows and configuration
COPY workflows/ /app/workflows/
COPY n8n-init/ /app/n8n-init/
COPY database/ /app/database/
COPY scripts/ /app/scripts/

# Create necessary directories
RUN mkdir -p /app/logs /app/data /root/.n8n

# Set permissions
RUN chmod +x /app/scripts/*.sh

# Expose ports
EXPOSE 8000 5678 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start script
COPY scripts/start-all.sh /start-all.sh
RUN chmod +x /start-all.sh

CMD ["/start-all.sh"]
