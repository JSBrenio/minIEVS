# Use Node.js 20 Alpine image for smaller size
FROM node:20-alpine AS base

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Use nodemon with ts-node for development
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

ENV NODE_PATH=./build

RUN npm run build

CMD ["npm", "start"]