import * as yup from 'yup';
import i18n from 'i18next';
// import axios from 'axios';
import view from './view.js';

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
    feeds: ['https://ru.hexlet.io/lessons.rss'],
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
  await i18nextInstance.init({
    lng: 'ru', // defaultLang,
    debug: true,
    // resources,
    resources: {
      ru: {
        translation: { // Так называемый namespace по умолчанию
          invalidUrl: 'Вводимые данные не являются URL',
          notUniqueValue: 'URL уже существует',
        },
      },
    },
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

        // return axios.get(formData.url);
      })
      /*
      .then(() => {
        watchedState.form.processState = 'success';
        watchedState.currentFeed = formData.url;
        watchedState.todos.push(formData.url);
      })
      */
      .catch((e) => {
        if (watchedState.form.processState === 'sending') {
          console.log('HERE');
          watchedState.form.processState = 'error';
        } else {
          watchedState.form.valid = false;
          watchedState.form.validationErrors = e.message.key;
          // { url: e }; // keyBy(e.inner, 'path');
          // console.log(watchedState.form.validationErrors.url);
          watchedState.form.processState = 'filling';
        }
      });
  });
};

export default app;
