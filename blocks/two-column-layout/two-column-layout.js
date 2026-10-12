export default function decorate(block) {
  block.classList.add('two-column-layout');

  const left = document.createElement('div');
  left.className = 'two-column-layout-left';

  const right = document.createElement('div');
  right.className = 'two-column-layout-right';

  const children = [...block.children];

  children.forEach((child, index) => {
    if (index === 0) {
      left.appendChild(child);
    } else {
      right.appendChild(child);
    }
  });

  block.replaceChildren(left, right);
}
