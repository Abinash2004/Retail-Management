import { getSession } from "../services/session.js";
import { renderLogin } from "../pages/login.js";
import { renderSales } from "../pages/sales.js";
import { renderAccounts } from "../pages/accounts.js";

const routes = {
    "/login": renderLogin,
    "/sales": renderSales,
    "/accounts": renderAccounts
};

async function navigate() {
    const session = await getSession();

    const targetPath = !session 
        ? "/login" 
        : (session.role === "accounts" ? "/accounts" : "/sales");
    
    if (window.location.pathname !== targetPath) {
        history.replaceState(null, "", targetPath);
    }

    const render = routes[targetPath];
    if (render) render(session);
}

export function router() {
    window.addEventListener("popstate", async () => {
        await navigate();
    });

    window.navigateTo = () => navigate();
    navigate();
}
