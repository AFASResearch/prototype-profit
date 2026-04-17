# Prototype Profit

Standalone [Podium JS](https://github.com/nickvdyck/podium-js) prototypes per project. Each subfolder contains a self-contained mockup that can be run independently.

## Structure

```
prototype-profit/
  <project-prefix>/       # e.g. rpt00692, rpt00701, rfi00731
    pages/                # TypeScript page sources
    backend/              # .NET backend with mock API endpoints
    scripts/              # Backend process manager
    package.json          # npm dependencies & scripts
    tsconfig.json         # TypeScript config
    README.md             # Project-specific instructions
```

## Quick Start

```bash
cd <project-prefix>
npm install
npm start
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Publishing a prototype

From the `projecten` workspace:

```bash
npm run publish:prototype -- <project-prefix>
```

This creates/updates the project folder in this repo with all necessary files.
