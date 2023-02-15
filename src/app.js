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
    notOneOf: () => ({ key: 'notUniqueValue' }),
  },
});

const validateURLField = (urlField, rssLinks) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url() // ('The input must be a valid URL')
    .notOneOf(rssLinks); // (feeds, 'The link must not be one of the existing feeds');
  return schema.validate(urlField, { abortEarly: false });
};

// const sendForm = (url) => axios.get(url);

const getFormData = (form) => Object.fromEntries(new FormData(form));

const updateFeedsHandler = (allFeeds, allPosts, state) => {
  if (allPosts.length === 0) {
    return;
  }
  const allTitles = allPosts.map((post) => post.title);
  console.log(allTitles);
  const promises = allFeeds.map(({ rssLink, id }) => {
    const rssURL = `https://allorigins.hexlet.app/get?disableCache=true&url=${rssLink}`;
    return axios.get(rssURL)
      .then((response) => response.data)
      .then((data) => {
        const parsedRSS = parseRSS(data.contents);
        const { posts } = handlePayload(rssLink, parsedRSS, id);
        // console.log('MARMU', posts);
        const newPosts = posts
          .filter((post) => {
            // const isPostNew = !allTitles.includes(post.title);
            console.log('FENYA', allTitles, allTitles.includes(post.title));
            return !allTitles.includes(post.title); // isPostNew;
          });
        // console.log('MARMU', newPosts);
        return newPosts;
      })
      .catch(() => null);
  });
  return Promise.all(promises)
    .then((arrayOfNewPosts) => arrayOfNewPosts.flat().filter((el) => el !== null))
    .then((newPosts) => {
      // console.log('BASYYYYYAAAAA', newPosts);
      state.posts = newPosts.concat(state.posts);
      // console.log('SPIRAL', state.posts);
      // state.form.processState = 'updated';
    });
    // new setTimeout???
};

const updateFeeds = (allFeeds, allPosts, state) => {
  setTimeout(() => updateFeedsHandler(allFeeds, allPosts, state), 10000);
  // setTimeout(() => console.log('URAAAAAA'), 10000);
};
/*
{
  feedID: feed.id,
  title: post.title,
  description: post.description,
  link: post.link,
  id: generateID(),
}
*/

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
    // currentFeed: null,
    form: {
      response: null,
      valid: null,
      validationError: '',
      processState: 'filling', // 'validation','submit', 'sending', 'networkError', 'loadSuccess'
    },
  };

  // const defaultLang = 'ru';

  const i18nextInstance = i18n.createInstance();
  await i18nextInstance.init({
    lng: 'ru', // defaultLang,
    debug: true,
    resources,
  });

  const watchedState = view(state, elements, i18nextInstance);

  elements.form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    watchedState.form.processState = 'submit';
    watchedState.form.validationError = ''; // bug

    const formData = getFormData(evt.target);

    validateURLField(formData.url, watchedState.rssLinks)
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.validationError = ''; // {};
        watchedState.form.processState = 'sending';
        const rssURL = `https://allorigins.hexlet.app/get?disableCache=true&url=${formData.url}`;
        return axios.get(rssURL);
      })
      .then((response) => response.data)
      .then((data) => {
        watchedState.form.processState = 'loadSuccess';

        const parsedRSS = parseRSS(data.contents);
        watchedState.rssLinks.push(formData.url);

        const { feed, posts } = handlePayload(formData.url, parsedRSS, uniqueId());
        console.log('GVENYAAAA', feed.rssLink, posts[0], posts[1], posts[2], posts[3], posts[4]);
        watchedState.feeds.unshift(feed);
        watchedState.posts = posts.concat(watchedState.posts);
        setTimeout(() => updateFeedsHandler(watchedState.feeds, watchedState.posts, watchedState), 10000);
      })
      .catch((e) => {
        console.log(e.message);
        // Error messages: parseError, {key: 'invalidUrl'}, {key: 'notUniqueValue'}, Network Error
        if (watchedState.form.processState === 'sending') {
          watchedState.form.processState = 'networkError';
        }
        if (watchedState.form.processState === 'submit') {
          watchedState.form.validationError = e.message.key;
          watchedState.form.processState = 'filling';
        }
        if (e.message === 'parserError') {
          watchedState.form.processState = 'parserError';
        }
        /*
        if (watchedState.form.processState === 'loadSuccess') {
          watchedState.form.processState = 'parserError';
        }
        */
      });
  });

  // updateFeeds(watchedState.feeds, watchedState.posts, watchedState);
};

export default app;
