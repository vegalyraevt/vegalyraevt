---
layout: default
title: Constellation Archive | Lore
description: An interactive fictional archive terminal. The primary archive is offline, but a few cached fragments remain.
permalink: /lore/
---

<section class="lore-terminal" aria-labelledby="lore-title">
  <div class="lore-shell">
    <div class="lore-topline"><a href="{{ '/' | relative_url }}">&#8592; Return to homepage</a><span>LOCAL RECOVERY CONSOLE</span></div>
    <div class="lore-screen">
      <header class="lore-screen-header"><p>CONSTELLATION ARCHIVE</p><span><span class="lore-indicator" aria-hidden="true"></span> LOCAL SESSION</span></header>
      <div class="lore-intro">
        <p class="lore-connection">Connection established / local terminal</p>
        <h1 id="lore-title">ARCHIVE OFFLINE</h1>
        <p class="lore-explanation">Restoration protocols have been initiated. Service is expected to resume shortly.</p>
        <dl class="lore-diagnostics"><div><dt>Primary archive</dt><dd>OFFLINE</dd></div><div><dt>Local cache</dt><dd>PARTIAL</dd></div><div><dt>ETA</dt><dd>UNKNOWN</dd></div></dl>
        <p class="lore-warning"><span aria-hidden="true">[ ! ]</span> Incomplete records. Cached fragments may be missing context.</p>
      </div>
      <div class="lore-session" id="lore-session" hidden>
        <p class="lore-hint" id="lore-command-hint">Limited local commands available. Type <code>help</code> to begin.</p>
        <div class="lore-output" id="lore-output" role="log" aria-label="Archive command responses" aria-live="polite" aria-relevant="additions" aria-atomic="false" tabindex="0"><p class="lore-ready">Local diagnostic interface ready.</p></div>
        <form class="lore-command-form" id="lore-command-form" autocomplete="off">
          <label for="lore-command">Archive command</label>
          <div class="lore-prompt"><span aria-hidden="true">&gt;</span><input id="lore-command" name="command" type="text" maxlength="160" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="send" aria-describedby="lore-command-hint"><button type="submit">Enter <span aria-hidden="true">&#8629;</span></button></div>
        </form>
        <p class="sr-only" id="lore-announcement" role="status" aria-live="polite" aria-atomic="true"></p>
      </div>
      <p class="lore-fallback" id="lore-fallback">The archive is offline. Enable JavaScript to explore the locally cached fragments.</p>
      <div class="lore-screen-footer"><span>RECOVERY MODE</span><span>REMOTE ACCESS UNAVAILABLE</span></div>
    </div>
    <p class="lore-fiction">Interactive fiction. Commands affect only this page; nothing you type is sent or saved.</p>
  </div>
</section>
<script type="module" src="{{ '/assets/js/lore-terminal.js' | relative_url }}"></script>
