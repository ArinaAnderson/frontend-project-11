// import uniqueId from 'lodash/uniqueId.js';
// import parseRSS from './parser.js';

const handlePayload = (parsedRSS, feedID) => {
  // const { feed: feedData, posts: postsData } = parseRSS(rssContents); // (data.contents);
  const { feed: feedData, posts: postsData } = parsedRSS;

  const feed = {
    id: feedID, // uniqueId(),
    title: feedData.title.trim(),
    description: feedData.description.trim(),
  };

  const posts = postsData.map((post) => ({
    feedID,
    title: post.title,
    description: post.description,
    link: post.link,
  }));

  return { feed, posts };
};

export default handlePayload;
