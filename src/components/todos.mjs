export const CreateTodo = ({ updateTodo }) => {
    return async function(event) {
        event.preventDefault();
        this.setAttribute("disabled", "true");
        const input = this.parentElement.querySelector("input.newTodo");
        await updateTodo({
            id: null,
            done: false,
            text: input.value,
        });
        input.value = "";
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
    return render`
        <li class=${todo.done ? "todo--done" : ""}>
            <span>${todo.text}</span>
            <label>
                <input
                    type="checkbox"
                    onclick=${UpdateTodo({ updateTodo, todo })}
                    checked=${todo.done}
                />
                Toggle Done
            </label>
        </li>
    `;
};

export const _todos = props => {
    if (typeof document === "object") {
        import("./todos.pcss");
    }
    const { render, connect, name, todos, updateTodo } = props;
    const todoItem = (todo, i) => {
        return connect(_todoItem, { todo, updateTodo }, todo, i);
    };
    return render`
        <h1>TODO List, ${name}</h1>
        <form>
            <input class="newTodo" />
            <button onclick=${CreateTodo({ updateTodo })}>Add TODO</button>
            <script>
                (() => {
                    const inputs = document.querySelectorAll('input.newTodo');
                    for (const input of inputs) {
                        const button = input.parentElement.querySelector('button');
                        const setDisabled = () => {
                            const disabled = !input.value.length;
                            if (disabled) {
                                button.setAttribute("disabled", "true");
                            } else {
                                button.removeAttribute("disabled");
                            }
                        }
                        setDisabled();
                        input.addEventListener('keyup', setDisabled);
                    }
                })()
            </script>
        </form>
        <ul class="todos">
            ${todos.map(todoItem)}
        </ul>
    `;
};

export const todos = props => {
    const state = {
        name: props._state.name,
        todos: props._state.todos,
        updateTodo: props._actions.updateTodo,
    };
    return props.connect(_todos, state);
};
