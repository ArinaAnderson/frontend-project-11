import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import view from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';

yup.setLocale({
  string: {
    url: () => ({ key: 'invalidUrl' }),
  },
  mixed: {
    notOneOf: () => ({ key: 'notUniqueValue' }),
  },
});

const validateURLField = (urlField, feeds) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url() // ('The input must be a valid URL')
    .notOneOf(feeds); // (feeds, 'The link must not be one of the existing feeds');
  return schema.validate(urlField, { abortEarly: false });
};

// const sendForm = (url) => axios.get(url);

const getFormData = (form) => Object.fromEntries(new FormData(form));

const app = async () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    urlField: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type="submit"]'),
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
        const { feed, posts } = parseRSS(data.contents);
        watchedState.rssLinks.push(formData.url);
        console.log('BASYA', feed.description, posts[0].title);
      })
      .catch((e) => {
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
};

export default app;
