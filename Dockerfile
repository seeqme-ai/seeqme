# Build Stage 1: Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Declare all VITE_* vars as build args so Railway passes them through
# at docker build time — Vite bakes these into the static bundle during
# `npm run build`, so they must be present here, not at container start.
ARG VITE_BACKEND_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_DATABASE_URL
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_PAYSTACK_PUBLIC_KEY
ARG VITE_SLACK_WEBHOOK_URL
ARG VITE_HEDERA_NETWORK
ARG VITE_WALLETCONNECT_PROJECT_ID

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_DATABASE_URL=$VITE_FIREBASE_DATABASE_URL
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY
ENV VITE_SLACK_WEBHOOK_URL=$VITE_SLACK_WEBHOOK_URL
ENV VITE_HEDERA_NETWORK=$VITE_HEDERA_NETWORK
ENV VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID

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
