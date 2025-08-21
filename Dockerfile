FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

#RUN pwd
#RUN ls -la

CMD ["node", "/app/dist/index.js"]
