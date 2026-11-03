# Auto Hide Panels

Visual Studio-style **pin / unpin auto-hide** for VS Code's Primary Side Bar, Panel and Secondary Side Bar.

## Usage

- Three status bar buttons show each part's state: `$(pinned)` means pinned (always visible) and `$(pin)` means unpinned (auto-hides). Click a button to toggle it.
- You can also run **Auto Hide: Toggle Pin: …** from the Command Palette.
- When a part is unpinned and you click or type in the editor, it closes after `autoHide.delay` ms (default `1000`). More editor activity restarts the timer.
- The pending hide is cancelled if you switch to a terminal or the VS Code window loses focus.
- Open a hidden part the usual way: the Activity Bar, `Ctrl+B` (Side Bar), `Ctrl+J` (Panel) or `Ctrl+Alt+B` (Secondary Side Bar).
- Every part starts pinned, and pin state is remembered between sessions.

## Settings

| Setting | Default | Description |
|---|---|---|
| `autoHide.delay` | `1000` | Milliseconds to wait after editor activity before hiding unpinned parts. |

## Limitation

VS Code extensions cannot read the mouse cursor position. Hiding is therefore triggered by editor activity, not by the cursor leaving a part.

## Run / package

- Press `F5` to open an Extension Development Host.
- To build an installable package: `npx @vscode/vsce package`, then **Extensions: Install from VSIX…**.
