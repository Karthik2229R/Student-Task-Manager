FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose port (default 5000)
EXPOSE 5000

CMD ["node", "src/server.js"]
