export default function decorate(block) {
  const items = [...block.children];

  if (items.length < 2) {
    return;
  }

  const leftColumn = items[0];
  const rightColumn = items[1];

  leftColumn.classList.add('title-column');
  rightColumn.classList.add('content-column');

  block.replaceChildren(leftColumn, rightColumn);
}
