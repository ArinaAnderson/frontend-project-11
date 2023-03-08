const openModal = (evt, state) => {
  evt.preventDefault();
  const btn = evt.target;
  const postID = btn.dataset.id;
  const { title, description } = state.posts.find((post) => post.id === postID);
  const modal = document.querySelector('#modal');
  const modalTitle = modal.querySelector('.modal-title');
  modalTitle.textContent = title;
  const modalBody = modal.querySelector('.modal-body');
  modalBody.textContent = description;
};

export default openModal;
