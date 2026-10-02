const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const desktopDirectory = path.join(os.homedir(), '.local', 'share', 'applications');
const desktopFile = path.join(desktopDirectory, 'aura-docs-desktop.desktop');
const iconPath = path.join(projectRoot, 'src', 'imgs', 'docs.png');
const electronPath = require('electron');

function quoteExecArgument(value) {
  return `"${value.replace(/([\\"`$])/g, '\\$1').replace(/%/g, '%%')}"`;
}

const entry = [
  '[Desktop Entry]',
  'Version=1.0',
  'Type=Application',
  'Name=Aura Docs',
  'Comment=Gestisci i documenti, collabora con il tuo team, sincronizza automaticamente e condividi i file tramite link: tutto integrato in Aura Docs, collegato al tuo account Aura. 🩷',
  `Exec=${quoteExecArgument(electronPath)} ${quoteExecArgument(projectRoot)}`,
  `Icon=${iconPath}`,
  'Terminal=false',
  'Categories=Office;',
  'StartupNotify=true',
  'StartupWMClass=aura-docs-desktop',
  ''
].join('\n');

fs.mkdirSync(desktopDirectory, { recursive: true });
fs.writeFileSync(desktopFile, entry, { mode: 0o644 });
console.log(`Launcher installato: ${desktopFile}`);
