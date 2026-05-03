const RECIPIENTS = ['yanonay3@gmail.com', 'hpp.ricecake@gmail.com'];

function doPost(e) {
  const params = e && e.parameter ? e.parameter : {};
  const giftName = params.giftName || '未指定';
  const submittedAt = params.submittedAt || new Date().toISOString();

  const subject = 'ウェディングギフトが選ばれました';
  const body = [
    'あかりさんがギフトを選びました。',
    '',
    `選択: ${giftName}`,
    `送信日時: ${formatSubmittedAt_(submittedAt)}`,
  ].join('\n');

  MailApp.sendEmail({
    to: RECIPIENTS.join(','),
    subject,
    body,
  });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'akari-wedding-notify' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatSubmittedAt_(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
}
