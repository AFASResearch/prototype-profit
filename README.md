# Prototype Profit

Standalone Podium JS prototypes per project. Elke submap bevat een zelfstandig draaibare mockup.

## Prototypes

| Project | Omschrijving | |
|---|---|---|
| [rpt00692](rpt00692/) | Periodetoekenning omzet | [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/AFASResearch/prototype-profit/tree/master/rpt00692) |
| [rpt00701](rpt00701/) | Abonnementsprijzen | [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/AFASResearch/prototype-profit/tree/master/rpt00701) |
| [rfi00731](rfi00731/) | Inhoudingsplicht België | [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/AFASResearch/prototype-profit/tree/master/rfi00731) |

## Quick Start

### Lokaal

```bash
cd <project-prefix>
npm install
npm start
```

Open [http://localhost:5000](http://localhost:5000) in je browser.

### Gitpod

Klik op de **Open in Gitpod**-knop bij een project hierboven, of open een project-README en klik daar op de knop. Gitpod installeert dependencies en start de backend automatisch.

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Publishing a prototype

Vanuit de `projecten` workspace:

```bash
npm run publish:prototype -- <project-prefix>
```

Dit genereert de projectmap, README met Gitpod-knop, en devcontainer config.
