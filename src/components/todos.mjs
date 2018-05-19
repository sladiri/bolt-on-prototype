export const todos = async props => {
    if (typeof document === "object") {
        // @ts-ignore
        await import("./todos.pcss");
    }
    const { render, state, actions } = props;
    return render(state)`
        <h1>TODO List, ${props.state.name}</h1>
        <form>
            <input id="newTodo" />
            <button onclick=${createTodo({ actions })}>Add TODO</button>
        </form>
        <ul class="todos">
            ${state.todos.map(todo => todoItem({ ...props, todo }))}
        </ul>
    `;
};

export const todoItem = ({ render, actions, todo }) => {
    return render(todo)`
        <li class=${todo.done ? "todo--done" : ""}>
            <span>${todo.text}</span>
            <label>
                <input
                    type="checkbox"
                    onclick=${updateTodo({ actions, todo })} />
                Toggle Done
            </label>
        </li>
    `;
};

export const createTodo = ({ actions }) => {
    return async function(event) {
        event.preventDefault();
        this.setAttribute("disabled", "true");
        const textInput = document.querySelector("#newTodo");
        await actions.updateTodo({
            id: null,
            done: false,
            // @ts-ignore
            text: textInput.value,
        });
        // @ts-ignore
        textInput.value = "";
        this.removeAttribute("disabled");
    };
};

export const updateTodo = ({ actions, todo }) => {
    return async function() {
        this.setAttribute("disabled", "true");
        await actions.updateTodo({ id: todo.id, done: !todo.done });
        this.removeAttribute("disabled");
    };
};
