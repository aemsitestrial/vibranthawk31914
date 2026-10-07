export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length < 2) {
    return;
  }

  const titleColumn = document.createElement('div');
  titleColumn.className = 'title-column';

  const heading = document.createElement('h2');
  heading.textContent = rows[0]?.textContent?.trim() || '';

  titleColumn.append(heading);

  const contentColumn = document.createElement('div');
  contentColumn.className = 'content-column';

  [...rows[1].children].forEach((child) => {
    contentColumn.append(child);
  });

  block.replaceChildren(titleColumn, contentColumn);
}
