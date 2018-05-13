export const accept = async ({ state, proposal }) => {
  try {
    if (proposal.name) {
      state.name = await Promise.resolve(`${proposal.name}!`);
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
  } catch (error) {
    console.error("Acceptor error", error);
    throw error;
  }
};

export const Accept = ({ state }) => proposal => {
  return accept({ state, proposal });
};
