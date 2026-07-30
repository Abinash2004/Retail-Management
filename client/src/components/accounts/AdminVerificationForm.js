import { backendRequest } from "../../api/index.js";
import { setStatus } from "../ui.js";

const AdminVerificationForm = (() => {
    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function parseNum(val) {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
    }

    function mount(container, session, rowData, onBack) {
        // Calculate dynamic values
        const advAmt = parseNum(rowData.advAmt);
        const advTncAmt = parseNum(rowData.advTncAmt);
        const hasAdvance = advAmt !== 0 || advTncAmt !== 0;
        const advanceGap = advAmt - advTncAmt;

        const cusExVal = parseNum(rowData.cusExVal);
        const dealerExVal = parseNum(rowData.dealerExVal);
        const exTncAmt = parseNum(rowData.exTncAmt);
        const hasExchange = cusExVal !== 0 || dealerExVal !== 0 || exTncAmt !== 0;
        const exchangeGap = dealerExVal - exTncAmt;

        const dpTncAmt = parseNum(rowData.dpTncAmt);
        const disTncAmt = parseNum(rowData.disTncAmt);
        
        const cashFinance = rowData.cashFinance ? String(rowData.cashFinance).trim().toUpperCase() : "";
        const hasDisbursement = cashFinance !== "CASH" && cashFinance !== "";

        const totalIn = advTncAmt + dpTncAmt + (hasDisbursement ? disTncAmt : 0) + exTncAmt;

        const invVal = parseNum(rowData.invVal);
        
        // Handle custom Insurance Transaction Amount logic: empty vs 0
        const insRaw = rowData.insTncAmt;
        const insDisplay = (insRaw === "" || insRaw === null || insRaw === undefined) ? "" : insRaw;
        const insTncAmt = (insRaw === "" || insRaw === null || insRaw === undefined) ? 0 : parseNum(insRaw);

        const rtoTncAmt = parseNum(rowData.rtoTncAmt);

        const totalOut = invVal + insTncAmt + rtoTncAmt;

        const finalGap = totalIn - totalOut;

        const onRoadPrice = parseNum(rowData.onRoad);
        const onRoadGap = totalIn - onRoadPrice;

        container.innerHTML = `
            <style>
                .avf-wrapper {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: var(--space-4) var(--space-3);
                    color: var(--text-primary);
                }
                .avf-header {
                    margin-bottom: var(--space-4);
                }
                .avf-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                    color: var(--text-primary);
                }
                .avf-card {
                    background: var(--bg-soft);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                    padding: var(--space-4);
                    margin-bottom: var(--space-4);
                }
                .avf-card-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 var(--space-3) 0;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .avf-grid-two {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: var(--space-4);
                    margin-bottom: var(--space-4);
                }
                .avf-fields-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: var(--space-4);
                }
                .avf-summary-card {
                    padding: var(--space-3);
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .avf-summary-card.in {
                    background: rgba(16, 185, 129, 0.03);
                    border-color: rgba(16, 185, 129, 0.15);
                }
                .avf-summary-card.out {
                    background: rgba(239, 68, 68, 0.03);
                    border-color: rgba(239, 68, 68, 0.15);
                }
                .avf-summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed var(--border);
                    font-size: 13px;
                    color: var(--text-primary);
                }
                .avf-summary-row:last-child {
                    border-bottom: none;
                }
                .avf-summary-row.total {
                    font-weight: 700;
                    font-size: 13px;
                    border-top: 1px solid var(--border);
                    margin-top: auto;
                    padding-top: var(--space-2);
                    color: var(--text-primary);
                }
                .avf-gap-strip {
                    background: var(--bg-soft);
                    border: 1px solid var(--border);
                    padding: var(--space-3);
                    border-radius: var(--radius-sm);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 700;
                    font-size: 13px;
                    margin-top: var(--space-3);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .avf-footer-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--space-3);
                    margin-top: var(--space-4);
                    padding-top: var(--space-3);
                    border-top: 1px solid var(--border);
                }
                @media (max-width: 768px) {
                    .avf-grid-two {
                        grid-template-columns: 1fr;
                        gap: var(--space-3);
                    }
                    .avf-fields-grid {
                        gap: var(--space-3);
                    }
                    .avf-wrapper {
                        padding: var(--space-2);
                    }
                    /* Stretch the last odd child to span full width on mobile viewports */
                    .avf-fields-grid > *:last-child:nth-child(odd) {
                        grid-column: 1 / -1;
                    }
                }
            </style>

            <div class="avf-wrapper">
                <div class="avf-header u-flex-between" style="margin-bottom: var(--space-4); align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                    <h1 class="avf-title">Admin Verification Form</h1>
                    <button id="avf-back-btn" class="ui-button ui-button--ghost" type="button" style="padding: 6px 12px; min-height: 32px; font-size: 13px; font-weight: 600;">
                        ← Back
                    </button>
                </div>

                <div id="avf-status" class="ui-status" role="status" aria-live="polite" style="margin-bottom: var(--space-4);"></div>

                <form id="admin-verify-form">
                    <!-- SECTION 1: BASIC INFORMATION -->
                    <div class="avf-card">
                        <div class="avf-card-title">Basic Information</div>
                        <div class="avf-fields-grid">
                            <div class="ui-field">
                                <label class="ui-label">Sale Date</label>
                                <input class="ui-input ui-readonly" type="text" readonly value="${formatDate(rowData.saleDate)}" />
                            </div>
                            <div class="ui-field">
                                <label class="ui-label">Model</label>
                                <input class="ui-input ui-readonly" type="text" readonly value="${rowData.model ?? ""}" />
                            </div>
                            <div class="ui-field">
                                <label class="ui-label">Color</label>
                                <input class="ui-input ui-readonly" type="text" readonly value="${rowData.color ?? ""}" />
                            </div>
                            <div class="ui-field">
                                <label class="ui-label">Sale Counter</label>
                                <input class="ui-input ui-readonly" type="text" readonly value="${rowData.saleCounter ?? ""}" />
                            </div>
                            <div class="ui-field">
                                <label class="ui-label">Customer Name</label>
                                <input class="ui-input ui-readonly" type="text" readonly value="${rowData.customerName ?? ""}" />
                            </div>
                        </div>
                    </div>

                    <!-- GRIDS FOR VERIFICATIONS -->
                    <div class="avf-grid-two">
                        <!-- DOWN PAYMENT VERIFICATION -->
                        <div class="avf-card" style="margin-bottom: 0;">
                            <div class="avf-card-title">Down Payment Verification</div>
                            <div class="avf-fields-grid">
                                <div class="ui-field">
                                    <label class="ui-label">Received DP</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.receivedDp ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">Call DP Value</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.callDp ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">DP Transaction Amount</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.dpTncAmt ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">DP Gap Value</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.dpGap ?? "0"}" />
                                </div>
                            </div>
                        </div>

                        <!-- DISBURSEMENT VERIFICATION -->
                        ${hasDisbursement ? `
                        <div class="avf-card" style="margin-bottom: 0;">
                            <div class="avf-card-title">Disbursement Verification</div>
                            <div class="avf-fields-grid">
                                <div class="ui-field">
                                    <label class="ui-label">Estimated Disbursement</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.estDis ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">Disbursement Transaction Amount</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.disTncAmt ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">Disbursement Gap Value</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.disGap ?? "0"}" />
                                </div>
                            </div>
                        </div>
                        ` : ""}
                    </div>

                    <!-- CONDITIONAL GRIDS -->
                    ${hasAdvance || hasExchange ? `
                    <div class="avf-grid-two">
                        <!-- ADVANCE VERIFICATION -->
                        ${hasAdvance ? `
                        <div class="avf-card" style="margin-bottom: 0;">
                            <div class="avf-card-title">Advance Verification</div>
                            <div class="avf-fields-grid">
                                <div class="ui-field">
                                    <label class="ui-label">Adv Amt</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.advAmt ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">Advance Transaction Amount</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.advTncAmt ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">Advance Gap</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${advanceGap}" />
                                </div>
                            </div>
                        </div>
                        ` : ""}

                        <!-- EXCHANGE VERIFICATION -->
                        ${hasExchange ? `
                        <div class="avf-card" style="margin-bottom: 0;">
                            <div class="avf-card-title">Exchange Verification</div>
                            <div class="avf-fields-grid">
                                <div class="ui-field">
                                    <label class="ui-label">Customer Exchange Value</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.cusExVal ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">Dealer Exchange Value</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.dealerExVal ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">Exchange Transaction Amount</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${rowData.exTncAmt ?? "0"}" />
                                </div>
                                <div class="ui-field">
                                    <label class="ui-label">Exchange Gap</label>
                                    <input class="ui-input ui-readonly" type="text" readonly value="${exchangeGap}" />
                                </div>
                            </div>
                        </div>
                        ` : ""}
                    </div>
                    ` : ""}

                    <!-- SECTION 4: TRANSACTION SUMMARY -->
                    <div class="avf-card">
                        <div class="avf-card-title">Transaction Verification Summary</div>
                        <div class="avf-grid-two">
                            <!-- IN Block -->
                            <div class="avf-summary-card in">
                                <h5 style="margin: 0 0 var(--space-2) 0; font-size: 11px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px;">IN: Total Cash Flow</h5>
                                ${hasAdvance ? `<div class="avf-summary-row"><span>Advance Transaction Amount</span> <span>${advTncAmt}</span></div>` : ""}
                                <div class="avf-summary-row"><span>DP Transaction Amount</span> <span>${dpTncAmt}</span></div>
                                ${hasDisbursement ? `<div class="avf-summary-row"><span>Disbursement Transaction Amount</span> <span>${disTncAmt}</span></div>` : ""}
                                ${hasExchange ? `<div class="avf-summary-row"><span>Exchange Transaction Amount</span> <span>${exTncAmt}</span></div>` : ""}
                                <div class="avf-summary-row total"><span>TOTAL IN</span> <span>${totalIn}</span></div>
                            </div>

                            <!-- OUT Block -->
                            <div class="avf-summary-card out">
                                <h5 style="margin: 0 0 var(--space-2) 0; font-size: 11px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px;">OUT: Invoiced Charges</h5>
                                <div class="avf-summary-row"><span>Invoice After GST After Discount</span> <span>${invVal}</span></div>
                                <div class="avf-summary-row"><span>Insurance Transaction Amount</span> <span>${insDisplay}</span></div>
                                <div class="avf-summary-row"><span>RTO Transaction Amount</span> <span>${rtoTncAmt}</span></div>
                                <div class="avf-summary-row total"><span>TOTAL OUT</span> <span>${totalOut}</span></div>
                            </div>
                        </div>

                        <div class="avf-gap-strip">
                            <span>FINAL GAP AMOUNT</span>
                            <span style="color: ${finalGap === 0 ? "var(--success)" : "var(--accent)"};">${finalGap}</span>
                        </div>
                    </div>

                    <!-- DUE AMOUNT CARD -->
                    <div class="avf-card">
                        <div class="avf-card-title">Due Amount</div>
                        <div class="avf-fields-grid">
                            <div class="ui-field">
                                <input class="ui-input ui-readonly" type="text" readonly value="${rowData.due ?? "0"}" />
                            </div>
                        </div>
                    </div>

                    <!-- SECTION 3: ON-ROAD PRICE STATUS -->
                    <div class="avf-card">
                        <div class="avf-card-title">On-Road price status</div>
                        <div class="avf-fields-grid">
                            <div class="ui-field">
                                <label class="ui-label">On-Road Price</label>
                                <input class="ui-input ui-readonly" type="text" readonly value="${onRoadPrice}" />
                            </div>
                            <div class="ui-field">
                                <label class="ui-label">On Road Gap Value</label>
                                <input class="ui-input ui-readonly" type="text" readonly value="${onRoadGap}" style="font-weight: 700; color: ${onRoadGap === 0 ? "var(--success)" : "var(--accent)"};" />
                            </div>
                        </div>
                    </div>

                    <!-- REMARK -->
                    <div class="ui-field" style="margin-top: var(--space-4);">
                        <label class="ui-label" for="avf-remark">Verification Remarks</label>
                        <textarea id="avf-remark" class="ui-input" rows="3" placeholder="Describe any verification notes..." style="font-size: 13px;"></textarea>
                    </div>

                    <!-- FOOTER ACTIONS -->
                    <div class="avf-footer-actions">
                        <button id="avf-cancel-btn" class="ui-button ui-button--ghost" type="button" style="min-width: 100px; min-height: 38px;">Cancel</button>
                        <button id="avf-submit-btn" class="ui-button" type="submit" style="min-width: 140px; min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; font-weight: 600;">
                            <span>Verify & Submit</span>
                        </button>
                    </div>
                </form>
            </div>
        `;

        const backBtn = container.querySelector("#avf-back-btn");
        const cancelBtn = container.querySelector("#avf-cancel-btn");
        const formEl = container.querySelector("#admin-verify-form");
        const remarkInput = container.querySelector("#avf-remark");
        const statusEl = container.querySelector("#avf-status");
        const submitBtn = container.querySelector("#avf-submit-btn");

        if (backBtn) {
            backBtn.addEventListener("click", () => {
                onBack(false);
            });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                onBack(false);
            });
        }

        formEl.addEventListener("submit", async (e) => {
            e.preventDefault();
            const remark = remarkInput.value.trim();

            submitBtn.disabled = true;
            setStatus(statusEl, "Submitting verification details...", "info", true);

            try {
                const res = await backendRequest("submitAdminVerification", {
                    chassisNumber: rowData.chassisNumber,
                    remark: remark
                });

                if (res.status === 1) {
                    setStatus(statusEl, "Record verified successfully. Returning to list...", "success");
                    setTimeout(() => {
                        onBack(true);
                    }, 1500);
                } else {
                    setStatus(statusEl, res.message || "Failed to submit verification.", "error");
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error("[submitAdminVerification]", err);
                setStatus(statusEl, "Network error. Please try again.", "error");
                submitBtn.disabled = false;
            }
        });
    }

    return { mount };
})();

export { AdminVerificationForm };
