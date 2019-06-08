const renderChannel = (channel) => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('shadow', 'p-3', 'mb-3', 'bg-white', 'rounded');
  const title = document.createElement('p');
  const description = document.createElement('p');
  title.textContent = channel.title;
  description.textContent = channel.description;
  wrapper.append(title);
  wrapper.append(description);
  return wrapper;
};

const renderFeed = (item) => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('mb-2');
  const link = document.createElement('a');
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary', 'ml-2', 'btn-sm');
  button.textContent = 'read more...';
  button.setAttribute('data-guid', item.guid);
  button.setAttribute('data-toggle', 'modal');
  button.setAttribute('data-target', '#descriptionModal');
  button.setAttribute('type', 'button');
  link.setAttribute('href', item.link);
  link.setAttribute('target', '_blank');
  link.textContent = item.title;
  wrapper.append(link);
  wrapper.append(button);
  return wrapper;
};

const renderModal = ({ title, body }) => {
  const modal = document.querySelector('#descriptionModal');
  modal.querySelector('.modal-title').innerHTML = title;
  modal.querySelector('.modal-body').innerHTML = body;
};

export {
  renderFeed,
  renderChannel,
  renderModal,
};
