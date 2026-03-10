import { backendRequest } from "../../api/index.js";
import "../../style/showroom/NewWalkInForm.css";

const NewWalkInForm = (() => {

    async function mount(container, session) {
        container.innerHTML = `
            <form id="new-walk-in-form" novalidate>
                <h2>New Walk In</h2>

                <div>
                    <label>Customer Name *</label><br>
                    <input id="nwi-customer-name" type="text" placeholder="Enter customer name" />
                </div>

                <div>
                    <label>Mobile Number *</label><br>
                    <input id="nwi-mobile-number" type="tel" maxlength="10" placeholder="Enter 10-digit mobile number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                </div>

                <div>
                    <label>Alternate Mobile Number</label><br>
                    <input id="nwi-alt-mobile-number" type="tel" maxlength="10" placeholder="Enter 10-digit alternate mobile number" oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                </div>

                <div>
                    <label>Address</label><br>
                    <input id="nwi-address" type="text" placeholder="Enter address" rows="2">
                </div>

                <div>
                    <label>Vehicle Details</label><br>
                    <input id="nwi-vehicle-details" type="text" placeholder="Enter vehicle details" />
                </div>

                <div>
                    <button id="nwi-submit" type="submit">Submit</button>
                    <span id="nwi-status"></span>
                </div>
            </form>
        `;

        const customerNameInput = container.querySelector("#nwi-customer-name");
        const mobileNumberInput = container.querySelector("#nwi-mobile-number");
        const altMobileNumberInput = container.querySelector("#nwi-alt-mobile-number");
        const addressInput = container.querySelector("#nwi-address");
        const vehicleDetailsInput = container.querySelector("#nwi-vehicle-details");
        const submitButton = container.querySelector("#nwi-submit");
        const statusEl = container.querySelector("#nwi-status");
        const form = container.querySelector("#new-walk-in-form");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            statusEl.textContent = "";
            statusEl.className = "";

            const customerName = customerNameInput.value.trim();
            const mobileNumber = mobileNumberInput.value.trim();
            const alternateMobileNumber = altMobileNumberInput.value.trim();
            const address = addressInput.value.trim();
            const vehicleDetails = vehicleDetailsInput.value.trim();

            if (!customerName || !mobileNumber) {
                statusEl.textContent = "Customer Name and Mobile Number are mandatory.";
                statusEl.className = "error";
                return;
            }

            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(mobileNumber)) {
                statusEl.textContent = "Please enter a valid 10-digit Mobile Number.";
                statusEl.className = "error";
                return;
            }

            if (alternateMobileNumber && !phoneRegex.test(alternateMobileNumber)) {
                statusEl.textContent = "Please enter a valid 10-digit Alternate Mobile Number.";
                statusEl.className = "error";
                return;
            }

            const payload = {
                location: session.branch,
                customerName: customerName,
                mobileNumber: mobileNumber,
                alternateMobileNumber: alternateMobileNumber,
                address: address,
                vehicleDetails: vehicleDetails
            };

            submitButton.disabled = true;
            statusEl.textContent = "Submitting...";
            statusEl.className = "info";

            try {
                const res = await backendRequest("newWalkIn", payload);
                if (res.status === 1) {
                    statusEl.textContent = "Submitted successfully. Refreshing...";
                    statusEl.className = "success";
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    statusEl.textContent = res.message || "Submission failed.";
                    statusEl.className = "error";
                }
            } catch (err) {
                statusEl.textContent = "Network error. Please try again.";
                statusEl.className = "error";
                console.error("[newWalkIn]", err);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    return { mount };
})();

export { NewWalkInForm };
