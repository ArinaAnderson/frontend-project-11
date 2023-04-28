import * as yup from 'yup';
import i18n from 'i18next';
import view from './view.js';
import resources from './locales/index.js';
import handleFormSubmit from './handleFormSubmit.js';
import startFeedsUpdate from './updateFeeds';

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
      postID: null,
      // isPopupOpen: false,
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
      stateData.uiState.postID = id;
      stateData.uiState.isPopupOpen = true;
      stateData.uiState.openedLinksIDs.add(id);
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
