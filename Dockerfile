# Use a fixed Node LTS image (matches package.json engines and node-gyp prebuilds)
FROM node:20-bullseye

# Set working directory inside the container
WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg webp && \
    rm -rf /var/lib/apt/lists/*

# Copy all files from the current folder into the container
COPY . ./

# Install Node.js dependencies (reproducible, uses package-lock.json)
RUN npm ci --omit=dev --no-audit --no-fund

# Port used by the app (Cloud Run overrides this with $PORT)
ENV PORT=8080
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production

# Start the bot
CMD ["npm", "start"]
