# Screaming Frog Custom JavaScripts

Reusable **Custom JavaScript snippets for Screaming Frog SEO Spider**.

This repository collects small scripts for practical SEO, content-analysis and crawling workflows. Each script lives in its own folder together with its own documentation, configuration notes and usage examples.

The goal is to keep the scripts easy to understand, easy to adapt and independent from any specific CMS or website theme.

## Scripts

### HTML to Markdown Export

Exports the rendered main content of crawled pages into separate Markdown files with YAML frontmatter.

Useful for:

- content inventories;
- local knowledge bases;
- historical content snapshots;
- internal-linking analysis;
- topic and content-gap research;
- LLM / RAG workflows;
- SEO and AI-search analysis.

Folder:

```text
html-to-markdown/
```

Documentation:

[HTML to Markdown Export](html-to-markdown/README.md)

## Repository structure

Each script has its own directory:

```text
screaming-frog-custom-javascript/
├── README.md
├── LICENSE
│
├── html-to-markdown/
│   ├── screaming-frog-html-to-markdown.js
│   └── README.md
│
├── future-script/
│   ├── future-script.js
│   └── README.md
│
└── another-script/
    ├── another-script.js
    └── README.md
```

This keeps the script and its documentation together and prevents the repository root from becoming difficult to navigate as more snippets are added.

## How to use the scripts

1. Open the folder of the script you want to use.
2. Read its `README.md`.
3. Review the configuration section carefully.
4. Copy the JavaScript into a Screaming Frog **Custom JavaScript** snippet.
5. Test it on a small set of representative URLs before running a full crawl.

Some scripts may require:

- JavaScript rendering;
- an absolute local output path;
- external JavaScript libraries;
- site-specific CSS selectors;
- additional configuration inside Screaming Frog.

Always follow the documentation in the individual script folder.

## Design principles

The scripts in this repository should stay as generic as possible.

Where site-specific configuration is required, it should preferably be exposed through a clearly marked configuration section instead of being hard-coded into the logic.

Typical examples include:

- content selectors;
- elements to exclude;
- output directories;
- URL patterns;
- extraction rules.

Complex post-processing, historical diffing, classification or enrichment is usually better handled outside Screaming Frog rather than adding increasingly site-specific logic to the crawler script.

## Compatibility

The scripts are written for **Screaming Frog SEO Spider Custom JavaScript**.

Because Screaming Frog's Custom JavaScript API and browser environment may evolve, test scripts after major Screaming Frog updates before relying on them in production workflows.

## Contributions

Contributions, fixes and improvements are welcome.

Please keep additions focused on reusable Screaming Frog workflows and avoid hard-coding selectors or assumptions that only work on a single website or CMS theme.

If a script needs substantial documentation or configuration, give it its own folder and `README.md`.

## Security

Never commit:

- API keys;
- authentication tokens;
- customer data;
- cookies;
- private URLs;
- URLs containing confidential query parameters;
- local credentials or secrets.

Review scripts before using them on client websites or sensitive data.

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

This repository is an independent collection of utilities for use with Screaming Frog SEO Spider.

It is not affiliated with, maintained by, or endorsed by Screaming Frog Ltd.
