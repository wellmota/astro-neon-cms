# Sveltia CMS — a UX-focused fork

> A friendly fork of [Sveltia CMS](https://github.com/sveltia/sveltia-cms) by **[Wellington Mota](https://github.com/wellmota)**, a product/UX designer. I use Sveltia in production and love it — this fork is where I prototype experience-level improvements and give them back to the project.

Sveltia is already fast and developer-friendly. My contributions focus on the **human side** of the editing experience: the people who actually write, on the devices they actually use, increasingly with an AI sitting next to them.

### What I'm working on

- 📱 **Mobile-first editing** — treating the phone as a primary place to write and publish, not an afterthought: comfortable tap targets, sane scrolling, and forms that hold up on a small screen.
- ✍️ **Human-writer-friendly UI** — fewer sharp edges for non-technical authors. Clearer labels, calmer layouts, and defaults that let someone focus on the words instead of the tool.
- ♿ **Accessibility & responsiveness** — keyboard flows, focus states, contrast, and layouts that adapt gracefully from desktop to mobile.
- 🤖 **AI-assisted content teams** — making the CMS pleasant for teams that draft with AI: smoother paste/cleanup of generated content and an editing surface that plays well with an assistant in the loop.

### Roadmap (experience track)

- [ ] **MCP integration** — let an agent (Claude or equivalent) draft, edit, and stage entries directly through the CMS via the [Model Context Protocol](https://modelcontextprotocol.io/), with the human staying in control of review and publish.
- [ ] Refined mobile editing flows and review-on-the-go.
- [ ] Friendlier onboarding and microcopy for non-technical authors.

These are personal experiments — anything that proves itself here, I'd love to clean up and propose upstream. Issues and ideas are welcome.

---

> Everything below is the upstream README, kept intact.

# Sveltia CMS

[Sveltia CMS](https://sveltiacms.app/en/) is a free, open-source, Git-based headless content management system for [Jamstack](https://jamstack.org/) sites. It’s a complete rewrite of Netlify CMS, now known as Decap CMS.

Designed for content editors and developers alike, Sveltia CMS delivers a modern UX/DX, powerful features, and first-class internationalization (i18n) support — all in a small, maintenance-free, single-page web application served from a CDN. Its framework-agnostic, generic-purpose approach makes it suitable for a wide range of projects, from personal blogs and portfolios to marketing sites and knowledge bases.

As the de facto [successor to Netlify CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms), Sveltia CMS addresses 300+ longstanding issues while maintaining high compatibility with existing installations. It far surpasses the neglected official successor, Decap CMS. More and more projects, including a U.S. government website, are [switching from Netlify/Decap CMS](https://sveltiacms.app/en/docs/migration/netlify-decap-cms) to Sveltia CMS to enjoy its significantly improved performance, security, reliability, and experience.

It’s also a great choice for people migrating from a traditional CMS or website builder and looking for a lightweight headless CMS that can easily integrate with a static site generator (SSG) like Astro.

Explore 270+ real-world examples in our [showcase](https://sveltiacms.app/en/showcase), including 100+ sites migrated from Netlify/Decap CMS and 40+ from WordPress, or visit the [documentation](https://sveltiacms.app/en/docs) to get started.

[![Sveltia CMS: Fast, Git-based, Headless, Modern UX, Mobile Support, I18n Support, Open Source](https://sveltiacms.app/images/highlights/cover.webp)](https://sveltiacms.app/en/)

[![300 Netlify/Decap CMS issues solved in Sveltia CMS](https://sveltiacms.app/images/highlights/decap-issues.webp?20260427)](https://sveltiacms.app/en/docs/successor-to-netlify-cms)

[![See it in action. Visit Sveltia CMS Showcase](https://sveltiacms.app/images/highlights/showcase.webp)](https://sveltiacms.app/en/showcase)

## Documentation

We provide comprehensive documentation to help you get started and make the most of Sveltia CMS:

- [Introduction](https://sveltiacms.app/en/docs/intro): Product highlights, use cases, project goals
- [Getting Started](https://sveltiacms.app/en/docs/start): Step-by-step setup instructions
- [Migration Guides](https://sveltiacms.app/en/docs/migration): Instructions for migrating from other CMSs
- [Roadmap](https://sveltiacms.app/en/docs/roadmap): Upcoming features and improvements

## Community

Stay connected and get support through our community channels:

- [Bluesky](https://bsky.app/profile/sveltiacms.app): Follow us for news and updates
- [Discord](https://discord.com/invite/5hwCGqup5b): Join the community and chat with us
- [GitHub Discussions](https://github.com/sveltia/sveltia-cms/discussions): Ask questions and share ideas
- [Contribute](https://github.com/sveltia/sveltia-cms/blob/main/CONTRIBUTING.md): Learn how to get involved
