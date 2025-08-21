# Stage 1: Build the project
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source files
COPY src ./src
COPY tsconfig.json ./

# Build the project
RUN npm run build

# Stage 2: Set up the runtime environment
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY smithery.yaml ./

ENV NODE_ENV=production
ENV APIFY_TOKEN=your-api-key-here

RUN npm ci --ignore-scripts --omit-dev

ENTRYPOINT ["node", "smithery-run.js"]
