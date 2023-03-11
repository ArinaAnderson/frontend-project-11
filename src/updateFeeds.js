import uniqueId from 'lodash/uniqueId.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';
import sendRequest from './utils/sendRequest.js';

const TIME_INTERVAL = 5000;

const updateFeedsHandler = (state) => {
  const { feeds: allFeeds, posts: allPosts } = state;
  /*
  if (allPosts.length === 0) {
    // return null;
    setTimeout(() => updateFeedsHandler(state), 5000);
  }
  */
  const allTitles = allPosts.map((post) => post.title);
  const promises = allFeeds.map(({ rssLink, id: feedID }) => {
    const requestedData = sendRequest(rssLink);
    return requestedData
      .then((data) => {
        const parsedRSS = parseRSS(data.contents);
        const { posts } = handlePayload(rssLink, parsedRSS, feedID, uniqueId);
        const newPosts = posts
          .filter((post) => !allTitles.includes(post.title));
        return newPosts;
      })
      .catch(() => null);
  });
  return Promise.all(promises)
    .then((arrayOfNewPosts) => arrayOfNewPosts
      .flat()
      .filter((el) => el !== null))
    .then((newPosts) => {
      state.posts = newPosts.concat(state.posts);
    })
    .then(() => setTimeout(() => updateFeedsHandler(state), TIME_INTERVAL));
};

const startFeedsUpdate = (state) => {
  setTimeout(() => updateFeedsHandler(state), TIME_INTERVAL);
};

export default startFeedsUpdate;
