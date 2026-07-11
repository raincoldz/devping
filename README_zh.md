# devping

[English](README.md) | [简体中文](README_zh.md)

> 为终端里的 AI Agent 提供 macOS 原生通知。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`devping` 是一个轻量级 macOS CLI 工具，用于为终端里的 AI 编程 Agent 发送原生桌面通知，适用于 Codex、Claude Code、Cursor 以及自定义集成。它只会在 iTerm2 是前台应用且触发通知的标签页就是当前标签页时自动跳过通知，也可以在点击通知后回到触发它的 iTerm2 标签页。

`devping` 是一个独立项目，与 OpenAI、Anthropic、Cursor、iTerm2 或 terminal-notifier 没有关联。

## 功能特性

- **macOS 原生通知** - 基于 `terminal-notifier`
- **内置 Agent 配置** - 预置 Codex、Claude Code、Cursor，并提供通用的 `default` 配置用于自定义 Agent
- **智能标签页感知** - 只有 iTerm2 是前台应用且触发通知的标签页已经是当前标签页时，才自动抑制通知
- **点击返回终端** - 点击通知即可跳回触发通知的 iTerm2 标签页
- **可自定义配置** - 通过 `~/.devping/profiles.json` 覆盖声音、标题、图标和默认消息

## 环境要求

- macOS
- Node.js >= 18
- `terminal-notifier`（通过 `brew install terminal-notifier` 安装）
- iTerm2（推荐使用；标签页感知和点击返回功能依赖 iTerm2）

安装 `terminal-notifier`：

```sh
brew install terminal-notifier
```

## 从源码安装

```sh
git clone https://github.com/raincoldz/devping.git
cd devping
npm link
```

验证安装：

```sh
devping --version
```

## 使用方法

当你的 AI Agent 暂停并需要你处理时，例如 Codex 请求授权执行命令，`devping` 会发送 macOS 通知。即使你已经切换到其他应用，也能及时知道终端里有任务需要关注。

基础用法：

```sh
devping --profile codex --message "Action required"
```

即使 iTerm2 是前台应用且当前标签页处于活跃状态，也强制发送通知：

```sh
devping --profile codex --message "Action required" --force
```

单次通知禁用声音：

```sh
devping --profile codex --message "Task finished" --sound none
```

列出可用配置：

```sh
devping --list-profiles
```

## 配置 Profiles

创建：

```txt
~/.devping/profiles.json
```

示例：

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

支持字段：

- `title`：通知标题
- `sound`：macOS 声音名称
- `icon`：可选的本地 PNG 图片，会显示为通知内容图

用户配置会覆盖同名内置 profile 中的字段。

## Codex Hook

将 hook 添加到 `~/.codex/config.toml`。

如果 hook 的 `PATH` 中找不到 `devping`，请将示例中的 `devping` 替换为 `which devping` 输出的绝对路径。

英文通知示例：

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

Codex 可能会要求你通过 `/hooks` 审查并信任 hook。

## Claude Code 集成

你可以在 Claude Code hooks 中直接调用 `devping`。将类似下面的配置添加到 `~/.claude/settings.json`：

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

如果 Claude Code hook 的 `PATH` 中找不到 `devping`，请将示例中的 `devping` 替换为 `which devping` 输出的绝对路径。

## 已知限制

**权限**

- 第一次发送通知时，macOS 可能会要求你授予通知权限。
- 点击返回功能需要 iTerm2，并且需要 macOS Automation 权限。

**路径要求**

- 点击返回标签页功能假设已安装的 `devping` 路径中不包含空格。

**依赖**

- 通知图片是可选项，需要用户自行配置。
- `terminal-notifier` 是外部依赖，不会随此项目一起打包。

## 贡献

欢迎提交 PR 和 issue。

## 致谢

`devping` 使用 [`terminal-notifier`](https://github.com/julienXX/terminal-notifier) 发送 macOS 原生通知。

## 许可证

MIT
