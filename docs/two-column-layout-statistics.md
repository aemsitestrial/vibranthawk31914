# Statistics List in Two Column Layout

## Supported authoring architecture

Adobe's EDS content model supports default content and blocks inside sections,
not arbitrary blocks nested inside blocks or block items. Adding a component ID
to a filter only controls the editor's available components; it does not extend
the AEM rendering or EDS publishing contract.

Reference: https://www.aem.live/developer/component-model-definitions#sections-and-section-metadata

Use section-level sibling composition to keep the existing blocks, models, and
Statistic Item authoring unchanged:

```text
Section
|- Two Column Layout
|  |- Title
|  |- Image (optional)
|  |- Content
|  |- CTA
|  `- CTA
`- Statistics List
   |- Statistic Item
   |- Statistic Item
   `- Statistic Item
```

Statistics List must immediately follow Two Column Layout in the same section.
The layout decorator moves the Statistics List wrapper into the right column.
This creates a visual child block, not a nested persisted AEM block. Authors
continue adding, deleting, and reordering Statistic Items inside Statistics List.
The persisted authoring tree remains section-level siblings.

## Definitions, models, and filters

Reuse the existing definition in `blocks/statistics-list/_statistics-list.json`:

```json
{
  "title": "Statistics List",
  "id": "statistics-list",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "Statistics List",
          "model": "statistics-list",
          "filter": "statistics-list"
        }
      }
    }
  }
}
```

Keep the existing `statistics-list` and `statistics-list-item` models unchanged.
Do not redefine the Statistic Item model in the layout. Keep the item resource
type `core/franklin/components/block/v1/block/item` unchanged.

The existing section filter in `models/_section.json` already allows both
`two-column-layout` and `statistics-list`. The existing child filters remain:

```json
[
  {
    "id": "two-column-layout",
    "components": [
      "two-column-layout-title",
      "two-column-layout-image",
      "two-column-layout-text",
      "two-column-layout-cta",
      "two-column-layout-statistics"
    ]
  },
  {
    "id": "statistics-list",
    "components": ["statistics-list-item"]
  }
]
```

Do not add `statistics-list` to the layout's item filter for standard EDS
authoring. Do not convert Statistics List to a block item: doing so changes its
serialization and does not enable another level of child blocks.

The pre-existing `two-column-layout-statistics` reference item is retained for
compatibility. Its reference field does not create a Statistics List container
or enable nested Statistic Items. It is not used by the sibling-composition path.

Run `npm run build:json` after changing source configuration. The existing merge
configuration registers both blocks' definitions, models, and filters without
duplication in the generated root JSON files.

## Rendering and loading

`blocks/two-column-layout/two-column-layout.js` is asynchronous. It:

1. Preserves the existing title, image, content, variant, and CTA handling.
2. Recognizes already-present Statistics List markup before title/image/CTA
   classification, preventing its heading or rows from being consumed.
3. Moves the immediately following section-level Statistics List wrapper into
   the right column, retaining its DOM nodes and Universal Editor attributes.
4. Calls the standard EDS lifecycle for each collected Statistics List:

```js
import { decorateBlock, loadBlock, loadCSS } from '../../scripts/aem.js';

// After the nested block has been attached to the right column:
decorateBlock(statisticsBlock);
await loadBlock(statisticsBlock);
```

The implementation ensures `statistics-list` is the first class before calling
`decorateBlock()` on an uninitialized block. Existing initialized or loaded
blocks retain their lifecycle state.

`loadBlock()` loads both assets from `window.hlx.codeBasePath`:

- `/blocks/statistics-list/statistics-list.js`
- `/blocks/statistics-list/statistics-list.css`

It invokes and awaits the existing default decorator, and uses `data-block-status`
to avoid redecorating a loaded block when the normal section loader reaches it.
Do not also import and invoke the statistics decorator directly.

The layout CSS overrides only embedded list sizing: removes standalone section
padding and minimum height, permits long values to wrap, and lets list-heading
paragraphs inherit list typography rather than generic right-column typography.
The standalone Statistics List JS and CSS are unchanged.

## Limitations and release checks

- The literal hierarchy `Two Column Layout > Statistics List > Statistic Item`
  is not a supported production authoring contract with the standard EDS block
  and block-item resource types. JavaScript cannot repair content that the
  publishing pipeline has flattened or omitted.
- Runtime handling of already-nested HTML is defensive compatibility, not a
  guarantee of nested authoring or publication support.
- Composition consumes one immediately following Statistics List in the same
  section. Other lists and unrelated following blocks stay where authored.
- Moving or deleting the parent layout does not automatically move or delete
  its persisted sibling list. Authors must manage both nodes in the content tree.
- Existing layout title/image/CTA instrumentation behavior is unchanged. The
  statistics renderer continues using its own instrumentation-preservation logic.
- Validate adding, editing, reordering, and deleting Statistic Items in Universal
  Editor, then preview and publish a page to verify the EDS output. Local DOM
  tests cannot validate AEM persistence, permissions, or remote publication.
- If the exact nested authoring tree is mandatory, it requires a separately
  supported backend/content architecture. A JSON-only filter change is not a
  production-ready solution. Prefer the section composition above over custom
  exporters or duplicated Statistic Item models.