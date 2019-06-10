import '@babel/polyfill';
import axios from 'axios';
import isURL from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import parseFeed from './parser';
import { renderChannel, renderItem, renderModal } from './renderer';

export default () => {
  const feedInput = document.querySelector('input[name="feed_input"]');
  const feedSubmit = document.querySelector('button[name="feed_submit"]');
  const feedForm = document.querySelector('form[name="feed_form"]');
  const itemsWrapper = document.querySelector('#items');
  const channelsWrapper = document.querySelector('#channels');
  const corsProxy = 'https://cors-anywhere.herokuapp.com/';

  const storage = {
    items: [],
    channels: [],
    urls: [],
    inputValue: '',
    inputState: '',
    modal: {
      title: '',
      body: '',
    },
  };

  const inputStateHandlers = {
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
      storage.inputState = 'init';
      return;
    }
    if (!isURL(storage.inputValue)) {
      storage.inputState = 'invalid';
      return;
    }
    if (storage.urls.includes(storage.inputValue)) {
      storage.inputState = 'invalid';
      return;
    }
    storage.inputState = 'valid';
  });

  feedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = `${corsProxy}${storage.inputValue}`;
    storage.inputState = 'loading';
    axios
      .get(url)
      .then((data) => {
        const { channel, items } = parseFeed(data);
        storage.channels.push(channel);
        storage.urls.push(storage.inputValue);
        items.forEach(storage.items.push);
        storage.inputState = 'success';
      })
      .catch(() => {
        storage.inputState = 'error';
      });
  });

  const updateFeed = url => axios
    .get(`${corsProxy}${url}`)
    .then((data) => {
      const { items } = parseFeed(data);
      items.forEach((item) => {
        if (!storage.items.find(({ guid }) => guid === item.guid)) {
          storage.items.push(item);
        }
      });
    })
    .catch(console.error)
    .finally(setTimeout(updateFeed, 5000, url));

  watch(storage, 'inputState', () => inputStateHandlers[storage.inputState]());
  watch(storage, 'modal', () => renderModal(storage.modal));
  watch(storage, 'urls', (prop, action, newValue) => setTimeout(updateFeed, 5000, newValue));

  watch(storage, 'channels', (prop, action, newValue) => (
    channelsWrapper.append(renderChannel(newValue))));

  watch(storage, 'items', (prop, action, newValue) => {
    const item = renderItem(newValue);
    itemsWrapper.prepend(item);
    const itemButton = item.querySelector('button');
    itemButton.addEventListener('click', () => {
      const { title, description } = newValue;
      storage.modal.title = title;
      storage.modal.body = description;
    });
  });

  storage.inputState = 'init';
};
