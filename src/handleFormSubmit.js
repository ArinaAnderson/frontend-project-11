import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';
import sendRequest from './utils/sendRequest.js';

const validateURLField = (urlField, rssLinks) => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'invalidUrl' }),
    },
    mixed: {
      required: () => ({ key: 'requiredUrl' }),
      notOneOf: () => ({ key: 'notUniqueValue' }),
    },
  });

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

  const rssLinks = state.feeds.map(({ rssLink }) => rssLink);

  validateURLField(formData.url, rssLinks)
    .then(() => {
      state.form.valid = true;
      state.form.validationError = '';
      state.form.processState = 'sending';
      return sendRequest(formData.url);
    })
    .then((data) => {
      state.form.processState = 'loadSuccess';

      const parsedRSS = parseRSS(data.contents);

      const currentFeedID = uniqueId();
      const { feed, posts } = handlePayload(formData.url, parsedRSS, currentFeedID, uniqueId);
      console.log('SPIRAL', posts);
      state.feeds.unshift(feed);
      state.posts = posts.concat(state.posts);
    })
    .catch((e) => {
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
