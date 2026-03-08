import { backendRequest } from "../api/index.js";
import { SearchableDropdown } from "./SearchableDropdown.js";
import "../style/DailyTransactionForm.css";

const CASH_IN_COL  = 7;
const CASH_OUT_COL = 8;

const ACTION_OPTIONS = ["CASH IN", "CASH OUT"];

const DailyTransactionForm = (() => {

    async function mount(container, session) {
        let openingBalance = 0;
        let currentAction  = "";
        const leisureCache = {};
        let actionDropdown  = null;
        let leisureDropdown = null;

        container.innerHTML = `
            <form id="daily-transaction-form" novalidate>
                <h2>Daily Transaction</h2>

                <div>
                    <label>Opening Balance</label><br>
                    <input id="dt-opening-balance" type="text" readonly value="Loading..." />
                </div>

                <div>
                    <label>Action</label><br>
                    <div id="dt-action-container"></div>
                </div>

                <div>
                    <label>Cash Leisure</label><br>
                    <div id="dt-leisure-container"></div>
                </div>

                <div>
                    <label>Amount</label><br>
                    <input id="dt-amount" type="number" min="0" placeholder="Enter amount" />
                </div>

                <div>
                    <label>Remark</label><br>
                    <textarea id="dt-remark" placeholder="Enter remark" rows="3"></textarea>
                </div>

                <div>
                    <button id="dt-submit" type="submit">Submit</button>
                    <span id="dt-status"></span>
                </div>
            </form>
        `;

        const openingBalanceInput = container.querySelector("#dt-opening-balance");
        const actionContainer     = container.querySelector("#dt-action-container");
        const leisureContainer    = container.querySelector("#dt-leisure-container");
        const amountInput         = container.querySelector("#dt-amount");
        const remarkInput         = container.querySelector("#dt-remark");
        const submitButton        = container.querySelector("#dt-submit");
        const statusEl            = container.querySelector("#dt-status");
        const form                = container.querySelector("#daily-transaction-form");

        actionDropdown = SearchableDropdown.mount(actionContainer, {
            options:     ACTION_OPTIONS,
            placeholder: "Select action...",
            onChange:    handleActionChange
        });

        leisureDropdown = SearchableDropdown.mount(leisureContainer, {
            options:     [],
            placeholder: "Select leisure..."
        });

        const [balanceRes, cashInRes, cashOutRes] = await Promise.allSettled([
            backendRequest("getOpeningBalance", { branch: session.branch }),
            backendRequest("getDropdown", CASH_IN_COL),
            backendRequest("getDropdown", CASH_OUT_COL)
        ]);

        if (balanceRes.status === "fulfilled" && balanceRes.value.status === 1) {
            openingBalance = balanceRes.value.openingBalance ?? 0;
            openingBalanceInput.value = openingBalance;
        } else {
            openingBalanceInput.value = "Error";
            console.error("[getOpeningBalance]", balanceRes.reason ?? balanceRes.value?.message);
        }

        if (cashInRes.status === "fulfilled" && cashInRes.value.status === 1) {
            leisureCache[CASH_IN_COL] = cashInRes.value.data;
        } else {
            console.error("[getDropdown col 7]", cashInRes.reason ?? cashInRes.value?.message);
        }

        if (cashOutRes.status === "fulfilled" && cashOutRes.value.status === 1) {
            leisureCache[CASH_OUT_COL] = cashOutRes.value.data;
        } else {
            console.error("[getDropdown col 8]", cashOutRes.reason ?? cashOutRes.value?.message);
        }

        function handleActionChange(action) {
            currentAction = action;
            const col = action === "CASH IN" ? CASH_IN_COL : CASH_OUT_COL;
            leisureDropdown.setOptions(leisureCache[col] ?? []);
        }


        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            statusEl.textContent = "";

            const action      = actionDropdown.getValue();
            const cashLeisure = leisureDropdown.getValue();
            const amount      = amountInput.value.trim();
            const remark      = remarkInput.value.trim();

            if (!action || !cashLeisure || !amount || !remark) {
                statusEl.textContent = "All fields are required.";
                return;
            }

            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount < 0) {
                statusEl.textContent = "Amount must be a valid non-negative number.";
                return;
            }

            const payload = {
                location:       session.branch,
                openingBalance: openingBalance,
                cashIn:         action === "CASH IN"  ? numericAmount : 0,
                cashOut:        action === "CASH OUT" ? numericAmount : 0,
                cashLeisure:    cashLeisure,
                remark:         remark
            };

            submitButton.disabled = true;
            statusEl.textContent  = "Submitting...";

            try {
                const res = await backendRequest("dailyTransaction", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Submitted successfully. Refreshing...";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Submission failed.";
                }
            } catch (err) {
                statusEl.textContent = "Network error. Please try again.";
                console.error("[dailyTransaction]", err);
            } finally {
                submitButton.disabled = false;
            }
        });

        function resetForm() {
            actionDropdown.setValue("");
            leisureDropdown.setOptions([]);
            amountInput.value = "";
            remarkInput.value = "";
            currentAction     = "";
            openingBalance    = 0;
            openingBalanceInput.value = "0";
        }
    }

    return { mount };
})();

export { DailyTransactionForm };
