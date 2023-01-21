import onChange from 'on-change';
// import has from 'lodash/has.js';

const renderInput = (input, isValid) => {
  if (!isValid) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
};

/*
const renderFeedback = (feedback, isValid, errorText) => {
  if (isValid) {
    // feedback.parentNode.removeChild(feedback);
    feedback.classList.add('d-none');
    feedback.textContent = '';
    return;
  }

  feedbackBox.textContent = errorText;
  feedbackBox.classList.remove('d-none');
};
*/

const view = (state, elements, i18next) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.validationErrors') {
      const { feedback, urlField } = elements;

      if (value.length === 0) {
        renderInput(urlField, true);
        feedback.textContent = '';
        feedback.classList.add('d-none');
      } else {
        renderInput(urlField, false);
        feedback.textContent = i18next.t(value);
        feedback.classList.remove('d-none');
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
