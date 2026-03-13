const AdvanceReceiveForm = (() => {
    async function mount(container, session) {
        container.innerHTML = `<div><h2>Advance Receive Form</h2></div>`;
    }
    return { mount };
})();

export { AdvanceReceiveForm };
