import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/OptionalFieldForm.css";

const COLS = {
    KEY_NUMBER: 14,
    EST_DISBURSEMENT: 15,
    CUST_ALT_MOBILE: 16,
    ADV_ALT_MOBILE: 17
};

const OptionalFieldForm = (() => {

    async function mount(container, session) {
        let dropdowns = {
            keyChassis: null,
            estChassis: null,
            custChassis: null,
            advName: null
        };

        container.innerHTML = `
            <form id="optional-field-form" novalidate>
                <h2>Optional Field Form</h2>

                <div>
                    <label>Optional Field *</label>
                    <select id="off-type">
                        <option value="">Select type...</option>
                        <option value="1">Key Number</option>
                        <option value="2">Customer Alternate Mobile Number</option>
                        <option value="3">Estimated Disbursement</option>
                        <option value="4">Advancer Alternate Mobile Number</option>
                    </select>
                </div>

                <!-- Case 1: Key Number -->
                <div id="section-1" class="off-section">
                    <div>
                        <label>Chassis Number *</label>
                        <div id="off-chassis-1"></div>
                    </div>
                    <div>
                        <label>Model</label>
                        <input id="off-model-1" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Color</label>
                        <input id="off-color-1" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Key Number *</label>
                        <input id="off-key-val" type="text" placeholder="Enter key number" />
                    </div>
                </div>

                <!-- Case 2: Customer Alt Mobile -->
                <div id="section-2" class="off-section">
                    <div>
                        <label>Chassis Number *</label>
                        <div id="off-chassis-2"></div>
                    </div>
                    <div>
                        <label>Customer Name</label>
                        <input id="off-customer-2" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Customer Alternate Mobile Number *</label>
                        <input id="off-cust-mobile-val" type="tel" maxlength="10" placeholder="10-digit number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                    </div>
                </div>

                <!-- Case 3: Estimated Disbursement -->
                <div id="section-3" class="off-section">
                    <div>
                        <label>Chassis Number *</label>
                        <div id="off-chassis-3"></div>
                    </div>
                    <div>
                        <label>Customer Name</label>
                        <input id="off-customer-3" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Estimated Disbursement *</label>
                        <input id="off-est-disb-val" type="number" placeholder="Enter amount" />
                    </div>
                </div>

                <!-- Case 4: Advancer Alt Mobile -->
                <div id="section-4" class="off-section">
                    <div>
                        <label>Advancer Name *</label>
                        <div id="off-adv-name-4"></div>
                    </div>
                    <div>
                        <label>Advancer Alternate Mobile Number *</label>
                        <input id="off-adv-mobile-val" type="tel" maxlength="10" placeholder="10-digit number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                    </div>
                </div>

                <div>
                    <button id="off-submit" type="submit" disabled>Submit</button>
                    <span id="off-status"></span>
                </div>
            </form>
        `;

        const typeSelect = container.querySelector("#off-type");
        const submitButton = container.querySelector("#off-submit");
        const statusEl = container.querySelector("#off-status");
        const form = container.querySelector("#optional-field-form");

        const sections = {
            1: container.querySelector("#section-1"),
            2: container.querySelector("#section-2"),
            3: container.querySelector("#section-3"),
            4: container.querySelector("#section-4")
        };

        const inputs = {
            1: { keyNumber: container.querySelector("#off-key-val"), model: container.querySelector("#off-model-1"), color: container.querySelector("#off-color-1") },
            2: { alternateMobileNumber: container.querySelector("#off-cust-mobile-val"), customer: container.querySelector("#off-customer-2") },
            3: { estimatedDisbursement: container.querySelector("#off-est-disb-val"), customer: container.querySelector("#off-customer-3") },
            4: { alternateMobileNumber: container.querySelector("#off-adv-mobile-val") }
        };

        // Initialize Dropdowns
        dropdowns.keyChassis = SearchableDropdown.mount(container.querySelector("#off-chassis-1"), {
            placeholder: "Select chassis number...",
            onChange: async (val) => {
                if (!val) { inputs[1].model.value = ""; inputs[1].color.value = ""; return; }
                inputs[1].model.value = "Fetching..."; inputs[1].color.value = "Fetching...";
                try {
                    const res = await backendRequest("getChassis", val);
                    if (res.status === 1) { inputs[1].model.value = res.data.model || "N/A"; inputs[1].color.value = res.data.color || "N/A"; }
                } catch (e) { console.error(e); }
            }
        });

        dropdowns.custChassis = SearchableDropdown.mount(container.querySelector("#off-chassis-2"), {
            placeholder: "Select chassis number...",
            onChange: async (val) => {
                if (!val) { inputs[2].customer.value = ""; return; }
                inputs[2].customer.value = "Fetching...";
                try {
                    const res = await backendRequest("getChassis", val);
                    if (res.status === 1) { inputs[2].customer.value = res.data.customer || "N/A"; }
                } catch (e) { console.error(e); }
            }
        });

        dropdowns.estChassis = SearchableDropdown.mount(container.querySelector("#off-chassis-3"), {
            placeholder: "Select chassis number...",
            onChange: async (val) => {
                if (!val) { inputs[3].customer.value = ""; return; }
                inputs[3].customer.value = "Fetching...";
                try {
                    const res = await backendRequest("getChassis", val);
                    if (res.status === 1) { inputs[3].customer.value = res.data.customer || "N/A"; }
                } catch (e) { console.error(e); }
            }
        });

        dropdowns.advName = SearchableDropdown.mount(container.querySelector("#off-adv-name-4"), {
            placeholder: "Select advancer name..."
        });

        // Type Change Handler
        typeSelect.addEventListener("change", () => {
            Object.values(sections).forEach(s => s.classList.remove("visible"));
            const code = typeSelect.value;
            if (code && sections[code]) {
                sections[code].classList.add("visible");
                submitButton.disabled = false;
            } else {
                submitButton.disabled = true;
            }
            statusEl.textContent = "";
        });

        // Pre-fetch Dropdowns
        statusEl.textContent = "Fetching dropdowns...";
        statusEl.className = "info";
        try {
            const [res1, res2, res3, res4] = await Promise.all([
                backendRequest("getDropdown", COLS.KEY_NUMBER),
                backendRequest("getDropdown", COLS.CUST_ALT_MOBILE),
                backendRequest("getDropdown", COLS.EST_DISBURSEMENT),
                backendRequest("getDropdown", COLS.ADV_ALT_MOBILE)
            ]);
            if (res1.status === 1) dropdowns.keyChassis.setOptions(res1.data);
            if (res2.status === 1) dropdowns.custChassis.setOptions(res2.data);
            if (res3.status === 1) dropdowns.estChassis.setOptions(res3.data);
            if (res4.status === 1) dropdowns.advName.setOptions(res4.data);
            statusEl.textContent = "";
        } catch (err) {
            statusEl.textContent = "Error loading data.";
            statusEl.className = "error";
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const code = parseInt(typeSelect.value);
            let payload = { code };

            if (code === 1) {
                payload.chassis = dropdowns.keyChassis.getValue();
                payload.keyNumber = inputs[1].keyNumber.value.trim();
                if (!payload.chassis || !payload.keyNumber) { statusEl.textContent = "All fields required."; statusEl.className = "error"; return; }
            } else if (code === 2) {
                payload.chassis = dropdowns.custChassis.getValue();
                payload.alternateMobileNumber = inputs[2].alternateMobileNumber.value.trim();
                if (!payload.chassis || !payload.alternateMobileNumber) { statusEl.textContent = "All fields required."; statusEl.className = "error"; return; }
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(payload.alternateMobileNumber)) { statusEl.textContent = "Valid 10-digit mobile number required."; statusEl.className = "error"; return; }
            } else if (code === 3) {
                payload.chassis = dropdowns.estChassis.getValue();
                payload.estimatedDisbursement = inputs[3].estimatedDisbursement.value.trim();
                if (!payload.chassis || !payload.estimatedDisbursement) { statusEl.textContent = "All fields required."; statusEl.className = "error"; return; }
            } else if (code === 4) {
                payload.advancerName = dropdowns.advName.getValue();
                payload.alternateMobileNumber = inputs[4].alternateMobileNumber.value.trim();
                if (!payload.advancerName || !payload.alternateMobileNumber) { statusEl.textContent = "All fields required."; statusEl.className = "error"; return; }
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(payload.alternateMobileNumber)) { statusEl.textContent = "Valid 10-digit mobile number required."; statusEl.className = "error"; return; }
            }

            submitButton.disabled = true;
            statusEl.textContent = "Submitting...";
            statusEl.className = "info";

            try {
                const res = await backendRequest("optionalFieldForm", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Updated successfully. Refreshing...";
                    statusEl.className = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Failed.";
                    statusEl.className = "error";
                    submitButton.disabled = false;
                }
            } catch (err) {
                statusEl.textContent = "Network error.";
                statusEl.className = "error";
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { OptionalFieldForm };
