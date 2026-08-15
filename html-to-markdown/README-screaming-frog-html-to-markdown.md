# Screaming Frog HTML to Markdown Export

Export the rendered main content of crawled pages from **Screaming Frog SEO Spider** into separate Markdown files.

The script is intended for Screaming Frog's **Custom JavaScript** feature and uses [Turndown](https://github.com/mixmark-io/turndown) plus the GFM plugin to convert rendered HTML into GitHub-Flavoured Markdown.

It is useful when you want to build a local content corpus for:

- content inventories;
- internal-linking analysis;
- topic and content-gap research;
- LLM / RAG workflows;
- SEO and AI-search analysis;
- historical content snapshots;
- migration or QA workflows.

## What it does

For every crawled URL, the script can:

- extract a configurable editorial content container;
- remove explicitly excluded CMS blocks;
- remove additional theme-specific elements via CSS selectors;
- convert HTML to GitHub-Flavoured Markdown;
- preserve headings, lists, tables, task lists, links and useful images;
- omit decorative images without alt text;
- add basic page metadata as YAML frontmatter;
- save one `.md` file per URL.

Example output:

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

# Technical SEO

Your converted page content starts here.
```

## Requirements

- Screaming Frog SEO Spider with Custom JavaScript support
- JavaScript rendering enabled for pages that require it
- a local output directory that already exists
- network access to `unpkg.com`, unless you self-host the two JavaScript dependencies

## Quick start

1. Copy `screaming-frog-html-to-markdown.js` into a new Screaming Frog Custom JavaScript snippet.
2. Edit the `CONFIG` section at the top of the script.
3. Test it on a few representative URLs.
4. Run your crawl.
5. Inspect the generated Markdown before using it as a knowledge corpus.

## Configuration

Four settings deserve attention.

### 1. `OUTPUT_DIR`

**Required.** Set an absolute local directory where the Markdown files should be written.

```js
const OUTPUT_DIR = '/absolute/path/to/markdown-output';
```

Linux example:

```js
const OUTPUT_DIR = '/home/user/seo-corpus/staging';
```

Create the directory before starting the crawl.

### 2. `CONTENT_SELECTOR`

Set the CSS selector that contains the main editorial content.

```js
const CONTENT_SELECTOR = '#main';
```

Common alternatives:

```js
const CONTENT_SELECTOR = 'main';
const CONTENT_SELECTOR = 'article';
const CONTENT_SELECTOR = '.page-content';
```

Inspect several page templates before choosing the selector. A selector that works on only one template will create incomplete exports elsewhere.

### 3. `EXCLUDE_SELECTOR`

Optional. Default:

```js
const EXCLUDE_SELECTOR = '.corpus-exclude';
```

This is useful for CMS blocks that should never become part of the Markdown corpus, for example:

- calculators;
- interactive dashboards;
- browser-based tools;
- upload interfaces;
- application UIs.

If your CMS allows custom CSS classes on content blocks, add `corpus-exclude` to the complete block.

If you do not need this mechanism:

```js
const EXCLUDE_SELECTOR = '';
```

### 4. `CUSTOM_REMOVE_SELECTORS`

Use this for repeated theme or navigation elements located inside your main content container.

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

These selectors are site-specific. Inspect your own HTML instead of copying selectors blindly.

A fuller example is available in:

```text
examples/site-specific-config.js
```

## External dependencies

The script loads pinned versions of:

- Turndown `7.2.4`
- `turndown-plugin-gfm` `1.0.2`

from `unpkg.com`.

If external CDN dependencies are not suitable for your environment, self-host both JavaScript files and replace:

```js
const TURNDOWN_URL = '...';
const GFM_PLUGIN_URL = '...';
```

## File naming

Generated filenames use:

```text
readable-title-slug--short-url-hash.md
```

Example:

```text
technical-seo-guide--8f21c94a.md
```

The short hash reduces filename collisions. It is not intended to be cryptographically secure.

For long-lived knowledge bases, you may prefer to rename files in a later post-processing step using stable URL-based identifiers.

## Recommended architecture

Keep extraction and corpus management separate:

```text
Website
   ↓
Screaming Frog
   ↓
Raw Markdown
   ↓
Post-processing / normalization
   ↓
Knowledge corpus / archive / Obsidian / RAG
```

Screaming Frog should primarily extract reliable raw content.

More advanced tasks such as these are usually better handled later:

- stable URL-based filenames;
- content hashing;
- change detection;
- classification;
- removal of UI-state noise;
- metadata enrichment;
- preserving manually maintained frontmatter;
- historical snapshots;
- LLM-specific bundles.

This keeps the crawler script easier to debug and less dependent on one website's theme.

## Important Screaming Frog detail

The file-write action should be returned directly:

```js
return seoSpider.saveText(
    result.markdown,
    filePath,
    false
);
```

Do not assume that `saveText()` behaves like a Promise, and do not replace the return value with `seoSpider.data()` if your goal is to write the file.

## Error handling

If `CONTENT_SELECTOR` does not match a page, the script still writes a Markdown file containing an explicit error message:

```text
ERROR: No element matched CONTENT_SELECTOR "#main".
```

This makes incomplete templates easier to identify during QA.

## Before a full crawl

Test at least:

- a normal content page;
- a long-form article;
- a page with tables;
- a page with lists or task lists;
- a page with interactive UI;
- every major page template on the site.

Then inspect the Markdown manually.

## Repository structure

```text
.
├── screaming-frog-html-to-markdown.js
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── .gitignore
└── examples/
    └── site-specific-config.js
```

## License

MIT. See `LICENSE`.

## Disclaimer

This project is an independent utility for use with Screaming Frog SEO Spider. It is not affiliated with or endorsed by Screaming Frog Ltd.
