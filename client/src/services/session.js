import { WEBAPP_TOKEN } from "./config.js";

const SESSION_KEY = "rm_session";
const TTL_MS = 6 * 60 * 60 * 1000;

let cachedKey = null;

async function getKey() {
    if (cachedKey) return cachedKey;
    const enc = new TextEncoder();
    cachedKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(WEBAPP_TOKEN),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
    return cachedKey;
}

async function sign(payload) {
    const enc = new TextEncoder();
    const key = await getKey();
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verify(payload, signature) {
    const enc = new TextEncoder();
    const key = await getKey();
    const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
}

export async function setSession(role, branch) {
    const exp = Date.now() + TTL_MS;
    const payload = JSON.stringify({ role, branch, exp });
    const sig = await sign(payload);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ payload, sig }));
}

export async function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const { payload, sig } = JSON.parse(raw);
        const ok = await verify(payload, sig);
        if (!ok) { clearSession(); return null; }
        const { role, branch, exp } = JSON.parse(payload);
        if (Date.now() > exp) { clearSession(); return null; }
        return { role, branch };
    } catch {
        clearSession();
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
