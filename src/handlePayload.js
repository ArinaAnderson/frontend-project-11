const handlePayload = (rssLink, parsedRSS, feedID) => {
  const { feed: feedData, posts: postsData } = parsedRSS;

  const feed = {
    id: feedID, // feedID, // uniqueId(),
    title: feedData.title.trim(),
    description: feedData.description.trim(),
    rssLink,
  };

  const posts = postsData.map((post) => ({
    feedID: feed.id,
    title: post.title,
    description: post.description,
    link: post.link,
    // id: generateID(),
  }));

  return { feed, posts };
};

export default handlePayload;
