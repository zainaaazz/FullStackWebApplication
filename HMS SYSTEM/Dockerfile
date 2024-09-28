# Use an official Node.js runtime as a parent image
FROM node:18

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the rest of the application code, including .env
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV production

# Start the application
CMD ["node", "server.js"]
