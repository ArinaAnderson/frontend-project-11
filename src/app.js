import i18n from 'i18next';
import view from './view.js';
import resources from './locales/index.js';
import handleFormSubmit from './handleFormSubmit.js';
import startFeedsUpdate from './updateFeeds';

const app = async () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    urlField: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
  };

  const state = {
    rssLinks: [],
    feeds: [],
    posts: [],
    form: {
      response: null,
      valid: null,
      validationError: '',
      processState: 'filling',
    },
    uiState: {
      openedPostsIDs: new Set(),
    },
  };

  const defaultLang = 'ru';

  const i18nextInstance = i18n.createInstance();
  await i18nextInstance.init({
    lng: defaultLang,
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
