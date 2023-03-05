import axios from 'axios';
import buildURL from './buildURL.js';

const sendRequest = (rssLink) => {
  const rssURL = buildURL('https://allorigins.hexlet.app', '/get', {
    disableCache: true,
    url: rssLink,
  });
  return axios.get(rssURL)
    .then((response) => response.data);
};

export default sendRequest;
