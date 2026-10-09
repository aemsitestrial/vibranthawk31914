// blocks/title-with-column/title-with-column.js

import {
  decorateBlock,
  loadBlock,
} from '../../scripts/aem.js';

export default async function decorate(block) {
  const ctas = block.querySelectorAll('.cta');

  ctas.forEach((cta) => {
    decorateBlock(cta);
  });

  await Promise.all(
    [...ctas].map((cta) => loadBlock(cta)),
  );
}
