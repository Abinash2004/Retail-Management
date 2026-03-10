import { backendRequest } from "../api/index.js";
import { UpdateFollowUpForm } from "./UpdateFollowUpForm.js";
import "../style/FollowUpList.css";

const LIMIT = 10;

// 0-indexed into the full row array returned by backend
const COL = {
    VISIT_DATE:     1,
    CUSTOMER_NAME:  3,
    MOBILE_NUMBER:  4,
    STATUS:         8,
    FIRST_FEEDBACK: 11,
    LAST_FEEDBACK:  13
};

const FollowUpList = (() => {

    async function mount(container, session) {
        let page    = 1;
        let hasMore = true;
        let currentStatus = "ALL";

        function showList() {
            container.innerHTML = `
                <div id="follow-up-list-wrapper">
                    <div id="follow-up-header">
                        <h2>Follow Up Customer List</h2>
                        <select id="fup-status-filter">
                            <option value="ALL">All</option>
                            <option value="OPEN">Open</option>
                            <option value="CLOSE">Close</option>
                            <option value="PURCHASED">Purchased</option>
                        </select>
                    </div>
                    <div id="follow-up-table-container">
                        <table id="follow-up-table">
                            <thead>
                                <tr>
                                    <th>Visit Date</th>
                                    <th>Customer Name</th>
                                    <th>Mobile Number</th>
                                    <th>Follow Up Status</th>
                                    <th>Feedback Status</th>
                                </tr>
                            </thead>
                            <tbody id="follow-up-tbody"></tbody>
                        </table>
                    </div>
                    <div id="follow-up-pagination">
                        <button id="fup-prev" disabled>&larr;</button>
                        <span id="fup-page-info">Page ${page}</span>
                        <button id="fup-next">&rarr;</button>
                    </div>
                </div>
            `;

            const tbody         = container.querySelector("#follow-up-tbody");
            const prevBtn       = container.querySelector("#fup-prev");
            const nextBtn       = container.querySelector("#fup-next");
            const pageInfo      = container.querySelector("#fup-page-info");
            const statusFilter  = container.querySelector("#fup-status-filter");

            async function loadPage() {
                prevBtn.disabled = true;
                nextBtn.disabled = true;
                tbody.innerHTML  = "";

                try {
                    const res = await backendRequest("getFollowUpList", {
                        branch: session.branch,
                        page,
                        limit: LIMIT,
                        status: currentStatus
                    });

                    if (res.status !== 1) return;

                    const rows = res.data;
                    hasMore = rows.length === LIMIT;

                    if (rows.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="5">No records found.</td></tr>`;
                    } else {
                        rows.forEach(row => {
                            const tr = document.createElement("tr");
                            tr.className = "fup-row";
                            const rawDate = row[COL.VISIT_DATE];
                            const visitDate = rawDate ? new Date(rawDate).toLocaleDateString() : "";
                            const hasFirst = !!row[COL.FIRST_FEEDBACK];
                            const hasLast  = !!row[COL.LAST_FEEDBACK];
                            
                            let feedbackStatus = "First Feedback Pending";
                            let badgeClass = "";
                            if (hasFirst && hasLast) {
                                feedbackStatus = "Both Feedback Given";
                                badgeClass = " done";
                            } else if (hasFirst && !hasLast) {
                                feedbackStatus = "Last Feedback Pending";
                                badgeClass = " partial";
                            }

                            const followUpStatus = row[COL.STATUS] || "OPEN";

                            tr.innerHTML = `
                                <td>${visitDate}</td>
                                <td>${row[COL.CUSTOMER_NAME] || ""}</td>
                                <td>${row[COL.MOBILE_NUMBER] || ""}</td>
                                <td>${followUpStatus}</td>
                                <td>${feedbackStatus}</td>
                            `;
                            tr.addEventListener("click", () => showForm(row));
                            tbody.appendChild(tr);
                        });
                    }

                    pageInfo.textContent = `Page ${page}`;
                    prevBtn.disabled = page === 1;
                    nextBtn.disabled = !hasMore;
                } catch (err) {
                    console.error("[getFollowUpList]", err);
                    prevBtn.disabled = page === 1;
                    nextBtn.disabled = !hasMore;
                }
            }

            statusFilter.value = currentStatus;
            statusFilter.addEventListener("change", () => {
                currentStatus = statusFilter.value;
                page = 1;
                loadPage();
            });

            prevBtn.addEventListener("click", () => { if (page > 1) { page--; loadPage(); } });
            nextBtn.addEventListener("click", () => { if (hasMore)  { page++; loadPage(); } });

            loadPage();
        }

        function showForm(rowData) {
            container.innerHTML = "";
            UpdateFollowUpForm.mount(container, rowData, () => {
                showList();
            });
        }

        showList();
    }

    return { mount };
})();

export { FollowUpList };
