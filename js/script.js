(function () {
  'use strict';

  // ========== GOOGLE SHEETS SETUP ==========
  // Paste your Google Apps Script Web App URL below (see google-apps-script.js for setup steps):
  var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlL4K87clZVa_klBiw1B6-zOCgPblGl7qmjFmybfRLX3ZTJLf-u-2ExiXGM7M7_lcG/exec";

  const form = document.getElementById('kit-form');
  const submitBtn = document.getElementById('submit-btn');
  const messageEl = document.getElementById('form-message');
  const fieldLowerSize = document.getElementById('field-lower-size');
  const lowerSizeSelect = document.getElementById('lower-size');

  function choiceNeedsLower(choice) {
    return choice === 'Tshirt + Lower' || choice === 'Tshirt + Lower + Cap';
  }

  function toggleLowerSizeField() {
    var choice = (form.querySelector('input[name="choice"]:checked') || {}).value || '';
    var show = choiceNeedsLower(choice);
    if (fieldLowerSize) fieldLowerSize.style.display = show ? '' : 'none';
    if (lowerSizeSelect) {
      lowerSizeSelect.required = show;
      if (!show) lowerSizeSelect.value = '';
    }
  }

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
    var mobileEl = document.getElementById('mobile-number');
    var mobileRaw = (mobileEl ? mobileEl.value : fd.get('mobileNumber') || '').trim().replace(/\D/g, '');
    if (mobileRaw.length === 12 && mobileRaw.indexOf('91') === 0) mobileRaw = mobileRaw.slice(2);
    if (mobileRaw.length === 11 && mobileRaw[0] === '0') mobileRaw = mobileRaw.slice(1);
    var choice = fd.get('choice') || '';
    var lowerVal = choiceNeedsLower(choice) ? (fd.get('lowerSize') || '') : 'Lower not selected';
    return {
      playerName: (fd.get('playerName') || '').trim(),
      mobileNumber: mobileRaw,
      choice: choice,
      tshirtSize: fd.get('tshirtSize') || '',
      lowerSize: lowerVal,
      nameOnTshirt: (fd.get('nameOnTshirt') || '').trim(),
      numberOnTshirt: numRaw,
      sleeveLength: fd.get('sleeveLength') || ''
    };
  }

  function validate(data) {
    if (!data.playerName) return 'Please enter player name.';
    if (!data.mobileNumber) return 'Please enter Mobile number.';
    if (!/^[6-9][0-9]{9}$/.test(data.mobileNumber)) return 'Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8 or 9).';
    if (!data.choice) return 'Please select your choice (Tshirt/Lower/Cap).';
    if (!data.tshirtSize) return 'Please select Tshirt size.';
    if (choiceNeedsLower(data.choice) && !data.lowerSize) return 'Please select Lower size.';
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

    var keys = ['playerName', 'mobileNumber', 'choice', 'tshirtSize', 'lowerSize', 'nameOnTshirt', 'numberOnTshirt', 'sleeveLength'];
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
    toggleLowerSizeField();
  });

  form.querySelectorAll('input[name="choice"]').forEach(function (radio) {
    radio.addEventListener('change', toggleLowerSizeField);
  });
  toggleLowerSizeField();
})();
