# MailPilot

MailPilot is a front-end prototype for an AI-assisted email management platform. It demonstrates how personal assistants and clients can triage conversations, understand who should respond, and coordinate follow-up in one workspace.

## Features

- Assistant and client workspace views
- Inbox segmentation, search, priority indicators, and conversation details
- Mock AI summaries, classification explanations, and reply drafting
- Connected-account and workspace settings screens
- Light and dark themes, with the selected theme saved locally
- Responsive layouts for smaller screens

## Requirements

- Node.js 22.12 or newer
- npm

## Run locally

From the project directory:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal (usually `http://localhost:5173`). Keep the terminal open while using the app. Press `Ctrl+C` to stop the development server.

## Production build

```powershell
npm run build
npm run preview
```

The build output is written to `dist`. The preview command prints a local URL where you can inspect the production build.

## Prototype limitations

This is a browser-only prototype. It uses sample email data and simulated AI responses; it does not connect to real email accounts or provide a backend, persistent user accounts, or live AI services. Most interaction state is held in the browser, and only the theme preference is saved in local storage.
