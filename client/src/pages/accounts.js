import { clearSession } from "../services/session.js";
import { AddStockForm } from "../components/accounts/AddStockForm.js";
import { AddInvoiceForm } from "../components/accounts/AddInvoiceForm.js";
import { StockMovementForm } from "../components/accounts/StockMovementForm.js";
import { AdvanceReceiveForm } from "../components/accounts/AdvanceReceiveForm.js";
import { AdvanceReturnForm } from "../components/accounts/AdvanceReturnForm.js";
import { AddSaleForm } from "../components/accounts/AddSaleForm.js";
import { AddSaleAccountForm } from "../components/accounts/AddSaleAccountForm.js";
import { AddRegistrationForm } from "../components/accounts/AddRegistrationForm.js";
import { OptionalFieldForm } from "../components/accounts/OptionalFieldForm.js";
import "../style/accounts/AccountsPage.css";
import "../style/accounts/Sidebar.css";
import "../style/accounts/FormContainer.css";

const FORMS = [
    { label: "Add Stock Form", component: AddStockForm },
    { label: "Add Invoice Form", component: AddInvoiceForm },
    { label: "Stock Movement Form", component: StockMovementForm },
    { label: "Advance Receive Form", component: AdvanceReceiveForm },
    { label: "Advance Return Form", component: AdvanceReturnForm },
    { label: "Add Sale Form", component: AddSaleForm },
    { label: "Add Sale Account Form", component: AddSaleAccountForm },
    { label: "Add Registration Form", component: AddRegistrationForm },
    { label: "Optional Field Form", component: OptionalFieldForm }
];

export function renderAccounts(session) {
    document.getElementById("app").innerHTML = `
        <div id="accounts-page">
            <div id="accounts-sidebar">
                <h3>Accounts</h3>
                <ul id="accounts-form-list"></ul>
                <hr>
                <button id="logout">Logout</button>
            </div>
            <div id="accounts-content">
                <p>Select a form from the sidebar.</p>
            </div>
        </div>
    `;

    const formList    = document.getElementById("accounts-form-list");
    const contentArea = document.getElementById("accounts-content");
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
        window.navigateTo("/login");
    });
}
