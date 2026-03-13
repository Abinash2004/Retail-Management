import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/AdvanceReceiveForm.css";

const COUNTER_COL  = 3;
const RECEIVER_COL = 4;
const MODEL_COL    = 1;
const COLOR_COL    = 2;

const AdvanceReceiveForm = (() => {

    async function mount(container, session) {
        let counterDropdown  = null;
        let receiverDropdown = null;
        let modelDropdown    = null;
        let colorDropdown    = null;

        container.innerHTML = `
            <form id="advance-receive-form" novalidate>
                <h2>Advance Receive Form</h2>

                <div>
                    <label>Advancer Name *</label>
                    <input id="ar-advancer-name" type="text" placeholder="Enter advancer name" />
                </div>

                <div>
                    <label>Mobile Number *</label>
                    <input id="ar-mobile" type="tel" maxlength="10" placeholder="Enter 10-digit mobile number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                </div>

                <div>
                    <label>Alternate Mobile Number (Optional)</label>
                    <input id="ar-alt-mobile" type="tel" maxlength="10" placeholder="Enter 10-digit alternate mobile number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                </div>

                <div>
                    <label>Amount *</label>
                    <input id="ar-amount" type="number" min="0" placeholder="Enter amount" />
                </div>

                <div>
                    <label>Counter *</label>
                    <div id="ar-counter-container"></div>
                </div>

                <div>
                    <label>Receiver Name *</label>
                    <div id="ar-receiver-container"></div>
                </div>

                <div>
                    <label>Model *</label>
                    <div id="ar-model-container"></div>
                </div>

                <div>
                    <label>Color (Optional)</label>
                    <div id="ar-color-container"></div>
                </div>

                <div>
                    <label>Remark (Optional)</label>
                    <textarea id="ar-remark" placeholder="Enter remark" rows="3"></textarea>
                </div>

                <div>
                    <button id="ar-submit" type="submit">Submit</button>
                    <span id="ar-status"></span>
                </div>
            </form>
        `;

        const nameInput        = container.querySelector("#ar-advancer-name");
        const mobileInput      = container.querySelector("#ar-mobile");
        const altMobileInput   = container.querySelector("#ar-alt-mobile");
        const amountInput      = container.querySelector("#ar-amount");
        const counterContainer = container.querySelector("#ar-counter-container");
        const receiverContainer = container.querySelector("#ar-receiver-container");
        const modelContainer   = container.querySelector("#ar-model-container");
        const colorContainer   = container.querySelector("#ar-color-container");
        const remarkInput      = container.querySelector("#ar-remark");
        const submitButton     = container.querySelector("#ar-submit");
        const statusEl         = container.querySelector("#ar-status");
        const form             = container.querySelector("#advance-receive-form");

        counterDropdown = SearchableDropdown.mount(counterContainer, {
            options:     [],
            placeholder: "Select counter..."
        });

        receiverDropdown = SearchableDropdown.mount(receiverContainer, {
            options:     [],
            placeholder: "Select receiver..."
        });

        modelDropdown = SearchableDropdown.mount(modelContainer, {
            options:     [],
            placeholder: "Select model..."
        });

        colorDropdown = SearchableDropdown.mount(colorContainer, {
            options:     [],
            placeholder: "Select color..."
        });

        statusEl.textContent = "Fetching dropdown values...";
        statusEl.className   = "info";

        try {
            const [counterRes, receiverRes, modelRes, colorRes] = await Promise.all([
                backendRequest("getDropdown", COUNTER_COL),
                backendRequest("getDropdown", RECEIVER_COL),
                backendRequest("getDropdown", MODEL_COL),
                backendRequest("getDropdown", COLOR_COL)
            ]);

            if (counterRes.status === 1) counterDropdown.setOptions(counterRes.data);
            if (receiverRes.status === 1) receiverDropdown.setOptions(receiverRes.data);
            if (modelRes.status === 1) modelDropdown.setOptions(modelRes.data);
            if (colorRes.status === 1) colorDropdown.setOptions(colorRes.data);

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
            statusEl.className   = "";

            const advancer_name           = nameInput.value.trim();
            const mobile_number          = mobileInput.value.trim();
            const alternate_mobile_number = altMobileInput.value.trim();
            const amount                 = amountInput.value.trim();
            const counter                = counterDropdown.getValue();
            const receiver_name          = receiverDropdown.getValue();
            const model                  = modelDropdown.getValue();
            const color                  = colorDropdown.getValue();
            const remark                 = remarkInput.value.trim();

            if (!advancer_name || !mobile_number || !amount || !counter || !receiver_name || !model) {
                statusEl.textContent = "All mandatory fields (*) are required.";
                statusEl.className   = "error";
                return;
            }

            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(mobile_number)) {
                statusEl.textContent = "Please enter a valid 10-digit Mobile Number.";
                statusEl.className   = "error";
                return;
            }

            if (alternate_mobile_number && !phoneRegex.test(alternate_mobile_number)) {
                statusEl.textContent = "Please enter a valid 10-digit Alternate Mobile Number.";
                statusEl.className   = "error";
                return;
            }

            const payload = {
                advancer_name,
                mobile_number,
                alternate_mobile_number,
                amount: parseFloat(amount),
                counter,
                receiver_name,
                model,
                color,
                remark
            };

            submitButton.disabled = true;
            statusEl.textContent  = "Submitting...";
            statusEl.className    = "info";

            try {
                const res = await backendRequest("advanceReceiveForm", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Advance received successfully. Refreshing...";
                    statusEl.className   = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Submission failed.";
                    statusEl.className   = "error";
                }
            } catch (err) {
                statusEl.textContent = "Network error. Please try again.";
                statusEl.className   = "error";
                console.error("[advanceReceiveForm]", err);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { AdvanceReceiveForm };
