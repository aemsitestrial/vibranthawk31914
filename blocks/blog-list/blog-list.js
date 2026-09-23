import { createOptimizedPicture } from '../../scripts/aem.js';

// Placeholder posts used until real content is authored in the block.
const DUMMY_POSTS = [
  {
    path: '#',
    title: 'Getting Started with AEM Edge Delivery Services',
    image: 'https://placehold.co/440x360/e2e8f0/1e293b?text=Blog+Post+1',
  },
  {
    path: '#',
    title: 'Best Practices for Building Reusable Blocks',
    image: 'https://placehold.co/440x360/e2e8f0/1e293b?text=Blog+Post+2',
  },
  {
    path: '#',
    title: 'Optimizing Performance for Modern Web Experiences',
    image: 'https://placehold.co/440x360/e2e8f0/1e293b?text=Blog+Post+3',
  },
];

function renderPosts(container, posts) {
  posts.forEach((post) => {
    if (!post || (!post.path && !post.href)) {
      return;
    }

    const eager = false;
    const title = post.title || 'Article';
    const href = post.path || post.href;
    const image = post.image || post.thumbnail || '';
    const li = document.createElement('li');
    const picture = image
      ? createOptimizedPicture(image, title, eager, [{ width: '300' }])
      : null;
    const pictureTag = picture ? picture.outerHTML : '';

    li.innerHTML = `
      <a href="${href}">
        ${pictureTag}
        <h5>${title}</h5>
      </a>
    `;
    container.append(li);
  });
}

export default async function decorate(block) {
  const container = document.createElement('ul');

  const authoredLinks = [...block.querySelectorAll('a[href]')].map((link) => ({
    path: link.getAttribute('href'),
    title: link.textContent.trim() || 'Article',
    image: link.querySelector('img')?.getAttribute('src') || '',
  }));

  renderPosts(container, authoredLinks.length ? authoredLinks : DUMMY_POSTS);

  block.append(container);
}
