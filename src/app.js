import * as yup from 'yup';
// import axios from 'axios';
import keyBy from 'lodash/keyBy.js';
import view from './view.js';

const validateForm = (formData, feeds) => { // feeds) => {
  const schema = yup.object().shape({
    url: yup
      .string()
      .trim()
      .required()
      .url('The input must be a valid URL')
      .notOneOf(feeds, 'The link must not be one of the existing feeds'),
  });
  return schema.validate(formData, { abortEarly: false });
};

// const sendForm = (url) => axios.get(url);

const getFormData = (form) => Object.fromEntries(new FormData(form));

const app = () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    fields: {
      url: document.querySelector('#url-input'),
    },
    feedback: {
      url: document.querySelector('.feedback'),
    },
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

  const watchedState = view(state, elements);

  elements.form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    watchedState.form.processState = 'submit';

    const formData = getFormData(evt.target);
    validateForm(formData, watchedState.feeds)
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.validationErrors = {};
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
          watchedState.form.validationErrors = keyBy(e.inner, 'path');
          console.log(watchedState.form.validationErrors.url);
          watchedState.form.processState = 'filling';
        }
      });
  });
};

export default app;
