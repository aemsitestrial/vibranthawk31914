export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length < 2) {
    return;
  }

  const titleText = rows[0].querySelector('div')?.textContent?.trim() || '';

  const titleColumn = document.createElement('div');
  titleColumn.className = 'title-column';

  const heading = document.createElement('h2');
  heading.textContent = titleText;

  titleColumn.append(heading);

  const contentColumn = document.createElement('div');
  contentColumn.className = 'content-column';

  const contentRow = rows[1];

  [...contentRow.children].forEach((child) => {
    contentColumn.append(child);
  });

  block.replaceChildren(titleColumn, contentColumn);
  block.classList.add('title-with-column');
}
