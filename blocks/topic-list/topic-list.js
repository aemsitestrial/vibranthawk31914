export default function decorate(block) {
  block.classList.add('topic-list');

  const items = [...block.children];

  if (!items.length) return;

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const cells = [...item.children];

    if (cells.length < 2) return;

    const text = cells[0]?.textContent?.trim();

    const linkEl = cells[1]?.querySelector('a');

    const href = linkEl?.getAttribute('href');

    if (!text || !href) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'topic-list-item-wrapper';

    const link = document.createElement('a');
    link.className = 'topic-list-link';
    link.href = href;

    const label = document.createElement('span');
    label.className = 'topic-list-text';
    label.textContent = text;

    const arrow = document.createElement('span');
    arrow.className = 'topic-list-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    link.append(label, arrow);
    wrapper.append(link);

    fragment.append(wrapper);
  });

  if (fragment.childNodes.length) {
    block.replaceChildren(fragment);
  }
}
