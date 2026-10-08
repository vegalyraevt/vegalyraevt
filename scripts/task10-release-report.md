# Task 10: integration review and release recommendation

Review date: 2026-10-08. Branch: review/site-release-task10.
Starting commit: fd19abd671a80baee79a7f61a87a4dcc8217978d.
The final commit is the commit containing this report; its SHA is supplied in the handoff.

## Verdict

Ready for owner review, NOT authorized for production. Required integration fixes and genuine browser QA are complete. No merge, production push, deployment, DNS change, publishing-setting change, or automatic merge was performed.

Before launch, the owner must explicitly approve release and resolve the navigation choice below. Formspree dashboard confirmation remains outstanding. The production form smoke test must occur only after a separately authorized deployment.

## Repository state and exact changes

Task 09 was 14 commits ahead and zero behind origin/main; the sequential Tasks 01-09 were present. No earlier branch was independently cherry-picked or merged.

Remote main/rollback reference: e76878dda4e4cbc7ba7d37481777e3d46cc00992.
Local main is separately at 4c40143c41bfa6f03b79604e4aa4a9a69c6aeac2. Both were left unchanged; their discrepancy was reported, not reconciled.

Required source changes:

- .gitignore: ignore bounded local Task 10 tools/output.
- _config.yml: exclude QA artifacts and build manifests from published output.
- _layouts/default.html: storage-safe theme initialization/toggling, focusable skip target, Escape menu closing and focus restoration, nested-link closing, progressive reveal initialization.
- assets/css/style.scss: readable light-theme primary buttons and purple labels; reveal content and mobile navigation remain available without JavaScript; preserve reduced motion.
- index.md: measured profile/wordmark dimensions and restored legacy #cast anchor alias.
- stream-assets.md: remove an em dash from the page title; preserve approved credits.

Review-only files, excluded from the site:

- scripts/release-browser-qa.cjs
- scripts/release-static-qa.cjs
- scripts/release-external-qa.cjs
- scripts/task10-release-report.md
- scripts/qa/task10/browser-results.json
- scripts/qa/task10/external-results.json
- scripts/qa/task10/home-desktop-light.png
- scripts/qa/task10/aurora-tablet-light.png
- scripts/qa/task10/aurora-mobile-dark.png
- scripts/qa/task10/beta-narrow-dark.png
- scripts/qa/task10/mobile-menu-light.png
- scripts/qa/task10/portfolio-narrow-light.png

Unrelated, untracked owner artwork/screenshots and older artifacts were preserved and not committed. ALIZARIN Engine repository remained clean and unmodified.

## Navigation proposal and approval status

Proposed compact header: Home, Projects, Experience, Watch & Listen, About, Contact. Watch & Listen would group Streaming, Music and live/social destinations. Footer would provide direct Aurora, ALIZARIN, Support and Credits links. Accessible grouping requires keyboard, Escape, expanded-state and no-JavaScript treatment.

Owner approval was requested but has not been received. This substantial restructuring was NOT implemented. Current header remains Home, Projects, Experience, About, Live & social, Contact, with Credits in the mobile menu. Music/Streaming are discoverable through homepage/About links; Aurora/ALIZARIN through homepage/Projects. Current primary page indicators are retained. Choosing to keep the present navigation is also a valid owner decision.

## Route and regression audit

All 11 routes generated and were actually rendered in Edge:

- /: links-first homepage and cross-page CTAs; legacy #cast restored.
- /aurora/: character, lore, game status cards, music and engineering.
- /projects/: all historical project destinations retained.
- /alizarin/: experimental beta application, email alternative and rights boundaries.
- /streaming/: horror, games, D&D and public destinations.
- /about/: personal background and CVM creative umbrella.
- /portfolio/: professional experience and technical work.
- /contact/: partnerships, collaborations and public business email.
- /music/: originals, covers and audio workflow.
- /support/: community support.
- /stream-assets/: creative credits and licensing notes.

Generated internal href/src targets, duplicate IDs, ARIA references, image alt attributes, mailto destinations and metadata passed the static audit. All seven origin/main page routes and their explicit legacy IDs remain. The requested Projects/Aurora/ALIZARIN/About/Contact anchors resolve. No redirects or established URL structures were removed.

Production Jekyll build passed, using github-pages Jekyll 3.10 in the existing Docker environment (image jekyll/jekyll:4.2.2), with JEKYLL_ENV=production; isolated output completed in 4.864 seconds. Preview/build outputs were separated after an earlier shared-output race. JavaScript syntax check passed. Existing ALIZARIN regression suite: 15 passed, zero failed.

## Genuine browser QA and evidence

Independent Playwright launched installed Microsoft Edge 154.0.4258.62 successfully. This is the working alternative to earlier computer-use runtime failures. No manual GUI session, Safari/Firefox test, or Lighthouse audit is claimed.

Final responsive matrix: 11 routes x widths 1440, 768, 390, 320 x dark/light = 88 distinct rendered cases. Full matrix and interaction evidence: [browser results](qa/task10/browser-results.json).

Final cases passed HTTP/page rendering, loaded images, reveal visibility, geometry overflow, document-width overflow, JavaScript page errors and automated WCAG A/AA-tag checks. Theme switching/persistence, skip link focus and applicable mobile-menu open/Escape-close were exercised for every case. No third-party request failures were recorded in the sweep.

Evidence provenance: an earlier interrupted baseline was not counted as completed QA. The first completed sweep detected a missed homepage desktop-dark reveal caused by the scrolling harness. That case was rerun by genuinely scrolling to missed sections, not forcing visibility, and rescanned successfully. The final matrix replaces only that case with the explicit rerun. Original raw runs remain local. Smooth scrolling is disabled only during test traversal so lazy media and observers are actually visited.

Rendered screenshot inspection covered desktop homepage, tablet hero/game cards, mobile music/lore, narrow form and technical portfolio. The lore moon did not cover content; tablet statuses remained readable; the music thumbnail retained its aspect ratio; the narrow form and professional headings wrapped without sideways scrolling.

Representative genuine, unresized viewport screenshots:

- [Desktop homepage, light](qa/task10/home-desktop-light.png)
- [Tablet Aurora games, light](qa/task10/aurora-tablet-light.png)
- [Mobile Aurora music, dark](qa/task10/aurora-mobile-dark.png)
- [320px beta form, dark, authorized localhost](qa/task10/beta-narrow-dark.png)
- [Mobile menu, light](qa/task10/mobile-menu-light.png)
- [320px portfolio, light](qa/task10/portfolio-narrow-light.png)

## Accessibility

Automated axe scans detected zero violations across the final matrix. Axe reported incomplete aria-prohibited-attr/color-contrast checks on some image/decorative content; these are not represented as automated passes. Representative rendered contrast/legibility was inspected. This is practical QA, not certification or comprehensive screen-reader testing.

Actual keyboard checks passed: Space opens the menu, Tab reaches every primary link with a visible outline, Escape closes the menu and returns focus, skip links focus main, theme focus is visible, and the entire Aurora/Music video cards are keyboard focusable with the correct supplied destination. Form keyboard submission, validation and confirmation focus passed with provider responses explicitly mocked.

No-JavaScript: all 11 routes at 1440/320 (22 checks) retain text and reachable navigation. ALIZARIN hides the nonfunctioning form and offers email. Reduced motion: all 11 routes were tested at 390px; scrolling is auto and reveal transforms/opacity do not hide content. Denied Storage access was tested: theme and menu still operate without page errors.

Not performed: assistive-technology reading-order testing, every external link's keyboard activation, broad device/browser coverage or exhaustive motion perception review. Game statuses are informational cards, not falsely advertised playable buttons.

## ALIZARIN form verification, clearly separated

- Browser submission and on-page confirmation: owner previously confirmed a real localhost success. Current browser regression also passed with mocked Formspree/Google responses; no new real application was sent.
- Formspree acceptance: earlier owner-confirmed success/notification supports receipt; this task's mocked responses do not prove current live acceptance.
- Dashboard visibility: UNVERIFIED; owner was asked to confirm Submissions.
- Notification email: owner supplied evidence of delivery to contact@vegalyrae.tech in the prior task. No new delivery was tested.
- Fields: prior owner screenshot showed all application fields; current browser checked every named field and multiple-choice serialization.
- CAPTCHA: owner confirmed v3 and provided authorized-domain settings for vegalyrae.tech and localhost. A real Google badge loaded normally on localhost without an error. 127.0.0.1 is a different hostname and produced a domain warning; do not use it to validate the production key. No new real token acceptance or secret/dashboard configuration was verified.
- Regression coverage: required/group/email/acknowledgement validation, pending/duplicate prevention, retained answers, ordinary 400/429/500 without inappropriate fallback, acknowledged success, honeypot, unavailable/rejected/empty CAPTCHA and compatibility-only native fallback. CAPTCHA/honeypot rejection cases are covered by the 15-test suite, not a live abuse test.
- Production-domain application: REQUIRED POST-DEPLOYMENT, with explicit owner permission; independently confirm browser confirmation, provider response, dashboard, receiving inbox and all fields.
- Manual application review/file distribution and accurate provider privacy wording remain unchanged. This endpoint is not reused for general contact.

## External destinations

Full URLs and classifications: [external audit](qa/task10/external-results.json). Anonymous real-browser rendering, not playback or authenticated access:

- Verified: Twitch profile; Shadow over Volstead collection; all three YouTube channels; Aurora covers destination; SoundCloud profile; GitHub profile; Discord LinkBot repository; ALIZARIN repository; 826michigan.
- Redirected to valid destinations: featured Looping video (YouTube) and Funky Computer (SoundCloud).
- Unverified/restricted: horror-reading VOD (generic Twitch page, title/content identity not confirmed); Other Covers playlist (video rendered, playlist identity not conclusively established); Ko-fi/profile and Chiptune product (403 challenge); Discord invite (redirected but validity not conclusively established); X (timeout).
- Unavailable: none established.

Owner should manually check the six unverified destinations. No supplied URL was replaced merely because anonymous automation was blocked. Contact email links resolve to the approved address; mailbox operation is supported by the prior notification, not by mailto inspection alone. Other secondary socials were not independently verified.

## Music, licensing and documentation reconciliation

Approved Looping artwork/video and both playlist URLs match site integration. Covers remain distinct from original compositions and reference publication credits, without claiming ownership of underlying songs. Chiptune Constellations retains Creative Commons Attribution without inventing a version; Funky Computer and Portentous Prevarication remain personal-use-only. Portentous has no invented listening link. No lyrics, new downloads, blanket voicebank permissions or new reuse license were introduced.

Website ALIZARIN wording distinguishes LGPLv3 framework, separately governed experimental voicebank and character assets, and preserves explicit caution about unclear external usage guidance. Beta application is not authorization or file delivery; capabilities remain experimental rather than overstated. CVM remains a creative umbrella, not a registered-company claim.

Read-only documentation review reference: review/alizarin-docs-04b1 at 50e09bfbb8a12e9476edc5e483fc1b4cbc2ff2da. Its 12 questions remain unresolved: adult-content exceptions; music credits/branding; training/conversion scope; framework versus addendum rights; simplified LGPL explanations; redistribution packaging; political/religious uses; fan works/community voices; enforcement certainty; broken section references; dependency-license inventory; readiness/roadmap claims.

These require creator decisions and appropriate licensing review BEFORE public beta distribution or future documentation publication. They do not automatically block an informational website retaining the cautions and distributing no unapproved files. No substantive license decision or external repository change was made.

## Privacy, security, SEO and performance

Token-pattern scan: zero candidate private credentials in tracked working text and 69 reachable commits at audit time. Public Formspree endpoint and CAPTCHA site key are intentional public configuration. The scan does not prove absence of every possible secret, inspect screenshots/OCR, or audit external services. Source/privacy review found no new private identity, location, education records, collaborator announcements or internal character plans in the Task 10 public diff.

No analytics, tracking additions, new public forms or unnecessary third-party scripts were introduced. Existing Google Fonts remain; reCAPTCHA is the only external script and loads only on ALIZARIN. QA npm tools and screenshots are excluded from publication. The secret previously shown in chat is not treated as proof of safe credential handling; no secret was requested, copied into this report or committed. Owner controls rotation/configuration decisions.

All 11 pages have one H1, titles, descriptions, production canonicals, sitemap entries and Jekyll social title output. Domain remains https://vegalyrae.tech. No production robots/DNS changes were made. Social preview images are not currently emitted; a non-blocking future improvement, not a claimed pass. Four em dashes remain only in excluded README.md; none found in rendered content/configuration.

Measured CSS: 106,416 bytes uncompressed, 16,562 bytes gzip. No tracked image exceeded 500 KB. The two homepage hero images now have measured dimensions. Ten social SVGs lack HTML dimension attributes but have fixed 20px CSS boxes. Images rendered without broken paths/aspect-ratio distortion in the sweep. Existing fonts use display=swap/preconnect. No Lighthouse score, field Web Vitals, quantified layout-shift result or cold-network performance guarantee is claimed. Unused legacy head include references a missing favicon, but the active layout does not render it; left untouched.

## Remaining issues and release sequence

Approval gates:

- Explicit owner authorization to publish, merge or deploy.
- Owner decision on proposed navigation versus keeping the current structure.
- Owner Formspree dashboard confirmation.

Required after separately approved deployment:

- Smoke-test all routes/navigation, canonicals/sitemap and mobile layouts on vegalyrae.tech.
- One explicitly authorized beta application; verify live provider result, user confirmation, dashboard, inbox and all fields independently.

Non-blocking limitations:

- Six external destinations need owner/manual validation; no dead link established.
- Social preview images, cross-browser/device coverage and full screen-reader audit remain future work.
- Axe incomplete items are not blanket accessibility approval.
- Twelve ALIZARIN licensing/doc decisions block future distribution/publication decisions, not automatically this cautious informational site.

Release flow: owner reviews this report/evidence; explicitly approves scope/navigation and production release; developer fetches and rechecks main/integration heads; if divergent, reports before reconciliation; performs an approved non-destructive merge without force-push; then carries out authorized production smoke testing. Opening a review PR would not authorize merging it.

Rollback reference: e76878dda4e4cbc7ba7d37481777e3d46cc00992 (checked origin/main). Reconfirm it before deployment. If release is merged with a merge commit, restore previous content through an owner-authorized git revert -m 1 of that exact merge commit. If fast-forwarded, identify the exact release commits and revert them in reverse order in a new rollback commit, accounting for any subsequent work. Do not reset or force-push main. No rollback was executed.

## Reproduction

Build with the existing preview Docker image and volumes, JEKYLL_ENV=production, destination artifacts/task10-build. Install QA-only playwright and axe-core under artifacts/task10-tools (no site runtime dependencies). Set QA_SITE_DIR=artifacts/task10-build and run node scripts/release-browser-qa.cjs; default isolated origin is authorized localhost:4173. Optional QA_ROUTES, QA_WIDTHS and QA_THEMES explicitly limit targeted reruns. Run node scripts/release-static-qa.cjs and node --test scripts/test-alizarin-beta-form.cjs. External audit intentionally performs read-only public browser visits.

Keep original failed/partial outputs local. Do not publish review evidence or claim mocked form responses as live delivery.
