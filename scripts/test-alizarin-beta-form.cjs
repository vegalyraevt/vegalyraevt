// Node-only tests of the production handler. This is not rendered-browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/alizarin-beta-form.js'), 'utf8');
const page = fs.readFileSync(path.join(__dirname, '../alizarin.md'), 'utf8');
const endpoint = 'https://formspree.io/f/mjygyayp';

function node(properties = {}) {
  return Object.assign({
    hidden: false, disabled: false, value: '', checked: false, textContent: '',
    handlers: {}, attributes: {}, customValidity: '', focusCount: 0,
    addEventListener(type, handler) { this.handlers[type] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; },
    setCustomValidity(value) { this.customValidity = value; },
    focus() { this.focusCount++; }
  }, properties);
}

function fixture(fetcher, overrides = {}) {
  const controls = {
    applicant_name: node({ value: 'TEST ONLY - ALIZARIN beta integration' }),
    email: node({ value: 'alizarin-beta-test@example.com' }),
    discord_username: node({ value: '' }),
    intended_use: node({ value: 'TEST ONLY. Verify form delivery; not a real beta application.' }),
    experience: node({ value: '' }),
    beta_acknowledgement: node({ checked: true, value: 'I understand that this is a request to participate in an experimental beta, not a guarantee of acceptance or immediate access.' }),
    subject: node({ value: 'ALIZARIN Beta Application' }),
    _gotcha: node({ value: '' })
  };
  controls['g-recaptcha-response'] = node({ value: '' });
  const software = ['OpenUTAU / UTAU', 'Music production / DAW'].map(value => node({ value, checked: true }));
  const interests = ['Vocal quality and expression', 'Technical integration'].map(value => node({ value, checked: true }));
  Object.entries(overrides).forEach(([key, value]) => {
    if (controls[key]) controls[key].value = value;
  });
  const form = node({ action: endpoint, noValidate: false, resetCount: 0, nativeValid: true });
  form.getAttribute = () => '6Ldin-QtAAAAAOZXYuliFuWYEyOi5NNbRYGSYdYj';
  form.submit = () => { form.nativePosts = (form.nativePosts || 0) + 1; };
  form.elements = { namedItem: name => controls[name] };
  form.querySelectorAll = () => interests;
  // Native constraint validity is stubbed; browser email/required behavior needs browser QA.
  form.reportValidity = () => form.nativeValid && !Object.values(controls).some(input => input.customValidity) && !interests.some(input => input.customValidity);
  form.reset = () => { form.resetCount++; };
  const nodes = {
    'alizarin-beta-form': form,
    'alizarin-application-fields': node(),
    'alizarin-beta-submit': node({ textContent: 'Submit Beta Application' }),
    'alizarin-submit-progress': node(),
    'alizarin-submit-error': node({ hidden: true }),
    'alizarin-submit-success': node({ hidden: true }),
    'alizarin-native-fallback': node({ hidden: true }),
    'alizarin-native-submit': node(),
    'alizarin-testing-group': node(),
    'alizarin-testing-error': node({ hidden: true })
  };
  class FixtureFormData extends FormData {
    constructor() {
      super();
      Object.entries(controls).forEach(([name, input]) => {
        if (name !== 'beta_acknowledgement' || input.checked) this.append(name, input.value);
      });
      software.filter(input => input.checked).forEach(input => this.append('software', input.value));
      interests.filter(input => input.checked).forEach(input => this.append('testing_interests', input.value));
    }
  }
  const captchaCalls = [];
  const window = { fetch: fetcher, FormData: FixtureFormData, grecaptcha: {
    ready(callback) { callback(); },
    execute(key, options) {
      captchaCalls.push({ key, action: options.action });
      return Promise.resolve('MOCK_ONLY_TOKEN_' + captchaCalls.length);
    }
  } };
  vm.runInNewContext(source, {
    document: { getElementById: id => nodes[id] }, window,
    FormData: FixtureFormData, AbortController, setTimeout, clearTimeout
  });
  return {
    controls, software, interests, form, nodes, window, captchaCalls,
    submit(submitter) {
      const event = { submitter, prevented: false, preventDefault() { this.prevented = true; } };
      return Promise.resolve(form.handlers.submit(event)).then(() => event);
    }
  };
}

if (process.argv.includes('--live')) {
  throw new Error('Live CAPTCHA submission requires a real browser. This fixture uses mock tokens and must never contact Formspree.');
}
{
  test('markup has the real POST endpoint, labels, required attributes and safeguards', () => {
    assert.match(page, /id="alizarin-beta-form" action="https:\/\/formspree.io\/f\/mjygyayp" method="POST"/);
    ['applicant_name', 'email', 'intended_use', 'beta_acknowledgement'].forEach(name => {
      assert.match(page, new RegExp('<(?:input|textarea)[^>]*name="' + name + '"[^>]*required'));
    });
    assert.match(page, /name="email" type="email"/);
    assert.match(page, /<noscript><style>#alizarin-beta-form, #alizarin-native-fallback \{ display: none !important; \}<\/style>/);
    assert.match(page, /With JavaScript disabled, please send your application details using the beta inquiry email link below/);
    assert.match(page, /mailto:contact@vegalyrae.tech\?subject=ALIZARIN%20beta%20inquiry/);
    assert.doesNotMatch(page, /alizarin-testing-fallback/);
    assert.match(page, /name="_gotcha"/);
    assert.match(page, /name="subject" value="ALIZARIN Beta Application"/);
    assert.match(page, /role="alert"/);
    assert.match(page, /id="alizarin-submit-success"[^>]*aria-live="polite"/);
    assert.doesNotMatch(page, /[\u2014]/);
  });

  test('confirmed success serializes every selection, accepts blank optional fields and blocks duplicates', async () => {
    let resolveResponse;
    let calls = 0;
    let body;
    const app = fixture((url, options) => {
      calls++; body = options.body;
      assert.equal(url, endpoint);
      assert.equal(options.headers.Accept, 'application/json');
      return new Promise(resolve => { resolveResponse = resolve; });
    });
    const pending = app.submit();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(app.nodes['alizarin-beta-submit'].disabled, true);
    assert.equal(app.form.resetCount, 0);
    assert.equal(app.nodes['alizarin-submit-success'].hidden, true);
    await app.submit();
    assert.equal(calls, 1);
    assert.equal(body.get('software'), 'OpenUTAU / UTAU; Music production / DAW');
    assert.equal(body.get('testing_interests'), 'Vocal quality and expression; Technical integration');
    assert.equal(body.get('discord_username'), '');
    assert.equal(body.get('experience'), '');
    assert.equal(body.get('g-recaptcha-response'), 'MOCK_ONLY_TOKEN_1');
    assert.equal(app.captchaCalls[0].action, 'submit');
    resolveResponse({ ok: true, json: async () => ({ ok: true }) });
    await pending;
    assert.equal(app.form.resetCount, 1);
    assert.equal(app.form.hidden, true);
    assert.equal(app.nodes['alizarin-submit-success'].hidden, false);
    assert.equal(app.nodes['alizarin-submit-success'].focusCount, 1);
    await app.submit();
    assert.equal(calls, 1);
  });

  test('an empty testing group prevents sending and clears its error after selection', async () => {
    let calls = 0;
    const app = fixture(() => { calls++; });
    app.interests.forEach(input => { input.checked = false; });
    await app.submit();
    assert.equal(calls, 0);
    assert.equal(app.nodes['alizarin-testing-error'].hidden, false);
    app.interests[1].checked = true;
    app.interests[1].handlers.change();
    assert.equal(app.interests[0].customValidity, '');
    assert.equal(app.nodes['alizarin-testing-error'].hidden, true);
  });

  test('blank or whitespace name/intended use and simulated native-invalid fields block sending', async () => {
    for (const invalid of [{ applicant_name: '' }, { applicant_name: '  ' }, { intended_use: '' }, { intended_use: '  ' }]) {
      let calls = 0;
      const app = fixture(() => { calls++; }, invalid);
      await app.submit();
      assert.equal(calls, 0);
    }
    let calls = 0;
    const app = fixture(() => { calls++; });
    app.form.nativeValid = false;
    await app.submit();
    assert.equal(calls, 0);
  });

  test('provider failures retain answers, expose errors and allow a manual retry', async () => {
    const app = fixture(async () => ({ ok: false, json: async () => ({ errors: [{ message: 'Test validation failure.' }] }) }));
    const value = app.controls.intended_use.value;
    await app.submit();
    assert.equal(app.form.resetCount, 0);
    assert.equal(app.controls.intended_use.value, value);
    assert.equal(app.nodes['alizarin-submit-success'].hidden, true);
    assert.match(app.nodes['alizarin-submit-error'].textContent, /Test validation failure/);
    assert.equal(app.nodes['alizarin-beta-submit'].disabled, false);
    assert.equal(app.nodes['alizarin-application-fields'].disabled, false);
  });

  test('HTTP success without acknowledgement, network errors and invalid JSON never show success', async () => {
    const responses = [
      async () => ({ ok: true, json: async () => ({}) }),
      async () => { throw new Error('Offline test'); },
      async () => ({ ok: true, json: async () => { throw new Error('Bad JSON'); } })
    ];
    for (const response of responses) {
      const app = fixture(response);
      await app.submit();
      assert.equal(app.form.resetCount, 0);
      assert.equal(app.nodes['alizarin-submit-success'].hidden, true);
      assert.equal(app.nodes['alizarin-submit-error'].hidden, false);
      assert.equal(app.nodes['alizarin-beta-submit'].disabled, false);
    }
  });

  test('a filled honeypot does not produce a false success or a network request', async () => {
    let calls = 0;
    const app = fixture(() => { calls++; }, { _gotcha: 'bot test' });
    await app.submit();
    assert.equal(calls, 0);
    assert.equal(app.nodes['alizarin-submit-success'].hidden, true);
  });

  test('without Fetch, a valid form retains standard HTML submission', async () => {
    const app = fixture(undefined);
    const event = await app.submit();
    assert.equal(event.prevented, true);
    assert.equal(app.form.nativePosts, 1);
    assert.equal(app.controls['g-recaptcha-response'].value, 'MOCK_ONLY_TOKEN_1');
    assert.equal(app.nodes['alizarin-application-fields'].disabled, false);
    assert.equal(app.form.action, endpoint);
  });

  test('CAPTCHA rejection offers a validated native POST without weakening protection', async () => {
    let calls = 0;
    const app = fixture(async () => {
      calls++;
      return { ok: false, status: 403, json: async () => ({ error: 'In order to submit via AJAX, reCAPTCHA needs a custom key.' }) };
    });
    await app.submit();
    assert.equal(app.nodes['alizarin-native-fallback'].hidden, false);
    assert.match(app.nodes['alizarin-submit-error'].textContent, /security check/);
    assert.equal(app.form.resetCount, 0);
    const event = await app.submit(app.nodes['alizarin-native-submit']);
    assert.equal(event.prevented, true);
    assert.equal(app.form.nativePosts, 1);
    assert.equal(app.controls['g-recaptcha-response'].value, 'MOCK_ONLY_TOKEN_2');
    assert.equal(calls, 1);
    app.form.nativeValid = false;
    const invalid = await app.submit(app.nodes['alizarin-native-submit']);
    assert.equal(invalid.prevented, true);
  });

  test('missing, rejected and empty CAPTCHA tokens retain answers and never send', async () => {
    for (const captcha of [undefined, { ready(fn) { fn(); }, execute() { return Promise.reject(new Error('CAPTCHA rejected')); } }, { ready(fn) { fn(); }, execute() { return Promise.resolve(''); } }]) {
      let calls = 0;
      const app = fixture(() => { calls++; });
      app.window.grecaptcha = captcha;
      await app.submit();
      assert.equal(calls, 0);
      assert.equal(app.form.resetCount, 0);
      assert.equal(app.nodes['alizarin-submit-success'].hidden, true);
      assert.match(app.nodes['alizarin-submit-error'].textContent, /not been sent/);
      assert.equal(app.nodes['alizarin-beta-submit'].disabled, false);
    }
  });

  for (const status of [400, 429, 500]) {
    test('ordinary HTTP ' + status + ' preserves answers without offering native fallback', async () => {
      const app = fixture(async () => ({ ok: false, status, json: async () => ({
        errors: [{ message: 'Test provider failure.' }]
      }) }));
      const originalAnswers = Object.fromEntries(Object.entries(app.controls).map(([key, input]) => [key, input.value]));
      await app.submit();
      assert.equal(app.nodes['alizarin-native-fallback'].hidden, true);
      assert.equal(app.nodes['alizarin-submit-success'].hidden, true);
      assert.match(app.nodes['alizarin-submit-error'].textContent, /couldn't be submitted/);
      assert.match(app.nodes['alizarin-submit-error'].textContent, /Test provider failure/);
      assert.equal(app.form.resetCount, 0);
      for (const key of ['applicant_name', 'email', 'discord_username', 'intended_use', 'experience']) {
        assert.equal(app.controls[key].value, originalAnswers[key]);
      }
      assert.ok(app.interests.every(input => input.checked));
      assert.ok(app.software.every(input => input.checked));
      assert.equal(app.nodes['alizarin-beta-submit'].disabled, false);
      assert.equal(app.nodes['alizarin-application-fields'].disabled, false);
    });
  }

  test('an unrelated CAPTCHA rejection does not offer the compatibility fallback', async () => {
    const app = fixture(async () => ({ ok: false, status: 403, json: async () => ({
      error: 'reCAPTCHA verification failed.'
    }) }));
    await app.submit();
    assert.equal(app.nodes['alizarin-native-fallback'].hidden, true);
    assert.match(app.nodes['alizarin-submit-error'].textContent, /couldn't be submitted/);
  });

  test('ordinary failure hides a fallback offered by an earlier compatibility rejection', async () => {
    let calls = 0;
    const app = fixture(async () => ++calls === 1 ?
      { ok: false, status: 403, json: async () => ({ error: 'In order to submit via AJAX, reCAPTCHA needs a custom key.' }) } :
      { ok: false, status: 429, json: async () => ({ errors: [{ message: 'Too many requests.' }] }) });
    await app.submit();
    assert.equal(app.nodes['alizarin-native-fallback'].hidden, false);
    await app.submit();
    assert.equal(app.nodes['alizarin-native-fallback'].hidden, true);
    assert.equal(app.form.resetCount, 0);
  });
}
