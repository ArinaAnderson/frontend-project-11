import onChange from 'on-change';
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

const renderPost = ({ title, link, id }) => {
  const liElem = document.createElement('li');
  liElem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const linkElem = document.createElement('a');
  linkElem.classList.add('fw-bold');// ('fw-normal', 'link-secondary');
  linkElem.textContent = title;
  linkElem.setAttribute('href', link);
  linkElem.setAttribute('target', '_blank');
  linkElem.setAttribute('data-id', id);
  linkElem.addEventListener('click', () => {
    linkElem.classList.remove('fw-bold');
    linkElem.classList.add('fw-normal', 'link-secondary');
  });
  // linkElem.setAttribute('rel', 'noopener', 'noreferrer');

  const btnElem = document.createElement('button');
  btnElem.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btnElem.textContent = 'Просмотр';
  btnElem.setAttribute('type', 'button');
  btnElem.setAttribute('data-id', id);
  btnElem.setAttribute('data-bs-toggle', 'modal');
  btnElem.setAttribute('data-bs-target', '#modal');

  liElem.replaceChildren(linkElem, btnElem);

  return liElem;
};

const renderItems = (items, container, cb) => {
  container.innerHTML = '';

  const ulElem = document.createElement('ul');
  ulElem.classList.add('list-group', 'border-0', 'rounded-0');
  const liElems = items.map((feed) => cb(feed));

  ulElem.replaceChildren(...liElems);

  container.appendChild(ulElem);
};

const view = (state, elements, i18next) => {
  const watchedState = onChange(state, (path, value) => {
    const {
      feedback,
      urlField,
      feedsContainer,
      postsContainer,
      submitBtn,
    } = elements;

    if (path === 'form.validationError') {
      // const { feedback, urlField } = elements;

      if (value.length === 0) {
        renderInput(urlField, true);
        renderFeedback(feedback, true);
      } else {
        renderInput(urlField, false);
        renderFeedback(feedback, false, i18next.t(value), 'error');
      }
    }

    if (path === 'form.processState') {
      if (value === 'submit') {
        // on change bug
        renderFeedback(feedback, true);
        submitBtn.disabled = true;
      }

      if (value === 'loadSuccess') {
        resetForm(elements.form, elements.urlField);
        renderFeedback(feedback, false, i18next.t(value), 'success');
        submitBtn.disabled = false;
      }

      if (value === 'networkError') {
        renderFeedback(feedback, false, i18next.t(value), 'error');
        submitBtn.disabled = false;
      }

      if (value === 'parserError') {
        renderFeedback(feedback, false, i18next.t(value), 'error');
        submitBtn.disabled = false;
      }

      if (value === 'filling') {
        submitBtn.disabled = false;
      }
    }

    if (path === 'feeds') {
      renderItems(value, feedsContainer, renderFeed);
    }

    if (path === 'posts') {
      renderItems(value, postsContainer, renderPost);
    }

    /*
    if (path === 'rssLinks') {
      console.log('FENYANYYYYYa', value);
    }
    */
    /*
    if (value === 'success' || value === 'error') {
      RESET of form + focus
    }
    */
  });

  return watchedState;
};

export default view;
