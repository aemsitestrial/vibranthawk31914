export default function decorate(block) {
  block.classList.add('cta-container');

  const children = [...block.children];

  children.forEach((child, index) => {
    child.classList.add('cta-container-item');
    child.classList.add(`cta-container-item-${index + 1}`);
  });
}
