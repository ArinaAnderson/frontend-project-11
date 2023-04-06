import uniqueId from 'lodash/uniqueId.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';
import sendRequest from './utils/sendRequest.js';

const TIME_INTERVAL = 5000;

const updateFeedsHandler = (state) => {
  const { feeds: allFeeds, posts: allPosts } = state;

  const allLinks = allPosts.map((post) => post.link);
  const promises = allFeeds.map(({ rssLink, id: feedID }) => {
    const requestedData = sendRequest(rssLink);
    return requestedData
      .then((data) => {
        const parsedRSS = parseRSS(data.contents);
        const { posts } = handlePayload(rssLink, parsedRSS, feedID, uniqueId);
        const newPosts = posts
          .filter((post) => !allLinks.includes(post.link));
        state.posts = newPosts.concat(state.posts);
      });
  });
  return Promise.allSettled(promises)
    .finally(() => setTimeout(() => updateFeedsHandler(state), TIME_INTERVAL));
};

const startFeedsUpdate = (state) => {
  setTimeout(() => updateFeedsHandler(state), TIME_INTERVAL);
};

export default startFeedsUpdate;
