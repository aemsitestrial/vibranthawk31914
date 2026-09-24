import { getAEMPublish, getAEMAuthor } from '../../scripts/endpointconfig.js';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function getFallbackArticle(block) {
  const title = block.querySelector('h1, h2, h3, h4, h5')?.textContent?.trim() || 'Article';

  const description = block.querySelector('p')?.textContent?.trim()
    || 'Article content is available in the authored document.';

  return {
    title,
    content: {
      plaintext: description,
    },
  };
}

function getSummary(text = '', limit = 150) {
  if (text.length <= limit) {
    return text;
  }

  return `${text.substring(0, limit)}...`;
}

/* eslint-disable no-underscore-dangle */
export default async function decorate(block) {
  const aempublishurl = getAEMPublish();
  const aemauthorurl = getAEMAuthor();

  const persistedquery = '/graphql/execute.json/aem-boilerplate-frescopa/ArticleByPath';

  const sourceLink = block.querySelector('a[href]');

  const rawArticlePath = sourceLink
    ? new URL(sourceLink.href, window.location.origin).pathname
    : '';

  const articlepath = (rawArticlePath || block.dataset?.path || '')
    .replace(/\.html$/, '');

  const variationname = block
    .querySelector(':scope div:nth-child(2) > div')
    ?.textContent
    ?.trim()
    || 'main';

  const selectedFields = block
    .querySelector(':scope div:nth-child(3) > div')
    ?.textContent
    ?.split(',')
    ?.map((field) => field.trim().toLowerCase())
    || ['title', 'author', 'publicationdate', 'content'];

  if (!articlepath || (!aempublishurl && !aemauthorurl)) {
    const fallback = getFallbackArticle(block);

    block.innerHTML = `
      <div class="article-content ${variationname}">
        <div class="article-wrapper">
          <h4 class="title">${escapeHtml(fallback.title)}</h4>
          <p class="content">${escapeHtml(fallback.content.plaintext)}</p>
        </div>
      </div>
    `;

    return;
  }

  const baseUrl = (
    window.location.origin.includes('author')
      ? aemauthorurl
      : aempublishurl
  );

  const url = `${baseUrl}${persistedquery};path=${articlepath};variation=${variationname};ts=${Date.now()}`;

  let cfReq = getFallbackArticle(block);

  try {
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (response.ok) {
      const contentfragment = await response.json();

      const item = contentfragment?.data?.articleByPath?.item;

      if (item) {
        cfReq = item;
      }
    }
  } catch (error) {
    // Use fallback content
  }

  const title = cfReq.title || '';

  const author = cfReq.author || '';

  const publicationDate = cfReq.publicationDate || '';

  const content = cfReq.content?.plaintext || '';

  const featuredImage = cfReq.featuredImage?._path
    || cfReq.featuredImage?.path
    || cfReq.featuredImage
    || cfReq.image?._path
    || cfReq.image?.path
    || cfReq.image
    || '';

  const showField = (field) => selectedFields.includes(field);

  const renderedContent = variationname === 'summary'
    ? getSummary(content)
    : content;

  const itemId = `urn:aemconnection:${articlepath}/jcr:content/data/${variationname}`;

  block.innerHTML = `
    <div
      class="article-content ${variationname}"
      data-aue-resource="${itemId}"
      data-aue-label="article content fragment"
      data-aue-type="reference"
      data-aue-filter="cf"
    >
      <div class="article-wrapper">

        ${
  showField('featuredimage') && featuredImage
    ? `
        <div class="featured-image">
          ${escapeHtml(featuredImage)}"
            loading="lazy"
          >
        </div>
        `
    : ''
}

        ${
  showField('title')
    ? `
          <h4
            data-aue-prop="title"
            data-aue-label="title"
            data-aue-type="text"
            class="title"
          >
            ${escapeHtml(title)}
          </h4>
        `
    : ''
}

        ${
  (showField('author') || showField('publicationdate'))
    ? `
          <div class="article-meta">

            ${
  showField('author')
    ? `
              <span
                data-aue-prop="author"
                data-aue-label="author"
                data-aue-type="text"
                class="author"
              >
                ${escapeHtml(author)}
              </span>
            `
    : ''
}

            ${
  showField('publicationdate')
    ? `
              <span
                data-aue-prop="publicationDate"
                data-aue-label="publication date"
                data-aue-type="text"
                class="publication-date"
              >
                ${escapeHtml(publicationDate)}
              </span>
            `
    : ''
}

          </div>
        `
    : ''
}

        ${
  showField('content')
    ? `
          <p
            data-aue-prop="content"
            data-aue-label="content"
            data-aue-type="richtext"
            class="content"
          >
            ${escapeHtml(renderedContent)}
          </p>
        `
    : ''
}

      </div>
    </div>
  `;
}
