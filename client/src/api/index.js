import { BACKEND_URL, WEBAPP_TOKEN } from "../config/index.js";

export async function backendRequest(action, payload) {
    const requestBody = { action, token: WEBAPP_TOKEN, data: payload };
    console.log(`[REQUEST]`, requestBody);

    const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        console.error(`[ERROR] HTTP ${response.status}`, response.statusText);
        throw new Error("unable to reach server");
    }

    const data = await response.json();
    console.log(`[RESPONSE]`, data);
    return data;
}
