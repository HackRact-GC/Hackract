FROM kalilinux/kali-rolling

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update and install basic tools
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    vim \
    net-tools \
    iputils-ping \
    dnsutils \
    nmap \
    nikto \
    dirsearch \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security...
RUN echo "export PS1='\[\e[32m\]hackract\[\e[m\]@\[\e[34m\]terminal\[\e[m\]:\[\e[33m\]\w\[\e[m\]$ '" >> /root/.bashrc

WORKDIR /root
CMD ["/bin/bash"]
