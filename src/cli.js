const { activateItermTabByTty } = require('./iterm');
const { sendNotification } = require('./notify');
const { getProfile, loadProfiles } = require('./profiles');
const { getFrontmostAppName, getIterm2ActiveTty, getMyTty } = require('./tty');
const { version } = require('../package.json');
const fs = require('fs');

function logActivation(message) {
  if (!process.env.DEVPING_DEBUG) return;
  try {
    fs.appendFileSync('/tmp/devping-activate.log', `${new Date().toISOString()} ${message}\n`);
  } catch {
    // Activation callbacks run detached from a terminal; logging is best effort.
  }
}

function usage() {
  return `Usage:
  devping [--profile name] [--message text] [--sound name] [--force]
  devping --activate --tty /dev/ttys000
  devping --list-profiles
  devping --version

Options:
  --profile <name>     Profile name. Defaults to "default".
  --message <text>     Notification message.
  --sound <name>       macOS sound name. Use "none" to disable.
  --force              Notify even when iTerm2 is frontmost and the originating tab is active.
  --activate           Activation callback used by notification clicks.
  --tty <tty>          Target TTY for activation callback.
  --print-command      Print the activation command instead of notifying.
  --list-profiles      Print available profiles.
  --version            Print the installed version.
  -h, --help           Show help.
`;
}

function parseArgs(argv) {
  const options = {
    profile: 'default',
    force: false,
    activate: false,
    listProfiles: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`${arg} requires a value.`);
      return argv[i];
    };

    if (arg === '--profile') options.profile = next();
    else if (arg.startsWith('--profile=')) options.profile = arg.slice('--profile='.length);
    else if (arg === '--message') options.message = next();
    else if (arg.startsWith('--message=')) options.message = arg.slice('--message='.length);
    else if (arg === '--sound') options.sound = next();
    else if (arg.startsWith('--sound=')) options.sound = arg.slice('--sound='.length);
    else if (arg === '--force') options.force = true;
    else if (arg === '--activate') options.activate = true;
    else if (arg === '--tty') options.tty = next();
    else if (arg.startsWith('--tty=')) options.tty = arg.slice('--tty='.length);
    else if (arg === '--print-command') options.printCommand = true;
    else if (arg === '--list-profiles') options.listProfiles = true;
    else if (arg === '--version') options.version = true;
    else if (arg === '-h' || arg === '--help') options.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (options.sound === 'none' || options.sound === 'false' || options.sound === 'off') {
    options.sound = false;
  }

  return options;
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.help) {
    process.stdout.write(usage());
    return;
  }

  if (options.version) {
    process.stdout.write(`${version}\n`);
    return;
  }

  if (options.listProfiles) {
    const profiles = loadProfiles();
    for (const [name, profile] of Object.entries(profiles)) {
      process.stdout.write(`${name}\t${profile.title || ''}\t${profile.icon || ''}\n`);
    }
    return;
  }

  if (options.activate) {
    logActivation(`start tty=${options.tty || ''}`);
    try {
      const result = activateItermTabByTty(options.tty);
      logActivation(`result=${result}`);
      if (result !== 'activated') process.stderr.write(`devping: ${result}\n`);
    } catch (error) {
      logActivation(`error=${error && error.message ? error.message : String(error)}`);
      throw error;
    }
    return;
  }

  const profile = getProfile(options.profile);
  let tty = null;
  try {
    tty = getMyTty();
  } catch {
    tty = null;
  }

  let active = false;
  let frontmostApp = null;
  if (!options.force) {
    try {
      frontmostApp = getFrontmostAppName();
      if (frontmostApp === 'iTerm2') {
        if (tty) {
          const activeTty = getIterm2ActiveTty();
          active = Boolean(activeTty && tty === activeTty);
        } else {
          // Codex hooks may not have a readable TTY. If iTerm2 is foreground,
          // prefer suppressing a possibly spurious alert over notifying in use.
          active = true;
        }
      }
    } catch {
      active = false;
    }
  }

  if (active) {
    return;
  }

  if (options.printCommand) {
    const { buildActivationCommand } = require('./notify');
    const command = buildActivationCommand(tty, process.env.ITERM_SESSION_ID);
    if (command) process.stdout.write(`${command}\n`);
    return;
  }

  sendNotification({
    profile,
    message: options.message,
    sound: options.sound,
    tty,
    itermSessionId: process.env.ITERM_SESSION_ID
  });
}

module.exports = {
  main,
  parseArgs,
  usage
};
