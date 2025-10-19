# Railway Optimized Dockerfile
# Multi-stage build for faster deployment

# Stage 1: Frontend Build
FROM node:18-alpine AS frontend-builder

WORKDIR /app/front

# Copy package files for better caching
COPY front/package*.json ./
COPY front/pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy frontend source
COPY front/ .

# Build frontend
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
RUN pnpm run build

# Stage 2: Python Backend
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies (minimal for Railway)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    build-essential \
    libpq-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy minimal requirements first
COPY back/requirements-minimal.txt requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && pip cache purge

# Copy backend code
COPY back/ .

# Copy built frontend
COPY --from=frontend-builder /app/front/build /app/staticfiles/

# Configure Nginx for Railway
RUN echo 'server {\n\
    listen 80;\n\
    server_name _;\n\
    \n\
    location / {\n\
        try_files $uri $uri/ @django;\n\
    }\n\
    \n\
    location @django {\n\
        proxy_pass http://127.0.0.1:8000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
    \n\
    location /static/ {\n\
        alias /app/staticfiles/;\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
    \n\
    location /media/ {\n\
        alias /app/media/;\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}' > /etc/nginx/sites-available/default

# Create optimized startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Run migrations with error handling\n\
echo "Running migrations..."\n\
python manage.py migrate || echo "Migration failed, continuing..."\n\
\n\
# Collect static files\n\
echo "Collecting static files..."\n\
python manage.py collectstatic --noinput || echo "Static collection failed, continuing..."\n\
\n\
# Install ML dependencies in background (non-blocking)\n\
echo "Installing ML dependencies in background..."\n\
pip install torch --index-url https://download.pytorch.org/whl/cpu > /dev/null 2>&1 &\n\
pip install sentence-transformers langchain langchain-community tiktoken chromadb > /dev/null 2>&1 &\n\
pip install langchain-openai langchain-chroma langchain-core langchain-huggingface > /dev/null 2>&1 &\n\
pip install openai rapidfuzz pypdf PyPDF2 pytesseract pdf2image > /dev/null 2>&1 &\n\
\n\
# Start Django server on port 80\n\
echo "Starting Django server on port 80..."\n\
python manage.py runserver 0.0.0.0:80' > /start.sh && chmod +x /start.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Run the application
CMD ["/start.sh"]
