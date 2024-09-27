# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to install dependencies
COPY package*.json ./


# Copy the rest of the application code, including .env
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV production

# Start the application
CMD ["node", "server.js"]
