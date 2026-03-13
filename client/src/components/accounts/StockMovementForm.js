const StockMovementForm = (() => {
    async function mount(container, session) {
        container.innerHTML = `<div><h2>Stock Movement Form</h2></div>`;
    }
    return { mount };
})();

export { StockMovementForm };
