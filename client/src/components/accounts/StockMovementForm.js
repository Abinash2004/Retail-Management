import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/StockMovementForm.css";

const CHASSIS_COL = 10;
const COUNTER_COL = 3;

const StockMovementForm = (() => {

    async function mount(container, session) {
        let chassisDropdown = null;
        let counterDropdown = null;

        container.innerHTML = `
            <form id="stock-movement-form" novalidate>
                <h2>Stock Movement Form</h2>

                <div>
                    <label>Chassis Number *</label>
                    <div id="sm-chassis-container"></div>
                </div>

                <div>
                    <label>New Counter *</label>
                    <div id="sm-counter-container"></div>
                </div>

                <div>
                    <button id="sm-submit" type="submit">Submit</button>
                    <span id="sm-status"></span>
                </div>
            </form>
        `;

        const chassisContainer = container.querySelector("#sm-chassis-container");
        const counterContainer = container.querySelector("#sm-counter-container");
        const submitButton     = container.querySelector("#sm-submit");
        const statusEl         = container.querySelector("#sm-status");
        const form             = container.querySelector("#stock-movement-form");

        chassisDropdown = SearchableDropdown.mount(chassisContainer, {
            options:     [],
            placeholder: "Select chassis number..."
        });

        counterDropdown = SearchableDropdown.mount(counterContainer, {
            options:     [],
            placeholder: "Select counter..."
        });

        statusEl.textContent = "Fetching dropdown values...";
        statusEl.className   = "info";

        try {
            const [chassisRes, counterRes] = await Promise.all([
                backendRequest("getDropdown", CHASSIS_COL),
                backendRequest("getDropdown", COUNTER_COL)
            ]);

            if (chassisRes.status === 1) chassisDropdown.setOptions(chassisRes.data);
            if (counterRes.status === 1) counterDropdown.setOptions(counterRes.data);

            statusEl.textContent = "";
            statusEl.className   = "";
        } catch (err) {
            statusEl.textContent = "Error fetching dropdown values.";
            statusEl.className   = "error";
            console.error("[getDropdown]", err);
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            statusEl.textContent = "";

            const chassis = chassisDropdown.getValue();
            const counter = counterDropdown.getValue();

            if (!chassis || !counter) {
                statusEl.textContent = "All fields are mandatory.";
                statusEl.className   = "error";
                return;
            }

            const payload = {
                chassis,
                counter
            };

            submitButton.disabled = true;
            statusEl.textContent  = "Submitting...";
            statusEl.className    = "info";

            try {
                const res = await backendRequest("stockMovementForm", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Stock moved successfully. Refreshing...";
                    statusEl.className   = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Submission failed.";
                    statusEl.className   = "error";
                }
            } catch (err) {
                statusEl.textContent = "Network error. Please try again.";
                statusEl.className   = "error";
                console.error("[stockMovementForm]", err);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { StockMovementForm };
