(function () {
  'use strict';

  var form = document.getElementById('alizarin-beta-form');
  if (!form) return;

  var fields = document.getElementById('alizarin-application-fields');
  var button = document.getElementById('alizarin-beta-submit');
  var progress = document.getElementById('alizarin-submit-progress');
  var errorBox = document.getElementById('alizarin-submit-error');
  var success = document.getElementById('alizarin-submit-success');
  var nativeFallback = document.getElementById('alizarin-native-fallback');
  var nativeButton = document.getElementById('alizarin-native-submit');
  var group = document.getElementById('alizarin-testing-group');
  var groupError = document.getElementById('alizarin-testing-error');
  var interests = Array.from(form.querySelectorAll('input[name="testing_interests"]'));
  var name = form.elements.namedItem('applicant_name');
  var intendedUse = form.elements.namedItem('intended_use');
  var pending = false;
  var sent = false;
  var defaultLabel = button.textContent;
  var siteKey = form.getAttribute('data-recaptcha-site-key');
  var tokenField = form.elements.namedItem('g-recaptcha-response');
  var failureMessage = "Your application couldn't be submitted. Please try again, or contact me directly by email.";

  // Native HTML validation remains the fallback when this script is unavailable.
  form.noValidate = true;

  function validateInterests(showError) {
    var valid = interests.some(function (input) { return input.checked; });
    interests[0].setCustomValidity(valid ? '' : 'Please choose at least one testing interest.');
    interests[0].setAttribute('aria-invalid', valid ? 'false' : 'true');
    group.setAttribute('aria-invalid', valid ? 'false' : 'true');
    groupError.hidden = valid || !showError;
    return valid;
  }

  interests.forEach(function (input) {
    input.addEventListener('change', function () { validateInterests(true); });
  });
  [name, intendedUse].forEach(function (input) {
    input.addEventListener('input', function () { input.setCustomValidity(''); });
  });

  form.addEventListener('submit', async function (event) {
    if (pending || sent) {
      event.preventDefault();
      return;
    }
    name.setCustomValidity(name.value.trim() ? '' : 'Please enter your preferred name or handle.');
    intendedUse.setCustomValidity(intendedUse.value.trim() ? '' : 'Please describe what you would like to try.');
    validateInterests(true);
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    var nativePost = event.submitter === nativeButton || typeof window.fetch !== 'function' || typeof window.FormData !== 'function';
    tokenField.value = '';
    var data = typeof window.FormData === 'function' ? new FormData(form) : null;
    // Each group is a single readable field, without dropping repeated checkbox values.
    ['software', 'testing_interests'].forEach(function (key) {
      if (data) {
        var values = data.getAll(key);
        data.set(key, values.join('; '));
      }
    });
    if (form.elements.namedItem('_gotcha').value) {
      errorBox.textContent = failureMessage;
      errorBox.hidden = false;
      errorBox.focus();
      return;
    }

    pending = true;
    fields.disabled = true;
    button.disabled = true;
    button.textContent = 'Submitting application...';
    form.setAttribute('aria-busy', 'true');
    progress.textContent = 'Submitting your application. Please wait.';
    errorBox.hidden = true;
    nativeFallback.hidden = true;
    errorBox.textContent = '';
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timeout = null;
    var captchaComplete = false;
    var nativeSubmitted = false;

    try {
      if (!window.grecaptcha || !siteKey) throw new Error('Security check unavailable');
      var token = await new Promise(function (resolve, reject) {
        var timer = setTimeout(function () { reject(new Error('Security check timed out')); }, 30000);
        function finish(error, value) {
          clearTimeout(timer);
          if (error) reject(error);
          else resolve(value);
        }
        try {
          window.grecaptcha.ready(function () {
            try {
              Promise.resolve(window.grecaptcha.execute(siteKey, { action: 'submit' })).then(function (value) {
                finish(null, value);
              }, function (error) { finish(error); });
            } catch (error) { finish(error); }
          });
        } catch (error) { finish(error); }
      });
      if (typeof token !== 'string' || !token) throw new Error('Security check failed');
      captchaComplete = true;
      tokenField.value = token;
      if (nativePost) {
        // Native POST still needs a fresh CAPTCHA token. Re-enable all successful controls.
        fields.disabled = false;
        form.submit();
        nativeSubmitted = true;
        return;
      }
      data.set('g-recaptcha-response', token);
      timeout = controller ? setTimeout(function () { controller.abort(); }, 30000) : null;
      var response = await window.fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined
      });
      var result = await response.json();
      if (!response.ok || result.ok !== true) {
        var details = Array.isArray(result.errors) ? result.errors.map(function (error) {
          return typeof error.message === 'string' ? error.message : '';
        }).filter(Boolean).join(' ') : '';
        var securityCheck = response.status === 403 && typeof result.error === 'string' && /reCAPTCHA/i.test(result.error);
        errorBox.textContent = securityCheck ? 'An additional security check is needed to submit your application. Use standard submission below, or contact me directly by email.' : failureMessage + (details ? ' ' + details : '');
        errorBox.hidden = false;
        // Offer a manual native POST only after a confirmed provider rejection.
        nativeFallback.hidden = response.ok;
        errorBox.focus();
        return;
      }

      sent = true;
      // Only clear answers and show confirmation after Formspree acknowledges receipt.
      form.reset();
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (error) {
      errorBox.textContent = captchaComplete ? "We couldn't confirm receipt of your application. Your answers are still here. Please contact me by email before resubmitting to avoid sending a duplicate." : "The security check couldn't be completed. Your application has not been sent. Please try again, or use the email inquiry link.";
      errorBox.hidden = false;
      errorBox.focus();
    } finally {
      if (timeout !== null) clearTimeout(timeout);
      pending = nativeSubmitted;
      fields.disabled = sent;
      button.disabled = sent || nativeSubmitted;
      button.textContent = defaultLabel;
      progress.textContent = '';
      form.setAttribute('aria-busy', 'false');
    }
  });
})();
