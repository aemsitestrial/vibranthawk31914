export default function decorate(block) {
  block.classList.add('two-column-layout');

  const items = [...block.children];

  if (!items.length) return;

  items[0].classList.add('two-column-layout-left');

  items.slice(1).forEach((item) => {
    item.classList.add('two-column-layout-right');
  });
}
