# Use official Node.js LTS image
FROM node:lts-bullseye

# Set working directory inside the container
WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg webp && \
    rm -rf /var/lib/apt/lists/*

# Copy all files from the current folder into the container
COPY . ./

# Install Node.js dependencies
RUN yarn install --network-concurrency 1

# Expose the port your bot uses
EXPOSE 7860

# Set production environment
ENV NODE_ENV=production

# Start the bot
CMD ["npm", "start"]
