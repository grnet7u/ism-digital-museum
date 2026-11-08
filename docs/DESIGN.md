# UFE visual brief

Reference: `reference/ufe-design-reference.png`, provided by student. Browser chrome/taskbar are not part of the design. Palette below is an approximation, NOT an official brand specification.

Primary #0647F7; deep blue #08045B; background #F5F7FB; surface #FFFFFF; text #172033; muted #536079; border #DEE5EF. Font: Montserrat (Google Fonts, cyrillic-ext covers Ө/Ү; falls back to system-ui offline). Style (2026-11-08): light glassmorphism — soft blue/violet gradient field on body, translucent white surfaces with backdrop blur, sticky frosted header on desktop (static on mobile), pill navigation, 44px+ controls, generous padding. Light and dark themes share tokens (`--text`, `--surface`, `--border`, `--link`…); UI language MN (default) or EN. Use strong readable headings and calm whitespace. Button radius 8px, card 12–16px, spacing multiples of 4/8. Visible focus and accessible contrast.

Header: approved UFE logo asset (not screenshot crop), product name, navigation, login. Until an authentic reusable asset is supplied, use plain text product branding; don't draw an imitation official logo.

Hero: deep blue/blue gradient, Mongolian title 'Түүх. Бүтээл. Технологийн хувьсал.', short intro, browse exhibits CTA and Evolution CTA. Keep content visible above the fold; avoid giant empty area copied from Moodle.

Public pages use consistent cards, image aspect ratios, labels and restrained hover/focus. No fake popularity/achievement numbers. Research/configuration instructions belong in documentation, not final product UI. Scaffold setup status can appear only during preparation.

## Low-fidelity wireframes

Home desktop: HEADER → HERO(title+intro+2 actions) → FEATURED EXHIBIT GRID → EVOLUTION preview/link → TEACHERS → EVENTS → FOOTER.

Exhibits: HEADER → title/count → search + year/category/technology filters → 3-column cards → empty/error/loading states. Mobile: stacked filters and one column. Detail: image + title/meta → description → creator and links.

Teacher: portrait + name/position → bio → courses → approved source attribution. Unknown fields hidden or honestly noted; no fabricated content.

Evolution: title/scope note → two year selectors → comparison bars + accessible data table → linked exhibit cards. Graph labels must fit narrow screens.

Admin: tabs → compact table/list → edit form or moderation actions; status text and feedback. Keyboard usable. Avoid a separate complex dashboard framework.

Before delivery capture 360px mobile and desktop screenshots. Final wireframe/ERD must match actual implementation.
