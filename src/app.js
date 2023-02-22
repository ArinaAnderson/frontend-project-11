import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import view from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';

yup.setLocale({
  string: {
    url: () => ({ key: 'invalidUrl' }),
  },
  mixed: {
    required: () => ({ key: 'requiredUrl' }),
    notOneOf: () => ({ key: 'notUniqueValue' }),
  },
});

const validateURLField = (urlField, rssLinks) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(rssLinks);
  return schema.validate(urlField, { abortEarly: false });
};

const getFormData = (form) => Object.fromEntries(new FormData(form));

const updateFeedsHandler = (state) => {
  const { feeds: allFeeds, posts: allPosts } = state;
  /*
  if (allPosts.length === 0) {
    // return null;
    setTimeout(() => updateFeedsHandler(state), 5000);
  }
  */
  const allTitles = allPosts.map((post) => post.title);
  const promises = allFeeds.map(({ rssLink, id }) => {
    const rssURL = `https://allorigins.hexlet.app/get?disableCache=true&url=${rssLink}`;
    return axios.get(rssURL)
      .then((response) => response.data)
      .then((data) => {
        const parsedRSS = parseRSS(data.contents);
        const { posts } = handlePayload(rssLink, parsedRSS, id);
        const newPosts = posts
          .filter((post) => !allTitles.includes(post.title));
        return newPosts;
      })
      .catch(() => null);
  });
  return Promise.all(promises)
    .then((arrayOfNewPosts) => arrayOfNewPosts.flat().filter((el) => el !== null))
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
    evt.preventDefault();
    watchedState.form.processState = 'submit';
    watchedState.form.validationError = '';

    const formData = getFormData(evt.target);

    validateURLField(formData.url, watchedState.rssLinks)
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.validationError = '';
        watchedState.form.processState = 'sending';
        const rssURL = `https://allorigins.hexlet.app/get?disableCache=true&url=${formData.url}`;
        return axios.get(rssURL);
      })
      .then((response) => response.data)
      .then((data) => {
        watchedState.form.processState = 'loadSuccess';

        const parsedRSS = parseRSS(data.contents);
        watchedState.rssLinks.push(formData.url); // move below

        const { feed, posts } = handlePayload(formData.url, parsedRSS, uniqueId());
        watchedState.feeds.unshift(feed);
        watchedState.posts = posts.concat(watchedState.posts);
        // setTimeout(() => updateFeedsHandler(watchedState), 10000);
      })
      .catch((e) => {
        // Error messages:
        // parseError, {key: 'invalidUrl'}, {key: 'notUniqueValue'}, Network Error
        if (watchedState.form.processState === 'sending') {
          watchedState.form.processState = 'networkError';
        }
        if (watchedState.form.processState === 'submit') {
          watchedState.form.validationError = e.message.key;
          watchedState.form.processState = 'filling';
        }
        if (watchedState.form.processState === 'loadSuccess') {
          watchedState.form.processState = 'parserError';
        }
      });
  });

  startFeedsUpdate(watchedState);
};

export default app;
