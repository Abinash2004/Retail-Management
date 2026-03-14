import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/AddSaleForm.css";

const CHASSIS_COL = 10;
const COUNTER_COL = 3;
const CASH_FINANCE_COL = 5;
const SALES_PERSON_COL = 4;

const AddSaleForm = (() => {

    async function mount(container, session) {
        let chassisDropdown = null;
        let counterDropdown = null;
        let cashFinanceDropdown = null;
        let salesPersonDropdown = null;

        container.innerHTML = `
            <form id="add-sale-form" novalidate>
                <h2>Add Sale Form</h2>

                <div>
                    <label>Chassis Number *</label>
                    <div id="as-chassis-container"></div>
                </div>

                <div>
                    <label>Model</label>
                    <input id="as-model" type="text" readonly placeholder="Auto-filled" />
                </div>

                <div>
                    <label>Color</label>
                    <input id="as-color" type="text" readonly placeholder="Auto-filled" />
                </div>

                <div>
                    <label>Sale Counter *</label>
                    <div id="as-counter-container"></div>
                </div>

                <div>
                    <label>Stock Status *</label>
                    <select id="as-stock-status">
                        <option value="B2C">B2C</option>
                        <option value="RETURN">RETURN</option>
                    </select>
                </div>

                <div>
                    <label>Sale Date *</label>
                    <input id="as-date" type="date" />
                </div>

                <div>
                    <label>Customer Name *</label>
                    <input id="as-customer-name" type="text" placeholder="Enter customer name" />
                </div>

                <div id="as-b2c-fields" class="b2c-only b2c-visible">
                    <div>
                        <label>Mobile Number *</label>
                        <input id="as-mobile" type="tel" maxlength="10" placeholder="10-digit number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                    </div>

                    <div>
                        <label>Alternate Mobile Number (Optional)</label>
                        <input id="as-alt-mobile" type="tel" maxlength="10" placeholder="10-digit number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                    </div>

                    <div>
                        <label>Cash / Finance *</label>
                        <div id="as-cash-finance-container"></div>
                    </div>

                    <div>
                        <label>Financer *</label>
                        <input id="as-financer" type="text" placeholder="Enter financer name" />
                    </div>
                </div>

                <div>
                    <label>Sales Person *</label>
                    <div id="as-sales-person-container"></div>
                </div>

                <div>
                    <button id="as-submit" type="submit">Submit</button>
                    <span id="as-status"></span>
                </div>
            </form>
        `;

        const modelInput = container.querySelector("#as-model");
        const colorInput = container.querySelector("#as-color");
        const statusSelect = container.querySelector("#as-stock-status");
        const dateInput = container.querySelector("#as-date");
        const nameInput = container.querySelector("#as-customer-name");
        const mobileInput = container.querySelector("#as-mobile");
        const altMobileInput = container.querySelector("#as-alt-mobile");
        const financerInput = container.querySelector("#as-financer");
        const b2cFields = container.querySelector("#as-b2c-fields");
        const submitButton = container.querySelector("#as-submit");
        const statusEl = container.querySelector("#as-status");
        const form = container.querySelector("#add-sale-form");

        chassisDropdown = SearchableDropdown.mount(container.querySelector("#as-chassis-container"), {
            options: [],
            placeholder: "Select chassis number...",
            onChange: async (val) => {
                if (!val) {
                    modelInput.value = "";
                    colorInput.value = "";
                    return;
                }
                
                modelInput.value = "Fetching...";
                colorInput.value = "Fetching...";
                statusEl.textContent = "Fetching chassis details...";
                statusEl.className = "info";
                
                try {
                    const res = await backendRequest("getChassis", val);
                    if (res.status === 1 && res.data) {
                        modelInput.value = res.data.model || "N/A";
                        colorInput.value = res.data.color || "N/A";
                        statusEl.textContent = "";
                    } else {
                        modelInput.value = "Not Found";
                        colorInput.value = "Not Found";
                        statusEl.textContent = "Chassis details not found.";
                        statusEl.className = "error";
                    }
                } catch (err) {
                    modelInput.value = "Error";
                    colorInput.value = "Error";
                    statusEl.textContent = "Error fetching chassis details.";
                    statusEl.className = "error";
                }
            }
        });

        counterDropdown = SearchableDropdown.mount(container.querySelector("#as-counter-container"), {
            options: [],
            placeholder: "Select sale counter..."
        });

        cashFinanceDropdown = SearchableDropdown.mount(container.querySelector("#as-cash-finance-container"), {
            options: [],
            placeholder: "Select cash/finance..."
        });

        salesPersonDropdown = SearchableDropdown.mount(container.querySelector("#as-sales-person-container"), {
            options: [],
            placeholder: "Select sales person..."
        });

        statusSelect.addEventListener("change", () => {
            if (statusSelect.value === "B2C") {
                b2cFields.classList.add("b2c-visible");
            } else {
                b2cFields.classList.remove("b2c-visible");
            }
        });

        statusEl.textContent = "Fetching dropdown values...";
        statusEl.className = "info";

        try {
            const [chassisRes, counterRes, cashRes, personRes] = await Promise.all([
                backendRequest("getDropdown", CHASSIS_COL),
                backendRequest("getDropdown", COUNTER_COL),
                backendRequest("getDropdown", CASH_FINANCE_COL),
                backendRequest("getDropdown", SALES_PERSON_COL)
            ]);

            if (chassisRes.status === 1) chassisDropdown.setOptions(chassisRes.data);
            if (counterRes.status === 1) counterDropdown.setOptions(counterRes.data);
            if (cashRes.status === 1) cashFinanceDropdown.setOptions(cashRes.data);
            if (personRes.status === 1) salesPersonDropdown.setOptions(personRes.data);

            statusEl.textContent = "";
            statusEl.className = "";
        } catch (err) {
            statusEl.textContent = "Error fetching dropdown values.";
            statusEl.className = "error";
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const chassis = chassisDropdown.getValue();
            const saleCounter = counterDropdown.getValue();
            const stockStatus = statusSelect.value;
            const saleDate = dateInput.value;
            const customerName = nameInput.value.trim();
            const salesPerson = salesPersonDropdown.getValue();

            if (!chassis || !saleCounter || !stockStatus || !saleDate || !customerName || !salesPerson) {
                statusEl.textContent = "All mandatory fields (*) are required.";
                statusEl.className = "error";
                return;
            }

            const mobile = mobileInput.value.trim();
            const altMobile = altMobileInput.value.trim();
            const cashOrFinance = cashFinanceDropdown.getValue();
            const financer = financerInput.value.trim();

            if (stockStatus === "B2C") {
                if (!mobile || !cashOrFinance || !financer) {
                    statusEl.textContent = "B2C mandatory fields are required.";
                    statusEl.className = "error";
                    return;
                }
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(mobile)) {
                    statusEl.textContent = "Valid 10-digit mobile number required.";
                    statusEl.className = "error";
                    return;
                }
                if (altMobile && !phoneRegex.test(altMobile)) {
                    statusEl.textContent = "Valid 10-digit alternate mobile required.";
                    statusEl.className = "error";
                    return;
                }
            }

            const payload = {
                chassis,
                saleCounter,
                stockStatus,
                saleDate,
                customerName,
                salesPerson,
                mobileNumber: mobile,
                alternate_mobile_number: altMobile,
                cashOrFinance,
                financer
            };

            submitButton.disabled = true;
            statusEl.textContent = "Submitting Sale...";
            statusEl.className = "info";

            try {
                const res = await backendRequest("addSaleForm", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Sale added successfully. Refreshing...";
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

export { AddSaleForm };
