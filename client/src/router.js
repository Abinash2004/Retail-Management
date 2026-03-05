import { getSession } from "./services/session.js";
import { renderLogin } from "./pages/login.js";
import { renderSales } from "./pages/sales.js";
import { renderAccounts } from "./pages/accounts.js";

const routes = {
    "/login": renderLogin,
    "/sales": renderSales,
    "/accounts": renderAccounts
};

async function navigate(path) {
    const session = await getSession();

    if (path === "/login") {
        if (session) {
            return navigate(session.role === "accounts" ? "/accounts" : "/sales");
        }
    } else if (!session) {
        return navigate("/login");
    } else if (path === "/sales" && session.role !== "sales") {
        return navigate("/accounts");
    } else if (path === "/accounts" && session.role !== "accounts") {
        return navigate("/sales");
    }

    history.pushState(null, "", path);
    const render = routes[path];
    if (render) render(session);
}

export function router() {
    window.addEventListener("popstate", async () => {
        await navigate(location.pathname);
    });

    window.navigateTo = (path) => navigate(path);

    navigate(location.pathname === "/" ? "/login" : location.pathname);
}
