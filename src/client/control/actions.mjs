const wait = delay => new Promise(res => window.setTimeout(res, delay));

export const Actions = ({ propose }) => ({
  async refresh() {
    await propose({ name: Date.now() });
  },
  async fetchPosts(...args) {
    console.log("Actions.fetchPosts", args);
    await wait(1000);
    const postsData = await fetch("/posts").then(resp => resp.json());
    await propose({ posts: postsData });
  },
});
