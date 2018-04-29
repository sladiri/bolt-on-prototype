export const acceptor = state => proposal => {
  if (!proposal) {
    return;
  }

  if (Array.isArray(proposal.posts)) {
    for (const post of proposal.posts) {
      const currentIndex = state.posts.findIndex(p => p.title === post.title);
      if (currentIndex !== -1) {
        Object.assign(state.posts[currentIndex], post);
      } else {
        state.posts.push(post);
      }
    }
  }

  console.log("acceptor with state", state);
};
