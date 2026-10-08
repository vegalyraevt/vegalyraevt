// Real-browser release QA. Tools are local-only; this script never sends a live application.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const toolsRoot = process.env.QA_TOOLS_ROOT || path.resolve('artifacts/task10-tools/node_modules');
const { chromium } = require(path.join(toolsRoot, 'playwright'));
const axe = require(path.join(toolsRoot, 'axe-core'));
const http = require('node:http');
const routes = process.env.QA_ROUTES ? process.env.QA_ROUTES.split(',') : ['/', '/aurora/', '/projects/', '/alizarin/', '/streaming/', '/about/', '/portfolio/', '/contact/', '/music/', '/support/', '/stream-assets/'];
const widths = process.env.QA_WIDTHS ? process.env.QA_WIDTHS.split(',').map(Number) : [1440,768,390,320];
const themes = process.env.QA_THEMES ? process.env.QA_THEMES.split(',') : ['dark','light'];
const phase = process.argv[2] || 'audit';
const output = path.resolve('artifacts/task10-' + phase + '-' + Date.now());
const origin = process.env.QA_ORIGIN || (process.env.QA_SITE_DIR ? 'http://localhost:4173' : 'http://localhost:4000');
fs.mkdirSync(output, { recursive: true });
const result = { phase, origin, browser: '', output, layouts: [], interaction: [], noJavaScript: [], reducedMotion: [], form: [] };
let browser, server;
if (process.env.QA_SITE_DIR) {
  const site = path.resolve(process.env.QA_SITE_DIR);
  const types = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.xml':'application/xml' };
  server = http.createServer((req,res) => {
    try {
      let file = path.resolve(site, '.' + decodeURIComponent(new URL(req.url,origin).pathname));
      if (!file.startsWith(site + path.sep) && file !== site) { res.writeHead(403).end(); return; }
      if (fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
      res.writeHead(200,{ 'Content-Type':types[path.extname(file)] || 'application/octet-stream' });
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404).end(); }
  });
}
async function reveal(page) {
  await page.evaluate(async () => {
    // Smooth scrolling would cancel earlier steps before reaching lazy content.
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .8) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 150));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.waitForFunction(() => [...document.images].every(img => img.complete), { timeout: 10000 }).catch(() => {});
  // Loading media can move sections during traversal; visit any missed reveal
  // by real scrolling rather than changing observer state or forcing opacity.
  for (const section of await page.locator('[data-reveal]').all()) {
    if (await section.evaluate(el => getComputedStyle(el).opacity !== '1')) {
      await section.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(800);
    }
  }
  await page.evaluate(() => scrollTo(0,0));
}
async function formChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route('**/recaptcha/api.js*', route => route.fulfill({ contentType: 'application/javascript', body: 'window.grecaptcha={ready:f=>f(),execute:()=>Promise.resolve("QA_MOCK_TOKEN")};' }));
  let calls = 0, status = 400, received;
  await context.route('https://formspree.io/f/mjygyayp', async route => {
    calls++; received = route.request().postData();
    await new Promise(r => setTimeout(r, 250));
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status === 200 ? { ok: true } : { errors: [{ message: 'QA simulated rejection.' }] }) });
  });
  const page = await context.newPage();
  await page.goto(origin + '/alizarin/');
  await page.locator('#alizarin-beta-submit').click();
  assert.equal(calls, 0, 'empty form must not send');
  await page.locator('[name=applicant_name]').fill('QA TEST ONLY');
  await page.locator('[name=email]').fill('invalid');
  await page.locator('[name=intended_use]').fill('Synthetic browser test; no real application is sent.');
  await page.locator('[name=testing_interests]').first().check();
  await page.locator('[name=beta_acknowledgement]').check();
  await page.locator('#alizarin-beta-submit').click();
  assert.equal(calls, 0, 'invalid email must not send');
  await page.locator('[name=email]').fill('qa-test@example.invalid');
  await page.locator('[name=testing_interests]').first().uncheck();
  await page.locator('#alizarin-beta-submit').click();
  assert.equal(calls, 0, 'empty group must not send');
  assert.equal(await page.locator('#alizarin-testing-error').isVisible(), true);
  await page.locator('[name=testing_interests]').first().check();
  await page.locator('[name=testing_interests]').nth(3).check();
  await page.locator('[name=software]').first().check();
  await page.locator('[name=software]').nth(3).check();
  await page.locator('[name=beta_acknowledgement]').uncheck();
  await page.locator('#alizarin-beta-submit').click();
  assert.equal(calls, 0, 'unchecked acknowledgement must not send');
  await page.locator('[name=beta_acknowledgement]').check();
  await page.locator('[name=beta_acknowledgement]').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#alizarin-beta-submit').evaluate(el => el === document.activeElement), true);
  assert.notEqual(await page.locator('#alizarin-beta-submit').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(50);
  assert.equal(await page.locator('#alizarin-beta-submit').isDisabled(), true);
  await page.locator('#alizarin-beta-form').evaluate(form => { form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true })); });
  await page.locator('#alizarin-submit-error').waitFor({ state: 'visible' });
  assert.equal(calls, 1);
  assert.equal(await page.locator('[name=applicant_name]').inputValue(), 'QA TEST ONLY');
  assert.equal(await page.locator('#alizarin-native-fallback').isVisible(), false);
  for (const next of [429, 500]) {
    status = next;
    await page.locator('#alizarin-beta-submit').click();
    await page.waitForFunction(() => !document.getElementById('alizarin-beta-submit').disabled);
    assert.equal(await page.locator('#alizarin-native-fallback').isVisible(), false);
  }
  status = 200;
  await page.locator('#alizarin-beta-submit').click();
  await page.locator('#alizarin-submit-success').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#alizarin-beta-form').isVisible(), false);
  assert.equal(await page.locator('#alizarin-submit-success').evaluate(el => el === document.activeElement), true);
  for (const name of ['applicant_name', 'email', 'discord_username', 'software', 'intended_use', 'testing_interests', 'experience', 'beta_acknowledgement', 'g-recaptcha-response']) assert.ok(received.includes('name="' + name + '"'), name);
  assert.ok(received.includes('Vocal quality and expression; Technical integration'));
  result.form.push({ status: 'passed', tests: 'Native required/email/group/ack validation; keyboard submission and focus; processing/duplicate guard; retained inputs; mocked HTTP 400/429/500; all field serialization; acknowledged success focus. No live requests.' });
  await context.close();
}
async function sharedKeyboardChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(origin + '/');
  await page.locator('.menu-toggle').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  for (const link of await page.locator('#primary-nav a').all()) {
    await page.keyboard.press('Tab');
    assert.equal(await link.evaluate(el => el === document.activeElement), true);
    assert.notEqual(await link.evaluate(el => getComputedStyle(el).outlineStyle), 'none');
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-toggle').evaluate(el => el === document.activeElement), true);
  assert.equal(await page.locator('#primary-nav').isVisible(), false);
  for (const route of ['/aurora/', '/music/']) {
    await page.goto(origin + route);
    const card = page.locator('a[href="https://youtu.be/3Xoxgwa6pm4"]').first();
    await card.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    assert.equal(await card.evaluate(el => el === document.activeElement), true);
    assert.notEqual(await card.evaluate(el => getComputedStyle(el).outlineStyle), 'none');
  }
  result.sharedKeyboard = { status: 'passed', tests: 'Space opens menu; Tab reaches every primary link with visible outline; Escape returns focus; both complete music-video cards are keyboard focusable.' };
  await context.close();
  const blocked = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await blocked.addInitScript(() => {
    Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('QA blocked storage', 'SecurityError'); };
  });
  const other = await blocked.newPage(), errors = [];
  other.on('pageerror', error => errors.push(error.message));
  await other.goto(origin + '/');
  const before = await other.locator('html').getAttribute('data-theme');
  await other.locator('.theme-toggle').click();
  assert.notEqual(await other.locator('html').getAttribute('data-theme'), before);
  await other.locator('.menu-toggle').click();
  assert.equal(await other.locator('#primary-nav').isVisible(), true);
  assert.deepEqual(errors, []);
  result.blockedStorage = { status: 'passed', tests: 'Theme and mobile menu remain functional with Storage access denied.' };
  await blocked.close();
}
(async () => {
  if (server) await new Promise(resolve => server.listen(Number(new URL(origin).port), '127.0.0.1', resolve));
  browser = await chromium.launch({ executablePath: process.env.QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  result.browser = browser.version();
  for (const width of widths) {
    for (const theme of themes) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme });
      await context.addInitScript(value => { if (!localStorage.getItem('vega-theme')) localStorage.setItem('vega-theme', value); }, theme);
      for (const route of routes) {
        const page = await context.newPage(), errors = [], failedRequests = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('requestfailed', req => failedRequests.push({ url: req.url(), error: req.failure()?.errorText }));
        const response = await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
        await reveal(page);
        const geometry = await page.evaluate(() => {
          const visible = el => {
            const s = getComputedStyle(el), r = el.getBoundingClientRect();
            return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 2 && r.height > 2 && !el.closest('[aria-hidden=true]') && !el.classList.contains('sr-only') && !el.classList.contains('skip-link');
          };
          return {
            scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth,
            unrevealed: [...document.querySelectorAll('[data-reveal]')].filter(el => getComputedStyle(el).opacity !== '1').length,
            overflowing: [...document.querySelectorAll('main h1,main h2,main h3,main p,main a,main img,main input,main textarea,main label,main fieldset,header button,footer a')].filter(visible).filter(el => { const r=el.getBoundingClientRect(); return r.left < -2 || r.right > innerWidth+2; }).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.trim().slice(0,70) })),
            brokenImages: [...document.images].filter(el => visible(el) && (!el.complete || !el.naturalWidth)).map(el=>el.getAttribute('src')),
            undimensionedImages: [...document.images].filter(el => !el.hasAttribute('width') || !el.hasAttribute('height')).map(el=>el.getAttribute('src'))
          };
        });
        await page.evaluate(axe.source);
        const accessibility = await page.evaluate(async () => {
          const scan = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa'] } });
          return { violations: scan.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n=>({ target:n.target, summary:n.failureSummary })) })), incomplete: scan.incomplete.map(v=>v.id) };
        });
        const slug = route === '/' ? 'home' : route.replaceAll('/','');
        const screenshot = path.join(output, slug + '-' + width + '-' + theme + '.png');
        await page.screenshot({ path: screenshot, fullPage: true });
        await page.screenshot({ path: path.join(output, slug + '-' + width + '-' + theme + '-viewport.png') });
        result.layouts.push({ route, width, theme, http: response.status(), geometry, accessibility, errors, failedRequests, screenshot });
        fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2));
        // Exercise actual browser controls; this is separate from source inspection.
        let menu = 'desktop';
        if (await page.locator('.menu-toggle').isVisible()) {
          await page.locator('.menu-toggle').click();
          const open = await page.locator('#primary-nav').isVisible();
          await page.keyboard.press('Escape');
          const closed = !(await page.locator('#primary-nav').isVisible());
          menu = open && closed ? 'passed' : 'failed: Escape does not close menu';
          if (!closed) await page.locator('.menu-toggle').click();
        }
        await page.locator('.theme-toggle').click();
        const toggled = await page.locator('html').getAttribute('data-theme');
        await page.reload({ waitUntil: 'domcontentloaded' });
        const persisted = await page.locator('html').getAttribute('data-theme');
        await page.keyboard.press('Tab');
        const skip = await page.evaluate(() => document.activeElement.classList.contains('skip-link'));
        await page.keyboard.press('Enter');
        await page.waitForTimeout(80);
        const skipTarget = await page.evaluate(() => document.activeElement.id === 'main-content');
        await page.locator('.theme-toggle').focus();
        const focus = await page.locator('.theme-toggle').evaluate(el => getComputedStyle(el).outlineStyle !== 'none');
        result.interaction.push({ route, width, theme, menu, themeToggle: toggled !== theme, themePersistence: persisted === toggled, skip, skipTarget, focus });
        // Reset persisted theme for the next page in this context.
        await page.evaluate(value => localStorage.setItem('vega-theme', value), theme);
        await page.close();
        console.log('Rendered ' + route + ' ' + width + ' ' + theme + ': overflow=' + geometry.overflowing.length + ', axe=' + accessibility.violations.length + ', menu=' + menu);
      }
      await context.close();
    }
  }
  for (const width of [1440,320]) {
    const context=await browser.newContext({viewport:{width,height:1000},javaScriptEnabled:false});
    for (const route of routes) {
      const page=await context.newPage(); await page.goto(origin+route); await page.waitForTimeout(200);
      const state=await page.locator('main').evaluate(el=>({hasText:el.innerText.trim().length>0, hiddenReveal:[...el.querySelectorAll('[data-reveal]')].some(node=>getComputedStyle(node).opacity==='0')}));
      const nav=await page.locator('#primary-nav').isVisible();
      const form=route==='/alizarin/'?{hidden:!(await page.locator('#alizarin-beta-form').isVisible()),emailAlternative:await page.locator('main a[href^="mailto:contact@vegalyrae.tech"]').first().isVisible()}:undefined;
      result.noJavaScript.push({route,width,...state,nav,form});
      if(route==='/alizarin/'&&width===320)await page.screenshot({path:path.join(output,'alizarin-no-javascript-320.png'),fullPage:true});
      await page.close();
    }
    await context.close();
  }
  const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  for(const route of routes){
    const page=await reduced.newPage();await page.goto(origin+route);
    result.reducedMotion.push({route,...await page.evaluate(()=>({reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,scroll:getComputedStyle(document.documentElement).scrollBehavior,reveals:[...document.querySelectorAll('[data-reveal]')].every(el=>getComputedStyle(el).opacity==='1'&&getComputedStyle(el).transform==='none')}))});
    await page.close();
  }
  await reduced.close();
  try { await sharedKeyboardChecks(browser); } catch(error) { result.sharedKeyboard = {status:'failed',error:error.message}; }
  try { await formChecks(browser); } catch(error) { result.form.push({status:'failed',error:error.message}); }
  await browser.close();
})().catch(error=>{result.fatal=error.stack;process.exitCode=1;}).finally(async ()=>{
  if (browser) await browser.close().catch(()=>{});
  if (server) server.close();
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2));
  console.log('QA evidence: '+output);
  console.log('Cases: '+result.layouts.length+'; axe violations: '+result.layouts.reduce((n,r)=>n+r.accessibility.violations.length,0)+'; overflowing cases: '+result.layouts.filter(r=>r.geometry.overflowing.length).length);
  const failed = result.layouts.length !== routes.length * widths.length * themes.length || result.layouts.some(r => r.http !== 200 || r.errors.length || r.geometry.unrevealed || r.geometry.brokenImages.length || r.geometry.overflowing.length || r.geometry.scrollWidth > r.geometry.viewport || r.accessibility.violations.length) ||
    result.interaction.some(r => r.menu.startsWith('failed') || !r.themeToggle || !r.themePersistence || !r.skip || !r.skipTarget || !r.focus) ||
    result.noJavaScript.some(r => !r.hasText || r.hiddenReveal || !r.nav || (r.form && (!r.form.hidden || !r.form.emailAlternative))) ||
    result.reducedMotion.some(r => !r.reduce || r.scroll !== 'auto' || !r.reveals) || result.form.some(r => r.status !== 'passed') || result.sharedKeyboard?.status !== 'passed' || result.blockedStorage?.status !== 'passed';
  if (failed) process.exitCode = 1;
});
