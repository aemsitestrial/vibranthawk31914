export default function decorate(block) {
  block.classList.add('topic-list');

  [...block.children].forEach((child) => {
    child.classList.add('topic-list-item');
  });
}
