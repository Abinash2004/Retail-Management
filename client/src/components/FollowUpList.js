import { backendRequest } from "../api/index.js";
import "../style/FollowUpList.css";

const LIMIT = 10;

const COL = {
    VISIT_DATE: 1,
    CUSTOMER_NAME: 3,
    MOBILE_NUMBER: 4,
};

const FollowUpList = (() => {

    async function mount(container, session) {
        let page = 1;
        let hasMore = true;

        container.innerHTML = `
            <div id="follow-up-list-wrapper">
                <div id="follow-up-header">
                    <h2>Follow Up Customer List</h2>
                    <select id="fup-status-filter">
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

        const tbody = container.querySelector("#follow-up-tbody");
        const prevBtn = container.querySelector("#fup-prev");
        const nextBtn = container.querySelector("#fup-next");
        const pageInfo = container.querySelector("#fup-page-info");
        const statusFilter = container.querySelector("#fup-status-filter");

        async function loadPage() {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            tbody.innerHTML = "";

            try {
                const res = await backendRequest("getFollowUpList", {
                    branch: session.branch,
                    page,
                    limit: LIMIT,
                    status: statusFilter.value,
                });

                if (res.status !== 1) {
                    return;
                }

                const rows = res.data;
                hasMore = rows.length === LIMIT;

                if (rows.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="3">No records found.</td></tr>`;
                } else {
                    rows.forEach(row => {
                        const tr = document.createElement("tr");
                        const rawDate = row[COL.VISIT_DATE];
                        const visitDate = rawDate ? new Date(rawDate).toLocaleDateString() : "";
                        tr.innerHTML = `
                            <td>${visitDate}</td>
                            <td>${row[COL.CUSTOMER_NAME] || ""}</td>
                            <td>${row[COL.MOBILE_NUMBER] || ""}</td>
                        `;
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

        statusFilter.addEventListener("change", () => {
            page = 1;
            loadPage();
        });

        prevBtn.addEventListener("click", () => {
            if (page > 1) { page--; loadPage(); }
        });

        nextBtn.addEventListener("click", () => {
            if (hasMore) { page++; loadPage(); }
        });

        loadPage();
    }

    return { mount };
})();

export { FollowUpList };
