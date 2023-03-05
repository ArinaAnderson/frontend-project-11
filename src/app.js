import i18n from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import view from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';
import handleFormSubmit from './handleFormSubmit.js';
import sendRequest from './utils/sendRequest.js';

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
    .then(() => setTimeout(() => updateFeedsHandler(state), 2000));
};

const startFeedsUpdate = (state) => {
  setTimeout(() => updateFeedsHandler(state), 5000);
};

const app = async () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    urlField: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds-container'),
    postsContainer: document.querySelector('.posts-container'),
  };

  const state = {
    rssLinks: [],
    feeds: [],
    posts: [],
    form: {
      response: null,
      valid: null,
      validationError: '',
      processState: 'filling', // 'validation','submit', 'sending', 'networkError', 'loadSuccess'
    },
  };

  const defaultLang = 'ru';

  const i18nextInstance = i18n.createInstance();
  await i18nextInstance.init({
    lng: defaultLang, // defaultLang,
    debug: true,
    resources,
  });

  const watchedState = view(state, elements, i18nextInstance);

  elements.form.addEventListener('submit', (evt) => {
    handleFormSubmit(evt, watchedState);
  });

  startFeedsUpdate(watchedState);
};

export default app;
