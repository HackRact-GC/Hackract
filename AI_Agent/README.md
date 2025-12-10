# HackrAct AI Agent 🛡️

**Autonomous AI Penetration Tester powered by Large Language Models**

HackrAct is an AI-powered cybersecurity agent designed for penetration testing, vulnerability assessment, and security research. Built on top of Agent Zero's hacking capabilities, it combines autonomous reasoning with professional security tools.

> ⚠️ **LEGAL DISCLAIMER**: This tool is for authorized security testing and educational purposes ONLY. Unauthorized access to computer systems is illegal. Always obtain explicit written permission before testing any systems.

## 🎯 Features

- **Autonomous Pentesting**: AI-driven security testing with minimal human intervention
- **Comprehensive Tool Suite**: Integrated with Kali Linux tools (nmap, metasploit, sqlmap, john, hashcat, nikto, and more)
- **Memory System**: Stores exploits, vulnerabilities, and findings for reuse
- **Code Execution**: Run shell commands, Python, and Node.js scripts
- **Methodical Approach**: Follows industry-standard frameworks (OWASP, PTES, MITRE ATT&CK)
- **Professional Reporting**: Technical, detailed security reports

## 🏗️ Architecture

```
HackrAct AI Agent
├── Core Agent (agent.py)
│   ├── LLM Integration (Claude, GPT-4, etc.)
│   ├── Reasoning Loop
│   └── Tool Orchestration
├── Tools
│   ├── code_execution_tool - Run security tools
│   ├── memory_save/load - Store findings
│   ├── search - Threat intelligence
│   └── response - User communication
├── Memory System (ChromaDB)
│   └── Vector storage for exploits & findings
├── Prompts
│   ├── Role: Penetration tester personality
│   ├── Environment: Kali Linux context
│   ├── Solving: Methodology & approach
│   └── Tools: Tool usage instructions
└── Docker Environment
    └── Kali Linux with security tools
```

## 📦 Installation

### Prerequisites

- Docker and Docker Compose
- API key for LLM provider (OpenRouter, OpenAI, etc.)

### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd hackract_AI_agent
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Add your API_KEY
   ```

3. **Build and run with Docker:**
   ```bash
   docker-compose up --build
   ```

4. **Or build and run manually:**
   ```bash
   docker build -t hackract-ai .
   docker run -it --rm \
     --cap-add=NET_ADMIN --cap-add=NET_RAW \
     -v $(pwd)/memory:/hackract/memory \
     -v $(pwd)/logs:/hackract/logs \
     -v $(pwd)/.env:/hackract/.env \
     hackract-ai
   ```

### Local Installation (without Docker)

On Kali Linux or similar:

```bash
# Install Python dependencies
pip3 install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Configure environment
cp .env.example .env
nano .env

# Run
python3 run_cli.py
```

## 🚀 Usage

### Interactive Mode

```
👤 You: Scan localhost for open ports

🛡️ HackrAct: I'll perform a port scan on localhost using nmap...

[Agent executes: nmap -sV -sC localhost]

Found 3 open ports:
- Port 22 (SSH): OpenSSH 8.9
- Port 80 (HTTP): Apache 2.4.52
- Port 3306 (MySQL): MySQL 8.0.32 - CRITICAL: Exposed remotely!

The MySQL exposure is a critical security issue...
```

### Example Tasks

**Network Scanning:**
```
"Scan 192.168.1.0/24 for live hosts and open ports"
"Identify the OS and services running on 192.168.1.100"
```

**Web Application Testing:**
```
"Test http://testsite.com for SQL injection vulnerabilities"
"Scan http://example.com with nikto and report findings"
"Enumerate directories on http://target.com"
```

**Password Cracking:**
```
"Crack the hashes in hashes.txt using john the ripper"
"Brute force SSH on 192.168.1.50 with user admin"
```

**Information Gathering:**
```
"What are common SQL injection payloads?"
"Find recent CVEs for Apache 2.4.29"
"Recall previous MySQL exploits from memory"
```

**Exploitation:**
```
"Search for exploits for vsftpd 2.3.4"
"Use metasploit to exploit the identified vulnerability"
```

## 🛠️ Available Tools

### Security Tools (via code_execution_tool)

**Network Scanning:**
- `nmap` - Port scanning, service detection
- `masscan` - Fast port scanner
- `netcat` - Network connections

**Web Testing:**
- `nikto` - Web server scanner
- `sqlmap` - SQL injection automation
- `gobuster`, `dirb` - Directory brute forcing
- `wfuzz` - Web fuzzer

**Exploitation:**
- `metasploit-framework` - Exploitation framework
- `searchsploit` - Exploit database

**Password Cracking:**
- `john` - John the Ripper
- `hashcat` - GPU password cracking
- `hydra` - Network login brute forcer

**Wireless:**
- `aircrack-ng` - Wireless security tools

**Other:**
- `enum4linux` - SMB enumeration
- `curl`, `wget` - HTTP clients
- Python, Node.js - Custom scripting

### Agent Tools

- **code_execution_tool**: Execute shell, Python, or Node.js code
- **memory_save**: Save exploits, vulnerabilities, credentials
- **memory_load**: Recall previously saved information
- **search**: Search for threat intelligence and CVEs
- **response**: Send formatted responses to user

## 🧠 Memory System

HackrAct remembers what it learns:

**Save a finding:**
```
Agent automatically saves: "SQL injection found in /login.php using payload: ' OR '1'='1' --"
Category: exploit
```

**Recall later:**
```
You: "What SQL injection techniques have worked before?"
Agent: [Recalls from memory] "I found a successful SQL injection payload..."
```

**Categories:**
- `exploit` - Working exploits
- `vulnerability` - Security weaknesses found
- `credential` - Discovered credentials
- `technique` - Successful attack methods
- `finding` - General security findings

## 📋 Configuration

Edit `.env` file:

```bash
# LLM Configuration
LLM_PROVIDER=openrouter
API_KEY=your_api_key_here

# Models
CHAT_MODEL=anthropic/claude-3.5-sonnet
UTILITY_MODEL=anthropic/claude-3-haiku
EMBEDDING_MODEL=text-embedding-3-small

# Memory
MEMORY_DIR=./memory
MEMORY_ENABLED=true

# Agent
AGENT_NAME=HackrAct
MAX_ITERATIONS=25
```

### Supported LLM Providers

- **OpenRouter** (recommended): Access to Claude, GPT-4, Gemini, and many others through one API
- **OpenAI**: GPT-4, GPT-4-turbo, GPT-3.5
- **Anthropic**: Claude models (Opus, Sonnet, Haiku)
- **Ollama**: Local models (Llama 3.1, Mistral, CodeLlama, etc.) - **FREE & PRIVATE!**
- **Custom**: Self-hosted or other compatible APIs

> 💡 **New to LLMs?** Check out [LLM_PROVIDER_GUIDE.md](LLM_PROVIDER_GUIDE.md) for detailed setup instructions for each provider.

## 🔒 Security & Ethics

### ⚠️ Legal and Ethical Use

**DO:**
- ✅ Use on systems you own
- ✅ Use with explicit written authorization
- ✅ Use for educational purposes in controlled environments
- ✅ Use for authorized penetration testing engagements
- ✅ Report vulnerabilities responsibly

**DON'T:**
- ❌ Test systems without authorization - This is illegal!
- ❌ Cause damage or disruption
- ❌ Exploit found vulnerabilities maliciously
- ❌ Share or publish sensitive findings without permission
- ❌ Use for any illegal activities

### Safety Measures

1. **Run in Docker**: Isolates the agent from your host system
2. **Network Isolation**: Use separate network for testing
3. **Authorized Scope**: Only test systems you have permission for
4. **Data Protection**: Protect any credentials/data discovered

## 🎓 Graduation Project Usage

This project was created as a graduation project focused on AI-powered cybersecurity. It demonstrates:

1. **AI Agent Architecture**: Autonomous reasoning and tool use
2. **LLM Integration**: Using large language models for security tasks
3. **Cybersecurity Automation**: Automated vulnerability assessment
4. **Memory Systems**: Vector databases for knowledge retention
5. **Docker Containerization**: Reproducible security testing environments

### Academic Use

For academic presentations:
- The architecture demonstrates agentic AI systems
- Shows practical application of LLMs in cybersecurity
- Illustrates RAG (Retrieval Augmented Generation) with memory system
- Demonstrates tool use and function calling
- Shows ethical AI deployment considerations

## 📖 Examples

See [EXAMPLES.md](EXAMPLES.md) for detailed usage scenarios and walkthroughs.

## 🤝 Contributing

This is a graduation project, but improvements are welcome:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for educational purposes. Use responsibly and legally.

## 🙏 Acknowledgments

- Built upon [Agent Zero](https://github.com/agent0ai/agent-zero) framework
- Powered by Kali Linux and its comprehensive security tools
- LLM integration via LiteLLM

## ⚡ Troubleshooting

**"API Key Error":**
- Check your `.env` file has valid `API_KEY`
- Verify your LLM provider is correctly set

**"Tool not found":**
- Ensure running in Docker with Kali Linux
- Or install missing tools: `apt-get install <tool>`

**"Permission denied":**
- Docker containers run as root by default
- For local install, may need sudo for some tools

**"No module named 'X'":**
- Install Python deps: `pip3 install -r requirements.txt`

## 📞 Support

For issues and questions:
- Check the documentation
- Review example usage in EXAMPLES.md
- Check Agent Zero documentation for framework details

---

**Remember: With great power comes great responsibility. Use HackrAct ethically and legally!** 🛡️
