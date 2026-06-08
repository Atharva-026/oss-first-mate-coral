FROM ubuntu:24.04

WORKDIR /app

# Install Node.js 20 and curl
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Coral
RUN curl -fsSL https://withcoral.com/install.sh | sh

# Copy binary
RUN cp /root/.local/bin/coral /usr/local/bin/coral && \
    chmod +x /usr/local/bin/coral

# Verify
RUN /usr/local/bin/coral --version

# Add GitHub source
ARG GITHUB_TOKEN
RUN if [ -n "$GITHUB_TOKEN" ]; then \
    GITHUB_TOKEN=$GITHUB_TOKEN /usr/local/bin/coral source add github; \
    fi

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]