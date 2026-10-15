import {
  decorateBlock,
  loadBlock,
} from '../../scripts/aem.js';

export default async function decorate(block) {
  const layoutAttr = block.dataset.layout || '';

  if (layoutAttr) {
    block.classList.add(
      `columns-variant-${layoutAttr.toLowerCase().trim()}`,
    );
  }

  const rows = [...block.children];

  if (!rows.length) {
    return;
  }

  const columnCount = rows[0].children.length;

  block.classList.add(`columns-${columnCount}-cols`);

  rows.forEach((row) => {
    row.classList.add('columns-row');

    [...row.children].forEach((column) => {
      column.classList.add('columns-col');
      column.classList.add('columns-text-col');
    });
  });

  const nestedBlocks = block.querySelectorAll('.cta');

  nestedBlocks.forEach((nestedBlock) => {
    decorateBlock(nestedBlock);
  });

  await Promise.all(
    [...nestedBlocks].map((nestedBlock) => loadBlock(nestedBlock)),
  );
}
