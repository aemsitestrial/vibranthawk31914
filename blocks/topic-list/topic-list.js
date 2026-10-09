export default function decorate(block) {
  const rows = [...block.children];

  block.textContent = '';

  rows.forEach((row) => {
    const cells = [...row.children];

    const text = cells[0]?.textContent.trim();
    const href = cells[1]?.querySelector('a')?.getAttribute('href');

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
    arrow.textContent = '→';

    link.append(label, arrow);
    wrapper.append(link);

    block.append(wrapper);
  });
}
