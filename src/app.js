import i18n from 'i18next';
import view from './view.js';
import resources from './locales/index.js';
import handleFormSubmit from './handleFormSubmit.js';
import startFeedsUpdate from './updateFeeds';

const app = () => {
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
      postID: null,
      isPopupOpen: false,
      openedLinksIDs: new Set(),
    },
  };

  const defaultLang = 'ru';

  const postElementsHandlers = {
    button: (id, stateData, evt) => {
      evt.preventDefault();
      stateData.uiState.postID = id;
      stateData.uiState.isPopupOpen = true;
      stateData.uiState.openedLinksIDs.add(id);
      stateData.uiState.isPopupOpen = false;
    },
    a: (id, stateData) => {
      stateData.uiState.postID = id;
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
      handleFormSubmit(evt, watchedState);
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
