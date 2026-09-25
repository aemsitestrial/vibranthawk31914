import { createOptimizedPicture } from '../../scripts/aem.js';

function getField(block, name, fallback = '') {
  const prop = block.querySelector(`[data-aue-prop="${name}"]`);
  if (prop) return prop.textContent.trim();
  if (block.dataset[name] !== undefined) return block.dataset[name];

  const row = [...block.children].find((child) => child.dataset?.field === name);
  return row?.textContent?.trim() || fallback;
}

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

async function loadPosts() {
  const response = await fetch('/query-index.json');
  if (!response.ok) throw new Error(`Unable to load blog index: ${response.status}`);
  return getItems(await response.json());
}

function isBlogPost(post) {
  return typeof post?.path === 'string' && post.path.startsWith('/blogs/');
}

function renderPosts(container, posts) {
  posts.forEach((post) => {
    const li = document.createElement('li');
    li.className = 'blog-list-card';

    const link = document.createElement('a');
    link.href = post.path;
    link.className = 'blog-list-card-link';

    if (post.image) {
      const picture = createOptimizedPicture(post.image, post.title || '', false, [{ width: '750' }]);
      picture.className = 'blog-list-card-image';
      link.append(picture);
    }

    const body = document.createElement('div');
    body.className = 'blog-list-card-body';
    const title = document.createElement('h3');
    title.textContent = post.title || 'Untitled';
    body.append(title);

    if (post.description) {
      const description = document.createElement('p');
      description.textContent = post.description;
      body.append(description);
    }

    const readMore = document.createElement('span');
    readMore.className = 'blog-list-read-more';
    readMore.textContent = 'Read More';
    body.append(readMore);
    link.append(body);
    li.append(link);
    container.append(li);
  });
}

export default async function decorate(block) {
  const heading = getField(block, 'heading');
  const maxItems = Number.parseInt(getField(block, 'maxItems'), 10);
  const container = document.createElement('ul');
  container.className = 'blog-list-grid';

  block.replaceChildren();

  if (heading) {
    const title = document.createElement('h2');
    title.textContent = heading;
    block.append(title);
  }

  try {
    let posts = (await loadPosts())
      .filter(isBlogPost)
      .sort((first, second) => Date.parse(second.publishDate) - Date.parse(first.publishDate));
    if (Number.isFinite(maxItems) && maxItems > 0) posts = posts.slice(0, maxItems);

    if (posts.length) renderPosts(container, posts);
    else container.innerHTML = '<li class="blog-list-message">No blog posts are available.</li>';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to load blog posts.', error);
    container.innerHTML = '<li class="blog-list-message">Blog posts are currently unavailable.</li>';
  }

  block.append(container);
}
