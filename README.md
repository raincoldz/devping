# devping

[English](README.md) | [简体中文](README.zh-CN.md)

> macOS notifications for terminal-based AI agents.

[![npm version](https://img.shields.io/npm/v/devping.svg)](https://www.npmjs.com/package/devping)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`devping` is a lightweight macOS CLI utility that delivers native desktop notifications for terminal-based AI coding agents, including Codex, Claude Code, Cursor, and custom integrations. It can skip notifications when iTerm2 is frontmost and the originating tab is already active, and clicking a notification can return you to the tab that triggered it.

`devping` is an independent project and is not affiliated with OpenAI, Anthropic, Cursor, iTerm2, or terminal-notifier.

## Features

- **Native macOS notifications** - powered by `terminal-notifier`
- **Built-in agent profiles** - preconfigured for Codex, Claude Code, Cursor, with a generic `default` profile for custom agents
- **Smart tab awareness** - suppress notifications only when iTerm2 is frontmost and the triggering tab is already active
- **Click-to-return** - click any notification to jump back to the originating iTerm2 tab
- **Customizable profiles** - override sounds, titles, icons, and default messages via `~/.devping/profiles.json`

## Requirements

- macOS
- Node.js >= 18
- `terminal-notifier` (install via `brew install terminal-notifier`)
- iTerm2 (recommended - required for tab-awareness and click-to-return features)

Install `terminal-notifier`:

```sh
brew install terminal-notifier
```

## Install

```sh
npm install -g devping
```

Verify:

```sh
devping --version
```

## Usage

When your AI agent pauses and needs your input - for example, when Codex requests permission to run a command - `devping` sends a macOS notification so you know immediately, even if you have switched to another app.

Basic usage:

```sh
devping --profile codex --message "Action required"
```

Force a notification even when iTerm2 is frontmost and the current tab is active:

```sh
devping --profile codex --message "Action required" --force
```

Disable sound for one notification:

```sh
devping --profile codex --message "Task finished" --sound none
```

List profiles:

```sh
devping --list-profiles
```

## Configure Profiles

Create:

```txt
~/.devping/profiles.json
```

Example:

```json
{
  "codex": {
    "title": "Codex",
    "sound": "Funk",
    "icon": "~/.devping/icons/codex.png"
  },
  "claude": {
    "title": "Claude Code",
    "sound": "Funk",
    "icon": "~/.devping/icons/claude.png"
  }
}
```

Supported fields:

- `title`: notification title
- `sound`: macOS sound name
- `icon`: optional local PNG shown as the notification content image

User profile fields are merged over the built-in profile with the same name.

## Codex Hook

Add hooks to `~/.codex/config.toml`.

If `devping` is not on the hook `PATH`, replace `devping` with the absolute path printed by `which devping`.

For English notifications:

```toml
[[hooks.PermissionRequest]]
matcher = "*"

[[hooks.PermissionRequest.hooks]]
type = "command"
command = "devping --profile codex --message 'Action required'"
timeout = 3
statusMessage = "Sending notification"

[[hooks.Stop]]

[[hooks.Stop.hooks]]
type = "command"
command = "devping --profile codex --message 'Task finished'"
timeout = 3
statusMessage = "Sending notification"
```

Codex may ask you to review and trust hooks with `/hooks`.

## Claude Code Integration

You can invoke `devping` directly from Claude Code hooks. Add a configuration like this to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "devping --profile claude --message 'Permission required'"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "devping --profile claude --message 'Task finished'"
          }
        ]
      }
    ]
  }
}
```

If `devping` is not on the Claude Code hook `PATH`, replace `devping` with the absolute path printed by `which devping`.

## Known Limitations

**Permissions**

- The first notification may require macOS notification permission approval.
- Click-to-return requires iTerm2 and macOS Automation permission.

**Path requirements**

- Click-to-tab assumes the installed `devping` path does not contain spaces.

**Dependencies**

- Notification images are optional and must be configured by the user.
- `terminal-notifier` is an external dependency and is not bundled with this package.

## Contributing

PRs and issues are welcome.

## Releases

See [GitHub Releases](https://github.com/raincoldz/devping/releases).

## Acknowledgments

`devping` uses [`terminal-notifier`](https://github.com/julienXX/terminal-notifier) to deliver native macOS notifications.

## License

MIT
