import { backendRequest } from "../api/index.js";
import { setSession } from "../services/session.js";

export function renderLogin() {
    document.getElementById("app").innerHTML = `
        <div id="login-page">
            <h1>Retail Management</h1>
            <form id="login-form">
                <input id="passcode" type="password" placeholder="Enter passcode" autocomplete="off" />
                <button type="submit">Login</button>
                <p id="login-error"></p>
            </form>
        </div>
    `;

    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const passcode = document.getElementById("passcode").value.trim();
        const errorEl = document.getElementById("login-error");
        errorEl.textContent = "";

        if (!passcode) {
            errorEl.textContent = "Passcode is required.";
            return;
        }

        try {
            const res = await backendRequest("verifyPassword", passcode);
            if (res.status !== 1) {
                errorEl.textContent = res.message;
                return;
            }

            const { role, branch } = res.data;
            if (!role) {
                errorEl.textContent = "Invalid user data received.";
                return;
            }

            await setSession(role, branch);
            navigateTo(role === "accounts" ? "/accounts" : "/showroom");

        } catch {
            errorEl.textContent = "Server unreachable. Try again.";
        }
    });
}
