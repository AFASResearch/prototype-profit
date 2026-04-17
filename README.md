# Prototype Profit

Standalone Podium JS prototypes per project. Elke submap bevat een zelfstandig draaibare mockup.

## Prototypes

| Project | Omschrijving | Demo |
|---|---|---|
| [rpt00692](rpt00692/) | Periodetoekenning omzet | [Open demo](https://afasresearch.github.io/prototype-profit/rpt00692/) |
| [rpt00701](rpt00701/) | Abonnementsprijzen | [Open demo](https://afasresearch.github.io/prototype-profit/rpt00701/) |
| [rfi00731](rfi00731/) | Inhoudingsplicht België | [Open demo](https://afasresearch.github.io/prototype-profit/rfi00731/) |

## Quick Start

### Online

Klik op een **Open demo**-link hierboven. De mockup draait direct in je browser, geen installatie nodig.

### Lokaal

```bash
cd <project-prefix>
npm install
npm start
```

Open [http://localhost:5000](http://localhost:5000) in je browser.

## Requirements (lokaal)

- [Node.js](https://nodejs.org/) 18+
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Publishing a prototype

Vanuit de `projecten` workspace:

```bash
npm run publish:prototype -- <project-prefix>
```

Dit genereert de projectmap, README met Gitpod-knop, en devcontainer config.
