# Champions Tournament site
Static site (HTML + JS). Upload the whole folder to GitHub Pages, Netlify, Cloudflare Pages, etc.

## Add players
1. Open `admin.html` on your live site (or locally).
2. Choose a CSV (use `sample/players.csv` as the template: one row per Pokémon). Check the preview, click "Download players.json".
3. Replace `data/players.json` on your host with the downloaded file. Done.

## Run locally
Browsers block fetch() on file:// so use a server:  `python3 -m http.server 8000`  then open http://localhost:8000
