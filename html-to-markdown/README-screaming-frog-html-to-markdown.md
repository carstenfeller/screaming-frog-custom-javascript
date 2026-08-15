# Screaming Frog HTML-to-Markdown Export

A small Custom JavaScript snippet for **Screaming Frog SEO Spider** that converts the main rendered content of every crawled page into a separate Markdown file.

The script:

- extracts a configurable content container such as `#main`, `main`, or `article`;
- converts HTML to GitHub-Flavoured Markdown using Turndown;
- preserves tables, task lists, links, headings and useful images;
- adds basic page metadata as YAML frontmatter;
- can exclude CMS blocks such as calculators, dashboards or browser tools;
- supports additional site-specific cleanup via CSS selectors;
- saves one `.md` file per crawled URL.

## What you need to change

Before running the script, edit the `CONFIG` section at the top of `screaming-frog-html-to-markdown.js`.

### 1. `OUTPUT_DIR`

Set an **absolute local path** where Markdown files should be written.

```js
const OUTPUT_DIR = '/absolute/path/to/markdown-output';
```

Create the directory before starting the crawl.

Example on Linux:

```js
const OUTPUT_DIR = '/home/user/seo-corpus/staging';
```

### 2. `CONTENT_SELECTOR`

Set the CSS selector that contains the editorial content you want to export.

```js
const CONTENT_SELECTOR = '#main';
```

Common alternatives:

```js
const CONTENT_SELECTOR = 'main';
const CONTENT_SELECTOR = 'article';
const CONTENT_SELECTOR = '.page-content';
```

Inspect several page templates before choosing the selector. The same selector should ideally work across all relevant page types.

### 3. `EXCLUDE_SELECTOR`

Optional. The default is:

```js
const EXCLUDE_SELECTOR = '.corpus-exclude';
```

Add this class in your CMS to complete blocks that should not become part of the Markdown corpus, for example:

- calculators;
- interactive dashboards;
- browser-based tools;
- upload forms;
- application UIs.

If you do not need this feature, set:

```js
const EXCLUDE_SELECTOR = '';
```

### 4. `CUSTOM_REMOVE_SELECTORS`

Add selectors for repeated theme or navigation elements that are inside your main content container but should not be exported.

Example:

```js
const CUSTOM_REMOVE_SELECTORS = [
    'nav[aria-label="Breadcrumb"]',
    'nav[aria-label="Social share"]',
    '.table-of-contents',
    '.related-posts',
    '.post-pagination'
];
```

These selectors are **site-specific**. Do not copy them blindly; inspect your own HTML.

## Screaming Frog setup

Create a new **Custom JavaScript** snippet and use it as an **Extraction** snippet with JavaScript rendering enabled.

The script loads pinned versions of:

- Turndown `7.2.4`
- `turndown-plugin-gfm` `1.0.2`

from `unpkg.com`.

If external CDN dependencies are not acceptable in your environment, self-host the two JavaScript files and replace `TURNDOWN_URL` and `GFM_PLUGIN_URL`.

## Output

A page such as:

```text
https://example.com/guides/technical-seo
```

might produce:

```text
technical-seo-guide--8f21c94a.md
```

Each file contains YAML frontmatter followed by Markdown:

```yaml
---
title: "Technical SEO Guide"
description: "..."
h1: "Technical SEO"
source_url: "https://example.com/guides/technical-seo"
canonical: "https://example.com/guides/technical-seo"
robots: "index,follow"
language: "en"
crawled_at: "2026-08-15T09:00:00.000Z"
---
```

The filename combines a readable title-based slug with a short URL-derived hash to reduce filename collisions.

## Recommended workflow

Treat the exported files as **raw crawl data**.

For larger knowledge-base or content-corpus workflows, it is usually better to perform further normalization, classification, stable URL-based naming and historical diffing in a separate post-processing step rather than adding more and more site-specific logic to the Screaming Frog extraction script.

## Notes

- The script does not create `OUTPUT_DIR`; create it beforehand.
- If `CONTENT_SELECTOR` does not match a page, the generated Markdown file contains an explicit error message.
- Decorative images without alt text are omitted.
- The short filename hash is only for uniqueness; it is not cryptographic.
- Test the script on a small set of representative URLs before running a full crawl.
