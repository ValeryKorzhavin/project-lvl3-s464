import '@babel/polyfill';
import axios from 'axios';
import isURL from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import parseFeed from './parser';
import { renderChannel, renderFeed, renderModal } from './renderer';

export default () => {
  const feedInput = document.querySelector('input[name="feed_input"]');
  const feedSubmit = document.querySelector('button[name="feed_submit"]');
  const feedForm = document.querySelector('form[name="feed_form"]');
  const feedsWrapper = document.querySelector('#feeds');
  const feedSources = document.querySelector('#feed_sources');
  const corsProxy = 'https://cors-anywhere.herokuapp.com/';

  const storage = {
    feeds: [],
    channels: [],
    urls: [],
    inputValue: '',
    state: '',
    modal: {
      title: '',
      body: '',
    },
  };

  const actions = {
    init: () => {
      feedSubmit.disabled = true;
      feedSubmit.textContent = 'Add feed';
      feedInput.classList.remove('is-invalid');
      feedInput.classList.remove('is-valid');
    },
    invalid: () => {
      feedSubmit.disabled = true;
      feedInput.classList.remove('is-valid');
      feedInput.classList.add('is-invalid');
    },
    valid: () => {
      feedSubmit.disabled = false;
      feedInput.classList.remove('is-invalid');
      feedInput.classList.add('is-valid');
    },
    success: () => {
      feedSubmit.disabled = true;
      feedSubmit.textContent = 'Add feed';
      feedForm.reset();
      feedInput.classList.remove('is-valid');
      feedInput.disabled = false;
    },
    error: () => {
      feedSubmit.disabled = true;
      feedSubmit.textContent = 'Add feed';
      feedInput.classList.add('is-invalid');
      feedInput.disabled = false;
    },
    loading: () => {
      const spinner = document.createElement('span');
      spinner.classList.add('spinner-grow', 'spinner-grow-sm', 'mr-2');
      spinner.setAttribute('role', 'status');
      spinner.setAttribute('aria-hidden', true);
      feedSubmit.textContent = 'Loading...';
      feedSubmit.prepend(spinner);
      feedSubmit.disabled = true;
      feedInput.disabled = true;
    },
  };

  feedInput.addEventListener('input', (e) => {
    storage.inputValue = e.target.value;

    if (storage.inputValue === '') {
      storage.state = 'init';
      return;
    }
    if (!isURL(storage.inputValue)) {
      storage.state = 'invalid';
      return;
    }
    if (storage.urls.includes(storage.inputValue)) {
      storage.state = 'invalid';
      return;
    }
    storage.state = 'valid';
  });

  feedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = `${corsProxy}${storage.inputValue}`;
    storage.state = 'loading';
    axios
      .get(url)
      .then((data) => {
        const { channel, feeds } = parseFeed(data);
        storage.channels.push(channel);
        storage.urls.push(storage.inputValue);
        feeds.forEach(storage.feeds.push);
        storage.state = 'success';
      })
      .catch(() => {
        storage.state = 'error';
      });
  });

  feedsWrapper.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const { title, description } = storage.feeds
        .find(({ guid }) => guid === e.target.dataset.guid);
      storage.modal.title = title;
      storage.modal.body = description;
    }
  });

  const updateFeed = url => axios
    .get(`${corsProxy}${url}`)
    .then((data) => {
      const { feeds } = parseFeed(data);
      feeds.forEach((feed) => {
        if (!storage.feeds.find(({ guid }) => guid === feed.guid)) {
          storage.feeds.push(feed);
        }
      });
    })
    .catch(console.error)
    .finally(setTimeout(updateFeed, 5000, url));

  watch(storage, 'state', () => actions[storage.state]());
  watch(storage, 'modal', () => renderModal(storage.modal));
  watch(storage, 'urls', (prop, action, newValue) => setTimeout(updateFeed, 5000, newValue));

  watch(storage, 'channels', (prop, action, newValue) => (
    feedSources.append(renderChannel(newValue))));

  watch(storage, 'feeds', (prop, action, newValue) => (
    feedsWrapper.prepend(renderFeed(newValue))));

  storage.state = 'init';
};
