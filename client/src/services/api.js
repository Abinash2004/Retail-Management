import { BACKEND_URL, WEBAPP_TOKEN } from "./config.js";

async function backendRequest(action, payload) {
    const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action, token: WEBAPP_TOKEN, data: payload })
    });
    if (!response.ok) {
        throw new Error("unable to reach server");
    }
    return response.json();
}

export async function verifyPasscode(passcode) {
    if (!passcode) throw new Error("passcode required");
    return backendRequest("verifyPassword", passcode);
}
