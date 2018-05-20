export const UpdateStream = async () => {
    console.log("UpdateStream construct");
    return async ({ render, state, actions }) => {
        return render(state)`
            <script>
            </script>
        `;
    };
};

export const foo = () => {
    console.log("hi");
};
