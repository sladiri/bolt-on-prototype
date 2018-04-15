import { hyper } from "hyperhtml/esm";

export const Posts = ({ postsData }) => postsData.map(renderPost);

const renderPost =
  // any object can be wired
  // to a declarative content
  post =>
    // this will return, per each item
    // an actual <LI> DOM node
    hyper(post)`
      <li class="post">
        <h2>${post.title}</h2>
        <div class="summary">${post.summary}</div>
        <p>${post.content}</p>
      </li>`;
