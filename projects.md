---
title: Projects — Vega Lyrae
description: Selected work in embodied AI, ethical voice synthesis, interactive systems, and creative technology.
permalink: /projects/
---

<header class="page-hero section-shell" data-reveal>
  <p class="eyebrow">Project archive</p>
  <h1>Research through making.</h1>
  <p class="page-lede">These projects are working laboratories: places to test technical ideas, ethical commitments, and new forms of interaction. Status labels describe where the work is today—not where I hope it will be tomorrow.</p>
</header>

<nav class="project-jump section-shell" aria-label="Jump to a project" data-reveal>
  <span>Jump to</span>
  <a href="#aurora">Aurora</a><a href="#alizarin">ALIZARIN</a><a href="#doodle">Doodle Model</a><a href="#voice">Vocal Engine</a><a href="#game">Game Dev</a><a href="#smp">Minecraft SMP</a>
</nav>

<section class="project-case section-shell" id="aurora" data-reveal>
  <div class="case-number">01</div>
  <div class="case-main">
    <div class="case-meta"><span class="status-pill status-active">Active R&amp;D</span><span>AI systems · Streaming · Interaction</span></div>
    <h2>AuroraChan AI</h2>
    <p class="case-lede">A locally operated ecosystem of specialist models and services working together to create a persistent, semi-autonomous virtual performer.</p>
    <div class="case-visual case-visual-aurora"><img src="{{ '/assets/images/web/aurora-model.jpg' | relative_url }}" width="1440" height="810" loading="lazy" alt="AuroraChan's 3D avatar in a cyan-lit virtual environment"><img class="case-logo" src="{{ '/assets/images/AuroraLogo.png' | relative_url }}" alt="AuroraChan AI VTuber"></div>
    <div class="case-columns">
      <div><h3>The challenge</h3><p>A convincing interactive character requires more than a chatbot. Conversation, memory, expression, event handling, safety, timing, and creative decision-making must behave as one coherent system during a live broadcast.</p></div>
      <div><h3>What I’m building</h3><ul><li>Multiple coordinated language-model roles</li><li>Real-time chat and stream event integration</li><li>Custom datasets and controlled fine-tuning workflows</li><li>Dynamic memory and context management</li><li>Interfaces for voice, music, games, and future robotics</li></ul></div>
    </div>
    <div class="case-footer"><p><strong>Current focus</strong><br>Increasing reliability and autonomy while keeping operation local, observable, and interruptible.</p><ul class="tag-list"><li>Python</li><li>Local LLMs</li><li>Multi-agent systems</li><li>APIs</li></ul></div>
  </div>
</section>

<section class="project-case section-shell" id="alizarin" data-reveal>
  <div class="case-number">02</div>
  <div class="case-main">
    <div class="case-meta"><span class="status-pill status-open">Open source</span><span>Audio · Responsible AI · Synthesis</span></div>
    <h2>ALIZARIN Engine</h2>
    <p class="case-lede">An ethical framework for designing unique synthetic voices from first principles, without cloning or training on an existing human voice.</p>
    <div class="case-visual case-visual-alizarin"><img src="{{ '/assets/images/web/alizarin-feature.jpg' | relative_url }}" alt="ALIZARIN voice engine test artwork"></div>
    <div class="case-columns">
      <div><h3>The premise</h3><p>Powerful voice tools should not require an uncredited human performer hidden inside the dataset. ALIZARIN explores a “no human inside” approach inspired by fully synthetic characters such as Adachi Rei.</p></div>
      <div><h3>Design goals</h3><ul><li>Algorithmic and synthetic source generation</li><li>One consistent source for speech and singing workflows</li><li>Support for TTS, DiffSinger, and UTAU-style synthesis</li><li>A shared engine with room for distinct creator-owned voices</li><li>Transparent public development and documentation</li></ul></div>
    </div>
    <div class="case-footer"><p><strong>Current phase</strong><br>Foundation and data generation: building the core synthetic voice and its initial training pipeline.</p><div class="button-row"><a class="button button-small button-ghost" href="https://github.com/ALIZARINENGINE/AlizarinEngine">View repository ↗</a></div></div>
  </div>
</section>

<section class="project-case section-shell" id="doodle" data-reveal>
  <div class="case-number">03</div>
  <div class="case-main">
    <div class="case-meta"><span class="status-pill">Prototype</span><span>Machine learning · Community data</span></div>
    <h2>Aurora Community Doodle Model</h2>
    <p class="case-lede">A small drawing model trained entirely on community-made, opt-in doodles so Aurora can sketch ideas during a live stream.</p>
    <div class="case-columns">
      <div><h3>Why this approach</h3><p>The project tests whether a playful generative system can be useful without scraping artwork or obscuring consent. Every contributor knows what the data is for and chooses to participate.</p></div>
      <div><h3>System scope</h3><ul><li>100% volunteer-created dataset</li><li>Clear submission permissions and data handling</li><li>Stroke-by-stroke real-time drawing pipeline</li><li>Prompt integration for chat and stream events</li><li>Entertainment and community use—not paid generation</li></ul></div>
    </div>
    <div class="case-footer"><p><strong>Current phase</strong><br>Developing submission guidance, dataset tooling, and early shape-and-object prototypes.</p><ul class="tag-list"><li>ML</li><li>Data pipelines</li><li>Consent design</li></ul></div>
  </div>
</section>

<section class="project-collection section-shell section-block" data-reveal>
  <div class="section-heading"><p class="eyebrow">More experiments</p><h2>Creative systems in development.</h2></div>
  <div class="project-grid">
    <article class="project-card" id="voice">
      <div class="card-topline"><span class="project-index">04</span><span class="status-pill status-active">In development</span></div>
      <p class="card-kicker">Audio · Music systems</p><h3>Aurora Vocal Engine</h3>
      <p>A set of UTAU-based and neural audio workflows that let a human producer shape Aurora’s singing voice for original music, karaoke, and live events.</p>
      <p class="card-note"><strong>Important:</strong> This is a creator-directed production tool, not automated song generation.</p>
      <ul class="tag-list"><li>UTAU</li><li>Voice synthesis</li><li>Audio processing</li></ul>
    </article>
    <article class="project-card" id="game">
      <div class="card-topline"><span class="project-index">05</span><span class="status-pill">Early development</span></div>
      <p class="card-kicker">Godot · Game systems</p><h3>Indie Game Development</h3>
      <p>A 2.5D top-down horde game about a malfunctioning AI navigating a dying server environment, with progression systems and future stream integration.</p>
      <ul class="tag-list"><li>Godot</li><li>Game design</li><li>Interactive narrative</li></ul>
    </article>
    <article class="project-card">
      <div class="card-topline"><span class="project-index">06</span><span class="status-pill">Design phase</span></div>
      <p class="card-kicker">Streaming · Audience interaction</p><h3>VTuber Card Overlay</h3>
      <p>A stream-integrated collectible card system designed around optional viewer participation, channel-point pulls, and event-driven abilities.</p>
      <ul class="tag-list"><li>Twitch APIs</li><li>Overlays</li><li>Game systems</li></ul>
    </article>
    <article class="project-card" id="smp">
      <div class="card-topline"><span class="project-index">07</span><span class="status-pill">Planning</span></div>
      <p class="card-kicker">Minecraft · Agent integration</p><h3>Constellation SMP</h3>
      <p>A community Minecraft environment being reworked into separate modded and vanilla-plus spaces, including a sandbox for future Aurora integration.</p>
      <ul class="tag-list"><li>Mineflayer</li><li>Modding</li><li>Community systems</li></ul>
    </article>
  </div>
</section>

<section class="cta-panel section-shell" data-reveal>
  <div><p class="eyebrow">Interested in the process?</p><h2>I develop many of these systems live and document the work as it evolves.</h2></div>
  <div class="button-row"><a class="button button-light" href="https://twitch.tv/{{ site.social_links.twitch }}">Watch on Twitch ↗</a><a class="button button-outline-light" href="{{ '/contact/' | relative_url }}">Collaborate</a></div>
</section>
