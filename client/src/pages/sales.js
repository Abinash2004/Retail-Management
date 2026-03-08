import { clearSession } from "../services/session.js";
import { DailyTransactionForm } from "../components/DailyTransactionForm.js";
import "../style/SalesPage.css";
import "../style/Sidebar.css";
import "../style/FormContainer.css";

const FORMS = [
    { label: "Daily Transaction", component: DailyTransactionForm }
];

export function renderSales(session) {
    document.getElementById("app").innerHTML = `
        <div id="sales-page">
            <div id="sales-sidebar">
                <h3>Forms</h3>
                <ul id="form-list"></ul>
                <hr>
                <button id="logout">Logout</button>
            </div>
            <div id="sales-content">
                <p>Select a form from the sidebar.</p>
            </div>
        </div>
    `;

    const formList    = document.getElementById("form-list");
    const contentArea = document.getElementById("sales-content");
    let activeIndex   = null;

    FORMS.forEach(({ label, component }, index) => {
        const li = document.createElement("li");
        li.textContent   = label;
        li.dataset.index = index;

        li.addEventListener("click", () => {
            if (activeIndex === index) return;
            activeIndex = index;

            formList.querySelectorAll("li").forEach(el => el.removeAttribute("data-active"));
            li.dataset.active = "true";

            contentArea.innerHTML = "";
            component.mount(contentArea, session);
        });

        formList.appendChild(li);
    });

    document.getElementById("logout").addEventListener("click", () => {
        clearSession();
        window.navigateTo();
    });
}
