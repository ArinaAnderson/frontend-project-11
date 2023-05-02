import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import i18n from 'i18next';
import view from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';

const buildURL = (baseURLStr, pathname, searchParamsObj = {}) => {
  const resURL = new URL(pathname, baseURLStr);
  const entries = Object.entries(searchParamsObj);
  entries.forEach(([param, val]) => {
    resURL.searchParams.append(param, val);
  });
  return resURL;
};

const sendRequest = (rssLink) => {
  const rssURL = buildURL('https://allorigins.hexlet.app', '/get', {
    disableCache: true,
    url: rssLink,
  });
  return axios.get(rssURL)
    .then((response) => response.data);
};

const handlePayload = (rssLink, parsedRSS, feedID, getPostID) => {
  const { feed: feedData, posts: postsData } = parsedRSS;

  const feed = {
    id: feedID,
    title: feedData.title.trim(),
    description: feedData.description.trim(),
    rssLink,
  };

  const posts = postsData.map((post) => ({
    feedID: feed.id,
    id: getPostID(),
    title: post.title,
    description: post.description,
    link: post.link,
  }));

  return { feed, posts };
};

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

const errorMessagesMapping = {
  invalidUrl: (state) => {
    state.form.validationError = 'invalidUrl';
  },
  requiredUrl: (state) => {
    state.form.validationError = 'requiredUrl';
  },
  notUniqueValue: (state) => {
    state.form.validationError = 'notUniqueValue';
  },
  'Network Error': (state) => {
    state.form.processState = 'networkError';
  },
  parseError: (state) => {
    state.form.processState = 'parserError';
  },
};

const handleFormSubmit = (evt, state, validateURLField) => {
  evt.preventDefault();
  state.form.processState = 'submit';
  state.form.validationError = null;

  const urlData = new FormData(evt.target).get('url');

  const rssLinks = state.feeds.map(({ rssLink }) => rssLink);

  validateURLField(urlData, rssLinks)
    .then(() => {
      state.form.valid = true;
      state.form.validationError = null;
      state.form.processState = 'sending';
      return sendRequest(urlData);
    })
    .then((data) => {
      const parsedRSS = parseRSS(data.contents);

      const currentFeedID = uniqueId();
      const { feed, posts } = handlePayload(urlData, parsedRSS, currentFeedID, uniqueId);
      state.feeds.unshift(feed);
      state.posts = posts.concat(state.posts);
      state.form.processState = 'loadSuccess';
    })
    .catch((e) => {
      errorMessagesMapping[e.message](state);
    });
};

const app = () => {
  yup.setLocale({
    string: {
      url: 'invalidUrl',
    },
    mixed: {
      required: 'requiredUrl',
      notOneOf: 'notUniqueValue',
    },
  });

  const validationSchema = yup
    .string()
    .trim()
    .required()
    .url();

  const validateURLField = (urlField, rssLinks) => validationSchema
    .notOneOf(rssLinks)
    .validate(urlField, { abortEarly: false });

  const elements = {
    form: document.querySelector('.rss-form'),
    urlField: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
  };

  const state = {
    feeds: [],
    posts: [],
    form: {
      response: null,
      validationError: null,
      processState: 'filling',
    },
    uiState: {
      postLink: {
        postID: null,
      },
      modal: {
        postID: null,
      },
      openedLinksIDs: new Set(),
    },
  };

  const defaultLang = 'ru';

  const postElementsHandlers = {
    button: (id, stateData, evt) => {
      evt.preventDefault();
      stateData.uiState.modal.postID = id;
      stateData.uiState.openedLinksIDs.add(id);
    },
    a: (id, stateData) => {
      stateData.uiState.postLink.postID = id;
      stateData.uiState.openedLinksIDs.add(id);
    },
  };

  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: defaultLang,
    debug: true,
    resources,
  }).then(() => {
    const watchedState = view(state, elements, i18nextInstance);

    elements.form.addEventListener('submit', (evt) => {
      handleFormSubmit(evt, watchedState, validateURLField);
    });

    elements.postsContainer.addEventListener('click', (evt) => {
      const evtTargetHandler = evt.target.tagName.toLowerCase();
      const evtTargetID = evt.target.dataset.id;
      postElementsHandlers[evtTargetHandler](evtTargetID, watchedState, evt);
    });

    startFeedsUpdate(watchedState);
  });
};

export default app;
