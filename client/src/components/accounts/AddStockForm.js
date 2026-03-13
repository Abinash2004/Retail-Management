import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/AddStockForm.css";

const MODEL_COL   = 1;
const COLOR_COL   = 2;
const COUNTER_COL = 3;

const AddStockForm = (() => {

    async function mount(container, session) {
        let modelDropdown   = null;
        let colorDropdown   = null;
        let counterDropdown = null;

        container.innerHTML = `
            <form id="add-stock-form" novalidate>
                <h2>Add Stock Form</h2>

                <div>
                    <label>Chassis Number *</label>
                    <input id="as-chassis" type="text" placeholder="Enter chassis number" />
                </div>

                <div>
                    <label>Engine Number *</label>
                    <input id="as-engine" type="text" placeholder="Enter engine number" />
                </div>

                <div>
                    <label>Model *</label>
                    <div id="as-model-container"></div>
                </div>

                <div>
                    <label>Color *</label>
                    <div id="as-color-container"></div>
                </div>

                <div>
                    <label>Current Counter *</label>
                    <div id="as-counter-container"></div>
                </div>

                <div>
                    <label>Key Number (Optional)</label>
                    <input id="as-key" type="text" placeholder="Enter key number" />
                </div>

                <div>
                    <button id="as-submit" type="submit">Submit</button>
                    <span id="as-status"></span>
                </div>
            </form>
        `;

        const chassisInput    = container.querySelector("#as-chassis");
        const engineInput     = container.querySelector("#as-engine");
        const modelContainer  = container.querySelector("#as-model-container");
        const colorContainer  = container.querySelector("#as-color-container");
        const counterContainer = container.querySelector("#as-counter-container");
        const keyInput        = container.querySelector("#as-key");
        const submitButton    = container.querySelector("#as-submit");
        const statusEl        = container.querySelector("#as-status");
        const form            = container.querySelector("#add-stock-form");

        modelDropdown = SearchableDropdown.mount(modelContainer, {
            options:     [],
            placeholder: "Select model..."
        });

        colorDropdown = SearchableDropdown.mount(colorContainer, {
            options:     [],
            placeholder: "Select color..."
        });

        counterDropdown = SearchableDropdown.mount(counterContainer, {
            options:     [],
            placeholder: "Select counter..."
        });

        statusEl.textContent = "Fetching dropdown values...";
        statusEl.className   = "info";

        try {
            const [modelRes, colorRes, counterRes] = await Promise.all([
                backendRequest("getDropdown", MODEL_COL),
                backendRequest("getDropdown", COLOR_COL),
                backendRequest("getDropdown", COUNTER_COL)
            ]);

            if (modelRes.status === 1) modelDropdown.setOptions(modelRes.data);
            if (colorRes.status === 1) colorDropdown.setOptions(colorRes.data);
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

            const chassis = chassisInput.value.trim();
            const engine  = engineInput.value.trim();
            const model   = modelDropdown.getValue();
            const color   = colorDropdown.getValue();
            const counter = counterDropdown.getValue();
            const key     = keyInput.value.trim();

            if (!chassis || !engine || !model || !color || !counter) {
                statusEl.textContent = "All mandatory fields (*) are required.";
                statusEl.className   = "error";
                return;
            }

            const payload = {
                chassis,
                engine,
                model,
                color,
                counter,
                key
            };

            submitButton.disabled = true;
            statusEl.textContent  = "Submitting...";
            statusEl.className    = "info";

            try {
                const res = await backendRequest("addStockForm", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Stock added successfully. Refreshing...";
                    statusEl.className   = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Submission failed.";
                    statusEl.className   = "error";
                }
            } catch (err) {
                statusEl.textContent = "Network error. Please try again.";
                statusEl.className   = "error";
                console.error("[addStockForm]", err);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { AddStockForm };
