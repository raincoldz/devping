const { execFileSync } = require('child_process');

function normalizeTty(tty) {
  if (!tty) return null;
  const value = String(tty).trim();
  if (!value || value === '?' || value === '??') return null;
  return value.startsWith('/dev/') ? value : `/dev/${value}`;
}

function run(command, args) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();
}

function getMyTty() {
  const ppid = String(process.ppid);
  return normalizeTty(run('ps', ['-o', 'tty=', '-p', ppid]));
}

function getIterm2ActiveTty() {
  const script = `
    tell application "System Events"
      if not (exists process "iTerm2") then return ""
    end tell
    tell application "iTerm2"
      if (count of windows) is 0 then return ""
      return tty of current session of current tab of current window
    end tell
  `;

  return normalizeTty(run('osascript', ['-e', script]));
}

function getFrontmostAppName() {
  const script = `
    tell application "System Events"
      return name of first process whose frontmost is true
    end tell
  `;

  return run('osascript', ['-e', script]);
}

function isIterm2Frontmost(frontmostAppName = getFrontmostAppName()) {
  return frontmostAppName === 'iTerm2';
}

function isActiveTab(myTty = getMyTty(), activeTty, frontmostAppName) {
  const resolvedFrontmostAppName = frontmostAppName || getFrontmostAppName();
  if (!isIterm2Frontmost(resolvedFrontmostAppName)) return false;

  const resolvedActiveTty = activeTty || getIterm2ActiveTty();
  return Boolean(myTty && resolvedActiveTty && myTty === resolvedActiveTty);
}

module.exports = {
  getFrontmostAppName,
  getIterm2ActiveTty,
  getMyTty,
  isIterm2Frontmost,
  isActiveTab,
  normalizeTty
};
