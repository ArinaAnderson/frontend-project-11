import onChange from 'on-change';
import openModal from './handleModalOpening';
// import has from 'lodash/has.js';

const renderInput = (input, isValid) => {
  if (!isValid) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
};

const resetForm = (form, input) => {
  form.reset();
  input.focus();
};

const feedbackMapping = {
  success: (feedback) => {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  },
  error: (feedback) => {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  },
};

const renderFeedback = (feedbackElem, isHidden, text, state) => {
  if (isHidden) {
    // feedbackElem.textContent = '';
    feedbackElem.classList.add('d-none');
    return;
  }
  feedbackMapping[state](feedbackElem);
  feedbackElem.textContent = text;
  feedbackElem.classList.remove('d-none');
};

const renderFeed = ({ title, description }) => {
  const liElem = document.createElement('li');
  liElem.classList.add('list-group-item', 'border-0', 'border-end-0');

  const h3Elem = document.createElement('h3');
  h3Elem.classList.add('h6', 'm-0');
  h3Elem.textContent = title;

  const pElem = document.createElement('p');
  pElem.classList.add('m-0', 'small', 'text-black-50');
  pElem.textContent = description;

  liElem.replaceChildren(h3Elem, pElem);

  return liElem;
};
// state post type: 'opened' 'notOpened'
const stylizePostLink = (postID, linkElem, state) => {
  if (state.uiState.openedPostsIDs.has(postID)) {
    linkElem.classList.remove('fw-bold');
    linkElem.classList.add('fw-normal', 'link-secondary');
  } else {
    linkElem.classList.add('fw-bold');
  }
};

const renderPost = ({ title, link, id }, i18next, state) => {
  const liElem = document.createElement('li');
  liElem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const linkElem = document.createElement('a');
  // linkElem.classList.add('fw-bold');// ('fw-normal', 'link-secondary');
  stylizePostLink(id, linkElem, state);
  linkElem.textContent = title;
  linkElem.setAttribute('href', link);
  linkElem.setAttribute('target', '_blank');
  linkElem.setAttribute('data-id', id);
  linkElem.setAttribute('rel', 'noopener');
  linkElem.setAttribute('rel', 'noreferrer');
  linkElem.addEventListener('click', (evt) => {
    state.uiState.openedPostsIDs.add(id);
    stylizePostLink(id, evt.target, state);
  });
  // linkElem.setAttribute('rel', 'noopener', 'noreferrer');

  const btnElem = document.createElement('button');
  btnElem.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btnElem.textContent = i18next.t('viewPostButton');
  btnElem.setAttribute('type', 'button');
  btnElem.setAttribute('data-id', id);
  btnElem.setAttribute('data-bs-toggle', 'modal');
  btnElem.setAttribute('data-bs-target', '#modal');
  btnElem.addEventListener('click', (evt) => {
    openModal(evt, state);
    state.uiState.openedPostsIDs.add(id);
    stylizePostLink(id, linkElem, state);
  });

  liElem.replaceChildren(linkElem, btnElem);

  return liElem;
};

// mapping type - post feed --> different set of arguments

const renderItems = (items, container, cb, i18next, state) => {
  container.innerHTML = '';

  const ulElem = document.createElement('ul');
  ulElem.classList.add('list-group', 'border-0', 'rounded-0');
  const liElems = items.map((item) => cb(item, i18next, state));

  ulElem.replaceChildren(...liElems);

  container.appendChild(ulElem);
};

const handleFormProcessState = (processStateVal, elements, i18next) => {
  switch (processStateVal) {
    case 'submit':
      renderFeedback(elements.feedback, true);
      elements.submitBtn.disabled = true;
      break;

    case 'sending':
      elements.submitBtn.disabled = true;
      break;

    case 'loadSuccess':
      resetForm(elements.form, elements.urlField);
      renderFeedback(elements.feedback, false, i18next.t(`processState.${processStateVal}`), 'success');
      elements.submitBtn.disabled = false;
      break;

    case 'networkError':
      renderFeedback(elements.feedback, false, i18next.t(`processState.${processStateVal}`), 'error');
      elements.submitBtn.disabled = false;
      break;

    case 'parserError':
      renderFeedback(elements.feedback, false, i18next.t(`processState.${processStateVal}`), 'error');
      elements.submitBtn.disabled = false;
      break;

    case 'filling':
      elements.submitBtn.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processStateVal}`);
  }
};

const handleValidationError = (validationError, elements, i18next) => {
  if (validationError.length === 0) {
    renderInput(elements.urlField, true);
    renderFeedback(elements.feedback, true);
  } else {
    renderInput(elements.urlField, false);
    renderFeedback(elements.feedback, false, i18next.t(`validationMessage.${validationError}`), 'error');
  }
};

const view = (state, elements, i18next) => {
  const watchedState = onChange(state, (path, value) => {
    const {
      // feedback,
      // urlField,
      feedsContainer,
      postsContainer,
      // submitBtn,
    } = elements;

    if (path === 'form.validationError') {
      handleValidationError(value, elements, i18next);
    }

    if (path === 'form.processState') {
      handleFormProcessState(value, elements, i18next);
    }

    if (path === 'feeds') {
      renderItems(value, feedsContainer, renderFeed);
    }

    if (path === 'posts') {
      renderItems(value, postsContainer, renderPost, i18next, watchedState);
    }
  });

  return watchedState;
};

export default view;
