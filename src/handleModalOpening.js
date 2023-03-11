const openModal = (evt, state) => {
  evt.preventDefault();
  const btn = evt.target;
  const postID = btn.dataset.id;
  const { title, description, link } = state.posts.find((post) => post.id === postID);
  const modal = document.querySelector('#modal');
  const modalTitle = modal.querySelector('.modal-title');
  modalTitle.textContent = title;
  const modalBody = modal.querySelector('.modal-body');
  modalBody.textContent = description;
  const modalLink = modal.querySelector('.full-article');
  modalLink.href = link;
};

export default openModal;
