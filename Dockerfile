#FROM node:18-alpine
#
#WORKDIR /app
#
## Copy package files
#COPY package*.json ./
#
## Install dependencies
#RUN npm install
#
## Copy application code
#COPY . .
#
## Build the application
#RUN npm run build
#
#CMD ["node", "/app/dist/index.js"]
#

#FROM node:18-alpine AS builder
FROM node:22.12-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
COPY src ./src
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Build the project
RUN npm run build

FROM node:22-alpine AS release
#FROM node:18-alpine AS release

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

ENV NODE_ENV=production
ENV APIFY_TOKEN=your-api-key-here

# Install production dependencies only
RUN npm ci --ignore-scripts --omit-dev

# Set the entry point for the container
ENTRYPOINT ["node", "/dist/index.js"]
