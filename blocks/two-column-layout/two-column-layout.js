import { loadCSS } from '../../scripts/aem.js';
import decorateCta from '../cta/cta.js';

export default function decorate(block) {
  block.classList.add('two-column-layout');

  let children = [...block.children];

  const variantRow = children.find(
    (child) => ['default', 'centered'].includes(
      child.textContent.trim().toLowerCase(),
    ),
  );

  if (variantRow) {
    const variant = variantRow.textContent.trim().toLowerCase();

    block.classList.add(`two-column-layout-${variant}`);

    variantRow.remove();

    children = [...block.children];
  }

  if (!children.length) {
    return;
  }

  const left = document.createElement('div');
  left.className = 'two-column-layout-left';

  const right = document.createElement('div');
  right.className = 'two-column-layout-right';

  children.forEach((child) => {
    const heading = child.querySelector('h1, h2, h3, h4, h5, h6');
    const titleType = child.children[1]?.textContent.trim().toLowerCase();
    const resourceType = child.getAttribute('data-aue-resource') || '';
    const model = child.getAttribute('data-aue-model') || '';
    const isTitle = heading || /^h[1-6]$/.test(titleType)
      || ['title', 'two-column-layout-title'].includes(model)
      || /\/title(?:\/|$)/.test(resourceType);

    if (isTitle) {
      const title = heading || document.createElement(/^h[1-6]$/.test(titleType) ? titleType : 'h2');

      if (!heading) {
        title.textContent = child.firstElementChild?.textContent.trim() || '';
      }

      child.classList.add('two-column-layout-title');
      child.replaceChildren(title);
      left.append(child);
      return;
    }

    const image = child.firstElementChild?.querySelector('img');
    const isImage = image && child.children.length <= 2
      && !child.firstElementChild.textContent.trim();

    if (isImage) {
      const imageContent = image.closest('picture') || image;
      const altText = child.children[1]?.textContent.trim();

      if (altText && !image.getAttribute('alt')) {
        image.alt = altText;
      }

      child.classList.add('two-column-layout-image');
      child.replaceChildren(imageContent);
      right.append(child);
      return;
    }

    right.append(child);
  });

  const ctaItems = [...right.children].filter(
    (item) => item.children.length > 1
      && !item.classList.contains('two-column-layout-image')
      && !item.querySelector('h1, h2, h3, h4, h5, h6'),
  );

  if (ctaItems.length) {
    loadCSS(`${window.hlx.codeBasePath}/blocks/cta/cta.css`);
  }

  ctaItems.forEach((cta) => {
    cta.classList.add('cta', 'block');
    cta.dataset.blockName = 'cta';
    decorateCta(cta);
  });

  block.replaceChildren(left, right);
}
