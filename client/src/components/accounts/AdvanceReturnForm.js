import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/AdvanceReturnForm.css";

const ADVANCER_COL = 9;
const RETURN_PERSON_COL = 4;

const AdvanceReturnForm = (() => {

    async function mount(container, session) {
        let advancerDropdown = null;
        let returnPersonDropdown = null;

        container.innerHTML = `
            <form id="advance-return-form" novalidate>
                <h2>Advance Return Form</h2>

                <div>
                    <label>Advancer Name *</label>
                    <div id="at-advancer-container"></div>
                </div>

                <div>
                    <label>Advance Return *</label>
                    <input id="at-return-amount" type="number" min="0" placeholder="Enter amount to return" />
                </div>

                <div>
                    <label>Return Person *</label>
                    <div id="at-return-person-container"></div>
                </div>

                <div>
                    <button id="at-submit" type="submit">Submit</button>
                    <span id="at-status"></span>
                </div>
            </form>
        `;

        const advancerContainer = container.querySelector("#at-advancer-container");
        const returnAmountInput = container.querySelector("#at-return-amount");
        const personContainer   = container.querySelector("#at-return-person-container");
        const submitButton       = container.querySelector("#at-submit");
        const statusEl           = container.querySelector("#at-status");
        const form               = container.querySelector("#advance-return-form");

        advancerDropdown = SearchableDropdown.mount(advancerContainer, {
            options:     [],
            placeholder: "Select advancer name..."
        });

        returnPersonDropdown = SearchableDropdown.mount(personContainer, {
            options:     [],
            placeholder: "Select return person..."
        });

        statusEl.textContent = "Fetching dropdown values...";
        statusEl.className   = "info";

        try {
            const [advancerRes, personRes] = await Promise.all([
                backendRequest("getDropdown", ADVANCER_COL),
                backendRequest("getDropdown", RETURN_PERSON_COL)
            ]);

            if (advancerRes.status === 1) advancerDropdown.setOptions(advancerRes.data);
            if (personRes.status === 1) returnPersonDropdown.setOptions(personRes.data);

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

            const advancer_name  = advancerDropdown.getValue();
            const advance_return = returnAmountInput.value.trim();
            const return_person  = returnPersonDropdown.getValue();

            if (!advancer_name || !advance_return || !return_person) {
                statusEl.textContent = "All fields are mandatory.";
                statusEl.className   = "error";
                return;
            }

            const payload = {
                advancer_name,
                advance_return: parseFloat(advance_return),
                return_person
            };

            submitButton.disabled = true;
            statusEl.textContent  = "Submitting...";
            statusEl.className    = "info";

            try {
                const res = await backendRequest("advanceReturnForm", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Advance returned successfully. Refreshing...";
                    statusEl.className   = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Submission failed.";
                    statusEl.className   = "error";
                }
            } catch (err) {
                statusEl.textContent = "Network error. Please try again.";
                statusEl.className   = "error";
                console.error("[advanceReturnForm]", err);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { AdvanceReturnForm };
