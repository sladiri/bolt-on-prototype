const wait = delay => new Promise(res => window.setTimeout(res, delay));

export const Actions = ({ propose }) => ({
  async refresh(event) {
    // console.log("refresh action", { event, context: this });
    await propose({ name: Date.now() });
  },
  async fetchPosts(event) {
    await wait(1000);
    const postsData = await fetch("/posts").then(resp => resp.json());
    // console.log("posts action", { postsData, event, context: this });
    await propose({ posts: postsData });
  },
});
