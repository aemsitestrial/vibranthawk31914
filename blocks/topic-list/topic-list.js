import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  block.classList.add('topic-list');

  const nestedBlocks = block.querySelectorAll('.cta');

  nestedBlocks.forEach((nestedBlock) => {
    decorateBlock(nestedBlock);
  });

  await Promise.all(
    [...nestedBlocks].map((nestedBlock) => loadBlock(nestedBlock)),
  );
}
