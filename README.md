# Rethinksoft

A server-rendered product launch library with ready to use AI agent prompts and proven open source codebases for software founders and independent builders.

## Local development

```sh
npm install
npm run dev
```

The SQLite database is created automatically at `data/site.db`. Set `DATABASE_PATH` to change its location and `SITE_URL` to set canonical URLs.

## Content

Every audit is a standalone JSON file in `data/apps/`. Add a file with the documented schema, then rebuild; the route, sitemap entry, related content, search result, and OG card are generated automatically.

## Production

```sh
npm run build
node ./dist/server/entry.mjs
```

Use a persistent disk for the SQLite database. Reverse-proxy the Node server and set `SITE_URL` to the public origin.

## Privacy

No accounts, ads, payments, or third-party analytics. Vote IPs are salted and irreversibly hashed. Waitlist emails are deduplicated.

## License

MIT
