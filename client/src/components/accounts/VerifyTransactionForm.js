import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/VerifyTransactionForm.css";

const COLS = {
    ADV_REC: 18,
    ADV_RET: 19,
    DP: 20,
    INS: 21,
    RTO: 22,
    DISB: 23,
    EXCH: 24,
    CODE_25: 25,
    CODE_26: 26,
    CODE_27: 27
};

const VerifyTransactionForm = (() => {

    async function mount(container, session) {
        let dropdowns = {
            advRecName: null,
            advRecCode: null,
            advRetName: null,
            advRetCode: null,
            dpChassis: null,
            dpCode: null,
            insChassis: null,
            insCode: null,
            rtoChassis: null,
            rtoCode: null,
            disbChassis: null,
            disbCode: null,
            exchChassis: null,
            exchCode: null
        };

        container.innerHTML = `
            <form id="verify-transaction-form" novalidate>
                <h2>Verify Transaction Form</h2>

                <div>
                    <label>Transaction Field *</label>
                    <select id="vtf-type">
                        <option value="">Select type...</option>
                        <option value="1">Advance Received</option>
                        <option value="2">Advance Returned</option>
                        <option value="3">Received Down Payment</option>
                        <option value="4">Insurance Amount</option>
                        <option value="5">RTO Amount</option>
                        <option value="6">Disbursement Amount</option>
                        <option value="7">Exchange Amount</option>
                    </select>
                </div>

                <!-- Case 1: Advance Received -->
                <div id="vtf-section-1" class="vtf-section">
                    <div>
                        <label>Advancer Name *</label>
                        <div id="vtf-adv-rec-name"></div>
                    </div>
                    <div>
                        <label>Advance Received Amount</label>
                        <input id="vtf-adv-rec-amt" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Transaction Code *</label>
                        <div id="vtf-adv-rec-code"></div>
                    </div>
                </div>

                <!-- Case 2: Advance Returned -->
                <div id="vtf-section-2" class="vtf-section">
                    <div>
                        <label>Advancer Name *</label>
                        <div id="vtf-adv-ret-name"></div>
                    </div>
                    <div>
                        <label>Advance Returned Amount</label>
                        <input id="vtf-adv-ret-amt" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Transaction Code *</label>
                        <div id="vtf-adv-ret-code"></div>
                    </div>
                </div>

                <!-- Case 3: Received Down Payment -->
                <div id="vtf-section-3" class="vtf-section">
                    <div>
                        <label>Chassis Number *</label>
                        <div id="vtf-dp-chassis"></div>
                    </div>
                    <div>
                        <label>Customer Name</label>
                        <input id="vtf-dp-cust" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Received Down Payment Amount</label>
                        <input id="vtf-dp-amt" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Transaction Code *</label>
                        <div id="vtf-dp-code"></div>
                    </div>
                </div>

                <!-- Case 4: Insurance Amount -->
                <div id="vtf-section-4" class="vtf-section">
                    <div>
                        <label>Chassis Number *</label>
                        <div id="vtf-ins-chassis"></div>
                    </div>
                    <div>
                        <label>Customer Name</label>
                        <input id="vtf-ins-cust" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Transaction Code *</label>
                        <div id="vtf-ins-code"></div>
                    </div>
                </div>

                <!-- Case 5: RTO Amount -->
                <div id="vtf-section-5" class="vtf-section">
                    <div>
                        <label>Chassis Number *</label>
                        <div id="vtf-rto-chassis"></div>
                    </div>
                    <div>
                        <label>Customer Name</label>
                        <input id="vtf-rto-cust" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Transaction Code *</label>
                        <div id="vtf-rto-code"></div>
                    </div>
                </div>

                <!-- Case 6: Disbursement Amount -->
                <div id="vtf-section-6" class="vtf-section">
                    <div>
                        <label>Chassis Number *</label>
                        <div id="vtf-disb-chassis"></div>
                    </div>
                    <div>
                        <label>Customer Name</label>
                        <input id="vtf-disb-cust" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Transaction Code *</label>
                        <div id="vtf-disb-code"></div>
                    </div>
                </div>

                <!-- Case 7: Exchange Amount -->
                <div id="vtf-section-7" class="vtf-section">
                    <div>
                        <label>Chassis Number *</label>
                        <div id="vtf-exch-chassis"></div>
                    </div>
                    <div>
                        <label>Customer Name</label>
                        <input id="vtf-exch-cust" type="text" readonly placeholder="Auto-fetched" />
                    </div>
                    <div>
                        <label>Transaction Code *</label>
                        <div id="vtf-exch-code"></div>
                    </div>
                </div>

                <div>
                    <button id="vtf-submit" type="submit" disabled>Submit</button>
                    <span id="vtf-status"></span>
                </div>
            </form>
        `;

        const typeSelect = container.querySelector("#vtf-type");
        const submitButton = container.querySelector("#vtf-submit");
        const statusEl = container.querySelector("#vtf-status");
        const form = container.querySelector("#verify-transaction-form");

        const sections = {};
        for (let i = 1; i <= 7; i++) sections[i] = container.querySelector(`#vtf-section-${i}`);

        // Helper for auto-fetching Chassis data
        async function fetchChassisData(val, custEl, amtEl = null) {
            if (!val) { custEl.value = ""; if (amtEl) amtEl.value = ""; return; }
            custEl.value = "Fetching..."; if (amtEl) amtEl.value = "Fetching...";
            try {
                const res = await backendRequest("getChassis", val);
                if (res.status === 1) {
                    custEl.value = res.data.customer || "N/A";
                    if (amtEl) amtEl.value = res.data.receivedDP || "0";
                }
            } catch (e) { console.error(e); }
        }

        // Helper for auto-fetching Advancer data
        async function fetchAdvancerData(val, amtEl, isReturn = false) {
            if (!val) { amtEl.value = ""; return; }
            amtEl.value = "Fetching...";
            try {
                const res = await backendRequest("getAdvance", val);
                if (res.status === 1) {
                    amtEl.value = (isReturn ? res.data.returnAmount : res.data.amount) || "0";
                }
            } catch (e) { console.error(e); }
        }

        // Initialize Dropdowns
        dropdowns.advRecName = SearchableDropdown.mount(container.querySelector("#vtf-adv-rec-name"), {
            placeholder: "Select advancer...",
            onChange: (val) => fetchAdvancerData(val, container.querySelector("#vtf-adv-rec-amt"))
        });
        dropdowns.advRecCode = SearchableDropdown.mount(container.querySelector("#vtf-adv-rec-code"), { placeholder: "Select code..." });

        dropdowns.advRetName = SearchableDropdown.mount(container.querySelector("#vtf-adv-ret-name"), {
            placeholder: "Select advancer...",
            onChange: (val) => fetchAdvancerData(val, container.querySelector("#vtf-adv-ret-amt"), true)
        });
        dropdowns.advRetCode = SearchableDropdown.mount(container.querySelector("#vtf-adv-ret-code"), { placeholder: "Select code..." });

        dropdowns.dpChassis = SearchableDropdown.mount(container.querySelector("#vtf-dp-chassis"), {
            placeholder: "Select chassis...",
            onChange: (val) => fetchChassisData(val, container.querySelector("#vtf-dp-cust"), container.querySelector("#vtf-dp-amt"))
        });
        dropdowns.dpCode = SearchableDropdown.mount(container.querySelector("#vtf-dp-code"), { placeholder: "Select code..." });

        dropdowns.insChassis = SearchableDropdown.mount(container.querySelector("#vtf-ins-chassis"), {
            placeholder: "Select chassis...",
            onChange: (val) => fetchChassisData(val, container.querySelector("#vtf-ins-cust"))
        });
        dropdowns.insCode = SearchableDropdown.mount(container.querySelector("#vtf-ins-code"), { placeholder: "Select code..." });

        dropdowns.rtoChassis = SearchableDropdown.mount(container.querySelector("#vtf-rto-chassis"), {
            placeholder: "Select chassis...",
            onChange: (val) => fetchChassisData(val, container.querySelector("#vtf-rto-cust"))
        });
        dropdowns.rtoCode = SearchableDropdown.mount(container.querySelector("#vtf-rto-code"), { placeholder: "Select code..." });

        dropdowns.disbChassis = SearchableDropdown.mount(container.querySelector("#vtf-disb-chassis"), {
            placeholder: "Select chassis...",
            onChange: (val) => fetchChassisData(val, container.querySelector("#vtf-disb-cust"))
        });
        dropdowns.disbCode = SearchableDropdown.mount(container.querySelector("#vtf-disb-code"), { placeholder: "Select code..." });

        dropdowns.exchChassis = SearchableDropdown.mount(container.querySelector("#vtf-exch-chassis"), {
            placeholder: "Select chassis...",
            onChange: (val) => fetchChassisData(val, container.querySelector("#vtf-exch-cust"))
        });
        dropdowns.exchCode = SearchableDropdown.mount(container.querySelector("#vtf-exch-code"), { placeholder: "Select code..." });

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

        // Pre-fetch all dropdowns
        statusEl.textContent = "Fetching dropdowns...";
        statusEl.className = "info";
        try {
            const results = await Promise.all([
                backendRequest("getDropdown", COLS.ADV_REC),
                backendRequest("getDropdown", COLS.CODE_25),
                backendRequest("getDropdown", COLS.ADV_RET),
                backendRequest("getDropdown", COLS.CODE_26),
                backendRequest("getDropdown", COLS.DP),
                backendRequest("getDropdown", COLS.INS),
                backendRequest("getDropdown", COLS.RTO),
                backendRequest("getDropdown", COLS.DISB),
                backendRequest("getDropdown", COLS.CODE_27),
                backendRequest("getDropdown", COLS.EXCH)
            ]);

            if (results[0].status === 1) dropdowns.advRecName.setOptions(results[0].data);
            if (results[1].status === 1) {
                dropdowns.advRecCode.setOptions(results[1].data);
                dropdowns.dpCode.setOptions(results[1].data);
                dropdowns.exchCode.setOptions(results[1].data);
            }
            if (results[2].status === 1) dropdowns.advRetName.setOptions(results[2].data);
            if (results[3].status === 1) {
                dropdowns.advRetCode.setOptions(results[3].data);
                dropdowns.insCode.setOptions(results[3].data);
                dropdowns.rtoCode.setOptions(results[3].data);
            }
            if (results[4].status === 1) dropdowns.dpChassis.setOptions(results[4].data);
            if (results[5].status === 1) dropdowns.insChassis.setOptions(results[5].data);
            if (results[6].status === 1) dropdowns.rtoChassis.setOptions(results[6].data);
            if (results[7].status === 1) dropdowns.disbChassis.setOptions(results[7].data);
            if (results[8].status === 1) dropdowns.disbCode.setOptions(results[8].data);
            if (results[9].status === 1) dropdowns.exchChassis.setOptions(results[9].data);

            statusEl.textContent = "";
        } catch (err) {
            statusEl.textContent = "Error loading initial data.";
            statusEl.className = "error";
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const code = parseInt(typeSelect.value);
            let payload = { code };

            const config = {
                1: { key: "advancerName", dd: dropdowns.advRecName, codeKey: "receivedTransactionCode", codeDD: dropdowns.advRecCode },
                2: { key: "advancerName", dd: dropdowns.advRetName, codeKey: "returnedTransactionCode", codeDD: dropdowns.advRetCode },
                3: { key: "chassis", dd: dropdowns.dpChassis, codeKey: "dpTransactionCode", codeDD: dropdowns.dpCode },
                4: { key: "chassis", dd: dropdowns.insChassis, codeKey: "insuranceTransactionCode", codeDD: dropdowns.insCode },
                5: { key: "chassis", dd: dropdowns.rtoChassis, codeKey: "rtoTransactionCode", codeDD: dropdowns.rtoCode },
                6: { key: "chassis", dd: dropdowns.disbChassis, codeKey: "disbursementTransactionCode", codeDD: dropdowns.disbCode },
                7: { key: "chassis", dd: dropdowns.exchChassis, codeKey: "exchangeTransactionCode", codeDD: dropdowns.exchCode }
            };

            const c = config[code];
            payload[c.key] = c.dd.getValue();
            payload[c.codeKey] = c.codeDD.getValue();

            if (!payload[c.key] || !payload[c.codeKey]) {
                statusEl.textContent = "All fields required.";
                statusEl.className = "error";
                return;
            }

            submitButton.disabled = true;
            statusEl.textContent = "Submitting...";
            statusEl.className = "info";

            try {
                const res = await backendRequest("verifyTransactionForm", payload);
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

export { VerifyTransactionForm };
