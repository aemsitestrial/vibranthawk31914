import { getAEMPublish, getAEMAuthor } from '../../scripts/endpointconfig.js';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const DISPLAY_FIELDS = new Set([
  'title',
  'author',
  'publicationdate',
  'content',
  'featuredimage',
]);

function getFallbackArticle(block) {
  const title = block.querySelector('h1, h2, h3, h4, h5')
    ?.textContent?.trim()
    || 'Article';

  const description = block.querySelector('p')
    ?.textContent?.trim()
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

function getFieldValue(block, index) {
  return block.querySelector(`:scope > div:nth-child(${index}) > div`)
    ?.textContent?.trim() || '';
}

function getSafeClass(value, fallback) {
  return /^[a-z]+$/i.test(value || '')
    ? value.toLowerCase()
    : fallback;
}

function getSelectedFields(block) {
  const fieldsContainer = block.querySelector(
    ':scope > div:nth-child(4)',
  );

  if (!fieldsContainer) {
    return [...DISPLAY_FIELDS];
  }

  const values = fieldsContainer.textContent
    ?.split(',')
    ?.map((field) => field.trim().toLowerCase())
    ?.filter((field) => DISPLAY_FIELDS.has(field));

  return values?.length
    ? values
    : [...DISPLAY_FIELDS];
}

export default async function decorate(block) {
  const aempublishurl = getAEMPublish();
  const aemauthorurl = getAEMAuthor();

  const persistedquery =
    '/graphql/execute.json/aem-boilerplate-frescopa/ArticleByPath';

  const sourceLink = block.querySelector('a[href]');

  const rawArticlePath = sourceLink
    ? new URL(sourceLink.href, window.location.origin).pathname
    : '';

  const articlepath = (
    rawArticlePath
    || block.dataset?.path
    || ''
  ).replace(/\.html$/, '');

  const variationname = getSafeClass(
    getFieldValue(block, 2),
    'main',
  );

  const alignment = getSafeClass(
    getFieldValue(block, 3),
    'left',
  );

  const selectedFields = getSelectedFields(block);

  const showField = (field) => selectedFields.includes(field);

  if (!articlepath || (!aempublishurl && !aemauthorurl)) {
    const fallback = getFallbackArticle(block);

    block.innerHTML = `
      <div class="article-content ${variationname} ${alignment}">
        <div class="article-wrapper">
          ${
            showField('title')
              ? `<h4 class="title">${escapeHtml(fallback.title)}</h4>`
              : ''
          }
          ${
            showField('content')
              ? `<p class="content">${escapeHtml(fallback.content.plaintext)}</p>`
              : ''
          }
        </div>
      </div>
    `;

    return;
  }

  const baseUrl = window.location.origin.includes('author')
    ? aemauthorurl
    : aempublishurl;

  const url =
    `${baseUrl}${persistedquery};path=${articlepath};variation=${variationname};ts=${Date.now()}`;

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
    // fallback content is already available
  }

  const title = cfReq.title || '';

  const author = cfReq.author || '';

  const publicationDate = cfReq.date
    || cfReq.publicationDate
    || '';

  const content = cfReq.content?.plaintext || '';

  const featuredImage = cfReq.featuredImage?._path
    || cfReq.featuredImage?.path
    || cfReq.featuredImage
    || cfReq.image?._path
    || cfReq.image?.path
    || cfReq.image
    || '';

  const renderedContent = variationname === 'summary'
    ? getSummary(content)
    : content;

  const itemId =
    `urn:aemconnection:${articlepath}/jcr:content/data/${variationname}`;

  block.innerHTML = `
    <div
      class="article-content ${variationname} ${alignment}"
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
                <img
           turedImage)}"
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
          showField('author') || showField('publicationdate')
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
                        data-aue-prop="date"
                        data-aue-label="date"
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