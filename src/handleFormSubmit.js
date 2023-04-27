import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';
import sendRequest from './utils/sendRequest.js';

/*
const validateURLField = (urlField, rssLinks) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(rssLinks);
  return validationSchema.notOneOf(rssLinks).validate(urlField, { abortEarly: false });
};
*/
/*
const validationSchema = yup
  .string()
  .trim()
  .required()
  .url();
*/

const validateURLField = (urlField, rssLinks, validationSchema) => validationSchema
  .notOneOf(rssLinks)
  .validate(urlField, { abortEarly: false });

const errorMessagesMapping = {
  invalidUrl: (state) => {
    state.form.validationError = 'invalidUrl';
  },
  requiredUrl: (state) => {
    state.form.validationError = 'requiredUrl';
  },
  notUniqueValue: (state) => {
    state.form.validationError = 'notUniqueValue';
  },
  'Network Error': (state) => {
    state.form.processState = 'networkError';
  },
  parseError: (state) => {
    state.form.processState = 'parserError';
  },
};

const handleFormSubmit = (evt, state, validationSchema) => {
  evt.preventDefault();
  state.form.processState = 'submit';
  state.form.validationError = null;

  const urlData = new FormData(evt.target).get('url');

  const rssLinks = state.feeds.map(({ rssLink }) => rssLink);

  validateURLField(urlData, rssLinks, validationSchema)
    .then(() => {
      state.form.valid = true;
      state.form.validationError = null;
      state.form.processState = 'sending';
      return sendRequest(urlData);
    })
    .then((data) => {
      const parsedRSS = parseRSS(data.contents);

      const currentFeedID = uniqueId();
      const { feed, posts } = handlePayload(urlData, parsedRSS, currentFeedID, uniqueId);
      state.feeds.unshift(feed);
      state.posts = posts.concat(state.posts);
      state.form.processState = 'loadSuccess';
    })
    /*
    .then(() => {
      state.form.processState = 'loadSuccess';
    })
    */
    .catch((e) => {
      console.log(e.message);
      errorMessagesMapping[e.message](state);
    });
};

export default handleFormSubmit;
