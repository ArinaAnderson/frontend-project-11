import uniqueId from 'lodash/uniqueId.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';
import sendRequest from './utils/sendRequest.js';

const TIME_INTERVAL = 5000;

const updateFeedsHandler = (state) => {
  const { feeds: allFeeds, posts: allPosts } = state;

  const allTitles = allPosts.map((post) => post.title);
  const promises = allFeeds.map(({ rssLink, id: feedID }) => {
    const requestedData = sendRequest(rssLink);
    return requestedData
      .then((data) => {
        // if (data.status === 'fulfilled') {
        // const parsedRSS = parseRSS(data.value.contents);
        const parsedRSS = parseRSS(data.contents);
        const { posts } = handlePayload(rssLink, parsedRSS, feedID, uniqueId);
        const newPosts = posts
          .filter((post) => !allTitles.includes(post.title));
        state.posts = newPosts.concat(state.posts);
        // }
      });
    /*
    .then((data) => {
        const parsedRSS = parseRSS(data.contents);
        const { posts } = handlePayload(rssLink, parsedRSS, feedID, uniqueId);
        const newPosts = posts
          .filter((post) => !allTitles.includes(post.title));
        state.posts = newPosts.concat(state.posts);
        // return newPosts;
      });
    */
  });
  return Promise.allSettled(promises)
    .finally(() => setTimeout(() => updateFeedsHandler(state), TIME_INTERVAL));
  /*
  return Promise.all(promises)
    .then((arrayOfNewPosts) => arrayOfNewPosts
      .flat()
      .filter((el) => el !== null))
    .then((newPosts) => {
      state.posts = newPosts.concat(state.posts);
    })
    .then(() => setTimeout(() => updateFeedsHandler(state), TIME_INTERVAL));
  */
};

const startFeedsUpdate = (state) => {
  setTimeout(() => updateFeedsHandler(state), TIME_INTERVAL);
};

export default startFeedsUpdate;
