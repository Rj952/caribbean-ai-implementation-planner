# Caribbean AI Implementation Planner

> A **Jamaica-branded, pan-Caribbean, accessible** web application that turns the *Caribbean AI Deployment Blueprint* (Jowallah, 2026) into a country-specific working AI policy document — with plan upload, Blueprint-aligned evaluation, **prioritised (Critical / High / Medium / Low) action plan** generation, and **Word / PDF** export.

**Author:** Dr. Rohan Jowallah
**Stack:** Next.js 14 · React 18 · Tailwind CSS · docx · jsPDF · pdfjs-dist · mammoth
**Deployment:** GitHub + Vercel (one-click)

---

## What it does

The planner has **two modes**:

### 1. Draft a New Plan
An eight-stage guided wizard that produces a country-specific working National AI Implementation Plan:

1. **Country Profile** — pre-populates known institutions, languages, and existing initiatives for 18 Caribbean countries.
2. **National AI Vision** — vision statement, strategic priorities, cultural & moral anchors.
3. **Seven Principles** — for each principle from the Jowallah Governance Wheel (Policy & Ethics, Transparency, Equity, Capacity, Assessment, Data, Evaluation), rate current state vs. target state and assign a lead agency.
4. **Three-Sector Pathway** — Public, Private, GDP-Critical Production.
5. **University Compact** — designate the lead university and select from the six commitments.
6. **Implementation Roadmap** — Foundation (2026–27), Expansion (2028–29), Consolidation (2030–31).
7. **Risk Register** — country-specific risks with mitigations.
8. **Generate Document** — download as Word or PDF, copy as Markdown, or print.

Auto-saves to local storage as you go.

### 2. Evaluate an Existing Plan
Upload a draft policy (`.docx`, `.pdf`, `.txt`, `.md`) or paste the text. The evaluator:

- Scores each of the seven principles, three sectors, and structural elements (university compact, roadmap phasing, risk register, sovereignty framing) as **Strong / Partial / Absent**.
- Computes an overall coverage score with a band (Comprehensive → Nascent).
- Identifies strengths and critical gaps.
- Generates a **prioritised action plan** with specific Blueprint-aligned amendment steps.
- Exports the full report as Word or PDF.

All processing happens in the browser. Files never leave the user's device.

---

## Design

**Jamaica-primary palette with pan-Caribbean accents.** Jamaica green (`#009B3A`), gold (`#FED100`), and black (`#0B0B0B`) lead the brand identity — anchoring the header flag stripe, primary actions, and headings. Caribbean sea blue (`#0B2E4F`) and sunset coral (`#E76F51`) remain available as secondary accents for the wider Caribbean audience. All text and interactive surfaces are calibrated for WCAG 2.1 AA contrast.

**Editorial typography.** Fraunces (display, optical-sizing) + IBM Plex Sans (body) + IBM Plex Mono (utility). Refined, not generic.

**Accessibility (WCAG 2.1 AA).**

- Skip-to-content link.
- Visible focus indicators (`:focus-visible` outline in saffron).
- ARIA-labelled buttons, live regions for save status and step navigation announcements.
- Semantic landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`).
- Form labels associated with every input via `htmlFor`.
- 44 × 44 px minimum interactive targets (WCAG 2.5.5).
- `prefers-reduced-motion` respected.
- Screen-reader announcements for stage transitions during evaluation.
- Color contrast ≥ 4.5:1 on body text; ≥ 3:1 on UI components.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| Icons | lucide-react |
| Word export | [`docx`](https://docx.js.org/) + [`file-saver`](https://github.com/eligrey/FileSaver.js) |
| PDF export | [`jspdf`](https://github.com/parallax/jsPDF) + [`jspdf-autotable`](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| `.docx` parsing | [`mammoth`](https://github.com/mwilliamson/mammoth.js) |
| `.pdf` parsing | [`pdfjs-dist`](https://github.com/mozilla/pdf.js) |
| Persistence | `localStorage` (no server, no tracking) |

---

## Local development

```bash
# Requires Node.js 18.17+ or 20+
npm install
npm run dev
# Open http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

---

## Deploy to GitHub + Vercel

### Step 1 — Push to GitHub

```bash
# from inside this folder
git init
git add .
git commit -m "Initial commit: Caribbean AI Implementation Planner"
git branch -M main
git remote add origin git@github.com:YOUR-USERNAME/caribbean-ai-implementation-planner.git
git push -u origin main
```

(If you prefer HTTPS over SSH, replace the `git@github.com:` URL with `https://github.com/...`.)

### Step 2 — Deploy on Vercel

**Option A: Vercel dashboard**
1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **Import Git Repository**, select your repo.
3. Vercel auto-detects Next.js — keep all defaults. **No environment variables required.**
4. Click **Deploy**. Live in ~60 seconds.

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel        # follow prompts; first deploy creates the project
vercel --prod # subsequent production deploy
```

### Step 3 — Custom domain (optional)
In the Vercel project → Settings → Domains, add your domain and follow the DNS instructions Vercel shows.

---

## Project structure

```
caribbean-ai-implementation-planner/
├── app/
│   ├── layout.js                 # Root layout, metadata, skip link
│   ├── page.js                   # Mode selector (Draft vs. Evaluate)
│   ├── globals.css               # Caribbean palette + accessibility CSS
│   └── components/
│       ├── Header.jsx
│       ├── FormHelpers.jsx       # Field, RangeField, StepHeader, Callout
│       ├── PlannerWizard.jsx     # 9-step drafting wizard
│       └── PlanEvaluator.jsx     # Upload + evaluate + action plan
├── lib/
│   ├── data.js                   # Countries, principles, sectors, eval indicators
│   ├── document-generator.js     # Markdown output (canonical content)
│   ├── docx-generator.js         # Word export (plan + evaluation report)
│   ├── pdf-generator.js          # PDF export (plan + evaluation report)
│   ├── file-parser.js            # Extract text from .docx/.pdf/.txt/.md
│   └── plan-evaluator.js         # Heuristic Blueprint-alignment scoring
├── tailwind.config.js            # Caribbean color tokens
├── next.config.js
├── vercel.json
└── package.json
```

---

## Privacy

This app does not collect, transmit, or store user data on any server. Plans you draft are saved to your browser's `localStorage`. Plans you upload for evaluation are read entirely in the browser using client-side libraries (`mammoth` for `.docx`, `pdfjs-dist` for `.pdf`). Nothing leaves the device.

---

## Citation

> Jowallah, R. (2026). *Caribbean AI Deployment Blueprint: A sovereign pathway for inclusive AI across public sector, private sector, and GDP-critical industries — anchored in education.* Working paper. Farquharson Institute of Public Affairs.

This planner is a companion implementation tool for the Blueprint and the forthcoming volume *Sovereign Intelligence: A Caribbean Framework for AI Leadership in Education and Policy* (Jowallah, ed., IGI Global).

---

## License

MIT — see `LICENSE`.

---

*Built for the Caribbean and the Global South.*

