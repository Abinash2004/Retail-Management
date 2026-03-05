import { clearSession } from "../services/session.js";

export function renderSales(session) {
    document.getElementById("app").innerHTML = `
        <div id="sales-page">
            <h1>Sales Dashboard</h1>
            <p>Branch: ${session.branch}</p>
            <button id="logout">Logout</button>
        </div>
    `;

    document.getElementById("logout").addEventListener("click", () => {
        clearSession();
        navigateTo("/login");
    });
}
