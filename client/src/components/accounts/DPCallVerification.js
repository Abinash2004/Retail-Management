import { backendRequest } from "../../api/index.js";
import { SearchableDropdown } from "../SearchableDropdown.js";
import { createFormLayout, field, formActions, setStatus } from "../ui.js";

const DPCallVerification = (() => {
    async function mount(container, session) {
        let chassisDropdown = null;
        let pendingData = [];

        container.innerHTML = createFormLayout({
            id: "dp-call-verification-form",
            title: "DP Call Verification",
            body: `
                ${field("Chassis Number", '<div id="dpc-chassis-container"></div>', { required: true })}
                ${field("Customer Name", '<input id="dpc-customer-name" class="ui-input ui-readonly" type="text" readonly placeholder="Auto-filled on chassis selection" />')}
                ${formActions("dpc-submit", "dpc-status")}
            `
        });

        const form = container.querySelector("#dp-call-verification-form");
        const customerNameInput = container.querySelector("#dpc-customer-name");
        const statusEl = container.querySelector("#dpc-status");

        chassisDropdown = SearchableDropdown.mount(
            container.querySelector("#dpc-chassis-container"),
            {
                placeholder: "Search & select chassis number",
                required: true,
                onChange: (chassis) => {
                    if (!chassis) {
                        customerNameInput.value = "";
                        return;
                    }
                    const match = pendingData.find(item => item.chassis === chassis);
                    customerNameInput.value = match ? match.customerName : "";
                }
            }
        );

        async function fetchPendingData() {
            setStatus(statusEl, "Fetching pending chassis list...", "info", true);
            try {
                const res = await backendRequest("getDPCallPendingList");
                if (res.status === 1 && res.data) {
                    pendingData = res.data;
                    const chassisOptions = pendingData.map(item => item.chassis);
                    chassisDropdown.setOptions(chassisOptions);
                    chassisDropdown.setValue("");
                    customerNameInput.value = "";
                    setStatus(statusEl);
                } else {
                    setStatus(statusEl, res.message || "Failed to load pending chassis list.", "error");
                }
            } catch (err) {
                console.error("[fetchPendingData]", err);
                setStatus(statusEl, "Error loading pending chassis list.", "error");
            }
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const chassis = chassisDropdown.getValue();
            if (!chassis) {
                setStatus(statusEl, "Please select a chassis number.", "error");
                return;
            }

            setStatus(statusEl, "Submitting verification...", "info", true);
            try {
                const res = await backendRequest("submitDPCallVerification", { chassis });
                if (res.status === 1) {
                    setStatus(statusEl, "Verification submitted successfully. Refreshing...", "success");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    setStatus(statusEl, res.message || "Submission failed.", "error");
                }
            } catch (err) {
                console.error("[submitDPCallVerification]", err);
                setStatus(statusEl, "Error submitting verification.", "error");
            }
        });

        await fetchPendingData();
    }

    return { mount };
})();

export { DPCallVerification };
