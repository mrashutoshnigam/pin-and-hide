# Pin & Hide

**Pin & Hide** brings Visual Studio's pin / auto-hide behavior to VS Code. Pin the parts you want to keep, and let the rest slide away when you start editing. More code, less chrome.

Works on the Primary Side Bar, Panel and Secondary Side Bar.

## Usage

- Each view's title bar has a pin button, like Visual Studio's tool windows: `$(pinned)` means pinned (always visible) and `$(pin)` means unpinned (auto-hides). Click it to toggle that part.
- The status bar shows one small pin icon: `$(pinned)` when everything is pinned, or `$(pin) N` when N parts auto-hide. Click it to open a multi-select list and tick the parts to keep pinned (unticked parts auto-hide). It also works while a part is hidden.
- You can also run **Pin & Hide: Choose Pinned Parts…** from the Command Palette.
- You can also run **Pin & Hide: Toggle Pin: …** from the Command Palette.
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

## Install

- In VS Code: open **Extensions** (`Ctrl+Shift+X`), search for **Pin & Hide**, and click **Install**.
- Or from the command line: `code --install-extension mrashutoshnigam.pin-and-hide`.

## Development

- Press `F5` to open an Extension Development Host running the extension from source.
- Build an installable package locally: `npm run package` (produces a `.vsix`), then **Extensions: Install from VSIX…**.
- To cut a release: run the **Release** workflow from the Actions tab (or `gh workflow run release.yml -f bump=patch`). It bumps the version, tags, publishes to the Marketplace and creates a GitHub Release. See [`.github/workflows/release.yml`](.github/workflows/release.yml).
