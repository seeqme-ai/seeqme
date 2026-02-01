# Build Stage 1: Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

RUN npm run build

# Build Stage 2: Backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/main.go

# Build Stage 3: Final Production Image
FROM alpine:latest
WORKDIR /app

# Install git as it is required for deployment operations
RUN apk add --no-cache git

# Copy the backend binary
COPY --from=backend-builder /app/backend/main .

# Copy the built frontend assets
COPY --from=frontend-builder /app/dist ./dist

# Copy necessary configuration and templates
COPY backend/pkg/email_templates ./backend/pkg/email_templates


# Expose the application port
EXPOSE 8080

# Environment variables
ENV ENVIRONMENT=production
ENV PORT=8080

# Run the application
CMD ["./main"]
