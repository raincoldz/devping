const { execFileSync } = require('child_process');
const { normalizeTty } = require('./tty');

function appleScriptString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function runAppleScript(script) {
  return execFileSync('osascript', ['-e', script], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function activateItermTabByTty(tty) {
  const targetTty = normalizeTty(tty);
  if (!targetTty) throw new Error('Missing --tty for activation.');

  const script = `
    set targetTty to "${appleScriptString(targetTty)}"
    tell application "System Events"
      if not (exists process "iTerm2") then return "not-running"
    end tell
    tell application "iTerm2"
      repeat with w in windows
        repeat with t in tabs of w
          repeat with s in sessions of t
            if tty of s is targetTty then
              select t
              select s
              activate
              return "activated"
            end if
          end repeat
        end repeat
      end repeat
    end tell
    return "not-found"
  `;

  return runAppleScript(script);
}

module.exports = {
  activateItermTabByTty
};
