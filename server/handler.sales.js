function getDropdown(columnIndex) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("COLLECTION");

  if (!sheet) {
    return { status: 0, message: "COLLECTION not found" };
  }

  const col = parseInt(columnIndex, 10);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { status: 1, data: [] };
  }

  const values = sheet
  .getRange(2, col, lastRow - 1, 1)
  .getValues()
  .flat()
  .filter(Boolean);
  
  const unique = [...new Set(values)];
  return { status: 1, data: unique };
}

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
  const receivedDPCol = MAIN["RECEIVED DP"];

  const model = mainSheet.getRange(rowIndex, modelCol).getValue();
  const color = mainSheet.getRange(rowIndex, colorCol).getValue();
  const customer = mainSheet.getRange(rowIndex, customerCol).getValue();
  const receivedDP = mainSheet.getRange(rowIndex, receivedDPCol).getValue();

  return {
    status: 1,
    data: {
      model,
      color,
      customer,
      receivedDP
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
  const returnAmountCol = ADVANCE["ADVANCE RETURN"];
  const amount = advanceSheet.getRange(rowIndex, amountCol).getValue();
  const returnAmount = advanceSheet.getRange(rowIndex, returnAmountCol).getValue();

  return {
    status: 1,
    data: { amount, returnAmount }
  };
}

function newWalkInForm(data) {
  if (!data) {
    return { status: 0, message: "invalid payload" };
  }

  const payload = {
    visit_date: new Date().toISOString(),
    location: normalize(data.location),
    customer_name: normalize(data.customerName),
    mobile_number: normalize(data.mobileNumber),
    address: normalize(data.address),
    vehicle_details: normalize(data.vehicleDetails),
    status: "OPENED"
  };

  const requiredFields = [
    payload.location,
    payload.customer_name,
    payload.mobile_number
  ];

  if (requiredFields.some(v => !v)) {
    return { status: 0, message: "some fields are missing" };
  }

  const response = supabaseRequest("POST", "/rest/v1/follow_up", payload);

  if (response && response.message && !Array.isArray(response)) {
    if (
      response.status === 409 ||
      String(response.code || "").trim() === "23505" ||
      /duplicate key value violates unique constraint/i.test(response.message || "")
    ) {
      return { status: 0, message: "customer with this mobile number already exists" };
    }
    return { status: 0, message: response.message };
  }

  return { status: 1, message: "data added successfully" };
}

function getFollowUpList(data) {
  if (!data || !data.page || !data.limit) {
    return { status: 0, message: "invalid payload" };
  }

  const targetStatus = normalizeFollowUpStatus(data.status);
  const offset = (data.page - 1) * data.limit;

  let endpoint = "/rest/v1/follow_up?select=*";
  if (data.branch && String(data.branch).trim() !== "ALL") {
    const targetBranch = normalize(data.branch);
    endpoint += "&location=eq." + encodeURIComponent(targetBranch);
  }
  if (targetStatus && targetStatus !== "ALL") {
    endpoint += "&status=eq." + encodeURIComponent(targetStatus);
  }
  if (data.visitDateFrom) {
    endpoint += "&visit_date=gte." + encodeURIComponent(data.visitDateFrom);
  }
  if (data.visitDateTo) {
    endpoint += "&visit_date=lte." + encodeURIComponent(data.visitDateTo + "T23:59:59.999Z");
  }
  if (data.firstFeedbackDateFrom) {
    endpoint += "&first_feedback_date=gte." + encodeURIComponent(data.firstFeedbackDateFrom);
  }
  if (data.firstFeedbackDateTo) {
    endpoint += "&first_feedback_date=lte." + encodeURIComponent(data.firstFeedbackDateTo + "T23:59:59.999Z");
  }
  if (data.lastFeedbackDateFrom) {
    endpoint += "&last_feedback_date=gte." + encodeURIComponent(data.lastFeedbackDateFrom);
  }
  if (data.lastFeedbackDateTo) {
    endpoint += "&last_feedback_date=lte." + encodeURIComponent(data.lastFeedbackDateTo + "T23:59:59.999Z");
  }
  endpoint += "&order=visit_date.desc,serial_number.desc" + "&limit=" + data.limit + "&offset=" + offset;

  const response = supabaseRequest("GET", endpoint);

  if (!Array.isArray(response)) {
    return { status: 0, message: response.message };
  }

  return { status: 1, message: "success", data: response };
}

function updateFollowUpForm(data) {
  if (!data || !data.serialNumber) {
    return { status: 0, message: "invalid payload" };
  }

  const serialNumber = parseInt(data.serialNumber, 10);

  const existing = supabaseRequest(
    "GET",
    "/rest/v1/follow_up?select=first_feedback&serial_number=eq." + serialNumber
  );

  if (!Array.isArray(existing)) return { status: 0, message: existing.message };
  if (!existing.length) return { status: 0, message: "record not found" };

  const payload = {
    address: normalize(data.address),
    vehicle_details: normalize(data.vehicleDetails),
    status: normalizeFollowUpStatus(data.status)
  };

  if (!existing[0].first_feedback) {
    payload.first_feedback = normalize(data.firstFeedback);
    payload.first_feedback_date = new Date().toISOString();
  } else {
    payload.last_feedback = normalize(data.lastFeedback);
    payload.last_feedback_date = new Date().toISOString();
  }

  const response = supabaseRequest(
    "PATCH",
    "/rest/v1/follow_up?serial_number=eq." + serialNumber,
    payload
  );

  if (!Array.isArray(response)) {
    return { status: 0, message: response.message };
  }

  return { status: 1, message: "follow up updated successfully" };
}
