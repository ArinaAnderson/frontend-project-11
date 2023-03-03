/*
const y = new URL('https://allorigins.hexlet.app/get?disableCache=true&url=https://ru.hexlet.io/lessons.rss');
undefined
y.pathname
'/get'
y.hostname
'allorigins.hexlet.app'
y.searchParams.get('url')
'https://ru.hexlet.io/lessons.rss'
y.searchParams.get('disableCache')
'true'
*/

const buildURL = (baseURLStr, pathname, searchParamsObj = {}) => {
  const resURL = new URL(pathname, baseURLStr);
  const entries = Object.entries(searchParamsObj);
  entries.forEach(([param, val]) => {
    resURL.searchParams.append(param, val);
    console.log(param, val);
  });
  return resURL;
};

export default buildURL;
