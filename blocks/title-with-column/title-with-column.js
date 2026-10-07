export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) {
    return;
  }

  const titleColumn = document.createElement('div');
  titleColumn.className = 'title-column';

  const heading = document.createElement('h2');
  heading.textContent = rows[0]?.textContent?.trim() || '';

  titleColumn.append(heading);

  const contentColumn = document.createElement('div');
  contentColumn.className = 'content-column';

  rows.slice(1).forEach((row) => {
    contentColumn.append(row);
  });

  block.replaceChildren(titleColumn, contentColumn);
}
