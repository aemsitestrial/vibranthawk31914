import { decorateBlock, loadBlock } from '../../scripts/aem.js';

function normalizeTopicListCta(block) {
  const classes = [...block.classList].filter((className) => (
    className !== 'topic-list-cta' && className !== 'cta'
  ));

  block.className = ['cta', ...classes].join(' ');
  delete block.dataset.blockName;
  delete block.dataset.blockStatus;
}

export default async function decorate(block) {
  block.classList.add('topic-list-container');

  const nestedBlocks = block.querySelectorAll(':scope .cta, :scope .topic-list-cta');

  nestedBlocks.forEach((nestedBlock) => {
    normalizeTopicListCta(nestedBlock);
    nestedBlock.classList.add('topic-list-item');
    decorateBlock(nestedBlock);
  });

  await Promise.all(
    [...nestedBlocks].map((nestedBlock) => loadBlock(nestedBlock)),
  );
}
