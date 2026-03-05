import { clearSession } from "../services/session.js";

export function renderAccounts(session) {
    document.getElementById("app").innerHTML = `
        <div id="accounts-page">
            <h1>Accounts Dashboard</h1>
            <button id="logout">Logout</button>
        </div>
    `;

    document.getElementById("logout").addEventListener("click", () => {
        clearSession();
        navigateTo("/login");
    });
}
