export default function decorate(block) {
  block.classList.add('two-column-layout');

  const sections = [...block.children];

  if (sections[0]) {
    sections[0].classList.add('two-column-layout-left');
  }

  if (sections[1]) {
    sections[1].classList.add('two-column-layout-right');
  }
}
