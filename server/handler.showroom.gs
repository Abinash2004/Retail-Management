// FETCH VALUES HANDLER
function getOpeningBalance(data) {
  if (!data || !data.branch) {
    return { status: 0, message: "invalid payload" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("DAILY TRANSACTION");

  if (!sheet) {
    return { status: 0, message: "DAILY TRANSACTION sheet not found" };
  }

  const nextRow = getFirstEmptyRow(sheet, "A2:A");
  const lastRow = nextRow - 1;

  if (lastRow < 2) {
    return { status: 1, message: "success", openingBalance: 0 };
  }

  const locationCol = DAILY_TRANSACTION["LOCATION"];
  const closingCol = DAILY_TRANSACTION["CLOSING BALANCE"]; 

  const locations = sheet.getRange(2, locationCol, lastRow - 1, 1).getValues();
  const closingBalances = sheet.getRange(2, closingCol, lastRow - 1, 1).getValues();

  const targetBranch = normalize(data.branch);

  for (let i = locations.length - 1; i >= 0; i--) {
    if (normalize(locations[i][0]) === targetBranch) {
      return { 
        status: 1, 
        message: "success", 
        openingBalance: closingBalances[i][0] || 0 
      };
    }
  }

  return { status: 1, message: "success", openingBalance: 0 };
}

// FROM HANDLERS
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
        "OPENING BALANCE": normalize(data.openingBalance),
        "CASH IN": normalize(data.cashIn),
        "CASH OUT": normalize(data.cashOut),
        "CASH LEISURE": normalize(data.cashLeisure),
        "REMARK": normalize(data.remark)
    };

    const requiredFields = [
    payload["SERIAL NUMBER"],
    payload["DATE"],
    payload["LOCATION"],
    payload["OPENING BALANCE"],
    payload["CASH IN"],
    payload["CASH OUT"],
    payload["CASH LEISURE"],
    payload["REMARK"]
  ];

  if (requiredFields.some(v => !v)) {
    return { status: 0, message: "some fields are missing" };
  }

  safeWriteRow(sheet, nextRow, payload, DAILY_TRANSACTION);
  return { status: 1, message: "daily transaction added successfully" };
}