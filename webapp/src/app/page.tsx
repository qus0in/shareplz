"use client";

import { CreateRoomForm } from "@/components/CreateRoomForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <CreateRoomForm />

      <footer className="mt-8 text-zinc-600 text-[10px] font-mono tracking-tighter uppercase flex items-center gap-4">
        <a
          href="https://github.com/qus0in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-zinc-500 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <span className="hidden xs:inline">@qus0in</span>
        </a>
        <a
          href="https://x.com/qus0in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-zinc-500 transition-colors"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-2.5 h-2.5 fill-current">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
          </svg>
          <span className="hidden xs:inline">@qus0in</span>
        </a>
      </footer>
    </main>
  );
}
