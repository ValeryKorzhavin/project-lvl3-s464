const tags = {
  channel: ['title', 'description'],
  item: ['title', 'description', 'link', 'guid'],
}

const getTextContent = (element) => tags[element.tagName].reduce((acc, tag) => {
    const content = element.querySelector(tag).textContent;
    return { ...acc, [tag]: content };
  }, {});

export default (rawData) => {
  const domParser = new DOMParser();      
  const xml = domParser.parseFromString(rawData.data, 'application/xml');
  const rss = xml.querySelector('channel');
  const channel = getTextContent(rss);
  const feeds = [...rss.querySelectorAll('item')].map(getTextContent);

  return { channel, feeds };
};
