function dailyTransaction(data) {
    if (!data) {
        return { status: 0, message: "invalid payload" };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("DAILY TRANSACTION");

    if (!sheet) {
        return { status: 0, message: "DAILY TRANSACTION sheet not found" };
    }

    const nextRow = getFirstEmptyRow(sheet, "A2:A");
    const payload = {
        "SERIAL NUMBER": nextRow - 1,
        "DATE": new Date(Date.now()),
        "LOCATION": normalize(data.location),
        "CASH IN": normalize(data.cashIn),
        "CASH OUT": normalize(data.cashOut),
        "CASH LEASURE": normalize(data.cashLeasure),
        "REMARK": normalize(data.remark)
    };

    const requiredFields = [
    payload["SERIAL NUMBER"],
    payload["DATE"],
    payload["LOCATION"],
    payload["CASH IN"],
    payload["CASH OUT"],
    payload["CASH LEASURE"],
    payload["REMARK"]
  ];

  if (requiredFields.some(v => !v)) {
    return { status: 0, message: "some fields are missing" };
  }

  safeWriteRow(sheet, nextRow, payload, DAILY_TRANSACTION);
  return { status: 1, message: "daily transaction added successfully" };
}