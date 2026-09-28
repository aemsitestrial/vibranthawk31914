import { createOptimizedPicture } from '../../scripts/aem.js';

function getField(block, name, fallback = '') {
  const normalizedName = name.toLowerCase();
  const prop = [...block.querySelectorAll('[data-aue-prop]')].find(
    (element) => element.dataset.aueProp?.toLowerCase() === normalizedName,
  );
  if (prop) return prop.textContent.trim();
  const dataField = Object.entries(block.dataset).find(
    ([key]) => key.toLowerCase() === normalizedName,
  );
  if (dataField) return dataField[1];

  const row = [...block.children].find(
    (child) => child.dataset?.field?.toLowerCase() === normalizedName,
  );
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
  return typeof post?.path === 'string';
}

function getPublishDate(post) {
  const timestamp = Date.parse(post?.publishDate);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function createPostCard(post, className, imageWidth, elementName = 'li') {
  const card = document.createElement(elementName);
  card.className = className;

  const link = document.createElement('a');
  link.href = post.path;
  link.className = 'blog-list-card-link';

  if (post.image) {
    const picture = createOptimizedPicture(post.image, post.title || '', false, [{ width: imageWidth }]);
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
  card.append(link);
  return card;
}

function renderPosts(container, posts, className = 'blog-list-card', imageWidth = '750') {
  posts.forEach((post) => {
    container.append(createPostCard(post, className, imageWidth));
  });
}

function renderFeaturedPosts(container, posts) {
  const [featuredPost, ...remainingPosts] = posts;
  const featured = document.createElement('div');
  featured.className = 'blog-list-featured-hero';
  featured.append(createPostCard(
    featuredPost,
    'blog-list-card blog-list-featured-card',
    '1200',
    'div',
  ));
  container.append(featured);

  if (remainingPosts.length) {
    const grid = document.createElement('ul');
    grid.className = 'blog-list-grid';
    renderPosts(grid, remainingPosts);
    container.append(grid);
  }
}

function renderCompactPosts(container, posts) {
  posts.forEach((post) => {
    const item = document.createElement('li');
    item.className = 'blog-list-compact-item';

    if (post.image) {
      const picture = createOptimizedPicture(post.image, post.title || '', false, [{ width: '160' }]);
      picture.className = 'blog-list-compact-image';
      item.append(picture);
    }

    const content = document.createElement('div');
    const link = document.createElement('a');
    link.href = post.path;
    link.className = 'blog-list-compact-title';
    link.textContent = post.title || 'Untitled';
    content.append(link);

    if (post.description) {
      const description = document.createElement('p');
      description.className = 'blog-list-compact-description';
      description.textContent = post.description;
      content.append(description);
    }

    const readMore = document.createElement('a');
    readMore.href = post.path;
    readMore.className = 'blog-list-read-more';
    readMore.textContent = 'Read More ->';
    content.append(readMore);
    item.append(content);
    container.append(item);
  });
}

function getVariant(block) {
  const variant = getField(block, 'variant', 'featured').toLowerCase();
  return ['featured', 'grid', 'horizontal', 'compact'].includes(variant) ? variant : 'featured';
}

function getMaxItems(block) {
  const maxItems = Number.parseInt(getField(block, 'maxItems', '6'), 10);
  return Number.isFinite(maxItems) && maxItems > 0 ? maxItems : 6;
}

export default async function decorate(block) {
  const heading = getField(block, 'heading');
  const maxItems = getMaxItems(block);
  const variant = getVariant(block);
  const container = document.createElement('div');
  block.classList.remove('blog-list-featured', 'blog-list-grid', 'blog-list-horizontal', 'blog-list-compact');
  block.classList.add(`blog-list-${variant}`);

  block.replaceChildren();

  if (heading) {
    const title = document.createElement('h2');
    title.textContent = heading;
    block.append(title);
  }

  try {
    let posts = (await loadPosts())
      .filter(isBlogPost)
      .sort((first, second) => getPublishDate(second) - getPublishDate(first));
    // eslint-disable-next-line no-console
    console.debug('Blog List configuration', {
      heading,
      maxItems,
      variant,
      totalPostsBeforeSlicing: posts.length,
    });
    posts = posts.slice(0, maxItems);
    // eslint-disable-next-line no-console
    console.debug('Blog List rendered posts', { totalPostsAfterSlicing: posts.length });

    if (posts.length && variant === 'featured') renderFeaturedPosts(container, posts);
    else if (posts.length && variant === 'compact') {
      const list = document.createElement('ul');
      list.className = 'blog-list-compact-list';
      renderCompactPosts(list, posts);
      container.append(list);
    } else if (posts.length) {
      const list = document.createElement('ul');
      list.className = variant === 'horizontal' ? 'blog-list-horizontal-list' : 'blog-list-grid';
      renderPosts(list, posts, variant === 'horizontal' ? 'blog-list-card blog-list-horizontal-card' : undefined);
      container.append(list);
    } else container.innerHTML = '<div class="blog-list-message">No blog posts are available.</div>';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to load blog posts.', error);
    container.innerHTML = '<div class="blog-list-message">Blog posts are currently unavailable.</div>';
  }

  block.append(container);
}
