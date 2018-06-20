export const UpdateHeadScript = () => {
    let currentPage;
    return props => {
        const { render, page } = props;
        if (!currentPage || currentPage === page) {
            currentPage = page;
            return render`<!-- update-head-script inactive -->`;
        }
        currentPage = page;
        return updateHeadScript(props);
    };
};

export const updateHeadScript = props => {
    const { _wire, title, description } = props;
    return _wire()`
            <input id="page-title" value=${title} type="hidden" />
            <input id="page-description" value=${description} type="hidden" />
            <script>
                document.title = document.getElementById("page-title").value;
                document.querySelector('meta[name="description"]').content = document.getElementById("page-description").value;
                document.getElementById("Main").focus();
            </script>
        `;
};
