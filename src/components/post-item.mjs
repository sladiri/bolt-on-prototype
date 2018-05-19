export const postItem = ({ render, post }) => {
    return render(post)`
        <li class="posts posts__post">
            <h2 class="posts posts__title">${post.title}</h2>
            <span class="posts posts__summary">${post.summary}</span>
            <p class="posts posts__content">${post.content}</p>
        </li>
    `;
};
