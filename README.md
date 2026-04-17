# Prototype Profit

Standalone Podium JS prototypes per project. Elke submap bevat een zelfstandig draaibare mockup.

## Prototypes

| Project | Omschrijving | |
|---|---|---|
| [rpt00692](rpt00692/) | Periodetoekenning omzet | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/AFASResearch/prototype-profit?devcontainer_path=.devcontainer/rpt00692/devcontainer.json) |
| [rpt00701](rpt00701/) | Abonnementsprijzen | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/AFASResearch/prototype-profit?devcontainer_path=.devcontainer/rpt00701/devcontainer.json) |
| [rfi00731](rfi00731/) | Inhoudingsplicht België | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/AFASResearch/prototype-profit?devcontainer_path=.devcontainer/rfi00731/devcontainer.json) |

## Quick Start

### Lokaal

```bash
cd <project-prefix>
npm install
npm start
```

Open [http://localhost:5000](http://localhost:5000) in je browser.

### GitHub Codespaces

Klik op de **Open in GitHub Codespaces**-knop bij een project hierboven, of open een project-README en klik daar op de knop. De Codespace installeert dependencies en start de backend automatisch.

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Publishing a prototype

Vanuit de `projecten` workspace:

```bash
npm run publish:prototype -- <project-prefix>
```

Dit genereert de projectmap, README met Codespace-knop, en devcontainer config.

This creates/updates the project folder in this repo with all necessary files.
