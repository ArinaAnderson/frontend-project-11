const buildURL = (baseURLStr, pathname, searchParamsObj = {}) => {
  const resURL = new URL(pathname, baseURLStr);
  const entries = Object.entries(searchParamsObj);
  entries.forEach(([param, val]) => {
    resURL.searchParams.append(param, val);
  });
  return resURL;
};

export default buildURL;
