FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY src ./src
COPY tsconfig.json ./
COPY package.json package-lock.json ./

RUN npm install

# Build the project
RUN npm run build

FROM node:22-alpine AS release

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

ENV NODE_ENV=production
ENV APIFY_TOKEN=your-apify-token

RUN npm ci --ignore-scripts --omit-dev

ENTRYPOINT ["node", "/app/dist/index.js"]
