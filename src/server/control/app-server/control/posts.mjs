// @ts-ignore
import { posts as postsData } from "../entity";

export const servePosts = ({ posts }) => async ctx => {
    ctx.body = posts.map(p => ({
        ...p,
        content: `${p.content} ${Math.random()}`,
    }));
};

export const posts = servePosts({ posts: postsData });
