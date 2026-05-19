# Optimized AEM EDS Migration Prompt

Use this prompt at the start of a new migration project to get fast, correct results.

---

## The Prompt

```
I need to migrate content from [SOURCE_SITE_URL] to AEM Edge Delivery Services.

## Project Configuration

- Project type: [xwalk | da | doc]
- AEM Author URL: [from fstab.yaml or provide directly]
- Sidekick Block Library URL: [from .migration/project.json or provide]
- GitHub org/repo/ref: [owner/repo/branch]

## Sample Page

Analyze this page first: [SAMPLE_PAGE_URL]

## Instructions

1. **Pre-flight checks:**
   - Verify .migration/project.json has correct `type`, `libraryUrl`, and `contentHostUrl`
   - Fetch the Sidekick block library catalog and use ONLY library blocks
   - Check existing blocks/ folder for available variants and models
   - Read _<block>.json files to understand field models for xwalk hinting

2. **Page analysis — identify ALL content sections including:**
   - Navigation elements (breadcrumb, etc.)
   - Hero/banner areas
   - Content blocks (cards, columns, tabs, etc.)
   - Section metadata styles needed for each section

3. **For xwalk projects — MANDATORY:**
   - Add `<!-- field:fieldName -->` HTML comments before EVERY cell content
   - Skip collapsed fields (Alt, Title, Text, Type, MimeType)
   - Skip `classes` field — never create a row for it
   - Read each block's _<block>.json model to know exact field names

4. **Section structure rules:**
   - Group related blocks into the SAME section (e.g., breadcrumb + hero = 1 section)
   - Never create empty sections between related content
   - Define section metadata style values upfront for each section

5. **After importing the sample page:**
   - Scan the source site for ALL pages matching the same template structure
   - Check for the same DOM selectors (.list_navigation, .supergrid, etc.)
   - List compatible URLs for batch import
   - Import all compatible pages in one batch

6. **Deliverables:**
   - Import script: tools/importer/import-<template>.js
   - Parsers: tools/importer/parsers/<block>.js (one per block)
   - Transformers: tools/importer/transformers/<site>-cleanup.js + <site>-sections.js
   - Content: content/**/*.plain.html
   - content/site.json with {owner, repo, ref}
```

---

## Key Decisions to Make Upfront

| Decision | Options | Impact |
|----------|---------|--------|
| Project type | xwalk / da / doc | xwalk needs field hinting in parsers |
| Section styles | e.g., hero / cards / dark / light | Drives Section Metadata blocks |
| Block grouping per section | Which blocks share a section | Prevents empty sections |
| Block variants | Which CSS class variants to use | Drives block table headers |

---

## Common Pitfalls to Avoid

1. **Missing project type** → Defaults to "da", no field hinting, Universal Editor won't map fields
2. **Forgetting breadcrumb/nav blocks** → Content renders without navigation context
3. **Separate sections for related blocks** → Creates empty `<div></div>` in output
4. **Not checking block library** → Uses blocks that don't exist in the project's library
5. **Not scanning for compatible pages** → Misses batch import opportunity (huge time saver)
6. **Missing contentHostUrl** → Import tool can't create packages
7. **Missing site.json** → "Missing site configuration" error in import tool
8. **Cleanup transformer removing block parent** → Parser runs but output gets deleted

---

## Optimal Workflow Order

```
┌─────────────────────────────────────────────────┐
│ 1. PRE-FLIGHT                                   │
│    - Set .migration/project.json (type,         │
│      libraryUrl, contentHostUrl)                │
│    - Fetch block library catalog                │
│    - Read local block models (_*.json)          │
│    - Create content/site.json                   │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│ 2. ANALYZE SAMPLE PAGE                          │
│    - Scrape page                                │
│    - Identify ALL sections + blocks             │
│    - Define section grouping + styles           │
│    - Map blocks to library blocks + variants    │
│    - Confirm structure with user                │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│ 3. BUILD INFRASTRUCTURE (all at once)           │
│    - page-templates.json (with sections+styles) │
│    - Parsers with field hinting (xwalk)         │
│    - Transformers (cleanup + sections)          │
│    - Import script                              │
│    - Bundle                                     │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│ 4. IMPORT + VALIDATE SAMPLE                     │
│    - Import sample page                         │
│    - Verify output structure                    │
│    - Check field hints present (xwalk)          │
│    - Check no empty sections                    │
│    - Check section metadata blocks              │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│ 5. SCAN + BATCH IMPORT                          │
│    - Crawl site for pages with same DOM         │
│      selectors                                  │
│    - List URLs for validation                   │
│    - Batch import all compatible pages          │
└─────────────────────────────────────────────────┘
```

---

## File Checklist (End State)

```
.migration/project.json          ← type, libraryUrl, contentHostUrl
content/site.json                ← owner, repo, ref
content/**/*.plain.html          ← imported pages
tools/importer/
  ├── page-templates.json        ← template with blocks + sections + styles
  ├── import-<template>.js       ← orchestrator script
  ├── import-<template>.bundle.js← bundled for execution
  ├── urls-<template>.txt        ← all URLs for this template
  ├── parsers/
  │   ├── <block1>.js            ← with field hinting if xwalk
  │   ├── <block2>.js
  │   └── ...
  ├── transformers/
  │   ├── <site>-cleanup.js      ← remove nav/header/footer/tracking
  │   └── <site>-sections.js     ← insert section breaks + metadata
  └── reports/
      └── *.report.xlsx          ← import results
```

---

## XWalk Field Hinting Quick Reference

```javascript
// For each cell with content, add comment BEFORE the content:
const cell = document.createDocumentFragment();
cell.appendChild(document.createComment(' field:fieldName '));
cell.appendChild(content);

// DO hint: image, text, link, description, etc.
// DON'T hint: imageAlt, linkTitle, linkText, linkType, imageMimeType
// DON'T hint: classes field
// DON'T hint: empty cells
```

---

## Batch Site Scanning Pattern

```javascript
// Check if a page matches your template's DOM structure:
const hasStructure = await page.evaluate(() => {
  const hasListNav = !!document.querySelector('.list_navigation');
  const hasHero = !!document.querySelector('.supergrid .gridlayout');
  const hasBreadcrumb = !!document.querySelector('.lp__breadcrumb');
  return hasListNav && hasHero;
});
```

Replace selectors with whatever your template uses. Any page matching = compatible for batch import.
