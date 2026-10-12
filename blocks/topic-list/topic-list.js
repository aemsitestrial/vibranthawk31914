import {
  decorateBlock,
  loadBlock,
} from '../../scripts/aem.js';

export default async function decorate(block) {
  block.classList.add('topic-list');

  const rows = [...block.children];

  if (!rows.length) {
    return;
  }

  const title = rows[0].textContent.trim();
  const left = document.createElement('div');

  left.className = 'topic-list-left';

  const heading = document.createElement('h2');

  heading.textContent = title;
  left.append(heading);

  const right = document.createElement('div');

  right.className = 'topic-list-right';
  const nestedCtas = [];

  rows.slice(1).forEach((row) => {
    const cta = row.querySelector('.cta');

    if (cta) {
      right.append(cta);
      nestedCtas.push(cta);
      return;
    }

    const link = row.querySelector('a');

    if (link) {
      const item = document.createElement('div');

      item.className = 'topic-list-item';
      link.classList.add('topic-list-item-link');

      const itemTitle = document.createElement('span');

      itemTitle.className = 'topic-list-item-title';

      while (link.firstChild) {
        itemTitle.append(link.firstChild);
      }

      link.append(itemTitle);

      const arrow = document.createElement('span');

      arrow.className = 'topic-list-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      link.append(arrow);

      item.append(link);
      right.append(item);
    } else {
      const text = row.textContent.trim();

      if (text) {
        const textElement = document.createElement('div');

        textElement.className = 'topic-list-text';
        textElement.textContent = text;
        right.append(textElement);
      }
    }
  });

  block.replaceChildren(left, right);

  nestedCtas.forEach((cta) => {
    decorateBlock(cta);
  });

  await Promise.all(nestedCtas.map((cta) => loadBlock(cta)));
}
