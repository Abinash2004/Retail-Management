// FETCH VALUES HANDLER
function getChassis(chassis) {
  if (!chassis) {
    return { status: 0, message: "invalid chassis number" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const mainSheet = ss.getSheetByName("MAIN");

  if (!mainSheet) {
    return { status: 0, message: "MAIN not found" };
  }

  const rowIndex = getRowIndexHandler(
    mainSheet,
    chassis,
    MAIN["CHASSIS NUMBER"]
  );

  if (rowIndex === -1) {
    return { status: 0, message: "chassis does not exist" };
  }

  const modelCol = MAIN["MODEL"];
  const colorCol = MAIN["COLOR"];
  const customerCol = MAIN["CUSTOMER NAME"];

  const model = mainSheet.getRange(rowIndex, modelCol).getValue();
  const color = mainSheet.getRange(rowIndex, colorCol).getValue();
  const customer = mainSheet.getRange(rowIndex, customerCol).getValue();

  return {
    status: 1,
    data: {
      model,
      color,
      customer
    }
  };
}

function getAdvance(advancer_name) {
  if (!advancer_name) {
    return { status: 0, message: "invalid advancer name" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const advanceSheet = ss.getSheetByName("ADVANCE");

  if (!advanceSheet) {
    return { status: 0, message: "ADVANCE not found" };
  }

  const rowIndex = getAdvancerRowIndexHandler(
    advanceSheet,
    advancer_name
  );

  if (rowIndex === -1) {
    return { status: 0, message: "advancer does not exist or not active" };
  }

  const amountCol = ADVANCE["AMOUNT"];
  const amount = advanceSheet.getRange(rowIndex, amountCol).getValue();

  return {
    status: 1,
    data: { amount }
  };
}

//  FORM HANDLERS
function addStockForm(data) {
  if (!data) {
    return { status: 0, message: "invalid payload" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const mainSheet = ss.getSheetByName("MAIN");

  if (!mainSheet) {
    return { status: 0, message: "MAIN not found" };
  }

  const nextRow = getFirstEmptyRow(mainSheet, "A2:A");
  const payload = {
    "SERIAL NUMBER": nextRow - 1,
    "CHASSIS NUMBER": normalize(data.chassis),
    "ENGINE NUMBER": normalize(data.engine),
    "MODEL": normalize(data.model),
    "COLOR": normalize(data.color),
    "CURRENT COUNTER": normalize(data.counter),
    "KEY NUMBER": normalize(data.key),
    "STOCK STATUS": "STOCK"
  };

  const requiredFields = [
    payload["CHASSIS NUMBER"],
    payload["ENGINE NUMBER"],
    payload["MODEL"],
    payload["COLOR"],
    payload["CURRENT COUNTER"]
  ];

  if (requiredFields.some(v => !v)) {
    return { status: 0, message: "some fields are missing" };
  }
  if (isDuplicateEntry(mainSheet,payload["CHASSIS NUMBER"],MAIN["CHASSIS NUMBER"])) {
    return { status: 0, message: "chassis number already exists" };
  }

  safeWriteRow(mainSheet, nextRow, payload, MAIN);
  return { status: 1, message: "stock data added successfully" };
}

function addInvoiceForm(data) {
  if (!data) {
    return { status: 0, message: "invalid payload" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const mainSheet = ss.getSheetByName("MAIN");

  if (!mainSheet) {
    return { status: 0, message: "MAIN not found" };
  }

  const chassis = normalize(data.chassis);
  const rowIndex = getRowIndexHandler(mainSheet,chassis,MAIN["CHASSIS NUMBER"]);

  if (rowIndex === -1) {
    return { status: 0, message: "chassis does not exist" };
  }

  const payload = {
    "INVOICE DATE": data.date || "",
    "PURCHASED INVOICE NUMBER": normalize(data.invoice),
    "GROSS VALUE BEFORE DISCOUNT": normalize(data.gvbd)
  };

  const requiredFields = [
    chassis,
    payload["INVOICE DATE"],
    payload["PURCHASED INVOICE NUMBER"],
    payload["GROSS VALUE BEFORE DISCOUNT"]
  ];

  if (requiredFields.some(v => !v)) {
    return { status: 0, message: "some fields are missing" };
  }

  safeWriteRow(mainSheet, rowIndex, payload, MAIN);
  return { status: 1, message: "invoice added successfully" };
}

function stockMovementForm(data) {
  if (!data) {
    return { status: 0, message: "invalid payload" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const mainSheet = ss.getSheetByName("MAIN");

  if (!mainSheet) {
    return { status: 0, message: "MAIN not found" };
  }

  const chassis = normalize(data.chassis);
  const payload = {
    "CURRENT COUNTER": normalize(data.counter)
  };

  const requiredFields = [
    chassis,
    payload["CURRENT COUNTER"]
  ];

  if (requiredFields.some(v => !v)) {
    return { status: 0, message: "some fields are missing" };
  }

  const rowIndex = getRowIndexHandler(
    mainSheet,
    chassis,
    MAIN["CHASSIS NUMBER"]
  );

  if (rowIndex === -1) {
    return { status: 0, message: "chassis does not exist" };
  }

  safeWriteRow(mainSheet, rowIndex, payload, MAIN);
  return { status: 1, message: "stock moved successfully" };
}

function advanceReceiveForm(data) {
  if (!data) {
    return { status: 0, message: "invalid payload" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const advanceSheet = ss.getSheetByName("ADVANCE");

  if (!advanceSheet) {
    return { status: 0, message: "ADVANCE not found" };
  }

  const nextRow = getFirstEmptyRow(advanceSheet, "A2:A");
  const payload = {
    "ADVANCE DATE": new Date(Date.now()),
    "ADVANCER NAME": normalize(data.advancer_name),
    "MOBILE NUMBER": normalize(data.mobile_number),
    "AMOUNT": normalize(data.amount),
    "COUNTER": normalize(data.counter),
    "RECEIVER NAME": normalize(data.receiver_name),
    "MODEL": normalize(data.model),
    "STATUS": "RECEIVED",
    "ALTERNATE MOBILE NUMBER": normalize(data.alternate_mobile_number),
    "COLOR": normalize(data.color),
    "REMARK": normalize(data.remark)
  };

  const requiredFields = [
    payload["ADVANCER NAME"],
    payload["MOBILE NUMBER"],
    payload["AMOUNT"],
    payload["COUNTER"],
    payload["RECEIVER NAME"],
    payload["MODEL"]
  ];

  if (requiredFields.some(v => !v)) {
    return { status: 0, message: "some fields are missing" };
  }

  if (isDuplicateAdvancerEntry(advanceSheet,payload["ADVANCER NAME"])) {
    return { status: 0, message: "advancer already exists" };
  }

  safeWriteRow(advanceSheet, nextRow, payload, ADVANCE);
  return { status: 1, message: "advance payment added successfully" };
}

function advanceReturnForm(data) {
  if (!data) {
    return { status: 0, message: "invalid payload" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const advanceSheet = ss.getSheetByName("ADVANCE");

  if (!advanceSheet) {
    return { status: 0, message: "ADVANCE not found" };
  }

  const payload = {
    "ADVANCER NAME": normalize(data.advancer_name),
    "ADVANCE RETURN": normalize(data.advance_return),
    "RETURN PERSON": normalize(data.return_person),
    "STATUS": "RETURNED"
  };

  const requiredFields = [
    payload["ADVANCER NAME"],
    payload["ADVANCE RETURN"],
    payload["RETURN PERSON"]
  ];

  if (requiredFields.some(v => !v)) {
    return { status: 0, message: "some fields are missing" };
  }

  const rowIndex = getAdvancerRowIndexHandler(
    advanceSheet,
    payload["ADVANCER NAME"]
  );

  if (rowIndex === -1) {
    return { status: 0, message: "advancer does not exist" };
  }

  safeWriteRow(advanceSheet, rowIndex, payload, ADVANCE);
  return { status: 1, message: "advance returned successfully" };
}