import { decorateBlock, loadBlock } from '../../scripts/aem.js';

function normalizeCtaItem(item) {
  const classes = [...item.classList].filter((className) => (
    className !== 'topic-list-cta' && className !== 'cta'
  ));

  item.className = ['cta', ...classes].join(' ');
  delete item.dataset.blockName;
  delete item.dataset.blockStatus;
}

export default async function decorate(block) {
  const nestedBlocks = block.querySelectorAll(
    ':scope > .cta, :scope > .topic-list-cta, :scope > [data-block-name="cta"], :scope > [data-block-name="topic-list-cta"]',
  );

  nestedBlocks.forEach((nestedBlock) => {
    normalizeCtaItem(nestedBlock);
    nestedBlock.classList.add('topic-list-item');
    decorateBlock(nestedBlock);
  });

  await Promise.all(
    [...nestedBlocks].map((nestedBlock) => loadBlock(nestedBlock)),
  );
}
