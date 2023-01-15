import onChange from 'on-change';
import has from 'lodash/has.js';

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

const view = (state, elements) => {
  const watchedState = onChange(state, (path, value, prevValue) => {
    if (path === 'form.validationErrors') {
      Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
        // const error = value[fieldName];
        const feedback = elements.feedback[fieldName];
        const fieldHadError = has(prevValue, fieldName);
        const fieldHasError = has(value, fieldName);

        if (!fieldHadError && !fieldHasError) {
          return;
        }

        if (fieldHadError && !fieldHasError) {
          renderInput(fieldElement, true);
          feedback.textContent = '';
          feedback.classList.add('d-none');
          // renderFeedback(elements.feedback, true);
          return;
        }

        if (!fieldHadError && fieldHasError) {
          renderInput(fieldElement, false);
          feedback.textContent = value[fieldName].message;
          feedback.classList.remove('d-none');
          // renderFeedback(elements.feedback, false, value[fieldName].message);
        }

        if (fieldHadError && fieldHasError) {
          // renderInput(fieldElement, false);
          feedback.textContent = value[fieldName].message;
          // feedback.classList.remove('d-none');
          // renderFeedback(elements.feedback, false, value[fieldName].message);
        }
      });
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
