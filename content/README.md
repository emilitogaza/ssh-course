# Authoring guide — how to add course material

Every chapter is **one Markdown file** in this `content/` folder. To add a new
chapter, create a new `.md` file. That's it — the site picks it up automatically
on the next reload (in dev) or rebuild.

## File format

Start each file with a **frontmatter** block (the part between `---` lines),
then write the chapter body in normal Markdown.

```markdown
---
title: Public & Private Keys
section: Keys & Authentication
order: 22
description: A short summary shown in the browser tab and previews.
---

# Public & Private Keys

Your content goes here...

## A section heading

More text. Sub-headings (## and ###) automatically appear in the
"On this page" rail on the right.
```

## Frontmatter fields

| Field         | Required | What it does                                                       |
| ------------- | -------- | ------------------------------------------------------------------ |
| `title`       | yes      | Chapter name shown in the sidebar, page heading, and browser tab.  |
| `section`     | no       | Groups chapters under a heading in the sidebar. Default: `General`. |
| `order`       | no       | Sort position. Lower numbers come first. Default: `999`.           |
| `description` | no       | One-line summary for SEO / link previews.                          |

## Ordering tip

Use gaps between `order` numbers (10, 20, 30…) so you can insert a new chapter
between two existing ones (e.g. `15`) without renumbering everything.

## Sections

Chapters with the same `section` value are grouped together in the sidebar, in
the order they first appear by `order`. Keep section names consistent
(capitalisation matters).

## What Markdown supports

Standard Markdown plus GitHub extensions (GFM):

- Headings, **bold**, _italic_, `inline code`
- Bulleted and numbered lists
- Tables
- Links and blockquotes
- Code blocks with triple backticks (great for terminal commands)
- Horizontal rules (`---`)

Only `##` and `###` headings are collected into the right-hand "On this page"
navigation, so use `#` once for the chapter title and `##`/`###` for sections.
