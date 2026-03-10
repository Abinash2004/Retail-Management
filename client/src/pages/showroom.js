import { clearSession } from "../services/session.js";
import { DailyTransactionForm } from "../components/showroom/DailyTransactionForm.js";
import { NewWalkInForm } from "../components/showroom/NewWalkInForm.js";
import { FollowUpList } from "../components/showroom/FollowUpList.js";
import "../style/showroom/ShowroomPage.css";
import "../style/showroom/Sidebar.css";
import "../style/showroom/FormContainer.css";

const FORMS = [
    { label: "Daily Transaction", component: DailyTransactionForm },
    { label: "New Walk In", component: NewWalkInForm },
    { label: "Customer Follow Up", component: FollowUpList }
];

export function renderShowroom(session) {
    document.getElementById("app").innerHTML = `
        <div id="showroom-page">
            <div id="showroom-sidebar">
                <h3>Forms</h3>
                <ul id="form-list"></ul>
                <hr>
                <button id="logout">Logout</button>
            </div>
            <div id="showroom-content">
                <p>Select a form from the sidebar.</p>
            </div>
        </div>
    `;

    const formList    = document.getElementById("form-list");
    const contentArea = document.getElementById("showroom-content");
    let activeIndex   = null;

    FORMS.forEach(({ label, component }, index) => {
        const li = document.createElement("li");
        li.textContent   = label;
        li.dataset.index = index;

        li.addEventListener("click", () => {
            if (activeIndex === index) return;
            activeIndex = index;

            formList.querySelectorAll("li").forEach(el => el.removeAttribute("data-active"));
            li.dataset.active = "true";

            contentArea.innerHTML = "";
            component.mount(contentArea, session);
        });

        formList.appendChild(li);
    });

    document.getElementById("logout").addEventListener("click", () => {
        clearSession();
        window.navigateTo();
    });
}
