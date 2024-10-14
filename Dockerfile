# Use the official Node.js image as a base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .


# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app in development mode
CMD ["npm", "run", "dev"]
