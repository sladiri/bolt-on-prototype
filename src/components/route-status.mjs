export const routeStatus = props => {
    const { render, name } = props;
    return render`
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            class="sr-only"
        >
            Navigated to page ${name}
        </div>
        `;
};
