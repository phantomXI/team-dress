(function () {
  'use strict';

  // ========== GOOGLE SHEETS SETUP ==========
  // Paste your Google Apps Script Web App URL below (see google-apps-script.js for setup steps):
  var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlL4K87clZVa_klBiw1B6-zOCgPblGl7qmjFmybfRLX3ZTJLf-u-2ExiXGM7M7_lcG/exec";

  const form = document.getElementById('kit-form');
  const submitBtn = document.getElementById('submit-btn');
  const messageEl = document.getElementById('form-message');

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'form-message show ' + (type || '');
    messageEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
  }

  function hideMessage() {
    messageEl.className = 'form-message';
    messageEl.removeAttribute('role');
  }

  function getFormData() {
    var fd = new FormData(form);
    var numRaw = (fd.get('numberOnTshirt') || '').trim();
    return {
      playerName: (fd.get('playerName') || '').trim(),
      choice: fd.get('choice') || '',
      tshirtSize: fd.get('tshirtSize') || '',
      nameOnTshirt: (fd.get('nameOnTshirt') || '').trim(),
      numberOnTshirt: numRaw,
      sleeveLength: fd.get('sleeveLength') || ''
    };
  }

  function validate(data) {
    if (!data.playerName) return 'Please enter player name.';
    if (!data.choice) return 'Please select your choice (Tshirt/Lower/Cap).';
    if (!data.tshirtSize) return 'Please select Tshirt size.';
    if (!data.nameOnTshirt) return 'Please enter name on Tshirt.';
    if (!data.numberOnTshirt) return 'Please enter number on Tshirt.';
    if (!data.sleeveLength) return 'Please select sleeve length.';
    return null;
  }

  function submitToGoogleSheet(data) {
    var f = document.createElement('form');
    f.method = 'POST';
    f.action = SCRIPT_URL;
    f.target = 'phantom-submit-frame';
    f.style.display = 'none';

    var keys = ['playerName', 'choice', 'tshirtSize', 'nameOnTshirt', 'numberOnTshirt', 'sleeveLength'];
    keys.forEach(function (key) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key] || '';
      f.appendChild(input);
    });

    document.body.appendChild(f);
    f.submit();
    document.body.removeChild(f);
  }

  function showSuccessPopup() {
    var popup = document.getElementById('success-popup');
    if (!popup) return;
    popup.classList.add('show');
    popup.setAttribute('aria-hidden', 'false');
  }

  function hideSuccessPopup() {
    var popup = document.getElementById('success-popup');
    if (!popup) return;
    popup.classList.remove('show');
    popup.setAttribute('aria-hidden', 'true');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage();

    var data = getFormData();
    var err = validate(data);
    if (err) {
      showMessage(err, 'error');
      return;
    }

    if (!SCRIPT_URL || SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
      showMessage('Google Sheet URL not set. Add your Web App URL in js/script.js (see google-apps-script.js).', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    submitToGoogleSheet(data);
    form.reset();
    hideMessage();

    showSuccessPopup();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';

    setTimeout(function () {
      hideSuccessPopup();
    }, 4500);
  });

  form.addEventListener('reset', function () {
    hideMessage();
  });
})();
