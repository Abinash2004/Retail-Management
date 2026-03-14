import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import "../../style/accounts/AddRegistrationForm.css";

const CHASSIS_COL = 13;

const AddRegistrationForm = (() => {

    async function mount(container, session) {
        let chassisDropdown = null;

        container.innerHTML = `
            <form id="add-registration-form" novalidate>
                <h2>Add Registration Form</h2>

                <div>
                    <label>Chassis Number *</label>
                    <div id="ar-chassis-container"></div>
                </div>

                <div>
                    <label>Registration Number *</label>
                    <input id="ar-registration-number" type="text" placeholder="Enter registration number" />
                </div>

                <div>
                    <button id="ar-submit" type="submit">Submit</button>
                    <span id="ar-status"></span>
                </div>
            </form>
        `;

        const registrationInput = container.querySelector("#ar-registration-number");
        const submitButton = container.querySelector("#ar-submit");
        const statusEl = container.querySelector("#ar-status");
        const form = container.querySelector("#add-registration-form");

        chassisDropdown = SearchableDropdown.mount(container.querySelector("#ar-chassis-container"), {
            options: [],
            placeholder: "Select chassis number..."
        });

        // Fetch dropdown values
        statusEl.textContent = "Fetching chassis numbers...";
        statusEl.className = "info";
        try {
            const res = await backendRequest("getDropdown", CHASSIS_COL);
            if (res.status === 1) {
                chassisDropdown.setOptions(res.data);
                statusEl.textContent = "";
            } else {
                statusEl.textContent = "Failed to load chassis numbers.";
                statusEl.className = "error";
            }
        } catch (err) {
            statusEl.textContent = "Error fetching dropdown.";
            statusEl.className = "error";
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const chassis = chassisDropdown.getValue();
            const registrationNumber = registrationInput.value.trim();

            if (!chassis || !registrationNumber) {
                statusEl.textContent = "Both fields are required.";
                statusEl.className = "error";
                return;
            }

            submitButton.disabled = true;
            statusEl.textContent = "Submitting registration...";
            statusEl.className = "info";

            try {
                const res = await backendRequest("addRegistrationForm", {
                    chassis,
                    registrationNumber
                });

                if (res.status === 1) {
                    statusEl.textContent = "Registration added successfully. Refreshing...";
                    statusEl.className = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Failed to add registration.";
                    statusEl.className = "error";
                    submitButton.disabled = false;
                }
            } catch (err) {
                statusEl.textContent = "Network error. Please try again.";
                statusEl.className = "error";
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { AddRegistrationForm };
