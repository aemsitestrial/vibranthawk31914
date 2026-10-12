export default function decorate(block) {
  block.classList.add('text-section');

  [...block.children].forEach((partition) => {
    partition.classList.add('text-section-partition');
  });
}
