function doPost(e) {
    try {
        if (!e || !e.postData || !e.postData.contents) {
            return jsonResponse({ status: 0, message: "invalid request" });
        }
        
        const { action, token, data } = JSON.parse(e.postData.contents);
        return requestHandler(action, token, data);
        
    } catch (err) {
        return jsonResponse({ status: 0, message: err.message || "server error" });
    }
}

function doGet(e) {
    try {
        if (!e || !e.parameter) {
            return jsonResponse({ status: 0, message: "invalid request" });
        }
        
        const { action, token, data } = JSON.parse(e.parameter);
        return requestHandler(action, token, data);
    
    } catch (err) {
        return jsonResponse({ status: 0, message: err.message || "server error" });
    }
}

function requestHandler(action, token, data) {
    
    if (!token || token !== WEBAPP_TOKEN) {
        return jsonResponse({ status: 0, message: "invalid token" });
    }

    if (!action || !allowedActions[action]) {
        return jsonResponse({ status: 0, message: "invalid action" });
    }

    const result = globalThis[action](data);
    return jsonResponse(result || { status: 1, message: "success" });
}

function verifyPassword(password) {
    switch (password) {
        case ACCOUNT:
            return { status: 1, message: "success", code: 1 };
        case ASKA:
            return { status: 1, message: "success", code: 2 };
        case MOHANA:
            return { status: 1, message: "success", code: 3 };
        case SURADA:
            return { status: 1, message: "success", code: 4 };
        case SURADA_B:
            return { status: 1, message: "success", code: 5 };
        default:
            return { status: 0, message: "invalid password" };
    }
}
