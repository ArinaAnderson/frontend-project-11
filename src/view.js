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

const view = (state, elements, i18next) => {
  const watchedState = onChange(state, (path, value) => {
    const { feedback, urlField } = elements;

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
      }

      // sending -> disable btn

      if (value === 'loadSuccess') {
        resetForm(elements.form, elements.urlField);
        renderFeedback(feedback, false, i18next.t(value), 'success');
      }

      if (value === 'networkError') {
        renderFeedback(feedback, false, i18next.t(value), 'error');
      }

      if (value === 'parserError') {
        renderFeedback(feedback, false, i18next.t(value), 'error');
      }
    }
    /*
    if (value === 'success' || value === 'error') {
      RESET of form + focus
    }
    */
  });

  return watchedState;
};

export default view;
