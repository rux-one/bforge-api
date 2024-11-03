# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy the rest of your application code
COPY . .

# Build the application
RUN npm run build

# Command to run the application in production mode
CMD ["node", "dist/main.js"]