const vscode = require('vscode');

const PARTS = [
  { key: 'sidebar', label: 'Side Bar', toggle: 'autoHide.toggleSidebar', close: 'workbench.action.closeSidebar' },
  { key: 'panel', label: 'Panel', toggle: 'autoHide.togglePanel', close: 'workbench.action.closePanel' },
  { key: 'aux', label: 'Secondary Side Bar', toggle: 'autoHide.toggleAux', close: 'workbench.action.closeAuxiliaryBar' },
];

let timer;

function cancelHide() {
  clearTimeout(timer);
  timer = undefined;
}

function activate(context) {
  const isPinned = (part) => context.globalState.get(`pinned.${part.key}`, true);

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
      })
    );
  });

  const scheduleHide = () => {
    const unpinned = PARTS.filter((p) => !isPinned(p));
    if (!unpinned.length) return;
    cancelHide();
    const delay = Math.max(0, vscode.workspace.getConfiguration('autoHide').get('delay', 1000));
    timer = setTimeout(() => {
      timer = undefined;
      // Re-check pin state in case the user pinned during the delay.
      unpinned.filter((p) => !isPinned(p)).forEach((p) => vscode.commands.executeCommand(p.close));
    }, delay);
  };

  const userKinds = [vscode.TextEditorSelectionChangeKind.Mouse, vscode.TextEditorSelectionChangeKind.Keyboard];

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      if (userKinds.includes(e.kind)) scheduleHide();
    }),
    vscode.window.onDidChangeActiveTerminal(cancelHide),
    vscode.window.onDidChangeTerminalState(cancelHide),
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
