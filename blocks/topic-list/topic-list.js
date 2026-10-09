import {
  decorateBlock,
  loadBlock,
} from '../../scripts/aem.js';

function normalizeCtaBlock(nestedBlock) {
  if (nestedBlock.dataset.blockName === 'cta') return;

  const classes = [...nestedBlock.classList].filter((className) => (
    className !== 'topic-list-cta' && className !== 'cta'
  ));

  nestedBlock.className = ['cta', ...classes].join(' ');
  delete nestedBlock.dataset.blockName;
  delete nestedBlock.dataset.blockStatus;
}

export default async function decorate(block) {
  block.classList.add('topic-list');

  const nestedBlocks = block.querySelectorAll(
    '[data-block-name="cta"], [data-block-name="topic-list-cta"], .cta, .topic-list-cta',
  );

  nestedBlocks.forEach((nestedBlock) => {
    normalizeCtaBlock(nestedBlock);
    nestedBlock.classList.add('topic-list-item');
    decorateBlock(nestedBlock);
  });

  await Promise.all(
    [...nestedBlocks].map((nestedBlock) => loadBlock(nestedBlock)),
  );
}
