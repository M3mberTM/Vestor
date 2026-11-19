# Vestor

A simple Chrome extension for switching between tabs, inspired by **[Harpoon](https://github.com/ThePrimeagen/harpoon)** in **Neovim.**

The idea is simple!

Users can select tabs and add them to a list called the *harpoon*. They can then quickly navigate between these tabs using keyboard shortcuts.)

This makes it easier to work with frequently used tabs without having to search through all your open tabs.

One thing to understand is that you can navigate to the first 4 tabs you added into the harpoon only.
If you add more than 4 tabs into it, you can remove some of the previous tabs to be able to navigate
to the new ones.

### Features

- **Quick tab switching:** Jump directly to any of your four harpoon tabs using keyboard shortcuts.
- **Window independent:** Each Chrome window has its own independent harpoon.
- **Persistent storage:** Harpoon selections are saved, so they survive service worker restarts and browser sessions.
- **Keyboard-driven:** Add, remove, and switch between tabs without interacting with the mouse.

## Commands

| Shortcut | Functionality                                            |
| :------- | :------------------------------------------------------- |
| `Alt+A`  | Adds the current tab to the harpoon                      |
| `Alt+S`  | Removes the current tab from the harpoon                 |
| `Alt+Q`  | Displays debug information in the service worker console |

### Navigation shortcuts

The user needs to bind their preferred shortcuts for navigating to individual harpoon tabs through Chrome's extension settings.

| Command     | Functionality                      |
| :---------- | :--------------------------------- |
| `harpoon-1` | Switches to the first harpoon tab  |
| `harpoon-2` | Switches to the second harpoon tab |
| `harpoon-3` | Switches to the third harpoon tab  |
| `harpoon-4` | Switches to the fourth harpoon tab |

To configure these shortcuts, navigate to:

`chrome://extensions/shortcuts`

## Installation

1. Clone this repository.
2. Build the project (if applicable).
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extension's build directory.

## Development

Contributions, suggestions, and bug reports are welcome!