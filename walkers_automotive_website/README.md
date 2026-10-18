# Walker's Automotive LLC — Website Prototype

A responsive automotive-business website and companion admin dashboard built with plain HTML, CSS, and JavaScript. No build step or package installation is required.

## Files

- `index.html` — public-facing website
- `styles.css` — responsive website styles and animations
- `script.js` — mobile navigation, scroll reveals, pricing display, and contact-form handling
- `admin.html` — admin dashboard prototype
- `admin.css` — dashboard styles
- `admin.js` — request inbox, status updates, CSV export, and price editing

## Preview locally

For best results, serve the folder from one local web origin so the public page and dashboard share browser storage.

With Python installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit:

- Public website: http://localhost:8000/
- Dashboard prototype: http://localhost:8000/admin.html

You can also upload the whole folder to a static host such as Netlify, Vercel, or GitHub Pages for a public preview, but see the limitations below before publishing.

## Important setup before going live

1. **Confirm service pricing.** The public page currently uses illustrative starting prices ($49 vehicle health check, $120 oil & filter service, $39 brake inspection). Replace them with real rates before publishing.
2. **Add shop contact details.** A real phone number, location, opening hours, service area, and any social links were not provided, so they are intentionally not invented here.
3. **Connect the request form.** Currently, form submissions are stored in the visitor's browser `localStorage`; no email is sent and the shop is not notified. Connect a form service or backend/API to receive requests reliably.
4. **Secure the dashboard.** `admin.html` is a prototype, not an authenticated admin system. It must not be used to store real customer information in production without server-side authentication, access controls, and a secure data store. Static hosting makes this page public.
5. **Review photos and fonts.** The visual uses remote images from Unsplash and Google Fonts, so those assets require an internet connection. Replace them if you have licensed shop photography or preferred brand assets.

## Current interactions

- Responsive mobile navigation and smooth section links
- Animated content reveal with reduced-motion support
- Service cards that preselect the contact-form service
- Required-field validation on the request form
- Local browser storage for prototype requests
- Admin inbox with search, status filter, request detail view, and statuses (New / In progress / Completed)
- CSV export and demo-request deletion
- Editable sample starting prices stored in browser storage

## Production recommendation

For a live business website, use a backend or trusted form provider to receive messages, and protect the admin dashboard with real authentication. Add privacy terms and an appropriate notice before collecting personal details.
