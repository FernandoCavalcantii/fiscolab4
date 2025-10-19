# Frontend Dockerfile for development
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code (excluding node_modules)
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "start"]
