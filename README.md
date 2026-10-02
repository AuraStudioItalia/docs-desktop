# Aura Docs Desktop

Applicazione desktop Electron di Aura Docs.

## Requisiti

- Node.js 20 o superiore
- npm

## Avvio

```sh
npm install
npm start
```

La finestra carica `https://docs.aurastudioitalia.it`. I collegamenti esterni si aprono nel browser predefinito; la navigazione rimane nell'app.

## Build di distribuzione

Installa le dipendenze prima di creare i pacchetti:

```sh
npm install
```

Esegui il comando corrispondente alla piattaforma su cui stai lavorando:

| Piattaforma | Comando | Pacchetti prodotti |
| --- | --- | --- |
| Linux | `npm run dist:linux` | AppImage |
| Windows | `npm run dist:win` | Installer NSIS `.exe` |
| macOS | `npm run dist:mac` | `.dmg` e `.zip` |

I file generati vengono salvati in `dist/`.