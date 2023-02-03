// import uniqueId from 'lodash/uniqueId.js';
// import parseRSS from './parser.js';

const handlePayload = (parsedRSS, generateID) => { // (parsedRSS, feedID) => {
  // const { feed: feedData, posts: postsData } = parseRSS(rssContents); // (data.contents);
  const { feed: feedData, posts: postsData } = parsedRSS;

  const feed = {
    id: generateID(), // feedID, // uniqueId(),
    title: feedData.title.trim(),
    description: feedData.description.trim(),
  };

  const posts = postsData.map((post) => ({
    feedID: feed.id,
    title: post.title,
    description: post.description,
    link: post.link,
    id: generateID(),
  }));

  return { feed, posts };
};

export default handlePayload;
