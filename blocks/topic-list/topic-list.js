import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  const nestedBlocks = block.querySelectorAll('.cta');

  nestedBlocks.forEach((nestedBlock) => {
    nestedBlock.classList.add('topic-list-item');
    decorateBlock(nestedBlock);
  });

  await Promise.all(
    [...nestedBlocks].map((nestedBlock) => loadBlock(nestedBlock)),
  );
}
