FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/client/package*.json ./packages/client/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build packages
RUN npm run build

# Expose ports
EXPOSE 3001 5173

# Default to running server
CMD ["npm", "run", "start", "--workspace=@droute/server"]
