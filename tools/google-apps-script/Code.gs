const RECIPIENTS = ['yanonay3@gmail.com', 'hpp.ricecake@gmail.com'];
const SPREADSHEET_ID_PROPERTY = 'SPREADSHEET_ID';
const SPREADSHEET_NAME = 'akari-wedding-selection';
const CURRENT_SHEET_NAME = 'current';
const HISTORY_SHEET_NAME = 'history';
const HEADERS = ['giftId', 'giftName', 'giftMessage', 'submittedAt', 'receivedAt'];

function doPost(e) {
  const params = e && e.parameter ? e.parameter : {};
  const giftId = params.giftId || '';
  const giftName = params.giftName || '未指定';
  const giftMessage = params.giftMessage || '';
  const submittedAt = params.submittedAt || new Date().toISOString();
  const receivedAt = new Date().toISOString();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    saveSelection_({ giftId, giftName, giftMessage, submittedAt, receivedAt });
  } finally {
    lock.releaseLock();
  }

  sendSelectionEmail_({ giftName, giftMessage, submittedAt });

  return jsonResponse_({ ok: true, selected: readCurrentSelection_() });
}

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = params.action || 'status';

  if (action === 'status') {
    return jsonResponse_(
      {
        ok: true,
        selected: readCurrentSelection_(),
      },
      params.callback,
    );
  }

  if (action === 'setup') {
    const spreadsheet = getOrCreateSpreadsheet_();
    return jsonResponse_(
      {
        ok: true,
        spreadsheetId: spreadsheet.getId(),
        spreadsheetUrl: spreadsheet.getUrl(),
      },
      params.callback,
    );
  }

  return jsonResponse_(
    {
      ok: true,
      service: 'akari-wedding-notify',
    },
    params.callback,
  );
}

function setup() {
  const spreadsheet = getOrCreateSpreadsheet_();
  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    selected: readCurrentSelection_(),
  };
}

function saveSelection_(selection) {
  const spreadsheet = getOrCreateSpreadsheet_();
  const currentSheet = getOrCreateSheet_(spreadsheet, CURRENT_SHEET_NAME);
  const historySheet = getOrCreateSheet_(spreadsheet, HISTORY_SHEET_NAME);
  ensureHeaders_(currentSheet);
  ensureHeaders_(historySheet);

  const row = [
    selection.giftId,
    selection.giftName,
    selection.giftMessage,
    selection.submittedAt,
    selection.receivedAt,
  ];

  currentSheet.clearContents();
  currentSheet.appendRow(HEADERS);
  currentSheet.appendRow(row);
  historySheet.appendRow(row);
}

function readCurrentSelection_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID_PROPERTY);
  if (!spreadsheetId) return null;

  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const currentSheet = spreadsheet.getSheetByName(CURRENT_SHEET_NAME);
    if (!currentSheet || currentSheet.getLastRow() < 2) return null;

    const values = currentSheet.getRange(2, 1, 1, HEADERS.length).getValues()[0];
    return {
      giftId: values[0] || '',
      giftName: values[1] || '',
      giftMessage: values[2] || '',
      submittedAt: values[3] || '',
      receivedAt: values[4] || '',
    };
  } catch (error) {
    console.warn(`Failed to read current selection: ${error}`);
    return null;
  }
}

function getOrCreateSpreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty(SPREADSHEET_ID_PROPERTY);

  if (spreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      ensureSpreadsheet_(spreadsheet);
      return spreadsheet;
    } catch (error) {
      console.warn(`Stored spreadsheet was unavailable, creating a new one: ${error}`);
    }
  }

  const spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  properties.setProperty(SPREADSHEET_ID_PROPERTY, spreadsheet.getId());
  ensureSpreadsheet_(spreadsheet);
  return spreadsheet;
}

function ensureSpreadsheet_(spreadsheet) {
  ensureHeaders_(getOrCreateSheet_(spreadsheet, CURRENT_SHEET_NAME));
  ensureHeaders_(getOrCreateSheet_(spreadsheet, HISTORY_SHEET_NAME));
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  const headers = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => headers[index] === header);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function sendSelectionEmail_(selection) {
  const subject = 'ウェディングギフトが選ばれました';
  const body = [
    'あかりさんがギフトを選びました。',
    '',
    `選択: ${selection.giftName}`,
    selection.giftMessage ? `メッセージ: ${selection.giftMessage}` : '',
    `送信日時: ${formatSubmittedAt_(selection.submittedAt)}`,
  ]
    .filter(Boolean)
    .join('\n');

  MailApp.sendEmail({
    to: RECIPIENTS.join(','),
    subject,
    body,
  });
}

function jsonResponse_(payload, callback) {
  const callbackName = sanitizeCallback_(callback);
  const body = callbackName
    ? `${callbackName}(${JSON.stringify(payload)});`
    : JSON.stringify(payload);

  return ContentService
    .createTextOutput(body)
    .setMimeType(callbackName ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function sanitizeCallback_(callback) {
  if (!callback) return '';
  return /^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(callback)
    ? callback
    : '';
}

function formatSubmittedAt_(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
}
