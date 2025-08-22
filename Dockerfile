FROM node:22.12-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

COPY src ./src
COPY tsconfig.json ./

# Build the project
RUN npm run build

FROM node:22-alpine AS release

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

ENV NODE_ENV=production
ENV APIFY_TOKEN=your-api-key-here

# Install production dependencies only
RUN npm ci --ignore-scripts --omit=dev

# Set the entry point for the container
ENTRYPOINT ["node", "dist/index.js"]
