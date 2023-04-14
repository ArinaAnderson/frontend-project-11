import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import parseRSS from './parser.js';
import handlePayload from './handlePayload.js';
import sendRequest from './utils/sendRequest.js';

const validateURLField = (urlField, rssLinks) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(rssLinks);
  return schema.validate(urlField, { abortEarly: false });
};

// const getFormData = (form) => Object.fromEntries(new FormData(form));

const handleFormSubmit = (evt, state) => {
  evt.preventDefault();
  state.form.processState = 'submit';
  state.form.validationError = null;

  // const formData = new FormData(evt.target); // getFormData(evt.target);
  const urlData = new FormData(evt.target).get('url');

  const rssLinks = state.feeds.map(({ rssLink }) => rssLink);

  validateURLField(urlData, rssLinks)// formData.url, rssLinks)
    .then(() => {
      state.form.valid = true;
      state.form.validationError = null;
      state.form.processState = 'sending';
      return sendRequest(urlData);
    })
    .then((data) => {
      // state.form.processState = 'loadSuccess';

      const parsedRSS = parseRSS(data.contents);

      const currentFeedID = uniqueId();
      const { feed, posts } = handlePayload(urlData, parsedRSS, currentFeedID, uniqueId);
      state.feeds.unshift(feed);
      state.posts = posts.concat(state.posts);
    })
    .then(() => {
      state.form.processState = 'loadSuccess'; // 'filling';
    })
    .catch((e) => {
      console.log('BASYAYAYA!!!', JSON.stringify(e.message));// JSON.stringify(e, null, '  '));
      // Error messages:
      // parseError, {key: 'invalidUrl'}, {key: 'notUniqueValue'}, Network Error

      // {key: 'invalidUrl'} /// parseError /// {key: 'notUniqueValue'}
      if (e.message === 'Network Error') {
        state.form.processState = 'networkError';
      }
      /*
      if (state.form.processState === 'sending') {
        state.form.processState = 'networkError';
      }
      */
      if (e.message === 'parseError') {
        state.form.processState = 'parserError';
      }
      /*
      if (state.form.processState === 'loadSuccess') {
        state.form.processState = 'parserError';
      }
      */
      if (state.form.processState === 'submit') {
        state.form.validationError = e.message.key;
        // state.form.processState = 'filling';
      }
      /*
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
      */
    });
};
/*
{
  "value": "njhjkhkj",
  "errors": [
    {
      "key": "invalidUrl"
    }
  ],
  "inner": [
    {
      "value": "njhjkhkj",
      "path": "",
      "type": "url",
      "errors": [
        {
          "key": "invalidUrl"
        }
      ],
      "params": {
        "value": "njhjkhkj",
        "originalValue": "njhjkhkj",
        "path": "",
        "regex": {}
      },
      "inner": [],
      "name": "ValidationError",
      "message": {
        "key": "invalidUrl"
      }
    }
  ],
  "name": "ValidationError",
  "message": {
    "key": "invalidUrl"
  }
}

switch (err.message) {
        case ('notValidDouble'):
          watchedState.messageError = 'notValidDouble';
          break;
        case ('notValidUrl'):
          watchedState.messageError = 'notValidUrl';
          break;
        case ('Parser Error'):
          watchedState.messageError = 'notValidRss';
          break;
        case ('Network Error'):
          watchedState.messageError = 'networkError';
*/

export default handleFormSubmit;
