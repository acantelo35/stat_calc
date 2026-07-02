UCR Translator
A static site for translating a player's stat line between Division 1 baseball
conferences and ballparks, using the Unified Conference Rating (UCR) system
and park factors.
What's here
`index.html` — page markup (calculator, conference rankings, park factor
table, methodology)
`style.css` — all styling
`app.js` — calculator logic, searchable school dropdowns, sortable/filterable
tables
`data.js` — D1-only dataset (29 conferences, 284 schools) baked in as a
JS variable, generated from `Unified_Conference_Rankings_new.xlsx` and
`PARK_FACTOR_updated.xlsx`
No build step, no backend, no dependencies beyond Google Fonts — it's plain
HTML/CSS/JS, so it runs as-is on GitHub Pages.
Publish it on GitHub Pages
Create a new repository on GitHub (e.g. `ucr-translator`), or reuse one you
already have.
Upload these four files (`index.html`, `style.css`, `app.js`, `data.js`)
to the root of the repo — either via the GitHub web UI's "Add file →
Upload files", or with git:
```bash
   git init
   git add index.html style.css app.js data.js README.md
   git commit -m "UCR translator site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
In the repo on GitHub: Settings → Pages.
Under "Build and deployment", set Source to "Deploy from a branch",
pick the main branch and the / (root) folder, then Save.
GitHub gives you a URL a minute or two later, usually:
`https://<your-username>.github.io/<repo-name>/`
Updating the data later
When you add Division 2/3 data or refresh the D1 numbers, regenerate
`data.js` from your workbooks and re-upload it — everything else (dropdowns,
tables, calculator) reads from that one file, so no other changes are needed
unless you're adding new columns.
Scope note
Only Division 1 conferences and schools are included, since D2/D3 UCR ratings
don't exist yet. Three conferences that appear in the park factor sheet —
Big Sky, Pac-12, and MEAC — don't have UCR ratings in the source workbook and
are therefore left out of the calculator for now.
