Agentic workspace based on Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Overview

The current scaffold provides:

- an agent chat area in the upper section
- a free dynamic workspace below for generated web surfaces

## Development

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

## AI SDK DevTools

For local development, the project is wired to Vercel AI SDK DevTools. That lets you inspect local AI requests and responses while using the chat UI. Start the DevTools:

```bash
npx @ai-sdk/devtools
```

## Build

Create a production build:

```bash
npm run build
```
