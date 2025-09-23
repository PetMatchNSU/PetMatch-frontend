# Use Node.js LTS version 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all source code
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 5173

# Serve the application
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "5173"]