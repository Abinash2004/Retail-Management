import { backendRequest } from "../api/index.js";
import "../style/UpdateFollowUpForm.css";

// 0-indexed into the full row array returned by backend
const COL = {
    SERIAL_NUMBER:       0,
    VISIT_DATE:          1,
    CUSTOMER_NAME:       3,
    MOBILE_NUMBER:       4,
    ALT_MOBILE_NUMBER:   5,
    ADDRESS:             6,
    VEHICLE_DETAILS:     7,
    STATUS:              8,
    REMARKS:             9,
    FIRST_FEEDBACK_DATE: 10,
    FIRST_FEEDBACK:      11,
    LAST_FEEDBACK_DATE:  12,
    LAST_FEEDBACK:       13
};



const UpdateFollowUpForm = (() => {

    function mount(container, rowData, goBack) {
        const isFirstFeedback = !rowData[COL.FIRST_FEEDBACK];

        const visitDate = rowData[COL.VISIT_DATE]
            ? new Date(rowData[COL.VISIT_DATE]).toLocaleDateString()
            : "";
        const firstFeedbackDate = rowData[COL.FIRST_FEEDBACK_DATE]
            ? new Date(rowData[COL.FIRST_FEEDBACK_DATE]).toLocaleDateString()
            : "";
        const lastFeedbackDate = rowData[COL.LAST_FEEDBACK_DATE]
            ? new Date(rowData[COL.LAST_FEEDBACK_DATE]).toLocaleDateString()
            : "";

        const existingStatus = (rowData[COL.STATUS] || "OPEN").trim().toUpperCase();

        container.innerHTML = `
            <div id="uf-wrapper">
                <div id="uf-topbar">
                    <button id="uf-back">&larr; Back to List</button>
                    <h3>${isFirstFeedback ? "Add First Feedback" : "Update Feedback"}</h3>
                </div>

                <form id="uf-form" novalidate>
                    <div class="uf-section-label">Customer Info</div>

                    <div class="uf-row">
                        <div class="uf-field">
                            <label>Visit Date</label>
                            <input type="text" value="${visitDate}" readonly />
                        </div>
                        <div class="uf-field">
                            <label>Customer Name</label>
                            <input type="text" value="${rowData[COL.CUSTOMER_NAME] || ""}" readonly />
                        </div>
                        <div class="uf-field">
                            <label>Mobile Number</label>
                            <input type="text" value="${rowData[COL.MOBILE_NUMBER] || ""}" readonly />
                        </div>
                    </div>

                    <div class="uf-section-label">Details</div>

                    <div class="uf-row">
                        <div class="uf-field">
                            <label>Alternate Mobile Number</label>
                            <input id="uf-alt-mobile" type="tel" maxlength="10"
                                value="${rowData[COL.ALT_MOBILE_NUMBER] || ""}"
                                oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
                        </div>
                        <div class="uf-field">
                            <label>Address</label>
                            <input id="uf-address" type="text" value="${rowData[COL.ADDRESS] || ""}" />
                        </div>
                        <div class="uf-field">
                            <label>Vehicle Details</label>
                            <input id="uf-vehicle-details" type="text" value="${rowData[COL.VEHICLE_DETAILS] || ""}" />
                        </div>
                    </div>

                    <div class="uf-row">
                        <div class="uf-field">
                            <label>Status</label>
                            <select id="uf-status">
                                <option value="OPEN"${existingStatus === "OPEN" ? " selected" : ""}>Open</option>
                                <option value="CLOSE"${existingStatus === "CLOSE" ? " selected" : ""}>Close</option>
                                <option value="PURCHASED"${existingStatus === "PURCHASED" ? " selected" : ""}>Purchased</option>
                            </select>
                        </div>
                        <div class="uf-field">
                            <label>Remarks</label>
                            <input id="uf-remarks" type="text" value="${rowData[COL.REMARKS] || ""}" />
                        </div>
                    </div>

                    <div class="uf-section-label">Feedback</div>

                    ${isFirstFeedback ? `
                    <div class="uf-field">
                        <label>First Feedback *</label>
                        <textarea id="uf-first-feedback" rows="4" placeholder="Enter feedback..."></textarea>
                    </div>
                    ` : `
                    <div class="uf-row">
                        <div class="uf-field">
                            <label>First Feedback Date</label>
                            <input type="text" value="${firstFeedbackDate}" readonly />
                        </div>
                        <div class="uf-field uf-field--wide">
                            <label>First Feedback</label>
                            <textarea rows="2" readonly>${rowData[COL.FIRST_FEEDBACK] || ""}</textarea>
                        </div>
                    </div>
                    <div class="uf-row">
                        <div class="uf-field">
                            <label>Last Feedback Date</label>
                            <input type="text" value="${lastFeedbackDate}" readonly />
                        </div>
                    </div>
                    <div class="uf-field">
                        <label>Last Feedback *</label>
                        <textarea id="uf-last-feedback" rows="4" placeholder="Enter latest feedback...">${rowData[COL.LAST_FEEDBACK] || ""}</textarea>
                    </div>
                    `}

                    <div id="uf-actions">
                        <button id="uf-submit" type="submit">Submit</button>
                        <span id="uf-status-msg"></span>
                    </div>
                </form>
            </div>
        `;

        // Back button
        container.querySelector("#uf-back").addEventListener("click", () => {
            if (typeof goBack === "function") goBack();
        });

        const form      = container.querySelector("#uf-form");
        const submitBtn = container.querySelector("#uf-submit");
        const statusMsg = container.querySelector("#uf-status-msg");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            statusMsg.textContent = "";
            statusMsg.className = "";

            const firstFeedback = container.querySelector("#uf-first-feedback")?.value.trim();
            const lastFeedback  = container.querySelector("#uf-last-feedback")?.value.trim();

            if (isFirstFeedback && !firstFeedback) {
                statusMsg.textContent = "First Feedback is required.";
                statusMsg.className = "error";
                return;
            }
            if (!isFirstFeedback && !lastFeedback) {
                statusMsg.textContent = "Last Feedback is required.";
                statusMsg.className = "error";
                return;
            }

            const payload = {
                serialNumber:          rowData[COL.SERIAL_NUMBER],
                alternateMobileNumber: container.querySelector("#uf-alt-mobile").value.trim(),
                address:               container.querySelector("#uf-address").value.trim(),
                vehicleDetails:        container.querySelector("#uf-vehicle-details").value.trim(),
                status:                container.querySelector("#uf-status").value,
                remarks:               container.querySelector("#uf-remarks").value.trim(),
                firstFeedback:         firstFeedback || "",
                lastFeedback:          lastFeedback  || ""
            };

            submitBtn.disabled = true;
            statusMsg.textContent = "Submitting...";
            statusMsg.className = "info";

            try {
                const res = await backendRequest("updateFollowUp", payload);
                if (res.status === 1) {
                    statusMsg.textContent = "Updated successfully. Returning to list...";
                    statusMsg.className = "success";
                    setTimeout(() => {
                        if (typeof goBack === "function") goBack();
                    }, 500);
                } else {
                    statusMsg.textContent = res.message || "Update failed.";
                    statusMsg.className = "error";
                    submitBtn.disabled = false;
                }
            } catch (err) {
                statusMsg.textContent = "Network error. Please try again.";
                statusMsg.className = "error";
                console.error("[updateFollowUp]", err);
                submitBtn.disabled = false;
            }
        });
    }

    return { mount };
})();

export { UpdateFollowUpForm };
