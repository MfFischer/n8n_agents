# n8n AI Agents Repository

🤖 **Collection of AI-powered automation projects using n8n workflows and modern tech stacks.**

## 📁 Projects

### 🏥 [MediLocal AI](./medilocal-complete/)
**Complete German Medical Clinic Automation System**

A comprehensive medical clinic management system with AI-powered workflows for German healthcare providers.

**Features:**
- 🤖 AI Medical Chat with Llama 3.2
- 📋 Patient Management Dashboard
- 📅 Intelligent Appointment Scheduling
- 🔄 n8n Workflow Automation
- 🐳 Docker Containerization
- 🌐 Multi-language Support (German/English)

**Tech Stack:**
- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: FastAPI + PostgreSQL + Redis
- AI: Ollama + Llama 3.2
- Automation: n8n workflows
- Infrastructure: Docker Compose

**Status:** ✅ Working (AI workflows functional, frontend styling in progress)

---

## 🚀 Quick Start

Each project includes its own README with detailed setup instructions. Generally:

1. **Clone the repository**
```bash
git clone https://github.com/MfFischer/n8n_agents.git
cd n8n_agents
```

2. **Navigate to a project**
```bash
cd medilocal-complete
```

3. **Follow project-specific setup**
```bash
docker-compose up -d
```

## 🛠️ Common Technologies

- **n8n**: Workflow automation platform
- **Docker**: Containerization and orchestration
- **AI Models**: Ollama, OpenAI, local LLMs
- **Databases**: PostgreSQL, Redis, SQLite
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Node.js, Python

## 📋 Project Structure

```
n8n_agents/
├── medilocal-complete/          # Medical clinic automation
│   ├── frontend/               # React TypeScript app
│   ├── backend/                # FastAPI server
│   ├── workflows/              # n8n workflow definitions
│   ├── docker-compose.yml     # Service orchestration
│   └── README.md              # Project documentation
├── [future-project]/           # Additional AI agent projects
└── README.md                  # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Conventional Commits

This repository uses conventional commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Examples:
- `feat(medilocal): add AI medical chat workflow`
- `fix(frontend): resolve Tailwind CSS processing issue`
- `docs: update installation instructions`
- `chore(docker): update container configurations`

## 🔒 License

This repository contains projects for educational and development purposes. Individual projects may have specific licensing requirements.

## 📞 Support

- 🐛 **Issues**: Create GitHub issues for bugs and feature requests
- 📖 **Documentation**: Check individual project READMEs
- 💬 **Discussions**: Use GitHub Discussions for questions

---

**⚠️ Disclaimer**: AI-powered medical and automation systems should be used responsibly and in compliance with relevant regulations and professional standards.
