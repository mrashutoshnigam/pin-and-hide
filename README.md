# Auto Hide Panels

Visual Studio-style **pin / unpin auto-hide** for VS Code's Primary Side Bar, Panel and Secondary Side Bar.

## Usage

- Three status bar buttons show each part's state: `$(pinned)` means pinned (always visible) and `$(pin)` means unpinned (auto-hides). Click a button to toggle it.
- You can also run **Auto Hide: Toggle Pin: …** from the Command Palette.
- Unpinning a part collapses it straight away, after `autoHide.delay` ms (default `300`).
- An unpinned part also hides `autoHide.delay` ms after you click, type or scroll in the editor. The timer starts on the first interaction; continued activity does not postpone it.
- Switching to the terminal hides the unpinned side bars but leaves the Panel open, since the terminal lives there.
- Scrolling caused by navigation (opening a file, clicking a search result, Go to Definition) does not count as editor activity.
- Parts close instantly when the delay ends: VS Code's API has no way to animate a slide-out.
- A pending hide is cancelled if the VS Code window loses focus.
- Open a hidden part the usual way: the Activity Bar, `Ctrl+B` (Side Bar), `Ctrl+J` (Panel) or `Ctrl+Alt+B` (Secondary Side Bar).
- Every part starts pinned, and pin state is remembered between sessions.

## Settings

| Setting | Default | Description |
|---|---|---|
| `autoHide.delay` | `300` | Milliseconds to wait after unpinning or the first editor click/keystroke/scroll before hiding unpinned parts. |

## Limitation

VS Code extensions cannot read the mouse cursor position or which part has keyboard focus. Hiding is therefore triggered by editor or terminal activity, not by the cursor leaving a part. A click in the editor that doesn't move the caret (for example, on the exact spot where it already is) can't be detected.

## Run / package

- Press `F5` to open an Extension Development Host.
- To build an installable package: `npx @vscode/vsce package`, then **Extensions: Install from VSIX…**.
