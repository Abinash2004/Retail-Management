function normalize(v) {
  return v ? v.toString().trim().toUpperCase() : "";
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeFollowUpStatus(value) {
  const status = normalize(value);
  if (status === "OPEN" || status === "OPENED") return "OPENED";
  if (status === "CLOSE" || status === "CLOSED") return "CLOSED";
  if (status === "PURCHASED") return "PURCHASED";
  if (status === "BOOKED") return "BOOKED";
  return status;
}

function supabaseRequest(method, endpoint, payload) {
  const options = {
    method,
    contentType: "application/json",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY
    },
    muteHttpExceptions: true
  };

  if (method === "POST" || method === "PATCH" || method === "DELETE") {
    options.headers.Prefer = "return=representation";
  }

  if (payload) options.payload = JSON.stringify(payload);
  const response = UrlFetchApp.fetch(
    SUPABASE_URL + endpoint,
    options
  );

  const text = response.getContentText();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      parsed.status = response.getResponseCode();
    }
    return parsed;
  } catch (err) {
    return {
      message: text,
      status: response.getResponseCode()
    };
  }
}
