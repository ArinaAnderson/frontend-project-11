const parseRSS = (rssContents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssContents, 'text/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    throw new Error('parseError');
  }

  const feed = {};
  feed.title = doc.querySelector('title').textContent;
  feed.description = doc.querySelector('description').textContent;

  const posts = [];
  const items = doc.querySelectorAll('item');
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    posts.push({
      title,
      description,
      link,
    });
  });
  return { feed, posts };
};

export default parseRSS;
