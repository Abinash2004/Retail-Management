import { clearSession } from "../services/session.js";
import { FollowUpList } from "../components/showroom/FollowUpList.js";
import { StockReport } from "../components/accounts/StockReport.js";
import { SalesReport } from "../components/accounts/SalesReport.js";
import { AdvanceReport } from "../components/accounts/AdvanceReport.js";
import { PendingDisbursementReport } from "../components/accounts/PendingDisbursementReport.js";
import { DueReport } from "../components/accounts/DueReport.js";
import { DPCallVerification } from "../components/accounts/DPCallVerification.js";
import { PendingDPVerificationReport } from "../components/accounts/PendingDPVerificationReport.js";
import { AccountReport } from "../components/accounts/AccountReport.js";
import { initResponsiveSidebar, renderSidebarLayout, renderWelcomeState } from "../components/ui.js";
import { getSheetUrlForSession, ADMIN_SHEET_URL } from "../config/index.js";
import { backendRequest } from "../api/index.js";

const GROUPS = [
    {
        label: "Forms",
        items: [
            { label: "DP Call Verification", component: DPCallVerification }
        ]
    },
    {
        label: "Reports",
        items: [
            { label: "Account Report", component: AccountReport },
            { label: "Follow Up List", component: FollowUpList },
            { label: "Stock Report", component: StockReport },
            { label: "Sales Report", component: SalesReport },
            { label: "Due Report", component: DueReport },
            { label: "Advance Report", component: AdvanceReport },
            { label: "Pending Disbursement Report", component: PendingDisbursementReport },
            { label: "Pending DP Verification Report", component: PendingDPVerificationReport }
        ]
    }
];

const CSS_STYLES = `
#admin-page {
    --sidebar-width: 290px;
}

#admin-page .app-nav__group {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
}

#admin-page .app-nav__group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--border);
    user-select: none;
    transition: all 0.2s ease;
}

#admin-page .app-nav__group-header:hover {
    background: var(--hover);
}

#admin-page .app-nav__group-header::after {
    content: "▼";
    font-size: 10px;
    transition: transform 0.2s ease;
    color: var(--text-soft);
}

#admin-page .app-nav__group[data-expanded="false"] .app-nav__group-header::after {
    transform: rotate(-90deg);
}

#admin-page .app-nav__group-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
    list-style: none;
    padding-left: 12px;
    margin: 4px 0 0 0;
    max-height: 0;
    overflow-y: auto;
    transition: max-height 0.25s ease-out;
}

#admin-page .app-nav__group[data-expanded="true"] .app-nav__group-items {
    max-height: 250px;
    padding-bottom: 6px;
}

/* Custom Scrollbar for group items */
#admin-page .app-nav__group-items::-webkit-scrollbar {
    width: 6px;
}
#admin-page .app-nav__group-items::-webkit-scrollbar-track {
    background: transparent;
}
#admin-page .app-nav__group-items::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
}
#admin-page .app-nav__group-items::-webkit-scrollbar-thumb:hover {
    background: var(--text-soft);
}
`;

export function renderAdmin(session) {
    const sheetUrl = getSheetUrlForSession(session);

    // Inject page-specific styles
    let styleTag = document.getElementById("admin-custom-styles");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "admin-custom-styles";
        styleTag.innerHTML = CSS_STYLES;
        document.head.appendChild(styleTag);
    }

    document.getElementById("app").innerHTML = renderSidebarLayout({
        pageId: "admin-page",
        sidebarTitle: "Admin Tasks",
        listId: "admin-form-list",
        contentId: "admin-content",
        emptyContent: renderWelcomeState(`<span class="ui-welcome-state__accent">ADMIN</span> Panel`),
        showViewSheetButton: Boolean(sheetUrl),
        showViewAdminSheetButton: Boolean(ADMIN_SHEET_URL)
    });

    const formList = document.getElementById("admin-form-list");
    const contentArea = document.getElementById("admin-content");
    let activeItem = null;

    GROUPS.forEach((group) => {
        const groupContainer = document.createElement("div");
        groupContainer.className = "app-nav__group";
        groupContainer.dataset.expanded = "false";

        const header = document.createElement("div");
        header.className = "app-nav__group-header";
        header.textContent = group.label;

        const itemsContainer = document.createElement("ul");
        itemsContainer.className = "app-nav__group-items";

        group.items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item.label;
            li.className = "app-nav__item";

            li.addEventListener("click", (e) => {
                e.stopPropagation();
                if (activeItem === li) return;

                if (activeItem) {
                    activeItem.removeAttribute("data-active");
                }
                li.dataset.active = "true";
                activeItem = li;

                contentArea.innerHTML = "";
                item.component.mount(contentArea, session);
            });

            itemsContainer.appendChild(li);
        });

        header.addEventListener("click", () => {
            const isExpanded = groupContainer.dataset.expanded === "true";
            groupContainer.dataset.expanded = isExpanded ? "false" : "true";
        });

        groupContainer.appendChild(header);
        groupContainer.appendChild(itemsContainer);
        formList.appendChild(groupContainer);
    });

    initResponsiveSidebar("admin-page");

    const viewSheetBtn = document.getElementById("view-sheet");
    if (viewSheetBtn) {
        viewSheetBtn.addEventListener("click", async () => {
            const originalText = viewSheetBtn.textContent;
            viewSheetBtn.textContent = "Syncing...";
            viewSheetBtn.disabled = true;
            try {
                await backendRequest("syncSheet");
            } catch (err) {
                console.error("Sync failed:", err);
            } finally {
                viewSheetBtn.textContent = originalText;
                viewSheetBtn.disabled = false;
                window.open(sheetUrl, "_blank", "noopener,noreferrer");
            }
        });
    }

    const viewAdminSheetBtn = document.getElementById("view-admin-sheet");
    if (viewAdminSheetBtn) {
        viewAdminSheetBtn.addEventListener("click", () => {
            window.open(ADMIN_SHEET_URL, "_blank", "noopener,noreferrer");
        });
    }

    document.getElementById("logout").addEventListener("click", () => {
        clearSession();
        window.navigateTo("/login");
    });
}
