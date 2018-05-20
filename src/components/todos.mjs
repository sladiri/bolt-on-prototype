export const CreateTodo = ({ updateTodo }) => {
    return async function(event) {
        event.preventDefault();
        this.setAttribute("disabled", "true");
        const textInput = document.querySelector("#newTodo");
        await updateTodo({
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

export const UpdateTodo = ({ updateTodo, todo }) => {
    return async function() {
        this.setAttribute("disabled", "true");
        await updateTodo({ id: todo.id, done: !todo.done });
        this.removeAttribute("disabled");
    };
};

export const _todoItem = props => {
    const { render, todo, updateTodo } = props;
    return render(todo)`
        <li class=${todo.done ? "todo--done" : ""}>
            <span>${todo.text}</span>
            <label>
                <input
                    type="checkbox"
                    onclick=${UpdateTodo({ updateTodo, todo })} />
                Toggle Done
            </label>
        </li>
    `;
};

export const todoItem = todo => (props, namespace) => {
    const state = {
        todo,
        updateTodo: props._actions.updateTodo,
    };
    return props.connect(_todoItem, state, namespace);
};

export const _todos = props => {
    if (typeof document === "object") {
        // @ts-ignore
        import("./todos.pcss");
    }
    const { render, name, todos, updateTodo } = props;
    return render()`
        <h1>TODO List, ${name}</h1>
        <form>
            <input id="newTodo" />
            <button onclick=${CreateTodo({ updateTodo })}>Add TODO</button>
        </form>
        <ul class="todos">
            ${todos.map(todo => todoItem(todo)(props, render))}
        </ul>
    `;
};

export const todos = (props, namespace) => {
    const state = {
        name: props._state.name,
        todos: props._state.todos,
        updateTodo: props._actions.updateTodo,
    };
    return props.connect(_todos, state, namespace);
};
