export const acceptor = state => async proposal => {
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

  return JSON.parse(JSON.stringify(state)); // Convenience for loggging etc.
};
