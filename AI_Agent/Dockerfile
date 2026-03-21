# Use Debian Sid (Unstable) Slim as base image
# This provides a newer libc6 compatible with Kali Rolling packages
FROM debian:sid-slim

# Set environment variables
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /hackract

# Expose API port
EXPOSE 8008

# Configure Kali Linux repositories on top of Debian
# This allows us to install Kali tools while keeping the base image minimal
RUN apt-get update && \
    apt-get install -y --no-install-recommends gnupg2 wget ca-certificates && \
    # Add Kali repository
    echo "deb http://http.kali.org/kali kali-rolling main non-free contrib" > /etc/apt/sources.list.d/kali.list && \
    # Add Kali archive key (using trusted.gpg.d to avoid deprecation warning)
    wget -q -O - https://archive.kali.org/archive-key.asc | gpg --dearmor > /etc/apt/trusted.gpg.d/kali-archive-keyring.gpg && \
    # Set priority to prefer Debian packages over Kali to maintain stability
    echo "Package: *\nPin: release o=Kali\nPin-Priority: 100\n" > /etc/apt/preferences.d/kali && \
    # Update with new repos
    apt-get update && \
    # Install base tools
    apt-get install -y --no-install-recommends \
    # Base utilities
    curl wget git vim nano unzip procps \
    # Python
    python3 python3-pip python3-venv python-is-python3 \
    # Build tools
    build-essential \
    # Network tools
    net-tools iputils-ping dnsutils \
    # Core security tools (base) - Explicitly from Kali if needed
    nmap \
    # Web application testing - COMPREHENSIVE SUITE
    nikto sqlmap dirb gobuster wfuzz \
    # CMS scanners
    wpscan \
    # Additional web tools
    whatweb wafw00f httprobe \
    # Directory/file enumeration
    dirsearch \
    # Subdomain enumeration
    sublist3r \
    # Wordlist generators
    crunch cewl \
    # Exploit DB indices
    exploitdb \
    # Encoding/analysis
    xxd \
    # Proxy tools
    proxychains \
    # JavaScript runtime
    nodejs npm \
    # Ruby (for some tools)
    ruby ruby-dev \
    # Go (for modern tools)
    golang-go \
    # SSL/TLS testing
    sslscan \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages from requirements
# We copy requirements.txt first to leverage Docker cache
COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages --ignore-installed -r /tmp/requirements.txt && \
    rm /tmp/requirements.txt

# Install additional web-focused tools via other package managers
# Note: requests, colorama are in requirements.txt; extras installed below
RUN pip3 install --no-cache-dir --break-system-packages \
    jwt pyjwt \
    urllib3 \
    termcolor

# Install Node.js tools for web testing
RUN npm install -g \
    jwt-cli \
    http-server

# Install Playwright browsers (for browser automation)
# DISABLED: Causes dependency issues in Kali Linux
# Browsers can be installed manually later if needed: playwright install chromium
# RUN playwright install chromium && \
#     playwright install-deps chromium

# Copy application code
COPY . /hackract/

# Create necessary directories
RUN mkdir -p /hackract/memory /hackract/logs /hackract/work_dir

# Set permissions
RUN chmod +x /hackract/run_cli.py
RUN chmod +x /hackract/instruments/*/*.sh 2>/dev/null || true

# Create a script for easy tool installation
RUN echo '#!/bin/bash\napt-get update\napt-get install -y "$@"' > /usr/local/bin/install-tool && \
    chmod +x /usr/local/bin/install-tool

# Add helpful aliases
RUN echo 'alias ll="ls -lah"' >> /root/.bashrc && \
    echo 'alias update-tools="apt-get update"' >> /root/.bashrc && \
    echo 'alias search-tools="apt-cache search"' >> /root/.bashrc

# Healthcheck: route is /api/health (not /health)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8008/api/health || exit 1

# Default command - Run API server
CMD ["python3", "run_api.py"]
