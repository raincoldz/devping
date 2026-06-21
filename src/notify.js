const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function findTerminalNotifierApp() {
  const candidates = [
    '/Applications/terminal-notifier.app',
    '/opt/homebrew/opt/terminal-notifier/terminal-notifier.app',
    '/usr/local/opt/terminal-notifier/terminal-notifier.app'
  ];

  for (const candidate of candidates) {
    if (fileExists(candidate)) return candidate;
  }

  try {
    const commandPath = execFileSync('which', ['terminal-notifier'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    const realPath = fs.realpathSync(commandPath);
    const match = realPath.match(/^(.*?terminal-notifier[^/]*).*$/);
    const prefix = match ? match[1] : path.dirname(realPath);
    const appPath = path.join(prefix, 'terminal-notifier.app');
    if (fileExists(appPath)) return appPath;
  } catch {
    // Fall through to the clear install error below.
  }

  throw new Error('terminal-notifier.app not found. Install it with: brew install terminal-notifier');
}

function buildActivationCommand(tty) {
  const cliPath = path.resolve(__dirname, '..', 'bin', 'devping');
  return `${process.execPath} ${cliPath} --activate --tty ${tty}`;
}

function sendNotification({ profile, message, sound, tty }) {
  const appPath = findTerminalNotifierApp();
  const args = [
    '-a',
    appPath,
    '--args',
    '-title',
    profile.title || 'devping',
    '-message',
    message || profile.message || 'Your agent needs attention'
  ];

  const icon = profile.icon && path.resolve(profile.icon);
  if (icon && fileExists(icon)) {
    // contentImage is the right-side thumbnail. macOS keeps the sender app icon on the left.
    args.push('-contentImage', icon);
  }

  const resolvedSound = sound === false ? null : sound || profile.sound;
  if (resolvedSound) {
    args.push('-sound', resolvedSound);
  }

  if (tty) {
    args.push('-execute', buildActivationCommand(tty));
  }

  const child = spawn('open', args, {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
}

module.exports = {
  buildActivationCommand,
  findTerminalNotifierApp,
  sendNotification
};
