# Subscription Box Manager

A web app for managing subscription boxes. It tracks customer plans, billing cycles and customer churn, and includes an admin dashboard.

Built for the Generative AI assessment (Project #27, Business & Commerce).

**Live site:** https://YOUR-PROJECT.vercel.app

## Features

1. **Customer plans** – Starter, Plus and Premium plans with illustrated boxes. Customers can pay monthly, every 3 months (5% off) or yearly (15% off).
2. **Billing cycle tracker** – calculates each customer's next billing date from their start date and cycle. Shows bills due in 7 days, the amount to collect, and a "Mark paid" button.
3. **Churn chart** – a six-month SVG chart of cancellations and churn rate (cancelled ÷ customers at month start), with a data table.
4. **Admin view** – active customers, monthly recurring revenue, annualised revenue. Add customers, change plans, cancel, reactivate and delete.

The page also has a landing section (hero, how it works, customer stories, FAQ). All pictures are inline SVG.

## Tech stack

HTML, CSS and vanilla JavaScript. No build step, no dependencies. Data is saved in the browser with `localStorage`, and demo data loads on first visit.

## Run locally

Open `index.html` in a browser. Or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Project structure

```
index.html   page structure and landing sections
style.css    styles (light and dark theme)
script.js    plans, billing logic, churn calculation, admin actions
```

## Deploy

Push this folder to a public GitHub repo, then import it in Vercel or Netlify (framework: "Other", no build command). GitHub Pages also works.

## Author

Manish Kumar – NIAT, Generative AI track.
