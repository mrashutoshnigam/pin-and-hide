const vscode = require('vscode');

const PARTS = [
  { key: 'sidebar', label: 'Side Bar', toggle: 'autoHide.toggleSidebar', close: 'workbench.action.closeSidebar' },
  { key: 'panel', label: 'Panel', toggle: 'autoHide.togglePanel', close: 'workbench.action.closePanel' },
  { key: 'aux', label: 'Secondary Side Bar', toggle: 'autoHide.toggleAux', close: 'workbench.action.closeAuxiliaryBar' },
];

let timer;
const pending = new Set();

function cancelHide() {
  clearTimeout(timer);
  timer = undefined;
  pending.clear();
}

function activate(context) {
  const isPinned = (part) => context.globalState.get(`pinned.${part.key}`, true);

  const scheduleHide = (parts = PARTS) => {
    parts.filter((p) => !isPinned(p)).forEach((p) => pending.add(p));
    // Don't restart a pending hide, otherwise continuous typing postpones it indefinitely.
    if (!pending.size || timer) return;
    const delay = Math.max(0, vscode.workspace.getConfiguration('autoHide').get('delay', 300));
    timer = setTimeout(() => {
      timer = undefined;
      // Re-check pin state in case the user pinned during the delay.
      [...pending].filter((p) => !isPinned(p)).forEach((p) => vscode.commands.executeCommand(p.close));
      pending.clear();
    }, delay);
  };

  PARTS.forEach((part, i) => {
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100 - i);
    item.command = part.toggle;
    const render = () => {
      const pinned = isPinned(part);
      item.text = `$(${pinned ? 'pinned' : 'pin'}) ${part.label}`;
      item.tooltip = `${part.label} is ${pinned ? 'pinned' : 'auto-hidden'}. Click to ${pinned ? 'unpin' : 'pin'}.`;
    };
    render();
    item.show();

    context.subscriptions.push(
      item,
      vscode.commands.registerCommand(part.toggle, async () => {
        await context.globalState.update(`pinned.${part.key}`, !isPinned(part));
        render();
        // Like Visual Studio: unpinning collapses the part straight away (after the delay).
        scheduleHide([part]);
      })
    );
  });

  const userKinds = [vscode.TextEditorSelectionChangeKind.Mouse, vscode.TextEditorSelectionChangeKind.Keyboard];
  const notPanel = PARTS.filter((p) => p.key !== 'panel');
  // Scrolls caused by Search/Explorer/Go-to navigation must not count as "user is in the editor".
  let lastProgrammaticChange = 0;

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      if (userKinds.includes(e.kind)) scheduleHide();
      else lastProgrammaticChange = Date.now();
    }),
    vscode.window.onDidChangeTextEditorVisibleRanges(() => {
      if (Date.now() - lastProgrammaticChange > 500) scheduleHide();
    }),
    vscode.window.onDidChangeActiveTextEditor(() => {
      lastProgrammaticChange = Date.now();
    }),
    // Working in the terminal means the side bars lost focus; the panel hosting the terminal stays.
    vscode.window.onDidChangeActiveTerminal(() => scheduleHide(notPanel)),
    vscode.window.onDidChangeTerminalState(() => scheduleHide(notPanel)),
    vscode.window.onDidChangeWindowState((s) => {
      if (!s.focused) cancelHide();
    }),
    { dispose: cancelHide }
  );
}

function deactivate() {
  cancelHide();
}

module.exports = { activate, deactivate };
