import { clearSession } from "../services/session.js";
import { NewWalkInForm } from "../components/showroom/NewWalkInForm.js";
import { FollowUpList } from "../components/showroom/FollowUpList.js";
import { StockReport } from "../components/accounts/StockReport.js";
import { SalesReport } from "../components/accounts/SalesReport.js";
import { RTOReport } from "../components/showroom/RTOReport.js";
import { AdvanceReport } from "../components/accounts/AdvanceReport.js";
import { PendingDisbursementReport } from "../components/accounts/PendingDisbursementReport.js";
import { DueReport } from "../components/accounts/DueReport.js";
import { PendingDPVerificationReport } from "../components/accounts/PendingDPVerificationReport.js";
import { initResponsiveSidebar, renderSidebarLayout, renderWelcomeState } from "../components/ui.js";
import { getDriveUrlForSession } from "../config/index.js";

const GROUPS = [
    {
        label: "Forms",
        items: [
            { label: "New Walk In", component: NewWalkInForm }
        ]
    },
    {
        label: "Reports",
        items: [
            { label: "Customer Follow Up", component: FollowUpList },
            { label: "Stock Report", component: StockReport },
            { label: "Sales Report", component: SalesReport },
            { label: "Due Report", component: DueReport },
            { label: "RTO Report", component: RTOReport },
            { label: "Advance Report", component: AdvanceReport },
            { label: "Pending Disbursement Report", component: PendingDisbursementReport },
            { label: "Pending DP Verification Report", component: PendingDPVerificationReport }
        ]
    }
];

const CSS_STYLES = `
#showroom-page {
    --sidebar-width: 290px;
}

#showroom-page .app-nav__group {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
}

#showroom-page .app-nav__group-header {
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

#showroom-page .app-nav__group-header:hover {
    background: var(--hover);
}

#showroom-page .app-nav__group-header::after {
    content: "▼";
    font-size: 10px;
    transition: transform 0.2s ease;
    color: var(--text-soft);
}

#showroom-page .app-nav__group[data-expanded="false"] .app-nav__group-header::after {
    transform: rotate(-90deg);
}

#showroom-page .app-nav__group-items {
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

#showroom-page .app-nav__group[data-expanded="true"] .app-nav__group-items {
    max-height: 250px;
    padding-bottom: 6px;
}

/* Custom Scrollbar for group items */
#showroom-page .app-nav__group-items::-webkit-scrollbar {
    width: 6px;
}
#showroom-page .app-nav__group-items::-webkit-scrollbar-track {
    background: transparent;
}
#showroom-page .app-nav__group-items::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
}
#showroom-page .app-nav__group-items::-webkit-scrollbar-thumb:hover {
    background: var(--text-soft);
}
`;

export function renderShowroom(session) {
    const driveUrl = getDriveUrlForSession(session);

    // Inject page-specific styles
    let styleTag = document.getElementById("showroom-custom-styles");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "showroom-custom-styles";
        styleTag.innerHTML = CSS_STYLES;
        document.head.appendChild(styleTag);
    }

    document.getElementById("app").innerHTML = renderSidebarLayout({
        pageId: "showroom-page",
        sidebarTitle: "Showroom Tasks",
        listId: "form-list",
        contentId: "showroom-content",
        emptyContent: renderWelcomeState(`<span class="ui-welcome-state__accent">${session.branch}</span> Team`),
        showViewSheetButton: false,
        showViewDriveButton: Boolean(driveUrl)
    });

    const formList = document.getElementById("form-list");
    const contentArea = document.getElementById("showroom-content");
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

    initResponsiveSidebar("showroom-page");

    document.getElementById("view-drive")?.addEventListener("click", () => {
        window.open(driveUrl, "_blank", "noopener,noreferrer");
    });

    document.getElementById("logout").addEventListener("click", () => {
        clearSession();
        window.navigateTo();
    });
}
