FROM node:20-bullseye-slim

# Install Puppeteer and LaTeX dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Chromium dependencies for Puppeteer
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    # LaTeX dependencies
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-xetex \
    lmodern \
    && rm -rf /var/lib/apt/lists/*

# Set up non-root user (node is created by node image)
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
# Puppeteer will download Chromium locally during install
RUN npm ci

# Copy application source
COPY . .

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

# Expose port
EXPOSE 4000

# Start command
CMD ["npm", "run", "start"]
