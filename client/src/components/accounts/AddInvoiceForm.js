import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/AddInvoiceForm.css";

const CHASSIS_COL = 11;

const AddInvoiceForm = (() => {

    async function mount(container, session) {
        let chassisDropdown = null;

        container.innerHTML = `
            <form id="add-invoice-form" novalidate>
                <h2>Add Invoice Form</h2>

                <div>
                    <label>Chassis Number *</label>
                    <div id="ai-chassis-container"></div>
                </div>

                <div>
                    <label>Invoice Date *</label>
                    <input id="ai-date" type="date" />
                </div>

                <div>
                    <label>Purchased Invoice Number *</label>
                    <input id="ai-invoice" type="text" placeholder="Enter invoice number" />
                </div>

                <div>
                    <label>Gross Value Before Discount *</label>
                    <input id="ai-gvbd" type="number" step="0.01" placeholder="Enter gross value" />
                </div>

                <div>
                    <button id="ai-submit" type="submit">Submit</button>
                    <span id="ai-status"></span>
                </div>
            </form>
        `;

        const chassisContainer = container.querySelector("#ai-chassis-container");
        const dateInput         = container.querySelector("#ai-date");
        const invoiceInput      = container.querySelector("#ai-invoice");
        const gvbdInput         = container.querySelector("#ai-gvbd");
        const submitButton      = container.querySelector("#ai-submit");
        const statusEl          = container.querySelector("#ai-status");
        const form              = container.querySelector("#add-invoice-form");

        chassisDropdown = SearchableDropdown.mount(chassisContainer, {
            options:     [],
            placeholder: "Select chassis number..."
        });

        statusEl.textContent = "Fetching chassis numbers...";
        statusEl.className   = "info";

        try {
            const res = await backendRequest("getDropdown", CHASSIS_COL);
            if (res.status === 1) {
                chassisDropdown.setOptions(res.data);
                statusEl.textContent = "";
                statusEl.className   = "";
            } else {
                statusEl.textContent = res.message || "Failed to fetch chassis numbers.";
                statusEl.className   = "error";
            }
        } catch (err) {
            statusEl.textContent = "Error fetching chassis numbers.";
            statusEl.className   = "error";
            console.error("[getDropdown]", err);
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            statusEl.textContent = "";

            const chassis = chassisDropdown.getValue();
            const date    = dateInput.value;
            const invoice = invoiceInput.value.trim();
            const gvbd    = gvbdInput.value.trim();

            if (!chassis || !date || !invoice || !gvbd) {
                statusEl.textContent = "All fields are mandatory.";
                statusEl.className   = "error";
                return;
            }

            const payload = {
                chassis,
                date,
                invoice,
                gvbd: parseFloat(gvbd)
            };

            submitButton.disabled = true;
            statusEl.textContent  = "Submitting...";
            statusEl.className    = "info";

            try {
                const res = await backendRequest("addInvoiceForm", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Invoice added successfully. Refreshing...";
                    statusEl.className   = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Submission failed.";
                    statusEl.className   = "error";
                }
            } catch (err) {
                statusEl.textContent = "Network error. Please try again.";
                statusEl.className   = "error";
                console.error("[addInvoiceForm]", err);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { AddInvoiceForm };
