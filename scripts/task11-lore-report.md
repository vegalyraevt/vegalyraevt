# Task 11: Lore archive terminal

Branch: `review/lore-task11`.
Exact parent/base: `3f4376e92b806e40eb57a506ba6a9586d93f1fb8`.
The delivery SHA is the commit containing this report, supplied in the handoff.

## Outcome

`/lore/` is a fictional local recovery console headed **ARCHIVE OFFLINE**, with
the requested restoration explanation and **ETA: UNKNOWN**. There is no Coming
Soon heading, real restoration promise, countdown, live archive, or AI connection.

Available commands: `help`, `status`, `whoami`, `ls`, `cat 001`, `reconnect`,
`signal`, `clear`, and the unlisted `vega` Easter egg. Commands and cached records
are defined in the exported `ARCHIVE` data structure, separately from rendering.
Responses use only the supplied generic fiction and an anonymous operator note;
no unannounced characters, private identities, credentials, or development plans
were added.

The terminal remains dark in both site themes. It uses system monospace fonts,
static color accents, a labeled input, a keyboard-scrollable polite live log,
and a separate announcement for clearing output. It does not autofocus. Without
JavaScript, the static outage introduction and homepage link remain visible and
the nonfunctional command form stays hidden.

Only a footer Lore link was added. The approved Watch & Listen header and other
destinations are unchanged. Input is rendered with `textContent`; dispatch is an
own-property whitelist. There is no eval, file access, network call, storage,
analytics, dependency, or backend in the new module. The transient log is bounded
to 40 entries and input to 160 characters.

## Files changed

- `lore.md`: route, static archive introduction, accessible terminal markup.
- `assets/js/lore-terminal.js`: command data, dispatch, safe transient output.
- `assets/css/style.scss`: styles scoped to `.lore-terminal`.
- `_layouts/default.html`: footer link with current-page indication.
- `scripts/release-browser-qa.cjs`: 12-route inventory and terminal regression checks.
- `scripts/release-static-qa.cjs`: 12-route inventory and worktree-compatible Git check.
- `scripts/task10-release-report.md`: link to these new results; original evidence retained.
- `scripts/task11-lore-report.md`: this handoff.
- `scripts/qa/task11/results.json`: new machine-readable verification evidence.
- `scripts/qa/task11/*.png`: three representative browser screenshots.

## Verification performed

Production Jekyll build: **passed**, using `JEKYLL_ENV=production` and the existing
Jekyll Docker environment. Output: local `artifacts/task10-lore-build`.

Real-browser run: Microsoft Edge **155.0.4283.45**, automated with the existing
local Playwright and axe tools; no new website dependencies were installed.

- **96/96 responsive/theme cases**: 12 routes at 1440, 768, 390, and 320px in dark
  and light themes. All returned HTTP 200. No horizontal overflow, out-of-viewport
  elements, broken images, unrevealed sections, runtime errors, failed requests,
  or automated WCAG A/AA violations were recorded.
- **96 navigation checks**: header order/destinations, active states, footer links,
  Watch & Listen expansion, visible keyboard focus, nested Escape behavior,
  outside-click dismissal, and actual Music navigation passed.
- **8 terminal interaction cases**: all nine commands, normalized whitespace/case,
  hidden help entry, seven unknown/injection probes, exact safe echo, Enter,
  focus retention, Tab exit, clear announcement, and reload reset passed.
  No requests or storage changes occurred while commands were submitted.
- **24 no-JavaScript cases**: all 12 routes at desktop and 320px retained readable
  content and navigable links. Lore retained its outage introduction and fallback,
  with the command form hidden. ALIZARIN retained its email alternative.
- **12 reduced-motion cases**: all routes respected reduced-motion behavior.
  Lore had no active CSS animations, and `signal` still worked.
- **Additional 320px browser smoke test**: actual homepage footer-to-Lore and
  return-home links, no initial autofocus, blank-command no-op, pointer submission,
  and the 40-entry transcript limit after 43 commands passed.
- **Shared controls**: mobile menu, theme persistence, skip link, blocked-storage
  resilience, and 320x480 navigation with and without JavaScript passed.
- **Existing ALIZARIN tests: 15/15 passed**. Browser regressions also passed for
  mocked success and HTTP 400/429/500, required fields, serialization, retained
  answers, focus, and duplicate protection. No live application was submitted.
- **Static audit**: 12 routes, metadata/canonicals/sitemap, local links, referenced
  ARIA IDs, and legacy anchors passed. No token-pattern candidates were found.
  Four existing em dashes remain in the excluded README; none were added to lore.
- Desktop, tablet, and narrow-mobile screenshots were visually inspected. Header,
  text wrapping, input, terminal output, and footer remained readable. The log is
  deliberately scrollable; on narrow screens long records can be read by focusing
  and scrolling that region.

Automated accessibility scans still mark gradient-backed text and the decorative
Enter arrow as needing manual review. The new terminal's affected colors were
checked using WCAG relative luminance and the brightest possible gradient:
muted text **8.17:1**, cyan link **11.74:1**, and button/arrow on its hover background
**6.52:1**. Existing site-wide incomplete findings remain recorded, not converted
into unsupported passes. Actual screen-reader speech, physical touch devices,
Safari, and Firefox were not tested.

## Screenshots and evidence

- [Desktop, dark theme, recovered record](qa/task11/desktop_dark_record.png)
- [320px mobile, light site theme, recovered record](qa/task11/mobile_light_record.png)
- [320px mobile, JavaScript disabled](qa/task11/mobile_no_javascript.png)
- [Detailed browser/static/contrast results](qa/task11/results.json)

Screenshots were captured from the tested production build, not mockups. Previous
Task 10 evidence remains untouched. The screenshot workflow selected these three
representative states instead of adding all 96 captures to the repository.

## Branch and release boundaries

Work was isolated in a separate Git worktree to preserve unrelated local assets
and the existing preview checkout. No merge or deployment was performed. The
ALIZARIN Engine repository was not modified.

The requested base predates `ee6c8c6aaf7786522a6f97f9eeef56bbed944370` (homepage
copy cleanup) and remote main `4d1ab42f6b295cdb917449dc55f3b6a103664748` (release
merge). This branch intentionally contains only Task 11 changes on the exact
requested base. Any future authorized integration must retain main's later copy
cleanup; do not replace main with this branch or force-push it. The divergent
local main was not used as a comparison or merge target.

No known Task 11 functional blockers remain. Owner design/content review is next.
Previously outstanding external-destination and Formspree dashboard checks are
unchanged; this task does not claim to resolve them or verify production delivery.

## Reproduction

From this branch's worktree, build Jekyll in production mode into
`artifacts/task10-lore-build`, then run:

```powershell
$env:QA_SITE_DIR = 'artifacts/task10-lore-build'
$env:QA_TOOLS_ROOT = '<existing local playwright/axe node_modules directory>'
node scripts/release-static-qa.cjs
node --test scripts/test-alizarin-beta-form.cjs
node scripts/release-browser-qa.cjs lore-final
```

The browser script serves the build locally on port 4173, supports `QA_BROWSER`
for the browser executable, and mocks Formspree rather than sending applications.
