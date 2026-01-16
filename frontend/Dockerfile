# ===========================================
# Frontend Dockerfile (Production)
# ===========================================
# Multi-stage build with Nginx

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

# Copy package files first for dependency caching
COPY package*.json .

RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
