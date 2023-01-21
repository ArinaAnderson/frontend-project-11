import * as yup from 'yup';
// import axios from 'axios';
// import keyBy from 'lodash/keyBy.js';
import view from './view.js';

const validateURLField = (urlField, feeds) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url('The input must be a valid URL')
    .notOneOf(feeds, 'The link must not be one of the existing feeds');
  return schema.validate(urlField, { abortEarly: false });
}; // {
/*
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
*/

// const sendForm = (url) => axios.get(url);

const getFormData = (form) => Object.fromEntries(new FormData(form));

const app = () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    // fields: {
    // url: document.querySelector('#url-input'),
    // },
    urlField: document.querySelector('#url-input'),
    /*
    feedback: {
      url: document.querySelector('.feedback'),
    },
    */
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

  const watchedState = view(state, elements);

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
          watchedState.form.validationErrors = e.message; // { url: e }; // keyBy(e.inner, 'path');
          // console.log(watchedState.form.validationErrors.url);
          watchedState.form.processState = 'filling';
        }
      });
  });
};

export default app;
