import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/AddSaleAccountForm.css";

const CHASSIS_COL = 12;
const ADVANCER_COL = 9;

const AddSaleAccountForm = (() => {

    async function mount(container, session) {
        let chassisDropdown = null;
        let advancerDropdown = null;

        container.innerHTML = `
            <form id="add-sale-account-form" novalidate>
                <h2>Add Sale Account Form</h2>

                <div>
                    <label>Chassis Number *</label>
                    <div id="asa-chassis-container"></div>
                </div>

                <div>
                    <label>Customer Name</label>
                    <input id="asa-customer-name" type="text" placeholder="Enter customer name" />
                </div>

                <div>
                    <label>Price Tag Number *</label>
                    <input id="asa-price-tag" type="text" placeholder="Enter price tag number" />
                </div>

                <div>
                    <label>Total Down Payment *</label>
                    <input id="asa-total-dp" type="number" min="0" placeholder="0" />
                </div>

                <div>
                    <label>Any Advance? *</label>
                    <select id="asa-any-advance">
                        <option value="NO">NO</option>
                        <option value="YES">YES</option>
                    </select>
                </div>

                <div id="asa-advance-section" class="conditional-section">
                    <div>
                        <label>Advancer Name *</label>
                        <div id="asa-advancer-container"></div>
                    </div>
                    <div>
                        <label>Advance Amount</label>
                        <input id="asa-advance-amount" type="number" readonly placeholder="0" />
                    </div>
                </div>

                <div>
                    <label>Any Exchange? *</label>
                    <select id="asa-any-exchange">
                        <option value="NO">NO</option>
                        <option value="YES">YES</option>
                    </select>
                </div>

                <div id="asa-exchange-section" class="conditional-section">
                    <div>
                        <label>Exchange Model *</label>
                        <input id="asa-ex-model" type="text" placeholder="Enter exchange model" />
                    </div>
                    <div>
                        <label>Exchange Register Number *</label>
                        <input id="asa-ex-reg" type="text" placeholder="Enter registration number" />
                    </div>
                    <div>
                        <label>Customer Exchange Value *</label>
                        <input id="asa-ex-cust-val" type="number" min="0" placeholder="0" />
                    </div>
                    <div>
                        <label>Exchange Dealer *</label>
                        <input id="asa-ex-dealer" type="text" placeholder="Enter dealer name" />
                    </div>
                    <div>
                        <label>Dealer Exchange Value *</label>
                        <input id="asa-ex-deal-val" type="number" min="0" placeholder="0" />
                    </div>
                </div>

                <div>
                    <label>Estimated Disbursement (Optional)</label>
                    <input id="asa-estimated-disbursement" type="number" min="0" placeholder="0" />
                </div>

                <div>
                    <label>Received Down Payment *</label>
                    <input id="asa-received-dp" type="number" min="0" placeholder="0" />
                </div>

                <div>
                    <label>Due Amount</label>
                    <input id="asa-due-amount" type="number" readonly placeholder="0" />
                    <div class="calculation-info">Formula: Total DP - (Advance + Received DP + Cust Exchange Value)</div>
                </div>

                <div>
                    <button id="asa-submit" type="submit">Submit</button>
                    <span id="asa-status"></span>
                </div>
            </form>
        `;

        const priceTagInput = container.querySelector("#asa-price-tag");
        const customerNameInput = container.querySelector("#asa-customer-name");
        const totalDpInput = container.querySelector("#asa-total-dp");
        const anyAdvanceSelect = container.querySelector("#asa-any-advance");
        const advanceSection = container.querySelector("#asa-advance-section");
        const advanceAmountInput = container.querySelector("#asa-advance-amount");
        const anyExchangeSelect = container.querySelector("#asa-any-exchange");
        const exchangeSection = container.querySelector("#asa-exchange-section");
        const exModelInput = container.querySelector("#asa-ex-model");
        const exRegInput = container.querySelector("#asa-ex-reg");
        const exCustValInput = container.querySelector("#asa-ex-cust-val");
        const exDealerInput = container.querySelector("#asa-ex-dealer");
        const exDealValInput = container.querySelector("#asa-ex-deal-val");
        const receivedDpInput = container.querySelector("#asa-received-dp");
        const estDisbursementInput = container.querySelector("#asa-estimated-disbursement");
        const dueAmountInput = container.querySelector("#asa-due-amount");
        const submitButton = container.querySelector("#asa-submit");
        const statusEl = container.querySelector("#asa-status");
        const form = container.querySelector("#add-sale-account-form");

        const updateDueAmount = () => {
            const total = parseFloat(totalDpInput.value) || 0;
            const advance = anyAdvanceSelect.value === "YES" ? (parseFloat(advanceAmountInput.value) || 0) : 0;
            const received = parseFloat(receivedDpInput.value) || 0;
            const exVal = anyExchangeSelect.value === "YES" ? (parseFloat(exCustValInput.value) || 0) : 0;
            
            const due = total - (advance + received + exVal);
            dueAmountInput.value = due;
        };

        totalDpInput.addEventListener("input", updateDueAmount);
        receivedDpInput.addEventListener("input", updateDueAmount);
        exCustValInput.addEventListener("input", updateDueAmount);

        anyAdvanceSelect.addEventListener("change", () => {
            if (anyAdvanceSelect.value === "YES") {
                advanceSection.classList.add("section-visible");
            } else {
                advanceSection.classList.remove("section-visible");
                advanceAmountInput.value = 0;
            }
            updateDueAmount();
        });

        anyExchangeSelect.addEventListener("change", () => {
            if (anyExchangeSelect.value === "YES") {
                exchangeSection.classList.add("section-visible");
            } else {
                exchangeSection.classList.remove("section-visible");
                exCustValInput.value = 0;
            }
            updateDueAmount();
        });

        chassisDropdown = SearchableDropdown.mount(container.querySelector("#asa-chassis-container"), {
            options: [],
            placeholder: "Select chassis number..."
        });

        advancerDropdown = SearchableDropdown.mount(container.querySelector("#asa-advancer-container"), {
            options: [],
            placeholder: "Select advancer name...",
            onChange: async (val) => {
                if (!val) {
                    advanceAmountInput.value = 0;
                    updateDueAmount();
                    return;
                }
                advanceAmountInput.value = "";
                advanceAmountInput.placeholder = "Fetching...";
                statusEl.textContent = "Fetching advance details...";
                statusEl.className = "info";
                try {
                    const res = await backendRequest("getAdvance", val);
                    if (res.status === 1 && res.data) {
                        advanceAmountInput.value = res.data.amount || 0;
                        statusEl.textContent = "";
                    } else {
                        advanceAmountInput.value = 0;
                        statusEl.textContent = "Advancer not found or not active.";
                        statusEl.className = "error";
                    }
                } catch (err) {
                    advanceAmountInput.value = 0;
                    statusEl.textContent = "Error fetching advance details.";
                    statusEl.className = "error";
                }
                updateDueAmount();
            }
        });

        // Fetch dropdowns early for UX
        statusEl.textContent = "Fetching dropdown values...";
        statusEl.className = "info";
        try {
            const [chassisRes, advancerRes] = await Promise.all([
                backendRequest("getDropdown", CHASSIS_COL),
                backendRequest("getDropdown", ADVANCER_COL)
            ]);

            if (chassisRes.status === 1) chassisDropdown.setOptions(chassisRes.data);
            if (advancerRes.status === 1) advancerDropdown.setOptions(advancerRes.data);
            
            statusEl.textContent = "";
            statusEl.className = "";
        } catch (err) {
            statusEl.textContent = "Error fetching dropdown values.";
            statusEl.className = "error";
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const chassis = chassisDropdown.getValue();
            const priceTagNumber = priceTagInput.value.trim();
            const totalDp = totalDpInput.value.trim();
            const anyAdvance = anyAdvanceSelect.value;
            const anyExchange = anyExchangeSelect.value;
            const receivedDp = receivedDpInput.value.trim();

            if (!chassis || !priceTagNumber || !totalDp || !receivedDp) {
                statusEl.textContent = "Mandatory fields (*) are required.";
                statusEl.className = "error";
                return;
            }

            const payload = {
                chassis,
                priceTagNumber,
                totalDp: parseFloat(totalDp),
                anyAdvance,
                receivedDp: parseFloat(receivedDp),
                anyExchange,
                customerName: customerNameInput.value.trim(),
                estimatedDisbursement: parseFloat(estDisbursementInput.value) || 0
            };

            if (anyAdvance === "YES") {
                const advancerName = advancerDropdown.getValue();
                const advanceAmount = advanceAmountInput.value;
                if (!advancerName || !advanceAmount) {
                    statusEl.textContent = "Advancer name is required for YES.";
                    statusEl.className = "error";
                    return;
                }
                payload.advancerName = advancerName;
                payload.advanceAmount = parseFloat(advanceAmount);
            }

            if (anyExchange === "YES") {
                const exModel = exModelInput.value.trim();
                const exReg = exRegInput.value.trim();
                const exCustVal = exCustValInput.value.trim();
                const exDealer = exDealerInput.value.trim();
                const exDealVal = exDealValInput.value.trim();

                if (!exModel || !exReg || !exCustVal || !exDealer || !exDealVal) {
                    statusEl.textContent = "Exchange fields are required for YES.";
                    statusEl.className = "error";
                    return;
                }
                payload.exchangeModel = exModel;
                payload.exchangeRegisterNumber = exReg;
                payload.customerExchangeValue = parseFloat(exCustVal);
                payload.dealerName = exDealer;
                payload.dealerExchangeValue = parseFloat(exDealVal);
            }

            submitButton.disabled = true;
            statusEl.textContent = "Submitting Sale Account...";
            statusEl.className = "info";

            try {
                const res = await backendRequest("addSaleAccountForm", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Sale Account added successfully. Refreshing...";
                    statusEl.className = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Submission failed.";
                    statusEl.className = "error";
                }
            } catch (err) {
                statusEl.textContent = "Network error. Try again.";
                statusEl.className = "error";
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { AddSaleAccountForm };
