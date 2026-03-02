/**
 * PHANTOM XI — Google Sheets: Form responses
 *
 * SETUP:
 * 1. Create a new Google Sheet (or use existing).
 * 2. Go to Extensions → Apps Script.
 * 3. Delete any default code and paste this entire file.
 * 4. Save (Ctrl+S). Give the project a name e.g. "PHANTOM XI Form".
 * 5. Click Deploy → New deployment → Type: Web app.
 *    - Description: "Form submit"
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy. Authorize when asked (your Google account).
 * 7. Copy the "Web app URL" (looks like https://script.google.com/macros/s/.../exec).
 * 8. In your form project, open js/script.js and set:
 *    GOOGLE_SCRIPT_URL = 'PASTE_THE_COPIED_URL_HERE';
 *
 * OPTIONAL: Replace FORM_PAGE_URL with the actual URL where your index.html is hosted,
 * so the "Back to form" link on the thank-you page works.
 * 
 * Deployment id:  AKfycbxlL4K87clZVa_klBiw1B6-zOCgPblGl7qmjFmybfRLX3ZTJLf-u-2ExiXGM7M7_lcG
 * 
 * web url: https://script.google.com/macros/s/AKfycbxlL4K87clZVa_klBiw1B6-zOCgPblGl7qmjFmybfRLX3ZTJLf-u-2ExiXGM7M7_lcG/exec
 */
var FORM_PAGE_URL = 'https://your-form-page-url.com/'; // Optional: your form URL

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var params = e.parameter;

    var playerName = params.playerName || '';
    var choice = params.choice || '';
    var tshirtSize = params.tshirtSize || '';
    var nameOnTshirt = params.nameOnTshirt || '';
    var numberOnTshirt = params.numberOnTshirt || '';
    var sleeveLength = params.sleeveLength || '';

    // If first row is empty, add header
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow([
        'Timestamp',
        'Player Name',
        'Your Choice',
        'Tshirt Size',
        'Name on Tshirt',
        'Number on Tshirt',
        'Sleeve Length'
      ]);
    }

    // Use leading apostrophe so Sheet stores as text and keeps 001, 04 etc (not 1, 4)
    var numberAsText = (numberOnTshirt === '') ? '' : "'" + numberOnTshirt;
    sheet.appendRow([
      new Date(),
      playerName,
      choice,
      tshirtSize,
      nameOnTshirt,
      numberAsText,
      sleeveLength
    ]);

    return createThankYouPage(true);
  } catch (err) {
    return createThankYouPage(false, err.toString());
  }
}

function createThankYouPage(success, errorMessage) {
  var title = success ? 'Thank you!' : 'Something went wrong';
  var msg = success
    ? 'Your PHANTOM XI new dress registration has been successfully saved. We will get in touch with you once the T-shirt is printed.'
    : 'We could not save your response. Please try again or contact the team.';
  if (errorMessage) msg += ' (Error: ' + errorMessage + ')';
  var backLink = FORM_PAGE_URL && FORM_PAGE_URL !== 'https://your-form-page-url.com/'
    ? '<p><a href="' + FORM_PAGE_URL + '" style="color:#00d4ff;">Back to form</a></p>'
    : '';

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + title + '</title>' +
    '<style>body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e8e8f0;padding:2rem;text-align:center;}' +
    'h1{color:#00d4ff;} a{color:#00d4ff;}</style></head><body>' +
    '<h1>' + title + '</h1><p>' + msg + '</p>' + backLink + '</body></html>';

  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
