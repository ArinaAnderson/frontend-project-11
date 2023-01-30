import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import view from './view.js';
import resources from './locales/index.js';

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
    feeds: [],
    currentFeed: null,
    form: {
      response: null,
      valid: null,
      validationErrors: {},
      processState: 'filling', // 'validation','submit', 'sending', 'error', 'sent'
    },
  };

  // const defaultLang = 'ru';

  const i18nextInstance = i18n.createInstance();
  /*
  await i18nextInstance.init({
    lng: 'ru', // defaultLang,
    debug: true,
    // resources,
    resources: {
      ru: {
        translation: {
          invalidUrl: 'Вводимые данные не являются URL',
          notUniqueValue: 'URL уже существует',
        },
      },
    },
  });
  */

  await i18nextInstance.init({
    lng: 'ru', // defaultLang,
    debug: true,
    resources,
  });

  const watchedState = view(state, elements, i18nextInstance);

  elements.form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    watchedState.form.processState = 'submit';

    const formData = getFormData(evt.target);

    validateURLField(formData.url, watchedState.feeds)
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.validationErrors = ''; // {};
        watchedState.form.processState = 'sending';
        const rssURL = `https://allorigins.hexlet.app/get?disableCache=true&url=${formData.url}`;
        return axios.get(rssURL);
      })
      .then((response) => response.data)
      .then((data) => {
        watchedState.form.processState = 'success';
        // const { feed, posts } = parseRSS(data)
        // watchedState.currentFeed = formData.url;
        // watchedState.feeds.push(formData.url);
        const pr = new DOMParser();
        const res = pr.parseFromString(data.contents, 'text/xml');
        console.log(res);
      })
      .catch((e) => {
        if (watchedState.form.processState === 'sending') {
          console.log('HERE');
          watchedState.form.processState = 'error';
        } else {
          watchedState.form.valid = false;
          watchedState.form.validationErrors = e.message.key;
          watchedState.form.processState = 'filling';
        }
      });
  });
};

export default app;
