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

  // One compact status bar icon; full state lives in its tooltip and the picker.
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = 'autoHide.choosePinned';
  const renderItem = () => {
    const unpinned = PARTS.filter((p) => !isPinned(p));
    item.text = unpinned.length ? `$(pin) ${unpinned.length}` : '$(pinned)';
    item.tooltip = `Pin & Hide: ${PARTS.map((p) => `${p.label} ${isPinned(p) ? 'pinned' : 'auto-hidden'}`).join(', ')}. Click to choose.`;
  };
  item.show();

  const setPinned = async (part, pinned) => {
    await context.globalState.update(`pinned.${part.key}`, pinned);
    // Drives which pin icon the view title bar shows (see menus in package.json).
    vscode.commands.executeCommand('setContext', `autoHide.${part.key}Pinned`, pinned);
    renderItem();
    // Like Visual Studio: unpinning collapses the part straight away (after the delay).
    if (!pinned) scheduleHide([part]);
  };

  PARTS.forEach((part) => {
    vscode.commands.executeCommand('setContext', `autoHide.${part.key}Pinned`, isPinned(part));
    const suffix = part.toggle.replace('autoHide.toggle', '');
    context.subscriptions.push(
      vscode.commands.registerCommand(part.toggle, () => setPinned(part, !isPinned(part))),
      vscode.commands.registerCommand(`autoHide.pin${suffix}`, () => setPinned(part, true)),
      vscode.commands.registerCommand(`autoHide.unpin${suffix}`, () => setPinned(part, false))
    );
  });
  renderItem();

  context.subscriptions.push(
    item,
    vscode.commands.registerCommand('autoHide.choosePinned', async () => {
      const picked = await vscode.window.showQuickPick(
        PARTS.map((p) => ({ label: p.label, part: p, picked: isPinned(p) })),
        { canPickMany: true, title: 'Pin & Hide', placeHolder: 'Checked parts stay pinned; unchecked parts auto-hide' }
      );
      if (!picked) return;
      for (const p of PARTS) {
        const pinned = picked.some((x) => x.part === p);
        if (pinned !== isPinned(p)) await setPinned(p, pinned);
      }
    })
  );

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
