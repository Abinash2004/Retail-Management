function normalize(v) {
  return v ? v.toString().trim().toUpperCase() : "";
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeWriteRow(sheet, rowIndex, dataObj, map) {
  for (const key in dataObj) {
    const colIndex = map[key];
    if (colIndex && dataObj[key] !== undefined) {
      sheet.getRange(rowIndex, colIndex).setValue(dataObj[key]);
    }
  }
}

function getFirstEmptyRow(sheet, columnRange) {
  const range = sheet.getRange(columnRange);
  const values = range.getValues();
  const startRow = range.getRow();
  for (let i = 0; i < values.length; i++) {
    if (!values[i][0]) return startRow + i;
  }
  return sheet.getLastRow() + 1;
}
