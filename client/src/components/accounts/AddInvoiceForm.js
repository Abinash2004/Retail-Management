const AddInvoiceForm = (() => {
    async function mount(container, session) {
        container.innerHTML = `<div><h2>Add Invoice Form</h2></div>`;
    }
    return { mount };
})();

export { AddInvoiceForm };
