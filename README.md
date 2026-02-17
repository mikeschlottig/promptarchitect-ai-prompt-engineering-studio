# Cloudflare Workers AI Chat App

[![Deploy to Cloudflare][![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/promptarchitect-ai-prompt-engineering-studio)]

A production-ready, full-stack AI chat application powered by Cloudflare Workers and Agents. Features multi-session conversations, real-time streaming responses, tool calling (web search, weather, MCP integration), model switching (Gemini family), and a modern responsive UI.

## ✨ Key Features

- **Multi-Session Chat**: Persistent conversations with session management, titles, and activity tracking.
- **Streaming Responses**: Real-time message generation with low latency.
- **Tool Calling**: Built-in tools for weather, web search (SerpAPI), URL fetching, and extensible MCP (Model Context Protocol) integration.
- **Model Flexibility**: Switch between Gemini 2.5 Flash, Pro, etc., via Cloudflare AI Gateway.
- **Stateful Durable Objects**: Conversation state preserved across requests using Cloudflare Agents SDK.
- **Modern UI**: Responsive design with shadcn/ui, Tailwind CSS, dark mode, and smooth animations.
- **Session Management**: List, create, edit, delete sessions with auto-generated titles.
- **Error Handling & Logging**: Robust error boundaries, client error reporting, and observability.

## 🛠️ Technology Stack

### Frontend
- **React 18** + **Vite** (build tool)
- **TypeScript** (full type safety)
- **Tailwind CSS** + **shadcn/ui** (components)
- **React Query** (data fetching)
- **Zod** (validation), **Zustand** (state), **Sonner** (toasts)

### Backend
- **Cloudflare Workers** (serverless runtime)
- **Hono** (routing)
- **Cloudflare Agents SDK** (stateful agents)
- **Durable Objects** (persistent state)
- **OpenAI SDK** (compatible with Cloudflare AI Gateway)
- **MCP SDK** (tool extensions)

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (package manager)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (Cloudflare deployment)
- Cloudflare account with [Workers AI Gateway](https://developers.cloudflare.com/ai-gateway/) configured
- API keys: Cloudflare AI Gateway token, optional SerpAPI key for web search

### Installation
```bash
bun install
```

### Environment Setup
Create `.dev.vars` for local development:
```
CF_AI_BASE_URL=https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai
CF_AI_API_KEY={your_ai_gateway_token}
SERPAPI_KEY={optional_serpapi_key}
```

### Development
```bash
# Start dev server (frontend + worker)
bun dev

# Generate types from Wrangler
bun run cf-typegen
```

Open http://localhost:3000 (or your configured PORT).

### Production Build
```bash
bun build
```

## 📖 Usage

### Chat Interface
- Create new sessions via `/api/sessions` (auto-generates title from first message).
- Send messages: `POST /api/chat/{sessionId}/chat` (supports streaming).
- List sessions: `GET /api/sessions`.
- Update model: `POST /api/chat/{sessionId}/model`.
- Delete session: `DELETE /api/sessions/{sessionId}`.

### Tools
- **get_weather**: `{ location: "London" }`
- **web_search**: `{ query: "Cloudflare Workers" }` or `{ url: "https://example.com" }`
- MCP tools: Auto-discovered from configured servers (edit `worker/mcp-client.ts`).

### Custom Extensions
- Add routes in `worker/userRoutes.ts`.
- Extend tools in `worker/tools.ts`.
- Customize UI in `src/pages/HomePage.tsx` and components.

## ☁️ Deployment

Deploy to Cloudflare Workers with full SPA support and Durable Objects.

### Steps
1. Configure `wrangler.jsonc` vars/secrets:
   ```bash
   wrangler secret put CF_AI_API_KEY
   wrangler secret put SERPAPI_KEY  # Optional
   ```
2. Deploy:
   ```bash
   bun build
   wrangler deploy
   ```
3. Custom domain: `wrangler pages deploy` or Workers asset binding.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/promptarchitect-ai-prompt-engineering-studio)

### Production Vars
Update `wrangler.jsonc`:
```jsonc
"vars": {
  "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
  "CF_AI_API_KEY": "your-token"
}
```

## 🤝 Contributing

1. Fork and clone.
2. Install: `bun install`.
3. Develop: `bun dev`.
4. PR with clear description.

Report issues for bugs/features.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built on [Cloudflare Workers](https://workers.cloudflare.com), [Agents SDK](https://developers.cloudflare.com/agents/), [shadcn/ui](https://ui.shadcn.com), and open-source tools.