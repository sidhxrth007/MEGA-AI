FROM node:20-buster

# Install required system packages
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Copy dependency files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of  application code
COPY . .

# Expose desired port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
