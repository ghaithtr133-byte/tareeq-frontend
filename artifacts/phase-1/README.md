# Phase 1 browser evidence index

All captures were taken from the local production preview at `http://127.0.0.1:3004` with the explicitly enabled local fixture API at `http://127.0.0.1:4010`. They are **MOCK PREVIEW** evidence only, not deployed Backend data.

| Capture | Route | Viewport | Verified focus |
| --- | --- | ---: | --- |
| Long article desktop | `/articles/study-guide` | 1440×950 | Reading column, sticky desktop TOC, Arabic title and metadata |
| Long article tablet | `/articles/study-guide` | 768×960 | Single-column reading layout and compact TOC disclosure |
| Long article mobile | `/articles/study-guide` | 390×844 | Responsive title, mobile TOC, no horizontal clipping |
| Narrow mobile | `/articles/study-guide` | 350×844 | Navigation disclosure, Escape handling, title wrapping |
| Desktop breakpoint | `/articles/study-guide` | 1280×900 | Two-column editorial composition and sticky TOC |
| Related content | `/articles/study-guide` | 1280×900 | Latest articles and scholarships cards |
| No-heading article | `/articles/quiet-study-note` | 390×844 | Graceful TOC omission and continued reading layout |

The actual browser captures are emitted in this task’s browser-verification record. They are deliberately not production assets and are not included in the public build.
