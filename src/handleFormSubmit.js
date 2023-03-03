import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';
import buildURL from './buildURL.js';

yup.setLocale({
  string: {
    url: () => ({ key: 'invalidUrl' }),
  },
  mixed: {
    required: () => ({ key: 'requiredUrl' }),
    notOneOf: () => ({ key: 'notUniqueValue' }),
  },
});

const validateURLField = (urlField, rssLinks) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(rssLinks);
  return schema.validate(urlField, { abortEarly: false });
};

const getFormData = (form) => Object.fromEntries(new FormData(form));

const handleFormSubmit = (evt, state) => {
  evt.preventDefault();
  state.form.processState = 'submit';
  state.form.validationError = '';

  const formData = getFormData(evt.target);

  validateURLField(formData.url, state.rssLinks)
    .then(() => {
      state.form.valid = true;
      state.form.validationError = '';
      state.form.processState = 'sending';

      const rssURL = buildURL('https://allorigins.hexlet.app', '/get', {
        disableCache: true,
        url: formData.url,
      });
      return axios.get(rssURL);
    })
    .then((response) => response.data)
    .then((data) => {
      state.form.processState = 'loadSuccess';

      const parsedRSS = parseRSS(data.contents);
      state.rssLinks.push(formData.url); // move below

      const currentFeedID = uniqueId();
      const { feed, posts } = handlePayload(formData.url, parsedRSS, currentFeedID, uniqueId);
      state.feeds.unshift(feed);
      state.posts = posts.concat(state.posts);
    })
    .catch((e) => {
      // Error messages:
      // parseError, {key: 'invalidUrl'}, {key: 'notUniqueValue'}, Network Error
      if (state.form.processState === 'sending') {
        state.form.processState = 'networkError';
      }
      if (state.form.processState === 'submit') {
        state.form.validationError = e.message.key;
        state.form.processState = 'filling';
      }
      if (state.form.processState === 'loadSuccess') {
        state.form.processState = 'parserError';
      }
    });
};

export default handleFormSubmit;
