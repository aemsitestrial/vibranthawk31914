export default function decorate(block) {
  block.classList.add('topic-list');

  const rows = [...block.children];

  if (!rows.length) {
    return;
  }

  const title = rows[0].textContent.trim();

  let rightContent = '';

  rows.slice(1).forEach((row) => {
    const link = row.querySelector('a');

    if (link) {
      rightContent += `
        <div class="topic-list-item">
          ${link.href}
            <span class="topic-list-item-title">
              ${link.textContent.trim()}
            </span>
            <span class="topic-list-arrow">→</span>
          </a>
        </div>
      `;
    } else {
      const text = row.textContent.trim();

      if (text) {
        rightContent += `
          <div class="topic-list-text">
            ${text}
          </div>
        `;
      }
    }
  });

  block.innerHTML = `
    <div class="topic-list-left">
      <h2>${title}</h2>
    </div>

    <div class="topic-list-right">
      ${rightContent}
    </div>
  `;
}
