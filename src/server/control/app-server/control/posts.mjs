import { posts as postsData } from "../entity";

export const posts = async ctx => {
    ctx.body = postsData.map(p => ({
        ...p,
        content: `${p.content} ${Math.random()}`,
    }));
};
