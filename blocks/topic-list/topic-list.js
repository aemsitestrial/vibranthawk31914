import {
  decorateBlock,
  loadBlock,
} from '../../scripts/aem.js';

export default async function decorate(block) {
  block.classList.add('topic-list');

  [...block.children].forEach((child) => {
    child.classList.add('topic-list-item');
  });

  const ctas = block.querySelectorAll('.cta');

  console.log('CTAs found:', ctas.length);

  ctas.forEach((cta) => {
    decorateBlock(cta);
  });

  await Promise.all(
    [...ctas].map((cta) => loadBlock(cta)),
  );
}
