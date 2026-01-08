# SHAREPLZ

> **Secure, Real-time, Ephemeral Text Sharing**
>
> [https://shareplz-webapp.pages.dev](https://shareplz-webapp.pages.dev)

SHAREPLZ is a secure, real-time text sharing platform designed for developers who need a quick and safe way to share code snippets, logs, or sensitive information without leaving a permanent trace.

![Preview](/webapp/public/favicon.svg)

## Key Features

- **Real-time Synchronization**: Powered by Cloudflare Durable Objects and WebSockets for instant updates across all connected clients.
- **Granular Access Control**:
  - **Editor Role**: Requires a 6-digit PIN to modifying content.
  - **Viewer Role**: Can be open to everyone or protected by a separate read-only PIN.
- **Ephemeral & Secure**:
  - Content is stored in Cloudflare D1 with automatic backup.
  - No sign-up required. anonymous usage.
  - Session-based authentication.
- **Developer-Centric UI**:
  - Dark mode focused design.
  - Syntax highlighting for comments (`#`, `//`).
  - Automatic URL linking (clickable only in non-comment text).
  - One-click "Copy All" and "Share Link".
  - Terminal-inspired aesthetics.

## Technology Stack

### Frontend (Webapp)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Deployment**: Cloudflare Pages
- **State Management**: Custom Hooks (`useRoom`, `useAuth`)
- **Key Libraries**: `lucide-react`, `sonner` (Toast)

### Backend (Server)
- **Runtime**: Cloudflare Workers
- **Coordination**: Cloudflare Durable Objects (for WebSocket & State)
- **Database**: Cloudflare D1 (SQLite)
- **Language**: TypeScript

## Project Structure

This is a monorepo containing both the server and the web application.

```
shareplz/
├── server/       # Cloudflare Worker & Durable Object logic
│   ├── src/
│   └── wrangler.toml
└── webapp/       # Next.js Frontend
    ├── src/
    │   ├── app/      # App Router pages
    │   ├── components/
    │   ├── hooks/    # Custom logic
    │   └── lib/      # Utilities
    └── wrangler.toml
```

## How it Works

1.  **Room Creation**: Users create a room with optional edit/read PINs.
2.  **Connection**: The client connects to a specific Durable Object instance via WebSocket.
3.  **Sync**: Typing in the editor sends updates to the Durable Object, which broadcasts changes to all other connected clients immediately.
4.  **Persistence**: The Durable Object debounces updates and asynchronously saves the latest content to the D1 database for persistence.

## License

MIT License. Created by [@qus0in](https://github.com/qus0in).
