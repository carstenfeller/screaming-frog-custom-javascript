/*
 * Screaming Frog Custom JavaScript – HTML to Markdown Export
 *
 * Purpose
 * -------
 * Extract a defined content container from rendered HTML, convert it to
 * GitHub-Flavoured Markdown, add basic page metadata as YAML frontmatter,
 * and save one .md file per crawled URL.
 *
 * Designed for Screaming Frog SEO Spider Custom JavaScript.
 *
 * External libraries:
 * - Turndown 7.2.4
 * - turndown-plugin-gfm 1.0.2
 *
 * IMPORTANT
 * ---------
 * Adapt the CONFIG section below before running the script.
 */

// ============================================================================
// CONFIG – ADAPT THESE VALUES
// ============================================================================

// Absolute local directory where Screaming Frog should write the Markdown files.
// The directory must already exist.
const OUTPUT_DIR = '/absolute/path/to/markdown-output';

// CSS selector for the main editorial content of a page.
// Common examples: '#main', 'main', 'article', '.page-content'
const CONTENT_SELECTOR = '#main';

// Optional CSS selector for blocks that should never be included in the corpus.
// Add this class/attribute in your CMS to interactive tools, calculators,
// application UIs, or other non-editorial blocks.
const EXCLUDE_SELECTOR = '.corpus-exclude';

// Add site/theme-specific selectors here.
// Everything matching one of these selectors will be removed before conversion.
//
// Examples:
// 'nav[aria-label="Breadcrumb"]'
// 'nav[aria-label="Social share"]'
// '.table-of-contents'
// '.related-posts'
// '.post-pagination'
const CUSTOM_REMOVE_SELECTORS = [];

// Pin dependency versions so CDN updates do not silently change output.
// Self-host these files and replace the URLs if you do not want CDN dependencies.
const TURNDOWN_URL =
    'https://unpkg.com/turndown@7.2.4/dist/turndown.js';

const GFM_PLUGIN_URL =
    'https://unpkg.com/turndown-plugin-gfm@1.0.2/dist/turndown-plugin-gfm.js';


// ============================================================================
// HELPERS
// ============================================================================

function slugify(value) {
    return (value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ß/g, 'ss')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .slice(0, 120) || 'page';
}


function shortHash(value) {
    // FNV-1a-style 32-bit hash.
    // It is only used to keep filenames unique and is not a security feature.
    let hash = 0x811c9dc5;

    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString(16).padStart(8, '0');
}


function yamlEscape(value) {
    return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\r?\n/g, '\\n');
}


// ============================================================================
// DOM CLEANUP
// ============================================================================

function cleanContent(contentEl) {
    // Always work on a clone so the rendered page itself is not modified.
    const clone = contentEl.cloneNode(true);

    // Remove blocks explicitly excluded by the site owner/editor.
    if (EXCLUDE_SELECTOR) {
        clone.querySelectorAll(EXCLUDE_SELECTOR).forEach(el => el.remove());
    }

    // Remove implementation details that are not useful as editorial content.
    clone
        .querySelectorAll('script, style, noscript, template')
        .forEach(el => el.remove());

    // Remove site/theme-specific elements configured above.
    CUSTOM_REMOVE_SELECTORS.forEach(selector => {
        try {
            clone.querySelectorAll(selector).forEach(el => el.remove());
        } catch (error) {
            throw new Error(
                'Invalid CSS selector in CUSTOM_REMOVE_SELECTORS: ' +
                selector +
                ' (' +
                error.message +
                ')'
            );
        }
    });

    return clone;
}


// ============================================================================
// TURNDOWN
// ============================================================================

function createTurndownService() {
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-'
    });

    // GitHub-Flavoured Markdown support:
    // tables, task-list items, and strikethrough.
    if (
        typeof turndownPluginGfm === 'undefined' ||
        !turndownPluginGfm.gfm
    ) {
        throw new Error('Turndown GFM plugin was not loaded correctly.');
    }

    turndownService.use(turndownPluginGfm.gfm);

    // Keep useful images but omit decorative images without alt text.
    turndownService.addRule('cleanImages', {
        filter: 'img',
        replacement: function(content, node) {
            const alt = node.getAttribute('alt') || '';
            const src = node.getAttribute('src') || '';

            if (!alt.trim()) {
                return '';
            }

            return '![' + alt + '](' + src + ')';
        }
    });

    // Remove anchors that contain no readable text.
    turndownService.addRule('removeEmptyLinks', {
        filter: function(node) {
            return (
                node.nodeName === 'A' &&
                !node.textContent.trim()
            );
        },
        replacement: function() {
            return '';
        }
    });

    return turndownService;
}


// ============================================================================
// EXTRACTION
// ============================================================================

function extractContent() {
    const title = document.title || '';

    const metaDescEl =
        document.querySelector('meta[name="description"]');

    const description = metaDescEl
        ? (metaDescEl.getAttribute('content') || '')
        : '';

    const h1El = document.querySelector('h1');
    const h1 = h1El ? h1El.textContent.trim() : '';

    const canonicalEl =
        document.querySelector('link[rel="canonical"]');

    const canonical = canonicalEl
        ? (canonicalEl.href || '')
        : '';

    const robotsEl =
        document.querySelector('meta[name="robots"]');

    const robots = robotsEl
        ? (robotsEl.getAttribute('content') || '')
        : '';

    const language =
        document.documentElement.getAttribute('lang') || '';

    const sourceUrl = location.href;

    const contentEl =
        document.querySelector(CONTENT_SELECTOR);

    let markdownBody;

    if (!contentEl) {
        markdownBody =
            'ERROR: No element matched CONTENT_SELECTOR "' +
            CONTENT_SELECTOR +
            '".';
    } else {
        const cleanedContent = cleanContent(contentEl);
        const turndownService = createTurndownService();

        markdownBody = turndownService
            .turndown(cleanedContent)
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    const markdown = [
        '---',
        'title: "'       + yamlEscape(title)       + '"',
        'description: "' + yamlEscape(description) + '"',
        'h1: "'          + yamlEscape(h1)          + '"',
        'source_url: "'  + yamlEscape(sourceUrl)   + '"',
        'canonical: "'   + yamlEscape(canonical)   + '"',
        'robots: "'      + yamlEscape(robots)      + '"',
        'language: "'    + yamlEscape(language)    + '"',
        'crawled_at: "'  + new Date().toISOString() + '"',
        '---',
        '',
        markdownBody,
        ''
    ].join('\n');

    // Human-readable filename plus a short URL-derived hash to avoid collisions.
    const nameBase =
        title ||
        h1 ||
        location.pathname ||
        'page';

    const filename =
        slugify(nameBase) +
        '--' +
        shortHash(sourceUrl) +
        '.md';

    return {
        markdown: markdown,
        filename: filename
    };
}


// ============================================================================
// SCREAMING FROG EXECUTION
// ============================================================================

return seoSpider
    .loadScript(TURNDOWN_URL)
    .then(() => seoSpider.loadScript(GFM_PLUGIN_URL))
    .then(() => {
        const result = extractContent();

        const filePath =
            OUTPUT_DIR.replace(/\/$/, '') +
            '/' +
            result.filename;

        /*
         * IMPORTANT:
         * Return seoSpider.saveText() directly.
         *
         * Do not chain .then() to saveText(), and do not replace this return
         * value with seoSpider.data(). In Screaming Frog, doing so may prevent
         * the file-write action from executing.
         */
        return seoSpider.saveText(
            result.markdown,
            filePath,
            false
        );
    });
