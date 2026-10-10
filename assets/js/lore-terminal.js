// Fictional archive content and command definitions. No network or storage access.
export const ARCHIVE = {
  records: {
    '001': {
      title: 'RECOVERED FRAGMENT',
      text: "An unfamiliar signal repeated long after its source went dark.\n\nThe final transmission contained only one sentence:\n\nIt knows we're listening."
    }
  },
  commands: {
    help: { description: 'List local commands.' },
    status: { description: 'Read local diagnostics.', text: 'Remote archive: OFFLINE\nLocal terminal: OPERATIONAL\nRestoration: PENDING\nETA: UNKNOWN' },
    whoami: { description: 'Check observer identification.', text: 'Observer identification failed.\n\nYou are not the first to reach this terminal.' },
    ls: { description: 'List cached and inaccessible entries.', text: '001  recovered_fragment.txt  [CACHED / READABLE]\n002  encrypted_entry        [INACCESSIBLE]\n003  encrypted_entry        [INACCESSIBLE]\n---  archive_index          [UNAVAILABLE]' },
    'cat 001': { description: 'Read cached record 001.', record: '001' },
    reconnect: { description: 'Run the local reconnection diagnostic.', text: 'Attempting connection...\nNo response from archive host.\nRestoration sequence pending.\nUnexpected packet received.\nPacket origin: UNKNOWN.', tone: 'warning' },
    signal: { description: 'Inspect the last received transmission.', text: 'UPLINK: OFFLINE\n\nDo not answer a transmission that knows your name.', tone: 'signal' },
    clear: { description: 'Clear local terminal output.', clear: true },
    vega: { hidden: true, text: 'Operator note:\nIf the archive starts asking questions, close the channel.', tone: 'signal' }
  }
};

export function resolveCommand(value) {
  const command = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!command) return null;
  if (!Object.prototype.hasOwnProperty.call(ARCHIVE.commands, command)) {
    return { text: 'Unknown command. Type help for locally available commands.', tone: 'warning' };
  }
  const entry = ARCHIVE.commands[command];
  if (command === 'help') {
    return { text: 'LOCAL COMMANDS\n\n' + Object.entries(ARCHIVE.commands)
      .filter(([, item]) => !item.hidden)
      .map(([name, item]) => name.padEnd(12) + item.description).join('\n') };
  }
  if (entry.record) {
    const record = ARCHIVE.records[entry.record];
    return { text: 'RECORD ' + entry.record + ' / ' + record.title + '\n\n' + record.text };
  }
  return entry;
}

const form = document.getElementById('lore-command-form');
if (form) {
  const input = document.getElementById('lore-command');
  const output = document.getElementById('lore-output');
  const announcement = document.getElementById('lore-announcement');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value.slice(0, 160).trim();
    const response = resolveCommand(value);
    if (!response) return;
    input.value = '';
    announcement.textContent = '';
    if (response.clear) {
      output.replaceChildren();
      requestAnimationFrame(() => { announcement.textContent = 'Terminal output cleared.'; });
    } else {
      const entry = document.createElement('div');
      entry.className = 'lore-entry';
      const prompt = document.createElement('p');
      prompt.className = 'lore-echo';
      prompt.textContent = '> ' + value;
      const text = document.createElement('pre');
      text.className = 'lore-response' + (response.tone ? ' lore-response-' + response.tone : '');
      text.textContent = response.text;
      entry.append(prompt, text);
      // Bound this transient transcript; no command history survives a reload.
      while (output.children.length >= 40) output.firstElementChild.remove();
      output.append(entry);
      output.scrollTop = output.scrollHeight;
    }
    // Keep typing after an intentional submission; never focus on initial load.
    input.focus({ preventScroll: true });
  });
  document.getElementById('lore-session').hidden = false;
  document.getElementById('lore-fallback').hidden = true;
}
