export default function decorate(block) {
  block.classList.add('text-section');

  const children = [...block.children];

  if (children[0]) {
    children[0].classList.add('text-section-left');
  }

  children.slice(1).forEach((child) => {
    child.classList.add('text-section-right-item');
  });
}
