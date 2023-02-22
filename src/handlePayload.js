import uniqueId from 'lodash/uniqueId.js';

const handlePayload = (rssLink, parsedRSS, feedID) => { // , getPostID) => {
  const { feed: feedData, posts: postsData } = parsedRSS;

  const feed = {
    id: feedID, // feedID, // uniqueId(),
    title: feedData.title.trim(),
    description: feedData.description.trim(),
    rssLink,
  };

  const posts = postsData.map((post) => ({
    feedID: feed.id,
    id: uniqueId(), // getPostID(),
    title: post.title,
    description: post.description,
    link: post.link,
  }));

  return { feed, posts };
};

export default handlePayload;
