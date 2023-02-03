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

/*
<div class="card-body">
  <h2 class="card-title h4">Посты</h2>
</div>
<ul class="list-group border-0 rounded-0">
  <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
    <a href="https://ru.hexlet.io/courses/js-react/lessons/outro/theory_unit" class="fw-normal link-secondary" data-id="13" target="_blank" rel="noopener noreferrer">Заключение / JS: React</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="13" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
  </li>
</ul>
*/

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

    if (path === 'posts') {
      console.log('Spiral', value[3]);
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
