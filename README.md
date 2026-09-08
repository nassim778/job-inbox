# Job Inbox dashboard

A simple web page that shows job-application replies in two columns: **Acceptances** and **Rejections**.

The Cursor automation **Gmail Job Filter Automation** should overwrite `data/jobs.json` on every run. This site only reads that file.

## Put the site online (do this once)

1. Create a GitHub repository (example name: `job-inbox`).
2. Upload everything in this `job-dashboard` folder to the repo root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data/jobs.json`
3. In the GitHub repo: **Settings → Pages → Deploy from a branch → `main` / root**.
4. Open the Pages URL. That is your web app.

## Connect the daily automation (required)

Right now the automation has **no repository attached**, so results only appear in the Cursor chat. To keep the web app updated:

1. Open [cursor.com/automations](https://cursor.com/automations).
2. Open **Gmail Job Filter Automation**.
3. Set **Repository** to this dashboard repo (not “no repository”).
4. Keep **Gmail MCP** enabled.
5. Keep **Pull request creation** enabled (or merge the daily PR).
6. Replace the prompt with the text in `AUTOMATION_PROMPT.md`.
7. Save.

Every night the agent should:

1. Read Gmail.
2. Update `data/jobs.json`.
3. Open a PR (or commit) so GitHub Pages republishes the site.

If the PR is not merged, the live site will not change. Merge the data PR, or add a GitHub Action that auto-merges Cursor data-only PRs.
