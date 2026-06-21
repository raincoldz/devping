const fs = require('fs');
const os = require('os');
const path = require('path');

const BUILTIN_PROFILES = {
  claude: {
    title: 'Claude Code',
    message: 'Claude Code needs your attention',
    sound: 'Funk'
  },
  codex: {
    title: 'Codex',
    message: 'Codex needs your attention',
    sound: 'Funk'
  },
  cursor: {
    title: 'Cursor',
    message: 'Cursor needs your attention',
    sound: 'Funk'
  },
  default: {
    title: 'devping',
    message: 'Your agent needs attention',
    sound: 'Funk'
  }
};

function expandHome(value) {
  if (typeof value !== 'string') return value;
  if (value === '~') return os.homedir();
  if (value.startsWith('~/')) return path.join(os.homedir(), value.slice(2));
  return value;
}

function normalizeProfile(profile) {
  const next = { ...profile };
  if (next.icon) next.icon = path.resolve(expandHome(next.icon));
  return next;
}

function readUserProfiles(filePath = path.join(os.homedir(), '.devping', 'profiles.json')) {
  if (!fs.existsSync(filePath)) return {};

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON object keyed by profile name.`);
  }

  return Object.fromEntries(
    Object.entries(parsed).map(([name, profile]) => {
      if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
        throw new Error(`Profile "${name}" in ${filePath} must be a JSON object.`);
      }
      return [name, normalizeProfile(profile)];
    })
  );
}

function loadProfiles() {
  const userProfiles = readUserProfiles();
  const merged = { ...BUILTIN_PROFILES };

  for (const [name, profile] of Object.entries(userProfiles)) {
    merged[name] = {
      ...(merged[name] || {}),
      ...profile
    };
  }

  return merged;
}

function getProfile(name = 'default') {
  const profiles = loadProfiles();
  return profiles[name] || profiles.default;
}

module.exports = {
  BUILTIN_PROFILES,
  getProfile,
  loadProfiles,
  readUserProfiles
};
