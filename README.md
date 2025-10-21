<div align="center">

# 🚀 XTINA 3.0
## AI Crew Commander Suite

*Orchestrate 22 Specialized AI Agents with ASTRA Command Interface*

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)

</div>

---

## 🌟 Overview

**XTINA** (eXtended Team Intelligence & Neural Automation) is a next-generation AI crew management platform featuring:

- **🤖 22 Specialized AI Agents** - From code experts to legal advisors
- **🎯 Intelligent Task Orchestration** - ASTRA commander delegates tasks optimally
- **💬 Real-time Collaboration** - WebSocket-powered team communication
- **🎨 Stunning Cyberpunk UI** - Glassmorphism design with animated backgrounds
- **🔄 Multi-Model Support** - Gemini, GPT-4, Claude, Local LLMs
- **🎤 Voice Integration** - ElevenLabs TTS with avatar lip-sync
- **📁 Smart Knowledge Base** - Upload files for agent context
- **⚡ Blazing Fast** - Vite-powered React + TypeScript

---

## 🎭 Meet Your AI Crew

<table>
<tr>
<td><strong>Renee</strong> - Lead Orchestrator</td>
<td><strong>Alpha</strong> - Senior Software Engineer</td>
<td><strong>Beta</strong> - UX/UI Specialist</td>
</tr>
<tr>
<td><strong>Gamma</strong> - Data Scientist</td>
<td><strong>Delta</strong> - Security Expert</td>
<td><strong>Epsilon</strong> - DevOps Engineer</td>
</tr>
<tr>
<td><strong>Zeta</strong> - Finance Analyst</td>
<td><strong>Eta</strong> - Research Lead</td>
<td><strong>Theta</strong> - Creative Director</td>
</tr>
<tr>
<td><strong>Iota</strong> - Video Producer</td>
<td><strong>Kappa</strong> - Web Developer</td>
<td><strong>Lambda</strong> - AI/ML Specialist</td>
</tr>
<tr>
<td><strong>Mu</strong> - Database Admin</td>
<td><strong>Nu</strong> - QA Engineer</td>
<td><strong>Xi</strong> - Documentation Writer</td>
</tr>
<tr>
<td><strong>Omicron</strong> - Product Manager</td>
<td><strong>Pi</strong> - Marketing Strategist</td>
<td><strong>Rho</strong> - Research Scientist</td>
</tr>
<tr>
<td><strong>Sigma</strong> - Mathematician</td>
<td><strong>Tau</strong> - Corporate Lawyer</td>
<td><strong>Upsilon</strong> - IP Attorney</td>
</tr>
<tr>
<td><strong>Phi</strong> - Automation Specialist</td>
<td><strong>Omega</strong> - Self-Improvement AI</td>
<td></td>
</tr>
</table>

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Google Gemini API Key** (FREE - [Get it here](https://makersuite.google.com/app/apikey))

### 1. Clone & Install

```bash
git clone https://github.com/lindenchris206/Xtina.git
cd Xtina
npm install
```

### 2. Configure API Keys

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
nano .env
```

**Required:**
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Optional (for premium features):**
```env
ELEVENLABS_API_KEY=your_elevenlabs_key  # Text-to-speech
OPENAI_API_KEY=your_openai_key          # GPT models
```

### 3. Start Development

```bash
# Start both frontend and backend
npm run dev
```

**Access Points:**
- 🌐 Frontend: [http://localhost:3000](http://localhost:3000)
- 🔌 Backend API: [http://localhost:3001](http://localhost:3001)

---

## 📦 Project Structure

```
Xtina/
├── components/               # React UI components
│   ├── Header.tsx           # Top navigation bar
│   ├── LeftSidebar.tsx      # Conversations & Crew Roster
│   ├── RightSidebar.tsx     # Knowledge Base
│   ├── ChatWindow.tsx       # Main chat interface
│   ├── Composer.tsx         # Message input
│   ├── Avatar.tsx           # 3D avatar viewer
│   ├── AgentEditorModal.tsx # Edit agent specialties
│   ├── CommandPalette.tsx   # Cmd+K quick actions
│   ├── AnimatedBackground.tsx # Particle effects
│   └── ErrorBoundary.tsx    # Error handling
│
├── backend/
│   ├── server.js            # Express + Socket.io server
│   ├── orchestrator.js      # AI task orchestrator
│   └── agentsRegistry.json  # Agent configurations
│
├── hooks/
│   └── useChat.ts           # Chat state management
│
├── services/
│   └── geminiService.ts     # Gemini API integration
│
├── data/
│   ├── agents.ts            # Agent definitions
│   └── aiEngines.ts         # Available AI models
│
├── docs/                    # Comprehensive documentation
├── types.ts                 # TypeScript interfaces
├── App.tsx                  # Main application
└── index.tsx                # Entry point
```

---

## 🎯 Features

### Core Capabilities

✅ **Multi-Agent Orchestration**
- Assign tasks to specialized agents
- Automatic expert selection by ASTRA
- Parallel task execution

✅ **Council Mode**
- Get opinions from multiple agents
- Use `/council` command in chat
- Collaborative decision-making

✅ **Knowledge Base**
- Upload PDFs, docs, images
- Per-agent knowledge bundles
- Context-aware responses

✅ **Real-time Collaboration**
- WebSocket updates
- Live agent status
- Streaming responses

✅ **Workflow Canvas**
- Visual task dependencies
- Progress tracking
- Real-time updates

✅ **Voice Synthesis** (Optional)
- ElevenLabs integration
- Avatar lip-sync animation
- Multiple voice options

### Advanced Features

🔧 **Multi-Model Support**
- Google Gemini (gemini-2.5-pro, gemini-2.5-flash)
- OpenAI GPT-4
- Anthropic Claude
- Local LLMs (LM Studio, Ollama)

🎨 **Customizable Themes**
- Commander (Cyan/Blue)
- Hacker (Green/Matrix)
- Nebula (Purple/Pink)

⌨️ **Command Palette**
- Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
- Quick navigation
- Theme switching
- Task shortcuts

📁 **File Management**
- Upload knowledge files
- Associate with agents
- Multi-format support

---

## 🛠️ npm Scripts

```bash
# Development
npm run dev              # Start frontend + backend
npm run dev:frontend     # Start Vite dev server only
npm run dev:backend      # Start Node.js backend only

# Production
npm run build            # Build for production
npm run preview          # Preview production build
npm start                # Run production server

# Utilities
npm run lint             # Run ESLint
npm run type-check       # TypeScript validation
```

---

## 🌐 API Endpoints

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents` | Get all agents |
| `POST` | `/api/agents/:name/engine` | Update agent's AI engine |
| `POST` | `/api/agents/:name/specialties` | Update agent specialties |
| `POST` | `/api/agents/:name/knowledge` | Upload knowledge file |
| `POST` | `/api/tasks` | Create new task |
| `POST` | `/api/speak` | Text-to-speech (requires ElevenLabs) |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `agents` | Server → Client | Broadcast agent list |
| `tasks` | Server → Client | Broadcast task list |
| `agent-update` | Server → Client | Single agent update |
| `task-update` | Server → Client | Task progress update |
| `council-agent-response` | Server → Client | Council responses |
| `log` | Server → Client | System logs |

---

## 🎨 Theming

Customize the look in `index.css`:

```css
:root {
  --color-bg: #0A0E1A;           /* Background */
  --color-primary: rgb(0, 164, 255);    /* Cyan accent */
  --color-secondary: rgb(255, 199, 0);  /* Yellow accent */
  --color-text: rgb(224, 224, 224);     /* Light gray */
}
```

Or use the **Command Palette** (`Cmd+K`) to switch themes:
- Commander (Default)
- Hacker (Green)
- Nebula (Purple)

---

## 🔐 Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.env`** - It's in `.gitignore` for a reason
2. **Rotate API keys regularly** - Especially in production
3. **Use environment variables** - Never hardcode secrets
4. **Validate user inputs** - Backend validates all requests
5. **CORS configuration** - Adjust `CORS_ORIGINS` for production

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` folder

### Deploy Options

**Vercel** (Recommended for frontend)
```bash
npm install -g vercel
vercel --prod
```

**Heroku** (For full-stack)
```bash
heroku create xtina-ai-crew
git push heroku main
```

**Docker**
```bash
docker build -t xtina .
docker run -p 3000:3000 -p 3001:3001 xtina
```

---

## 📚 Documentation

Comprehensive guides in `/docs`:

- **[START_HERE.md](./docs/START_HERE.md)** - Project overview
- **[QUICK_START.md](./docs/QUICK_START.md)** - 5-minute setup
- **[CAPABILITIES.md](./docs/CAPABILITIES.md)** - Feature breakdown
- **[AI_ENGINE_SETUP.md](./docs/AI_ENGINE_SETUP.md)** - Configure AI models
- **[CODE_REVIEW.md](./docs/CODE_REVIEW.md)** - Architecture deep dive
- **[20_IMPROVEMENTS.md](./docs/20_IMPROVEMENTS.md)** - Future enhancements

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## 🐛 Troubleshooting

### "API key not found" error
- Ensure `VITE_GEMINI_API_KEY` is set in `.env`
- Restart the dev server after changing `.env`

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
VITE_PORT=3002
```

### WebSocket connection issues
- Check `CORS_ORIGINS` in `.env`
- Verify backend is running on port 3001

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - AI model API
- **ElevenLabs** - Voice synthesis
- **React Three Fiber** - 3D avatars
- **Socket.io** - Real-time communication
- **Vite** - Lightning-fast build tool

---

## 📞 Support

- 💬 **Issues**: [GitHub Issues](https://github.com/lindenchris206/Xtina/issues)
- 📧 **Email**: support@xtina.ai
- 🌐 **Website**: [xtina.ai](https://xtina.ai)

---

<div align="center">

**Made with ❤️ by the XTINA Team**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/lindenchris206/Xtina/issues) · [Request Feature](https://github.com/lindenchris206/Xtina/issues) · [Documentation](./docs)

</div>
